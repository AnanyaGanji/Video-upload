const express = require('express');
const Child = require('../models/Child');
const { User } = require('../models/User');
const auth = require('../middleware/auth');
// const Feedback = require('../models/Feedback');
const Appointment = require('../models/Appointment');
const IEP = require('../models/IEP');
const router = express.Router();


// Get assigned children and caretakers for doctor
router.get('/assigned', auth, async (req, res) => {
    if (req.user.role !== 'doctor') return res.status(403).send('Access Denied');

    try {
        const children = await Child.find({ doctorId: req.user._id }).populate('centreId', "address city name ").populate('therapistId', "name");
        children.sort((a, b) => b.createdAt - a.createdAt);
        res.send(children);
    } catch (err) {
        res.status(400).send(err);
    }
});

// Feedback
// router.put('/feedback/:childId', auth, async (req, res) => {
//     if (req.user.role !== 'doctor') return res.status(403).send('Access Denied');
//     const {childId} = req.params;
//     const {feedback} = req.body;
//     const role = 'doctor';
//     if (!childId) return res.status(400).send('Child ID is required');
//     try {
//         const doctor = await User.findById(req.user._id);
//         if (!doctor) return res.status(404).send('Doctor not found');
//         const name = doctor.name;
//         let feedbackDoc = await Feedback.findOne({ childId });
//         if (!feedbackDoc) {
//             feedbackDoc = new Feedback({ childId, name,role, feedback: [feedback] });
//         } else {
//             feedbackDoc.feedback.push(feedback);
//         }
//         await feedbackDoc.save();
//         res.status(200).send(feedbackDoc);
//     } catch (error) {
//         res.status(500).send('Server error');
//     }
// });

router.post("/assignIEP/:childId", async (req, res) => {
    const {
        doctorId, therapy, therapistName, feedback,
        monthlyGoals, startingMonth, startingYear,
        selectedMonths, selectedMonthsNames
    } = req.body;

    console.log("Request Body:", req.body);
    console.log("Latest : ", req.body.monthlyGoals[0].latest);
    console.log("Latest : ", req.body.monthlyGoals[1].latest);
    console.log("Latest : ", req.body.monthlyGoals[2].latest);
    console.log("History : ", req.body.monthlyGoals[0].history);
    console.log("History : ", req.body.monthlyGoals[1].history);
    console.log("History : ", req.body.monthlyGoals[2].history);
    const { childId } = req.params;

    if (!doctorId || !therapy || !therapistName || !monthlyGoals || !startingMonth || !startingYear || !selectedMonthsNames) {
        return res.status(400).send("Please provide all the details");
    }

    try {
        const doctor = await User.findById(doctorId);
        if (!doctor) return res.status(404).send("Doctor not found");

        const child = await Child.findById(childId);
        if (!child) return res.status(404).send("Child not found");

        const transformedGoals = monthlyGoals.map(goal => ({
            latest: { ...goal.latest, updatedAt: new Date() },
            history: [{ ...goal.latest, updatedAt: new Date() }]
        }));
        console.log("Transformed Goals:", transformedGoals);

        const iep = new IEP({
            doctorId,
            childId,
            therapy,
            therapistName,
            monthlyGoals: transformedGoals,
            selectedMonths,
            feedback,
            startingMonth,
            startingYear,
            selectedMonthsNames
        });

        await iep.save();

        child.IEPs.push(iep._id);
        await child.save();

        res.status(201).send(iep);

    } catch (error) {
        console.error(error);
        res.status(500).send("Server error");
    }
});

router.put("/updateIEP/:childId", async (req, res) => {
    const { childId } = req.params;
    const { iepId, monthlyGoals, monthIndex} = req.body;

    if (!childId || !iepId || monthIndex === undefined || !monthlyGoals) {
        return res.status(400).send("Please provide all the details");
    }

    try {
        const iep = await IEP.findOne({ _id: iepId, childId: childId });
        if (!iep) return res.status(404).send("IEP not found");

        iep.monthlyGoals[monthIndex] = monthlyGoals;

        await iep.save();

        res.status(200).send(iep);
    } catch (error) {
        console.error(error);
        res.status(500).send(error);
    }

});

router.get('/getAppointments/:doctorId', auth, async (req, res) => {
    if (req.user.role !== 'doctor') return res.status(403).send('Access Denied');

    const { doctorId } = req.params;
    if (!doctorId) return res.status(400).send('Doctor ID is required');

    try {
        const appointments = await Appointment.find({ doctorId, status: 'approved' })
            .populate('childId')
            .populate('doctorId')
            .populate('centreId')
            .sort({ appointmentDate: -1 });

        res.status(200).send(appointments);
    } catch (error) {
        console.error('Error fetching appointments:', error);
        res.status(500).send(error);
    }
});


router.put('/updateperformance/:childId', auth, async (req, res) => {
    if (req.user.role !== 'therapist') return res.status(403).send('Access Denied');

    const { childId } = req.params;
    const { performance, month, therapistFeedback, iepId } = req.body;

    if (!childId || !month || !iepId) return res.status(400).send('Missing required fields');

    try {
        const iep = await IEP.findOne({ _id: iepId, childId: childId });
        if (!iep) return res.status(404).send('IEP not found');

        const goalIndex = iep.monthlyGoals.findIndex(
            g => g.latest && g.latest.month === month
        );

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

        // Update latest record in history. Dont push a new one
        const historyIndex = iep.monthlyGoals[goalIndex].history.findIndex(
            g => g.month === month
        );
        if (historyIndex !== -1) {
            iep.monthlyGoals[goalIndex].history[historyIndex] = {
                ...current,
                performance,
                therapistFeedback,
                updatedAt: new Date()
            };
        }

        await iep.save();
        res.status(200).send("Performance updated successfully");
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

router.put('/IEPfeedback/:childId', auth, async (req, res) => {
    const { childId } = req.params;
    const { doctorFeedback, month, iepId } = req.body;

    if (!childId || !month || !iepId) return res.status(400).send('Missing required fields');

    try {
        const iep = await IEP.findOne({ _id: iepId, childId: childId });
        if (!iep) return res.status(404).send('IEP not found');

        const goalIndex = iep.monthlyGoals.findIndex(
            g => g.latest && g.latest.month === month
        );

        if (goalIndex === -1) return res.status(404).send('Monthly goal not found');

        const current = iep.monthlyGoals[goalIndex].latest;

        iep.monthlyGoals[goalIndex].latest = {
            ...current.toObject(),
            doctorFeedback,
            updatedAt: new Date()
        };

        const historyIndex = iep.monthlyGoals[goalIndex].history.findIndex(
            g => g.month === month
        );

        if (historyIndex !== -1) {
            iep.monthlyGoals[goalIndex].history[historyIndex] = {
                ...current.toObject(),
                doctorFeedback,
                updatedAt: new Date()
            };
        }
        // console.log(iep);
        await iep.save();
        res.status(200).send("Feedback added successfully");
    } catch (err) {
        console.error(err);
        res.status(500).send("Server error");
    }
});


router.get('/childIEP/:childId', async (req, res) => {

    // We can add a check to ensure that both therapists and doctors can access this route

    const { childId } = req.params;
    if (!childId) return res.status(400).send('Child ID is required');
    try {
        const ieps = await IEP.find({ childId }).populate('doctorId', 'name')
            .populate('childId', "name dob gender");
        res.status(200).send(ieps);
    } catch (err) {
        res.status(400).send(err);
    }
}
);


module.exports = router;
