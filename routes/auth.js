/*
This file contains the routes for user authentication, including registration and login.
It uses bcrypt for password hashing and jsonwebtoken for token generation. 
The routes handle user input validation, check for existing users, and return appropriate responses 
based on the success or failure of the operations.
*/

import { Router } from 'express';
import User from '../models/user.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const router = Router();

router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: 'Please enter all fields' });
        }

        if (username.length > 15) {
            return res.status(400).json({ message: 'Username must be less than 15 characters' });
        }

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = new User({
            username : username,
            password : hashedPassword,

        });
        await user.save();
        res.send('User created sucessfuly');
        
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(400).json({ message: 'User does not exist'});
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: 'Incorrect password'});
        }

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({ token });

    } catch (err) {
        console.log(err)
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;