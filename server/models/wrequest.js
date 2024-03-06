
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const wRequestSchema = new Schema({
    member_id: { type: Schema.Types.ObjectId, ref: 'member', default: null },
    paymethod_id: { type: Schema.Types.ObjectId, ref: 'paymethod', default: null },
    transtime: { type: Date, default: null},
    transdate: { type: Date, default: null},
    recipient: { type: 'String', default: '' },
    mobileno: { type: 'String', default: '' },
    bankname: { type: 'String', default: '' },
    branch: { type: 'String', default: '' },
    accountno: { type: 'String', default: '' },
    accountname: { type: 'String', default: '' },
    amount: Number,
    status: Number,
    ptype: Number
}, { toJSON: { virtuals: true } });

wRequestSchema.virtual('value').get(function () {
    return this._id;
})
wRequestSchema.virtual('label').get(function () {
    return this.recipient;
})

export default mongoose.model('wrequest', wRequestSchema);
