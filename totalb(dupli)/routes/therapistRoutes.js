const express = require('express');
const bcrypt = require('bcryptjs');
const {User} = require('../models/User');
const Child = require('../models/Child');
const Game = require('../models/Game');
const router = express.Router();
const auth = require('../middleware/auth');
// const Gametrial = require('../models/Gametrial');
const IEP = require('../models/IEP');
// Get assigned children for caretaker
router.get('/assigned', auth, async (req, res) => {
    if (req.user.role !== 'therapist') return res.status(403).send('Access Denied');

    try { 
        const children = await Child.find({ therapistId: req.user._id }).populate('parentId',"name").populate('therapistId','name').populate('centreId','name').populate('doctorId','name');
        res.send(children);
    } catch (err) {
        res.status(400).send(err);
    }
});


router.post('/sendgamedata',async (req,res)=>{
    
    const {gameId,tries,timer,status,childId} = req.body;
    try{
        const game = new Game({gameId,tries,timer,status,childId});
        await game.save();
        res.status(200).send("Game data saved succesfully");
    }catch(err){
        res.status(400).send(err);
    }
});

// router.put('/feedback/:childId', auth, async (req, res) => {
    //     if (req.user.role !== 'therapist') return res.status(403).send('Access Denied');
    //     const { childId } = req.params;
//     const { feedback } = req.body;
//     const role = 'therapist';
//     if (!childId) return res.status(400).send('Child ID is required');
//     try {
    //         const therapist = await User.findById(req.user._id);
    //         if (!therapist) return res.status(404).send('Therapist not found');
    //         const name = therapist.name;
    //         let feedbackDoc = await Feedback.findOne({ childId });
    //         if (!feedbackDoc) {
        //             feedbackDoc = new Feedback({ childId, name, role, feedback: [feedback] });
        //         } else {
            //             feedbackDoc.feedback.push(feedback);
            //         }
            //         await feedbackDoc.save();
            //         res.status(200).send(feedbackDoc);
            //     } catch (error) {
                //         res.status(500).send('Server error');
                //     }
                // });
                
                router.get('/childIEP/:childId' ,async (req, res) => {
                    
    // We can add a check to ensure that both therapists and doctors can access this route
    // if(req.user.role !== 'therapist') return res.status(403).send('Access Denied');
    const { childId } = req.params;
    if (!childId) return res.status(400).send('Child ID is required');
    try {
        const iep = await IEP.find({ childId  });
        res.send(iep);
    } catch (err) {
        res.status(400).send(err);
    }
}
);

router.put('/updateIEPperformance/:childId', auth, async (req, res) => {
    const { childId } = req.params;
    const { performance, month, therapistFeedback, iepId } = req.body;
    
    console.log(req.body);
    
    if(!childId || !month || !iepId) return res.status(400).send('Missing required fields');
    
    try {
        const iep = await IEP.findOne({ _id: iepId, childId: childId });
        if (!iep) return res.status(404).send('IEP not found');
        
        const goalIndex = iep.monthlyGoals.findIndex(goal => goal.latest && goal.latest.month === month);
        if (goalIndex === -1) return res.status(404).send('Monthly goal not found');
        
        // Move the current latest to history
        const current = iep.monthlyGoals[goalIndex].latest;
        
        // Update latest
        iep.monthlyGoals[goalIndex].latest = {
            ...current,
            performance,
            therapistFeedback,
            updatedAt: new Date()
        };
 
        await iep.save();
        res.status(200).send("Performance updated successfully");
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

router.put('/:gameId/:childId', auth, async (req, res) => {
    if (req.user.role !== 'therapist') return res.status(403).send('Access Denied');
    const { tries, timer, status } = req.body;
    const { gameId, childId } = req.params;

    // Validate childId
    if (!childId) return res.status(400).send('Child ID is required');

    try {
        // Verify that the child is assigned to the caretaker
        const child = await Child.findById(childId);
        if (!child) return res.status(404).send('Child not found');
        if (child.therapistId.toString() !== req.user._id.toString()) {
            return res.status(403).send('Different caretaker assigned to the child');
        }

        // Create a new game entry regardless of whether one already exists
        const game = new Game({ gameId, childId, tries, timer, status });
        await game.save();

        // If the game status is completed, update the corresponding game status in the child's document
        if (status) {
            // Always add the gameId to the gamesCompleted array
            child.gameReports.push(game);
            await child.save();
        } else {
            // Remove the gameId from the gamesCompleted array if the game is not completed
            const index = child.gameReports.indexOf(game);
            if (index > -1) {
                child.gameReports.splice(index, 1);
                await child.save();
            }
        }

        res.send(game);
    } catch (err) {
        res.status(400).send(err);
    }
});
module.exports = router;