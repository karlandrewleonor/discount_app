
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const merchantRequestSchema = new Schema({
    store_name: { type: "String", default: "" },
    sponsorid: { type: Schema.Types.ObjectId, ref: 'member', default: null },
    category_id: { type: Schema.Types.ObjectId, ref: 'merchant_category', default: null },
    contact_number: { type: "String", default: "" },
    email_address: { type: "String", default: "" },
    address: { type: "String", default: "" },
    photo_thumb: { type: "String", default: "" },
    status: { type: Number, default: 0 },
    date_requested: { type: Date, default: null },
    req_status: Number, // 0 - admin | 1 superadmin
});

export default mongoose.model('merchant_request', merchantRequestSchema);
