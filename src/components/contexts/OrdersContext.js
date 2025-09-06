import React, { createContext, useContext, useReducer } from 'react';
import ApiService from '../../services/apiService';

const OrdersContext = createContext();

// Orders reducer
const ordersReducer = (state, action) => {
    switch (action.type) {
        case 'SET_LOADING':
            return { ...state, loading: action.payload };
        case 'SET_ORDERS':
            return { ...state, orders: action.payload, loading: false };
        case 'ADD_ORDER':
            return { ...state, orders: [action.payload, ...state.orders] };
        case 'UPDATE_ORDER':
            const updatedOrders = state.orders.map(order => 
                order._id === action.payload._id ? action.payload : order
            );
            return { ...state, orders: updatedOrders };
        case 'SET_ERROR':
            return { ...state, error: action.payload, loading: false };
        default:
            return state;
    }
};

const initialState = {
    orders: [],
    loading: false,
    error: null
};

export const OrdersProvider = ({ children }) => {
    const [state, dispatch] = useReducer(ordersReducer, initialState);

    // Get authentication token
    const getAuthToken = () => {
        return localStorage.getItem('token');
    };

    // Get current user ID
    const getCurrentUserId = () => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            return user.userId;
        }
        return null;
    };

    // Fetch user orders
    const fetchOrders = async () => {
        const userId = getCurrentUserId();
        if (!userId) return;

        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            const token = getAuthToken();
            const response = await fetch(ApiService.orders.getUserOrders(userId), {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                dispatch({ type: 'SET_ORDERS', payload: data.orders || [] });
            } else {
                throw new Error('Failed to fetch orders');
            }
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: error.message });
        }
    };

    // Create order
    const createOrder = async (orderData) => {
        const userId = getCurrentUserId();
        if (!userId) return;

        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            const token = getAuthToken();
            const response = await fetch(ApiService.orders.createOrder(), {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ ...orderData, userId })
            });

            if (response.ok) {
                const data = await response.json();
                dispatch({ type: 'ADD_ORDER', payload: data.order });
                return { success: true, order: data.order, message: 'Order created successfully' };
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create order');
            }
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: error.message });
            return { success: false, message: error.message };
        }
    };

    // Get single order
    const getOrder = async (orderId) => {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            const token = getAuthToken();
            const response = await fetch(ApiService.orders.getOrder(orderId), {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                dispatch({ type: 'SET_LOADING', payload: false });
                return { success: true, order: data.order };
            } else {
                throw new Error('Failed to fetch order');
            }
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: error.message });
            return { success: false, message: error.message };
        }
    };

    // Update payment status
    const updatePaymentStatus = async (orderId, paymentData) => {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            const token = getAuthToken();
            const response = await fetch(ApiService.orders.updatePayment(orderId), {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(paymentData)
            });

            if (response.ok) {
                const data = await response.json();
                dispatch({ type: 'UPDATE_ORDER', payload: data.order });
                return { success: true, order: data.order };
            } else {
                throw new Error('Failed to update payment status');
            }
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: error.message });
            return { success: false, message: error.message };
        }
    };

    const value = {
        orders: state.orders,
        loading: state.loading,
        error: state.error,
        fetchOrders,
        createOrder,
        getOrder,
        updatePaymentStatus
    };

    return (
        <OrdersContext.Provider value={value}>
            {children}
        </OrdersContext.Provider>
    );
};

export const useOrders = () => {
    const context = useContext(OrdersContext);
    if (!context) {
        throw new Error('useOrders must be used within an OrdersProvider');
    }
    return context;
};

export default OrdersContext;
