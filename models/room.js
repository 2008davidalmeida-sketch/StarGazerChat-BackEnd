/*
This file defines the Mongoose schema and model for the Room collection in the MongoDB database. 
It includes fields for the room name, members (users), and an optional password for private rooms. 
Timestamps are included for record creation and updates.
The model is exported for use in other parts of the application.
*/

import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
    name: { type: String, required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    password: { type: String, required: false },
    lastSeen: { type: Map, of: Date, default: {} }
}, { timestamps: true });

export default mongoose.model('Room', roomSchema);