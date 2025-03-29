window.addEventListener("DOMContentLoaded", () => {
  initTarot();
});

let tarotData = null;
let shuffledDeck = [];
let currentCardIndex = 0;

async function initTarot() {
  const tarotJsonPath = "./tarot-cards.json";

  try {
    const response = await fetch(tarotJsonPath);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    tarotData = await response.json();
    console.log("Tarot card data loaded successfully");

    if (tarotData && tarotData.cards) {
      shuffledDeck = [...tarotData.cards].sort(() => Math.random() - 0.5); // Create copy before shuffling
      currentCardIndex = 0;
      initTarotInterface();
    } else {
      console.error("Tarot data is not in the expected format:", tarotData);
    }
  } catch (error) {
    console.error("Error loading tarot card data:", error);
    // Optionally display an error message to the user on the page
  }
}

function initTarotInterface() {
  const deckElement = document.getElementById("deck");
  const drawnCardsContainer = document.getElementById("drawn-cards");
  const cardFocusModal = document.getElementById("card-focus");
  const overlayElement = document.getElementById("overlay");
  const closeButtonElement = document.getElementById("close-button");

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
    !focusCardImage ||
    !focusCardName ||
    !focusCardOrientation ||
    !focusCardText
  ) {
    console.error("One or more required interface elements not found.");
    // Optionally display an error to the user
    return;
  }

  // Store drawn cards to reposition them
  let drawnCardElements = [];

  // --- Event Listener for Drawing Cards ---
  deckElement.addEventListener("click", () => {
    if (currentCardIndex >= shuffledDeck.length) {
      console.log("Deck empty, reshuffling...");
      shuffledDeck.sort(() => Math.random() - 0.5); // Reshuffle
      currentCardIndex = 0;
      // --- CLEAR CARDS on Reshuffle ---
      drawnCardsContainer.innerHTML = ""; // Clear visually
      drawnCardElements = []; // Clear the array
      // Optionally draw the first card automatically after reshuffle
      // drawAndPositionCard();
      alert("Deck reshuffled!"); // Notify user
      return; // Wait for the next click
    }
    drawAndPositionCard(); // Call the new drawing function
  });

  // --- Function to Draw AND POSITION a Card ---
  function drawAndPositionCard() {
    const cardData = shuffledDeck[currentCardIndex++];
    const isReversed = Math.random() < 0.5; // 50% chance of being reversed

    const cardDiv = document.createElement("div");
    cardDiv.classList.add("card");
    cardDiv.style.backgroundImage = `url('./images/tarot/${cardData.id}.png')`;
    cardDiv.setAttribute(
      "aria-label",
      `Tarot card: ${cardData.name} ${isReversed ? "(Reversed)" : "(Upright)"}`
    );

    // Store data with the element for positioning and focusing
    cardDiv.dataset.isReversed = isReversed; // Store boolean as string
    cardDiv.dataset.cardId = cardData.id;
    cardDiv.dataset.cardName = cardData.name;

    // Add click listener BEFORE adding to array/DOM
    cardDiv.addEventListener("click", () => {
      // Retrieve data needed for focusCard
      const cardJsonData = tarotData.cards.find(
        (c) => c.id === cardDiv.dataset.cardId
      );
      if (cardJsonData) {
        focusCard(cardJsonData, cardDiv.dataset.isReversed === "true"); // Convert string back to boolean
      } else {
        console.error(
          "Could not find card data for focusing:",
          cardDiv.dataset.cardId
        );
      }
    });

    drawnCardsContainer.appendChild(cardDiv);
    drawnCardElements.push(cardDiv); // Add to our array

    positionCardsInArc(); // Reposition all cards including the new one

    // Make the card appear (fade/scale in) after a short delay
    // This needs to happen *after* initial CSS styles are applied by the browser
    requestAnimationFrame(() => {
      // Use rAF for better timing
      requestAnimationFrame(() => {
        // Double rAF sometimes helps ensure styles apply
        cardDiv.style.opacity = "1";
        // Apply base scale and reversed rotation here AFTER initial scale/opacity
        const rotation = isReversed ? 180 : 0;
        // We set left/top in positionCardsInArc, only need scale/rotate here
        cardDiv.style.transform = `scale(1) rotate(${rotation}deg)`;
      });
    });
  }

  // --- Function to Position Cards in an Arc ---
  function positionCardsInArc() {
    const container = drawnCardsContainer;
    // Ensure container has dimensions before calculating
    if (!container.offsetWidth || !container.offsetHeight) {
      console.warn("Container dimensions not available for positioning.");
      // Optionally, try again slightly later
      // setTimeout(positionCardsInArc, 50);
      return;
    }

    const containerWidth = container.offsetWidth;
    const containerHeight = container.offsetHeight;
    const numCards = drawnCardElements.length;

    if (numCards === 0) return;

    // Arc Parameters (ADJUST THESE VALUES TO FINE-TUNE THE ARC)
    const arcRadiusX = containerWidth * 0.4; // Horizontal radius - adjust %
    const arcRadiusY = containerHeight * 0.7; // Vertical radius (for ellipse) - adjust %
    const centerX = containerWidth / 2;
    const centerY = containerHeight * 0.55; // Center Y - adjust % (lower is higher on screen)
    const angleSpread = Math.min(numCards * 15, 160); // Max spread 160 deg, ~15 deg per card
    const startAngle = -90 - angleSpread / 2; // Start angle (top-center is -90)

    drawnCardElements.forEach((card, index) => {
      const angleStep = numCards > 1 ? angleSpread / (numCards - 1) : 0; // Avoid division by zero if only 1 card
      const angle = startAngle + index * angleStep;
      const angleRad = angle * (Math.PI / 180); // Convert to radians

      // Calculate position using elliptical coordinates
      const cardWidth = card.offsetWidth;
      const cardHeight = card.offsetHeight;
      // Adjust calculation slightly if card dimensions aren't ready (less likely now with rAF)
      const effectiveCardWidth =
        cardWidth || parseFloat(getComputedStyle(card).width) || 100; // Estimate if needed
      const effectiveCardHeight =
        cardHeight || parseFloat(getComputedStyle(card).height) || 150; // Estimate if needed

      const x =
        centerX + arcRadiusX * Math.cos(angleRad) - effectiveCardWidth / 2;
      const y =
        centerY + arcRadiusY * Math.sin(angleRad) - effectiveCardHeight / 2;

      // Apply position
      card.style.left = `${x}px`;
      card.style.top = `${y}px`;

      // Get rotation state (must happen before setting transform)
      const isReversed = card.dataset.isReversed === "true";
      const reversedRotation = isReversed ? 180 : 0;

      // Apply scale and rotation (only reversal for now)
      // Opacity/Scale is handled on draw, only need rotation update here if needed
      // Ensure existing scale(1) isn't lost if card was already visible
      const currentTransform = card.style.transform;
      const currentScaleMatch = currentTransform.match(/scale\(([^)]+)\)/);
      const currentScale = currentScaleMatch
        ? currentScaleMatch[0]
        : "scale(1)"; // Keep current scale

      card.style.transform = `${currentScale} rotate(${reversedRotation}deg)`;

      // Ensure higher index cards overlap lower index cards slightly
      card.style.zIndex = index;
    });
  }

  // --- Recalculate arc on window resize ---
  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    // Also check if container is visible before trying to position
    if (drawnCardsContainer.offsetParent !== null) {
      resizeTimeout = setTimeout(positionCardsInArc, 200); // Debounce resize
    }
  });

  // --- Event Listeners for Closing Modal ---
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

  // --- Function to Show Card Details in Modal ---
  function focusCard(cardData, isReversed) {
    focusCardName.textContent = cardData.name;
    focusCardOrientation.textContent = isReversed ? "Reversed" : "Upright";

    const description =
      cardData.description[isReversed ? "reversed" : "upright"];
    focusCardText.innerHTML = description.replace(/<br\s*\/?>/gi, "\n"); // More robust <br> replacement

    focusCardImage.src = `./images/tarot/${cardData.id}.png`;
    focusCardImage.alt = `${cardData.name} card ${
      isReversed ? "reversed" : "upright"
    }`;

    if (isReversed) {
      focusCardImage.classList.add("reversed");
    } else {
      focusCardImage.classList.remove("reversed");
    }

    cardFocusModal.classList.add("visible");
    overlayElement.classList.add("visible");

    const textContainer = document.getElementById("focus-card-text-container");
    if (textContainer) textContainer.scrollTop = 0;
  }

  // --- Function to Hide Card Details Modal ---
  function closeCardFocus() {
    cardFocusModal.classList.remove("visible");
    overlayElement.classList.remove("visible");
  }
} // End of initTarotInterface
