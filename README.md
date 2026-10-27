# Personal Expense Tracker with Analytics

A full-stack web application designed to help individuals record daily income and expenses, organize transactions by category, monitor low balance warnings, and visualize spending patterns through summaries and charts.

Built as a college project demonstrating **RESTful CRUD operations, MongoDB database persistence, modern asynchronous JavaScript, multi-page frontend architecture, and automated testing**.

---

## 📌 Project Overview

### 1. Problem Statement
Maintaining an accurate record of daily spending using paper notes or scattered spreadsheets is difficult and often leads to overspending. People struggle to recognize which categories consume most of their money and rarely receive alerts when their account balance is critically low. This project provides a centralized, multi-page web application to manage income and expenses, calculate balances, display analytics, and alert users when their balance is running low so they can spend money prudently.

### 2. Key Objectives
- **Multi-Page Web Architecture**:
  1. 📊 **Dashboard Page** (`/`): Summary cards, expense doughnut chart, monthly bar chart, recent transactions, and low balance banner.
  2. ➕ **Add Transaction Page** (`/add-transaction`): Dedicated form to enter income/expense transactions with dynamic category selection and instant validation.
  3. 📜 **Transaction History Page** (`/transactions`): Searchable and filterable table with full CRUD (Edit modal and Delete with confirmation).
  4. ⚠️ **Low Balance Alert Page** (`/alerts`): Dedicated page monitoring safety thresholds, alerting users if funds are low, and offering practical financial advice.
- Calculate key financial metrics: **Total Income, Total Expenses, and Net Balance** (in INR ₹).
- Deliver visual spending analytics with **Chart.js** (Category Doughnut Chart & Monthly Income vs. Expense Bar Chart).
- Provide real-time filtering by transaction type, category, date range, and keyword search.
- Clean database persistence using **MongoDB** and **Mongoose**.
- Include an automated test suite verifying business logic and API contracts.

---

## 🛠️ Technology Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | HTML5, CSS3, JavaScript (ES6+) | Multi-page responsive web UI using Fetch API |
| **Data Visualization**| Chart.js (v4.4 via CDN) | Interactive doughnut and bar charts |
| **Backend** | Node.js & Express.js | REST API server, static file serving, validation |
| **Database** | MongoDB (v6.0+) | NoSQL document database for transactions |
| **ODM** | Mongoose (v8.x) | Schemas, type validation, aggregation pipelines |
| **Testing** | Node.js Native Test Runner (`node:test`) | Automated unit and integration tests |

---

## 📂 Project Structure

```text
personal-expense-tracker/
├── public/                     # Static frontend multi-page assets
│   ├── index.html              # 1. Main Dashboard page
│   ├── add-transaction.html    # 2. Add New Transaction page
│   ├── transactions.html       # 3. Transaction History & Edit/Delete page
│   ├── alerts.html             # 4. Low Balance Alert & Advice page
│   ├── css/
│   │   └── styles.css          # Responsive design, variables & layout
│   └── js/
│       ├── api.js              # Centralized Fetch API client helper
│       ├── common.js           # Shared navbar badge, formatting & toast notifications
│       ├── charts.js           # Chart.js initialization & updates
│       ├── dashboard.js        # Dashboard data loader & low balance banner
│       ├── add-transaction.js  # Add form validation & recent submissions preview
│       ├── history.js          # Table filters, search, edit modal, delete modal
│       └── alerts.js           # Threshold setting, deficit calculation & financial advice
├── src/                        # Backend source code
│   ├── config/
│   │   ├── db.js               # MongoDB Mongoose connection setup
│   │   └── seed.js             # Sample data populator for viva demo
│   ├── models/
│   │   ├── Transaction.js      # Mongoose schema for transactions
│   │   └── Budget.js           # Budget schema
│   ├── controllers/
│   │   ├── transactionController.js # CRUD handlers
│   │   └── analyticsController.js   # Aggregation & summary handlers
│   ├── routes/
│   │   ├── transactionRoutes.js# /api/transactions router
│   │   └── analyticsRoutes.js  # /api/analytics router
│   ├── middleware/
│   │   └── errorHandler.js     # Centralized error handler
│   ├── app.js                  # Express app & multi-page route setup
│   └── server.js               # Server entry point & listener
├── tests/
│   └── transaction.test.js     # Automated test suite (13 test cases)
├── .env.example                # Example environment variables
├── .env                        # Local environment variables
├── .gitignore                  # Git untracked files
├── package.json                # Project dependencies & scripts
└── README.md                   # Project documentation
```

