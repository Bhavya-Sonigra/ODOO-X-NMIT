# 🌍 EcoFinds – Sustainable Second-Hand Marketplace

> **Empowering Sustainable Consumption through a Second-Hand Marketplace**

A comprehensive marketplace platform built for the **Odoo X NMIT Hackathon 2025** that revolutionizes the way people buy and sell pre-owned goods, fostering a culture of sustainability by extending product lifecycles and reducing waste.

---

## 📖 Project Vision & Mission

### Vision
EcoFinds envisions becoming the go-to destination for a conscious community seeking unique finds and responsible consumption. We aim to create a vibrant and trusted platform that revolutionizes the way people buy and sell pre-owned goods, fostering a culture of sustainability by extending the lifecycle of products, reducing waste, and providing an accessible and convenient alternative to purchasing new items.

### Mission
Our mission is to develop a user-friendly and engaging desktop and mobile application that serves as a central hub for buying and selling second-hand items. EcoFinds leverages intuitive design and essential features to connect buyers and sellers efficiently, promoting a circular economy and making sustainable choices easier for everyone.

---

## 🎯 Problem Statement

**Develop a foundational version of EcoFinds, focusing on core user authentication and product listing functionalities.**

We've built a functional prototype accessible via both mobile and desktop interfaces that allows users to:

- ✅ **User Authentication**: Simple and secure registration & login (email + password + Google OAuth)
- ✅ **Profile Creation**: Complete user profile management with username, contact details, and avatar
- ✅ **User Dashboard**: Comprehensive profile editing and management
- ✅ **Product Listing Creation**: Create listings with title, description, category, price, and multiple images
- ✅ **Product Listing Management (CRUD)**: View, edit, and delete own product listings
- ✅ **Product Browsing**: Browse available products with advanced filtering
- ✅ **Category Filtering**: Filter listings by predefined categories
- ✅ **Keyword Search**: Search listings by keywords in title and description
- ✅ **Product Detail View**: Comprehensive product details with seller information
- ✅ **Shopping Cart**: Add products to cart and manage quantities
- ✅ **Order Management**: Complete order processing and tracking
- ✅ **Wishlist**: Save favorite products for later
- ✅ **Real-time Chat**: Direct communication between buyers and sellers
- ✅ **Location-based Search**: Find products near your location
- ✅ **Notifications**: Real-time updates and alerts

---

## ✨ Key Features Implemented

### 🔐 Authentication & User Management
- **Multi-factor Authentication**: Email/password + Google OAuth integration
- **Secure Registration**: Email verification with OTP system
- **Password Recovery**: Secure password reset with OTP verification
- **Profile Management**: Complete user profile with avatar, contact details, and location
- **User Dashboard**: Comprehensive profile editing and account management

### 🛍️ Product Management
- **Product Listings**: Create, edit, and manage product listings
- **Image Upload**: Multiple image support with Cloudinary integration
- **Category System**: 10 predefined categories (Electronics, Books, Furniture, etc.)
- **Location Integration**: GPS-based location services for local marketplace
- **Product Status**: Mark products as sold/available
- **Advanced Search**: Keyword search with category and price filtering

### 🛒 Shopping Experience
- **Shopping Cart**: Add, remove, and manage cart items
- **Wishlist**: Save favorite products for later purchase
- **Order Processing**: Complete order management system
- **Payment Integration**: Ready for payment gateway integration
- **Order Tracking**: Track order status and history

### 💬 Communication
- **Real-time Chat**: Direct messaging between buyers and sellers
- **Socket.io Integration**: Real-time communication
- **File Sharing**: Share images and files in chat
- **Callback Requests**: Request seller contact for products

### 📱 User Experience
- **Responsive Design**: Mobile-first responsive design
- **Location Services**: GPS-based product discovery
- **Notifications**: Real-time notifications and alerts
- **Dark/Light Theme**: Modern UI with theme support
- **Accessibility**: WCAG compliant design

---

## 🛠️ Technology Stack

