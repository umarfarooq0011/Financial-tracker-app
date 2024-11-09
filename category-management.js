// category-management.js
import { saveCategories, loadCategories } from "./localStorage.js";

document.addEventListener("DOMContentLoaded", () => {
  let categories =
    loadCategories().length > 0
      ? loadCategories()
      : ["Food", "Rent", "Salary", "Entertainment"]; // Default categories if local storage is empty

  // DOM Elements - Category Management Elements
  const categoryList = document.getElementById("category-management-list");
  const addCategoryInput = document.getElementById("new-category-input");
  const addCategoryButton = document.getElementById("add-category-button");
  const categorySelect = document.querySelector('select[name="category"]');

  /** CATEGORY MANAGEMENT FUNCTIONS **/
  function initializeCategories() {
    updateCategoryOptions();
    renderCategoryList();
    saveCategories(categories); // Save categories to local storage on initialization
  }

  function updateCategoryOptions() {
    categorySelect.innerHTML = ""; // Clear dropdown
    categories.forEach((category) => {
      const option = document.createElement("option");
      option.value = category;
      option.textContent = category;
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

      listItem.innerHTML = `
        <span>${category}</span>
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

      categoryList.appendChild(listItem);
    });
  }

  function addCategory() {
    const newCategory = addCategoryInput.value.trim();
    if (newCategory && !categories.includes(newCategory)) {
      categories.push(newCategory);
      initializeCategories();
      addCategoryInput.value = ""; // Clear input field
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
    Swal.fire({
      title: "Edit Category",
      input: "text",
      inputValue: categories[index],
      showCancelButton: true,
      confirmButtonText: "Save",
      cancelButtonText: "Cancel",
      inputValidator: (value) =>
        !value ? "Please enter a valid category name!" : undefined,
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
