// START OF tarot.js

window.addEventListener("DOMContentLoaded", () => {
  initTarot();
});

// --- Configuration ---
const ARC_STRUCTURE = [7, 6, 5, 4, 3, 2, 1]; // Cards per row, bottom-up
const MAX_CARDS = ARC_STRUCTURE.reduce((sum, count) => sum + count, 0); // Total cards based on structure

let tarotData = null;
let shuffledDeck = [];
let currentCardIndex = 0;
let drawnCardElements = []; // Keep track of drawn card DOM elements

async function initTarot() {
  const tarotJsonPath = "./tarot-cards.json";

  try {
    const response = await fetch(tarotJsonPath);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    tarotData = await response.json();
    console.log(
      `Tarot card data loaded. Max cards for arc structure: ${MAX_CARDS}`
    );

    if (tarotData && tarotData.cards) {
      shuffleDeck(); // Initial shuffle
      initTarotInterface();
    } else {
      console.error("Tarot data is not in the expected format:", tarotData);
    }
  } catch (error) {
    console.error("Error loading tarot card data:", error);
  }
}

function shuffleDeck() {
  if (!tarotData || !tarotData.cards) return;
  shuffledDeck = [...tarotData.cards].sort(() => Math.random() - 0.5);
  currentCardIndex = 0;
  console.log("Deck Shuffled");
}

function resetDeck() {
  const drawnCardsContainer = document.getElementById("drawn-cards");
  if (drawnCardsContainer) {
    drawnCardElements.forEach((card) => {
      card.style.opacity = "0";
      card.style.transform = "scale(0.8)"; // Animate shrink/fade out
    });
    setTimeout(() => {
      drawnCardsContainer.innerHTML = "";
      drawnCardElements = [];
      shuffleDeck();
      console.log("Deck Reset");
    }, 500);
  } else {
    drawnCardElements = [];
    shuffleDeck();
    console.log("Deck Reset (container fallback)");
  }
}

function initTarotInterface() {
  const deckElement = document.getElementById("deck");
  const drawnCardsContainer = document.getElementById("drawn-cards");
  const cardFocusModal = document.getElementById("card-focus");
  const overlayElement = document.getElementById("overlay");
  const closeButtonElement = document.getElementById("close-button");
  const resetButtonElement = document.getElementById("reset-button");

  if (
    !deckElement ||
    !drawnCardsContainer ||
    !cardFocusModal ||
    !overlayElement ||
    !closeButtonElement ||
    !resetButtonElement
  ) {
    console.error("Interface error: Base layout element(s) not found.");
    return;
  }

  const focusCardImage = document.getElementById("focus-card-image");
  const focusCardName = document.getElementById("focus-card-name");
  const focusCardOrientation = document.getElementById(
    "focus-card-orientation"
  );
  const focusCardText = document.getElementById("focus-card-text");
  if (
    !focusCardImage ||
    !focusCardName ||
    !focusCardOrientation ||
    !focusCardText
  ) {
    console.error("Interface error: Modal content element(s) not found.");
  }

  deckElement.addEventListener("click", drawAndPositionCard);
  resetButtonElement.addEventListener("click", resetDeck);
  closeButtonElement.addEventListener("click", closeCardFocus);
  overlayElement.addEventListener("click", closeCardFocus);
  document.addEventListener("keydown", (event) => {
    if (
      event.key === "Escape" &&
      cardFocusModal.classList.contains("visible")
    ) {
      closeCardFocus();
    }
  });
  initResizeListener(drawnCardsContainer);
}

