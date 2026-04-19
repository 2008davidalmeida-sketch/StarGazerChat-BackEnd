/*
This file contains tests for the users search endpoint.
It tests searching for users by username, ensuring passwords are excluded,
and that authentication is required.
*/

import { test, after } from 'node:test';
import assert from 'node:assert';
import mongoose from 'mongoose';
import User from '../models/user.js';
import 'dotenv/config';

// Connect to MongoDB before running tests
await mongoose.connect(process.env.MONGO_URI);

// Register two test users so there is data to search for

await fetch('http://localhost:3000/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'testuser_ua', password: '123456' })
});

 await fetch('http://localhost:3000/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'testuser_ub', password: '123456' })
});

// Small delay to ensure both registrations are committed before login
await new Promise(resolve => setTimeout(resolve, 300));

// Login as user A to get an auth token
const loginA = await fetch('http://localhost:3000/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'testuser_ua', password: '123456' })
});
const { token } = await loginA.json();

// Test: search results include other users but not the authenticated user themselves
test('search users - returns results excluding self', async () => {
    const response = await fetch('http://localhost:3000/users/search?q=testuser_u', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();

    assert.strictEqual(response.status, 200);
    assert.ok(Array.isArray(data));

    // Check that the response contains the other user but not the authenticated user
    const usernames = data.map(u => u.username);
    assert.ok(usernames.includes('testuser_ub'));
    assert.ok(!usernames.includes('testuser_ua'));
});

// Test: password field should never be returned in search results
test('search users - no password field in results', async () => {
    const response = await fetch('http://localhost:3000/users/search?q=testuser_ub', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();

    assert.strictEqual(response.status, 200);
    assert.ok(data.length > 0);
    assert.strictEqual(data[0].password, undefined);
});

// Test: missing the `q` query param should return a 400 error
test('search users - missing query param returns 400', async () => {
    const response = await fetch('http://localhost:3000/users/search', {
        headers: { 'Authorization': `Bearer ${token}` }
    });

    assert.strictEqual(response.status, 400);
});

// Test: unauthenticated search requests are rejected with a 401
test('search users - unauthenticated returns 401', async () => {
    const response = await fetch('http://localhost:3000/users/search?q=test');

    assert.strictEqual(response.status, 401);
});

// Cleanup: delete both test users and disconnect from MongoDB after all tests
after(async () => {
    await User.deleteOne({ username: 'testuser_ua' });
    await User.deleteOne({ username: 'testuser_ub' });
    await mongoose.disconnect();
});