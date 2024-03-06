import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const otpSchema = new Schema({
    email: { type: 'String'},
    number: { type: 'String'},
    otpsecret: { type: 'String'},
    status: Number
}, {toJSON: { virtuals: true }});

export default mongoose.model('otp', otpSchema);