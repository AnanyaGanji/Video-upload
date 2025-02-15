const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true },
    filepath: { type: String, required: true },
    childName: { type: String, required: true },
    adminName: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Video = mongoose.model("Video", videoSchema);
module.exports = Video;
