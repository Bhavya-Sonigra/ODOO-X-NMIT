const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    googleId: {
        type: String,
    },
    name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        unique: true,
        sparse: true // Allows null values while maintaining uniqueness for non-null values
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phoneNumber: {
        type: String,
    },
    userId: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
    },
    profile: {
        type: String
    },
    avatar: {
        type: String,
        default: null // Avatar placeholder support
    },
    avatarPublicId: {
        type: String,
        default: null // Cloudinary public ID for avatar
    },
    contactFields: {
        address: {
            type: String
        },
        city: {
            type: String
        },
        state: {
            type: String
        },
        zipCode: {
            type: String
        }
    },
    blockedUsers: [{ 
        type: String,
        required: true
    }]
    
}, { timestamps: true });

const User = mongoose.model('User', userSchema, 'auth');
module.exports = User;
