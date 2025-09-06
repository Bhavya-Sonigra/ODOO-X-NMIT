const express = require('express');
const router = express.Router();
const Product = require('../Models/product'); 
const { authenticateToken, verifyOwnership } = require('../middleware/auth');
const { deleteFromCloudinary } = require('../utils/imageUtils');

// Route to delete a product by productId
router.delete('/product/delete-product/:productId', authenticateToken, verifyOwnership(Product, 'productId'), async (req, res) => {
    const { productId } = req.params; // Extract productId from the URL parameters

    try {
        // Find and delete the product by productId
        const deletedProduct = await Product.findOneAndDelete({ productId });

        // Check if the product was found and deleted
        if (!deletedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Delete images from Cloudinary if there are any publicIds
        if (deletedProduct.imagePublicIds && deletedProduct.imagePublicIds.length > 0) {
            try {
                const deletePromises = deletedProduct.imagePublicIds
                    .filter(id => id) // Filter out null/undefined
                    .map(publicId => deleteFromCloudinary(publicId));
                await Promise.all(deletePromises);
            } catch (cloudinaryError) {
                console.error('Error deleting images from Cloudinary:', cloudinaryError);
                // Continue with deletion even if Cloudinary delete fails
            }
        }

        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: `Error: ${error.message}` });
    }
});

module.exports = router;
