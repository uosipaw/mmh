let tarotDeck = [];
let selectedDeck = "classic"; // Track selected deck

// --- DOM Elements ---
const cardsContainer = document.getElementById("cards-container");
const dealBtn = document.getElementById("deal-btn");
const spreadSelect = document.getElementById("spread-select");
const deckSelect = document.getElementById("deck-select");
const searchInput = document.getElementById("search-input");
const searchResults = document.getElementById("search-results");

// Modal Elements
const modal = document.getElementById("card-modal");
const modalTitle = document.getElementById("modal-title");
const modalDesc = document.getElementById("modal-desc");
const modalKeywords = document.getElementById("modal-keywords");
const modalImg = document.getElementById("modal-card-image");
const modalReversed = document.getElementById("modal-reversed");
const modalClose = document.getElementById("modal-close");

// --- Initialization ---
dealBtn.disabled = true;

// 1. Fetch Data
fetch("./tarot-cards.json")
  .then((r) => r.json())
  .then((data) => {
    tarotDeck = data;
    dealBtn.disabled = false;
  })
  .catch((err) => console.error("Error loading deck:", err));

// 2. Event Listeners
dealBtn.addEventListener("click", () => startDealAnimation());

modalClose.addEventListener("click", closeModal);
modal.addEventListener("click", (e) => {
  if (e.target.classList.contains("modal-backdrop")) closeModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});

// Deck Skin Switcher
deckSelect.addEventListener("change", (e) => {
  const root = document.documentElement;
  selectedDeck = e.target.value; // Store selected deck
  let backUrl = "none"; // No background image

  // Apply dark theme for "Midnight Gold" option
  if (e.target.value === "dark") {
    root.setAttribute("data-theme", "dark");
  } else {
    // Light mode for other options
    root.removeAttribute("data-theme");
  }

  root.style.setProperty("--card-back-img", backUrl);
});

// Search Logic
searchInput.addEventListener("input", (e) => {
  const val = e.target.value.toLowerCase();
  searchResults.innerHTML = "";
  if (!val) {
    searchResults.style.display = "none";
    return;
  }

  const matches = tarotDeck.filter((c) => c.name.toLowerCase().includes(val));
  if (matches.length > 0) {
    searchResults.style.display = "block";
    matches.forEach((card) => {
      const div = document.createElement("div");
      div.textContent = card.name;
      div.onclick = () => {
        openCardModal(card, false); // Open directly from search
        searchResults.style.display = "none";
        searchInput.value = "";
      };
      searchResults.appendChild(div);
    });
  } else {
    searchResults.style.display = "none";
  }
});

// --- Core Logic: The Deal Animation ---

function startDealAnimation() {
  if (!tarotDeck.length) return;

  // Clear board
  cardsContainer.innerHTML = "";

  // Set Layout Class
  const spreadType = spreadSelect.value;
  cardsContainer.className = `spread-container spread-${spreadType}`;

  // Determine how many cards
  let count = 1;
  if (spreadType === "3") count = 3;
  if (spreadType === "celtic") count = 10;

  // Shuffle
  const shuffled = [...tarotDeck].sort(() => 0.5 - Math.random());
  const selectedCards = shuffled.slice(0, count);

  // Generate Card Elements (Invisible at first)
  const cardElements = [];

  selectedCards.forEach((cardData, index) => {
    const slot = document.createElement("div");
    slot.className = "card-slot";

    // Structure: Slot -> Inner -> Front/Back
    const inner = document.createElement("div");
    inner.className = "card-inner";

    const faceFront = document.createElement("div");
    faceFront.className = "card-face front"; // The generic back design

    const faceBack = document.createElement("div");
    faceBack.className = "card-face back"; // The actual tarot image

    // Determine image path based on selected deck
    let imgUrl;
    if (selectedDeck === "rwdeck") {
      imgUrl = `./images/tarot/rwdeck/${cardData.id}.png`;
    } else {
      imgUrl = `./images/tarot/${cardData.id}.png`;
    }

    // Preload real image
    const imgObj = new Image();
    imgObj.src = imgUrl;
    imgObj.onload = () => {
      faceBack.style.backgroundImage = `url('${imgUrl}')`;
    };
    // Fallback
    imgObj.onerror = () => {
      faceBack.style.backgroundColor = "#fff";
      faceBack.innerText = cardData.name;
    };

    inner.appendChild(faceFront);
    inner.appendChild(faceBack);
    slot.appendChild(inner);
    cardsContainer.appendChild(slot);

    // Store reference for animation
    cardElements.push({ slot, cardData });

    // Click Interaction
    slot.addEventListener("click", () =>
      handleCardClick(slot, inner, cardData),
    );
  });

  // --- The "Fly In" Animation Calculation ---
  // 1. Get Deck Position
  const deckRect = dealBtn.getBoundingClientRect();

  cardElements.forEach((item, index) => {
    const slot = item.slot;

    // 2. Get the final grid position
    const slotRect = slot.getBoundingClientRect();

    // 3. Calculate delta (How far to move to get back to the deck)
    const deltaX = deckRect.left - slotRect.left;
    const deltaY = deckRect.top - slotRect.top;

    // 4. Apply transform immediately so they start visually "on the deck"
    slot.style.transition = "none";
    slot.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(0.2)`;
    slot.style.opacity = "0";

    // 5. Trigger the animation with staggered delay
    setTimeout(() => {
      slot.style.transition =
        "transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s";
      slot.style.transform = "translate(0, 0) scale(1)";
      slot.style.opacity = "1";
    }, index * 200); // 200ms delay between each card
  });
}

// --- Interaction Logic ---

function handleCardClick(slot, inner, cardData) {
  // State 1: Face Down -> Flip Up
  if (!slot.classList.contains("flipped")) {
    slot.classList.add("flipped");

    // Determine Reversal (Random 50/50 on flip)
    const isReversed = Math.random() < 0.5;
    if (isReversed) {
      inner.querySelector(".back").classList.add("reversed");
      slot.dataset.reversed = "true";
    }
  }
  // State 2: Face Up -> Open Modal
  else {
    const isRev = slot.dataset.reversed === "true";
    openCardModal(cardData, isRev);
  }
}

function openCardModal(card, isReversed) {
  modalTitle.textContent = card.name;
  modalKeywords.textContent = (card.keywords || []).join(" • ");

  if (isReversed) {
    modalReversed.classList.remove("hidden");
    modalDesc.textContent =
      card.description?.reversed || "No description available.";
    modalImg.style.transform = "rotate(180deg)";
  } else {
    modalReversed.classList.add("hidden");
    modalDesc.textContent =
      card.description?.upright || "No description available.";
    modalImg.style.transform = "none";
  }

  const imgUrl = `./images/tarot/${card.id}.png`;
  modalImg.style.backgroundImage = `url('${imgUrl}')`;

  modal.classList.remove("hidden");
}

function closeModal() {
  modal.classList.add("hidden");
}
