import { setBudget, checkBudget } from "./budget.js";
import {
  saveTransaction,
  saveBudget,
  loadTransaction,
  loadBudget,
  saveTransactionDetails,
  loadTransactionDetails,
  removeTransaction,
  saveMonthlySummary,
  loadMonthlySummaries,
} from "./localStorage.js";
import { updateSummaries } from "./summary-management.js";
import { triggerChartUpdates } from "./chart-management.js";
import {
  convertCurrency,
  getCurrencies,
  updateCurrencyOptions,
  attachCurrencyConversionListener,
} from "./currencies.js"; // Import currency functions

// Variables to track budget, income, and expenses
let budgetAmount = loadBudget();
let { totalIncome, totalExpenses } = loadTransaction();
let transactions = loadTransactionDetails();

// DOM Elements
const setBudgetInput = document.querySelector(
  "#budget-tracking input[type='number']"
);
const setBudgetButton = document.querySelector("#budget-tracking button");
const alertMessage = document.querySelector("#budget-tracking .text-red-500");
const addTransactionForm = document.getElementById("add-transaction-form");
const transactionsList = document.getElementById("transactions-list");
const categorySelect = addTransactionForm.querySelector(
  'select[name="category"]'
);
const descriptionTextarea = addTransactionForm.querySelector("textarea");
const totalIncomeElem = document.querySelector("#dashboard .text-green-500");
const totalExpensesElem = document.querySelector("#dashboard .text-red-500");
const currentBalanceElem = document.querySelector("#dashboard .text-blue-500");
const downloadButton = document.getElementById("download-transactions-button");
const currencySelect = addTransactionForm.querySelector(
  'select[name="currency"]'
); // Currency dropdown
const amountInput = addTransactionForm.querySelector('input[type="number"]'); // Amount input
const conversionDisplay = document.createElement("p"); // Display for converted amount
conversionDisplay.classList.add("text-sm", "text-gray-600", "mt-1");

// Append the conversion display under amount input
amountInput.parentElement.appendChild(conversionDisplay);

// Ensure the currency dropdown is populated and conversion listener is attached when DOM is ready
document.addEventListener("DOMContentLoaded", async () => {
  await updateCurrencyOptions(currencySelect); // Populate currency dropdown
  attachCurrencyConversionListener(
    amountInput,
    currencySelect,
    conversionDisplay
  ); // Attach currency conversion listener

  resetMonthlyDataIfNewMonth(); // Reset monthly data if necessary
  budgetDisplay.textContent = `Budget Set: ₨${budgetAmount}`;
  alertMessage.textContent = "";
  updateBalanceDisplay();
  transactions.forEach(({ type, amount, date, description, category }) => {
    addTransactionToUI(type, amount, date, description, category);
  });
  updateSummaries();

  // Attach event listener for download button
  downloadButton.addEventListener("click", downloadTransactionsAsPDF);
});

// Create and add a display element for showing the budget amount
const budgetDisplay = document.createElement("p");
budgetDisplay.classList.add("text-blue-500", "font-semibold", "mt-2");
setBudgetInput.parentElement.appendChild(budgetDisplay);

// Function to update income and expenses totals based on transaction type
function updateExpenses(amount, type) {
  if (type === "Expense") {
    totalExpenses += amount; // Increment total expenses
  } else if (type === "Income") {
    totalIncome += amount; // Increment total income
  }
  updateBalanceDisplay();
  saveTransaction(totalIncome, totalExpenses); // Save updated totals to local storage
  return checkBudget(totalExpenses, budgetAmount, Swal); // Check budget only when adding expenses
}

// Function to update the balance display in the dashboard
function updateBalanceDisplay() {
  const currentBalance = totalIncome - totalExpenses;
  totalIncomeElem.textContent = `₨:${totalIncome.toFixed(1)}`;
  totalExpensesElem.textContent = `₨:${totalExpenses.toFixed(1)}`;
  currentBalanceElem.textContent = `₨:${currentBalance.toFixed(1)}`;
}

