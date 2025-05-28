const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const userRoutes = require("./routes/UserRoutes");
const dataRoutes = require("./routes/dataroutes");
const parentRoutes = require("./routes/parentRoutes");
const therapistRoutes = require("./routes/therapistRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const adminRoutes = require("./routes/adminRoutes");
const superadminRoutes = require("./routes/superadminRoutes");
const jwlRoutes = require("./routes/jwlRoutes");
const uploadRoutes = require("./routes/uploadRoutes");

require("dotenv").config();

const port = process.env.PORT || 4001;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use("/uploads", express.static("/home/totaluploads"));
app.use("/upload_images", express.static("/upload_images"));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB", err);
  });

app.use("/api/users", userRoutes);
app.use("/api/data", dataRoutes);
app.use("/api/parents", parentRoutes);
app.use("/api/therapists", therapistRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/admins", adminRoutes);
app.use("/api/superadmins", superadminRoutes);
app.use("/api/jwl", jwlRoutes);
app.use("/", uploadRoutes);

app.get("/api", (req, res) => {
  res.send("Hello from Total-B Server!");
});
app.get("/api/get-test-video", (req, res) => {
  const testVidPath = path.join(__dirname, "test_video.mp4");
  res.sendFile(testVidPath);
});
app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
