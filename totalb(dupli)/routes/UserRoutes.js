const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models/User");
const router = express.Router();
const auth = require("../middleware/auth");
const mailUtility = require("../middleware/mail");
const Centre = require("../models/Centre");
const Parent = require("../models/User").Parent;
const otpAuth = require("../middleware/otpAuth");
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator");
const { generateUniqueReferenceId } = require("../middleware/reference");
const validateUserInput = require("../middleware/validateUserInput");
const Feedback = require("../models/Feedback");

require("dotenv").config();

router.get("/allusers", async (req, res) => {
  const users = await User.find({}, { username: 1, email: 1, _id: 0 });
  res.json({ success: true, users });
});

router.post("/send-otp", async (req, res) => {
  try {
    const { otpEmail } = req.body;
    if (!otpEmail) {
      return res.status(403).send({
        success: false,
        message: "OTP Email is required",
      });
    }

    let existingUser = await User.findOne({ email: otpEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    let otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    while (await OTP.findOne({ otp })) {
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });
    }

    const otpPayload = { email: otpEmail, otp };
    const otpBody = await OTP.create(otpPayload);

    const mailBody = `
Your One-Time Password (OTP) for email verification in https://total.joywithlearning.com is:
${otp}

Please enter this code to verify your email address.  
This OTP is valid for <strong>5 minutes</strong> only.  

Thank you!  

Best regards,  
Total Solutions
`;
    try {
      mailUtility(otpEmail, "OTP for Email Verification", mailBody);
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: "Error sending OTP",
        error: err,
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Email Sent\nPlease Provide the OTP within 5 minutes otherwise OTP will be Invalid!!",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "User Enquiry failed",
      error: err,
    });
  }
});

router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(403).json({
        success: false,
        message: "Email or OTP is missing",
      });
    }

    const response = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);

    if (response.length === 0 || otp !== response[0].otp) {
      return res.status(200).json({
        success: false,
        message: "The OTP is not valid",
      });
    }

    const token = jwt.sign({ email: email }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    return res.status(200).json({
      success: true,
      message: "User verified successfully",
      token: token,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "OTP Verification Failed",
    });
  }
});

router.post("/parentRegister", otpAuth, validateUserInput, async (req, res) => {
  try {
    const {
      username,
      password,
      parentName,
      parentPhone,
      parentEmail,
      address,
    } = req.body;

    console.log(req.body);

    const referenceId = await generateUniqueReferenceId(Parent);
    const role = "parent";
    const user = await User.findOne({ username });
    if (user) return res.status(401).send("User already exists");
    const hashedPassword = await bcrypt.hash(password, 10);

    const name = parentName;
    const mobilenumber = parentPhone;
    const email = parentEmail;

    const users = new Parent({
      username,
      password: hashedPassword,
      role,
      name,
      mobilenumber,
      email,
      address,
      referenceId,
    });

    try {
      const savedUser = await users.save();
      const userData = savedUser.toObject();
      delete userData.password;
      const mailBody = `
      Dear ${name},
      
      We are delighted to welcome you to Total Solutions! Thank you for joining our platform, where we strive to support and enhance your child's journey.
      
      Here are your login credentials:
      - Username: ${username}
      - Password: ${password}
      
      Your Account's reference ID is: ${referenceId}
      
      You can access your account at: ${process.env.WEBSITE_URL}
      
      If you have any questions or need assistance, feel free to reach out to our support team. We look forward to providing you with the best experience.
      
      Best regards,
      Total Solutions
      ${process.env.WEBSITE_URL}
      `;

      try {
        mailUtility(email, "Welcome to Total Solutions", mailBody);
      } catch (err) {
        return res.status(500).json({
          success: false,
          message: "Mail not sent",
        });
      }

      res.send({ success: true, message: "User saved", userData });
    } catch (err) {
      res.status(400).send({ success: false, message: "User not saved" });
    }
  } catch (err) {
    res.status(400).send({ success: false, message: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(401).send("Username or password is wrong");

    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) return res.status(400).send("Invalid password");

    const userData = user.toObject();
    delete userData.password;
    const token = jwt.sign({ user: userData }, process.env.JWT_SECRET, {
      expiresIn: "12h",
    });

    return res
      .status(200)
      .send({ success: true, token: token, role: user.role });
  } catch (err) {
    res.status(400).send({ success: false, message: err.message });
  }
});

router.post("/contactus", async (req, res) => {
  try {
    const { name, email, mobilenumber, subject, message } = req.body;
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(mobilenumber)) {
      return res
        .status(400)
        .json({ message: "Mobile number must be 10 digits." });
    }
    let existingUser = await Feedback.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "You have already submitted your feedback. . .",
      });
    }
    await Feedback.create({ name, email, mobilenumber, subject, message });
    res.status(200).send({ success: true, message: "Feedback saved" });
  } catch (err) {
    res.status(500).send({ success: false, message: "Interneal Server error" });
  }
});

module.exports = router;
