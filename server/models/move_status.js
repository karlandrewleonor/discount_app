
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const moveStatusSchema = new Schema({
    member_id: { type: Schema.Types.ObjectId, ref: 'member' },
    transtype: { type: Number },
    status: Number,
    transaction_id: Number
});

export default mongoose.model('move_status', moveStatusSchema);

// transtype
// 0 - pay
// 1 - transfer
// 2 - enchash