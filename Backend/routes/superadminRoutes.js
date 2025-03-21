const router = require('express').Router();
const Centre = require('../models/Centre');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

router.post("/addAdmin", async (req, res) => {
    try {
        const { username, password, name, mobilenumber, email } = req.body;
        const role = 'admin';
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            username,
            password: hashedPassword,
            role,
            name,
            mobilenumber,
            email
        });
        await user.save();
        res.status(201).json({ message: 'Admin created successfully', result: user });
    }
    catch (error) {
        res.status(500).json({ error: 'An error occurred while saving the data', details: error.message });
    }
    res.send("in progress")
});

router.post("/addCentre", async (req, res) => {
    try {
        const { name, centreId } = req.body;
        const centre = new Centre({ name, centreId });
        await centre.save();
        res.status(201).json({ message: 'Centre created successfully', result: centre });
    }
    catch (error) {
        res.status(500).json({ error: 'An error occurred while saving the data', details: error.message });
    }
});

module.exports = router;
