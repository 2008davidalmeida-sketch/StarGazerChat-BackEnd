/*
This file contains tests for the authentication routes of the chat application.
It tests the registration and login functionality by sending HTTP requests to the
respective endpoints. After the tests are completed, it cleans up by deleting the
test user from the database and disconnecting from MongoDB.
*/

import { test, after } from 'node:test';
import assert from 'node:assert';
import User from '../models/user.js';
import mongoose from 'mongoose';
import 'dotenv/config'

// Connect to MongoDB before running tests
await mongoose.connect(process.env.MONGO_URI);

// Test: register a new user and expect a 200 response
test('register a new user', async () => {
    const response = await fetch('http://localhost:3000/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: `testuser`, password: '123456' })
    });

    assert.strictEqual(response.status, 200);
});

// Test: login with the registered user and check a token is returned
test('login a user', async () => {
    const response = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'testuser', password: '123456' })
    });
    const data = await response.json();
    assert.ok(data.token);

    assert.strictEqual(response.status, 200);
});

// Cleanup: delete the test user and disconnect from MongoDB after all tests
after(async () => {
    await User.deleteOne({ username: 'testuser' });
    await mongoose.disconnect();
});