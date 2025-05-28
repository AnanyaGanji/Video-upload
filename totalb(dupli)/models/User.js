const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const userSchema = new Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true, enum: ['therapist', 'parent', 'doctor', 'admin'] },
    name: { type: String, required: true },
    mobilenumber: { type: Number, required: true },
    email: { type: String, required: true }
}, { discriminatorKey: 'role', timestamps: true });

const User = mongoose.model('User', userSchema);

const therapistSchema = new Schema({
    assignedChildren: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Child' }],
    centreId: { type: mongoose.Schema.Types.ObjectId, ref: 'Centre' }
});
const Therapist = User.discriminator('therapist', therapistSchema);

const parentSchema = new Schema({
    children: { type: [mongoose.Schema.Types.ObjectId], ref: 'Child', default: [] },
    address: {
        type: String,
        required: true
    },
    referenceId : { type : String, unique : true, required : true }
});
const Parent = User.discriminator('parent', parentSchema);

const doctorSchema = new Schema({
    patients: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Child' }],
    centreIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Centre' }]
});
const Doctor = User.discriminator('doctor', doctorSchema);

const adminSchema = new Schema({
    centreId: { type: mongoose.Schema.Types.ObjectId, ref: 'Centre' },
});
const Admin = User.discriminator('admin', adminSchema);

module.exports = { User, Therapist, Parent, Doctor, Admin };
