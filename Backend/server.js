require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const Video = require("./videoSchema"); // Import Video schema

const app = express();
app.use(cors());
app.use(express.json());

app.use("/uploads", express.static("uploads"));

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB Connected Successfully"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

// Ensure 'uploads/videos' folder exists
const fs = require("fs");
const uploadDir = path.join(__dirname, "uploads/videos");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: "./uploads/videos", // Save videos in 'uploads/videos'
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const upload = multer({ storage });

// Define Video Upload Route
app.post("/api/upload", upload.single("video"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  try {
    const videoData = {
      filename: req.file.filename,
      filepath: `/uploads/videos/${req.file.filename}`,
      childName: req.body.childName,
      adminName: req.body.adminName,
      adminEmail: req.body.adminEmail,
    };

    await Video.create(videoData);
    res.json({ message: "Upload successful", videoData });
  } catch (error) {
    console.error("Error saving to DB:", error);
    res.status(500).json({ error: "Database error" });
  }
});
// Get All Videos API
app.get("/api/videos", async (req, res) => {
  try {
    const videos = await Video.find().sort({ createdAt: -1 });
    res.json(videos);
  } catch (error) {
    console.error("Error fetching videos:", error);
    res.status(500).json({ error: "Database error" });
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
