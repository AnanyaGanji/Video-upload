const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

// Set up storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const gameid = req.params.gameid;
    const uploadPath = path.join(__dirname, `../upload_images/${gameid}`);
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `image-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage });

// POST route to handle upload
router.post("/child/uploads/:gameid", upload.single("image"), (req, res) => {
  // const id = req.params.id;
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  res
    .status(200)
    .json({ message: "Image uploaded successfully", file: req.file.filename });
});

module.exports = router;
