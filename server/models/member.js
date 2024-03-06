
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const memberSchema = new Schema({
    user_id: { type: "String", default: "" },
    fname: { type: 'String' },
    lname: { type: 'String' },
    fullname: { type: 'String' },
    mobileno: { type: 'String' },
    emailadd: { type: 'String' },
    pin: { type: 'String' },
    referral_code: { type: 'String' },
    isReferral: Boolean,
    sponsorid: { type: Schema.Types.ObjectId, ref: 'member', default: null },
    status: Number,
    photo_thumb: { type: 'String' },
    isFirstLogin: Boolean,
    isSuperAdmin: Boolean,
    pwd: { type: 'String' },
    plainpwd: { type: 'String', default: '' },
    birthdate: { type: Date, default: null },
    date_subscribed: { type: Date, default: null },
    account_type: { type: Number, default: 0 },
    reg_type: { type: Number, default: 0 },
    //merchant user fields
    store_name: { type: 'String', default: '' },
    address: { type: 'String', default: '' },
    category_id: { type: Schema.Types.ObjectId, ref: 'merchant_category', default: null },
    // permission
    hasMListEdit: Boolean,
	hasMListPromote: Boolean,
    hasMerchantReq: Boolean,
    hasMemberReq: Boolean,
	hasPayoutReq: Boolean,
    hasPApproved: Boolean,
    hasPReject: Boolean,
	hasChangeReq: Boolean,
	hasAdminList: Boolean,
    hasAdminDashboard: Boolean,
    hasEarnSettings: Boolean,
    hasMerchantEdit: Boolean,
    hasPaymethod: Boolean,
    // for checking if user has change request
    checkRequest: Boolean
}, { toJSON: { virtuals: true } });

memberSchema.virtual('value').get(function () {
    return this._id;
})
memberSchema.virtual('label').get(function () {
    return this.fullname;
})

//account_type -> 0=Member 1=Merchant

export default mongoose.model('member', memberSchema);
