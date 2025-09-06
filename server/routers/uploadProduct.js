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
    const userId = req.body.userId;
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
    const {category, brand, title, description, date, price, userId, location, lat, lon } = req.body;
    
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
      
      const product = new Product({
        category,
        brand,
        title,
        description,
        date,
        price,
        images,
        imagePublicIds, // Store public IDs for future deletion if needed
        userId,
        address: location, 
        location: {
            type: 'Point',
            coordinates: [parseFloat(lon), parseFloat(lat)] 
        }
    });
  
      await product.save();
  
      res.status(201).json({ message: 'Posted successfully!', product });
    } catch (error) {
      res.status(500).json({ message: 'Error uploading product', error });
      console.log(error);
    }
});

module.exports = router;
