
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const paymethodSchema = new Schema({
    name: { type: "String", default: "" },
    ptype: Number
}, { toJSON: { virtuals: true } });

paymethodSchema.virtual('value').get(function () {
    return this._id;
})
paymethodSchema.virtual('label').get(function () {
    return this.name;
})
export default mongoose.model('paymethod', paymethodSchema);
