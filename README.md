# EcoFinds Marketplace – ODOO X NMIT

A sustainable marketplace platform for buying, selling, and donating pre-owned items (furniture, appliances, books, study materials, and more). Built for the Odoo Hackathon X NMIT.

## Features

- **User Authentication:** Register, login, and manage accounts.
- **Product Listings:** Add, update, and browse items with images, details, and condition.
- **Buy / Sell Flow:** Post products, view seller details, and interact.
- **Search & Filter:** Find items by category, condition, or location.
- **Favorite Sellers:** Save and add notes for favorite sellers.
- **Wishlist:** Add/remove products to your wishlist.
- **Chat & Messaging:** Real-time chat between buyers and sellers.
- **Notifications:** Receive and manage notifications.
- **Responsive Frontend:** Mobile-friendly UI.
- **REST APIs:** Node.js/Express backend for marketplace operations.

## Tech Stack

**Frontend:**  
- React (JavaScript)  
- CSS

**Backend:**  
- Node.js  
- Express.js

**Database:**  
- MongoDB

## Project Structure

```
ODOO-X-NMIT/
│── public/                # Static assets (favicon, index.html, manifest, robots.txt)
│── server/                # Backend (Node.js + Express APIs)
│   │── .env
│   │── chatServer.js
│   │── nodemon.json
│   │── package.json
│   │── server.js
│   │── middleware/
│   │── Models/
│   │── routers/
│   │── services/
│   │── Users-files/
│   │── utils/
│── src/                   # Frontend (React components)
│   │── App.js, App.css
│   │── index.js, index.css
│   │── Loader.js, Loader.css
│   │── logo.svg
│   │── reportWebVitals.js
│   │── ScrollToTop.js
│   │── setupTests.js
│   │── assets/
│   │── auth/
│   │── components/
│   │── services/
│── .env                   # Environment variables
│── .gitignore
│── EcoFinds-API.postman_collection.json
│── package.json
│── README.md
```

## Getting Started

### 1. Clone the Repository

```sh
git clone https://github.com/Bhavya-Sonigra/ODOO-X-NMIT.git
cd ODOO-X-NMIT
```

### 2. Install Dependencies

```sh
npm install
```

### 3. Setup Environment Variables

Create a `.env` file in the root directory:

```
PORT=5000
MONGO_URI=your_mongo_connection_string
JWT_SECRET=your_secret_key
```

### 4. Run the Application

**Backend (Server):**
```sh
cd server
npm install
npm start
```

**Frontend (React App):**
```sh
cd src
npm install
npm start
```

- Frontend: http://localhost:3000  
- Backend: http://localhost:5000/api

## API Documentation

A Postman collection is included for testing backend endpoints:  
**File:** `EcoFinds-API.postman_collection.json`

## Team

- Bhavya Sonigra
- Nemin Haria
- Jay Dolar
- Parthiv Panchal

## Hackathon Track

Built for Odoo Hackathon X NMIT 2025 – Problem Statement:  
Develop a sustainable marketplace platform to encourage reuse and reduce waste.

## Future Improvements

- Integration with Odoo modules (invoicing, inventory)
- Enhanced chat/messaging features
- Image recognition for auto-categorization

---

**Other Tools:**  
- Postman for API testing  
- Git/GitHub for collaboration

---

For any issues or contributions, please open an issue or submit a pull request!