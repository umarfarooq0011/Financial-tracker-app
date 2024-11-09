// Function to show the loader and hide the content
function showLoader() {
  const loader = document.getElementById("loader");
  const contentWrapper = document.getElementById("content-wrapper");

  loader.style.display = "block";
  contentWrapper.style.display = "none"; // Hide the content initially
}

// Function to hide the loader and show the content
function hideLoader() {
  const loader = document.getElementById("loader");
  const contentWrapper = document.getElementById("content-wrapper");

  loader.style.display = "none"; // Hide the loader
  contentWrapper.style.display = "block"; // Show the content once everything is loaded
}

// Show loader as soon as the DOM is ready (this runs even if page is refreshed)
document.addEventListener("DOMContentLoaded", () => {
  showLoader(); // Start showing loader
});

// Hide loader when the full page (including all resources) has loaded
window.addEventListener("load", () => {
  hideLoader(); // Hide loader when all page resources are fully loaded
});

// Optional: Set a fallback timeout to hide loader after a maximum wait time (in case of extremely slow network)
setTimeout(() => {
  if (document.getElementById("loader").style.display === "block") {
    hideLoader(); // Fallback in case loading takes too long
  }
}, 10000); // Set timeout to 10 seconds (adjust as needed)

// Show loader again when user refreshes the page manually
window.addEventListener("beforeunload", () => {
  showLoader(); // Show loader again when page is being refreshed
});
