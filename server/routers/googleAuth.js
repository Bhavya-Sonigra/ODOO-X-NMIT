const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const User = require('../Models/Users.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
const salt = 10;

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateRandomString = (length) => {
    const chars = 'abcefghikmnstuvwxyz0123456789';
    let randomString = '';
    for (let i = 0; i < length; i++) {
        randomString += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return randomString;
};

// Google OAuth Login
router.post('/google-login', async (req, res) => {
    const { tokenId } = req.body;
    
    try {
        // Verify the Google token
        const ticket = await client.verifyIdToken({
            idToken: tokenId,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        
        const payload = ticket.getPayload();
        const { sub: googleId, email, name, picture } = payload;
        
        // Check if user exists
        let user = await User.findOne({ email });
        
        if (user) {
            // User exists, update Google ID if not set
            if (!user.googleId) {
                const hashedGoogleId = await bcrypt.hash(googleId, salt);
                await User.updateOne(
                    { userId: user.userId },
                    { $set: { googleId: hashedGoogleId } }
                );
                user.googleId = hashedGoogleId;
            }
            
            // Return user data without password
            const userInfo = {
                ...user.toObject(),
            };
            delete userInfo.password;
            
            // Generate JWT token
            const token = jwt.sign(
                { userId: user._id, email: user.email },
                process.env.JWT_SECRET || 'your-secret-key-here',
                { expiresIn: '24h' }
            );
            
            res.status(200).json({ 
                msg: 'Login successful', 
                success: true, 
                userData: userInfo,
                token: token
            });
        } else {
            res.status(404).json({ 
                msg: 'User not found. Please register first.', 
                success: false 
            });
        }
    } catch (error) {
        console.error('Google login error:', error);
        res.status(400).json({ 
            msg: 'Google authentication failed', 
            success: false,
            error: error.message 
        });
    }
});

// Google OAuth Registration
router.post('/google-register', async (req, res) => {
    const { tokenId, phoneNumber } = req.body;
    
    try {
        // Verify the Google token
        const ticket = await client.verifyIdToken({
            idToken: tokenId,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        
        const payload = ticket.getPayload();
        const { sub: googleId, email, name, picture } = payload;
        
        // Check if user already exists
        let existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ 
                msg: 'User already exists with this email!', 
                success: false 
            });
        }
        
        // Create new user
        const randomString = generateRandomString(8);
        const userId = `${name.toLowerCase().replace(/\s/g, '_')}_${randomString}`;
        const hashedGoogleId = await bcrypt.hash(googleId, salt);
        
        const newUser = new User({
            googleId: hashedGoogleId,
            name,
            email,
            phoneNumber: phoneNumber || '',
            userId,
            password: '', // Empty for Google users
            profile: picture || ''
        });
        
        const data = await newUser.save();
        const userData = await User.findById(data._id).select('-password');
        
        // Generate JWT token
        const token = jwt.sign(
            { userId: data._id, email: data.email },
            process.env.JWT_SECRET || 'your-secret-key-here',
            { expiresIn: '24h' }
        );
        
        res.status(201).json({ 
            msg: 'success', 
            success: true,
            userData,
            token: token
        });
    } catch (error) {
        console.error('Google registration error:', error);
        res.status(400).json({ 
            msg: 'Google registration failed', 
            success: false,
            error: error.message 
        });
    }
});

module.exports = router;