// Function to reset monthly data and save the past month's summary
function resetMonthlyDataIfNewMonth() {
  const currentMonth = new Date().toISOString().slice(0, 7); // Get current "YYYY-MM"
  const lastMonth = localStorage.getItem("lastMonth");

  if (lastMonth && lastMonth !== currentMonth) {
    const summary = {
      totalIncome,
      totalExpenses,
      transactions: [...transactions],
    };
    saveMonthlySummary(lastMonth, summary);

    totalIncome = 0;
    totalExpenses = 0;
    transactions = [];
    localStorage.removeItem("transactions"); // Clear transactions of the previous month
    saveTransaction(totalIncome, totalExpenses); // Save reset totals
    console.log(`Monthly data reset for ${lastMonth}. Summary stored.`);
  }
  localStorage.setItem("lastMonth", currentMonth);
}

// Function to add transaction to the UI
function addTransactionToUI(
  transactionType,
  amount,
  date,
  description,
  category
) {
  const listItem = document.createElement("li");
  listItem.classList.add(
    "flex", // Flex layout
    "flex-col", // On smaller screens, the items will stack vertically
    "sm:flex-row", // On larger screens, it will revert to row layout
    "justify-between", // Ensure spacing between elements
    "items-center", // Center vertically in row layout
    "p-4", // Add padding for a premium look
    "border-b", // Border at the bottom
    "bg-white", // White background for a clean look
    "shadow-lg", // Shadow for a premium effect
    "rounded-lg", // Rounded corners for a modern design
    "mb-4" // Add margin between list items
  );

  const deleteButton = document.createElement("button");
  deleteButton.innerHTML =
    '<span class="material-icons text-red-500 cursor-pointer">delete</span>';
  deleteButton.classList.add(
    "mt-4", // Add margin-top for mobile view
    "sm:mt-0", // Remove margin-top in larger view
    "ml-0", // Remove left margin on mobile view
    "sm:ml-4" // Add left margin in larger view
  );

  // Add delete button functionality
  deleteButton.addEventListener("click", () =>
    handleDeleteTransaction(
      listItem,
      amount,
      transactionType,
      date,
      description,
      category
    )
  );

  listItem.innerHTML = `
    <p>${transactionType} - ${description} (${category})</p>
    <p class="${
      transactionType === "Income" ? "text-green-500" : "text-red-500"
    } font-bold">
      ${transactionType === "Income" ? "+" : "-"}₨${amount}
    </p>
    <p>${date}</p>
  `;

  listItem.appendChild(deleteButton);
  transactionsList.appendChild(listItem);
}

// Function to handle deleting a transaction
function handleDeleteTransaction(
  listItem,
  amount,
  type,
  date,
  description,
  category
) {
  Swal.fire({
    title: "Are you sure?",
    text: "Do you really want to delete this transaction? This action cannot be undone.",
    iconHtml: `<style>
      .dustbin-container { width: 60px; height: 60px; border-radius: 50%; background-color: #f44336; display: flex; align-items: center; justify-content: center; position: relative; }
      .dustbin-lid { animation: openLid 1s ease forwards; transform-origin: bottom center; }
      @keyframes openLid { 0% { transform: rotate(0); } 25% { transform: rotate(-15deg); } 50% { transform: rotate(0); } 100% { transform: rotate(-10deg); } }
    </style>
    <div class="dustbin-container">
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path class="dustbin-lid" d="M9 3V4H4V6H5H19H20V4H15V3H9Z" fill="white"/>
        <path d="M5 6H19V20C19 21.1 18.1 22 17 22H7C5.9 22 5 21.1 5 20V6Z" fill="white"/>
        <path d="M9 8H11V18H9V8ZM13 8H15V18H13V8Z" fill="#f44336"/>
      </svg>
    </div>`,

    showCancelButton: true,
    confirmButtonText: "Yes, delete it!",
    cancelButtonText: "No, keep it",
  }).then((result) => {
    if (result.isConfirmed) {
      // Update totalIncome or totalExpenses accordingly
      if (type === "Income") totalIncome -= amount;
      else totalExpenses -= amount;

      // Remove the transaction from the DOM
      listItem.remove();

      // Update the balance display
      updateBalanceDisplay();

      // Remove the transaction from local storage and update the transactions list
      transactions = transactions.filter(
        (transaction) =>
          !(
            transaction.type === type &&
            transaction.amount === amount &&
            transaction.date === date &&
            transaction.description === description &&
            transaction.category === category
          )
      );
      saveTransactionDetails(transactions);

      // Update income and expenses in local storage
      saveTransaction(totalIncome, totalExpenses);

      // Update summaries
      updateSummaries();

      console.log("Transaction removed successfully.");
    }
  });
}

