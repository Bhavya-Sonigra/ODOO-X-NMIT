const express = require('express');
const router = express.Router();
const User = require('../Models/Users');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { validateUserProfile } = require('../middleware/ecofindValidation');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/imageUtils');

// Configure temporary storage for uploads before sending to Cloudinary
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, '../temp-uploads');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const { userId } = req.body;
        const fileExt = path.extname(file.originalname);
        cb(null, `${userId}_avatar_${Date.now()}${fileExt}`);
    }
});

const upload = multer({ storage: storage });

// GET /api/users/me - Get current user profile
router.get('/users/me', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        const user = await User.findOne({ userId }).select('-password -googleId');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ user });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Error fetching user profile', error: error.message });
    }
});

// PATCH /api/users/me - Update user profile
router.patch('/users/me', authenticateToken, upload.single('avatar'), validateUserProfile, async (req, res) => {
    try {
        const { userId, username, name, email, phoneNumber, address, city, state, zipCode } = req.body;

        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        const user = await User.findOne({ userId });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if username is taken (if provided and different from current)
        if (username && username !== user.username) {
            const existingUser = await User.findOne({ username });
            if (existingUser) {
                return res.status(400).json({ message: 'Username already taken' });
            }
            user.username = username;
        }

        // Update basic fields
        if (name) user.name = name;
        if (email && email !== user.email) {
            // Check if email is taken
            const existingEmailUser = await User.findOne({ email });
            if (existingEmailUser) {
                return res.status(400).json({ message: 'Email already in use' });
            }
            user.email = email;
        }
        if (phoneNumber) user.phoneNumber = phoneNumber;

        // Update contact fields
        if (!user.contactFields) {
            user.contactFields = {};
        }
        if (address) user.contactFields.address = address;
        if (city) user.contactFields.city = city;
        if (state) user.contactFields.state = state;
        if (zipCode) user.contactFields.zipCode = zipCode;

        // Update avatar if provided
        if (req.file) {
            try {
                // Upload to Cloudinary
                const result = await uploadToCloudinary(
                    req.file.path, 
                    `users-profiles/${userId}`
                );
                
                // Delete old avatar from Cloudinary if exists
                if (user.avatarPublicId) {
                    try {
                        await deleteFromCloudinary(user.avatarPublicId);
                    } catch (err) {
                        console.log('Could not delete old avatar from Cloudinary:', err);
                    }
                }
                
                // Update user's avatar URL and public ID
                user.avatar = result.url;
                user.avatarPublicId = result.publicId;
                
            } catch (uploadError) {
                console.error('Error uploading avatar to Cloudinary:', uploadError);
                return res.status(500).json({ 
                    message: 'Error uploading avatar', 
                    error: uploadError.message 
                });
            }
        }

        await user.save();

        // Return user without sensitive data
        const userResponse = user.toObject();
        delete userResponse.password;
        delete userResponse.googleId;

        res.status(200).json({
            message: 'Profile updated successfully',
            user: userResponse
        });
    } catch (error) {
        console.error('Error updating user profile:', error);
        if (error.code === 11000) {
            // Handle duplicate key error
            const field = Object.keys(error.keyPattern)[0];
            return res.status(400).json({ 
                message: `${field} already exists` 
            });
        }
        res.status(500).json({ message: 'Error updating user profile', error: error.message });
    }
});

// GET /api/users/profile/:userId - Get public user profile (for viewing other users)
router.get('/users/profile/:userId', optionalAuth, async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findOne({ userId })
            .select('name username avatar profile contactFields.city contactFields.state createdAt -_id');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ user });
    } catch (error) {
        console.error('Error fetching public profile:', error);
        res.status(500).json({ message: 'Error fetching public profile', error: error.message });
    }
});

// GET /api/users/check-username/:username - Check if username is available
router.get('/users/check-username/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const { currentUserId } = req.query;

        if (!username) {
            return res.status(400).json({ message: 'Username is required' });
        }

        const existingUser = await User.findOne({ username });
        
        // If username exists and it's not the current user, it's taken
        const isAvailable = !existingUser || (currentUserId && existingUser.userId === currentUserId);
        
        res.status(200).json({ 
            available: isAvailable,
            message: isAvailable ? 'Username is available' : 'Username is already taken'
        });
    } catch (error) {
        console.error('Error checking username:', error);
        res.status(500).json({ message: 'Error checking username', error: error.message });
    }
});

module.exports = router;
