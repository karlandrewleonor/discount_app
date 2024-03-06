
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const memberRequestSchema = new Schema({
    fname: { type: 'String' },
    lname: { type: 'String' },
    fullname: { type: 'String' },
    birthdate: { type: Date, default: null},
    mobileno: { type: 'String' },
    emailadd: { type: 'String' },
    referral_code: { type: 'String' },
    sponsorid: { type: Schema.Types.ObjectId, ref: 'member', default: null },
    status: Number,
    photo_thumb: { type: 'String' },
    proof_of_payment: { type: 'String' },
    date_requested: { type: Date, default: null},
    req_status: Number, // 0 - admin | 1 superadmin
}, { toJSON: { virtuals: true } });

memberRequestSchema.virtual('value').get(function () {
    return this._id;
})
memberRequestSchema.virtual('label').get(function () {
    return this.fullname;
})

export default mongoose.model('member_request', memberRequestSchema);
