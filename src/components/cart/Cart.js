import React, { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import { useOrders } from '../contexts/OrdersContext';
import './cart.css';

const Cart = ({ onClose }) => {
    const { cart, itemCount, totalAmount, loading, removeFromCart, updateCartItem, clearCart } = useCart();
    const { createOrder } = useOrders();
    const [showCheckout, setShowCheckout] = useState(false);
    const [shippingAddress, setShippingAddress] = useState({
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: ''
    });
    const [notes, setNotes] = useState('');
    const [processingOrder, setProcessingOrder] = useState(false);

    const handleQuantityChange = async (itemId, newQuantity) => {
        if (newQuantity < 1) {
            await removeFromCart(itemId);
        } else {
            await updateCartItem(itemId, newQuantity);
        }
    };

    const handleRemoveItem = async (itemId) => {
        await removeFromCart(itemId);
    };

    const handleClearCart = async () => {
        if (window.confirm('Are you sure you want to clear your cart?')) {
            await clearCart();
        }
    };

    const handleCheckout = async () => {
        if (!shippingAddress.street || !shippingAddress.city || !shippingAddress.state) {
            alert('Please fill in all required shipping address fields');
            return;
        }

        setProcessingOrder(true);
        try {
            const orderData = {
                shippingAddress,
                paymentMethod: 'pending',
                notes
            };

            const result = await createOrder(orderData);
            if (result.success) {
                alert('Order placed successfully!');
                setShowCheckout(false);
                onClose();
            } else {
                alert(result.message || 'Failed to place order');
            }
        } catch (error) {
            alert('Error placing order: ' + error.message);
        } finally {
            setProcessingOrder(false);
        }
    };

    if (loading) {
        return (
            <div className="cart-overlay">
                <div className="cart-container">
                    <div className="cart-header">
                        <h2>Shopping Cart</h2>
                        <button className="close-btn" onClick={onClose}>×</button>
                    </div>
                    <div className="cart-loading">Loading...</div>
                </div>
            </div>
        );
    }

    if (showCheckout) {
        return (
            <div className="cart-overlay">
                <div className="cart-container checkout-container">
                    <div className="cart-header">
                        <h2>Checkout</h2>
                        <button className="close-btn" onClick={() => setShowCheckout(false)}>←</button>
                    </div>
                    <div className="checkout-content">
                        <div className="order-summary">
                            <h3>Order Summary</h3>
                            {cart.items?.map(item => (
                                <div key={item._id} className="checkout-item">
                                    <span>{item.titleSnapshot}</span>
                                    <span>Qty: {item.quantity}</span>
                                    <span>₹{(item.priceSnapshot * item.quantity).toFixed(2)}</span>
                                </div>
                            ))}
                            <div className="checkout-total">
                                <strong>Total: ₹{totalAmount.toFixed(2)}</strong>
                            </div>
                        </div>

                        <div className="shipping-form">
                            <h3>Shipping Address</h3>
                            <input
                                type="text"
                                placeholder="Street Address *"
                                value={shippingAddress.street}
                                onChange={(e) => setShippingAddress({...shippingAddress, street: e.target.value})}
                                required
                            />
                            <input
                                type="text"
                                placeholder="City *"
                                value={shippingAddress.city}
                                onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
                                required
                            />
                            <input
                                type="text"
                                placeholder="State *"
                                value={shippingAddress.state}
                                onChange={(e) => setShippingAddress({...shippingAddress, state: e.target.value})}
                                required
                            />
                            <input
                                type="text"
                                placeholder="ZIP Code"
                                value={shippingAddress.zipCode}
                                onChange={(e) => setShippingAddress({...shippingAddress, zipCode: e.target.value})}
                            />
                            <input
                                type="text"
                                placeholder="Country"
                                value={shippingAddress.country}
                                onChange={(e) => setShippingAddress({...shippingAddress, country: e.target.value})}
                            />
                            <textarea
                                placeholder="Order notes (optional)"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows="3"
                            />
                        </div>

                        <div className="checkout-actions">
                            <button 
                                className="place-order-btn"
                                onClick={handleCheckout}
                                disabled={processingOrder}
                            >
                                {processingOrder ? 'Processing...' : 'Place Order'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="cart-overlay">
            <div className="cart-container">
                <div className="cart-header">
                    <h2>Shopping Cart ({itemCount} items)</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="cart-content">
                    {cart.items?.length === 0 ? (
                        <div className="empty-cart">
                            <p>Your cart is empty</p>
                            <button className="continue-shopping-btn" onClick={onClose}>
                                Continue Shopping
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="cart-items">
                                {cart.items?.map(item => (
                                    <div key={item._id} className="cart-item">
                                        <div className="item-image">
                                            <img 
                                                src={item.imageSnapshot || '/default-product.png'} 
                                                alt={item.titleSnapshot}
                                                onError={(e) => {
                                                    e.target.src = '/default-product.png';
                                                }}
                                            />
                                        </div>
                                        <div className="item-details">
                                            <h4>{item.titleSnapshot}</h4>
                                            <p className="item-price">₹{item.priceSnapshot}</p>
                                        </div>
                                        <div className="item-quantity">
                                            <button 
                                                onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                                                className="quantity-btn"
                                            >
                                                -
                                            </button>
                                            <span className="quantity">{item.quantity}</span>
                                            <button 
                                                onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                                                className="quantity-btn"
                                            >
                                                +
                                            </button>
                                        </div>
                                        <div className="item-total">
                                            ₹{(item.priceSnapshot * item.quantity).toFixed(2)}
                                        </div>
                                        <button 
                                            className="remove-btn"
                                            onClick={() => handleRemoveItem(item._id)}
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="cart-footer">
                                <div className="cart-total">
                                    <h3>Total: ₹{totalAmount.toFixed(2)}</h3>
                                </div>
                                <div className="cart-actions">
                                    <button 
                                        className="clear-cart-btn"
                                        onClick={handleClearCart}
                                    >
                                        Clear Cart
                                    </button>
                                    <button 
                                        className="checkout-btn"
                                        onClick={() => setShowCheckout(true)}
                                    >
                                        Proceed to Checkout
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Cart;
