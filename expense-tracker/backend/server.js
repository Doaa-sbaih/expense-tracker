// Expense Tracker - backend (Express API + PostgreSQL)
//
// PHASE 1
// Setup:
//   1. Create a database named expense_tracker and run schema.sql on it.
//   2. Copy .env.example to a new file named .env and write your PostgreSQL password.
//   3. npm install express cors pg dotenv
// Run:    node server.js   (restart it every time you change this file)
//
// Endpoints you need to build:
//   GET    /api/expenses        return all expenses
//   GET    /api/expenses/:id    return one expense (404 if not found)
//   POST   /api/expenses        add an expense (201, or 400 if the data is invalid)
//   PUT    /api/expenses/:id    update an expense (200, 400, or 404)
//   DELETE /api/expenses/:id    delete an expense (200, or 404)
//
// Tips:
//   - Create one Pool (from the "pg" library) with the values from .env,
//     and use pool.query(...) in every route.
//   - ALWAYS send the values as parameters: pool.query("... WHERE id = $1", [id]).
//     NEVER build the SQL text by joining strings with data from the user.
//   - Use RETURNING to get the new (or updated) row back from INSERT and UPDATE.
//   - The database creates the id. The client never sends one.
//   - pg returns NUMERIC as text and DATE as a JavaScript Date, so fix both in your SELECT.
//     Hint: amount::float8 and to_char(date, 'YYYY-MM-DD').
//   - Validate the data before the query, and answer 400 with a message that explains the problem.
//   - Check the id before the query. A text like "abc" makes PostgreSQL throw an error.
//   - Enable CORS so the frontend can talk to the server.
//   - Test every endpoint with Thunder Client BEFORE you connect the frontend.

// Expense Tracker - backend (Express API + PostgreSQL)

// PHASE 1
// Setup:
// 1. Create a database named expense_tracker and run schema.sql on it.
// 2. Create a .env file and write your PostgreSQL password.
// 3. npm install express cors pg dotenv
// Run:
// node server.js


const express = require('express');

const app = express();


// ==============================
// Middleware
// ==============================

app.use(express.json());


const cors = require('cors');

app.use(cors());


require('dotenv').config();


// ==============================
// PostgreSQL
// ==============================

const { Pool } = require('pg');


const pool = new Pool({

    host: process.env.DB_HOST,

    port: process.env.DB_PORT,

    user: process.env.DB_USER,

    password: process.env.DB_PASSWORD,

    database: process.env.DB_NAME

});


// ==============================
// Allowed Categories
// ==============================

const allowedCategories = [
    'Food',
    'Transport',
    'Bills',
    'Entertainment',
    'Other'
];


// ==============================
// GET ALL EXPENSES
// ==============================

app.get(
    '/api/expenses',
    async (req, res) => {

        try {

            const data = await pool.query(`

                SELECT
                    id,
                    title,
                    amount::float8,
                    category,
                    to_char(date, 'YYYY-MM-DD') AS date

                FROM expenses

            `);


            res
                .status(200)
                .json(data.rows);

        }


        catch (err) {

            console.error(err);

            res
                .status(500)
                .json({
                    error: 'Server error'
                });

        }

    }
);


// ==============================
// GET ONE EXPENSE
// ==============================

app.get(
    '/api/expenses/:id',
    async (req, res) => {

        try {

            const { id } = req.params;


            // Check ID

            if (!Number.isInteger(Number(id))) {

                return res
                    .status(404)
                    .json({
                        error: 'ID must be a number'
                    });

            }


            const data =
                await pool.query(

                    `

                    SELECT
                        id,
                        title,
                        amount::float8,
                        category,
                        to_char(date, 'YYYY-MM-DD') AS date

                    FROM expenses

                    WHERE id = $1

                    `,

                    [id]

                );


            if (data.rows.length === 0) {

                return res
                    .status(404)
                    .json({
                        error: 'Expense not found'
                    });

            }


            res
                .status(200)
                .json(data.rows[0]);

        }


        catch (err) {

            console.error(err);

            res
                .status(500)
                .json({
                    error: 'Server error'
                });

        }

    }
);


// ==============================
// POST EXPENSE
// ==============================

