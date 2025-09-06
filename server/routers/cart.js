const express = require('express');
const router = express.Router();
const Cart = require('../Models/Cart');
const Product = require('../Models/product');
const { authenticateToken } = require('../middleware/auth');
const { validateCartItem } = require('../middleware/ecofindValidation');

// GET /api/cart - Get user's cart
router.get('/cart', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.query;
        
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        let cart = await Cart.findOne({ userId });
        
        if (!cart) {
            // Create empty cart if none exists
            cart = new Cart({ userId, items: [] });
            await cart.save();
        }

        res.status(200).json({
            cart,
            itemCount: cart.items.reduce((total, item) => total + item.quantity, 0),
            totalAmount: cart.items.reduce((total, item) => total + (parseFloat(item.priceSnapshot) * item.quantity), 0)
        });
    } catch (error) {
        console.error('Error fetching cart:', error);
        res.status(500).json({ message: 'Error fetching cart', error: error.message });
    }
});

// POST /api/cart/items - Add item to cart
router.post('/cart/items', authenticateToken, validateCartItem, async (req, res) => {
    try {
        const { userId, productId, quantity = 1 } = req.body;

        if (!userId || !productId) {
            return res.status(400).json({ message: 'User ID and Product ID are required' });
        }

        // Get product details for snapshot
        const product = await Product.findOne({ productId });
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Check if product is already sold
        if (product.productStatus.isSold) {
            return res.status(400).json({ message: 'Product is no longer available' });
        }

        let cart = await Cart.findOne({ userId });
        
        if (!cart) {
            cart = new Cart({ userId, items: [] });
        }

        // Check if item already exists in cart
        const existingItemIndex = cart.items.findIndex(item => item.productId === productId);
        
        if (existingItemIndex > -1) {
            // Update quantity
            cart.items[existingItemIndex].quantity += quantity;
        } else {
            // Add new item with snapshot data
            cart.items.push({
                productId,
                titleSnapshot: product.title,
                priceSnapshot: product.price,
                quantity
            });
        }

        await cart.save();
        
        res.status(201).json({
            message: 'Item added to cart',
            cart,
            itemCount: cart.items.reduce((total, item) => total + item.quantity, 0)
        });
    } catch (error) {
        console.error('Error adding item to cart:', error);
        res.status(500).json({ message: 'Error adding item to cart', error: error.message });
    }
});

// PATCH /api/cart/items/:id - Update cart item quantity
router.patch('/cart/items/:id', authenticateToken, async (req, res) => {
    try {
        const { id: itemId } = req.params;
        const { userId, quantity } = req.body;

        if (!userId || quantity === undefined) {
            return res.status(400).json({ message: 'User ID and quantity are required' });
        }

        if (quantity < 1) {
            return res.status(400).json({ message: 'Quantity must be at least 1' });
        }

        const cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);
        if (itemIndex === -1) {
            return res.status(404).json({ message: 'Item not found in cart' });
        }

        cart.items[itemIndex].quantity = quantity;
        await cart.save();

        res.status(200).json({
            message: 'Cart item updated',
            cart,
            itemCount: cart.items.reduce((total, item) => total + item.quantity, 0)
        });
    } catch (error) {
        console.error('Error updating cart item:', error);
        res.status(500).json({ message: 'Error updating cart item', error: error.message });
    }
});

// DELETE /api/cart/items/:id - Remove item from cart
router.delete('/cart/items/:id', authenticateToken, async (req, res) => {
    try {
        const { id: itemId } = req.params;
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        const cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);
        if (itemIndex === -1) {
            return res.status(404).json({ message: 'Item not found in cart' });
        }

        cart.items.splice(itemIndex, 1);
        await cart.save();

        res.status(200).json({
            message: 'Item removed from cart',
            cart,
            itemCount: cart.items.reduce((total, item) => total + item.quantity, 0)
        });
    } catch (error) {
        console.error('Error removing cart item:', error);
        res.status(500).json({ message: 'Error removing cart item', error: error.message });
    }
});

// DELETE /api/cart - Clear entire cart
router.delete('/cart', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        await Cart.findOneAndUpdate(
            { userId },
            { items: [], updatedAt: new Date() },
            { upsert: true, new: true }
        );

        res.status(200).json({ message: 'Cart cleared successfully' });
    } catch (error) {
        console.error('Error clearing cart:', error);
        res.status(500).json({ message: 'Error clearing cart', error: error.message });
    }
});

module.exports = router;