---

## ⚙️ Prerequisites

Before running the application, make sure you have:
1. **Node.js** (v18.0.0 or higher) - [Download Node.js](https://nodejs.org/)
2. **MongoDB** (v6.0 or higher) running locally on port `27017`.

---

## 🚀 Setup & Execution Guide

1. **Navigate to the project directory:**
   ```bash
   cd personal-expense-tracker
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   A default `.env` file is already provided:
   ```env
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/expense_tracker
   NODE_ENV=development
   ```

4. **Ensure MongoDB is running:**
   - Make sure your local MongoDB service is active on port `27017`.

5. **(Optional) Seed sample transactions for viva demo:**
   ```bash
   npm run seed
   ```

6. **Start the application:**
   - Standard start:
     ```bash
     npm start
     ```
   - Auto-reload for development:
     ```bash
     npm run dev
     ```

7. **Access the application in your browser:**
   ```
   http://localhost:3000
   ```

---

## 🖥️ Multi-Page Application Guide

| Page | URL | Key Features |
| :--- | :--- | :--- |
| **📊 Dashboard** | `http://localhost:3000/` | Summary cards (Income, Expense, Balance in ₹), low-balance warning banner, Category Doughnut Chart, Monthly Comparison Bar Chart, and recent 5 transactions preview. |
| **➕ Add Transaction** | `http://localhost:3000/add-transaction.html` | Clean dedicated form to record Income or Expense with positive amount validation, dynamic category dropdown, date picker, and recent additions preview. |
| **📜 History** | `http://localhost:3000/transactions.html` | Complete transaction history table with real-time keyword search, type filter, category filter, date-range filters, **Edit Modal**, and **Delete Confirmation**. |
| **⚠️ Balance Alert** | `http://localhost:3000/alerts.html` | Evaluates current balance against customizable threshold (e.g. ₹2,000), shows warning if funds are low, highlights top spending categories, and gives student budgeting advice. |

---

## 📡 REST API Reference

All API endpoints are served under `/api`:

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/transactions` | List transactions (supports `?type=&category=&startDate=&endDate=&search=`) |
| `GET` | `/api/transactions/:id` | Get details of a single transaction |
| `POST` | `/api/transactions` | Create a new transaction |
| `PUT` | `/api/transactions/:id` | Update an existing transaction |
| `DELETE` | `/api/transactions/:id` | Delete a transaction |
| `GET` | `/api/analytics/summary` | Get financial totals & balance |
| `GET` | `/api/analytics/categories`| Get expense totals grouped by category |
| `GET` | `/api/analytics/monthly` | Get monthly income vs expense comparison |
| `GET` | `/api/health` | Server health check endpoint |

---

## 🧪 Testing

To run the automated test suite:
```bash
npm test
```
*All 13 automated test cases covering endpoints, aggregation, and validation pass successfully.*

---

## 🎥 Live Demonstration Walkthrough (For Viva / Demo)

1. **Dashboard Overview (`/`):**
   - Open `http://localhost:3000`. Show the summary cards (Total Income, Total Expenses, Net Balance).
   - Point out the two Chart.js visualizations (Category Doughnut & Monthly Bar Chart).
2. **Add Transaction Page (`/add-transaction.html`):**
   - Click **➕ Add Transaction** in the navigation bar.
   - Add an Expense of `₹500` under `Food` with note `College Canteen`.
   - Submit and show the success message and updated recent additions.
3. **Transaction History Page (`/transactions.html`):**
   - Click **📜 History** in the navigation bar.
   - Filter by `Expense Only` or search for `Food`.
   - Click **✏️ Edit** on any transaction to change its amount and save.
   - Click **🗑️ Delete** to show the delete confirmation dialog and remove a record.
4. **Low Balance Alert Page (`/alerts.html`):**
   - Click **⚠️ Balance Alert** in the navigation bar.
   - Explain how the application protects users from overspending by comparing balance against a safety threshold.
   - Show how the advice and top expense categories help the user prioritize essential spending.
   - Demonstrate changing the threshold (e.g., raise it to ₹60,000 to show the danger state, or lower it to show the safe state).

---

## 📄 License
This project is open-source and created for academic evaluation.
