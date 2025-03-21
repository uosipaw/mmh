document.addEventListener("DOMContentLoaded", () => {
  // Initialize the tarot card functionality
  initTarot();

  // Detect touch device for navbar functionality
  const isTouchDevice =
    "ontouchstart" in window || navigator.maxTouchPoints > 0;

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

let tarotData = null;

// Define the array of tarot card names
const tarotCardNames = [
  // Major Arcana
  "fool",
  "magician",
  "highpriestess",
  "empress",
  "emperor",
  "hierophant",
  "lovers",
  "chariot",
  "strength",
  "hermit",
  "wheel",
  "justice",
  "hangedman",
  "death",
  "temperance",
  "devil",
  "tower",
  "star",
  "moon",
  "sun",
  "judgement",
  "world",

  // Cups
  "acup",
  "2cup",
  "3cup",
  "4cup",
  "5cup",
  "6cup",
  "7cup",
  "8cup",
  "9cup",
  "10cup",
  "pcup",
  "ncup",
  "qcup",
  "kcup",

  // Wands
  "awand",
  "2wand",
  "3wand",
  "4wand",
  "5wand",
  "6wand",
  "7wand",
  "8wand",
  "9wand",
  "10wand",
  "pwand",
  "nwand",
  "qwand",
  "kwand",

  // Swords
  "aswd",
  "2swd",
  "3swd",
  "4swd",
  "5swd",
  "6swd",
  "7swd",
  "8swd",
  "9swd",
  "10swd",
  "pswd",
  "nswd",
  "qswd",
  "kswd",

  // Pentacles
  "apent",
  "2pent",
  "3pent",
  "4pent",
  "5pent",
  "6pent",
  "7pent",
  "8pent",
  "9pent",
  "10pent",
  "ppent",
  "npent",
  "qpent",
  "kpent",
];

async function initTarot() {
  // Load the tarot card data first - improved error handling
  try {
    const response = await fetch("./tarot-cards.json");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    tarotData = await response.json();
    console.log("Tarot card data loaded successfully", tarotData);

    // Initialize the tarot interface after loading data
    initTarotInterface();
  } catch (error) {
    console.error("Error loading tarot card data:", error);
    // Continue with basic functionality even if card data isn't available
    initTarotInterface();
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
  const cardContainer = document.querySelector(".card-container");

  // Check if necessary elements exist
  if (
    !deck ||
    !drawnCards ||
    !cardFocus ||
    !overlay ||
    !closeButton ||
    !cardImage ||
    !cardName ||
    !cardOrientation ||
    !cardText
  ) {
    console.error("Required tarot elements not found in the document");
    return;
  }

  const numberOfCards = tarotCardNames.length; // Total number of cards
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
      alert("The deck is empty!");
      return;
    }

    // Select a random card that hasn't been drawn yet
    let randomName;
    do {
      const randomIndex = Math.floor(Math.random() * numberOfCards);
      randomName = tarotCardNames[randomIndex];
    } while (drawnCardNames.includes(randomName));

    drawnCardNames.push(randomName);
    const isReversed = Math.random() < 0.5; // 50% chance of being reversed

    // Create card element
    const cardDiv = document.createElement("div");
    cardDiv.classList.add("card", "deck"); // Initial state: in deck

    // Create card image element (shown when drawn)
    const cardImageElement = document.createElement("div");
    cardImageElement.classList.add("card-image");

    // Set the background image directly instead of using a class
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
    const cardNameValue = card.dataset.cardName;
    const isReversed = card.dataset.reversed === "true";

    // Set the background image directly
    cardImage.style.backgroundImage = `url('./images/tarot/${cardNameValue}.png')`;

    // Use class for reversed state
    if (isReversed) {
      cardImage.classList.add("reversed");
    } else {
      cardImage.classList.remove("reversed");
    }

    // Ensure the card description text doesn't follow the card orientation
    cardImage.dataset.reversed = null; // Remove the data attribute completely

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
    } else {
      displayFallbackCardData(cardNameValue, isReversed);
    }
  }

  function findCardData(cardNameValue) {
    if (!tarotData || !tarotData.cards) return null;

    // First try to find by exact name match
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
    // Set card name and orientation normally
    cardName.textContent = foundCard.name;
    cardOrientation.textContent = isReversed ? "Reversed" : "Upright";

    // Include appropriate meaning based on orientation without changing text style
    const orientation = isReversed ? "reversed" : "upright";

    // Prepare card text content
    let displayText = "";

    // Add general meaning if available
    if (foundCard.meaning) {
      displayText += foundCard.meaning;
    }

    // Add orientation-specific meaning in a normal text style
    if (foundCard.description && foundCard.description[orientation]) {
      if (displayText) displayText += "\n\n"; // Add spacing if there's already content
      displayText += `${orientation.toUpperCase()} MEANING: ${
        foundCard.description[orientation]
      }`;
    }

    // Set the text content with normal styling
    cardText.textContent =
      displayText ||
      `This is the ${foundCard.name}. The interpretation will depend on the card's position and surrounding cards.`;

    // Ensure text remains in normal style regardless of card orientation
    cardText.style.fontStyle = "normal";
    cardText.style.textOrientation = "normal";
    cardText.style.writingMode = "horizontal-tb";
  }

  function displayFallbackCardData(cardNameValue, isReversed) {
    const displayName = formatCardName(cardNameValue);

    cardName.textContent = displayName;
    cardOrientation.textContent = isReversed ? "Reversed" : "Upright";
    cardText.textContent = `Description for ${displayName} goes here. This would typically include the card's meaning, symbolism, and interpretation both when upright and reversed.`;
  }

  // Helper function to format card names for display
  function formatCardName(cardName) {
    // Format names like "acup" to "Ace of Cups"
    if (cardName.includes("cup")) {
      const rank = cardName.replace("cup", "").trim();
      return formatRank(rank) + " of Cups";
    } else if (cardName.includes("wand")) {
      const rank = cardName.replace("wand", "").trim();
      return formatRank(rank) + " of Wands";
    } else if (cardName.includes("swd")) {
      const rank = cardName.replace("swd", "").trim();
      return formatRank(rank) + " of Swords";
    } else if (cardName.includes("pent")) {
      const rank = cardName.replace("pent", "").trim();
      return formatRank(rank) + " of Pentacles";
    } else {
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
  }

  // Helper function to format rank (a, 2, 3, etc. to Ace, Two, Three, etc.)
  function formatRank(rank) {
    if (rank === "a") return "Ace";
    if (rank === "2") return "Two";
    if (rank === "3") return "Three";
    if (rank === "4") return "Four";
    if (rank === "5") return "Five";
    if (rank === "6") return "Six";
    if (rank === "7") return "Seven";
    if (rank === "8") return "Eight";
    if (rank === "9") return "Nine";
    if (rank === "10") return "Ten";
    if (rank === "p") return "Page";
    if (rank === "n") return "Knight";
    if (rank === "q") return "Queen";
    if (rank === "k") return "King";
    return rank.charAt(0).toUpperCase() + rank.slice(1); // Default capitalization
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
  if ("ontouchstart" in window || navigator.maxTouchPoints > 0) {
    // ...existing code...

    // Add tap to flip for mobile
    if (cardContainer) {
      cardContainer.addEventListener("touchend", function (e) {
        if (!e.target.closest("#close-button")) {
          this.classList.toggle("flipped");
          e.preventDefault();
        }
      });
    }
  }

  // Log initialization success
  console.log("Tarot card interface initialized");
}
