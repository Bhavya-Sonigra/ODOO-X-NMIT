const mongoose = require('mongoose');

const lineItemSchema = new mongoose.Schema({
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
        min: 1
    }
}, { _id: true });

const orderSchema = new mongoose.Schema({
    orderId: {
        type: String,
        default: () => `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        unique: true
    },
    userId: {
        type: String,
        required: true
    },
    lineItems: [lineItemSchema],
    totals: {
        subtotal: {
            type: Number,
            required: true
        },
        tax: {
            type: Number,
            default: 0
        },
        shipping: {
            type: Number,
            default: 0
        },
        total: {
            type: Number,
            required: true
        }
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },
    shippingAddress: {
        type: String
    },
    paymentMethod: {
        type: String
    },
    notes: {
        type: String
    }
}, { 
    timestamps: true,
    collection: 'orders'
});

// Index for faster user order queries
orderSchema.index({ userId: 1, createdAt: -1 });

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
