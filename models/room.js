import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
    name: { type: String, required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    password: { type: String, required: false },
}, { timestamps: true });

export default mongoose.model('Room', roomSchema);