# Personal Expense Tracker with Analytics

A full-stack web application designed to help individuals record daily income and expenses, organize transactions by category, and visualize spending patterns through interactive summaries and charts.

Built as a college project demonstrating **RESTful CRUD operations, MongoDB database persistence, modern asynchronous JavaScript, responsive UI design, containerization with Docker Compose, and automated testing**.

---

## 📌 Project Overview

### 1. Problem Statement
Maintaining an accurate record of daily expenses using physical notebooks or messy spreadsheets is tedious and prone to errors. People often struggle to understand where their money goes each month or whether they are saving enough. This project provides a centralized, easy-to-use web dashboard to record financial transactions, filter records, and instantly view graphical spending analytics.

### 2. Key Objectives
- Provide an intuitive interface to log income and expense records.
- Implement full **CRUD** (Create, Read, Update, Delete) functionality backed by MongoDB.
- Automatically calculate financial totals: **Total Income, Total Expenses, and Net Balance** (in INR ₹).
- Deliver visual spending analytics with **Chart.js** (category-wise breakdown doughnut chart & monthly comparison bar chart).
- Provide real-time filtering by transaction type, category, date range, and keyword search.
- Containerize the entire application and database using **Docker** and **Docker Compose**.
- Include an automated test suite verifying business logic and API contracts.

---

## 🛠️ Technology Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | HTML5, CSS3, JavaScript (ES6+) | Clean, responsive UI with Fetch API integration |
| **Data Visualization**| Chart.js (v4.4 via CDN) | Interactive doughnut and bar charts |
| **Backend** | Node.js & Express.js | REST API server, routing, input validation |
| **Database** | MongoDB (v6.0+) | NoSQL document database for transactions |
| **ODM** | Mongoose (v8.x) | Schema definitions, validation, aggregation pipelines |
| **Containerization** | Docker & Docker Compose | Multi-container setup for Node app and MongoDB |
| **Version Control** | Git & GitHub | Modular commits and release tracking |
| **Testing** | Node.js Native Test Runner (`node:test`) | Automated API and unit test suite |

---

## 📂 Project Structure

```text
personal-expense-tracker/
├── public/                     # Static frontend assets
│   ├── index.html              # Main single-page dashboard
│   ├── css/
│   │   └── styles.css          # Responsive design, variables & layout
│   ├── js/
│   │   ├── api.js              # Fetch API client helper
│   │   ├── charts.js           # Chart.js initialization & updates
│   │   ├── transactions.js     # Form handling, table rendering, modals
│   │   └── dashboard.js        # Main dashboard coordinator & filter logic
│   └── assets/                 # Icons & project media
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
│   ├── app.js                  # Express application setup
│   └── server.js               # Server entry point & listener
├── tests/
│   └── transaction.test.js     # Automated test suite (T01 - T14)
├── .env.example                # Example environment variables
├── .env                        # Local environment variables
├── .gitignore                  # Git untracked files
├── .dockerignore               # Docker build exclusions
├── Dockerfile                  # Application container image definition
├── compose.yaml                # Docker Compose multi-service definition
├── package.json                # Project dependencies & scripts
└── README.md                   # Project documentation
```

---

## ⚙️ Prerequisites

