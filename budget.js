// budget.js
export function setBudget(setBudgetInput, alertMessage, budgetDisplay, Swal) {
  let budgetAmount = parseFloat(setBudgetInput.value);
  if (!budgetAmount || budgetAmount <= 0) {
    Swal.fire({
      icon: "warning",
      title: "Invalid Budget",
      text: "Please enter a valid budget amount.",
      confirmButtonText: "OK",
    });
    return;
  }
  alertMessage.textContent = ""; // Clear previous alerts
  budgetDisplay.textContent = `Budget Set: ₨${budgetAmount}`; // Display the set budget
  Swal.fire({
    iconHtml: `
      <style>
        .swal-checkmark {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background-color: #4CAF50;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: popIn 0.3s ease;
        }
        @keyframes popIn {
          0% { transform: scale(0); }
          80% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
      </style>
      <div class="swal-checkmark">
        <i class="material-icons" style="color: white; font-size: 36px;">check</i>
      </div>
    `,
    title: "Budget Set!",
    text: "Your budget has been set successfully!",
    confirmButtonText: "OK",
  });
  setBudgetInput.value = ""; // Reset the budget input field after setting
  return budgetAmount;
}

export function checkBudget(totalExpenses, budgetAmount, Swal) {
  if (budgetAmount > 0 && totalExpenses > budgetAmount) {
    Swal.fire({
      icon: "error",
      iconHtml:
        '<span class="material-icons" style="color: #e74c3c;">warning</span>',
      title: "Budget Exceeded!",
      text: "You have exceeded your budget limit!",
      confirmButtonText: "OK",
    });
    return false;
  }
  return true;
}
