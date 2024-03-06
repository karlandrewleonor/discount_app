
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const adminUserSchema = new Schema({
    username: { type: 'String'},
    pwd: { type: 'String'},
    fullname: { type: 'String'},
    emailadd: { type: 'String'},
    isAdmin: Number,
    
    // PERMISSION

    hasDashboard: Boolean,
    hasEarly: Boolean,

    hasMembers: Boolean,
    hasMInfo: Boolean,
    hasMCPassword: Boolean,
    hasAutoReferral: Boolean,
    hasPromote: Boolean,
    hasSetFS: Boolean,
    hasSetCD: Boolean,
    hasSetPaid: Boolean,

    hasEarnings: Boolean,
    hasForVerification: Boolean,
    hasStores: Boolean,
    hasProducts: Boolean,
    hasGenealogy: Boolean,
    hasCoupons: Boolean,

    hasWalletReloading: Boolean,
    hasWRApprove: Boolean,
    hasWRCancel: Boolean,

    hasSaleReceipt: Boolean,
    hasExpenses: Boolean,
    hasSettings: Boolean,
    hasSGeneral: Boolean,
    hasSCategory: Boolean,
    hasSServiceCategory: Boolean,
    hasSTelco: Boolean,
    hasSTelcoStarpay: Boolean,
    hasSBillers: Boolean,
    hasSIndustry: Boolean,
    hasSBanks: Boolean,
    hasSHubPm: Boolean,
    hasSValidID: Boolean,
    hasSDPolicy: Boolean,
    hasSCashServices: Boolean,
    hasSExpCategory: Boolean,

    hasAdminUser: Boolean

}, {toJSON: { virtuals: true }});

export default mongoose.model('adminuser', adminUserSchema);
