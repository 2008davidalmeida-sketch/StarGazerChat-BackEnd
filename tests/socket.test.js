/*
This file contains tests for the WebSocket (Socket.IO) functionality of the chat application.
It tests that a socket connection can be established with a valid JWT token, and that
sending a message via socket correctly persists it in the database.
After the tests are completed, it cleans up by deleting test data and disconnecting from MongoDB.
*/

import { test, after } from 'node:test';
import assert from 'node:assert';
import { io } from 'socket.io-client';
import mongoose from 'mongoose';
import 'dotenv/config'
import Message from '../models/message.js';
import Room from '../models/room.js';

// Connect to MongoDB before running tests
await mongoose.connect(process.env.MONGO_URI);

// Login to get a valid JWT token for socket authentication
const loginResponse = await fetch('http://localhost:3000/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'testuser_msg', password: '123456' })
});
const { token } = await loginResponse.json();

// Create a test room to send messages into
const roomResponse = await fetch('http://localhost:3000/rooms', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ targetUsername: 'testuser_msg2' })
});
const room = await roomResponse.json();
console.log('room:', room);
const roomId = room._id;
console.log('roomId:', roomId);

// Test: verify socket connects successfully with a valid token
test('IO connection', (t, done) => {
    const socket = io('http://localhost:3000', {
        auth: { token }
    });

    socket.on('connect', () => {
        socket.disconnect();
        done();
    });

    socket.on('connect_error', (err) => {
        done(err);
    });
});

// Test: send a message via socket and confirm it is saved to the database
test('send a message', async () => {
    const socket = io('http://localhost:3000', { auth: { token } });

    await new Promise(resolve => socket.on('connect', resolve));

    await new Promise(resolve => {
        socket.emit('joinRoom', roomId);
        setTimeout(resolve, 200);
    });

    // Send a message via socket and confirm it is saved to the database
    socket.emit('sendMessage', { roomId, content: 'test message' });

    // Wait for the message to be saved to the database
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check that the message was saved to the database
    const message = await Message.findOne({ content: 'test message' });
    assert.ok(message);

    // Cleanup: delete the test message and disconnect from MongoDB after all tests
    await Message.deleteOne({ content: 'test message' });
    socket.disconnect();
});
// Cleanup: delete the test room and disconnect from MongoDB after all tests
after(async () => {
    await Room.deleteOne({ _id: roomId });
    await mongoose.disconnect();
});