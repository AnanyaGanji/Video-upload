const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Child = require("../models/child");
const Centre = require("../models/Centre");
const Game = require("../models/GameStatus");
const Appointment = require("../models/Appointment");
const Consultation = require("../models/Consultations");
const router = express.Router();
const auth = require("../middleware/auth");
const jwlUser = require("../models/jwlUserSchema");
const sendmail = require("../middleware/mailUtility");
const path = require("path");
const fileUpload = require("express-fileupload");
router.use(fileUpload());
const fs = require("fs");

router.put("/:id/assign", auth, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).send("Access Denied");

  const { caretakerId, doctorId } = req.body;

  try {
    const child = await Child.findById(req.params.id);
    if (!child) return res.status(404).send("Child not found");

    child.caretakerId = caretakerId;
    const caretakerName = await User.findById(caretakerId);
    child.doctorId = doctorId;
    const doctorName = await User.findById(doctorId);
    child.adminStatus = true;
    child.caretakerName = caretakerName.name;
    child.doctorName = doctorName.name;

    const updatedChild = await child.save();
    res.send(updatedChild);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.post("/careTakerRegister", auth, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).send("Access Denied");
  const { username, password, name, mobilenumber, email } = req.body;
  const role = "caretaker";
  const user = await User.findOne({ username });
  if (user) return res.status(400).send("User already exists");
  const hashedPassword = await bcrypt.hash(password, 10);
  const users = new User({
    username,
    password: hashedPassword,
    role,
    name,
    mobilenumber,
    email,
  });
  try {
    const savedUser = await users.save();
    res.send(savedUser);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.post("/doctorRegister", auth, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).send("Access Denied");
  const { username, password, name, mobilenumber, email } = req.body;
  const role = "doctor";
  const user = await User.findOne({ username });
  if (user) return res.status(400).send("User already exists");
  const hashedPassword = await bcrypt.hash(password, 10);
  const users = new User({
    username,
    password: hashedPassword,
    role,
    name,
    mobilenumber,
    email,
  });
  try {
    const savedUser = await users.save();
    res.send(savedUser);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.get("/gamedetails/:gameid", auth, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).send("Access Denied");
  const centredetails = await Centre.findOne({ centreid : req.user._id });
  const centre = centredetails.centreId;
  const gamer = req.params.gameid;
  try {
    const games = await Game.find({ gameId: gamer });
    fetchchildId = games.map((game) => game.childId);
    const children = await Child.find({ _id: fetchchildId, centreId: centre });
    res.send(children);
  } catch (err) {
    res.status(400).send(err);
  }
});
router.get("/gametable/:childId", auth, async (req, res) => {
  const childId = req.params.childId;
  try {
    const games = await Game.find({ childId: childId });
    res.send(games);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.post("/bookAppointment", auth, async (req, res) => {
  if (req.user.role !== "admin" && req.user.role !== "parent") {
    return res.status(403).send("Access Denied");
  }

  const {
    email,
    parentName,
    parentId,
    childName,
    dob,
    age,
    appointmentDate,
    gender,
    parentPhoneNo,
    alternativeNumber,
    address,
    schoolName,
    classGrade,
    schoolBoard,
    consultationType,
    referredBy,
    childConcerns,
    branch,
    doctorId,
    time,
  } = req.body;
  const sanitizedParentId = parentId === "null" ? null : parentId;

  try {
    const existingSlot = await Consultation.findOne({
      doctorID: doctorId,
      "slots.date": appointmentDate,
      "slots.time": time,
      "slots.booked": true,
    });

    if (existingSlot) {
      return res
        .status(400)
        .send({ error: "The selected time slot is already booked." });
    }
  } catch (err) {
    return res
      .status(500)
      .send({ error: "Failed to check appointment availability" });
  }

  const sanitizedEmail = email.split("@")[0];
  if (req.files && req.files.pdf) {
    const pdfBuffer = req.files.pdf ? req.files.pdf.data : null;
    const uploadDir = "./testinguploads/childReports/";
    const filePath = path.join(uploadDir, `${sanitizedEmail}_report.pdf`);
    if (pdfBuffer) {
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      await fs.promises.writeFile(filePath, pdfBuffer);
    }
  }

  const status = req.user.role === "admin" ? "confirmed" : "pending";

  try {
    const appointment = new Appointment({
      email,
      parentName,
      parentId: sanitizedParentId,
      childName,
      dob,
      age,
      appointmentDate,
      gender,
      parentPhoneNo,
      alternativeNumber,
      address,
      schoolName,
      classGrade,
      schoolBoard,
      consultationType,
      referredBy,
      childConcerns,
      branch,
      time,
      doctorId,
      status,
    });

    await appointment.save();

    if (status === "confirmed") {
      const existingConsultation = await Consultation.findOne({
        doctorID: doctorId,
        parentID: null,
        "slots.date": appointmentDate,
      });

      if (existingConsultation) {
        existingConsultation.slots.push({
          date: appointmentDate,
          time,
          booked: true,
          appointmentID: appointment._id,
          childName,
        });
        await existingConsultation.save();
      } else {
        const newConsultation = new Consultation({
          doctorID: doctorId,
          childName,
          parentID: sanitizedParentId,
          slots: [
            {
              date: appointmentDate,
              time,
              booked: true,
              appointmentID: appointment._id,
            },
          ],
        });
        await newConsultation.save();
      }
    } else {
        sendmail(email, "Appointment Booking", `Your Appointment booking request has sent to admin for ${appointmentDate} at ${time}. Please wait for admin approval.`);
      return res
        .status(200)
        .send("Appointment booked, awaiting admin approval.");
    }
    try {
      sendmail(email, "Appointment Booking", `Your Appointment booking has been booked for ${appointmentDate} at ${time}. Please be 15mins prior to the Appointment time.`);
    } catch (err) {
      return res.status(500).send({ error: "Failed to send email" });
    }
    res.status(200).send("Appointment booked successfully");
  } catch (err) {
    console.log(err);
    res.status(400).send({ error: "Failed to book appointment" + err });
  }
});

router.put("/verifyAppointment/:appointmentID", auth, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).send("Access Denied");

  try {
    const { appointmentID } = req.params;
    const { status } = req.body;

    const appointment = await Appointment.findById(appointmentID);
    if (!appointment) return res.status(404).send("Appointment not found");

    if (!status) {
      const existingConsultation = await Consultation.findOne({
        doctorID: appointment.doctorId,
        "slots.date": appointment.appointmentDate,
        "slots.time": appointment.time,
      });

      return res.status(200).json({
        booked: !!existingConsultation,
        message: existingConsultation ? "Slot already booked!" : "Slot is available.",
      });
    }

    if (status === "confirmed") {
      const newConsultation = new Consultation({
        doctorID: appointment.doctorId,
        parentID: appointment.parentId,
        childName: appointment.childName,
        slots: [{ date: appointment.appointmentDate, time: appointment.time, booked: true }],
      });

      await newConsultation.save();
      
      appointment.status = "confirmed";
      await appointment.save();

      const subject = "Appointment Confirmed";
      const text = `Dear ${appointment.parentName},\n\nYour appointment for ${appointment.childName} on ${appointment.appointmentDate} at ${appointment.time} has been confirmed.\n\nThank you.`;

      sendmail(appointment.email, subject, text);

      return res.status(200).json({ success: true, message: "Appointment approved and email sent." });
    }
    
    if (status === "rejected") {
      const subject = "Appointment Rejected";
      const text = `Dear ${appointment.parentName},\n\nYour appointment request for ${appointment.childName} on ${appointment.appointmentDate} at ${appointment.time} has been rejected.\n\nPlease try another date or time.\n\nThank you.`;

      sendmail(appointment.email, subject, text);
      
      appointment.status = "rejected";
      await appointment.save();

      return res.status(200).json({ success: true, message: "Appointment rejected and email sent." });
    }

    return res.status(400).json({ error: "Invalid status or request" });

  } catch (err) {
    console.error("Error in verifyAppointment:", err);
    res.status(500).json({ error: "Server error" });
  }
});


router.put("/uploadPrescription/:appointmentID", auth, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).send("Access Denied");
  const { appointmentID } = req.params;

  try {
    if (!req.files) {
      return res.status(400).send("Presription not uploaded");
    }

    const pdfBuffer = req.files.pdf ? req.files.pdf.data : null;
    const uploadDir = "/home/testinguploads/prescriptions/";
    const filePath = path.join(uploadDir, `${req.files.pdf.name}`);

    if (pdfBuffer) {
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      await fs.promises.writeFile(filePath, pdfBuffer);
    }

    const appointment = await Appointment.findByIdAndUpdate(
      appointmentID,
      { prescription: filePath },
      { new: true }
    );
    if (!appointment) {
      return res.status(400).send("Appointment not found");
    }
    res.status(200).send({
      message: "Prescription uploaded successfully",
      prescription: filePath,
      appointment,
    })
  } catch (error) {
    res.status(500).send("Internal server error : " + error);
  }
});

