🌍 ODOO X NMIT – EcoFinds Marketplace

A sustainable marketplace platform where users can buy, sell, and donate pre-owned items such as furniture, appliances, and other goods — helping promote reusability and reduce waste.

This project was built as part of the Odoo Hackathon X NMIT.

✨ Features

🔑 User Authentication – Register, login, and manage accounts.

🛒 Product Listings – Add, update, and browse items with details, images, and conditions (used/new).

📦 Buy / Sell Flow – Post products, view seller details, and interact.

🔍 Search & Filter – Quickly find items by category, condition, or location.

📱 Responsive Frontend – Simple, mobile-friendly UI.

⚡ REST APIs – Backend powered by Node.js/Express with endpoints for marketplace operations.

🧪 Postman Collection – API collection included (EcoFinds-API.postman_collection.json) for testing.

🛠️ Tech Stack

Frontend

React (JavaScript)

CSS

Backend

Node.js

Express.js

Database

MongoDB (assumed – please update if different)

Other Tools

Postman for API testing

Git/GitHub for collaboration

🚀 Getting Started
1️⃣ Clone the Repository
git clone https://github.com/Bhavya-Sonigra/ODOO-X-NMIT.git
cd ODOO-X-NMIT

2️⃣ Install Dependencies
npm install

3️⃣ Setup Environment Variables

Create a .env file in the root directory with:

PORT=5000
MONGO_URI=your_mongo_connection_string
JWT_SECRET=your_secret_key

4️⃣ Run the Application
Backend (Server)
cd server
npm install
npm start

Frontend (React App)
cd src
npm install
npm start


The app will be available at:

Frontend → http://localhost:3000

Backend → http://localhost:5000/api

📖 API Documentation

A Postman collection is included for testing all backend endpoints:

File: EcoFinds-API.postman_collection.json

📂 Project Structure
ODOO-X-NMIT/
│── public/             # Static assets
│── server/             # Backend (Node.js + Express APIs)
│── src/                # Frontend (React components)
│── .env.example        # Environment variable sample
│── package.json        # Dependencies and scripts
│── EcoFinds-API.postman_collection.json
│── README.md           # Project documentation

👥 Team

Bhavya Sonigra
Nemin Haria
Jay Dolar

🏆 Hackathon Track

Built for Odoo Hackathon X NMIT 2025 – Problem Statement:

Develop a sustainable marketplace platform where users can exchange goods, encouraging reuse and reducing waste.

📌 Future Improvements

Integration with Odoo modules (e.g., invoicing, inventory).

Add chat or messaging between buyers & sellers.

Add image recognition to auto-categorize items.