### Frontend
- **React 18.3.1** - Modern UI library
- **React Router DOM** - Client-side routing
- **Redux Toolkit** - State management
- **React Leaflet** - Interactive maps
- **Socket.io Client** - Real-time communication
- **Axios** - HTTP client
- **React Icons** - Icon library
- **React Toastify** - Notifications

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **Socket.io** - Real-time communication
- **JWT** - Authentication tokens
- **Bcrypt** - Password hashing
- **Multer** - File upload handling
- **Cloudinary** - Image storage and optimization

### Additional Tools
- **Nodemailer** - Email services
- **Express Validator** - Input validation
- **CORS** - Cross-origin resource sharing
- **Nodemon** - Development server

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- Git

### Installation

1. **Clone the Repository**
```bash
git clone https://github.com/Bhavya-Sonigra/ODOO-X-NMIT.git
cd ODOO-X-NMIT
```

2. **Install Frontend Dependencies**
```bash
npm install
```

3. **Install Backend Dependencies**
```bash
cd server
npm install
cd ..
```

4. **Environment Setup**
Create a `.env` file in the root directory:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/ecofinds
# OR MongoDB Atlas
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/ecofinds

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Cloudinary (for image storage)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Email Configuration (for OTP)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

5. **Start the Application**

**Backend Server:**
```bash
cd server
npm start
```

