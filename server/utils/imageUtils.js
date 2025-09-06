const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary with credentials from .env file
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Default placeholder URLs
const DEFAULT_PLACEHOLDERS = {
    product: 'https://via.placeholder.com/400x300/e0e0e0/666666?text=Product+Image',
    avatar: 'https://via.placeholder.com/150x150/e0e0e0/666666?text=User',
    category: {
        'Electronics': 'https://via.placeholder.com/400x300/3498db/ffffff?text=Electronics',
        'Books': 'https://via.placeholder.com/400x300/2ecc71/ffffff?text=Books',
        'Study Materials': 'https://via.placeholder.com/400x300/f39c12/ffffff?text=Study+Materials',
        'Furniture': 'https://via.placeholder.com/400x300/8e44ad/ffffff?text=Furniture',
        'Clothing': 'https://via.placeholder.com/400x300/e74c3c/ffffff?text=Clothing',
        'Sports Equipment': 'https://via.placeholder.com/400x300/1abc9c/ffffff?text=Sports+Equipment',
        'Kitchen Appliances': 'https://via.placeholder.com/400x300/34495e/ffffff?text=Kitchen+Appliances',
        'Home Decor': 'https://via.placeholder.com/400x300/9b59b6/ffffff?text=Home+Decor',
        'Vehicles': 'https://via.placeholder.com/400x300/e67e22/ffffff?text=Vehicles',
        'Other': 'https://via.placeholder.com/400x300/95a5a6/ffffff?text=Other'
    }
};

// Content moderation hooks (optional for hackathon scope)
const moderationHooks = {
    // Placeholder for image content moderation
    moderateImage: async (imagePath) => {
        // TODO: Integrate with image moderation service (AWS Rekognition, Google Vision, etc.)
        return { approved: true, reasons: [] };
    },

    // Placeholder for text content moderation
    moderateText: async (text) => {
        // Basic profanity filter (extend as needed)
        const profanityList = ['spam', 'scam', 'fake', 'illegal'];
        const lowerText = text.toLowerCase();
        
        const flaggedWords = profanityList.filter(word => lowerText.includes(word));
        
        return {
            approved: flaggedWords.length === 0,
            flaggedWords,
            confidence: flaggedWords.length > 0 ? 0.8 : 0.1
        };
    },

    // Placeholder for user verification
    verifyUser: async (userId) => {
        // TODO: Implement user verification logic
        return { verified: false, verificationLevel: 'basic' };
    }
};

// Get placeholder image based on type and category
const getPlaceholderImage = (type, category = null) => {
    switch (type) {
        case 'product':
            if (category && DEFAULT_PLACEHOLDERS.category[category]) {
                return DEFAULT_PLACEHOLDERS.category[category];
            }
            return DEFAULT_PLACEHOLDERS.product;
        case 'avatar':
            return DEFAULT_PLACEHOLDERS.avatar;
        default:
            return DEFAULT_PLACEHOLDERS.product;
    }
};

// Image processing and validation
const processImage = async (file, type = 'product', category = null) => {
    try {
        // Basic file validation
        if (!file) {
            return {
                success: false,
                url: getPlaceholderImage(type, category),
                isPlaceholder: true,
                message: 'No file provided, using placeholder'
            };
        }

        // File size validation (5MB max)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            return {
                success: false,
                url: getPlaceholderImage(type, category),
                isPlaceholder: true,
                message: 'File too large, using placeholder'
            };
        }

        // File type validation
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.mimetype)) {
            return {
                success: false,
                url: getPlaceholderImage(type, category),
                isPlaceholder: true,
                message: 'Invalid file type, using placeholder'
            };
        }

        // Optional: Run content moderation
        const moderation = await moderationHooks.moderateImage(file.path);
        if (!moderation.approved) {
            // Delete the uploaded file if not approved
            if (fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
            }
            return {
                success: false,
                url: getPlaceholderImage(type, category),
                isPlaceholder: true,
                message: 'Content not approved, using placeholder'
            };
        }

        // If all validations pass, return the uploaded file info
        return {
            success: true,
            url: file.filename ? `/files/${file.filename}` : file.path,
            isPlaceholder: false,
            message: 'Image uploaded successfully'
        };

    } catch (error) {
        console.error('Image processing error:', error);
        return {
            success: false,
            url: getPlaceholderImage(type, category),
            isPlaceholder: true,
            message: 'Error processing image, using placeholder'
        };
    }
};

// Generate dynamic placeholder URLs for different sizes
const generatePlaceholderUrl = (width = 400, height = 300, text = 'Image', bgColor = 'e0e0e0', textColor = '666666') => {
    return `https://via.placeholder.com/${width}x${height}/${bgColor}/${textColor}?text=${encodeURIComponent(text)}`;
};

// Ensure placeholder images for missing product images
const ensureProductImages = (product) => {
    if (!product.images || product.images.length === 0) {
        product.images = [getPlaceholderImage('product', product.category)];
    }
    return product;
};

// Ensure avatar for user profile
const ensureUserAvatar = (user) => {
    if (!user.avatar && !user.profile) {
        user.avatar = getPlaceholderImage('avatar');
    }
    return user;
};

/**
 * Upload a file to Cloudinary
 * @param {String} filePath - Local path to file
 * @param {String} folder - Cloudinary folder to upload to
 * @returns {Promise} - Promise with Cloudinary upload result
 */
const uploadToCloudinary = async (filePath, folder = 'products') => {
    try {
        // Upload the file to Cloudinary
        const result = await cloudinary.uploader.upload(filePath, {
            folder: folder,
            use_filename: true,
            unique_filename: true,
            resource_type: 'auto',
            transformation: [
                { quality: 'auto:good' }, // Automatic quality optimization
                { fetch_format: 'auto' }  // Automatic format selection
            ]
        });

        // Delete the local file after upload (optional)
        // fs.unlinkSync(filePath);
        
        return {
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format,
            resourceType: result.resource_type
        };
    } catch (error) {
        console.error('Error uploading to Cloudinary:', error);
        throw error;
    }
};

/**
 * Delete a file from Cloudinary
 * @param {String} publicId - Cloudinary public ID of the resource
 * @returns {Promise} - Promise with Cloudinary deletion result
 */
const deleteFromCloudinary = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result;
    } catch (error) {
        console.error('Error deleting from Cloudinary:', error);
        throw error;
    }
};

/**
 * Get responsive image URL for Cloudinary images
 * @param {String} imageUrl - Original Cloudinary image URL
 * @param {Object} options - Transformation options
 * @returns {String} - Transformed image URL
 */
const getCloudinaryResponsiveUrl = (imageUrl, options = {}) => {
    const {
        width = 800,
        height,
        crop = 'limit',
        quality = 'auto:good'
    } = options;

    if (!imageUrl || !imageUrl.includes('cloudinary.com')) {
        return imageUrl;
    }
    
    let transformations = `/upload/c_${crop},w_${width},q_${quality}`;
    
    if (height) {
        transformations += `,h_${height}`;
    }
    
    return imageUrl.replace('/upload/', transformations + '/');
};

module.exports = {
    DEFAULT_PLACEHOLDERS,
    moderationHooks,
    getPlaceholderImage,
    processImage,
    generatePlaceholderUrl,
    ensureProductImages,
    ensureUserAvatar,
    uploadToCloudinary,
    deleteFromCloudinary,
    getCloudinaryResponsiveUrl
};
