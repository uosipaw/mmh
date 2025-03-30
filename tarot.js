// START OF tarot.js

window.addEventListener("DOMContentLoaded", () => {
  initTarot();
});

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
    console.log("Tarot card data loaded successfully");

    if (tarotData && tarotData.cards) {
      shuffleDeck(); // Initial shuffle
      initTarotInterface();
    } else {
      console.error("Tarot data is not in the expected format:", tarotData);
    }
  } catch (error) {
    console.error("Error loading tarot card data:", error);
    // Optionally display an error message to the user on the page
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
    drawnCardsContainer.innerHTML = ""; // Clear visual cards
  }
  drawnCardElements = []; // Clear the array of elements
  shuffleDeck(); // Reshuffle and reset index
  console.log("Deck Reset");
  // Optional: Add a subtle visual feedback?
}

function initTarotInterface() {
  const deckElement = document.getElementById("deck");
  const drawnCardsContainer = document.getElementById("drawn-cards");
  const cardFocusModal = document.getElementById("card-focus");
  const overlayElement = document.getElementById("overlay");
  const closeButtonElement = document.getElementById("close-button");
  const resetButtonElement = document.getElementById("reset-button"); // <<< Get reset button

  // Modal content elements
  const focusCardImage = document.getElementById("focus-card-image");
  const focusCardName = document.getElementById("focus-card-name");
  const focusCardOrientation = document.getElementById(
    "focus-card-orientation"
  );
  const focusCardText = document.getElementById("focus-card-text");

  // Check if all essential elements exist
  if (
    !deckElement ||
    !drawnCardsContainer ||
    !cardFocusModal ||
    !overlayElement ||
    !closeButtonElement ||
    !resetButtonElement || // <<< Check reset button
    !focusCardImage ||
    !focusCardName ||
    !focusCardOrientation ||
    !focusCardText
  ) {
    console.error("One or more required interface elements not found.");
    return;
  }

  // --- Event Listener for Drawing Cards ---
  deckElement.addEventListener("click", () => {
    if (currentCardIndex >= shuffledDeck.length) {
      alert("Deck empty! Please reset the deck."); // Inform user to reset
      return;
    }
    drawAndPositionCard();
  });

  // --- <<< Event Listener for Reset Button >>> ---
  resetButtonElement.addEventListener("click", resetDeck);

  // --- Function to Draw AND POSITION a Card ---
  function drawAndPositionCard() {
    if (currentCardIndex >= shuffledDeck.length) {
      console.warn("Attempted to draw from an empty deck.");
      alert("Deck empty! Please reset the deck.");
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

    cardDiv.addEventListener("click", () => {
      const cardJsonData = tarotData.cards.find(
        (c) => c.id === cardDiv.dataset.cardId
      );
      if (cardJsonData) {
        focusCard(cardJsonData, cardDiv.dataset.isReversed === "true");
      } else {
        console.error(
          "Could not find card data for focusing:",
          cardDiv.dataset.cardId
        );
      }
    });

    const initialRotation = isReversed ? 180 : 0;
    cardDiv.style.opacity = "0";
    cardDiv.style.transform = `scale(0.5) rotate(${initialRotation}deg)`;

    drawnCardsContainer.appendChild(cardDiv);
    drawnCardElements.push(cardDiv);

    requestAnimationFrame(() => {
      positionCardsInArc();
      requestAnimationFrame(() => {
        const lastCard = drawnCardElements[drawnCardElements.length - 1];
        if (lastCard) {
          const finalRotation =
            lastCard.dataset.isReversed === "true" ? 180 : 0;
          lastCard.style.opacity = "1";
          lastCard.style.transform = `scale(1) rotate(${finalRotation}deg)`;
        }
      });
    });
  }

  // --- Function to Position Cards in an Arc ---
  function positionCardsInArc() {
    const container = drawnCardsContainer;
    if (!container) return;

    const containerWidth = container.offsetWidth;
    const containerHeight = container.offsetHeight;
    const numCards = drawnCardElements.length;

    if (numCards === 0 || !containerWidth || !containerHeight) return;

    // --- ADJUST ARC PARAMETERS HERE ---
    const arcRadiusX = containerWidth * 0.45;
    const arcRadiusY = containerHeight * 0.6;
    const centerX = containerWidth / 2; // Center X *within* the container
    const centerY = containerHeight * 0.55; // <<< ADJUSTED: Higher value = lower arc center
    const angleSpread = Math.min(numCards * 18, 170);
    const startAngle = -90 - angleSpread / 2;

    drawnCardElements.forEach((card, index) => {
      if (!card) return;

      const angleStep = numCards > 1 ? angleSpread / (numCards - 1) : 0;
      const angle = startAngle + index * angleStep;
      const angleRad = angle * (Math.PI / 180);

      const computedStyle = getComputedStyle(card);
      const effectiveCardWidth =
        card.offsetWidth || parseFloat(computedStyle.width) || 100;
      const effectiveCardHeight =
        card.offsetHeight || parseFloat(computedStyle.height) || 150;

      if (!effectiveCardWidth || !effectiveCardHeight) {
        console.warn(`Card ${index} has zero dimensions, using estimates.`);
      }

      let x =
        centerX + arcRadiusX * Math.cos(angleRad) - effectiveCardWidth / 2;
      let y =
        centerY + arcRadiusY * Math.sin(angleRad) - effectiveCardHeight / 2;

      if (isNaN(x) || isNaN(y)) {
        console.error(`Positioning Error: NaN calculated for card ${index}.`);
        return;
      }

      card.style.left = `${x}px`;
      card.style.top = `${y}px`;
      card.style.zIndex = index;
    });
  }

  // --- Recalculate arc on window resize ---
  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    if (drawnCardsContainer && drawnCardsContainer.offsetParent !== null) {
      resizeTimeout = setTimeout(positionCardsInArc, 250);
    }
  });

  // --- Event Listeners for Closing Modal (Keep As Is) ---
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

  // --- Function to Show Card Details in Modal (Keep As Is) ---
  function focusCard(cardData, isReversed) {
    if (!cardData) {
      console.error("Invalid cardData passed to focusCard.");
      return;
    }
    focusCardName.textContent = cardData.name || "Unknown Card";
    focusCardOrientation.textContent = isReversed ? "Reversed" : "Upright";
    const descriptionObj = cardData.description || {};
    const descriptionText =
      descriptionObj[isReversed ? "reversed" : "upright"] ||
      "Description not available.";
    focusCardText.innerHTML = descriptionText.replace(/<br\s*\/?>/gi, "\n");
    focusCardImage.src = `./images/tarot/${cardData.id}.png`;
    focusCardImage.alt = `${cardData.name || "Tarot"} card ${
      isReversed ? "reversed" : "upright"
    }`;
    focusCardImage.classList.toggle("reversed", isReversed);
    cardFocusModal.classList.add("visible");
    overlayElement.classList.add("visible");
    const textContainer = document.getElementById("focus-card-text-container");
    if (textContainer) textContainer.scrollTop = 0;
  }

  // --- Function to Hide Card Details Modal (Keep As Is) ---
  function closeCardFocus() {
    cardFocusModal.classList.remove("visible");
    overlayElement.classList.remove("visible");
  }
} // End of initTarotInterface

// END OF tarot.js
