// Expense Tracker - frontend logic

//const { act, createElement } = require("react");

// PHASE 2
// Your backend from Phase 1 is already running, with real expenses in the
// database (from schema.sql). Build this page directly against it with
// fetch and async/await - there is no in-memory or localStorage stage
// this time, and no sample data file.
//
// A possible structure (change it if you have a better idea):
//   - async function getExpenses()          fetch(API_URL), return the JSON
//   - async function addExpense(data)       fetch(API_URL, { method: "POST", ... })
//   - async function updateExpense(id,data) fetch(API_URL + "/" + id, { method: "PUT", ... })
//   - async function deleteExpense(id)      fetch(API_URL + "/" + id, { method: "DELETE" })
//   - async function refresh()              get the list, then call renderTable and renderSummary
//   - renderTable(list)                     build the table rows from the array the API returned
//   - renderSummary(list)                   update the summary cards
//   - applyFilter()                         re-render with the list filtered by category
//
// Don't forget:
//   - Show a Bootstrap spinner while a request is in flight.
//   - Wrap every fetch call in try/catch, and show a Bootstrap alert on failure.
//   - After add, edit, or delete, call refresh() so the page always shows
//     what the server actually saved - never update the table by hand.
//   - The API is at http://localhost:3000/api/expenses (see the Roadmap).

// Expense Tracker - frontend logic


const API_URL = "http://localhost:3000/api/expenses";


// ==============================
// Spinner
// ==============================

function showSpinner() {

    document
        .getElementById('spinner')
        .classList
        .remove('d-none');

}


function hideSpinner() {

    document
        .getElementById('spinner')
        .classList
        .add('d-none');

}


// ==============================
// Alert
// ==============================

function showAlert(message, type = "danger") {

    const modalElement = document.getElementById("alertModal");
    const modalTitle = document.getElementById("alertModalTitle");
    const modalBody = document.getElementById("alertModalBody");

    modalBody.textContent = message;

    if (type === "success") {
        modalTitle.textContent = "Success";
    } else {
        modalTitle.textContent = "Error";
    }

    const modal = new bootstrap.Modal(modalElement);

    modal.show();
}




// ==============================
// Get Error Message
// ==============================

async function getErrorMessage(response) {

    try {

        const data = await response.json();

        return data.error || `Error: ${response.status}`;

    } catch {

        return `Error: ${response.status}`;

    }

}


// ==============================
// GET ALL EXPENSES
// ==============================

async function getData() {

    showSpinner();

    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            const message = await getErrorMessage(response);
            showAlert(message);
            return;
        }

        const data = await response.json();

        return data;
    }
    catch (error) {
        showAlert(
            error.message || 'Failed to load expenses.'
        );
        return [];
    }
    finally {
        hideSpinner();
    }
}


// ==============================
// REFRESH
// ==============================

async function refresh() {

    const data = await getData();

    renderTable(data);

    renderSummary(data);

     renderChart(data);

     renderMonthlyExpenses(data);
     
     renderBudget(data);

}


// ==============================
// SUMMARY
// ==============================

function renderSummary(data) {
    // Number of expenses
    document.getElementById('ex-num').innerHTML =
        data.length;

    // Total
    let total = 0;
    data.forEach(expense => {
        total += Number(expense.amount);
    });
    document.getElementById('ex-total').innerHTML =
        total;

    // Highest expense
    let max = 0;
    data.forEach(expense => {
        const amount = Number(expense.amount);
        if (amount > max) {
            max = amount;
        }
    });
    document.getElementById('ex-highest').innerHTML = max;
}


// ==============================
// CHART
// ==============================

