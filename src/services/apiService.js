// API configuration service
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

class ApiService {
    static getBaseUrl() {
        return API_BASE_URL;
    }

    static getApiUrl(endpoint) {
        return `${API_BASE_URL}${endpoint}`;
    }

    // Authentication endpoints
    static auth = {
        sendOTP: () => `${API_BASE_URL}/users/auth/sendOTP`,
        sendResetPassOTP: () => `${API_BASE_URL}/users/auth/sendResetPassOTP`,
        register: () => `${API_BASE_URL}/users/auth/register`,
        login: () => `${API_BASE_URL}/users/auth/login`,
        googleRegister: () => `${API_BASE_URL}/users/auth/google-register`,
        googleLogin: () => `${API_BASE_URL}/users/auth/google-login`,
        updateUser: () => `${API_BASE_URL}/users/auth/update-user`,
        updateNumber: () => `${API_BASE_URL}/users/auth/updateNumber`,
    };

    // Posts endpoints
    static posts = {
        uploadProduct: () => `${API_BASE_URL}/users/post/upload-product`,
        userPost: (userId) => `${API_BASE_URL}/users/post/user-post?userId=${userId}`,
        updateStatus: (productId) => `${API_BASE_URL}/users/post/products/update-status/${productId}`,
        deleteProduct: (productId) => `${API_BASE_URL}/users/post/product/delete-product/${productId}`,
        updateProduct: (productId) => `${API_BASE_URL}/users/post/update-product/${productId}`,
        productItem: (productId) => `${API_BASE_URL}/users/post/product-item/${productId}`,
        nearbyProducts: (lat, lng, category, distance) => 
            `${API_BASE_URL}/users/post/products/nearby?lat=${lat}&lng=${lng}&category=${encodeURIComponent(category)}&distance=${distance}`,
        relatedProducts: (lat, lng, category) => 
            `${API_BASE_URL}/users/post/related-product-items/nearby?lat=${lat}&lng=${lng}&category=${encodeURIComponent(category)}`,
        search: (query) => `${API_BASE_URL}/users/post/search?query=${query}`,
    };

    // Wishlist endpoints
    static wishlist = {
        addRemove: () => `${API_BASE_URL}/users/wishlist/add-remove-wishlist`,
        userWishlist: (userId) => `${API_BASE_URL}/users/wishlist/user-wishlist/${userId}`,
        removeFromWishlist: (userId, productId) => 
            `${API_BASE_URL}/users/wishlist/remove-user-wishlist/${userId}/${productId}`,
        checkStatus: (userId, productId) => 
            `${API_BASE_URL}/users/wishlist/status?userId=${userId}&productId=${productId}`,
    };

    // Notifications endpoints
    static notifications = {
        getNotifications: (userId) => `${API_BASE_URL}/users/notifications/get-notifications/${userId}`,
        markAsRead: (userId, notificationId) => 
            `${API_BASE_URL}/users/notifications/markAsRead/${userId}/${notificationId}`,
    };

    // Other endpoints
    static other = {
        sendCallbackRequest: () => `${API_BASE_URL}/users/send-call-back-request`,
        files: (filename) => `${API_BASE_URL}/files/${filename}`,
        profiles: (filename) => `${API_BASE_URL}/profiles/${filename}`,
    };
}

export default ApiService;
