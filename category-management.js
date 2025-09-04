// category-management.js
import { saveCategories, loadCategories } from "./localStorage.js";

document.addEventListener("DOMContentLoaded", () => {
  let categories =
    loadCategories().length > 0
      ? loadCategories()
      : [
          { name: "Food", emoji: "🍔", color: "#f44336", budget: 0 },
          { name: "Rent", emoji: "🏠", color: "#3f51b5", budget: 0 },
          { name: "Salary", emoji: "💼", color: "#4caf50", budget: 0 },
          { name: "Entertainment", emoji: "🎮", color: "#ff9800", budget: 0 },
        ];

  // DOM Elements - Category Management Elements
  const categoryList = document.getElementById("category-management-list");
  const addCategoryInput = document.getElementById("new-category-input");
  const addCategoryEmoji = document.getElementById("new-category-emoji");
  const addCategoryColor = document.getElementById("new-category-color");
  const addCategoryBudget = document.getElementById("new-category-budget");
  const addCategoryButton = document.getElementById("add-category-button");
  const categorySelect = document.querySelector('select[name="category"]');

  let dragSrcIndex = null;

  /** CATEGORY MANAGEMENT FUNCTIONS **/
  function initializeCategories() {
    updateCategoryOptions();
    renderCategoryList();
    saveCategories(categories); // Save categories to local storage on initialization
  }

  function updateCategoryOptions() {
    if (!categorySelect) return;
    categorySelect.innerHTML = ""; // Clear dropdown
    categories.forEach(({ name, emoji }) => {
      const option = document.createElement("option");
      option.value = name;
      option.textContent = `${emoji ? emoji + " " : ""}${name}`;
      categorySelect.appendChild(option);
    });
  }

  function renderCategoryList() {
    categoryList.innerHTML = ""; // Clear category list
    categories.forEach((category, index) => {
      const listItem = document.createElement("li");
      listItem.classList.add(
        "flex",
        "justify-between",
        "items-center",
        "p-3",
        "border",
        "rounded"
      );
      listItem.setAttribute("draggable", "true");
      listItem.dataset.index = index;
      listItem.style.borderLeft = `8px solid ${category.color}`;

      listItem.innerHTML = `
        <span class="flex items-center">
          <span class="mr-2">${category.emoji || ""}</span>
          <span>${category.name}</span>
          <span class="ml-2 text-sm text-gray-500">(₨${category.budget})</span>
        </span>
        <div>
          <button class="bg-yellow-500 text-white px-2 py-1 rounded edit-category">Edit</button>
          <button class="bg-red-500 text-white px-2 py-1 rounded ml-2 delete-category">Delete</button>
        </div>
      `;

      listItem
        .querySelector(".edit-category")
        .addEventListener("click", () => editCategory(index));
      listItem
        .querySelector(".delete-category")
        .addEventListener("click", () => deleteCategory(index));

      listItem.addEventListener("dragstart", handleDragStart);
      listItem.addEventListener("dragover", handleDragOver);
      listItem.addEventListener("drop", handleDrop);

      categoryList.appendChild(listItem);
    });
  }

  function handleDragStart(e) {
    dragSrcIndex = +this.dataset.index;
    e.dataTransfer.effectAllowed = "move";
  }

  function handleDragOver(e) {
    e.preventDefault();
  }

  function handleDrop(e) {
    e.preventDefault();
    const targetIndex = +this.dataset.index;
    if (dragSrcIndex === targetIndex) return;
    const moved = categories.splice(dragSrcIndex, 1)[0];
    categories.splice(targetIndex, 0, moved);
    initializeCategories();
  }

  function addCategory() {
    const name = addCategoryInput.value.trim();
    const emoji = addCategoryEmoji.value.trim();
    const color = addCategoryColor.value || "#ffffff";
    const budget = parseFloat(addCategoryBudget.value) || 0;

    if (name && !categories.some((c) => c.name === name)) {
      categories.push({ name, emoji, color, budget });
      initializeCategories();
      addCategoryInput.value = "";
      addCategoryEmoji.value = "";
      addCategoryBudget.value = "";
      Swal.fire("Success!", "New category added.", "success");
    } else {
      Swal.fire(
        "Error!",
        "Category already exists or input is empty.",
        "error"
      );
    }
  }

  function editCategory(index) {
    const cat = categories[index];
    Swal.fire({
      title: "Edit Category",
      html: `
        <input id="swal-name" class="swal2-input" value="${cat.name}" placeholder="Name" />
        <input id="swal-emoji" class="swal2-input" value="${cat.emoji || ""}" placeholder="Emoji" />
        <input id="swal-color" type="color" class="swal2-input" value="${cat.color}" />
        <input id="swal-budget" type="number" min="0" class="swal2-input" value="${cat.budget}" placeholder="Budget" />
      `,
      focusConfirm: false,
      showCancelButton: true,
      preConfirm: () => {
        const name = document.getElementById("swal-name").value.trim();
        const emoji = document.getElementById("swal-emoji").value.trim();
        const color = document.getElementById("swal-color").value;
        const budget =
          parseFloat(document.getElementById("swal-budget").value) || 0;
        if (!name) {
          Swal.showValidationMessage("Please enter a valid category name!");
        }
        return { name, emoji, color, budget };
      },
    }).then((result) => {
      if (result.isConfirmed) {
        categories[index] = result.value;
        initializeCategories();
        Swal.fire("Updated!", "Category has been updated.", "success");
      }
    });
  }

  function deleteCategory(index) {
    categories.splice(index, 1);
    initializeCategories();
    Swal.fire({
      icon: "warning",
      iconHtml:
        '<i class="material-icons" style="font-size: 48px; color: #e74c3c;">delete</i>',
      title: "Category Removed",
      text: "The selected category has been successfully deleted.",
      confirmButtonText: "OK",
    });
  }

  // Event Listeners
  addCategoryButton.addEventListener("click", addCategory);

  // Initial Function Calls
  initializeCategories();
});

