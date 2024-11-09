import { loadTransactionDetails } from "./localStorage.js";

// DOM Elements
const startDateInput = document.getElementById("start-date");
const endDateInput = document.getElementById("end-date");
const updateChartsButton = document.getElementById("update-charts");

// Canvas Elements for charts
const barChartCanvas = document.getElementById("expenseBarChart");
const pieChartCanvas = document.getElementById("expensePieChart");

// Initialize chart instances
let barChart;
let pieChart;

// Retrieve color cache from localStorage if it exists, or initialize as an empty object
const colorCache = JSON.parse(localStorage.getItem("colorCache")) || {
  barChartColors: {},
  pieChartColors: {},
};

// Function to save color cache to localStorage
function saveColorCache() {
  localStorage.setItem("colorCache", JSON.stringify(colorCache));
}

// Function to generate random colors
function getRandomColor() {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

// Function to get color from cache or generate new (for bar chart)
function getBarChartColor(date) {
  if (!colorCache.barChartColors[date]) {
    colorCache.barChartColors[date] = getRandomColor();
    saveColorCache(); // Save the updated cache to localStorage
  }
  return colorCache.barChartColors[date];
}

// Function to get pie chart color from cache or generate new (for pie chart)
function getPieChartColor(category) {
  if (!colorCache.pieChartColors[category]) {
    colorCache.pieChartColors[category] = getRandomColor();
    saveColorCache(); // Save the updated cache to localStorage
  }
  return colorCache.pieChartColors[category];
}

// Function to filter transactions by date
function filterTransactionsByDate(transactions, startDate, endDate) {
  if (!startDate || !endDate) return transactions; // If no dates are selected, return all transactions

  const start = new Date(startDate);
  const end = new Date(endDate);

  return transactions.filter((transaction) => {
    const transactionDate = new Date(transaction.date);
    return transactionDate >= start && transactionDate <= end;
  });
}
// Function to update the bar chart with the given transactions
function updateBarChart(transactions) {
  // Group expenses by date
  const expenseData = transactions.reduce((acc, transaction) => {
    if (transaction.type === "Expense") {
      const date = transaction.date;
      if (!acc[date]) acc[date] = 0;
      acc[date] += transaction.amount; // Accumulate expense for each date
    }
    return acc;
  }, {});

  const dates = Object.keys(expenseData);
  const expenses = Object.values(expenseData);

  // Use consistent colors for each date
  const barColors = dates.map((date) => getBarChartColor(date));

  if (barChart) barChart.destroy(); // Destroy existing chart instance before re-creating

  barChart = new Chart(barChartCanvas, {
    type: "bar",
    data: {
      labels: dates,
      datasets: [
        {
          label: "Expenses Over Time",
          data: expenses,
          backgroundColor: barColors, // Apply consistent colors here
          borderColor: barColors, // Apply consistent colors as borders
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          type: "time",
          time: {
            unit: "day", // Display bars for each day
          },
        },
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}

// Function to update the pie chart with the given transactions
function updatePieChart(transactions) {
  const expenseCategories = transactions
    .filter((t) => t.type === "Expense")
    .reduce((acc, transaction) => {
      if (!acc[transaction.category]) acc[transaction.category] = 0;
      acc[transaction.category] += transaction.amount;
      return acc;
    }, {});

  const categories = Object.keys(expenseCategories);
  const amounts = Object.values(expenseCategories);

  // Use consistent colors for each category
  const pieColors = categories.map((category) => getPieChartColor(category));

  if (pieChart) pieChart.destroy(); // Destroy existing chart instance before re-creating

  pieChart = new Chart(pieChartCanvas, {
    type: "pie",
    data: {
      labels: categories,
      datasets: [
        {
          label: "Expenses by Category",
          data: amounts,
          backgroundColor: pieColors, // Apply consistent colors to pie chart sections
          borderColor: categories.map(() => "#ffffff"), // White borders for clear separation
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        tooltip: {
          callbacks: {
            label: function (tooltipItem) {
              const total = amounts.reduce((a, b) => a + b, 0);
              const value = amounts[tooltipItem.dataIndex];
              const percentage = ((value / total) * 100).toFixed(2);
              return `${
                categories[tooltipItem.dataIndex]
              }: ₨${value} (${percentage}%)`;
            },
          },
        },
      },
    },
  });
}

// Function to update both charts with all transactions (no date filtering)
function updateChartsWithAllTransactions() {
  const transactions = loadTransactionDetails();

  // Update both charts with all transactions
  updateBarChart(transactions);
  updatePieChart(transactions);
}

// Function to handle updating charts based on selected date range
function updateChartsWithDateRange() {
  const transactions = loadTransactionDetails();
  const startDate = startDateInput.value;
  const endDate = endDateInput.value;

  const filteredTransactions = filterTransactionsByDate(
    transactions,
    startDate,
    endDate
  );

  // Update both charts with filtered transactions
  updateBarChart(filteredTransactions);
  updatePieChart(filteredTransactions);
}

// Event listener for updating charts when the "Update" button is clicked
updateChartsButton.addEventListener("click", updateChartsWithDateRange);

// Automatically update charts whenever a new transaction is added
export function triggerChartUpdates() {
  updateChartsWithAllTransactions();
}

// Trigger initial update on page load
updateChartsWithAllTransactions();
