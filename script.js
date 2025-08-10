// Sidebar toggle functionality
document.addEventListener("DOMContentLoaded", function () {
  const sidebar = document.getElementById("sidebar");
  const sidebarToggle = document.getElementById("sidebarToggle");

  // Toggle sidebar when the toggle button is clicked
  sidebarToggle.addEventListener("click", function () {
    sidebar.classList.toggle("expanded");
  });

  // Close sidebar when clicking outside of it
  document.addEventListener("click", function (event) {
    // Check if the click was outside the sidebar and toggle button
    if (
      !sidebar.contains(event.target) &&
      !sidebarToggle.contains(event.target)
    ) {
      sidebar.classList.remove("expanded");
    }
  });

  // Close sidebar when pressing Escape key
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      sidebar.classList.remove("expanded");
    }
  });
});
