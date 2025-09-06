const express = require('express');
const router = express.Router();
const SavedSearch = require('../Models/SavedSearch');
const { authenticateToken } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// GET /api/saved-searches - Get user's saved searches
router.get('/saved-searches', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.user;
        
        const savedSearches = await SavedSearch.find({ userId })
            .sort({ createdAt: -1 });
            
        res.status(200).json({ savedSearches });
    } catch (error) {
        console.error('Error fetching saved searches:', error);
        res.status(500).json({ message: 'Error fetching saved searches', error: error.message });
    }
});

// POST /api/saved-searches - Save a new search
router.post('/saved-searches', 
    authenticateToken,
    [
        body('name').trim().isLength({ min: 1, max: 50 }).withMessage('Name is required and cannot exceed 50 characters'),
        body('query').isObject().withMessage('Query must be an object'),
        body('query.searchTerm').optional().isString(),
        body('query.category').optional().isString(),
        body('query.location').optional().isObject(),
        body('notificationsEnabled').optional().isBoolean()
    ],
    async (req, res) => {
        // Validation
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { userId } = req.user;
            const { name, query, notificationsEnabled = false } = req.body;
            
            const savedSearch = new SavedSearch({
                userId,
                name,
                query,
                notificationsEnabled
            });
            
            await savedSearch.save();
            
            res.status(201).json({ 
                message: 'Search saved successfully',
                savedSearch
            });
        } catch (error) {
            console.error('Error saving search:', error);
            res.status(500).json({ message: 'Error saving search', error: error.message });
        }
    }
);

// PUT /api/saved-searches/:id - Update a saved search
router.put('/saved-searches/:id', 
    authenticateToken,
    [
        body('name').optional().trim().isLength({ min: 1, max: 50 }).withMessage('Name cannot exceed 50 characters'),
        body('query').optional().isObject().withMessage('Query must be an object'),
        body('notificationsEnabled').optional().isBoolean()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { id } = req.params;
            const { userId } = req.user;
            const { name, query, notificationsEnabled } = req.body;
            
            // Find and verify ownership
            const savedSearch = await SavedSearch.findById(id);
            if (!savedSearch) {
                return res.status(404).json({ message: 'Saved search not found' });
            }
            
            if (savedSearch.userId !== userId) {
                return res.status(403).json({ message: 'Not authorized to modify this saved search' });
            }
            
            // Update fields
            if (name) savedSearch.name = name;
            if (query) savedSearch.query = query;
            if (notificationsEnabled !== undefined) savedSearch.notificationsEnabled = notificationsEnabled;
            
            await savedSearch.save();
            
            res.status(200).json({
                message: 'Saved search updated',
                savedSearch
            });
        } catch (error) {
            console.error('Error updating saved search:', error);
            res.status(500).json({ message: 'Error updating saved search', error: error.message });
        }
    }
);

// DELETE /api/saved-searches/:id - Delete a saved search
router.delete('/saved-searches/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.user;
        
        // Find and verify ownership
        const savedSearch = await SavedSearch.findById(id);
        if (!savedSearch) {
            return res.status(404).json({ message: 'Saved search not found' });
        }
        
        if (savedSearch.userId !== userId) {
            return res.status(403).json({ message: 'Not authorized to delete this saved search' });
        }
        
        await SavedSearch.findByIdAndDelete(id);
        
        res.status(200).json({ message: 'Saved search deleted' });
    } catch (error) {
        console.error('Error deleting saved search:', error);
        res.status(500).json({ message: 'Error deleting saved search', error: error.message });
    }
});

module.exports = router;
