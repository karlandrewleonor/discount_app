
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const earningTransactionSchema = new Schema({
    earning_id: { type: Schema.Types.ObjectId, ref: "earning", default: null },
    transdate: { type: Date, default: null },
    transtime: { type: Date, default: null },
    earning_type: { type: Number }, // 0 - direct | 1 - indirect | 2 - withdrawal | 3 - sent | 4 - received
    amount: { type: Number, default: 0 },
    member_id: { type: Schema.Types.ObjectId, ref: "member", default: null },
    from_member_id: { type: Schema.Types.ObjectId, ref: "member", default: null }
});

export default mongoose.model('earning_transaction', earningTransactionSchema);
