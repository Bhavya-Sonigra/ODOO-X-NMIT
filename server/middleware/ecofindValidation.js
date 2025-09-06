const { body, param } = require('express-validator');
const { handleValidationErrors } = require('./validation');

// Cart validation rules
const validateCartItem = [
    body('userId').notEmpty().withMessage('User ID is required'),
    body('productId').notEmpty().withMessage('Product ID is required'),
    body('quantity')
        .optional()
        .isInt({ min: 1, max: 10 })
        .withMessage('Quantity must be between 1 and 10'),
    handleValidationErrors
];

// Order validation rules
const validateOrderCreate = [
    body('userId').notEmpty().withMessage('User ID is required'),
    body('shippingAddress')
        .notEmpty()
        .isString()
        .isLength({ min: 5, max: 200 })
        .withMessage('Shipping address must be between 5 and 200 characters'),
    body('paymentMethod')
        .optional()
        .isIn(['credit_card', 'debit_card', 'paypal', 'cash_on_delivery', 'pending'])
        .withMessage('Invalid payment method'),
    body('notes')
        .optional()
        .isString()
        .isLength({ max: 500 })
        .withMessage('Notes cannot exceed 500 characters'),
    handleValidationErrors
];

// Payment validation rules
const validatePayment = [
    body('userId').notEmpty().withMessage('User ID is required'),
    body('paymentMethod')
        .optional()
        .isIn(['credit_card', 'debit_card', 'paypal', 'cash_on_delivery'])
        .withMessage('Invalid payment method'),
    handleValidationErrors
];

// Saved search validation rules
const validateSavedSearch = [
    body('name')
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('Name is required and cannot exceed 50 characters'),
    body('query').isObject().withMessage('Query must be an object'),
    body('query.searchTerm').optional().isString(),
    body('query.category').optional().isString(),
    body('notificationsEnabled').optional().isBoolean(),
    handleValidationErrors
];

// Favorite seller validation rules
const validateFavoriteSeller = [
    body('sellerId').notEmpty().withMessage('Seller ID is required'),
    body('notes')
        .optional()
        .isString()
        .isLength({ max: 200 })
        .withMessage('Notes cannot exceed 200 characters'),
    handleValidationErrors
];

// User profile validation rules
const validateUserProfile = [
    body('userId').notEmpty().withMessage('User ID is required'),
    body('name')
        .optional()
        .isString()
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters'),
    body('username')
        .optional()
        .isString()
        .isLength({ min: 3, max: 30 })
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username must be between 3 and 30 characters and can only contain letters, numbers, and underscores'),
    body('email')
        .optional()
        .isEmail()
        .withMessage('Invalid email format'),
    body('phoneNumber')
        .optional()
        .isString()
        .isLength({ min: 10, max: 15 })
        .withMessage('Phone number must be between 10 and 15 characters'),
    body('address')
        .optional()
        .isString()
        .isLength({ max: 100 })
        .withMessage('Address cannot exceed 100 characters'),
    body('city')
        .optional()
        .isString()
        .isLength({ max: 50 })
        .withMessage('City cannot exceed 50 characters'),
    body('state')
        .optional()
        .isString()
        .isLength({ max: 50 })
        .withMessage('State cannot exceed 50 characters'),
    body('zipCode')
        .optional()
        .isString()
        .isLength({ max: 10 })
        .withMessage('Zip code cannot exceed 10 characters'),
    handleValidationErrors
];

// Product validation rules
const validateProduct = [
    body('title')
        .notEmpty()
        .isString()
        .isLength({ min: 3, max: 100 })
        .withMessage('Title must be between 3 and 100 characters'),
    body('description')
        .notEmpty()
        .isString()
        .isLength({ min: 10, max: 1000 })
        .withMessage('Description must be between 10 and 1000 characters'),
    body('price')
        .notEmpty()
        .isNumeric()
        .withMessage('Price must be a number'),
    body('category')
        .notEmpty()
        .isString()
        .withMessage('Category is required'),
    handleValidationErrors
];

module.exports = {
    validateCartItem,
    validateOrderCreate,
    validatePayment,
    validateSavedSearch,
    validateFavoriteSeller,
    validateUserProfile,
    validateProduct
};
