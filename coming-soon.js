// Set target launch date here (YYYY, M-1, D, H, M, S) - months are 0-indexed
const target = new Date(2025, 11, 25, 12, 0, 0); // Dec 25, 2025 12:00:00

function pad(n) {
  return String(n).padStart(2, "0");
}

function updateCountdown() {
  const now = new Date();
  let diff = Math.max(0, target - now);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  diff -= days * (1000 * 60 * 60 * 24);
  const hours = Math.floor(diff / (1000 * 60 * 60));
  diff -= hours * (1000 * 60 * 60);
  const minutes = Math.floor(diff / (1000 * 60));
  diff -= minutes * (1000 * 60);
  const seconds = Math.floor(diff / 1000);

  document.getElementById("days").textContent = pad(days);
  document.getElementById("hours").textContent = pad(hours);
  document.getElementById("minutes").textContent = pad(minutes);
  document.getElementById("seconds").textContent = pad(seconds);

  if (target - now <= 0) {
    // optional: show launched state
    document.querySelector(".animated-text").textContent = "launched";
    clearInterval(timer);
  }
}

// set readable date text
document.getElementById("target-date").textContent = target.toLocaleString(
  undefined,
  { dateStyle: "full", timeStyle: "short" }
);

updateCountdown();
const timer = setInterval(updateCountdown, 1000);

document.addEventListener("DOMContentLoaded", function () {
  var popup = document.getElementById("popup");
  var container = document.getElementById("booking-container");
  var form = document.getElementById("appointment-form");
  var formInputs = document.querySelectorAll("#appointment-form input");

  // Function to pause animation
  function pauseAnimation() {
    container.classList.add("paused");
    popup.classList.add("paused");
  }

  // Function to resume animation
  function resumeAnimation() {
    container.classList.remove("paused");
    popup.classList.remove("paused");
  }

  // Event listener for mouse entering the container
  container.addEventListener("mouseenter", function () {
    pauseAnimation();
  });

  // Event listener for mouse leaving the container
  container.addEventListener("mouseleave", function () {
    resumeAnimation();
  });

  // Submit form event listener
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    // Pause animation while form is being submitted
    pauseAnimation();
    // Simulate form submission (replace with actual implementation)
    setTimeout(function () {
      // Show success message
      var messageDiv = document.getElementById("message");
      messageDiv.innerHTML = "Appointment booked successfully!";
      messageDiv.style.color = "green";
      // Clear form fields
      form.reset();
      // Resume animation after form submission is complete
      resumeAnimation();
    }, 1000); // Simulate server response time
  });
  // Pause animation when any form input is focused
  formInputs.forEach(function (input) {
    input.addEventListener("focus", pauseAnimation);
    input.addEventListener("blur", resumeAnimation);
  });

  // Sidebar / menu toggle behavior
  var menuToggle = document.getElementById("menu-toggle");
  var sidebar = document.getElementById("sidebar");
  var sidebarClose = document.getElementById("sidebar-close");
  var overlay = document.getElementById("overlay");

  function openSidebar() {
    sidebar.setAttribute("aria-hidden", "false");
    menuToggle.setAttribute("aria-expanded", "true");
    overlay.hidden = false;
    overlay.classList.add("show");
    // trap focus roughly by moving focus to close button
    sidebarClose.focus();
  }

  function closeSidebar() {
    sidebar.setAttribute("aria-hidden", "true");
    menuToggle.setAttribute("aria-expanded", "false");
    overlay.classList.remove("show");
    // hide after transition
    setTimeout(function () {
      overlay.hidden = true;
    }, 260);
    menuToggle.focus();
  }

  if (menuToggle) {
    menuToggle.addEventListener("click", function (e) {
      var expanded = menuToggle.getAttribute("aria-expanded") === "true";
      if (!expanded) openSidebar();
      else closeSidebar();
    });
  }

  if (sidebarClose) sidebarClose.addEventListener("click", closeSidebar);
  if (overlay) overlay.addEventListener("click", closeSidebar);

  // close with Esc
  document.addEventListener("keydown", function (e) {
    if (
      e.key === "Escape" &&
      sidebar &&
      sidebar.getAttribute("aria-hidden") === "false"
    ) {
      closeSidebar();
    }
  });
});