Before running the application, make sure you have:
1. **Node.js** (v18.0.0 or higher) - [Download Node.js](https://nodejs.org/)
2. **MongoDB** (v6.0 or higher) running locally, **OR** **Docker Desktop** installed.

---

## 🚀 Setup & Execution Guide

### Option 1: Running Locally (Development Mode)

1. **Clone or navigate to the repository:**
   ```bash
   cd personal-expense-tracker
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   A default `.env` file is provided. You can customize the variables if needed:
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

6. **Start the server:**
   - For regular start:
     ```bash
     npm start
     ```
   - For auto-reloading during development:
     ```bash
     npm run dev
     ```

7. **Access the application:**
   Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

---

### Option 2: Running with Docker Compose (Recommended for Evaluation)

Docker Compose starts both the Node.js application and the MongoDB database container in an isolated network with persistent storage.

1. **Build and start containers:**
   ```bash
   docker compose up --build
   ```

2. **Verify container status:**
   ```bash
   docker compose ps
   ```

3. **Check application logs:**
   ```bash
   docker compose logs -f app
   ```

4. **Access the Web Dashboard:**
   Open your browser and go to:
   ```
   http://localhost:3000
   ```

5. **Stop containers (without losing database records):**
   ```bash
   docker compose down
   ```
   > **Note:** Data is preserved inside the named Docker volume `mongodb_data`. Do **not** use `docker compose down -v` if you wish to retain test data.

---

## 📡 REST API Reference

All API routes are served under the `/api` prefix.

| Method | Endpoint | Description | Request Body / Query Params |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/transactions` | List transactions with filters | `?type=&category=&startDate=&endDate=&search=` |
| `GET` | `/api/transactions/:id` | Get details of a single transaction | None |
| `POST` | `/api/transactions` | Create a new transaction | `{ "type": "expense", "amount": 500, "category": "Food", "date": "2026-10-28", "note": "Lunch" }` |
| `PUT` | `/api/transactions/:id` | Update an existing transaction | `{ "amount": 650, "note": "Updated note" }` |
| `DELETE` | `/api/transactions/:id` | Delete a transaction | None |
| `GET` | `/api/analytics/summary` | Get financial totals & balance | `?startDate=&endDate=` |
| `GET` | `/api/analytics/categories` | Get expense totals by category | `?startDate=&endDate=` |
| `GET` | `/api/analytics/monthly` | Get monthly income vs expense comparison | None |
| `GET` | `/api/health` | Health check endpoint | None |

### Standard Error Format
All errors return consistent JSON responses with appropriate HTTP status codes:
```json
{
  "error": "Amount must be a positive number greater than 0"
}
```

---

## 🧪 Testing Plan & Results

The project includes an automated test suite executed with Node's native test runner (`node:test`).

To run the test suite:
```bash
npm test
```

### Test Case Coverage (T01 – T14):
| Test ID | Scenario | Status |
| :--- | :--- | :--- |
| **T01** | Create a valid expense transaction and verify response | ✅ Passed |
| **T02** | Create a valid income transaction and verify response | ✅ Passed |
| **T03** | Reject invalid amount (<= 0 or non-numeric) with HTTP 400 | ✅ Passed |
| **T04** | Retrieve saved transaction list | ✅ Passed |
| **T05** | Update an existing transaction and verify modified fields | ✅ Passed |
| **T06** | Delete an existing transaction and confirm removal from DB | ✅ Passed |
| **T07** | Query a non-existent ObjectId and expect HTTP 404 | ✅ Passed |
| **T08** | Filter transactions by type (income/expense) and category | ✅ Passed |
| **T09** | Empty state test: verify zero balance when no records exist | ✅ Passed |
| **T10** | Database reconnection & startup error handling | ✅ Passed |
| **T11** | Docker Compose named volume data persistence across restarts | ✅ Passed |
| **T12** | Analytics aggregation accuracy (income, expense, balance) | ✅ Passed |
| **T12b**| Category breakdown aggregation pipeline | ✅ Passed |
| **T12c**| Monthly comparison grouping by year and month | ✅ Passed |
| **T13** | Health endpoint verification (`GET /api/health`) | ✅ Passed |
| **T14** | Codebase review: no hardcoded secrets, clean `.gitignore` | ✅ Passed |

---

## 🎥 Live Demonstration Walkthrough (For Viva / Demo)

Follow these steps during your project demonstration:

1. **Introduction:**
   - State the project title, problem definition, and tech stack (Express, Vanilla JS, MongoDB, Docker).
2. **Dashboard Overview:**
   - Open `http://localhost:3000`. Point out the summary cards (Total Income, Total Expenses, Net Balance in INR ₹).
   - Show the two charts: Expenses by Category (Doughnut) and Monthly Comparison (Bar).
3. **Create Operation (Expense):**
   - In the "Add New Transaction" card, select **Expense**.
   - Enter Amount: `₹500`, Category: `Food`, Note: `College lunch`.
   - Click **Add Transaction**. Show the success toast and see the summary totals and category chart update instantly.
4. **Create Operation (Income):**
   - Switch type to **Income**.
   - Enter Amount: `₹15,000`, Category: `Salary`, Note: `Internship stipend`.
   - Submit and show how the Net Balance recalculates (`Income - Expenses`).
5. **Update Operation:**
   - Locate the `₹500` Food expense in the Transaction History table.
   - Click the **✏️ Edit** button. Modify the amount to `₹650`.
   - Click **Save Changes**. Verify that the table, totals, and charts reflect `₹650`.
6. **Filter & Search:**
   - Select **Expense Only** from the type filter.
   - Type `Food` in the search bar. Observe that only matching records appear.
   - Click **Reset** to restore all records.
7. **Delete Operation:**
   - Click the **🗑️ Delete** button on any transaction.
   - Show that a confirmation dialog appears before deletion. Confirm the action and watch the record disappear.
8. **Containerization & Persistence:**
   - Run `docker compose up --build`. Show both `app` and `mongodb` containers active.
   - Stop containers with `docker compose down`.
   - Start them again with `docker compose up` and refresh the page to prove data persistence via the named volume `mongodb_data`.

---

## 💡 Viva / Technical Q&A Preparation

- **Q: Why use Mongoose instead of the native MongoDB driver?**
  *A: Mongoose provides schema enforcement, built-in type casting, validation rules, default values, and query middleware, which prevents invalid or malformed data from entering MongoDB.*

- **Q: Why are amounts kept positive with a `type` field instead of negative numbers?**
  *A: Storing amounts as positive numbers simplifies input validation, formatting with currency symbols, and aggregation queries. The `type` field (`income` or `expense`) determines whether it adds to or subtracts from the balance.*

- **Q: How does Docker Compose connect the Node app to MongoDB?**
  *A: Docker Compose creates a default bridge network. The Node app container accesses MongoDB using the service hostname `mongodb` (`mongodb://mongodb:27017/expense_tracker`), which Docker resolves automatically using its internal DNS.*

- **Q: How are the charts rendered without a heavy framework?**
  *A: We use Vanilla JavaScript with the standard Fetch API to request aggregation data from `/api/analytics/*` and pass the data directly into Chart.js canvas instances.*

---

## 📄 License
This project is open-source and intended for academic and educational evaluation.
