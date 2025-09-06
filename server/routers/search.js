const express = require('express');
const router = express.Router();
const Product = require('../Models/product');

// Search route - title-only matching for precise search
router.get('/search', async (req, res) => {
  const { query: searchQuery, category, lat, lng, distance = 10000, page = 1, limit = 20 } = req.query;

  if (!searchQuery) {
    return res.status(400).json({ message: 'Query parameter is required' });
  }

  try {
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build search criteria - title-only for precise matching
    let searchCriteria = {
      title: { $regex: searchQuery, $options: 'i' },
      'productStatus.isSold': false // Only show available products
    };

    // Add category filter if provided
    if (category) {
      searchCriteria.category = category;
    }

    // Add location filter if coordinates provided
    if (lat && lng) {
      searchCriteria.location = {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseInt(distance)
        }
      };
    }

    const results = await Product.find(searchCriteria)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalResults = await Product.countDocuments(searchCriteria);
    const totalPages = Math.ceil(totalResults / parseInt(limit));

    res.json({
      results,
      searchQuery,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalResults,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      filters: {
        category: category || null,
        location: (lat && lng) ? { lat: parseFloat(lat), lng: parseFloat(lng), distance: parseInt(distance) } : null
      }
    });
  } catch (error) {
    console.error('Error performing search:', error);
    res.status(500).json({ message: 'Server error while searching' });
  }
});

// Broader search route for comprehensive filtering (kept for backward compatibility)
router.get('/search/broad', async (req, res) => {
  const { query: searchQuery, page = 1, limit = 20 } = req.query;

  if (!searchQuery) {
    return res.status(400).json({ message: 'Query parameter is required' });
  }

  try {
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const results = await Product.find({
      $and: [
        {
          $or: [
            { brand: { $regex: searchQuery, $options: 'i' } },
            { description: { $regex: searchQuery, $options: 'i' } },
            { category: { $regex: searchQuery, $options: 'i' } },
            { title: { $regex: searchQuery, $options: 'i' } },
            { address: { $regex: searchQuery, $options: 'i' } }
          ]
        },
        { 'productStatus.isSold': false }
      ]
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

    const totalResults = await Product.countDocuments({
      $and: [
        {
          $or: [
            { brand: { $regex: searchQuery, $options: 'i' } },
            { description: { $regex: searchQuery, $options: 'i' } },
            { category: { $regex: searchQuery, $options: 'i' } },
            { title: { $regex: searchQuery, $options: 'i' } },
            { address: { $regex: searchQuery, $options: 'i' } }
          ]
        },
        { 'productStatus.isSold': false }
      ]
    });

    const totalPages = Math.ceil(totalResults / parseInt(limit));

    res.json({
      results,
      searchQuery,
      searchType: 'broad',
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalResults,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error performing broad search:', error);
    res.status(500).json({ message: 'Server error while searching' });
  }
});

module.exports = router;
