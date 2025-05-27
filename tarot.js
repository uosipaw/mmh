const deck = document.getElementById("deck");
const spreadSelect = document.getElementById("spreadSelect");
let cardElements = [];
let lastFocusedElement = null;
const spreadLayouts = {
  celticCross: {
    numCards: 10,
    columns: 3,
    rows: 4,
    positions: {
      1: { label: "Present", gridArea: "2 / 2 / 3 / 3" },
      2: { label: "Challenge", gridArea: "2 / 3 / 3 / 4" },
      3: { label: "Past", gridArea: "1 / 2 / 2 / 3" },
      4: { label: "Future", gridArea: "3 / 2 / 4 / 3" },
      5: { label: "Above", gridArea: "2 / 1 / 3 / 2" },
      6: { label: "Below", gridArea: "4 / 2 / 5 / 3" },
      7: { label: "Advice", gridArea: "1 / 3 / 2 / 4" },
      8: { label: "External", gridArea: "3 / 3 / 4 / 4" },
      9: { label: "Hopes", gridArea: "4 / 3 / 5 / 4" },
      10: { label: "Outcome", gridArea: "4 / 1 / 5 / 2" },
    },
  },
  threeCard: {
    numCards: 3,
    columns: 3,
    rows: 1,
    positions: {
      1: { label: "Past", gridArea: "1 / 1 / 2 / 2" },
      2: { label: "Present", gridArea: "1 / 2 / 2 / 3" },
      3: { label: "Future", gridArea: "1 / 3 / 2 / 4" },
    },
  },
};

// Load the full deck from tarot-cards.json
let fullDeck = [];
fetch("tarot-cards.json")
  .then((res) => res.json())
  .then((data) => {
    fullDeck = data.cards;
    // Optionally, initialize the deck/spread here if needed
    // e.g., createCards(fullDeck);
  });

// Helper to create a card DOM element with unique face and common back
function createCardElement(cardData, cardSize) {
  const card = document.createElement("div");
  card.className = "card";
  card.setAttribute("tabindex", "0");
  card.setAttribute("data-id", cardData.id);

  // Card inner for flip animation
  const cardInner = document.createElement("div");
  cardInner.className = "card-inner";

  // Card front (face)
  const cardFront = document.createElement("div");
  cardFront.className = "card-front";
  const faceImg = document.createElement("img");
  faceImg.src = `./images/tarot/${cardData.id}.png`;
  faceImg.alt = cardData.name;
  cardFront.appendChild(faceImg);

  // Card back (shared image)
  const cardBack = document.createElement("div");
  cardBack.className = "card-back";
  const backImg = document.createElement("img");
  backImg.src = "./images/tarot/back.png";
  backImg.alt = "Tarot Card Back";
  cardBack.appendChild(backImg);

  cardInner.appendChild(cardFront);
  cardInner.appendChild(cardBack);
  card.appendChild(cardInner);

  // Optionally set card size
  if (cardSize) {
    card.style.width = cardSize.width + "px";
    card.style.height = cardSize.height + "px";
  }

  // ...add event listeners for flip/modal as needed...

  return card;
}

function createCards(cards) {
  const layout = spreadSelect.value;
  const spreadLayout = spreadLayouts[layout];
  if (!spreadLayout) return;

  const cardSize = calculateCardSize(
    layout,
    deck.offsetWidth,
    deck.offsetHeight
  );
  const selectedCards = cards.slice(0, spreadLayout.numCards);

  deck.innerHTML = "";
  cardElements = [];

  deck.style.gridTemplateColumns = `repeat(${spreadLayout.columns}, 1fr)`;
  deck.style.gridTemplateRows = `repeat(${spreadLayout.rows}, 1fr)`;

  // Render all card descriptions for the spread in the left column
  const spreadDescriptionsDiv = document.getElementById("spreadDescriptions");
  spreadDescriptionsDiv.innerHTML = "";
  selectedCards.forEach((cardData, i) => {
    const pos = spreadLayout.positions[i + 1];
    const descBlock = document.createElement("div");
    descBlock.className = "card-desc-block";
    const label = document.createElement("div");
    label.className = "card-desc-label";
    label.textContent = pos && pos.label ? pos.label : cardData.name;
    const text = document.createElement("div");
    text.className = "card-desc-text";
    text.textContent = cardData.meaning || "";
    descBlock.appendChild(label);
    descBlock.appendChild(text);
    spreadDescriptionsDiv.appendChild(descBlock);
  });

  // Render cards in the right column
  selectedCards.forEach((cardData, i) => {
    const card = createCardElement(cardData, cardSize);
    const pos = spreadLayout.positions[i + 1];
    // Position cards in grid (right side)
    card.style.gridArea = pos && pos.gridArea ? pos.gridArea : "auto";
    deck.appendChild(card);
    cardElements.push(card);
  });
}

function showModal(cardData) {
  // Find the modal and modal-content in the right pane
  const tarotRight = document.querySelector(".tarot-right");
  let modal = tarotRight.querySelector(".modal");

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

document.addEventListener("DOMContentLoaded", () => {
  const introOverlay = document.getElementById("introOverlay");
  const deckIntro = document.querySelector(".deck-intro");
  if (deckIntro) {
    deckIntro.addEventListener("click", () => {
      introOverlay.classList.add("hide");
      setTimeout(() => {
        if (introOverlay.parentNode) {
          introOverlay.parentNode.removeChild(introOverlay);
        }
      }, 600); // Wait for fade-out transition
      reshuffle();
    });
  }
});
