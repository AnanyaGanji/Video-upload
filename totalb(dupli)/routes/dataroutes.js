const express = require("express");
const { User } = require("../models/User");
const Child = require("../models/Child");
const Parent = require("../models/User").Parent;
const router = express.Router();
const auth = require("../middleware/auth");
const Centre = require("../models/Centre");
const GamesHome = require("../models/GamesHome");
const Game = require("../models/Game");
const bcrypt = require("bcryptjs");

require("dotenv").config();

router.get("/allcentres", auth, async (req, res) => {
  if (!(req.user.role === "admin" || req.user.role === "parent")) return res.status(401).send("Unauthorized");
  try {
    const centres = await Centre.find();
    res.send(centres);
  } catch (err) {
    res.status(500).send(err);
  }
});


router.get("/allcentrenames", async (req, res) => {
  try {
    const centres = await Centre.find();
    const cnames = centres.map((centre) => {
      return centre.name;
    }
    );
    res.send(cnames);
  } catch (err) {
    res.status(500).send(err);
  }
});



router.get("/allChildren/:id", auth, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(401).send("Unauthorized");
  }

  try {
    const centreId = req.params.id;
    const centre = await Centre.findById(centreId).populate({ path: "children", populate: { path: "parentId" } });

    if (!centre) {
      return res.status(404).send("Centre not found");
    }

    res.send(centre.children);
  } catch (err) {
    res.status(500).send("Server Error: " + err.message);
  }
});



router.get("/allParents/:centreNumber", auth, async (req, res) => {
  if (req.user.role !== "admin") return res.status(401).send("Unauthorized");
  try {
    const centreNumber = req.params.centreNumber;
    const data = await Centre.findOne({ centreNumber: centreNumber }).populate(
      "parents"
    );
    const notAllowedFields = ["password"];

    const parents = data.map((obj) =>
      Object.fromEntries(
        Object.entries(obj).filter(([key]) => !notAllowedFields.includes(key))
      )
    );
    // const parents = data.map((parent) => {
    //   parent.password = undefined;
    // });
    res.send(parents.parents);
  } catch (err) {
    res.status(500).send(err);
  }
});

router.get("/allDoctors/:id", auth, async (req, res) => {
  if (req.user.role !== "admin" && req.user.role !== "parent") {
    return res.status(401).send("Unauthorized");
  }
  try {
    const doctors = await Centre.findById(req.params.id).populate({ path: "doctors", select: "-password" });
    if (!doctors) {
      return res.status(404).send("Centre not found");
    }
    res.send(doctors);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Server error", details: err.message });
  }
});



router.get("/allTherapists/:id", auth, async (req, res) => {
  if (req.user.role !== "admin") return res.status(401).send("Unauthorized");

  try {
    const doctors = await Centre.findById(req.params.id).populate({
      path: "therapists",
      select: "-password"
    });

    if (!doctors) return res.status(404).send("Centre not found");

    res.send(doctors);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});


// take userId and return all detials of user except password
router.get("/allUsers/:userId", auth, async (req, res) => {
  // if (req.user.role !== "admin") return res.status(401).send("Unauthorized");
  const { userId } = req.params;
  if (!userId) return res.status(400).send("User ID is required");
  try {
    const user = await User.findById(userId).select(["-password"]);
    if (!user) return res.status(404).send("User not found");
    res.send(user);
  } catch (error) {
    res.status(500).send("Server error " + error.message);
  }
});

router.get("/allgames", async (req, res) => {
  try {
    const games = await GamesHome.find();
    res.send(games);
  } catch (err) {
    res.status(500).send(err);
  }
});

router.post("/submitGameDetails/:gameId/:childId", async (req, res) => {
  try {
    const { gameId, childId } = req.params;
    const { tries, timer, status, therapistId, datePlayed } = req.body;
    const game = new Game({
      gameId,
      tries,
      timer,
      status,
      childId,
      therapistId,
      datePlayed
    });
    await game.save();
    res.status(201).send(game);
  }
  catch (err) {
    res.status(500).send(err);
  }
});

router.get('/gameReports/:childId', async (req, res) => {
  try {

    const { childId } = req.params;
    let gameReports = await Game.find({ childId }).sort({ datePlayed: -1 });
    // console.log(gameReports);
    gameReports = await Promise.all(gameReports.map(async game => {
      const gameId = game.gameId.toString();
      const result = await GamesHome.findOne({ "games.gameId": gameId }, { "games.$": 1 });
      // console.log(result);
      const gameInfo = result?.games[0];
      // Convert to a plain object before mutation
      game = game.toObject();
      game.name = gameInfo ? gameInfo.name : "Unknown Game";

      return game;
    }));
    // console.log(gameReports);
    res.status(200).send(gameReports);

  } catch (err) {
    res.status(500).send(err);
  }
});

router.get("/:childId", auth, async (req, res) => {
  if (req.user.role !== "admin") return res.status(401).send("Unauthorized");
  const { childId } = req.params;
  if (!childId) return res.status(400).send("Child ID is required");
  try {
    const child = await Child.findById(childId);
    if (!child) return res.status(404).send("Child not found");
    res.status(200).send(child);
  } catch (error) {
    res.status(500).send("Server error");
  }
});

router.put('/updateUser/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log(req.body);
    const user = await User.findById(userId);
    if(user.role ==="parent"){
        const response = await Parent.findByIdAndUpdate(userId, req.body, { new: true, runValidators: true });
        if (!response) {
          res.status(404).send("User not found");
        }
        console.log(response);
        res.status(200).send(response); 
    }
    else{
        const response = await User.findByIdAndUpdate(userId, req.body, { new: true, runValidators: true });
        if (!response) {
          res.status(404).send("User not found");
        }
        res.status(200).send(response);
    }
    
  } catch (error) {
    res.status(500).send("Server error");
  }
});

router.put('/changePassword/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).send("User not found");
      return;
    }
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      res.status(400).send("Current password and new password are required");
      return;
    }
    const validPass = await bcrypt.compare(currentPassword, user.password);
    if (!validPass) return res.status(400).send("Invalid password");

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updatedUser = await User.findByIdAndUpdate(userId, { password: hashedPassword }, { new: true, runValidators: true });
    if (!updatedUser) {
      res.status(404).send("User not found");
      return;
    }
    res.status(200).send(updatedUser);  
  }
  catch (error) {
    res.status(500).send("Server error");
  }
});


module.exports = router;
