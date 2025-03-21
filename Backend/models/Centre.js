const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const centreSchema = new Schema({
    name: { type: String, required: true },
    centreId: { type: String,ref:'Child', required: true },
    centerid:{type:Schema.Types.ObjectId,ref:'User'},
});
module.exports = mongoose.models.Centre || mongoose.model('Centre', centreSchema);