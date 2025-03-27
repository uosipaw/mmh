window.addEventListener("DOMContentLoaded", () => {
  // Initialize the tarot card functionality
  initTarot();

  // Detect touch device for navbar functionality
  function isTouchDevice() {
    return "ontouchstart" in window || navigator.maxTouchPoints > 0;
  }
  const isTouchDevice = isTouchDevice();

  if (isTouchDevice) {
    const navLinks = document.querySelectorAll(".navbar a");

    navLinks.forEach((link) => {
      link.addEventListener("click", function (e) {
        if (!this.classList.contains("tapped")) {
          e.preventDefault();
          navLinks.forEach((l) => l.classList.remove("tapped"));
          this.classList.add("tapped");
        }
      });
    });
  }
});

// Variable to store the tarot card data loaded from the JSON file
let tarotData = null;

async function initTarot() {
  const tarotJsonPath = "./tarot-cards.json";

  try {
    const response = await fetch(tarotJsonPath);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    tarotData = await response.json();
    console.log("Tarot card data loaded successfully", tarotData);

    initTarotInterface();
  } catch (error) {
    console.error("Error loading tarot card data:", error);
  }
}

function initTarotInterface() {
  const deck = document.getElementById("deck");
  const drawnCards = document.getElementById("drawn-cards");
  const cardFocus = document.getElementById("card-focus");
  const overlay = document.getElementById("overlay");
  const closeButton = document.getElementById("close-button");
  const cardImage = document.querySelector("#card-focus .card-image");
  const cardName = document.getElementById("card-name");
  const cardOrientation = document.getElementById("card-orientation");
  const cardText = document.getElementById("card-text");
  const cardImage = document.getElementById("card-image");

  if (
    !deck ||
    !drawnCards ||
    !cardFocus ||
    !overlay ||
    !closeButton ||
    !cardImage
  ) {
    console.error("Required elements not found in the document");
    return;
  }
  }

  let shuffledDeck = [...tarotCardNames]; // Create a copy of the deck
  shuffledDeck = shuffledDeck.sort(() => Math.random() - 0.5); // Shuffle the deck
  let currentCardIndex = 0; // Track the current card index
  let drawnCardNames = []; // Track cards by name instead of number

  // Add event listeners
  deck.addEventListener("click", drawCard);
  closeButton.addEventListener("click", closeCardFocus);

  // Track drawn cards and positions
  let currentPosition = 0; // Will continue to increment for each card
  let cardPositions = []; // Will store information about each card

  // Handle card flip in focus mode
  if (cardContainer) {
    cardContainer.addEventListener("click", function (e) {
      if (!e.target.closest("#close-button")) {
        this.classList.toggle("flipped");
        e.stopPropagation();
      }
    });
  }

  function drawCard() {
    if (drawnCardNames.length === numberOfCards) {
      showNotification("The deck is empty!");
      return;
    }
    // Draw the next card from the shuffled deck
    if (currentCardIndex >= shuffledDeck.length) {
      showNotification("The deck is empty!");
      return;
    }
    const randomName = shuffledDeck[currentCardIndex];
    currentCardIndex++;
    drawnCardNames.push(randomName);
    const isReversed = Math.random() < 0.5; // 50% chance of being reversed

    // Create card element
    const cardDiv = document.createElement("div");
    cardDiv.classList.add("card", "deck"); // Initial state: in deck

    const cardImageElement = document.createElement("div");
    cardImageElement.classList.add("card-image");

    // Preload the image to handle errors
    const tempImg = new Image();
    tempImg.onload = () => {
      cardImageElement.style.backgroundImage = `url('./images/tarot/${randomName}.png')`;
    };
    tempImg.onerror = () => {
      cardImageElement.style.backgroundImage = `url('./images/tarot/card-back.png')`; // Fallback image
      showNotification(`Image for ${randomName} is missing, using fallback.`);
    };
    tempImg.src = `./images/tarot/${randomName}.png`;
    cardImageElement.style.backgroundImage = `url('./images/tarot/${randomName}.png')`;

    // Apply reversed class for rotation
    if (isReversed) {
      cardImageElement.classList.add("reversed");
    }

    cardDiv.appendChild(cardImageElement);
    drawnCards.appendChild(cardDiv);

    // Store card information in data attributes
    cardDiv.dataset.cardName = randomName;
    cardDiv.dataset.reversed = isReversed;
    cardDiv.dataset.position = currentPosition;
    cardDiv.dataset.row = Math.floor(currentPosition / 5);
    cardDiv.dataset.positionInRow = currentPosition % 5;

    // Add position classes based on row and position
    cardDiv.classList.add(`row-${Math.floor(currentPosition / 5)}`);
    cardDiv.classList.add(`position-${currentPosition % 5}`);

    // Add drawn class to start animation
    setTimeout(() => {
      cardDiv.classList.remove("deck");
      cardDiv.classList.add("drawn");
    }, 50);

    // Add click handler after card is drawn
    cardDiv.addEventListener("click", focusCard);

    // Store the card in its position
    cardPositions[currentPosition] = {
      name: randomName,
      element: cardDiv,
      isReversed: isReversed,
    };

    // Move to next position
    currentPosition++;

    // Always show the reset button after drawing the first card
    if (currentPosition === 1) {
      addResetButton();
    }
  }

  function focusCard(event) {
    const card = event.currentTarget;
    tempImg.onerror = function () {
      cardImage.style.backgroundImage = `url('./images/tarot/card-back.png')`; // Fallback image
      const fallbackImg = new Image();
      fallbackImg.onerror = function () {
        console.error("Both primary and fallback card images failed to load.");
        showNotification("Both card images couldn't be loaded");
      };
      fallbackImg.src = `./images/tarot/card-back.png`;
    };
    cardImage.style.backgroundImage = `url('./images/tarot/${cardNameValue}.png')`;

    // Add error handling for image loading
    const tempImg = new Image();
    tempImg.onerror = function () {
      cardImage.style.backgroundImage = `url('./images/tarot/card-back.png')`; // Fallback image
      showNotification("Card image couldn't be loaded");
    };
    tempImg.src = `./images/tarot/${cardNameValue}.png`;

    // Use class for reversed state
    if (isReversed) {
      cardImage.classList.add("reversed");
    } else {
      cardImage.classList.remove("reversed");
    }

    // Ensure the card description text doesn't follow the card orientation
    delete cardImage.dataset.reversed;

    // Ensure the card container is in the initial state
    if (cardContainer) {
      cardContainer.classList.remove("flipped");
    }

    // Update text content
    updateCardContent(cardNameValue, isReversed);

    // Show modal
    cardFocus.classList.remove("hidden");
    overlay.classList.remove("hidden");

    // Add background color with slight delay for a nice fade-in effect
    setTimeout(() => {
      cardFocus.classList.add("show-bg");
    }, 100);
  }

  function updateCardContent(cardNameValue, isReversed) {
    // Find card data
    const foundCard = findCardData(cardNameValue);

    if (foundCard) {
      displayCardData(foundCard, isReversed);
  function normalizeCardName(name) {
    return name.toLowerCase().replace(/\s+/g, "");
  }

  function findCardData(cardNameValue) {
      displayFallbackCardData(cardNameValue, isReversed);
    }
  }
    let foundCard = tarotData.cards.find(
      (card) =>
        card.filename === cardNameValue ||
        normalizeCardName(card.name) === cardNameValue
    );
    let foundCard = tarotData.cards.find(
      (card) =>
        card.filename === cardNameValue ||
        card.name.toLowerCase().replace(/\s+/g, "") === cardNameValue
    );

    // If not found, try to find by card index
    if (!foundCard) {
      const cardIndex = tarotCardNames.indexOf(cardNameValue);
      if (cardIndex !== -1) {
        foundCard = tarotData.cards.find((card) => card.id === cardIndex);
      }
    }

    // Final attempt - try to find by keyword matches in name
    if (!foundCard) {
      foundCard = tarotData.cards.find((card) => {
        const simpleName = card.name.toLowerCase();
        return (
          cardNameValue.includes(simpleName) ||
          simpleName.includes(cardNameValue)
        );
      });
    }

    return foundCard;
  }

  function displayCardData(foundCard, isReversed) {
    // Set card name
    cardName.textContent = foundCard.name;

    // Set orientation in italics
    cardOrientation.textContent = isReversed ? "Reversed" : "Upright";
    cardOrientation.style.fontStyle = "italic";

    // Include appropriate meaning based on orientation
    const orientation = isReversed ? "reversed" : "upright";

    // Prepare card text content
    let displayText = "";

    // Extract and display keywords and description if available
    if (foundCard.description && foundCard.description[orientation]) {
      const parts = foundCard.description[orientation].split("<br>");

      // Extract keywords (before the <br> tag)
      if (parts.length > 0) {
        displayText += parts[0] + "\n\n";
      }

      // Extract description (after the <br> tag)
      if (parts.length > 1) {
        displayText += parts[1] + "\n\n";
      }
    }

    // Add general meaning if available
    if (foundCard.meaning) {
      displayText += foundCard.meaning;
    }

    // Set the text content with proper formatting
    cardText.textContent = displayText;

    // Ensure text remains in normal style
    cardText.style.fontStyle = "normal";
    cardText.style.textOrientation = "normal";
    cardText.style.writingMode = "horizontal-tb";
  }

  function displayFallbackCardData(cardNameValue, isReversed) {
    const displayName = formatCardName(cardNameValue);

    cardName.textContent = displayName;
    cardOrientation.textContent = isReversed ? "Reversed" : "Upright";
  function formatCardName(cardName) {
      const suits = {
          cup: "Cups",
          wand: "Wands",
          swd: "Swords",
          pent: "Pentacles",
      };
  
      for (const [key, value] of Object.entries(suits)) {
          if (cardName.includes(key)) {
              const rank = cardName.replace(key, "").trim();
              return `${formatRank(rank)} of ${value}`;
          }
      }
  
      // Major Arcana - just capitalize first letter of each word
      return cardName
          .replace(/([A-Z])/g, " $1") // Add space before capitals
          .split(/\s+/) // Split by whitespace
          .map(
              (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
          ) // Capitalize each word
          .join(" ") // Join with spaces
          .trim(); // Remove any extra spaces
  }
        .join(" ") // Join with spaces
        .trim(); // Remove any extra spaces
    }
  }

  // Helper function to format rank (a, 2, 3, etc. to Ace, Two, Three, etc.)
  function formatRank(rank) {
  function formatRank(rank) {
    const rankMapping = {
      a: "Ace",
      "2": "Two",
      "3": "Three",
      "4": "Four",
      "5": "Five",
      "6": "Six",
      "7": "Seven",
      "8": "Eight",
      "9": "Nine",
      "10": "Ten",
      p: "Page",
      n: "Knight",
      q: "Queen",
      k: "King",
    };
    return rankMapping[rank] || rank.charAt(0).toUpperCase() + rank.slice(1); // Default capitalization
  }
  function closeCardFocus() {
    // Add a fade-out effect
    cardFocus.classList.remove("show-bg");

    // Reset card container if needed
    if (cardContainer) {
      cardContainer.classList.remove("flipped");
    }

    // Wait for animation to complete before hiding
    setTimeout(() => {
      cardFocus.classList.add("hidden");
      overlay.classList.add("hidden");
    }, 500);
  }

  // Make sure the overlay also closes the modal when clicked
  if (overlay) {
    overlay.addEventListener("click", closeCardFocus);
  }

  // Optimize modal interaction for touch devices
  if (isTouchDevice()) {
    // Add touch-specific classes
    document.body.classList.add("touch-device");

    // Existing tap to flip code
    if (cardContainer) {
      cardContainer.addEventListener("touchend", function (e) {
        if (!e.target.closest("#close-button")) {
          this.classList.toggle("flipped");
          e.preventDefault();
        }
      });
    }
  }

  // Function to add reset button to the interface
  function addResetButton() {
    const resetButton =
      document.getElementById("reset-button") ||
      document.createElement("button");
    if (!resetButton.id) {
      resetButton.id = "reset-button";
      resetButton.textContent = "Reset";
      resetButton.classList.add("reset-button");
      resetButton.style.display = "none"; // Hide initially
      document.body.appendChild(resetButton);

      resetButton.addEventListener("click", function () {
        // Reset functionality
        drawnCardNames = [];
        currentPosition = 0;
        cardPositions = [];

        // Remove event listeners before clearing
        if (drawnCards) {
          const cards = drawnCards.querySelectorAll(".card");
          cards.forEach((card) => {
            card.removeEventListener("click", focusCard);
          });
        // Remove the reset button from the DOM
        resetButton.remove();
      });
    }
    resetButton.style.display = "block";
  }
    resetButton.style.display = "block";
  }

  function showNotification(message) {
    // Remove any existing notifications
    const existingNotification = document.querySelector(".notification");
    if (existingNotification) {
      document.body.removeChild(existingNotification);
    }

    const notification = document.createElement("div");
    notification.className = "notification";
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add("visible");
    }, 10);

    setTimeout(() => {
      notification.classList.remove("visible");
      setTimeout(() => {
        if (notification.parentNode) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }
  }

  // Log initialization success
  console.log("Tarot card interface initialized");
}
