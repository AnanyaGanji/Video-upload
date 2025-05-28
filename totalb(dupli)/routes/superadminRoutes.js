const router = require('express').Router();
const Centre = require('../models/Centre');
const Counter = require('../models/Counter');
const Admin = require('../models/User').Admin;
const bcrypt = require('bcryptjs');

router.post('/addCentre', async (req, res) => {
    try {
        const { name, address, city, state, pincode, contactNumber } = req.body;
        const counter = await Counter.findOneAndUpdate(
            { field: "centreNumber" },
            { $inc: { value: 1 } },
            { new: true, upsert: true }
        );
        const newCentre = new Centre({
            centreNumber: counter.value,
            name,
            address,
            city,
            state,
            pincode,
            contactNumber
        });

        await newCentre.save();
        res.status(201).json({ success: true, message: "Centre added successfully.", centre: newCentre });

    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
});

router.post("/addAdmin", async (req, res) => {
    try {
        const { centreId, ...userData } = req.body;
        const centre = await Centre.findById(centreId);
        if (!centre) return res.status(404).send("Centre not found");

        const user = new Admin(userData);
        user.password = await bcrypt.hash(user.password, 8);
        user.centreId = centreId;
        user.role = "admin";
        await user.save();
        if (!centre.admins.includes(user._id)) {
            centre.admins.push(user._id);
        }
        await centre.save();
        res.status(201).send({ message: `Admin registered successfully`, user, centre });
    }
    catch(e){
        res.status(500).json({ success: false, message: "Server error", error: e.message });
    }
});

module.exports = router;