function drawAndPositionCard() {
  const drawnCardsContainer = document.getElementById("drawn-cards");
  if (!drawnCardsContainer) {
    console.error("Container missing!");
    return;
  }

  if (currentCardIndex >= shuffledDeck.length) {
    console.warn("Deck empty!");
    alert("Deck empty! Please reset the deck.");
    return;
  }
  // Use the calculated MAX_CARDS based on ARC_STRUCTURE
  if (drawnCardElements.length >= MAX_CARDS) {
    console.warn(
      `Maximum cards (${MAX_CARDS}) reached for defined arc structure.`
    );
    alert("Maximum cards reached. Please reset the deck.");
    return;
  }

  const cardData = shuffledDeck[currentCardIndex++];
  const isReversed = Math.random() < 0.5;
  const cardDiv = document.createElement("div");

  cardDiv.classList.add("card");
  cardDiv.style.backgroundImage = `url('./images/tarot/${cardData.id}.png')`;
  cardDiv.setAttribute(
    "aria-label",
    `Tarot card: ${cardData.name} ${isReversed ? "(Reversed)" : "(Upright)"}`
  );
  cardDiv.dataset.isReversed = String(isReversed);
  cardDiv.dataset.cardId = cardData.id;
  cardDiv.dataset.cardName = cardData.name;
  cardDiv.addEventListener("click", () => handleCardClick(cardData.id));

  const initialRotation = isReversed ? 180 : 0;
  cardDiv.style.opacity = "0";
  cardDiv.style.transform = `scale(0.5) rotate(${initialRotation}deg)`;

  drawnCardsContainer.appendChild(cardDiv);
  drawnCardElements.push(cardDiv); // Keep track of the element

  requestAnimationFrame(() => {
    positionCardsInArc();
    requestAnimationFrame(() => {
      const newlyAddedCardElement =
        drawnCardElements[drawnCardElements.length - 1];
      if (newlyAddedCardElement) {
        const finalRotation =
          newlyAddedCardElement.dataset.isReversed === "true" ? 180 : 0;
        newlyAddedCardElement.style.opacity = "1";
        newlyAddedCardElement.style.transform = `scale(1) rotate(${finalRotation}deg)`;
      }
    });
  });
}

function getCardRowInfo(overallIndex, structure) {
  let cumulativeCards = 0;
  for (let rowIndex = 0; rowIndex < structure.length; rowIndex++) {
    const numCardsInThisRow = structure[rowIndex];
    if (overallIndex < cumulativeCards + numCardsInThisRow) {
      return {
        rowIndex: rowIndex,
        indexInRow: overallIndex - cumulativeCards,
        numCardsInRow: numCardsInThisRow,
      };
    }
    cumulativeCards += numCardsInThisRow;
  }
  // Should not happen if draw limit is enforced, but good to handle
  console.warn(`Card index ${overallIndex} exceeds defined structure!`);
  return null; // Indicate an error or out of bounds
}

function positionCardsInArc() {
  const container = document.getElementById("drawn-cards");
  if (!container) return;

  const containerWidth = container.offsetWidth;
  const containerHeight = container.offsetHeight;
  const totalDrawnCount = drawnCardElements.length;

  if (totalDrawnCount === 0 || !containerWidth || !containerHeight) return;

  // --- Positioning Parameters ---
  const horizontalRadiusFactor = 0.25; // Reduced from 0.45 to make arcs narrower
  const verticalRadiusFactor = 0.8; // Increased from 0.45 for steeper arcs
  const bottomRowCenterYFactor = 0.88; // Moved slightly lower (from 0.85)
  const topRowCenterYFactor = 0.45; // Moved slightly higher (from 0.2)
  const numRows = ARC_STRUCTURE.length;
  const rowSpacing =
    numRows > 1
      ? (bottomRowCenterYFactor - topRowCenterYFactor) / (numRows - 1)
      : 0;

  const centerX = containerWidth / 2;
  const horizontalRadius = containerWidth * horizontalRadiusFactor;
  // Maybe fixed vertical radius looks better? Experiment.
  const verticalRadius = (containerHeight * verticalRadiusFactor) / numRows; // Example scaling

  // --- Loop through drawn elements ---
  drawnCardElements.forEach((card, overallIndex) => {
    if (!card) return;

    const rowInfo = getCardRowInfo(overallIndex, ARC_STRUCTURE);
    if (!rowInfo) return; // Skip if index is out of bounds

    const { rowIndex, indexInRow, numCardsInRow } = rowInfo;

    // Calculate Y center for this specific row (row 0 is bottom)
    const targetCenterY =
      containerHeight * (bottomRowCenterYFactor - rowIndex * rowSpacing);

    // Calculate angle parameters for this row
    const angleSpread = Math.min(numCardsInRow * 20, 170); // Adjust angle step per card?
    const startAngle = -90 - angleSpread / 2;
    const angleStep = numCardsInRow > 1 ? angleSpread / (numCardsInRow - 1) : 0;
    const angle = startAngle + indexInRow * angleStep;
    const angleRad = angle * (Math.PI / 180);

    const computedStyle = getComputedStyle(card);
    const effectiveCardWidth =
      card.offsetWidth || parseFloat(computedStyle.width) || 110;
    const effectiveCardHeight =
      card.offsetHeight || parseFloat(computedStyle.height) || 165;

    if (!effectiveCardWidth || !effectiveCardHeight) {
      console.warn(`Card ${overallIndex} has zero dimensions.`);
    }

    let x =
      centerX + horizontalRadius * Math.cos(angleRad) - effectiveCardWidth / 2;
    let y =
      targetCenterY +
      verticalRadius * Math.sin(angleRad) -
      effectiveCardHeight / 2;

    if (isNaN(x) || isNaN(y)) {
      console.error(`NaN pos calc for card ${overallIndex}.`);
      return;
    }

    // Apply position and zIndex
    card.style.left = `${x}px`;
    card.style.top = `${y}px`;
    card.style.zIndex = overallIndex; // Stacking remains based on overall draw order
  });
}

