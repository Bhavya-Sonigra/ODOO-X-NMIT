const express = require('express');
const router = express.Router();
const Product = require('../Models/product');
const User = require('../Models/Users');
const { optionalAuth } = require('../middleware/auth');
const path = require('path');

// Helper to convert stored image paths to public URLs
const normalizeImages = (images, userId, req) => {
  if (!Array.isArray(images)) return [];
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  return images.map((img) => {
    if (!img) return img;
    // Already absolute URL
    if (/^https?:\/\//i.test(img)) return img;
    // Starts with /files
    if (img.startsWith('/files/')) return `${baseUrl}${img}`;
    // Windows absolute path -> use file name
    const fileName = path.basename(img);
    return `${baseUrl}/files/${userId}/${fileName}`;
  });
};

router.get('/product-item/:productId', optionalAuth, async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findOne({ productId });

    if (product) {
      const user = await User.findOne({ userId: product.userId });

      if (user) {
        const productWithUserDetails = {
          ...product.toObject(),
          images: normalizeImages(product.images, product.userId, req),
          user: {
            name: user.name,
            email: user.email,
            profile:user.profile,
            phoneNumber:user.phoneNumber
          }
        };

        res.status(200).json(productWithUserDetails);
      } else {
        res.status(404).json({ message: 'User not found for this product' });
      }
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
