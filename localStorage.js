// Save budget amount to local storage
export function saveBudget(budgetAmount) {
  localStorage.setItem("budgetAmount", budgetAmount);
   console.log("Budget saved to local storage:", budgetAmount);
}

// Save transaction data (income and expenses) to local storage
export function saveTransaction(totalIncome, totalExpenses) {
  localStorage.setItem("totalIncome", totalIncome);
  localStorage.setItem("totalExpenses", totalExpenses);
  console.log("Transaction data saved to local storage:", {
    totalIncome,
    totalExpenses,
  });
}

// Save individual transaction details to local storage
export function saveTransactionDetails(transactions) {
  localStorage.setItem("transactions", JSON.stringify(transactions));
  console.log("Individual transactions saved to local storage:", transactions);
}

// Load budget amount from local storage
export function loadBudget() {
  const budgetAmount = parseFloat(localStorage.getItem("budgetAmount")) || 0;
  console.log("Loaded budget from local storage:", budgetAmount);
  return budgetAmount;
}

// Load transaction data (income and expenses) from local storage
export function loadTransaction() {
  const totalIncome = parseFloat(localStorage.getItem("totalIncome")) || 0;
  const totalExpenses = parseFloat(localStorage.getItem("totalExpenses")) || 0;
  console.log("Loaded transaction data from local storage:", {
    totalIncome,
    totalExpenses,
  });
  return { totalIncome, totalExpenses };
}

// Load individual transaction details from local storage
export function loadTransactionDetails() {
  const transactions = JSON.parse(localStorage.getItem("transactions")) || [];
  console.log(
    "Loaded individual transactions from local storage:",
    transactions
  );
  return transactions;
}

// Remove a specific transaction from local storage
export function removeTransaction(transactionToRemove) {
  let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
  transactions = transactions.filter(
    (transaction) =>
      !(
        transaction.type === transactionToRemove.type &&
        transaction.amount === transactionToRemove.amount &&
        transaction.date === transactionToRemove.date &&
        transaction.description === transactionToRemove.description &&
        transaction.category === transactionToRemove.category
      )
  );
  localStorage.setItem("transactions", JSON.stringify(transactions));
  console.log("Transaction removed from local storage:", transactionToRemove);
}

// Save categories to local storage
export function saveCategories(categories) {
  localStorage.setItem("categories", JSON.stringify(categories));
  console.log("Categories saved to local storage:", categories);
}

// Load categories from local storage
export function loadCategories() {
  const categories = JSON.parse(localStorage.getItem("categories")) || [];
  console.log("Loaded categories from local storage:", categories);
  return categories;
}

// Save monthly summary to local storage
export function saveMonthlySummary(month, summary) {
  const monthlySummaries =
    JSON.parse(localStorage.getItem("monthlySummaries")) || {};
  monthlySummaries[month] = summary;
  localStorage.setItem("monthlySummaries", JSON.stringify(monthlySummaries));
  console.log(`Monthly summary for ${month} saved to local storage:`, summary);
}

// Load all monthly summaries from local storage
export function loadMonthlySummaries() {
  const monthlySummaries =
    JSON.parse(localStorage.getItem("monthlySummaries")) || {};
  console.log("Loaded monthly summaries from local storage:", monthlySummaries);
  return monthlySummaries;
}
