// ...all your existing code...

// Update modal logic to render modal inside tarot-right instead of document.body
function showModal(cardData) {
  // Find the modal and modal-content in the right pane
  const tarotRight = document.querySelector('.tarot-right');
  let modal = tarotRight.querySelector('.modal');
  let overlay = null; // No overlay for split layout

  // If modal doesn't exist (shouldn't happen), create it
  if (!modal) {
    modal = document.createElement("div");
    modal.className = "modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("tabindex", "-1");
    tarotRight.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="modal-content" tabindex="0">
      <span class="close-modal" tabindex="0" aria-label="Close card details">&times;</span>
      <img src="./images/tarot/${cardData.id}.png" alt="${cardData.name}" />
      <h2 id="modalCardTitle">${cardData.name}</h2>
      <p id="modalCardDescription">${cardData.meaning || ""}</p>
    </div>
  `;
  modal.classList.add("show");
  document.body.classList.add("modal-bg-blur");

  // Focus trap logic (same as before)
  const focusableSelectors =
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
  const focusableEls = modal.querySelectorAll(focusableSelectors);
  const firstFocusable = focusableEls[0];
  const lastFocusable = focusableEls[focusableEls.length - 1];
  lastFocusedElement = document.activeElement;
  if (firstFocusable) firstFocusable.focus();

  function trapFocus(e) {
    if (e.key !== "Tab") return;
    if (focusableEls.length === 0) return;
    if (e.shiftKey) {
      if (document.activeElement === firstFocusable) {
        e.preventDefault();
        lastFocusable.focus();
      }
    } else {
      if (document.activeElement === lastFocusable) {
        e.preventDefault();
        firstFocusable.focus();
      }
    }
  }

  function closeModal() {
    modal.classList.remove("show");
    document.body.classList.remove("modal-bg-blur");
    document.removeEventListener("keydown", escListener);
    document.removeEventListener("keydown", trapFocus);
    if (lastFocusedElement) lastFocusedElement.focus();
  }

  function escListener(e) {
    if (e.key === "Escape") closeModal();
  }
  document.addEventListener("keydown", escListener);
  document.addEventListener("keydown", trapFocus);

  // Close modal logic (close button)
  const closeBtn = modal.querySelector(".close-modal");
  closeBtn.onclick = closeModal;
  closeBtn.onkeydown = (e) => {
    if (e.key === "Enter" || e.key === " ") closeModal();
  };
  // Close modal when clicking outside modal-content
  modal.onclick = (e) => {
    if (e.target === modal) closeModal();
  };
}

// ...rest of your code...