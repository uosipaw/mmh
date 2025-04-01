// START OF tarot.js

window.addEventListener("DOMContentLoaded", () => {
  initTarot();
});

// --- Configuration ---
// Define the number of cards per row, starting from the bottom row.
// Example: [9, 7, 5] for 3 rows, wider at the bottom.
// Example: [15] for a single large arc.
const ARC_STRUCTURE = [7, 6, 5, 4, 3, 2, 1]; // Cards per row, bottom-up (Current: 7 rows)
const MAX_CARDS = ARC_STRUCTURE.reduce((sum, count) => sum + count, 0); // Total cards based on structure (updates automatically)

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
      card.style.transform = "scale(0.8) rotate(0deg)"; // Animate shrink/fade out (reset rotation)
    });
    setTimeout(() => {
      drawnCardsContainer.innerHTML = "";
      drawnCardElements = [];
      shuffleDeck();
      console.log("Deck Reset");
    }, 500); // Match transition duration in CSS if needed
  } else {
    // Fallback if container is somehow missing during reset
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

  // Ensure modal content elements exist (optional check, good practice)
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
    console.warn(
      "Interface warning: Modal content element(s) might be missing, but proceeding."
    );
  }

  deckElement.addEventListener("click", drawAndPositionCard);
  resetButtonElement.addEventListener("click", resetDeck);
  closeButtonElement.addEventListener("click", closeCardFocus);
  overlayElement.addEventListener("click", closeCardFocus); // Close on overlay click
  document.addEventListener("keydown", (event) => {
    if (
      event.key === "Escape" &&
      cardFocusModal && // Check if modal exists
      cardFocusModal.classList.contains("visible")
    ) {
      closeCardFocus();
    }
  });

  // Initialize resize listener only if the container exists
  if (drawnCardsContainer) {
    initResizeListener(drawnCardsContainer);
  }
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
  if (drawnCardElements.length >= MAX_CARDS) {
    console.warn(
      `Maximum cards (${MAX_CARDS}) reached for defined arc structure.`
    );
    alert(`Maximum cards (${MAX_CARDS}) reached. Please reset the deck.`);
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

  // --- INITIAL State for Animation (Before Appearing) ---
  const initialRotation = isReversed ? 180 : 0;
  cardDiv.style.opacity = "0"; // Start invisible

  // --- CHOOSE ONE Initial Transform ---
  // Option A: Scale up from center
  // cardDiv.style.transform = `scale(0.5) rotate(${initialRotation}deg)`;
  // Option B: Fly up from bottom and scale
  // cardDiv.style.transform = `translateY(100px) scale(0.6) rotate(${initialRotation}deg)`;
  // Option C: Fly in from left/right and fade
  // cardDiv.style.transform = `translateX(-150px) rotate(${initialRotation - 30}deg)`;
  // Option D: Spin in (Example Active)
  cardDiv.style.transform = `scale(0.1) rotate(${initialRotation + 360}deg)`;
  // --- End Initial Transform Choices ---

  drawnCardsContainer.appendChild(cardDiv);
  drawnCardElements.push(cardDiv); // Keep track of the element

  // Run positioning logic IMMEDIATELY after adding, BEFORE the next frame.
  // This calculates the target positions for all cards including the new one.
  positionCardsInArc();

  // --- Animate to FINAL state ---
  // In the next frame, the browser will see the *initial* state applied above.
  // Then, we immediately update to the *final* state calculated by positionCardsInArc.
  // The CSS transition will handle the animation between these states.
  requestAnimationFrame(() => {
    // Re-select the card element to ensure we have the latest reference
    const newlyAddedCardElement =
      drawnCardElements[drawnCardElements.length - 1];
    if (newlyAddedCardElement) {
      // The final transform (including position, scale, rotation, tilt)
      // should have already been set by the call to positionCardsInArc().
      // We just need to trigger the transition by setting the final opacity.
      newlyAddedCardElement.style.opacity = "1";

      // Note: If positionCardsInArc wasn't setting the final transform, you'd set it here:
      // const finalTransform = newlyAddedCardElement.style.transform; // Get transform from positionCardsInArc
      // newlyAddedCardElement.style.transform = finalTransform; // Apply it here
    }
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

  // --- Positioning Parameters (ADJUST THESE) ---
  const horizontalRadiusFactor = 0.25;
  const verticalRadiusFactor = 0.8;
  const bottomRowCenterYFactor = 0.88;
  const topRowCenterYFactor = 0.45;
  // --- End Positioning Parameters ---

  const numRows = ARC_STRUCTURE.length;
  const rowSpacing =
    numRows > 1
      ? (bottomRowCenterYFactor - topRowCenterYFactor) / (numRows - 1)
      : 0;

  const centerX = containerWidth / 2;
  const horizontalRadius = containerWidth * horizontalRadiusFactor;

  drawnCardElements.forEach((card, overallIndex) => {
    if (!card) return;

    const rowInfo = getCardRowInfo(overallIndex, ARC_STRUCTURE);
    if (!rowInfo) return;

    const { rowIndex, indexInRow, numCardsInRow } = rowInfo;

    const targetCenterY =
      containerHeight * (bottomRowCenterYFactor - rowIndex * rowSpacing);

    const angleSpread = Math.min(numCardsInRow * 18, 170);
    const startAngle = -90 - angleSpread / 2;
    const angleStep = numCardsInRow > 1 ? angleSpread / (numCardsInRow - 1) : 0;
    let angle = startAngle + indexInRow * angleStep;

    // --- Force Topmost Card Upright and Centered ---
    if (numCardsInRow === 1) {
      angle = 0; // Force angle to 0 for single card rows (topmost - horizontal center)
    }
    // --- End Force Topmost Card ---

    const angleRad = angle * (Math.PI / 180);

    const computedStyle = getComputedStyle(card);
    const effectiveCardWidth =
      card.offsetWidth || parseFloat(computedStyle.width) || 100;
    const effectiveCardHeight =
      card.offsetHeight || parseFloat(computedStyle.height) || 150;

    if (!effectiveCardWidth || !effectiveCardHeight) {
      console.warn(`Card ${overallIndex} seems to have zero dimensions.`);
    }

    let x =
      centerX + horizontalRadius * Math.cos(angleRad) - effectiveCardWidth / 2;
    let y =
      targetCenterY +
      ((containerHeight * verticalRadiusFactor) / numRows) *
        Math.sin(angleRad) -
      effectiveCardHeight / 2;

    if (isNaN(x) || isNaN(y)) {
      console.error(`NaN position calculation for card ${overallIndex}.`);
      return;
    }

    card.style.left = `${x}px`;
    card.style.top = `${y}px`;
    card.style.zIndex = overallIndex;

    const isReversed = card.dataset.isReversed === "true";
    let baseRotation = isReversed ? 180 : 0;
    let tiltAngle = angle + 90;

    // --- Force Topmost Card to be Upright (no tilt) ---
    if (numCardsInRow === 1) {
      tiltAngle = 0; // No tilt for topmost card
    }
    // --- End Force Topmost Card Upright ---

    const currentScaleMatch = card.style.transform.match(/scale\(([^)]+)\)/);
    const currentScale = currentScaleMatch
      ? parseFloat(currentScaleMatch[1])
      : 1;

    if (card.style.opacity === "0" || currentScale < 1) {
      card.style.transform = `rotate(${tiltAngle}deg) rotate(${baseRotation}deg) scale(1)`;
      card.style.opacity = "1";
    } else {
      card.style.transform = `rotate(${tiltAngle}deg) rotate(${baseRotation}deg) scale(1)`;
      if (card.style.opacity !== "1" && currentScale >= 1) {
        card.style.opacity = "1";
      }
    }
  });
}

// --- Resize Handler ---
function initResizeListener(container) {
  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    // Check if the container is actually visible/in the layout
    if (container && container.offsetParent !== null) {
      resizeTimeout = setTimeout(() => {
        console.log("Resizing - Repositioning cards");
        positionCardsInArc(); // Recalculate positions on resize
      }, 250); // Debounce resize events
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
    console.error(
      "Focus Error: Missing card data or element for card ID:",
      cardId
    );
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
  const textContainer = document.getElementById("focus-card-text-container"); // Get the scrollable container

  // Robust check for all required modal elements
  if (
    !modal ||
    !overlay ||
    !focusCardImage ||
    !focusCardName ||
    !focusCardOrientation ||
    !focusCardText ||
    !textContainer
  ) {
    console.error(
      "Modal Error: One or more focus elements are missing from the DOM."
    );
    return;
  }
  if (!cardData) {
    console.error("Focus Error: Invalid cardData provided.");
    return;
  }

  focusCardName.textContent = cardData.name || "Unknown Card";
  focusCardOrientation.textContent = isReversed ? "Reversed" : "Upright";

  // Safely access description, providing fallbacks
  const descObj = cardData.description || {};
  const orientationKey = isReversed ? "reversed" : "upright";
  const descText =
    descObj[orientationKey] ||
    "Description not available for this orientation.";

  // Replace <br> tags with newlines for the <p> tag display
  focusCardText.innerHTML = descText.replace(/<br\s*\/?>/gi, "\n");

  focusCardImage.src = `./images/tarot/${cardData.id}.png`;
  focusCardImage.alt = `${cardData.name || "Tarot Card"} ${
    isReversed ? "(Reversed)" : "(Upright)"
  }`;
  focusCardImage.className = "modal-card-image"; // Use a class for styling
  focusCardImage.classList.toggle("reversed", isReversed); // Add/remove reversed class

  // Show modal and overlay
  modal.classList.add("visible");
  overlay.classList.add("visible");

  // Reset scroll position of the text container
  textContainer.scrollTop = 0;
}

function closeCardFocus() {
  const modal = document.getElementById("card-focus");
  const overlay = document.getElementById("overlay");
  if (modal) modal.classList.remove("visible");
  if (overlay) overlay.classList.remove("visible");
}

// END OF tarot.js
