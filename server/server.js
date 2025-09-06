const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const register = require('./routers/register.js')
const login = require('./routers/login.js')
const googleAuth = require('./routers/googleAuth.js')
const generateOTP = require('./routers/generateOTP.js')
const generateResetPassOTP = require('./routers/generateResetPassOTP.js')
const updatePassword = require('./routers/updatePassword.js')
const uploadProduct = require('./routers/uploadProduct.js');
const fetchAllPost=require('./routers/fetchAllPost.js');
const fetchRelatedPost=require('./routers/fetchRelatedItem.js');
const wishlist=require('./routers/addWishList.js');
const fetchProductItem=require('./routers/fetchProductItem.js');
const fetchUserWishlist=require('./routers/fetchWishlist.js');
const wishlistStatus=require('./routers/checkWishlistStatus.js');
const userPost=require('./routers/fetchUserProduct.js');
const getNotifications=require('./routers/notifications/fetchNotification.js');
const sendCallbackRequest=require('./routers/chat-routers/sendCallbackRequest.js');
const updateProductDetails=require('./routers/editPost.js');
const markedSold=require('./routers/markSold.js');
const deleteProductItem=require('./routers/deleteProductItem.js');
const updateUsers=require('./routers/updateUser.js');
const search=require('./routers/search.js');
const markedAsRead=require('./routers/notifications/markReadNotification.js');

// New EcoFinds routes
const cart = require('./routers/cart.js');
const orders = require('./routers/orders.js');
const userProfile = require('./routers/userProfile.js');
const categories = require('./routers/categories.js');

const dotenv = require('dotenv');
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
}));

mongoose.connect(process.env.MONGO_URI).then(() => {
    console.log('MongoDB connected...');
}).catch((err) => {
    console.error('MongoDB connection error:', err);
});

app.use('/users/auth',register);
app.use('/users/auth',login);
app.use('/users/auth',googleAuth);
app.use('/users/auth',generateOTP);
app.use('/users/auth',generateResetPassOTP);
app.use('/users/auth',updatePassword);
app.use('/users/auth',updateUsers);
app.use('/users/auth/updateNumber',register);
app.use('/users/post',uploadProduct);
app.use('/users/post',fetchAllPost);
app.use('/users/post',fetchRelatedPost);
app.use('/users/post',userPost);
app.use('/users/post',fetchProductItem);
app.use('/users/post',updateProductDetails);
app.use('/users/post',markedSold);
app.use('/users/post',deleteProductItem);
app.use('/users/post',search);
app.use('/users/wishlist',wishlist);
app.use('/users/wishlist',fetchUserWishlist);
app.use('/users/wishlist',wishlistStatus);
app.use('/users',sendCallbackRequest);
app.use('/users/notifications',getNotifications);
app.use('/users/notifications',markedAsRead);

// New EcoFinds API routes
app.use('/api', cart);
app.use('/api', orders);
app.use('/api', userProfile);
app.use('/api', categories);

// Import stretch goal routes
const savedSearches = require('./routers/savedSearches');
const favoriteSellers = require('./routers/favoriteSellers');

// Mount stretch goal routes
app.use('/api', savedSearches);
app.use('/api', favoriteSellers);

app.use('/files',express.static(path.join(__dirname, 'Users-files/users-post-files')));
app.use('/profiles',express.static(path.join(__dirname, 'Users-files/users-profiles')));

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
