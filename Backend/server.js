// // require("dotenv").config();
// // const express = require("express");
// // const mongoose = require("mongoose");
// // const cors = require("cors");
// // const multer = require("multer");
// // const path = require("path");
// // const fs = require("fs");

// // const app = express();
// // app.use(cors());
// // app.use(express.json());

// // // ✅ Ensure uploads directory exists
// // const uploadDir = path.join(__dirname, "uploads");
// // if (!fs.existsSync(uploadDir)) {
// //   fs.mkdirSync(uploadDir, { recursive: true });
// // }

// // // ✅ Multer Storage Configuration
// // const storage = multer.diskStorage({
// //   destination: function (req, file, cb) {
// //     cb(null, uploadDir); // Save videos to "uploads" folder
// //   },
// //   filename: function (req, file, cb) {
// //     cb(null, `${Date.now()}-${file.originalname}`); // Unique filename
// //   },
// // });

// // const upload = multer({ storage: storage });

// // // ✅ MongoDB Connection
// // console.log("MongoDB URI:", process.env.MONGODB_URI);

// // if (!process.env.MONGODB_URI) {
// //   console.error("❌ MONGODB_URI is not defined. Check your .env file.");
// //   process.exit(1);
// // }

// // mongoose
// //   .connect(process.env.MONGODB_URI, {
// //     useNewUrlParser: true,
// //     useUnifiedTopology: true,
// //   })
// //   .then(() => console.log("✅ MongoDB Connected Successfully"))
// //   .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// // // ✅ Video Schema
// // const videoSchema = new mongoose.Schema({
// //   adminName: String,
// //   childName: String,
// //   videoPath: String,
// //   uploadedAt: { type: Date, default: Date.now },
// // });

// // const Video = mongoose.model("Video", videoSchema);

// // // ✅ Video Upload API
// // app.post("/upload", upload.single("video"), async (req, res) => {
// //   try {
// //     const { adminName, childName } = req.body;

// //     if (!req.file) {
// //       return res.status(400).json({ error: "No video uploaded" });
// //     }

// //     const newVideo = new Video({
// //       adminName,
// //       childName,
// //       videoPath: req.file.path,
// //     });

// //     await newVideo.save();
// //     res.status(201).json({ message: "Video uploaded successfully", video: newVideo });
// //   } catch (error) {
// //     console.error("❌ Upload Error:", error);
// //     res.status(500).json({ error: "Internal server error" });
// //   }
// // });

// // // ✅ Fetch All Uploaded Videos
// // app.get("/videos", async (req, res) => {
// //   try {
// //     const videos = await Video.find();
// //     res.json(videos);
// //   } catch (error) {
// //     console.error("❌ Fetch Videos Error:", error);
// //     res.status(500).json({ error: "Internal server error" });
// //   }
// // });

// // // ✅ Serve Uploaded Videos
// // app.use("/uploads", express.static(uploadDir));

// // const PORT = process.env.PORT || 5000;
// // app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
// require("dotenv").config();
// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");
// const multer = require("multer");
// const path = require("path");

// const app = express();
// app.use(cors());
// app.use(express.json());

// // ✅ MongoDB Connection
// mongoose
//   .connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(() => console.log("✅ MongoDB Connected Successfully"))
//   .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// // ✅ Multer Storage Configuration
// const storage = multer.diskStorage({
//   destination: "./uploads/videos", // Save videos in 'uploads/videos'
//   filename: (req, file, cb) => {
//     cb(null, `${Date.now()}_${file.originalname}`);
//   },
// });

// const upload = multer({ storage });

// // ✅ Define Video Upload Route
// app.post("/api/upload", upload.single("video"), async (req, res) => {
//   if (!req.file) {
//     return res.status(400).json({ error: "No file uploaded" });
//   }

//   // ✅ Save video details to MongoDB
//   const videoData = {
//     filename: req.file.filename,
//     filepath: `/uploads/videos/${req.file.filename}`,
//     childName: req.body.childName,
//     adminName: req.body.adminName,
//     email: req.body.email,
//   };

//   // Insert into database (assuming you have a Video model)
//   try {
//     const Video = mongoose.model("Video", new mongoose.Schema(videoData, { timestamps: true }));
//     await Video.create(videoData);
//     res.json({ message: "Upload successful", videoData });
//   } catch (error) {
//     console.error("Error saving to DB:", error);
//     res.status(500).json({ error: "Database error" });
//   }
// });

// // ✅ Start Server
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));


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


// ✅ MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// ✅ Ensure 'uploads/videos' folder exists
const fs = require("fs");
const uploadDir = path.join(__dirname, "uploads/videos");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ✅ Multer Storage Configuration
const storage = multer.diskStorage({
  destination: "./uploads/videos", // Save videos in 'uploads/videos'
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const upload = multer({ storage });

// ✅ Define Video Upload Route
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
    };

    await Video.create(videoData);
    res.json({ message: "Upload successful", videoData });
  } catch (error) {
    console.error("Error saving to DB:", error);
    res.status(500).json({ error: "Database error" });
  }
});
// ✅ Get All Videos API
app.get("/api/videos", async (req, res) => {
    try {
      const videos = await Video.find().sort({ createdAt: -1 });
      res.json(videos);
    } catch (error) {
      console.error("Error fetching videos:", error);
      res.status(500).json({ error: "Database error" });
    }
  });
  
// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
