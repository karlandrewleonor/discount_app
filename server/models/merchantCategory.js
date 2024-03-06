
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const merchantCategorySchema = new Schema({
    category_name: { type: "String", default: "" }
}, { toJSON: { virtuals: true } });

merchantCategorySchema.virtual('value').get(function () {
    return this._id;
})
merchantCategorySchema.virtual('label').get(function () {
    return this.category_name;
})
export default mongoose.model('merchant_category', merchantCategorySchema);