router.get("/getAppointments", auth, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).send("Access Denied");

  try {
    const appointments = await Appointment.find({ status: "pending" });

    res.send(appointments);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.get("/get-jwl-enquiries/:centre", auth, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).send("Access Denied");

  try {
    const centerName = await Centre.findOne({ centreId : req.params.centre },{_id:0,name:1});
    console.log(centerName);
    const enquiries = await jwlUser.find({
      preferredCenter: centerName.name,
      isArchived: false,
    });
    console.log(enquiries);

    res.send(enquiries);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.get("/get-jwluser-video/:parentEmail", auth, async (req, res) => {
  if (req.user.role === "caretaker" || req.user.role === "parent")
    return res.status(403).send("Access Denied");

  try {
    const parentEmail = req.params.parentEmail;
    const sanitizedEmail = parentEmail.split("@")[0];
    res.sendFile(`/home/testinguploads/jwluploads/${sanitizedEmail}.mp4`);
  } catch (err) {
    res.status(400).send(err);
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
    console.log(err);
    res.status(400).send(err);
  }
});

router.get("/getAppointments/:doctorID", auth, async (req, res) => {
  if (req.user.role === "caretaker")
    return res.status(403).send("Access Denied");
  try {
    const appointment = await Appointment.find({
      doctorId: req.params.doctorID,
      status: "confirmed",
    });
    res.send(appointment);
  } catch (error) {
    res.status(500).send("Internal server error");
  }
});

router.get("/getConsultations/:doctorID/:date", auth, async (req, res) => {
  if (req.user.role !== "admin" && req.user.role !== "parent")
    return res.status(403).send("Access Denied");

  try {
    const consultations = await Consultation.find({
      doctorID: req.params.doctorID,
      "slots.date": req.params.date,
    });

    res.send(consultations);
  } catch (err) {
    res.status(400).send(err);
  }
});
module.exports = router;
