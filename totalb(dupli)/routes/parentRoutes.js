const express = require("express");
const { User } = require("../models/User");
const { Parent } = require("../models/User");
const Child = require("../models/Child");
const router = express.Router();
const auth = require("../middleware/auth");
const Centre = require("../models/Centre");
const Appointment = require("../models/Appointment");
const IEP = require("../models/IEP");

router.post("/childinfo", auth, async (req, res) => {
  try {
    if (req.user.role !== "parent") {
      return res.status(403).send("Access Denied");
    }

    const { name, dob, gender, schoolName, schoolBoard, centreNumber } =
      req.body;

    const existingChild = await Child.findOne({ name, dob, centreNumber });
    if (existingChild) {
      return res.status(400).send("Child already exists");
    }

    const parent = await User.findById(req.user._id);
    if (!parent) {
      return res.status(404).send("Parent not found");
    }

    const child = new Child({
      name,
      dob,
      gender,
      schoolName: schoolName || null,
      schoolBoard: schoolBoard || null,
      parentId: parent._id,
      centreNumber,
      admitStatus: "pending", 
    });

    const savedChild = await child.save();
    res.status(201).json(savedChild);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});


router.get("/children", auth, async (req, res) => {
  if (req.user.role !== "parent") return res.status(403).send("Access Denied");

  try {
    const children = await Child.find({ parentId: req.user._id })
      .populate("doctorId", "name email role")
      .populate("therapistId", "name email role")
      .populate("centreId", "name address");

    res.send(children);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.get("/getappointments/:parentId", auth, async (req, res) => {
  if (req.user.role !== "parent") return res.status(403).send("Access Denied");

  try {
    const parentId = req.params.parentId;
    const children = await Child.find({ parentId }).select(
      "_id"
    );
    const childIds = children.map((child) => child._id);

    const appointments = await Appointment.find({ childId: { $in: childIds } })
      .populate({ path: "childId", select: "name" })
      .populate({ path: "doctorId", select: "name" })
      .populate({ path: "centreId", select: "name" })
      .sort({ appointmentDate: -1 });
      const parent = await Parent.findById(parentId).select("name");

    res.send({appointments,parentName : parent.name});
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});

// * Temporary route for testing

router.post("/addChild", async (req, res) => {
  try {
    const newChild = new Child(req.body);
    await newChild.save();
    const { centreNumber } = req.body;
    await Centre.findOneAndUpdate(
      { centreNumber: centreNumber },
      { $push: { children: newChild._id } }
    );
    res.status(201).json({
      success: true,
      message: "Child added successfully.",
      child: newChild,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
});

router.get("/child/:childId", auth, async (req, res) => {
  if (req.user.role !== "parent") return res.status(401).send("Unauthorized");
  const { childId } = req.params;
  if (!childId) return res.status(400).send("Child ID is required");
  try {
    const child = await Child.findById(childId)
      .populate("doctorId", "name")
      .populate("therapistId", "name")
      .populate("centreId", "name");
    if (!child) return res.status(404).send("Child not found");
    res.status(200).send(child);
  } catch (error) {
    res.status(500).send("Server error");
  }
});


router.put("/edit-child-details/:childId", auth, async (req, res) => {
  if (req.user.role !== "parent") return res.status(401).send("Unauthorized");
  const { childId } = req.params;
  if (!childId) return res.status(400).send("Child ID is required");
  try {
    const { name, dob, gender, schoolName, schoolBoard } = req.body;
    const response = await Child.findByIdAndUpdate(childId, {
      name,
      dob,
      gender,
      schoolName,
      schoolBoard,
    });
    if (!response) return res.status(404).send("Child not found");
    res.status(200).send(response);
  } catch (err) {
    res.status(500).send("Interval Server Error");
  }
});

router.get("/iep/:childId", auth, async (req, res) => {
  if (req.user.role !== "parent") return res.status(403).send("Access Denied");
  const { childId } = req.params;
  if (!childId) return res.status(400).send("Child ID is required");
  try {
    const iep = await IEP.find({ childId })
      .sort({ createdAt: -1 })
      .populate("doctorId", "name email role")
      .populate("childId", "name dob gender");
    if (!iep) return res.status(404).send("IEP not found");
    res.status(200).send(iep);
  } catch (err) {
    res.status(500).send("Server error");
  }
});

module.exports = router;
