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
    // Check if deck is actually empty based on index, not just array length
    if (currentCardIndex >= shuffledDeck.length) {
      console.warn("Attempted to draw from an empty deck.");
      alert("Deck empty! Please reset the deck.");
      return;
    }
    const cardData = shuffledDeck[currentCardIndex++]; // Increment index AFTER getting data
    const isReversed = Math.random() < 0.5;

    const cardDiv = document.createElement("div");
    cardDiv.classList.add("card");
    cardDiv.style.backgroundImage = `url('./images/tarot/${cardData.id}.png')`;
    cardDiv.setAttribute(
      "aria-label",
      `Tarot card: ${cardData.name} ${isReversed ? "(Reversed)" : "(Upright)"}`
    );
    cardDiv.dataset.isReversed = String(isReversed); // Store as string explicitly
    cardDiv.dataset.cardId = cardData.id;
    cardDiv.dataset.cardName = cardData.name;

    cardDiv.addEventListener("click", () => {
      // Use find directly on the original tarotData if needed, or retrieve from element
      const cardJsonData = tarotData.cards.find(
        (c) => c.id === cardDiv.dataset.cardId
      );
      if (cardJsonData) {
        focusCard(cardJsonData, cardDiv.dataset.isReversed === "true"); // Compare string to 'true'
      } else {
        console.error(
          "Could not find card data for focusing:",
          cardDiv.dataset.cardId
        );
      }
    });

    const initialRotation = isReversed ? 180 : 0;
    cardDiv.style.opacity = "0";
    // Set initial position near the deck before animating
    const deckRect = deckElement.getBoundingClientRect();
    const containerRect = drawnCardsContainer.getBoundingClientRect();
    // Adjust initial position calculation to be relative to #drawn-cards
    const initialLeft =
      deckRect.left -
      containerRect.left +
      deckRect.width / 2 -
      cardDiv.offsetWidth / 2; // Approximate
    const initialTop =
      deckRect.top -
      containerRect.top +
      deckRect.height / 2 -
      cardDiv.offsetHeight / 2; // Approximate
    //cardDiv.style.left = `${initialLeft}px`; // Optional: Start card pos near deck
    //cardDiv.style.top = `${initialTop}px`; // Optional: Start card pos near deck
    cardDiv.style.transform = `scale(0.5) rotate(${initialRotation}deg)`; // Start smaller

    drawnCardsContainer.appendChild(cardDiv);
    drawnCardElements.push(cardDiv); // Add element to our array *before* positioning

    requestAnimationFrame(() => {
      positionCardsInArc(); // Position ALL cards immediately
      requestAnimationFrame(() => {
        // Trigger animation only on the LAST card added (most recent)
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
    const numCards = drawnCardElements.length; // Use the tracked elements array

    // // Debug log
    //console.log(`Positioning ${numCards} cards. Container WxH: ${containerWidth}x${containerHeight}`);

    if (numCards === 0 || !containerWidth || !containerHeight) {
      //console.log("Skipping positioning: No cards or zero container dimensions.");
      return;
    }

    // --- ADJUST ARC PARAMETERS HERE ---
    const arcRadiusX = containerWidth * 0.45; // << Widen arc slightly?
    const arcRadiusY = containerHeight * 0.6; // << Make arc less tall/more curved?
    const centerX = containerWidth / 2;
    const centerY = containerHeight * 0.4; // << KEY: Move center point HIGHER (lower % = higher)
    const angleSpread = Math.min(numCards * 18, 170); // << Increase spread slightly? Max angle
    const startAngle = -90 - angleSpread / 2; // Center the spread around -90 (top)

    drawnCardElements.forEach((card, index) => {
      if (!card) return; // Skip if card element is missing

      const angleStep = numCards > 1 ? angleSpread / (numCards - 1) : 0;
      const angle = startAngle + index * angleStep;
      const angleRad = angle * (Math.PI / 180);

      const computedStyle = getComputedStyle(card);
      // Provide default estimates if offsetWidth/Height is 0 initially
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

      // Clamp positions to stay roughly within the container bounds? (Optional advanced)
      // x = Math.max(0, Math.min(containerWidth - effectiveCardWidth, x));
      // y = Math.max(0, Math.min(containerHeight - effectiveCardHeight, y));

      // // Debug log per card
      //console.log(`  Card ${index}: Angle=${angle.toFixed(1)}, Calculated X/Y=(${x.toFixed(1)}, ${y.toFixed(1)})`);

      if (isNaN(x) || isNaN(y)) {
        console.error(
          `Positioning Error: NaN calculated for card ${index}. Aborting positioning for this card.`
        );
        return; // Skip applying NaN
      }

      card.style.left = `${x}px`;
      card.style.top = `${y}px`;
      card.style.zIndex = index;

      // Ensure correct scale/rotation is maintained or applied *after* positioning
      // This is mainly handled by the draw function's second rAF now.
      const currentTransform = card.style.transform;
      // Make sure it doesn't revert opacity or scale unintentionally if already animated
      if (!currentTransform.includes("scale(1)")) {
        // If the card hasn't been animated yet, ensure initial state remains
        const isReversed = card.dataset.isReversed === "true";
        const rotation = isReversed ? 180 : 0;
        // Re-apply initial scale if necessary (shouldn't be needed with current flow)
        //card.style.transform = `scale(0.8) rotate(${rotation}deg)`;
      }
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
    focusCardImage.classList.toggle("reversed", isReversed); // Simpler toggle
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
