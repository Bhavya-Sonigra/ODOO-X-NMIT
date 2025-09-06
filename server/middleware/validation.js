const { body, param, query, validationResult } = require('express-validator');
const Product = require('../Models/product');

// Generic validation error handler
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            message: 'Validation failed',
            errors: errors.array()
        });
    }
    next();
};

// User registration validation
const validateUserRegistration = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters'),
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    body('phoneNumber')
        .optional()
        .isMobilePhone()
        .withMessage('Please provide a valid phone number'),
    handleValidationErrors
];

// User login validation
const validateUserLogin = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    body('password')
        .notEmpty()
        .withMessage('Password is required'),
    handleValidationErrors
];

// Product validation
const validateProduct = [
    body('title')
        .trim()
        .isLength({ min: 3, max: 100 })
        .withMessage('Title must be between 3 and 100 characters'),
    body('description')
        .trim()
        .isLength({ min: 10, max: 1000 })
        .withMessage('Description must be between 10 and 1000 characters'),
    body('price')
        .isFloat({ min: 0.01 })
        .withMessage('Price must be a positive number'),
    body('category')
        .custom((value) => {
            const validCategories = Product.getCategories();
            if (!validCategories.includes(value)) {
                throw new Error(`Category must be one of: ${validCategories.join(', ')}`);
            }
            return true;
        }),
    body('brand')
        .optional()
        .trim()
        .isLength({ max: 50 })
        .withMessage('Brand must not exceed 50 characters'),
    body('location')
        .notEmpty()
        .withMessage('Location is required'),
    body('lat')
        .isFloat({ min: -90, max: 90 })
        .withMessage('Latitude must be between -90 and 90'),
    body('lon')
        .isFloat({ min: -180, max: 180 })
        .withMessage('Longitude must be between -180 and 180'),
    handleValidationErrors
];

// Cart item validation
const validateCartItem = [
    body('productId')
        .notEmpty()
        .withMessage('Product ID is required'),
    body('quantity')
        .optional()
        .isInt({ min: 1, max: 10 })
        .withMessage('Quantity must be between 1 and 10'),
    handleValidationErrors
];

// Order validation
const validateOrder = [
    body('shippingAddress')
        .trim()
        .isLength({ min: 10, max: 200 })
        .withMessage('Shipping address must be between 10 and 200 characters'),
    body('paymentMethod')
        .isIn(['credit_card', 'debit_card', 'paypal', 'cash_on_delivery'])
        .withMessage('Invalid payment method'),
    body('notes')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Notes must not exceed 500 characters'),
    handleValidationErrors
];

// User profile validation
const validateUserProfile = [
    body('username')
        .optional()
        .trim()
        .isLength({ min: 3, max: 30 })
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username must be 3-30 characters and contain only letters, numbers, and underscores'),
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters'),
    body('email')
        .optional()
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    body('phoneNumber')
        .optional()
        .isMobilePhone()
        .withMessage('Please provide a valid phone number'),
    body('address')
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage('Address must not exceed 200 characters'),
    body('city')
        .optional()
        .trim()
        .isLength({ max: 50 })
        .withMessage('City must not exceed 50 characters'),
    body('state')
        .optional()
        .trim()
        .isLength({ max: 50 })
        .withMessage('State must not exceed 50 characters'),
    body('zipCode')
        .optional()
        .trim()
        .isPostalCode('any')
        .withMessage('Please provide a valid zip code'),
    handleValidationErrors
];

// Search validation
const validateSearch = [
    query('query')
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Search query must be between 1 and 100 characters'),
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 50 })
        .withMessage('Limit must be between 1 and 50'),
    handleValidationErrors
];

// Pagination validation
const validatePagination = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 50 })
        .withMessage('Limit must be between 1 and 50'),
    handleValidationErrors
];

// File upload validation
const validateFileUpload = (req, res, next) => {
    if (req.file) {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        const maxSize = 5 * 1024 * 1024; // 5MB

        if (!allowedTypes.includes(req.file.mimetype)) {
            return res.status(400).json({
                message: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'
            });
        }

        if (req.file.size > maxSize) {
            return res.status(400).json({
                message: 'File too large. Maximum size is 5MB.'
            });
        }
    }
    next();
};

// Sanitize input to prevent XSS
const sanitizeInput = (req, res, next) => {
    const sanitizeValue = (value) => {
        if (typeof value === 'string') {
            return value.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                       .replace(/javascript:/gi, '')
                       .replace(/on\w+\s*=/gi, '');
        }
        return value;
    };

    const sanitizeObject = (obj) => {
        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
                if (typeof obj[key] === 'object' && obj[key] !== null) {
                    sanitizeObject(obj[key]);
                } else {
                    obj[key] = sanitizeValue(obj[key]);
                }
            }
        }
    };

    sanitizeObject(req.body);
    sanitizeObject(req.query);
    sanitizeObject(req.params);

    next();
};

module.exports = {
    handleValidationErrors,
    validateUserRegistration,
    validateUserLogin,
    validateProduct,
    validateCartItem,
    validateOrder,
    validateUserProfile,
    validateSearch,
    validatePagination,
    validateFileUpload,
    sanitizeInput
};
