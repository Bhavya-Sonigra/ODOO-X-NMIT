const express = require('express');
const router = express.Router();
const Product = require('../Models/product'); 
const path = require('path');

const normalizeImages = (images, userId, req) => {
    if (!Array.isArray(images)) return [];
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    return images.map((img) => {
        if (!img) return img;
        if (/^https?:\/\//i.test(img)) return img;
        if (img.startsWith('/files/')) return `${baseUrl}${img}`;
        const fileName = path.basename(img);
        return `${baseUrl}/files/${userId}/${fileName}`;
    });
};

router.get('/related-product-items/nearby?', async (req, res) => {
    const { lat, lng, category } = req.query; 


    let query = {};

    if (lat && lng) {
        query.location = {
            $near: {
                $geometry: {
                    type: "Point",
                    coordinates: [parseFloat(lng), parseFloat(lat)] 
                },
                $maxDistance: 10000 
            }
        };
    }

    if (category) {
        query.category = { $regex: new RegExp(category, 'i') }; 
    }
  
    try {
      
        const relatedProductItems = await Product.find(query).sort({ createdAt: -1 });
        const withNormalized = relatedProductItems.map(p => ({
            ...p.toObject(),
            images: normalizeImages(p.images, p.userId, req),
        }));
        res.status(200).json(withNormalized);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
