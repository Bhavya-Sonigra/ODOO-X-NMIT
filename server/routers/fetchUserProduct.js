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

router.get('/user-post', async (req, res) => {
    const { userId } = req.query;
    const query = userId ? { userId: { $regex: new RegExp(userId, 'i') } } : {};
    try {
        const products = await Product.find(query).sort({ createdAt: -1 });
        const withNormalized = products.map(p => ({
            ...p.toObject(),
            images: normalizeImages(p.images, p.userId, req),
        }));
        return res.status(200).json(withNormalized);
    } catch (err) {
        return res.status(500).json({ message: 'Failed to fetch products', error: err.message });
    }
});

module.exports = router;