**Frontend Application:**
```bash
npm start
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

---

## 📚 API Documentation

A comprehensive Postman collection is included for testing all backend endpoints:

**File**: `EcoFinds-API.postman_collection.json`

### Key API Endpoints

#### Authentication
- `POST /users/auth/register` - User registration
- `POST /users/auth/login` - User login
- `POST /users/auth/google-login` - Google OAuth login
- `POST /users/auth/generate-otp` - Generate OTP for verification
- `POST /users/auth/sendOTP` - Verify OTP

#### Products
- `GET /users/post/products/nearby` - Get nearby products
- `GET /users/post/product-item/:productId` - Get product details
- `POST /users/post/upload-product` - Upload new product
- `PUT /users/post/update-product/:productId` - Update product
- `DELETE /users/post/product/delete-product/:productId` - Delete product

#### Cart & Orders
- `GET /api/cart` - Get user's cart
- `POST /api/cart/items` - Add item to cart
- `PATCH /api/cart/items/:id` - Update cart item
- `DELETE /api/cart/items/:id` - Remove cart item
- `POST /api/orders` - Create order

#### User Profile
- `GET /api/users/me` - Get user profile
- `PATCH /api/users/me` - Update user profile
- `GET /api/users/profile/:userId` - Get public user profile

---

## 📂 Project Structure

```
ODOO-X-NMIT/
├── public/                          # Static assets
│   ├── index.html
│   ├── manifest.json
│   └── favicon.png
├── server/                          # Backend (Node.js + Express)
│   ├── Models/                      # Database models
│   │   ├── Users.js                # User schema
│   │   ├── product.js              # Product schema
│   │   ├── Cart.js                 # Cart schema
│   │   ├── Order.js                # Order schema
│   │   ├── Wishlist.js             # Wishlist schema
│   │   └── ...
│   ├── routers/                    # API routes
│   │   ├── register.js             # User registration
│   │   ├── login.js                # User login
│   │   ├── uploadProduct.js        # Product management
│   │   ├── cart.js                 # Cart operations
│   │   ├── orders.js               # Order management
│   │   └── ...
│   ├── middleware/                 # Custom middleware
│   │   ├── auth.js                 # Authentication
│   │   ├── validation.js           # Input validation
│   │   └── ecofindValidation.js    # Custom validations
│   ├── services/                   # External services
│   │   └── gmailService.js         # Email service
│   ├── utils/                      # Utility functions
│   │   └── imageUtils.js           # Image processing
│   └── server.js                   # Main server file
├── src/                            # Frontend (React)
│   ├── components/                 # React components
│   │   ├── auth/                   # Authentication components
│   │   ├── home/                   # Home page components
│   │   ├── cart/                   # Shopping cart
│   │   ├── chat/                   # Real-time chat
│   │   ├── contexts/               # React contexts
│   │   ├── header/                 # Header component
│   │   ├── Item-viewer/            # Product detail view
│   │   ├── Sell/                   # Product listing
│   │   ├── user-profile/           # User profile
│   │   └── ...
│   ├── services/                   # API services
│   │   ├── apiService.js           # API client
│   │   └── encryptDecryptService.js # Encryption
│   ├── assets/                     # Static assets
│   │   ├── icon/                   # Icons
│   │   └── SVG/                    # SVG icons
│   ├── App.js                      # Main App component
│   └── index.js                    # Entry point
├── EcoFinds-API.postman_collection.json  # API documentation
├── package.json                    # Frontend dependencies
└── README.md                       # Project documentation
```

---

## 🎨 UI/UX Features

### Design Principles
- **Mobile-First**: Responsive design optimized for mobile devices
- **Accessibility**: WCAG 2.1 compliant design
- **Modern UI**: Clean, intuitive interface with smooth animations
- **User-Centric**: Designed with user experience as the primary focus

### Key UI Components
- **Product Cards**: Attractive product display with hover effects
- **Interactive Maps**: Location-based product discovery
- **Real-time Chat**: Modern chat interface with file sharing
- **Shopping Cart**: Intuitive cart management
- **User Dashboard**: Comprehensive profile management
- **Search & Filter**: Advanced search with multiple filters

---

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt encryption for passwords
- **Input Validation**: Comprehensive input sanitization
- **CORS Protection**: Cross-origin request security
- **File Upload Security**: Secure image upload with validation
- **Rate Limiting**: API rate limiting for security

---

## 📱 Mobile Responsiveness

The application is fully responsive and optimized for:
- **Mobile Phones** (320px - 768px)
- **Tablets** (768px - 1024px)
- **Desktop** (1024px+)

---

## 🧪 Testing

### Postman Collection
The project includes a comprehensive Postman collection (`EcoFinds-API.postman_collection.json`) with:
- All API endpoints documented
- Sample requests and responses
- Environment variables for easy testing
- Authentication flows included

### Manual Testing
- Cross-browser compatibility testing
- Mobile device testing
- API endpoint testing
- User flow testing

---

## 🚀 Deployment

### Frontend Deployment
```bash
npm run build
```
The build folder contains the production-ready static files.

### Backend Deployment
The server is ready for deployment on platforms like:
- Heroku
- AWS
- DigitalOcean
- Vercel

---

## 👥 Team

**Odoo X NMIT Hackathon Team 2025**

- **Bhavya Sonigra** - Full Stack Developer
- **Nemin Haria** - Frontend Developer  
- **Jay Dolar** - Backend Developer
- **Parthiv Panchal** - UI/UX Designer

---

## 🏆 Hackathon Context

**Event**: Odoo X NMIT Hackathon 2025  
**Track**: Sustainable Marketplace Development  
**Duration**: 48 hours  
**Theme**: Building a sustainable second-hand marketplace platform

This project was developed as part of the Odoo X NMIT Hackathon, focusing on creating a comprehensive marketplace solution that promotes sustainability and circular economy principles.

---

## 🔮 Future Improvements

### Short-term Goals
- [ ] **Payment Gateway Integration**: Stripe/Razorpay integration
- [ ] **Advanced Search**: AI-powered product recommendations
- [ ] **Push Notifications**: Mobile push notifications
- [ ] **Product Reviews**: User review and rating system
- [ ] **Social Features**: User following and social interactions

### Long-term Vision
- [ ] **Odoo Integration**: Full integration with Odoo modules
- [ ] **Mobile App**: Native iOS and Android applications
- [ ] **AI Features**: Image recognition for auto-categorization
- [ ] **Analytics Dashboard**: Seller analytics and insights
- [ ] **Multi-language Support**: Internationalization
- [ ] **Blockchain Integration**: Product authenticity verification

---

## 📄 License

This project is developed for the Odoo X NMIT Hackathon 2025. All rights reserved.

---

## 🤝 Contributing

This project was developed as part of a hackathon. For any questions or suggestions, please contact the development team.

---

## 📞 Contact

- **GitHub**: [Bhavya-Sonigra/ODOO-X-NMIT](https://github.com/Bhavya-Sonigra/ODOO-X-NMIT)
- **Hackathon**: Odoo X NMIT 2025

---

<div align="center">

**🌍 Building a Sustainable Future, One Product at a Time 🌍**

*EcoFinds - Where Sustainability Meets Innovation*

</div>
