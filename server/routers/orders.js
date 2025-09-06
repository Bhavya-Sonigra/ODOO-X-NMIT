const express = require('express');
const router = express.Router();
const Order = require('../Models/Order');
const Cart = require('../Models/Cart');
const Product = require('../Models/product');
const { authenticateToken } = require('../middleware/auth');
const { validateOrderCreate, validatePayment } = require('../middleware/ecofindValidation');

// POST /api/orders - Create order from current cart (simple checkout without payment processing)
router.post('/orders', authenticateToken, validateOrderCreate, async (req, res) => {
    try {
        const { userId, shippingAddress, paymentMethod = 'pending', notes } = req.body;

        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        // Get user's cart
        const cart = await Cart.findOne({ userId });
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }

        // Verify all products are still available
        const productIds = cart.items.map(item => item.productId);
        const products = await Product.find({ productId: { $in: productIds } });
        
        // Check for unavailable products
        const unavailableItems = [];
        for (const item of cart.items) {
            const product = products.find(p => p.productId === item.productId);
            if (!product) {
                unavailableItems.push({
                    productId: item.productId,
                    title: item.titleSnapshot,
                    reason: 'Product not found'
                });
                continue;
            }
            if (product.productStatus.isSold) {
                unavailableItems.push({
                    productId: item.productId,
                    title: item.titleSnapshot,
                    reason: 'Product already sold'
                });
            }
        }
        
        if (unavailableItems.length > 0) {
            return res.status(400).json({
                message: 'Some items in your cart are no longer available',
                unavailableItems
            });
        }

        // Calculate totals
        const subtotal = cart.items.reduce((total, item) => 
            total + (parseFloat(item.priceSnapshot) * item.quantity), 0
        );
        const tax = subtotal * 0.1; // 10% tax
        const shipping = subtotal > 100 ? 0 : 10; // Free shipping over $100
        const total = subtotal + tax + shipping;

        // Create order (simple checkout stub for hackathon scope)
        const order = new Order({
            userId,
            lineItems: cart.items.map(item => ({
                productId: item.productId,
                titleSnapshot: item.titleSnapshot,
                priceSnapshot: item.priceSnapshot,
                quantity: item.quantity
            })),
            totals: {
                subtotal: parseFloat(subtotal.toFixed(2)),
                tax: parseFloat(tax.toFixed(2)),
                shipping: parseFloat(shipping.toFixed(2)),
                total: parseFloat(total.toFixed(2))
            },
            shippingAddress,
            paymentMethod,
            notes,
            status: 'pending' // Order starts as pending until payment is processed
        });

        await order.save();

        // Mark products as reserved (not sold yet - will be marked sold after payment)
        // This is a simple checkout stub, so we'll just mark them as sold for now
        await Product.updateMany(
            { productId: { $in: productIds } },
            { $set: { 'productStatus.isSold': true } }
        );

        // Clear cart
        await Cart.findOneAndUpdate(
            { userId },
            { items: [], updatedAt: new Date() }
        );

        // For a real checkout, we would:
        // 1. Create a payment intent with Stripe or other payment processor
        // 2. Return checkout session ID to the client
        // 3. Mark products as reserved (not sold yet)
        // 4. Only mark products as sold after successful payment

        res.status(201).json({
            message: 'Order created successfully (payment simulation for hackathon)',
            order,
            checkoutInfo: {
                // Placeholder for real payment integration
                paymentRequired: true,
                paymentStub: true,
                orderId: order.orderId,
                amount: total,
                currency: 'USD'
            }
        });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ message: 'Error creating order', error: error.message });
    }
});

// GET /api/orders - Get user's order history
router.get('/orders', authenticateToken, async (req, res) => {
    try {
        const { userId, page = 1, limit = 10 } = req.query;

        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const orders = await Order.find({ userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const totalOrders = await Order.countDocuments({ userId });
        const totalPages = Math.ceil(totalOrders / parseInt(limit));

        res.status(200).json({
            orders,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalOrders,
                hasNext: page < totalPages,
                hasPrev: page > 1
            }
        });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'Error fetching orders', error: error.message });
    }
});

// GET /api/orders/:id - Get order details
router.get('/orders/:id', authenticateToken, async (req, res) => {
    try {
        const { id: orderId } = req.params;
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        const order = await Order.findOne({ orderId, userId });
        
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.status(200).json({ order });
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({ message: 'Error fetching order', error: error.message });
    }
});

// POST /api/orders/:id/payment - Simulate payment for an order (hackathon version)
router.post('/orders/:id/payment', authenticateToken, validatePayment, async (req, res) => {
    try {
        const { id: orderId } = req.params;
        const { userId, paymentMethod = 'credit_card' } = req.body;

        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        const order = await Order.findOne({ orderId, userId });
        
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Check if order is already paid
        if (order.status !== 'pending') {
            return res.status(400).json({ message: `Order is already ${order.status}` });
        }

        // Simple payment simulation - always succeeds
        // In a real app, we would integrate with a payment processor
        
        // Update order status
        order.status = 'confirmed';
        order.paymentMethod = paymentMethod;
        
        await order.save();

        // In a real app, we would mark products as sold only after payment confirmation
        
        res.status(200).json({ 
            message: 'Payment successful',
            order,
            paymentConfirmation: {
                paymentId: `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                amount: order.totals.total,
                status: 'succeeded',
                method: paymentMethod,
                timestamp: new Date()
            }
        });
    } catch (error) {
        console.error('Error processing payment:', error);
        res.status(500).json({ message: 'Error processing payment', error: error.message });
    }
});

// PATCH /api/orders/:id/status - Update order status (for admin/seller use)
router.patch('/orders/:id/status', authenticateToken, async (req, res) => {
    try {
        const { id: orderId } = req.params;
        const { status, userId } = req.body;

        const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ 
                message: 'Invalid status. Valid statuses are: ' + validStatuses.join(', ') 
            });
        }

        const order = await Order.findOneAndUpdate(
            { orderId },
            { status },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.status(200).json({
            message: 'Order status updated',
            order
        });
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ message: 'Error updating order status', error: error.message });
    }
});

module.exports = router;
