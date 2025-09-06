const express = require('express');
const router = express.Router();
const Product = require('../Models/product');
const { optionalAuth } = require('../middleware/auth');

// GET /api/categories - Get predefined category list
router.get('/categories', optionalAuth, async (req, res) => {
    try {
        const categories = Product.getCategories();
        
        // Get product counts per category (optional)
        const { includeCounts } = req.query;
        
        if (includeCounts === 'true') {
            const categoryCounts = await Promise.all(
                categories.map(async (category) => {
                    const count = await Product.countDocuments({ 
                        category,
                        'productStatus.isSold': false // Only count available products
                    });
                    return { name: category, count };
                })
            );
            
            res.status(200).json({
                categories: categoryCounts,
                total: categoryCounts.reduce((sum, cat) => sum + cat.count, 0)
            });
        } else {
            res.status(200).json({ categories });
        }
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ message: 'Error fetching categories', error: error.message });
    }
});

// GET /api/categories/:category/products - Get products by category
router.get('/categories/:category/products', optionalAuth, async (req, res) => {
    try {
        const { category } = req.params;
        const { page = 1, limit = 20, lat, lng, distance = 10000 } = req.query;

        // Validate category
        const validCategories = Product.getCategories();
        if (!validCategories.includes(category)) {
            return res.status(400).json({ 
                message: 'Invalid category',
                validCategories 
            });
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        // Build query
        let query = {
            category,
            'productStatus.isSold': false
        };

        // Add location filter if coordinates provided
        if (lat && lng) {
            query.location = {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [parseFloat(lng), parseFloat(lat)]
                    },
                    $maxDistance: parseInt(distance)
                }
            };
        }

        const products = await Product.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const totalProducts = await Product.countDocuments({
            category,
            'productStatus.isSold': false
        });

        const totalPages = Math.ceil(totalProducts / parseInt(limit));

        res.status(200).json({
            products,
            category,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalProducts,
                hasNext: page < totalPages,
                hasPrev: page > 1
            }
        });
    } catch (error) {
        console.error('Error fetching products by category:', error);
        res.status(500).json({ message: 'Error fetching products by category', error: error.message });
    }
});

module.exports = router;
