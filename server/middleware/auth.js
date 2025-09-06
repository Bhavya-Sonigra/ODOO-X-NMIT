const jwt = require('jsonwebtoken');
const User = require('../Models/Users');

// Generate JWT token
const generateToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET || 'your-secret-key-here',
        { expiresIn: '7d' }
    );
};

// Verify JWT token middleware
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({ message: 'Access token required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-here');
        
        // Verify user still exists
        const user = await User.findOne({ userId: decoded.userId }).select('-password');
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        req.user = user;
        req.userId = decoded.userId;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired' });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid token' });
        }
        return res.status(500).json({ message: 'Token verification failed' });
    }
};

// Optional authentication (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-here');
            const user = await User.findOne({ userId: decoded.userId }).select('-password');
            if (user) {
                req.user = user;
                req.userId = decoded.userId;
            }
        }
        next();
    } catch (error) {
        // Continue without authentication
        next();
    }
};

// Owner verification middleware
const verifyOwnership = (Model, idField = 'productId') => {
    return async (req, res, next) => {
        try {
            const itemId = req.params.id || req.params.productId;
            const query = {};
            query[idField] = itemId;
            
            const item = await Model.findOne(query);
            if (!item) {
                return res.status(404).json({ message: 'Item not found' });
            }

            if (item.userId !== req.userId) {
                return res.status(403).json({ message: 'Access denied: You can only modify your own items' });
            }

            req.item = item;
            next();
        } catch (error) {
            return res.status(500).json({ message: 'Ownership verification failed', error: error.message });
        }
    };
};

module.exports = {
    generateToken,
    authenticateToken,
    optionalAuth,
    verifyOwnership
};
