/*
This file defines the Mongoose schema and model for the Message collection in the MongoDB database. 
It includes fields for the sender (user), room (chat room), and content of the message, along with 
timestamps for record creation and updates. The model is exported for use in other parts of the application, 
such as saving messages to the database and retrieving them for display in chat rooms.
*/

import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
    content: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model('Message', messageSchema);