app.post(
    '/api/expenses',
    async (req, res) => {

        try {

            const {
                title,
                amount,
                category,
                date
            } = req.body;


            // Title validation

            if (
                !title ||
                title.trim() === ''
            ) {

                return res
                    .status(400)
                    .json({
                        error: 'Title is required'
                    });

            }


            // Amount validation

            if (
                typeof amount !== 'number' ||
                amount <= 0
            ) {

                return res
                    .status(400)
                    .json({
                        error:
                            'Amount must be a number greater than 0'
                    });

            }


            // Category validation

            if (
                !allowedCategories.includes(category)
            ) {

                return res
                    .status(400)
                    .json({
                        error:
                            'Invalid category'
                    });

            }


            // Date validation

            if (!date) {

                return res
                    .status(400)
                    .json({
                        error:
                            'Date is required'
                    });

            }


            const result =
                await pool.query(

                    `

                    INSERT INTO expenses
                    (
                        title,
                        amount,
                        category,
                        date
                    )

                    VALUES
                    (
                        $1,
                        $2,
                        $3,
                        $4
                    )

                    RETURNING
                        id,
                        title,
                        amount::float8,
                        category,
                        to_char(
                            date,
                            'YYYY-MM-DD'
                        ) AS date

                    `,

                    [
                        title.trim(),
                        amount,
                        category,
                        date
                    ]

                );


            res
                .status(201)
                .json(result.rows[0]);

        }


        catch (err) {

            console.error(err);

            res
                .status(500)
                .json({
                    error: 'Server error'
                });

        }

    }
);


// ==============================
// PUT EXPENSE
// ==============================

app.put(
    '/api/expenses/:id',
    async (req, res) => {

        try {

            const { id } = req.params;


            const {
                title,
                amount,
                category,
                date
            } = req.body;


            // Check ID

            if (
                !Number.isInteger(Number(id))
            ) {

                return res
                    .status(400)
                    .json({
                        error:
                            'ID must be a number'
                    });

            }


            // Check if at least one field exists

            if (
                title === undefined &&
                amount === undefined &&
                category === undefined &&
                date === undefined
            ) {

                return res
                    .status(400)
                    .json({
                        error:
                            'Please provide at least one field to update'
                    });

            }


            // Title validation

            if (
                title !== undefined &&
                (
                    typeof title !== 'string' ||
                    title.trim() === ''
                )
            ) {

                return res
                    .status(400)
                    .json({
                        error:
                            'Title cannot be empty'
                    });

            }


            // Amount validation

            if (
                amount !== undefined &&
                (
                    typeof amount !== 'number' ||
                    amount <= 0
                )
            ) {

                return res
                    .status(400)
                    .json({
                        error:
                            'Amount must be a number greater than 0'
                    });

            }


            // Category validation

            if (
                category !== undefined &&
                !allowedCategories.includes(category)
            ) {

                return res
                    .status(400)
                    .json({
                        error:
                            'Invalid category'
                    });

            }


            // Date validation

            if (
                date !== undefined &&
                !date
            ) {

                return res
                    .status(400)
                    .json({
                        error:
                            'Date cannot be empty'
                    });

            }


            const result =
                await pool.query(

                    `

                    UPDATE expenses

                    SET
                        title = COALESCE($2, title),

                        amount = COALESCE($3, amount),

                        category = COALESCE($4, category),

                        date = COALESCE($5, date)

                    WHERE id = $1

                    RETURNING
                        id,
                        title,
                        amount::float8,
                        category,
                        to_char(
                            date,
                            'YYYY-MM-DD'
                        ) AS date

                    `,

                    [
                        id,

                        title !== undefined
                            ? title.trim()
                            : null,

                        amount !== undefined
                            ? amount
                            : null,

                        category !== undefined
                            ? category
                            : null,

                        date !== undefined
                            ? date
                            : null

                    ]

                );


            // Expense not found

            if (
                result.rows.length === 0
            ) {

                return res
                    .status(404)
                    .json({
                        error:
                            'Expense not found'
                    });

            }


            res
                .status(200)
                .json(result.rows[0]);

        }


        catch (err) {

            console.error(err);

            res
                .status(500)
                .json({
                    error: 'Server error'
                });

        }

    }
);


// ==============================
// DELETE EXPENSE
// ==============================

app.delete(
    '/api/expenses/:id',
    async (req, res) => {

        try {

            const { id } = req.params;


            // Check ID

            if (
                !Number.isInteger(Number(id))
            ) {

                return res
                    .status(404)
                    .json({
                        error:
                            'ID must be a number'
                    });

            }


            const result =
                await pool.query(

                    `

                    DELETE FROM expenses

                    WHERE id = $1

                    RETURNING
                        id,
                        title,
                        amount::float8,
                        category,
                        to_char(
                            date,
                            'YYYY-MM-DD'
                        ) AS date

                    `,

                    [id]

                );


            // Expense not found

            if (
                result.rows.length === 0
            ) {

                return res
                    .status(404)
                    .json({
                        error:
                            'Expense not found'
                    });

            }


            res
                .status(200)
                .json(result.rows[0]);

        }


        catch (err) {

            console.error(err);

            res
                .status(500)
                .json({
                    error: 'Server error'
                });

        }

    }
);


// ==============================
// START SERVER
// ==============================

app.listen(
    3000,
    () => {

        console.log(
            "Server is running on port 3000"
        );

    }
);