// Event Listeners
setBudgetButton.addEventListener("click", () => {
  budgetAmount = setBudget(setBudgetInput, alertMessage, budgetDisplay, Swal);
  saveBudget(budgetAmount); // Save budget to local storage
});

addTransactionForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const transactionType = addTransactionForm.querySelector(
    "select[name='transaction-type']"
  ).value;
  const amount = parseFloat(amountInput.value);
  const date = addTransactionForm.querySelector('input[type="date"]').value;
  const description = descriptionTextarea.value.trim();
  const category = categorySelect.value;
  const currency = currencySelect.value;

  if (!amount || !date) {
    Swal.fire({
      icon: "warning",
      title: "Missing Info",
      text: "Please add an amount and date to continue.",
      confirmButtonText: "OK",
    });
    return;
  }

  // Convert amount to PKR before adding transaction
  const convertedAmount = await convertCurrency(amount, currency, "PKR");
  const finalAmount = convertedAmount ? parseFloat(convertedAmount) : amount;

  addTransactionToUI(transactionType, finalAmount, date, description, category);

  transactions.push({
    type: transactionType,
    amount: finalAmount,
    date,
    description,
    category,
    currency,
  });
  saveTransactionDetails(transactions);
  triggerChartUpdates();

  if (updateExpenses(finalAmount, transactionType)) {
    Swal.fire({
      iconHtml:
        transactionType === "Income"
          ? '<span class="material-icons" style="color: #4CAF50;">add_circle</span>'
          : '<span class="material-icons" style="color: #e74c3c;">arrow_downward</span>',
      title:
        transactionType === "Income" ? "Income Added!" : "Amount Deducted!",
      text:
        transactionType === "Income"
          ? "Income has been added successfully!"
          : "Amount has been deducted successfully!",
      confirmButtonText: "OK",
    });
  }

  addTransactionForm.reset();
  conversionDisplay.textContent = ""; // Reset conversion display
  updateSummaries();
});

// Function to generate PDF
function generatePDF(transactions) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // Add title with a larger font
  doc.setFontSize(22);
  doc.setTextColor(40);
  doc.text("SaveSpree - Recent Transactions", 105, 15, null, null, "center");

  // Add a horizontal line under the title
  doc.setDrawColor(0);
  doc.setLineWidth(0.5);
  doc.line(10, 20, 200, 20);

  // Table Headers
  const headers = [["#", "Type", "Description", "Category", "Amount", "Date"]];

  // Format the transactions data into rows
  const rows = transactions.map(
    ({ type, amount, date, description, category }, index) => [
      index + 1, // Index
      type, // Transaction type (Income/Expense)
      description, // Description
      category, // Category
      `Rs. ${parseFloat(amount).toLocaleString()}`, // Correctly format the amount with "Rs."
      date, // Date
    ]
  );

  // Add table headers
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.autoTable({
    head: headers,
    body: rows,
    startY: 25,
    theme: "grid",
    headStyles: { fillColor: [63, 81, 181] },
    styles: { fontSize: 10, cellPadding: 3 },
    columnStyles: {
      0: { halign: "center", cellWidth: 10 }, // Align index to center
      4: { halign: "right", cellWidth: 30 }, // Align amount to the right with more space
      5: { halign: "center", cellWidth: 30 }, // Align date to the center
    },
  });

  // Footer with date
  const currentDate = new Date().toLocaleString();
  doc.setFontSize(10);
  doc.text(
    `Generated on: ${currentDate}`,
    10,
    doc.internal.pageSize.height - 10
  );

  // Save the PDF
  doc.save("transactions.pdf");
}

// Function to download transactions as a PDF
function downloadTransactionsAsPDF() {
  if (transactions.length === 0) {
    Swal.fire({
      icon: "warning",
      title: "No Transactions",
      text: "There are no transactions to download.",
      confirmButtonText: "OK",
    });
  } else {
    generatePDF(transactions);
  }
}

// Ensure download button is properly defined after DOM loads
document.addEventListener("DOMContentLoaded", () => {
  downloadButton.addEventListener("click", downloadTransactionsAsPDF);
});
