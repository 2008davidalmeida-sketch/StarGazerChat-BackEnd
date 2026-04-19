/*
This file defines the routes for fetching users in the chat application.
It uses an authentication middleware to ensure that only authenticated users can
access the users.  
It also handles searching for users by username and excluding the authenticated
user from the results.
It also handles error cases such as missing query parameters and server errors.
*/

import express from 'express';
import User from '../models/user.js';
import { authMiddleware } from '../middleware/middleware.js';
import bcrypt from 'bcrypt';

// Initialize the router
const router = express.Router();

// Search users route
router.get('/search', authMiddleware, async (req, res) => {
    const query = req.query.q?.trim();

    // Validate input
    if (!query) return res.status(400).json({ message: 'Query parameter q is required' });

    try {
        // Find users by username
        const users = await User.find({
            username: { $regex: query, $options: 'i' },
            _id: { $ne: req.user.id }
        }).select('-password');

        // Send the users
        res.json(users);
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: 'Server error' });
    }
});

// Get current user route
router.get('/me', authMiddleware, async (req, res) => {
    try {
        // Get current user
        const user = await User.findById(req.user.id).select('-password');
        
        // Check if user exists
        if (!user) return res.status(404).json({ message: 'User not found' });
        // Send the user
        res.json(user);
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: 'Server error' });
    }
});

// Update current user's profile route
router.patch('/me', authMiddleware, async (req, res) => {
    try {
        const { username, bio } = req.body;

        // Check if username already exists
        if (username) {
            const existing = await User.findOne({ username });

            // Check if username already exists and is not the current user
            if (existing && existing._id.toString() !== req.user.id) {
                return res.status(400).json({ message: 'Username already taken' });
            }
        }

        // Get current user
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Update username if provided
        if (username) user.username = username;
        
        // Update bio if provided
        if (bio !== undefined) user.bio = bio;

        // Save the user
        await user.save();

        // Remove password from response
        const { password, ...updatedUser } = user.toObject();
        
        // Send the updated user
        res.json(updatedUser);

    } catch (err) {
        console.log(err)
        res.status(500).json({ message: 'Server error' });
    }
});

// Update current user's password route
router.patch('/password', authMiddleware, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        // Get current user
        const user = await User.findById(req.user.id);
        
        // Check if user exists
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Check if current password is correct
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect' });

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        
        // Save the user
        await user.save();

        // Send the response
        res.json({ message: 'Password updated successfully' });

    } catch (err) {
        console.log(err)
        res.status(500).json({ message: 'Server error' });
    }
});



export default router;