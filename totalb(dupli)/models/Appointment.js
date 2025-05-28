const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
    childId: { type: mongoose.Schema.Types.ObjectId, ref: 'Child', required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    appointmentDate: { type: Date, required: true },
    appointmentTime: {
        type: String,
        enum: ['10:30 AM', '11:30 AM', '12:30 PM', '2:00 PM', '3:00 PM', '3:30 PM', '4:30 PM', '5:30 PM'],
        required: true
    },
    status: { type: String, enum: ['pending', 'rejected', 'approved'], default: 'pending' },
    prescription: { type: String, default: '' },
    centreNumber: { type: Number },
    centreId : { type: mongoose.Schema.Types.ObjectId, ref: 'Centre' },
    previousMedicalReports: [{ type: String }],
    consultationType: {
        type: String,
        enum: [
            'New Consultation',
            'Assessment(IQ)',
            'For IB board Assessment(IQ)'
        ],
        required: true
    },
    childConcerns: {
        type: String
    },
    referredBy: {
        type: String,
    },
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
}, { timestamps: true });

module.exports = mongoose.model('Appointment', AppointmentSchema);