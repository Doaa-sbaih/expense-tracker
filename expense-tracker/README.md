# Expense Tracker

Expense Tracker is a web application for managing personal expenses. The backend provides a REST API connected to a PostgreSQL database to add, edit, delete, and retrieve expenses. The frontend provides a simple and responsive interface for managing and viewing expenses.

## How to run

### Backend

1. Open the project in VS Code.

2. Open PostgreSQL and create a database named `expense_tracker`.

3. Run the `schema.sql` file on the `expense_tracker` database to create the required tables and sample data.

4. Open the backend folder and create a `.env` file.

5. Add your PostgreSQL connection details to the `.env` file:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=expense_tracker
```

6. Open the terminal in the backend folder and install the dependencies:

```bash
npm install
```

7. Start the backend server:

```bash
node server.js
```

8. The backend will run on:

```text
http://localhost:3000
```

### Frontend

1. Keep the backend server running.

2. Open the frontend folder in VS Code.

3. Open `index.html` using Live Server.

4. The frontend will connect to the backend API at:

```text
http://localhost:3000/api/expenses
```

## Features

* [x] Add an expense with validation
* [x] Delete an expense
* [x] Edit an expense using a Bootstrap modal
* [x] Filter expenses by category
* [x] Summary cards showing total amount, number of expenses, and highest expense
* [x] Data is saved in a PostgreSQL database
* [x] Bootstrap spinner while loading data
* [x] Bootstrap alerts for errors
* [x] Responsive design for different screen sizes
* [x] REST API using Express
* [x] CRUD operations using `fetch` and `async/await`

## Screenshots

### Main Dashboard
![Main Dashboard](screenshoot/home.png)

### Add Expense
![Add Expense](screenshoot/add-expense.png)

### Edit Expense
![Edit Expense](screenshoot/edit-expense.png)

### Mobile View
![Mobile View](screenshoot/mobile.png)

## What was the hardest part?

The hardest part was connecting the Express backend to PostgreSQL and making sure the API handled validation, IDs, errors, and CRUD operations correctly.

Another challenging part was connecting the frontend to the API using `fetch`, `async/await`, and `try/catch`. Making sure the page refreshed from the server after adding, editing, or deleting an expense was also an important part of the project.

Testing the different endpoints with Thunder Client helped identify and fix issues before connecting the frontend.
