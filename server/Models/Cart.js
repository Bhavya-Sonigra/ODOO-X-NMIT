const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
    productId: {
        type: String,
        required: true
    },
    titleSnapshot: {
        type: String,
        required: true
    },
    priceSnapshot: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        default: 1,
        min: 1
    }
}, { _id: true });

const cartSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true
    },
    items: [cartItemSchema],
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { 
    timestamps: true,
    collection: 'carts'
});

// Update the updatedAt field on save
cartSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

const Cart = mongoose.model('Cart', cartSchema);
module.exports = Cart;
