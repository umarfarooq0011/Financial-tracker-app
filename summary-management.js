import {
  loadTransactionDetails,
  loadMonthlySummaries,
} from "./localStorage.js";

// Select DOM elements to display the financial summary
const highestExpenseElem = document.querySelector(
  "#financial-summary .text-red-500"
);
const mostFrequentExpenseElem = document.querySelector(
  "#financial-summary .text-blue-500"
);
const avgMonthlyIncomeElem = document.querySelector(
  "#financial-summary .text-green-500"
);
const avgMonthlyExpensesElem = document.querySelector(
  "#financial-summary #avg-monthly-expenses"
);
const monthlySummaryContainer = document.getElementById(
  "monthly-summary-container"
); // New container for monthly summaries

// Function to find the category with the highest expense
export function getHighestExpenseCategory(transactions) {
  const expenses = transactions.filter((t) => t.type === "Expense");
  if (expenses.length === 0) return "N/A";

  const categoryTotals = {};
  expenses.forEach(({ category, amount }) => {
    if (!categoryTotals[category]) categoryTotals[category] = 0;
    categoryTotals[category] += amount;
  });

  const highestCategory = Object.keys(categoryTotals).reduce((a, b) =>
    categoryTotals[a] > categoryTotals[b] ? a : b
  );

  return `${highestCategory} - ₨${categoryTotals[highestCategory]}`;
}

// Function to find the most frequently occurring expense category
export function getMostFrequentExpenseCategory(transactions) {
  const expenses = transactions.filter((t) => t.type === "Expense");
  if (expenses.length === 0) return "N/A";

  const categoryFrequency = {};
  expenses.forEach(({ category }) => {
    if (!categoryFrequency[category]) categoryFrequency[category] = 0;
    categoryFrequency[category] += 1;
  });

  const mostFrequentCategory = Object.keys(categoryFrequency).reduce((a, b) =>
    categoryFrequency[a] > categoryFrequency[b] ? a : b
  );

  return `${mostFrequentCategory} - ${categoryFrequency[mostFrequentCategory]} times`;
}

// Function to calculate total income and expenses for a specific month
export function calculateTotalMonthlyIncomeExpenses(transactions, month) {
  let totalIncome = 0;
  let totalExpenses = 0;

  transactions.forEach(({ date, type, amount }) => {
    const transactionMonth = date.slice(0, 7); // Get "YYYY-MM" format
    if (transactionMonth === month) {
      if (type === "Income") {
        totalIncome += amount;
      } else if (type === "Expense") {
        totalExpenses += amount;
      }
    }
  });

  return {
    totalIncome: totalIncome.toFixed(2),
    totalExpenses: totalExpenses.toFixed(2),
  };
}

// Function to update the financial summary on the page
export function updateSummaries() {
  const transactions = loadTransactionDetails();

  // Current month in "YYYY-MM" format
  const currentMonth = new Date().toISOString().slice(0, 7);

  // Load past monthly summaries from local storage
  const pastSummaries = loadMonthlySummaries();

  // Clear the existing summary container
  monthlySummaryContainer.innerHTML = "";

  // Display past monthly summaries
  Object.keys(pastSummaries).forEach((month) => {
    const { avgIncome, avgExpenses } = pastSummaries[month];

    const monthSummaryElem = document.createElement("div");
    monthSummaryElem.classList.add("bg-blue-50", "p-4", "rounded-lg", "shadow");
    monthSummaryElem.innerHTML = `
      <h3 class="text-lg font-semibold mt-4">${month}</h3>
      <p class="text-green-500">Average Income: ₨${avgIncome}</p>
      <p class="text-red-500">Average Expenses: ₨${avgExpenses}</p>
    `;

    // Append the summary section for this month
    monthlySummaryContainer.appendChild(monthSummaryElem);
  });

  // Group transactions by month (YYYY-MM)
  const groupedTransactions = transactions.reduce((acc, transaction) => {
    const transactionMonth = transaction.date.slice(0, 7); // Get "YYYY-MM" format
    if (!acc[transactionMonth]) {
      acc[transactionMonth] = { income: 0, expenses: 0 };
    }
    if (transaction.type === "Income") {
      acc[transactionMonth].income += transaction.amount;
    } else if (transaction.type === "Expense") {
      acc[transactionMonth].expenses += transaction.amount;
    }
    return acc;
  }, {});

  // Loop through each month and create a summary (only one section per month)
  Object.keys(groupedTransactions).forEach((transactionMonth) => {
    const { income, expenses } = groupedTransactions[transactionMonth];

    // Create a new section for each month (aggregating all transactions in the same month)
    const monthSummaryElem = document.createElement("div");
    monthSummaryElem.classList.add("bg-blue-50", "p-4", "rounded-lg", "shadow");
    monthSummaryElem.innerHTML = `
      <h3 class="text-lg font-semibold mt-4">${transactionMonth}</h3>
      <p class="text-green-500">Total Income: ₨${income.toFixed(2)}</p>
      <p class="text-red-500">Total Expenses: ₨${expenses.toFixed(2)}</p>
    `;

    // Append the summary section for this month
    monthlySummaryContainer.appendChild(monthSummaryElem);
  });

  // Update the current financial summary
  highestExpenseElem.textContent = getHighestExpenseCategory(transactions);
  mostFrequentExpenseElem.textContent =
    getMostFrequentExpenseCategory(transactions);

  const { totalIncome, totalExpenses } = calculateTotalMonthlyIncomeExpenses(
    transactions,
    currentMonth
  );
  avgMonthlyIncomeElem.textContent = `₨${totalIncome}`;
  avgMonthlyExpensesElem.textContent = `₨${totalExpenses}`;
}

// Run updateSummaries when the page loads
document.addEventListener("DOMContentLoaded", updateSummaries);
