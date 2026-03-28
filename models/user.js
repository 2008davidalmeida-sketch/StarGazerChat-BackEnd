import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    status: { type: String, enum: ["online", "offline"], default: "offline" }
}, { timestamps: true });

export default mongoose.model('User', userSchema);