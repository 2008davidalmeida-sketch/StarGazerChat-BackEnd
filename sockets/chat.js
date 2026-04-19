/*
This file handles the WebSocket connections and events for the chat application.
It uses jsonwebtoken for authentication and mongoose for database operations.
It handles user connections, disconnections, and message sending.
*/

import Message from '../models/message.js';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';

// Initialize socket
export function initSocket(io) {
    // Authenticate socket connection
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;

        // Verify token
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) return next(new Error('Authentication error'));
        
            // Attach user to socket
            socket.user = decoded;
            next();
        });
    });
   
    // Handle new connection
    io.on('connection', async (socket) => {
        try {
            // Join user's personal room
            socket.join(socket.user.id);
            console.log(`User ${socket.user.id} joined their personal room`);
            
            // Update user status
            await User.findByIdAndUpdate(socket.user.id, { status: "online" });
            
            // Emit user status to all users
            socket.broadcast.emit('userStatus', { userId: socket.user.id, status: 'online' });
            console.log('User connected:', socket.id);
        } catch (error) {
            console.error('Error updating user status:', error);
        }

        // Handle join room event
        socket.on('joinRoom', (roomId) => {
            socket.join(roomId);
            console.log(`User ${socket.id} joined room ${roomId}`);
        });

        // Handle send message event
        socket.on('sendMessage', async (data) => {
            try {
                const { roomId, content } = data;
                
                // Validate message data
                if (!roomId || !content) return;

                // Create new message
                const message = new Message({ sender: socket.user.id, content, room: roomId });
                
                // Save message
                await message.save();
                
                // Emit new message to room
                io.to(roomId).emit('newMessage', message);

            } catch (error) {
                console.error('Error sending message:', error);
            }
        });

        // Handle disconnect event
        socket.on('disconnect', async () => {
            try {
                // Update user status
                await User.findByIdAndUpdate(socket.user.id, { status: "offline" });
                
                // Emit user status to all users
                io.emit('userStatus', { userId: socket.user.id, status: 'offline' });
                console.log('User disconnected:', socket.id);
            } catch (error) {
                console.error('Error updating user status:', error);
            }
        });
    });
}