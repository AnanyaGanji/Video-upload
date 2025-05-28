const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Child = require("../models/Child");
const jwlUser = require("../models/JWLUser");
const Therapist = require("../models/User").Therapist;
const Parent = require("../models/User").Parent;
const Doctor = require("../models/User").Doctor;
const Admin = require("../models/User").Admin;
const Centre = require("../models/Centre");
const path = require('path')
const fs = require('fs')
const Appointment = require("../models/Appointment");
const createMulter = require("../middleware/fileUpload");
const bcrypt = require("bcryptjs");
const GamesHome = require("../models/GamesHome");
const { generateUniqueReferenceId } = require("../middleware/reference");
const { User } = require("../models/User");
const IEP = require("../models/IEP");
const sendmail = require("../middleware/mail.js");

require("dotenv").config();

router.post("/register", auth, async (req, res) => {
  if (req.user.role !== "admin") return res.status(401).send("Unauthorized");

  try {
    const { centreId, ...userData } = req.body;
    const centre = await Centre.findById(centreId);

    if (!centre) return res.status(404).send("Centre not found");

    let user;
    switch (userData.role) {
      case "therapist":
        user = new Therapist(userData);
        user.password = await bcrypt.hash(user.password, 8);
        await user.save();

        if (!centre.therapists.includes(user._id)) {
          centre.therapists.push(user._id);
        }
        sendmail(userData.email, "Welcome to Total Solutions!", `Dear ${user.name},\n\nWelcome to Total Solutions! Your account has been created successfully. 
        \n\nYour login credentials are:\nEmail: ${userData.username}\nPassword: ${userData.password}\nTotal Solutions Team
          `);
        break;

      case "parent":
        user = new Parent(userData);
        user.password = await bcrypt.hash(user.password, 8);
        user.referenceId = await generateUniqueReferenceId();
        await user.save();

        if (!centre.parents.includes(user._id)) {
          centre.parents.push(user._id);
        }

        if (userData.childData) {
          return res.redirect(307, `/api/admins/addChild?parentId=${user._id}`);
        }
        sendmail(userData.email, "Welcome to Total Solutions!", `Dear ${user.name},\n\nWelcome to Total Solutions! Your account has been created successfully. 
          \n\nYour login credentials are:\nEmail: ${userData.username}\nPassword: ${userData.password}\nBest regards,\nTotal Solutions Team
            `);
        break;

      case "doctor":
        user = new Doctor(userData);
        user.password = await bcrypt.hash(user.password, 8);
        await user.save();

        if (!centre.doctors.includes(user._id)) {
          centre.doctors.push(user._id);
        }
        sendmail(userData.email, "Welcome to Total Solutions!", `Dear ${user.name},\n\nWelcome to Total Solutions! Your account has been created successfully. 
          \n\nYour login credentials are:\nEmail: ${userData.username}\nPassword: ${userData.password}\nBest regards,\nTotal Solutions Team
            `);
        break;

      default:
        return res.status(400).send("Invalid role specified");
    }

    await centre.save();
    res.status(201).send({
      message: `${userData.role} registered successfully`,
      user,
      centre,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

router.post("/addChild", auth, async (req, res) => {
  try {
    if (req.user.role !== "parent" && req.user.role !== "admin") {
      return res
        .status(401)
        .send("Unauthorized: Only parents or admins can add children");
    }

    const { parentId } = req.query;
    const childData = req.body.childData;

    const actualParentId = req.user.role === "parent" ? req.user._id : parentId;

    const parent = await Parent.findById(actualParentId);

    if (!parent) return res.status(404).send("Parent not found");

    const child = new Child({
      ...childData,
      parentId: actualParentId,
    });

    await child.save();

    if (!parent.children.includes(child._id)) {
      parent.children.push(child._id);
      await parent.save();
    }

    const centre = await Centre.findById(childData.centreId);
    if (centre && !centre.children.includes(child._id)) {
      centre.children.push(child._id);
      centre.parents.push(parent._id);
      await centre.save();
    }

    res.status(201).send({
      message: "Child added successfully",
      child,
      parent,
      centre: centre || null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message || "Internal server error");
  }
});

router.put("/assign/:childId", auth, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(401).send("Unauthorized");
  }

  const { doctorId, therapistId, centreId } = req.body;
  const { childId } = req.params;

  try {
    const child = await Child.findById(childId);
    if (!child) return res.status(404).send("Child not found");

    if (therapistId) {
      const therapist = await Therapist.findById(therapistId);
      if (!therapist) return res.status(404).send("Therapist not found");

      child.therapistId = therapistId;

      if (!therapist.assignedChildren.includes(childId)) {
        therapist.assignedChildren.push(childId);
      }

      if (centreId) therapist.centreId = centreId;

      await therapist.save();
    }

    if (doctorId) {
      const doctor = await Doctor.findById(doctorId);
      if (!doctor) return res.status(404).send("Doctor not found");

      child.doctorId = doctorId;

      if (!doctor.patients.includes(childId)) {
        doctor.patients.push(childId);
      }

      await doctor.save();
    }

    child.admitStatus = "active";
    await child.save();


    res.send({
      message: "Doctor and/or Therapist assigned successfully",
      child,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({
      error: "Server error",
      details: err.message,
    });
  }
});

const upload = createMulter({
  destination: "/home/totaluploads/prescriptions/",
  prefix: "prescription",
});

const uploadReport = createMulter({
  destination: "/home/totaluploads/childReports/",
  prefix: "report",
});


router.post(
  "/bookAppointment",
  uploadReport.single("pdf"),
  auth,
  async (req, res) => {
    const {
      childName,
      childAge,
      parentName,
      parentId,
      email,
      dob,
      parentPhoneNo,
      appointmentDate,
      time,
      doctorId,
      schoolName,
      classGrade,
      schoolBoard,
      childConcerns,
      branch,
      gender,
      alternativeNumber,
      address,
      consultationType,
      referredBy,
      centreId,
    } = req.body;

    try {
      let parent;
      if (parentId) {
        parent = await User.findById(parentId);
        if (!parent) return res.status(404).send("Parent not found");
      } else {
        parent = await User.findOne({ email });

        if (!parent) {
          parent = new User({
            name: parentName,
            email,
            mobilenumber: parentPhoneNo,
            alternativeNumber,
            address,
            role: "parent",
          });
          await parent.save();
        }
      }
      // console.log(parent);
      let child;
      child = await Child.findOne({
        name: childName,
        parentId: parent._id,
      });

      if (!child) {
        child = new Child({
          name: childName,
          dob,
          gender,
          schoolName,
          classGrade,
          schoolBoard,
          parentId: parent._id,
          centreId: centreId,
        });
        await child.save();
        console.log(child);
      }

      const doctor = await Doctor.findById(doctorId);
      if (!doctor || doctor.role !== "doctor") {
        return res.status(404).send("Doctor not found or invalid role");
      }

      console.log(centreId);
      const centre = await Centre.findById(centreId);
      if (!centre) return res.status(404).send("Centre not found");

        if (!centre.doctors.includes(doctorId)) {
            return res.status(400).send("Doctor is not linked to the specified centre");
        }

        if(!centre.children.includes(child._id)){
            centre.children.push(child._id);
            await centre.save();
        }

        const existingAppointment = await Appointment.findOne({
            doctorId,
            appointmentDate,
            appointmentTime: time
        });

        if (existingAppointment) {
            return res.status(400).send("Appointment slot already booked for this doctor at the specified time");
        }

        
        const role = req.user.role;
        const appointment = new Appointment({
            childId: child._id,
            doctorId,
            appointmentDate,
            appointmentTime: time,
            branch,
            centreId,
            consultationType,
            childConcerns,
            referredBy,
            pdf: req.file ? req.file.path : '',
            status: role === 'admin' ? 'approved' : 'pending'
        });

      await appointment.save();
      if(role === 'admin') {
        if (!child.appointments.includes(appointment._id)) {
          child.appointments.push(appointment._id);
          await child.save();
        }
        sendmail(
          parent.email,
          "Appointment Confirmation",
          `Dear ${parent.name},\n\nYour appointment with Dr. ${doctor.name} has been successfully booked for ${appointmentDate} at ${time}.`
        );
        sendmail(
          doctor.email,
          "New Appointment",
          `Dear Dr. ${doctor.name},\n\nYou have a new appointment with ${child.name} on ${appointmentDate} at ${time}.`
        ); 
      }
      else{
        sendmail(
          parent.email,
          "Appointment Confirmation",
          `Dear ${parent.name},\n\nThis email acknowledges your appointment request with Dr. ${doctor.name} scheduled for ${appointmentDate} at ${time}. A follow-up confirmation will be sent once approved by our administration team.`        );
      }
      
      const adminEmails = await Promise.all(
        centre.admins.map(async (admin) => {
          const adminDoc = await Admin.findById(admin);
          return adminDoc.email;
        })
      );
       
        adminEmails.map((adminEmail) => {
          sendmail(
            adminEmail,
            "New Appointment",
            `Dear ${centre.name},\n\nA new appointment has been booked for ${child.name} on ${appointmentDate} at ${time}.`
          );
        })
  
      

      res.status(201).send({
        message: "Appointment booked successfully",
        appointment,
      });
    } catch (err) {
      console.error(err);
      res.status(500).send("Internal server error");
    }
  }
);

router.put("/manageAppointment/:appointmentId", auth, async (req, res) => {
  const { appointmentId } = req.params;
  const { status } = req.body;

  if (!["approved", "rejected"].includes(status)) {
    return res
      .status(400)
      .send("Invalid status. Allowed values are 'approved' or 'rejected'");
  }

  try {
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) return res.status(404).send("Appointment not found");

    if (
      req.user.role !== "admin" &&
      req.user._id.toString() !== appointment.doctorId.toString()
    ) {
      return res.status(403).send("Unauthorized to manage this appointment");
    }

    appointment.status = status;
    await appointment.save();

    const child = await Child.findById(appointment.childId);
    if (!child) return res.status(404).send("Child not found");

    const parent = await Parent.findById(child.parentId);
    if (!parent) return res.status(404).send("Parent not found");

    const doctor = await Doctor.findById(appointment.doctorId);
    if (!doctor) return res.status(404).send("Doctor not found");

    const centre = await Centre.findById(appointment.centreId);
    if (!centre) return res.status(404).send("Centre not found");

    const time = appointment.appointmentTime;

    if(status === "approved") {
      sendmail(
        parent.email,
        "Appointment Confirmation",
        `Dear ${parent.name},\n\nYour appointment with Dr. ${doctor.name} has been successfully booked for ${appointment.appointmentDate} at ${time}. Please be 15 minutes early for the appointment.`
      );
      sendmail(
        doctor.email,
        "New Appointment",
        `Dear Dr. ${doctor.name},\n\nYou have a new appointment with ${child.name} on ${appointment.appointmentDate} at ${time}.`
      );
      const adminEmails = await Promise.all(
        centre.admins.map(async (admin) => {
          const adminDoc = await Admin.findById(admin);
          return adminDoc.email;
        })
      );
       
        adminEmails.map((adminEmail) => {
          sendmail(
            adminEmail,
            "Appointment Confirmation",
            `Dear ${centre.name},\n\nA new appointment has been booked successfully for ${child.name} on ${appointment.appointmentDate} at ${time}.`
          );
        })
    }
    else {
      sendmail(
        appointment.doctorId.email,
        "Appointment Status Update",
        `Dear Dr. ${doctor.name},\n\nYour appointment with ${child.name} has been rejected.`
      );
    }

    res.status(200).send({
      message: `Appointment ${status} successfully`,
      appointment,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal server error");
  }
});

router.get("/getAppointments/:centreId", auth, async (req, res) => {
  const { centreId } = req.params;

  try {
    const centre = await Centre.findById(centreId);
    if (!centre) return res.status(404).send("Centre not found");

    const appointments = await Appointment.find({ centreId: centreId })
      .populate("childId")
      .populate("doctorId");

    res.status(200).send(appointments);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal server error");
  }
});

router.get("/getPendingAppointments/:centreId", auth, async (req, res) => {
  const { centreId } = req.params;

  try {
    const centre = await Centre.findById(centreId);
    if (!centre) return res.status(404).send("Centre not found");

    const appointments = await Appointment.find({
      centreId: centreId,
      status: "pending",
    })
      .populate({ path: "childId", populate: { path: "parentId" } })
      .populate("doctorId");

    res.status(200).send(appointments);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal server error");
  }
});

router.get(
  "/getBookedSlots/:doctorId/:appointmentDate",
  auth,
  async (req, res) => {
    const { doctorId, appointmentDate } = req.params;

    try {
      const inputDate = new Date(appointmentDate);

      inputDate.setHours(0, 0, 0, 0);

      const nextDay = new Date(inputDate);
      nextDay.setDate(nextDay.getDate() + 1);

      const appointments = await Appointment.find({
        doctorId: doctorId,
        appointmentDate: {
          $gte: inputDate,
          $lt: nextDay,
        },
        status: { $in: ["pending", "approved"] },
      });

      const bookedSlots = appointments.map((app) => app.appointmentTime);

      res.status(200).json({ bookedSlots });
    } catch (err) {
      console.error(err);
      res.status(500).send("Internal server error");
    }
  }
);

router.get("/iep/:childId", auth, async (req, res) => {
  const { childId } = req.params;

  try {
    const iep = await IEP.find({ childId })
      .sort({ createdAt: -1 })
      .populate("doctorId", "name")
      .populate("childId", "name dob gender");
    if (!iep) return res.status(404).send("IEP not found");
    res.status(200).send(iep);
  } catch (err) {
    res.status(500).send("Internal server error");
  }
});

router.post('/uploadPrescription', upload.single('prescription'), async (req, res) => {
    const { appointmentId } = req.body;

    try {
      const appointment = await Appointment.findById(appointmentId);
      if (!appointment) return res.status(404).send("Appointment not found");

      if (!req.file) return res.status(400).send("No file uploaded");

        appointment.prescription = req.file.path;
        await appointment.save();

      res.status(200).send({
        message: "Prescription uploaded successfully",
        appointment,
      });
    } catch (err) {
      console.error(err);
      res.status(500).send("Internal server error");
    }
  }
);

router.get("/get-jwl-enquiries/:centre", auth, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).send("Access Denied");

  try {
    const centerName = await Centre.findById(req.params.centre, {
      _id: 0,
      name: 1,
    });
    const enquiries = await jwlUser.find({ preferredCenter: centerName.name },{_id:0,referenceId:1, parentName:1,parentEmail:1,parentPhoneNo:1,isArchived:1,childName:1,enquiryDate:1}).sort({ enquiryDate: 1 });
    res.status(200).send(enquiries);
  } catch (err) {
    res.status(500).send(err);
  }
});

router.get('/get-jwl-enquiry/:referenceId', auth, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).send("Access Denied");
  try {
    const enquiry = await jwlUser.findOne({ referenceId: req.params.referenceId });
    if (!enquiry) {
      return res.status(404).json({ message: 'Enquiry not found' });
    }
    res.json(enquiry);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get("/get-jwluser-video/:parentEmail", auth, async (req, res) => {
  if (req.user.role === "therapist" || req.user.role === "parent")
    return res.status(403).send("Access Denied");

  try {
    const parentEmail = req.params.parentEmail;
    const sanitizedEmail = parentEmail.split("@")[0];
    const filepath = `/home/totaluploads/jwluploads/${sanitizedEmail}.mp4`;
    if (!fs.existsSync(filepath)) {
      return res.send("No video found");
    }
    res.sendFile(filepath);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error retrieving video");
  }
});


router.put("/archive-jwl-enquiry", auth, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).send("Access Denied");
  try {
    const parentEmail = req.body.parentEmail;
    await jwlUser.findOneAndUpdate(
      { parentEmail: parentEmail },
      { isArchived: true },
      { new: true }
    );
    res.status(200).send("Enquiry archived successfully");
  } catch (err) {
    res.status(500).send(err);
  }
});


module.exports = router;
