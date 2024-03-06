
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const productSchema = new Schema({
    member_id: { type: Schema.Types.ObjectId, ref: 'member', default: null },
    product_name: { type: "String", default: "" },
    price: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    discounted_price: { type: Number, default: 0 },
    photo_thumb: { type: "String", default: "" }
});

export default mongoose.model('product', productSchema);