let expenseChart;
function renderChart(data) {

    let food = 0;
    let transport = 0;
    let bills = 0;
    let entertainment = 0;
    let other = 0;

    data.forEach(expense => {

        if (expense.category === "Food") {
            food += Number(expense.amount);
        }

        if (expense.category === "Transport") {
            transport += Number(expense.amount);
        }

        if (expense.category === "Bills") {
            bills += Number(expense.amount);
        }

        if (expense.category === "Entertainment") {
            entertainment += Number(expense.amount);
        }

        if (expense.category === "Other") {
            other += Number(expense.amount);
        }

    });

    const canvas = document.getElementById("expenseChart");

    if (expenseChart) {
        expenseChart.destroy();
    }

    expenseChart = new Chart(canvas, {

        type: "pie",

        data: {
            labels: [
                "Food",
                "Transport",
                "Bills",
                "Entertainment",
                "Other"
            ],

            datasets: [
                {
                    label: "Expenses",

                    data: [
                        food,
                        transport,
                        bills,
                        entertainment,
                        other
                    ]
                }
            ]
        },

        options: {
            responsive: true,
        }
    });
}

// ==============================
// MONTHLY EXPENSES
// ==============================

function renderMonthlyExpenses(data) {
    const months = {};
    data.forEach(expense => {
        const month = expense.date.substring(0, 7);
        if (months[month]) {
            months[month] += Number(expense.amount);
        } else {
            months[month] = Number(expense.amount);
        }
    });

    const container = document.getElementById("monthlyExpenses");
    container.innerHTML = "";
    for (let month in months) {
        container.innerHTML += `
            <div class="d-flex justify-content-between mb-2">
                <span>${month}</span>
                <strong>$${months[month].toFixed(2)}</strong>
            </div>
        `;
    }
}

// ==============================
// RENDER TABLE
// ==============================

