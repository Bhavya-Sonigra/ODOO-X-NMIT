const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const Product = require('../Models/product'); 
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { validateProduct } = require('../middleware/ecofindValidation');
const { uploadToCloudinary, getPlaceholderImage } = require('../utils/imageUtils');


// Base URL for serving local files; compute per-request to respect current host/port
const getFilesBaseUrl = (req) => `${req.protocol}://${req.get('host')}/files`;

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // First try to get userId from the authenticated user object (set by middleware)
    // Fall back to body only if middleware hasn't run yet
    const userId = req.user?.userId || req.body.userId;
    
    if (!userId) {
      return cb(new Error('User ID is required'), null);
    }
    
    const userFolderPath = path.join(__dirname, '../Users-files/users-post-files', userId);

    if (!fs.existsSync(userFolderPath)) {
      fs.mkdirSync(userFolderPath, { recursive: true });
    }

    cb(null, userFolderPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage: storage });

router.post('/upload-product', authenticateToken, upload.array('images', 10), validateProduct, async (req, res) => {
    // Use the authenticated user's ID from the token instead of trusting the body
    const userId = req.user.userId;
    const {category, brand, title, description, date, price, location, lat, lon } = req.body;
    
    try {
      // Determine if Cloudinary is configured
      const cloudinaryConfigured = Boolean(
        process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET
      );

      // Build image URLs
      let images = [];
      let imagePublicIds = [];

      if (req.files && req.files.length > 0) {
        const BASE_URL = getFilesBaseUrl(req);
        if (cloudinaryConfigured) {
          try {
            const cloudinaryResults = await Promise.all(
              req.files.map(file => uploadToCloudinary(file.path, `users-products/${userId}`))
            );
            images = cloudinaryResults.map(r => r.url);
            imagePublicIds = cloudinaryResults.map(r => r.publicId);
          } catch (err) {
            console.error('Cloudinary upload failed, falling back to local URLs:', err.message);
            images = req.files.map(file => `${BASE_URL}/${userId}/${path.basename(file.path)}`.replace(/\\/g, '/'));
            imagePublicIds = req.files.map(() => null);
          }
        } else {
          // Use local file URLs served by Express static route
          images = req.files.map(file => `${BASE_URL}/${userId}/${path.basename(file.path)}`.replace(/\\/g, '/'));
          imagePublicIds = req.files.map(() => null);
        }
      } else {
        // No files: fallback to placeholder
        images = [getPlaceholderImage('product', category)];
        imagePublicIds = [null];
      }
      
      // Create the product object
      const productData = {
        category,
        brand,
        title,
        description,
        date,
        price,
        images,
        imagePublicIds,
        userId,
        address: location, 
        location: {
            type: 'Point',
            coordinates: [parseFloat(lon), parseFloat(lat)] 
        }
      };
      
      console.log('Creating new product with data:', JSON.stringify(productData));
      
      // Create and save the product
      const product = new Product(productData);
      
      try {
        const savedProduct = await product.save();
        console.log('Product saved successfully with ID:', savedProduct._id);
        res.status(201).json({ message: 'Posted successfully!', product: savedProduct });
      } catch (saveError) {
        console.error('Error saving product to database:', saveError);
        res.status(500).json({ message: 'Database error when saving product', error: saveError.message });
      }
    } catch (error) {
      res.status(500).json({ message: 'Error uploading product', error });
      console.log(error);
    }
});

module.exports = router;