// --- Resize Handler ---
function initResizeListener(container) {
  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    if (container && container.offsetParent !== null) {
      resizeTimeout = setTimeout(positionCardsInArc, 250);
    }
  });
}

// --- Modal and Click Handling ---
function handleCardClick(cardId) {
  const cardElement = drawnCardElements.find(
    (el) => el.dataset.cardId === cardId
  );
  const cardJsonData = tarotData.cards.find((c) => c.id === cardId);
  if (cardElement && cardJsonData) {
    const isReversed = cardElement.dataset.isReversed === "true";
    showCardFocus(cardJsonData, isReversed);
  } else {
    console.error("Focus Error: Missing card data/element for ", cardId);
  }
}

function showCardFocus(cardData, isReversed) {
  const modal = document.getElementById("card-focus");
  const overlay = document.getElementById("overlay");
  const focusCardImage = document.getElementById("focus-card-image");
  const focusCardName = document.getElementById("focus-card-name");
  const focusCardOrientation = document.getElementById(
    "focus-card-orientation"
  );
  const focusCardText = document.getElementById("focus-card-text");
  const textContainer = document.getElementById("focus-card-text-container");
  if (
    !modal ||
    !overlay ||
    !focusCardImage ||
    !focusCardName ||
    !focusCardOrientation ||
    !focusCardText ||
    !textContainer
  ) {
    console.error("Modal Error: Elements missing.");
    return;
  }
  if (!cardData) {
    console.error("Focus Error: Invalid cardData.");
    return;
  }

  focusCardName.textContent = cardData.name || "Unknown Card";
  focusCardOrientation.textContent = isReversed ? "Reversed" : "Upright";
  const descObj = cardData.description || {};
  const descText =
    descObj[isReversed ? "reversed" : "upright"] || "Desc missing.";
  focusCardText.innerHTML = descText.replace(/<br\s*\/?>/gi, "\n");
  focusCardImage.src = `./images/tarot/${cardData.id}.png`;
  focusCardImage.alt = `${cardData.name || "Tarot"} ${
    isReversed ? "rev" : "upr"
  }`;
  focusCardImage.classList.toggle("reversed", isReversed);
  modal.classList.add("visible");
  overlay.classList.add("visible");
  textContainer.scrollTop = 0;
}

function closeCardFocus() {
  const modal = document.getElementById("card-focus");
  const overlay = document.getElementById("overlay");
  if (modal) modal.classList.remove("visible");
  if (overlay) overlay.classList.remove("visible");
}

// END OF tarot.js
