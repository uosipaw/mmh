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

// --- Post-intro View Elements ---
const appUi = document.querySelector(".app-ui");
const readerStage = document.querySelector(".stage");

const tarotHome = document.getElementById("tarot-home");
const tarotGuide = document.getElementById("tarot-guide");
const spreadLibraryView = document.getElementById("spread-library");

const pullCardsBtn = document.getElementById("pull-cards-btn");
const cardGuideBtn = document.getElementById("card-guide-btn");
const dailyDrawBtn = document.getElementById("daily-draw-btn");
const spreadLibraryBtn = document.getElementById("spread-library-btn");

const guideSearchInput = document.getElementById("guide-search");
const guideFilterSelect = document.getElementById("guide-filter");
const guideOrientationSelect = document.getElementById("guide-orientation");
const guideList = document.getElementById("guide-list");
const guideDetail = document.getElementById("guide-detail");
const guideEmpty = document.getElementById("guide-empty");

const spreadLibraryGrid = document.getElementById("spread-library-grid");

const guideState = {
  activeCardId: null,
};

// --- Opening Sequence ---
const openingSequence = document.getElementById("opening-sequence");
const openingSkip = document.getElementById("opening-skip");
const openingLine = document.getElementById("opening-line");

const openingLines = [
  "shuffling the bad omens.",
  "asking the cards to act normal.",
  "consulting the tiny cardboard problem committee.",
  "opening the curtain.",
];

const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;
const introStorageKey = "mdsnTarotIntroSeen";

function completeOpeningSequence() {
  document.body.classList.remove("tarot-loading");
  document.body.classList.add("intro-complete");

  try {
    sessionStorage.setItem(introStorageKey, "true");
  } catch (error) {
    // If storage is blocked, the intro still closes. Technology remains brave.
  }

  if (!openingSequence) return;

  openingSequence.setAttribute("aria-hidden", "true");

  openingSequence.addEventListener(
    "transitionend",
    () => {
      openingSequence.remove();
    },
    { once: true },
  );
}

function runOpeningSequence() {
  if (!openingSequence) {
    document.body.classList.remove("tarot-loading");
    return;
  }

  let introAlreadySeen = false;

  try {
    introAlreadySeen = sessionStorage.getItem(introStorageKey) === "true";
  } catch (error) {
    introAlreadySeen = false;
  }

  if (prefersReducedMotion || introAlreadySeen) {
    completeOpeningSequence();
    return;
  }

  let lineIndex = 0;

  const lineTimer = window.setInterval(() => {
    lineIndex += 1;

    if (!openingLine || !openingLines[lineIndex]) {
      window.clearInterval(lineTimer);
      return;
    }

    openingLine.textContent = openingLines[lineIndex];
  }, 780);

  openingSkip?.addEventListener(
    "click",
    () => {
      window.clearInterval(lineTimer);
      completeOpeningSequence();
    },
    { once: true },
  );

  window.setTimeout(() => {
    window.clearInterval(lineTimer);
    completeOpeningSequence();
  }, 3600);
}

// --- Initialization ---
dealBtn.disabled = true;

// Helper function to determine correct image extension
function getImageUrl(deckName, cardId) {
  // Try .png first, fallback to .jpg
  return {
    primary: `./images/tarot/${deckName}/${cardId}.png`,
    fallback: `./images/tarot/${deckName}/${cardId}.jpg`,
  };
}

