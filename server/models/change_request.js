
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const changeRequestSchema = new Schema({
    member_id: { type: Schema.Types.ObjectId, ref: 'member', default: null },
    fname: { type: 'String', default: "" },
    lname: { type: 'String', default: "" },
    fullname: { type: 'String', default: "" },
    birthdate: { type: Date, default: null},
    mobileno: { type: 'String', default: "" },
    emailadd: { type: 'String', default: "" },
    photo_thumb: { type: 'String', default: "" },
    date_requested: { type: Date, default: null},
    store_name: { type: 'String', default: '' },
    address: { type: 'String', default: '' },
    status: Number // 0 - For Approval | 1 - Approved | 2 - Reject | 3 - Cancelled
}, { toJSON: { virtuals: true } });

changeRequestSchema.virtual('value').get(function () {
    return this._id;
})
changeRequestSchema.virtual('label').get(function () {
    return this.fullname;
})

export default mongoose.model('change_request', changeRequestSchema);
