# 💰 Money Manager

A full-stack personal finance management application built with React, Node.js, Express, and MongoDB. Track your income, expenses, budgets, financial goals, and get detailed analytics on your spending habits.

## ✨ Features

- 🔐 **User Authentication** - Secure JWT-based authentication
- 💸 **Transaction Management** - Track income and expenses with categories
- 📊 **Reports & Analytics** - Visualize spending patterns with interactive charts
- 🎯 **Budget Planning** - Set and monitor category-wise budgets
- 🏆 **Financial Goals** - Track savings goals with progress monitoring
- 🔄 **Recurring Transactions** - Automate regular income/expense entries
- 🔔 **Toast Notifications** - Real-time feedback for user actions
- 🎨 **Modern UI** - Beautiful, responsive design with Tailwind CSS

## 🛠️ Tech Stack

### Frontend
- React 18
- Vite
- Tailwind CSS
- Recharts (for data visualization)
- Axios
- React Router DOM

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcrypt for password hashing

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

## 🚀 Installation

### 1. Clone the repository
```bash
git clone [https://github.com/eswarraj93/money-manager.git](https://github.com/eswarraj93/money-manager.git)
cd money-manager

2. Backend Setup
bash
cd backend
npm install
Create a .env file in the backend directory:

env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000
Start the backend server:

bash
npm start
3. Frontend Setup
bash
cd ../frontend
npm install
Create a .env file in the frontend directory:

env
VITE_API_URL=http://localhost:5000/api
Start the frontend development server:

bash
npm run dev
🌐 Deployment
Backend (Render)
The backend is configured for deployment on Render. See 
backend/render.yaml
 for configuration.

Frontend (Vercel/Netlify)
Build the frontend for production:

bash
cd frontend
npm run build
📁 Project Structure
money-manager/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── budgetController.js
│   │   ├── goalController.js
│   │   ├── recurringController.js
│   │   └── transactionController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── Budget.js
│   │   ├── Goal.js
│   │   ├── RecurringTransaction.js
│   │   ├── Transaction.js
│   │   └── User.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── budgets.js
│   │   ├── goals.js
│   │   ├── recurring.js
│   │   └── transactions.js
│   ├── .env
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── PrivateRoute.jsx
│   │   │   └── Toast.jsx
│   │   ├── context/
│   │   │   └── ToastContext.jsx
│   │   ├── pages/
│   │   │   ├── Budgets.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Goals.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── RecurringTransactions.jsx
│   │   │   ├── Reports.jsx
│   │   │   └── Signup.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .env
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.js
└── README.md


🎯 Usage
Sign Up: Create a new account
Add Transactions: Record your income and expenses
Set Budgets: Define spending limits for different categories
Create Goals: Set financial targets and track progress
Setup Recurring: Automate regular transactions
View Reports: Analyze your spending patterns

🔑 API Endpoints
Authentication
POST /api/auth/signup - Register new user
POST /api/auth/login - Login user

Transactions
GET /api/transactions - Get all transactions
POST /api/transactions - Create transaction
PUT /api/transactions/:id - Update transaction
DELETE /api/transactions/:id - Delete transaction

Budgets
GET /api/budgets - Get all budgets
POST /api/budgets - Create budget
PUT /api/budgets/:id - Update budget
DELETE /api/budgets/:id - Delete budget

Goals
GET /api/goals - Get all goals
POST /api/goals - Create goal
PUT /api/goals/:id - Update goal
DELETE /api/goals/:id - Delete goal

Recurring Transactions
GET /api/recurring - Get all recurring transactions
POST /api/recurring - Create recurring transaction
PUT /api/recurring/:id - Update recurring transaction
DELETE /api/recurring/:id - Delete recurring transaction
