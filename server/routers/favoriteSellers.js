const express = require('express');
const router = express.Router();
const FavoriteSellers = require('../Models/FavoriteSellers');
const User = require('../Models/Users');
const { authenticateToken } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// GET /api/favorites/sellers - Get user's favorite sellers
router.get('/favorites/sellers', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.user;
        
        let favorites = await FavoriteSellers.findOne({ userId });
        
        if (!favorites) {
            favorites = { userId, favoriteUsers: [] };
        }
        
        // Get detailed information about each seller
        if (favorites.favoriteUsers && favorites.favoriteUsers.length > 0) {
            const sellerIds = favorites.favoriteUsers.map(favorite => favorite.sellerId);
            const sellers = await User.find({ userId: { $in: sellerIds } })
                .select('userId name username profile avatar');
                
            // Combine seller details with favorite data
            const favoritesWithDetails = favorites.favoriteUsers.map(favorite => {
                const sellerDetails = sellers.find(seller => seller.userId === favorite.sellerId);
                return {
                    ...favorite.toObject(),
                    sellerDetails: sellerDetails || null
                };
            });
            
            favorites = {
                ...favorites.toObject ? favorites.toObject() : favorites,
                favoriteUsers: favoritesWithDetails
            };
        }
            
        res.status(200).json({ favorites });
    } catch (error) {
        console.error('Error fetching favorite sellers:', error);
        res.status(500).json({ message: 'Error fetching favorite sellers', error: error.message });
    }
});

// POST /api/favorites/sellers - Add a favorite seller
router.post('/favorites/sellers',
    authenticateToken,
    [
        body('sellerId').notEmpty().withMessage('Seller ID is required'),
        body('notes').optional().isString().isLength({ max: 200 }).withMessage('Notes cannot exceed 200 characters')
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { userId } = req.user;
            const { sellerId, notes } = req.body;
            
            // Verify seller exists
            const seller = await User.findOne({ userId: sellerId });
            if (!seller) {
                return res.status(404).json({ message: 'Seller not found' });
            }
            
            // Cannot favorite yourself
            if (userId === sellerId) {
                return res.status(400).json({ message: 'Cannot add yourself as a favorite seller' });
            }
            
            // Find or create favorites document
            let favorites = await FavoriteSellers.findOne({ userId });
            
            if (!favorites) {
                favorites = new FavoriteSellers({
                    userId,
                    favoriteUsers: []
                });
            }
            
            // Check if already favorited
            const existingIndex = favorites.favoriteUsers.findIndex(
                favorite => favorite.sellerId === sellerId
            );
            
            if (existingIndex > -1) {
                return res.status(400).json({ message: 'Seller already in favorites' });
            }
            
            // Add to favorites
            favorites.favoriteUsers.push({
                sellerId,
                notes,
                addedAt: new Date()
            });
            
            await favorites.save();
            
            res.status(201).json({ 
                message: 'Seller added to favorites',
                favorites
            });
        } catch (error) {
            console.error('Error adding favorite seller:', error);
            res.status(500).json({ message: 'Error adding favorite seller', error: error.message });
        }
    }
);

// DELETE /api/favorites/sellers/:sellerId - Remove a favorite seller
router.delete('/favorites/sellers/:sellerId', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.user;
        const { sellerId } = req.params;
        
        // Find favorites
        const favorites = await FavoriteSellers.findOne({ userId });
        
        if (!favorites) {
            return res.status(404).json({ message: 'Favorites not found' });
        }
        
        // Check if seller is in favorites
        const existingIndex = favorites.favoriteUsers.findIndex(
            favorite => favorite.sellerId === sellerId
        );
        
        if (existingIndex === -1) {
            return res.status(404).json({ message: 'Seller not in favorites' });
        }
        
        // Remove from favorites
        favorites.favoriteUsers.splice(existingIndex, 1);
        
        await favorites.save();
        
        res.status(200).json({ 
            message: 'Seller removed from favorites',
            favorites
        });
    } catch (error) {
        console.error('Error removing favorite seller:', error);
        res.status(500).json({ message: 'Error removing favorite seller', error: error.message });
    }
});

// PUT /api/favorites/sellers/:sellerId/notes - Update notes for a favorite seller
router.put('/favorites/sellers/:sellerId/notes',
    authenticateToken,
    [
        body('notes').isString().isLength({ max: 200 }).withMessage('Notes cannot exceed 200 characters')
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { userId } = req.user;
            const { sellerId } = req.params;
            const { notes } = req.body;
            
            // Find favorites
            const favorites = await FavoriteSellers.findOne({ userId });
            
            if (!favorites) {
                return res.status(404).json({ message: 'Favorites not found' });
            }
            
            // Find seller in favorites
            const existingIndex = favorites.favoriteUsers.findIndex(
                favorite => favorite.sellerId === sellerId
            );
            
            if (existingIndex === -1) {
                return res.status(404).json({ message: 'Seller not in favorites' });
            }
            
            // Update notes
            favorites.favoriteUsers[existingIndex].notes = notes;
            
            await favorites.save();
            
            res.status(200).json({ 
                message: 'Notes updated',
                favorites
            });
        } catch (error) {
            console.error('Error updating favorite seller notes:', error);
            res.status(500).json({ message: 'Error updating favorite seller notes', error: error.message });
        }
    }
);

module.exports = router;
