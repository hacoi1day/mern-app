const express = require('express');
const router = express.Router();
const argon2 = require('argon2');
const jwt = require('jsonwebtoken');

const User = require('../models/User');
const verifyToken = require('../middleware/auth');

// @route GET api/auth
// @desc Check if user is logged in
// @access Public
router.get('/', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password');
        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'User not found'
            });
        }
        return res.status(200).json({
            success: true,
            user,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
});

// @route POST api/auth/register
// @desc Register User
// @access Public
router.post('/register',  async (req, res) => {
    const { username, password } = req.body;

    // Simple validation
    if (!username || !password) {
        return res.status(400).json({
            success: false,
            message: 'Missing username and/or password',
        });
    }

    try {
        // Check for existing user
        const user = await User.findOne({
            username,
        });
        if (user) {
            return res.status(422).json({
                success: false,
                message: 'Username already taken',
            });
        }

        // All Good
        const hashedPassword = await argon2.hash(password);
        const newUser = new User({
            username,
            password: hashedPassword,
        });
        await newUser.save();

        // Return token
        const accessToken = jwt.sign({ userId: newUser._id }, process.env.ACCESS_TOKEN_SECRET);
        return res.status(200).json({
            success: true,
            message: 'Register successfully',
            accessToken,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
});

// @route POST api/auth/login
// @desc Login User
// @access Public
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    // Simple validation
    if (!username || !password) {
        return res.status(400).json({
            success: false,
            message: 'Missing username and/or password',
        });
    }

    try {
        // Check for existing user
        const user = await User.findOne({
            username
        });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Incorrect username or password'
            });
        }

        // Username found
        const passwordValid = await argon2.verify(user.password, password);
        if (!passwordValid) {
            return res.status(400).json({
                success: false,
                message: 'Incorrect username or password'
            });
        }

        const accessToken = jwt.sign({ userId: user._id }, process.env.ACCESS_TOKEN_SECRET);
        return res.status(200).json({
            success: true,
            message: 'Login successfully',
            accessToken,
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: 'Missing username and/or password',
        });
    }
});

module.exports = router;
