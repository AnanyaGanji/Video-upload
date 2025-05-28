const mongoose = require('mongoose');

const ChildSchema = new mongoose.Schema({
    name: { type: String, required: true },
    dob: { type: Date, required: true },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Others'],
        required: true
    },
    schoolName: {
        type: String,
        required: false
    },
    schoolBoard: {
        type: String,
        enum: ['CBSE', 'SSC', 'ICSE', 'Camebridge (IB)', 'NIOS', 'Others', ``],
        required: false
    },
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User',default : null },
    therapistId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default : null },
    // centreNumber : { type : Number, required : true },
    centreId : { type : mongoose.Schema.Types.ObjectId, ref : 'Centre', required : true },
    IEPs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'IEP' }],
    prescriptionReports: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PrescriptionReport' }],
    appointments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' }],
    admitStatus: { type: String, enum: ['active', 'inactive', 'pending'], default: 'pending' },
    gameReports: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Game' }],
}, { timestamps: true });

module.exports = mongoose.model('Child', ChildSchema);