
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const merchantEarnSettingsSchema = new Schema({
    direct_referral: { type: Number, default: 0 },
    lvl2: { type: Number, default: 0 },
    lvl3: { type: Number, default: 0 },
    lvl4: { type: Number, default: 0 },
    lvl5: { type: Number, default: 0 },
}, { toJSON: { virtuals: true } });

export default mongoose.model('merchant_earn_settings', merchantEarnSettingsSchema);
