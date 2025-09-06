const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const Product = require('../Models/product'); 
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { validateProduct } = require('../middleware/ecofindValidation');
const { uploadToCloudinary, getPlaceholderImage } = require('../utils/imageUtils');


const BASE_URL = 'http://localhost:5000/files'; 

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
      // Upload images to Cloudinary
      const uploadPromises = req.files.map(file => 
        uploadToCloudinary(file.path, `users-products/${userId}`)
      );
      
      // If no files uploaded, use a placeholder
      let cloudinaryResults = [];
      try {
        cloudinaryResults = await Promise.all(uploadPromises);
      } catch (uploadError) {
        console.error('Error uploading to Cloudinary:', uploadError);
        // If upload fails, use placeholders
        cloudinaryResults = [{
          url: getPlaceholderImage('product', category),
          publicId: null
        }];
      }
      
      // Extract image URLs and public IDs
      const images = cloudinaryResults.map(result => result.url);
      const imagePublicIds = cloudinaryResults.map(result => result.publicId);
      
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
