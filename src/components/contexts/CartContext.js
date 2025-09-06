import React, { createContext, useContext, useReducer, useEffect } from 'react';
import ApiService from '../../services/apiService';

const CartContext = createContext();

// Cart reducer
const cartReducer = (state, action) => {
    switch (action.type) {
        case 'SET_LOADING':
            return { ...state, loading: action.payload };
        case 'SET_CART':
            return { 
                ...state, 
                cart: action.payload.cart,
                itemCount: action.payload.itemCount,
                totalAmount: action.payload.totalAmount,
                loading: false 
            };
        case 'ADD_ITEM':
            return { 
                ...state, 
                cart: { 
                    ...state.cart, 
                    items: [...state.cart.items, action.payload] 
                },
                itemCount: state.itemCount + action.payload.quantity,
                totalAmount: state.totalAmount + (action.payload.priceSnapshot * action.payload.quantity)
            };
        case 'UPDATE_ITEM':
            const updatedItems = state.cart.items.map(item => 
                item._id === action.payload._id ? action.payload : item
            );
            const newItemCount = updatedItems.reduce((total, item) => total + item.quantity, 0);
            const newTotalAmount = updatedItems.reduce((total, item) => total + (item.priceSnapshot * item.quantity), 0);
            return { 
                ...state, 
                cart: { ...state.cart, items: updatedItems },
                itemCount: newItemCount,
                totalAmount: newTotalAmount
            };
        case 'REMOVE_ITEM':
            const remainingItems = state.cart.items.filter(item => item._id !== action.payload);
            const remainingCount = remainingItems.reduce((total, item) => total + item.quantity, 0);
            const remainingAmount = remainingItems.reduce((total, item) => total + (item.priceSnapshot * item.quantity), 0);
            return { 
                ...state, 
                cart: { ...state.cart, items: remainingItems },
                itemCount: remainingCount,
                totalAmount: remainingAmount
            };
        case 'CLEAR_CART':
            return { 
                ...state, 
                cart: { ...state.cart, items: [] },
                itemCount: 0,
                totalAmount: 0
            };
        case 'SET_ERROR':
            return { ...state, error: action.payload, loading: false };
        default:
            return state;
    }
};

const initialState = {
    cart: { items: [] },
    itemCount: 0,
    totalAmount: 0,
    loading: false,
    error: null
};

export const CartProvider = ({ children }) => {
    const [state, dispatch] = useReducer(cartReducer, initialState);

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

    // Fetch cart
    const fetchCart = async () => {
        const userId = getCurrentUserId();
        if (!userId) return;

        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            const token = getAuthToken();
            const response = await fetch(ApiService.cart.getCart(userId), {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                dispatch({ type: 'SET_CART', payload: data });
            } else {
                throw new Error('Failed to fetch cart');
            }
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: error.message });
        }
    };

    // Add item to cart
    const addToCart = async (productId, quantity = 1) => {
        const userId = getCurrentUserId();
        if (!userId) return;

        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            const token = getAuthToken();
            const response = await fetch(ApiService.cart.addItem(), {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userId, productId, quantity })
            });

            if (response.ok) {
                const data = await response.json();
                dispatch({ type: 'ADD_ITEM', payload: data.item });
                return { success: true, message: 'Item added to cart' };
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to add item to cart');
            }
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: error.message });
            return { success: false, message: error.message };
        }
    };

    // Update cart item
    const updateCartItem = async (itemId, quantity) => {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            const token = getAuthToken();
            const response = await fetch(ApiService.cart.updateItem(itemId), {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ quantity })
            });

            if (response.ok) {
                const data = await response.json();
                dispatch({ type: 'UPDATE_ITEM', payload: data.item });
                return { success: true };
            } else {
                throw new Error('Failed to update cart item');
            }
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: error.message });
            return { success: false, message: error.message };
        }
    };

    // Remove item from cart
    const removeFromCart = async (itemId) => {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            const token = getAuthToken();
            const response = await fetch(ApiService.cart.removeItem(itemId), {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                dispatch({ type: 'REMOVE_ITEM', payload: itemId });
                return { success: true };
            } else {
                throw new Error('Failed to remove item from cart');
            }
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: error.message });
            return { success: false, message: error.message };
        }
    };

    // Clear cart
    const clearCart = async () => {
        const userId = getCurrentUserId();
        if (!userId) return;

        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            const token = getAuthToken();
            const response = await fetch(ApiService.cart.clearCart(userId), {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                dispatch({ type: 'CLEAR_CART' });
                return { success: true };
            } else {
                throw new Error('Failed to clear cart');
            }
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: error.message });
            return { success: false, message: error.message };
        }
    };

    // Load cart on mount
    useEffect(() => {
        const userId = getCurrentUserId();
        if (userId) {
            fetchCart();
        }
    }, []);

    const value = {
        cart: state.cart,
        itemCount: state.itemCount,
        totalAmount: state.totalAmount,
        loading: state.loading,
        error: state.error,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
        fetchCart
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export default CartContext;