function renderTable(data) {
    const table = document.getElementById('table');
    table.innerHTML = '';

    data.forEach((expense, index) => {
        const row = document.createElement('tr');

        const badgeColor = getCategoryBadgeColor(expense.category);

        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${expense.title}</td>
            <td>${expense.amount}</td>
            <td>
                <span class="badge ${badgeColor}">
                    ${expense.category}
                </span>
            </td>
            <td>${expense.date}</td>
            <td>
                <button type="button" class="btn btn-warning btn-sm" onclick="editExpense(${expense.id})">
                    Edit
                 </button>
            </td>
            <td>
                <button type="button" class="btn btn-danger btn-sm" onclick="deleteExpense(${expense.id})">
                    Delete
                </button>
            </td>
        `;

        table.appendChild(row);
    });
}

// ==============================
// FILTER by Category & Month
// ==============================

async function applyCategoryFilter() {

    const data = await getData();

    const selectedCategory = document.getElementById('categoryFilter').value;

    if (selectedCategory === "All") {

        renderTable(data);
        return;

    }

    const filteredData = data.filter(expense => {
        return expense.category === selectedCategory;
    });

    renderTable(filteredData);
}
document.getElementById('categoryFilter').addEventListener('change', applyCategoryFilter);

async function applyMonthFilter() {

    const data = await getData();

    const selectedMonth = document.getElementById('monthFilter').value;

    if (selectedMonth === "") {

        renderTable(data);
        return;
    }

    const filteredData = data.filter(expense => {
        return expense.date.startsWith(selectedMonth);
    });
    renderTable(filteredData);
}
document.getElementById('monthFilter').addEventListener('change', applyMonthFilter);



document.getElementById("clearFilter").addEventListener("click", async function () {

    document.getElementById("categoryFilter").value = "All";
    document.getElementById("monthFilter").value = "";
   await refresh();

});


// ==============================
// ADD EXPENSE
// ==============================

const form =
    document.getElementById("expenseForm");


form.addEventListener(
    'submit',
    async (event) => {

        event.preventDefault();


        const title =
            document
                .getElementById('title')
                .value;


        const amount =
            Number(
                document
                    .getElementById('amount')
                    .value
            );


        const category =
            document
                .getElementById('category')
                .value;


        const date =
            document
                .getElementById('date')
                .value;


        // ==============================
        // Frontend Validation
        // ==============================

        if (!title.trim()) {

            showAlert(
                "Title is required."
            );

            return;

        }


        if (!amount || amount <= 0) {

            showAlert(
                "Amount must be greater than 0."
            );

            return;

        }


        if (!date) {

            showAlert(
                "Date is required."
            );

            return;

        }


        showSpinner();


        try {

            const response =
                await fetch(API_URL, {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        title: title.trim(),

                        amount: amount,

                        category: category,

                        date: date

                    })

                });


            if (!response.ok) {

                const message =
                    await getErrorMessage(response);

                throw new Error(message);

            }


            showAlert(
                'Expense added successfully!',
                'success'
            );


            // Get the real data from server

            await refresh();


            form.reset();

        }


        catch (error) {

            console.error(
                'Error while adding expense:',
                error
            );


            showAlert(
                error.message ||
                'Failed to add expense.'
            );

        }


        finally {

            hideSpinner();

        }

    }
);


// ==============================
// DELETE EXPENSE
// ==============================

let expenseToDelete = null;


function deleteExpense(id) {

    expenseToDelete = id;

    const modal = bootstrap.Modal.getOrCreateInstance(
        document.getElementById("deleteModal")
    );

    modal.show();
}


document.getElementById("deleteConfirmBtn").addEventListener(
    "click",
    async function () {

        const modal = bootstrap.Modal.getOrCreateInstance(
            document.getElementById("deleteModal")
        );

        modal.hide();

        showSpinner();

        try {

            const response = await fetch(
                `${API_URL}/${expenseToDelete}`,
                {
                    method: "DELETE"
                }
            );

            if (!response.ok) {

                const message =
                    await getErrorMessage(response);

                throw new Error(message);
            }

            showAlert(
                "Expense deleted successfully!",
                "success"
            );

            await refresh();

        }

        catch (error) {

            console.error(
                "Error while deleting expense:",
                error
            );

            showAlert(
                error.message ||
                "Failed to delete expense."
            );

        }

        finally {

            hideSpinner();

        }

    }
);

// ==============================
// EDIT EXPENSE
// ==============================

async function editExpense(id) {

    const modalBody =
        document.getElementById("modal-body");

    modalBody.innerHTML = "";

    showSpinner();

    try {

        const response =
            await fetch(`${API_URL}/${id}`);

        if (!response.ok) {

            const message =
                await getErrorMessage(response);

            throw new Error(message);
        }

        const expense =
            await response.json();


        modalBody.innerHTML = `

            <form id="expenseFormedit">

                <div class="mb-3">

                    <label class="form-label">
                        Title
                    </label>

                    <input
                        type="text"
                        class="form-control"
                        id="edittitle"
                        value="${expense.title}"
                        required
                    >

                </div>


                <div class="mb-3">

                    <label class="form-label">
                        Amount
                    </label>

                    <input
                        type="number"
                        class="form-control"
                        id="editamount"
                        value="${expense.amount}"
                        step="any"
                        min="0.01"
                        required
                    >

                </div>


                <div class="mb-3">

                    <label class="form-label">
                        Category
                    </label>

                    <select
                        class="form-select"
                        id="editcategory">

                        <option value="Food">
                            Food
                        </option>

                        <option value="Transport">
                            Transport
                        </option>

                        <option value="Bills">
                            Bills
                        </option>

                        <option value="Entertainment">
                            Entertainment
                        </option>

                        <option value="Other">
                            Other
                        </option>

                    </select>

                </div>


                <div class="mb-3">

                    <label class="form-label">
                        Date
                    </label>

                    <input
                        type="date"
                        class="form-control"
                        id="editdate"
                        value="${expense.date}"
                        required
                    >

                </div>


                <button
                    type="submit"
                    class="btn btn-primary w-100">

                    Edit

                </button>

            </form>

        `;


        document.getElementById("editcategory").value =
            expense.category;


        // Open Edit Modal
        const editModal =
            bootstrap.Modal.getOrCreateInstance(
                document.getElementById("editModal")
            );

        editModal.show();


        const editForm =
            document.getElementById("expenseFormedit");


        editForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();


                const title =
                    document.getElementById("edittitle").value;

                const amount =
                    Number(
                        document.getElementById("editamount").value
                    );

                const category =
                    document.getElementById("editcategory").value;

                const date =
                    document.getElementById("editdate").value;


                // Validation

                if (!title.trim()) {

                    showAlert(
                        "Title is required."
                    );

                    return;
                }


                if (!amount || amount <= 0) {

                    showAlert(
                        "Amount must be greater than 0."
                    );

                    return;
                }


                if (!date) {

                    showAlert(
                        "Date is required."
                    );

                    return;
                }


                showSpinner();


                try {

                    const response =
                        await fetch(
                            `${API_URL}/${id}`,
                            {
                                method: "PUT",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body: JSON.stringify({
                                    title: title.trim(),
                                    amount: amount,
                                    category: category,
                                    date: date
                                })
                            }
                        );


                    if (!response.ok) {

                        const message =
                            await getErrorMessage(response);

                        throw new Error(message);
                    }


                    editModal.hide();


                    showAlert(
                        "Expense updated successfully!",
                        "success"
                    );


                    await refresh();

                }

                catch (error) {

                    console.error(
                        "Error while updating expense:",
                        error
                    );

                    showAlert(
                        error.message ||
                        "Failed to update expense."
                    );

                }

                finally {

                    hideSpinner();

                }

            }
        );

    }

    catch (error) {

        console.error(
            "Error while getting expense:",
            error
        );

        showAlert(
            error.message ||
            "Failed to load expense."
        );

    }

    finally {

        hideSpinner();

    }

}

// ==============================
// DARK MODE
// ==============================

function getCategoryBadgeColor(category) {
    switch (category) {
        case 'Food':
            return 'bg-success';     
        case 'Transport':
            return 'bg-primary';      
        case 'Bills':
            return 'bg-danger';      
        case 'Entertainment':
            return 'bg-warning text-dark'; 
        case 'Other':
        default:
            return 'bg-secondary';    
    }
}

const darkModeBtn = document.getElementById("darkModeBtn");

darkModeBtn.addEventListener("click", function () {

    document.body.classList.toggle("dark-mode");

});

// ==============================
// SEARCH
// ==============================

document.getElementById('searchInput').addEventListener('input', async () => {
    const data = await getData(); 
    const searchText = document.getElementById('searchInput').value.toLowerCase();
    const filteredData = data.filter(expense => 
        expense.title.toLowerCase().includes(searchText)
    );
    renderTable(filteredData);
    
});

// ==============================
// EXPORT CSV
// ==============================

async function exportCSV() {

    const data = await getData();

    let csv = "Title,Amount,Category,Date\n";

    data.forEach(expense => {

        csv += `"${expense.title}",${expense.amount},${expense.category},${expense.date}\n`;

    });

    const file = new Blob([csv], {
        type: "text/csv"
    });

    const url = URL.createObjectURL(file);

    const link = document.createElement("a");

    link.href = url;
    link.download = "expenses.csv";

    link.click();

    URL.revokeObjectURL(url);
}


// ==============================
// MONTHLY BUDGET
// ==============================

function renderBudget(data) {

    const MONTHLY_BUDGET = 500;

    const currentMonth =
        new Date().toISOString().substring(0, 7);


    let spent = 0;


    data.forEach(expense => {

        if (expense.date.startsWith(currentMonth)) {

            spent += Number(expense.amount);

        }

    });


    const remaining =
        MONTHLY_BUDGET - spent;


    let percentage =
        (spent / MONTHLY_BUDGET) * 100;


    if (percentage > 100) {
        percentage = 100;
    }


    document.getElementById("budgetSpent")
        .textContent =
        `$${spent.toFixed(2)}`;


    document.getElementById("budgetRemaining")
        .textContent =
        `$${Math.max(remaining, 0).toFixed(2)}`;


    document.getElementById("budgetProgress")
        .style.width =
        `${percentage}%`;


    document.getElementById("budgetProgress")
        .textContent =
        `${Math.round(percentage)}%`;

}


// ==============================
// INITIAL LOAD
// ==============================

refresh();