// 1. Fetch Data
fetch("./tarot-cards.json")
  .then((r) => r.json())
  .then((data) => {
    tarotDeck = data;
    dealBtn.disabled = false;

    // Set default back image based on initial deck selection
    const root = document.documentElement;
    const initialDeck = deckSelect.value;
    let backUrl = "none";

    if (initialDeck === "rwdeck") {
      backUrl = `url('./images/tarot/rwdeck/back.jpg')`;
    } else if (initialDeck === "mdsndeck") {
      backUrl = `url('./images/tarot/mdsndeck/back.png')`;
    }

    root.style.setProperty("--card-back-img", backUrl);
    renderCardGuide();
    renderSpreadLibrary();
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

  // Set back image based on selected deck
  if (e.target.value === "rwdeck") {
    backUrl = `url('./images/tarot/rwdeck/back.jpg')`;
  } else if (e.target.value === "mdsndeck") {
    backUrl = `url('./images/tarot/mdsndeck/back.png')`;
  }

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

  document.body.classList.add("cards-dealt");

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

    // Get image paths with fallback
    const imagePaths = getImageUrl(selectedDeck, cardData.id);

    // Preload real image with fallback
    const imgObj = new Image();
    imgObj.src = imagePaths.primary;
    imgObj.onload = () => {
      faceBack.style.backgroundImage = `url('${imagePaths.primary}')`;
    };
    imgObj.onerror = () => {
      // Try fallback extension
      const fallbackImg = new Image();
      fallbackImg.src = imagePaths.fallback;
      fallbackImg.onload = () => {
        faceBack.style.backgroundImage = `url('${imagePaths.fallback}')`;
      };
      fallbackImg.onerror = () => {
        // Final fallback: show card name
        faceBack.style.backgroundColor = "#fff";
        faceBack.innerText = cardData.name;
      };
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

  // Use selectedDeck folder for image path with fallback
  const imagePaths = getImageUrl(selectedDeck, card.id);

  // Try primary extension first
  const imgObj = new Image();
  imgObj.src = imagePaths.primary;
  imgObj.onload = () => {
    modalImg.style.backgroundImage = `url('${imagePaths.primary}')`;
  };
  imgObj.onerror = () => {
    // Try fallback extension
    const fallbackImg = new Image();
    fallbackImg.src = imagePaths.fallback;
    fallbackImg.onload = () => {
      modalImg.style.backgroundImage = `url('${imagePaths.fallback}')`;
    };
  };

  modal.classList.remove("hidden");
}

function closeModal() {
  modal.classList.add("hidden");
}

// --- Post-intro Navigation + Card Guide ---

const viewClasses = ["view-lobby", "view-reader", "view-guide", "view-spreads"];

const majorArcanaIds = new Set([
  "thefool",
  "themagician",
  "thehighpriestess",
  "theempress",
  "theemperor",
  "thehierophant",
  "thelovers",
  "thechariot",
  "strength",
  "thehermit",
  "wheeloffortune",
  "justice",
  "thehangedman",
  "death",
  "temperance",
  "thedevil",
  "thetower",
  "thestar",
  "themoon",
  "thesun",
  "judgement",
  "theworld",
]);

const spreadLibraryData = [
  {
    title: "daily draw",
    value: "1",
    cards: "1 card",
    note: "A quick check-in. Best for daily guidance, tiny omens, and not turning breakfast into a full investigation.",
  },
  {
    title: "past, present, future",
    value: "3",
    cards: "3 cards",
    note: "A clean little timeline. Useful when something has a before, a now, and an incoming consequence wearing boots.",
  },
  {
    title: "relationship pulse",
    value: "3",
    cards: "3 cards",
    note: "Use the three cards as you, them, and the weather system between you. Very scientific. Obviously.",
  },
  {
    title: "money / career check",
    value: "3",
    cards: "3 cards",
    note: "Use the three cards as pressure, opportunity, and next move. Great for when money is being weird, so, often.",
  },
  {
    title: "decision spread",
    value: "3",
    cards: "3 cards",
    note: "Use the three cards as option one, option two, and what you are refusing to admit matters.",
  },
  {
    title: "celtic cross",
    value: "celtic",
    cards: "10 cards",
    note: "The big one. For when the question has grown legs, opened mail, and started affecting your sleep.",
  },
];

function setView(viewName) {
  const className = {
    home: "view-lobby",
    reader: "view-reader",
    guide: "view-guide",
    spreads: "view-spreads",
  }[viewName];

  if (!className) return;

  document.body.classList.remove(...viewClasses);
  document.body.classList.add(className);

  if (tarotHome) tarotHome.hidden = viewName !== "home";
  if (tarotGuide) tarotGuide.hidden = viewName !== "guide";
  if (spreadLibraryView) spreadLibraryView.hidden = viewName !== "spreads";

  if (appUi) appUi.hidden = viewName !== "reader";
  if (readerStage) readerStage.hidden = viewName !== "reader";

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

function resetReaderBoard() {
  document.body.classList.remove("cards-dealt");
  cardsContainer.innerHTML = "";
  cardsContainer.className = "spread-container";
}

function openReader(options = {}) {
  const { spreadValue = null, dealNow = false, reset = true } = options;

  if (reset) resetReaderBoard();

  if (spreadValue) {
    spreadSelect.value = spreadValue;
  }

  setView("reader");

  if (dealNow) {
    dealWhenDeckIsReady();
  }
}

function dealWhenDeckIsReady() {
  if (tarotDeck.length) {
    window.setTimeout(() => {
      startDealAnimation();
    }, 180);
    return;
  }

  let attempts = 0;

  const waitForDeck = window.setInterval(() => {
    attempts += 1;

    if (tarotDeck.length) {
      window.clearInterval(waitForDeck);
      startDealAnimation();
    }

    if (attempts > 40) {
      window.clearInterval(waitForDeck);
    }
  }, 100);
}

function openGuide() {
  setView("guide");
  renderCardGuide();

  window.setTimeout(() => {
    guideSearchInput?.focus();
  }, 120);
}

function openSpreadLibrary() {
  setView("spreads");
  renderSpreadLibrary();
}

function getCardFamily(card) {
  const compactId = String(card.id || "")
    .toLowerCase()
    .replace(/[^a-z]/g, "");
  const compactName = String(card.name || "")
    .toLowerCase()
    .replace(/[^a-z]/g, "");
  const haystack = `${compactId} ${compactName}`;

  if (majorArcanaIds.has(compactId)) return "major";
  if (haystack.includes("cups")) return "cups";
  if (haystack.includes("pentacles")) return "pentacles";
  if (haystack.includes("coins")) return "pentacles";
  if (haystack.includes("swords")) return "swords";
  if (haystack.includes("wands")) return "wands";

  return "other";
}

function getFilteredGuideCards() {
  const searchValue = (guideSearchInput?.value || "").trim().toLowerCase();
  const filterValue = guideFilterSelect?.value || "all";

  return tarotDeck.filter((card) => {
    const keywords = (card.keywords || []).join(" ").toLowerCase();
    const searchableText = `${card.name} ${card.id} ${keywords}`.toLowerCase();
    const cardFamily = getCardFamily(card);

    const matchesSearch = !searchValue || searchableText.includes(searchValue);
    const matchesFilter = filterValue === "all" || cardFamily === filterValue;

    return matchesSearch && matchesFilter;
  });
}

function renderCardGuide() {
  if (!guideList || !guideDetail) return;

  guideList.innerHTML = "";

  if (!tarotDeck.length) {
    guideDetail.innerHTML = `<p class="empty-guide-note">Loading the card guide. The spirits are looking for the JSON file.</p>`;
    return;
  }

  const cards = getFilteredGuideCards();

  if (!cards.length) {
    if (guideEmpty) guideEmpty.hidden = false;
    guideDetail.innerHTML = `<p class="empty-guide-note">No matching card. Deeply suspicious.</p>`;
    return;
  }

  if (guideEmpty) guideEmpty.hidden = true;

  const activeStillExists = cards.some(
    (card) => card.id === guideState.activeCardId,
  );

  if (!guideState.activeCardId || !activeStillExists) {
    guideState.activeCardId = cards[0].id;
  }

  cards.forEach((card) => {
    const button = document.createElement("button");
    const keywords = (card.keywords || []).slice(0, 3).join(" • ");

    button.type = "button";
    button.className = "guide-card-btn";
    button.dataset.cardId = card.id;

    if (card.id === guideState.activeCardId) {
      button.classList.add("active");
    }

    button.innerHTML = `
      <strong>${escapeHtml(card.name)}</strong>
      <span>${escapeHtml(keywords)}</span>
    `;

    button.addEventListener("click", () => {
      guideState.activeCardId = card.id;
      renderCardGuide();
    });

    guideList.appendChild(button);
  });

  const activeCard =
    tarotDeck.find((card) => card.id === guideState.activeCardId) || cards[0];
  renderGuideDetail(activeCard);
}

function renderGuideDetail(card) {
  if (!guideDetail || !card) return;

  const orientation = guideOrientationSelect?.value || "upright";
  const description =
    card.description?.[orientation] || "No description available.";
  const keywords = (card.keywords || []).join(" • ");

  guideDetail.innerHTML = "";

  const wrapper = document.createElement("div");
  wrapper.className = "guide-detail-inner";

  const image = document.createElement("div");
  image.className = "guide-card-image";
  image.textContent = card.name;

  const info = document.createElement("div");

  const title = document.createElement("h2");
  title.textContent = card.name;

  const keywordLine = document.createElement("p");
  keywordLine.className = "guide-keywords";
  keywordLine.textContent = `${orientation} • ${keywords}`;

  const descriptionWrapper = document.createElement("div");
  descriptionWrapper.className = "guide-description";

  description.split(/\n\n+/).forEach((paragraphText) => {
    const paragraph = document.createElement("p");
    paragraph.textContent = paragraphText;
    descriptionWrapper.appendChild(paragraph);
  });

  info.appendChild(title);
  info.appendChild(keywordLine);
  info.appendChild(descriptionWrapper);

  wrapper.appendChild(image);
  wrapper.appendChild(info);

  guideDetail.appendChild(wrapper);
  setCardGuideImage(image, card);
}

function setCardGuideImage(element, card) {
  const imagePaths = getImageUrl(selectedDeck, card.id);

  element.style.backgroundImage = "none";

  const primaryImage = new Image();

  primaryImage.onload = () => {
    element.textContent = "";
    element.style.backgroundImage = `url('${imagePaths.primary}')`;
  };

  primaryImage.onerror = () => {
    const fallbackImage = new Image();

    fallbackImage.onload = () => {
      element.textContent = "";
      element.style.backgroundImage = `url('${imagePaths.fallback}')`;
    };

    fallbackImage.onerror = () => {
      element.textContent = card.name;
    };

    fallbackImage.src = imagePaths.fallback;
  };

  primaryImage.src = imagePaths.primary;
}

function renderSpreadLibrary() {
  if (!spreadLibraryGrid) return;

  spreadLibraryGrid.innerHTML = "";

  spreadLibraryData.forEach((spread) => {
    const button = document.createElement("button");

    button.type = "button";
    button.className = "spread-card";
    button.dataset.spreadValue = spread.value;

    button.innerHTML = `
      <small>${escapeHtml(spread.cards)}</small>
      <h2>${escapeHtml(spread.title)}</h2>
      <p>${escapeHtml(spread.note)}</p>
    `;

    button.addEventListener("click", () => {
      openReader({
        spreadValue: spread.value,
        reset: true,
      });
    });

    spreadLibraryGrid.appendChild(button);
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

pullCardsBtn?.addEventListener("click", () => {
  openReader({
    reset: true,
  });
});

dailyDrawBtn?.addEventListener("click", () => {
  openReader({
    spreadValue: "1",
    dealNow: true,
    reset: true,
  });
});

cardGuideBtn?.addEventListener("click", openGuide);
spreadLibraryBtn?.addEventListener("click", openSpreadLibrary);

document.querySelectorAll("[data-view='home']").forEach((button) => {
  button.addEventListener("click", () => {
    setView("home");
  });
});

guideSearchInput?.addEventListener("input", renderCardGuide);
guideFilterSelect?.addEventListener("change", renderCardGuide);
guideOrientationSelect?.addEventListener("change", renderCardGuide);

deckSelect.addEventListener("change", () => {
  const activeCard = tarotDeck.find(
    (card) => card.id === guideState.activeCardId,
  );

  if (activeCard && document.body.classList.contains("view-guide")) {
    renderGuideDetail(activeCard);
  }
});

setView("home");
runOpeningSequence();
