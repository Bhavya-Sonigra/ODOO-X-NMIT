import React, { useState, useEffect } from 'react';
import { useOrders } from '../contexts/OrdersContext';
import './orders.css';

const Orders = () => {
    const { orders, loading, fetchOrders } = useOrders();
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    };

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'pending': return '#ffc107';
            case 'confirmed': return '#17a2b8';
            case 'shipped': return '#007bff';
            case 'delivered': return '#28a745';
            case 'cancelled': return '#dc3545';
            default: return '#6c757d';
        }
    };

    const OrderDetail = ({ order, onClose }) => (
        <div className="order-detail-overlay">
            <div className="order-detail-container">
                <div className="order-detail-header">
                    <h2>Order Details</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>
                <div className="order-detail-content">
                    <div className="order-info">
                        <div className="order-info-section">
                            <h3>Order Information</h3>
                            <p><strong>Order ID:</strong> {order._id}</p>
                            <p><strong>Date:</strong> {formatDate(order.createdAt)}</p>
                            <p><strong>Status:</strong> 
                                <span 
                                    className="status-badge"
                                    style={{ backgroundColor: getStatusColor(order.status) }}
                                >
                                    {order.status}
                                </span>
                            </p>
                            <p><strong>Total Amount:</strong> ₹{order.totalAmount.toFixed(2)}</p>
                        </div>

                        <div className="order-info-section">
                            <h3>Shipping Address</h3>
                            <p>{order.shippingAddress.street}</p>
                            <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                            {order.shippingAddress.zipCode && <p>{order.shippingAddress.zipCode}</p>}
                            {order.shippingAddress.country && <p>{order.shippingAddress.country}</p>}
                        </div>

                        {order.notes && (
                            <div className="order-info-section">
                                <h3>Notes</h3>
                                <p>{order.notes}</p>
                            </div>
                        )}
                    </div>

                    <div className="order-items">
                        <h3>Order Items</h3>
                        {order.items.map((item, index) => (
                            <div key={index} className="order-item">
                                <div className="order-item-image">
                                    <img 
                                        src={item.imageSnapshot || '/default-product.png'} 
                                        alt={item.titleSnapshot}
                                        onError={(e) => {
                                            e.target.src = '/default-product.png';
                                        }}
                                    />
                                </div>
                                <div className="order-item-details">
                                    <h4>{item.titleSnapshot}</h4>
                                    <p>Price: ₹{item.priceSnapshot}</p>
                                    <p>Quantity: {item.quantity}</p>
                                    <p>Subtotal: ₹{(item.priceSnapshot * item.quantity).toFixed(2)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="orders-container">
                <div className="orders-loading">Loading orders...</div>
            </div>
        );
    }

    return (
        <div className="orders-container">
            <div className="orders-header">
                <h1>My Orders</h1>
            </div>

            {orders.length === 0 ? (
                <div className="no-orders">
                    <h3>No orders found</h3>
                    <p>You haven't placed any orders yet.</p>
                </div>
            ) : (
                <div className="orders-list">
                    {orders.map(order => (
                        <div key={order._id} className="order-card">
                            <div className="order-card-header">
                                <div className="order-id">
                                    <strong>Order #{order._id.slice(-8)}</strong>
                                </div>
                                <div className="order-date">
                                    {formatDate(order.createdAt)}
                                </div>
                                <div 
                                    className="order-status"
                                    style={{ backgroundColor: getStatusColor(order.status) }}
                                >
                                    {order.status}
                                </div>
                            </div>

                            <div className="order-card-content">
                                <div className="order-items-preview">
                                    {order.items.slice(0, 3).map((item, index) => (
                                        <div key={index} className="order-item-preview">
                                            <img 
                                                src={item.imageSnapshot || '/default-product.png'} 
                                                alt={item.titleSnapshot}
                                                onError={(e) => {
                                                    e.target.src = '/default-product.png';
                                                }}
                                            />
                                            <div className="item-preview-details">
                                                <span className="item-title">{item.titleSnapshot}</span>
                                                <span className="item-quantity">Qty: {item.quantity}</span>
                                            </div>
                                        </div>
                                    ))}
                                    {order.items.length > 3 && (
                                        <div className="more-items">
                                            +{order.items.length - 3} more items
                                        </div>
                                    )}
                                </div>

                                <div className="order-card-footer">
                                    <div className="order-total">
                                        <strong>Total: ₹{order.totalAmount.toFixed(2)}</strong>
                                    </div>
                                    <button 
                                        className="view-details-btn"
                                        onClick={() => setSelectedOrder(order)}
                                    >
                                        View Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {selectedOrder && (
                <OrderDetail 
                    order={selectedOrder} 
                    onClose={() => setSelectedOrder(null)} 
                />
            )}
        </div>
    );
};

export default Orders;
