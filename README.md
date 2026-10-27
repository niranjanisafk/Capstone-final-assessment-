# Personal Expense Tracker (MERN Stack)

A full-stack Personal Expense Tracker web application built with the **MERN** stack (MongoDB, Express.js, React.js, Node.js). Allows users to track daily expenses, manage categories, view real-time totals, and perform full CRUD (Create, Read, Update, Delete) operations.

---

## 🚀 Features

- **Summary Dashboard**: Displays real-time **Total Amount Spent**, transaction count, and average expense dynamically calculated and updated on any change.
- **Add Expense**:
  - Title
  - Amount (must be positive number > 0)
  - Category (Food, Travel, Bills, Shopping, Other)
  - Date
  - Field validations preventing empty or invalid values with responsive alerts.
- **View Expenses**: Responsive table displaying all expenses sorted by date, with styled category badges and formatted currency/dates.
- **Edit Expense**: Pre-fills the form with current data to edit and update the record seamlessly in database and on screen.
- **Delete Expense**: Deletion with an interactive confirmation modal.
- **Responsive UI/UX**: Clean, modern interface designed with desktop & mobile responsiveness.

---

## 📁 Project Structure

```
project-root/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ConfirmModal.jsx
│   │   │   ├── ExpenseForm.jsx
│   │   │   └── ExpenseList.jsx
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .env
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── backend/
│   ├── models/
│   │   └── Expense.js
│   ├── routes/
│   │   └── expenses.js
│   ├── .env
│   ├── package.json
│   └── server.js
├── .env
└── README.md
```

---

## 🛠️ Setup & Installation Instructions

### 1. Prerequisites
- **Node.js** (v16+ recommended)
- **npm** (v8+ recommended)
- **MongoDB Atlas** database connection string (or local MongoDB)

### 2. Backend Setup
1. Open a terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Verify or update the `.env` file in the `backend/` directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/expense_tracker?retryWrites=true&w=majority
   ```
   *(A dummy/test MongoDB Atlas URI is already preconfigured in the provided `.env` file).*
4. Start the backend server:
   ```bash
   npm start
   ```
   The backend will run on `http://localhost:5000`.

### 3. Frontend Setup
1. In another terminal, navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/expenses` | Fetch all expenses (sorted by date descending) |
| `GET` | `/api/expenses/:id` | Fetch a single expense |
| `POST` | `/api/expenses` | Create a new expense |
| `PUT` | `/api/expenses/:id` | Update an existing expense |
| `DELETE` | `/api/expenses/:id` | Delete an expense |
