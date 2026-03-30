/*
This file defines the routes for fetching messages in a specific chat room. 
It uses an authentication middleware to ensure that only authenticated users can access the messages. 
The route retrieves messages from the database based on the room ID and returns them sorted by creation time.
*/

import { Router } from 'express';
import { authMiddleware } from '../middleware/middleware.js';
import Message from '../models/message.js';

const router = Router();

router.get('/:roomId', authMiddleware, async (req, res) => {
    try {
        const roomId = req.params.roomId;
        const messages = await Message.find({ room: roomId }).sort({ createdAt: 1 });
        res.send(messages);

    } catch (err) {
        console.log(err)
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;