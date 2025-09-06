const express = require('express');
const router = express.Router();
const Product = require('../Models/product');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticateToken, verifyOwnership } = require('../middleware/auth');
const { validateProduct } = require('../middleware/ecofindValidation');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/imageUtils');

// Configure multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = path.join(__dirname, '../temp-uploads');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    },
});

const upload = multer({ storage: storage });

// First middleware handles auth and ownership
router.put('/update-product/:productId', authenticateToken, verifyOwnership(Product, 'productId'), (req, res, next) => {
    // Then handle file uploads
    upload.array('images', 10)(req, res, (err) => {
        if (err) {
            return res.status(400).json({ message: 'Error uploading files', error: err.message });
        }
        // Continue to validation and processing
        next();
    });
}, validateProduct, async (req, res) => {
    const { productId } = req.params;
    const { title, brand, category, price, description, removeImages } = req.body;
    const newImages = req.files || [];

    try {
        // Find the product first
        const product = await Product.findOne({ productId });
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Handle image deletion if any images were marked for removal
        let updatedImagesList = [...product.images];
        let updatedPublicIds = [...(product.imagePublicIds || [])];
        
        if (removeImages && typeof removeImages === 'string') {
            // Parse the string if it's JSON
            const imagesToRemove = JSON.parse(removeImages);
            
            if (Array.isArray(imagesToRemove) && imagesToRemove.length > 0) {
                // For each image to remove
                for (const index of imagesToRemove) {
                    if (index >= 0 && index < product.imagePublicIds.length) {
                        const publicId = product.imagePublicIds[index];
                        if (publicId) {
                            try {
                                await deleteFromCloudinary(publicId);
                            } catch (err) {
                                console.error('Error deleting image from Cloudinary:', err);
                                // Continue anyway
                            }
                        }
                    }
                }
                
                // Filter out the removed images
                updatedImagesList = product.images.filter((_, index) => 
                    !imagesToRemove.includes(index));
                updatedPublicIds = product.imagePublicIds.filter((_, index) => 
                    !imagesToRemove.includes(index));
            }
        }
        
        // Handle new image uploads
        if (newImages.length > 0) {
            const uploadPromises = newImages.map(file => 
                uploadToCloudinary(file.path, `users-products/${product.userId}`)
            );
            
            const cloudinaryResults = await Promise.all(uploadPromises);
            
            // Add new images to the arrays
            updatedImagesList = [
                ...updatedImagesList, 
                ...cloudinaryResults.map(result => result.url)
            ];
            updatedPublicIds = [
                ...updatedPublicIds, 
                ...cloudinaryResults.map(result => result.publicId)
            ];
        }
        
        // Update the product
        const updatedProduct = await Product.findOneAndUpdate(
            { productId }, 
            { 
                title, 
                brand, 
                category, 
                price, 
                description,
                images: updatedImagesList,
                imagePublicIds: updatedPublicIds
            }, 
            { new: true } // Return the updated document
        );

        if (!updatedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json({
            message: 'Product updated successfully', 
            product: updatedProduct
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
