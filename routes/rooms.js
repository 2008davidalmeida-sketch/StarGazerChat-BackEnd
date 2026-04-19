/*
This file contains the routes for managing chat rooms.
It handles fetching all rooms the user is a member of and creating new rooms.
It uses an authentication middleware to ensure that only authenticated users can
access the rooms. It also handles creating new rooms and populating them with
user data. It prevents users from creating rooms with themselves and prevents
creating duplicate rooms. It also handles error cases such as user not found
and server errors.
*/

import express from 'express';
import Room from '../models/room.js';
import User from '../models/user.js';
import Message from '../models/message.js';
import { authMiddleware } from '../middleware/middleware.js';
import mongoose from 'mongoose';

// Initialize the router
const router = express.Router();

// Get all rooms route
router.get('/', authMiddleware, async (req, res) => {
    try {
        // Get all rooms the user is a member of
        const rooms = await Room.find({ members: new mongoose.Types.ObjectId(req.user.id) })
            .populate('members', '-password');
            
        // Get the last message and unread count for each room
        const roomsWithLastMessage = await Promise.all(
            
            // Map over each room
            rooms.map(async (room) => {
                // Get the last message
                const lastMessage = await Message.findOne({ room: room._id })
                    .sort({ createdAt: -1 })
                    .populate('sender', '-password');
                
                // Get the last seen message
                const lastSeen = room.lastSeen.get(req.user.id);
                
                // Get the unread messages count
                const unreadCount = await Message.countDocuments({
                    room: room._id,
                    sender: { $ne: req.user.id },
                    ...(lastSeen && { createdAt: { $gt: lastSeen } })
                });
                
                // Return the room with the last message and unread count
                return { ...room.toObject(), lastMessage, lastSeen, unreadCount };
            })
        );

        // Send the rooms
        res.json(roomsWithLastMessage);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Create room route
router.post('/', authMiddleware, async (req, res) => {
    const { targetUsername } = req.body;

    // Validate input
    if (!targetUsername) return res.status(400).json({ message: 'targetUsername is required' });

    try {
        // Get the target user
        const targetUser = await User.findOne({ username: targetUsername });
        
        // Check if the target user exists
        if (!targetUser) return res.status(404).json({ message: 'User not found' });

        // Check if the target user is the same as the current user
        if (targetUser._id.toString() === req.user.id) {
            return res.status(400).json({ message: 'Cannot create a room with yourself' });
        }
        
        // Check if the room already exists
        const existingRoom = await Room.findOne({
            members: { $all: [req.user.id, targetUser._id], $size: 2 }
        }).populate('members', '-password');

        // If the room exists, return it
        if (existingRoom) return res.json(existingRoom);

        // Create new room
        const room = new Room({
            name: `${req.user.id}-${targetUser._id}`,
            members: [req.user.id, targetUser._id]
        });

        // Save the new room
        await room.save();

        // Populate the room with user data
        const populated = await room.populate('members', '-password');

        // Get the socket instance
        const io = req.app.get('io');
        const otherMemberId = populated.members
            .find(m => m._id.toString() !== req.user.id)?._id.toString();
        
        // Emit new room event to the other member
        if (otherMemberId) io.to(otherMemberId).emit('newRoom', populated);

        // Send the new room
        res.status(201).json(populated);

    } catch (err) {
        console.log(err)
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete room route
router.delete('/:roomId', authMiddleware, async (req, res) => {
    try {
        // Get the room
        const room = await Room.findById(req.params.roomId);

        // Check if the room exists
        if (!room) return res.status(404).json({ message: 'Room not found' });

        // Check if the user is a member of the room
        const isMember = room.members.some(m => m.toString() === req.user.id);
        if (!isMember) return res.status(403).json({ message: 'Not a member of this room' });

        // Delete the room
        await Room.deleteOne({ _id: room._id });
        
        // Delete all messages in the room
        await Message.deleteMany({ room: room._id });

        // Get the socket instance
        const io = req.app.get('io');
        // Emit room deleted event to all members
        room.members.forEach(memberId => {
            io.to(memberId.toString()).emit('roomDeleted', { roomId: room._id });
        });

        // Send the response
        res.json({ message: 'Room deleted' });

    } catch (err) {
        console.log(err)
        res.status(500).json({ message: 'Server error' });
    }
});

// Update last seen route
router.patch('/:roomId/lastSeen', authMiddleware, async (req, res) => {
    try {
        // Get the room
        const room = await Room.findById(req.params.roomId);

        // Check if the room exists
        if (!room) return res.status(404).json({ message: 'Room not found' });

        // Check if the user is a member of the room
        const isMember = room.members.some(m => m.toString() === req.user.id);
        if (!isMember) return res.status(403).json({ message: 'Not a member of this room' });

        // Update the last seen
        room.lastSeen.set(req.user.id, new Date());
        await room.save();

        // Send the response
        res.json({ message: 'Last seen updated' });

    } catch (err) {
        console.log(err)
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;