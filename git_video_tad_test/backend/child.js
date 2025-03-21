const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const childSchema = new Schema({
  name: { type: String, required: true },
  caretakerId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  caretakerName: { type: String, default: null },
  doctorId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  doctorName : {type : String, default: null},
  centreId: { type: String, required: true },
  parentDetails: { type: String, ref: 'User', required: true },
  parentId : { type: Schema.Types.ObjectId, required: true },
  age: { type: Number, required: true },
  gamesCompleted: { type: [String], default: [] },
  adminStatus: { type: Boolean, default: false },
//   videos: [
//     {
//         videoPath: { type: String, required: true },  // Local file path
//         childId: { type: mongoose.Schema.Types.ObjectId, ref: 'Child', required: true },  // Linked to a child
//         uploadedAt: { type: Date, default: Date.now },
//         description:{ type:String }
//     }
// ]
});

module.exports = mongoose.models.Child || mongoose.model('Child', childSchema);
