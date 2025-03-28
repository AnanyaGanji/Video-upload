const express = require("express");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const User = require("../models/User");
const Child = require("../models/child");
const Game = require("../models/GameStatus");
const router = express.Router();
const auth = require("../middleware/auth");
const Gametrial = require("../models/Gametrial");
const IEPDoctor = require("../models/IEPDoctor");
// Get assigned children for caretaker
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Store files in 'uploads' folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname); // Unique filename
  },
});
const upload = multer({ storage });

router.post(
  "/uploadVideo/:childId",
  auth,
  upload.single("video"),
  async (req, res) => {
    if (req.user.role !== "caretaker")
      return res.status(403).send("Access Denied");

    const { childId } = req.params;
    const { description } = req.body;
    if (!req.file) return res.status(400).send("No video file uploaded");
    console.log("hiiiiiiiiii");

    try {
      // const caretaker = await User.findById(req.user._id);
      // const caretaker = await IEPDoctor.findById(req.user._id);
      // console.log(req.user._id)
      // console.log(caretaker)
      // if (!caretaker) return res.status(404).send('Caretaker not found');
      //console.log(childId);
      // const child = await IEPDoctor.find({childId:childId});
      const child = await IEPDoctor.findOne({ childId: childId }); //findone is used to find exactly one objrct of that id

      if (!child) return res.status(404).send("Child not found");

      //Store video in caretaker's document
      child.videos.push({
        videoPath: req.file.path,
        childId: childId,
        uploadedAt: new Date(),
        description: description,
      });

      await child.save();
      res.status(200).json({
        message: "Video uploaded successfully",
        videoPath: req.file.path,
      });
    } catch (err) {
      res.status(500).json({ error: "Error uploading video" });
    }
  }
);

router.get("/getVideos/:childId", auth, async (req, res) => {
  const { childId } = req.params;
  try {
    const iepDoctor = await IEPDoctor.findOne({ childId });
    if (!iepDoctor) return res.status(404).send("IEP Record not found");
    res.json(iepDoctor.videos);
  } catch (error) {
    console.error("Error fetching videos:", error);
    res.status(500).json({ message: "Error fetching videos" });
  }
});

router.get("/assigned", auth, async (req, res) => {
  if (req.user.role !== "caretaker")
    return res.status(403).send("Access Denied");

  try {
    const children = await Child.find({ caretakerId: req.user._id });
    res.send(children);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.put("/:gameId/:childId", auth, async (req, res) => {
  if (req.user.role !== "caretaker")
    return res.status(403).send("Access Denied");
  const { tries, timer, status } = req.body;
  const { gameId, childId } = req.params;

  // Validate childId
  if (!childId) return res.status(400).send("Child ID is required");

  try {
    // Verify that the child is assigned to the caretaker
    const child = await Child.findById(childId);
    if (!child) return res.status(404).send("Child not found");
    if (child.caretakerId.toString() !== req.user._id.toString()) {
      return res.status(403).send("Different caretaker assigned to the child");
    }

    // Create a new game entry regardless of whether one already exists
    const game = new Game({ gameId, childId, tries, timer, status });
    await game.save();

    // If the game status is completed, update the corresponding game status in the child's document
    if (status) {
      // Always add the gameId to the gamesCompleted array
      child.gamesCompleted.push(gameId);
      await child.save();
    } else {
      // Remove the gameId from the gamesCompleted array if the game is not completed
      const index = child.gamesCompleted.indexOf(gameId);
      if (index > -1) {
        child.gamesCompleted.splice(index, 1);
        await child.save();
      }
    }

    res.send(game);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.post("/sendgamedata", async (req, res) => {
  const { gameId, tries, timer, status, childId } = req.body;
  try {
    const game = new Gametrial({ gameId, tries, timer, status });
    await game.save();
    res.status(200).send("Game data saved succesfully");
  } catch (err) {
    res.status(400).send(err);
  }
});

router.put("/feedback/:childId", auth, async (req, res) => {
  if (req.user.role !== "caretaker")
    return res.status(403).send("Access Denied");
  const { childId } = req.params;
  const { feedback } = req.body;
  const role = "caretaker";
  if (!childId) return res.status(400).send("Child ID is required");
  try {
    const caretaker = await User.findById(req.user._id);
    if (!caretaker) return res.status(404).send("Caretaker not found");
    const name = caretaker.name;
    let feedbackDoc = await Feedback.findOne({ childId });
    if (!feedbackDoc) {
      feedbackDoc = new Feedback({ childId, name, role, feedback: [feedback] });
    } else {
      feedbackDoc.feedback.push(feedback);
    }
    await feedbackDoc.save();
    res.status(200).send(feedbackDoc);
  } catch (error) {
    res.status(500).send("Server error");
  }
});

router.get("/childIEP/:childId", async (req, res) => {
  // We can add a check to ensure that both therapists and doctors can access this route

  const { childId } = req.params;
  if (!childId) return res.status(400).send("Child ID is required");
  try {
    const IEP = await IEPDoctor.find({ childId });
    res.send(IEP);
  } catch (err) {
    res.status(400).send(err);
  }
});
module.exports = router;
