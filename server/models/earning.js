
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const earningSchema = new Schema({
    member_id: { type: Schema.Types.ObjectId, ref: "member", default: null },
    direct: { type: Number, default: 0 },
    indirect: { type: Number, default: 0 },
    total_sent: { type: Number, default: 0 },
    total_received: { type: Number, default: 0 },
    accumulated: { type: Number, default: 0 },
    total_withdrawal: { type: Number, default: 0 },
    balance: { type: Number, default: 0 }
});

export default mongoose.model('earning', earningSchema);
