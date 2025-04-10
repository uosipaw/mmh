document.addEventListener("DOMContentLoaded", () => {
  const topBox = document.getElementById("topBox");
  const middleBox = document.getElementById("middleBox");
  const bottomBox = document.getElementById("bottomBox");
  const gridContainer = document.getElementById("gridContainer");
  const columnContainer = document.getElementById("columnContainer");
  const searchInput = document.getElementById("searchInput");
  const searchResultsDiv = document.getElementById("searchResults");
  const pullCardBtn = document.getElementById("pullCardBtn");
  const randomCardDisplay = document.getElementById("randomCardDisplay");

  // --- Tarot Arc Deck Elements (from tarot.js) ---
  const deckElement = document.getElementById("deck"); // Deck is now in the right-container
  const drawnCardContainer = document.getElementById("drawn-card-container");
  const cardFocusModal = document.getElementById("card-focus"); // Assuming you'll add modal structure to HTML
  const overlayElement = document.getElementById("overlay"); // Assuming you'll add overlay structure to HTML
  const closeButtonElement = document.getElementById("close-button"); // Assuming you'll add close button to modal
  const resetButtonElement = document.getElementById("reset-button"); // Assuming you'll add reset button somewhere, maybe in middle container

  // --- Tarot Configuration (from tarot.js - Configuration section) ---
  const ARC_STRUCTURE = [1, 2, 3, 4, 5, 6, 7];
  const MAX_CARDS = ARC_STRUCTURE.reduce((sum, count) => sum + count, 0);
  let tarotData = [];
  let shuffledDeck = [];

  // --- Initialize Tarot (Merged initTarot and tarot.js's DOMContentLoaded) ---
  async function initTarot() {
    const tarotJsonPath = "tarot-cards.json"; // Assuming JSON is in the same directory

    try {
      const response = await fetch(tarotJsonPath);
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      tarotData = await response.json();
      console.log(
        `Tarot card data loaded. Max cards for arc structure: ${MAX_CARDS}`
      );

      if (tarotData && tarotData) {
        // Modified to check tarotData directly, assuming it's an array now
        shuffleDeck();
        initTarotInterface();
      } else {
        console.error("Tarot data is not in the expected format:", tarotData);
      }
    } catch (error) {
      console.error("Error loading tarot card data:", error);
    }
  }

  function shuffleDeck() {
    if (!tarotData) return; // Modified to check tarotData directly
    shuffledDeck = [...tarotData].sort(() => Math.random() - 0.5); // Modified to iterate over tarotData
    console.log("Deck Shuffled");
  }

  function resetDeck() {
    shuffleDeck();
    drawnCardContainer.innerHTML = "<p>Deck reset. Draw a card!</p>";
  }

  function initTarotInterface() {
    // Re-using elements declared at the top

    if (
      (!deckElement && !pullCardBtn) || // Check for either deck or pullCardBtn, if you want to use button for random pull
      (!drawnCardContainer && middleBox) || // Check for drawnCardContainer or middleBox for middle container functionality
      (!cardFocusModal &&
        !overlayElement &&
        !closeButtonElement &&
        !resetButtonElement) // Checking for modal related elements
    ) {
      console.error(
        "Interface error: Base layout element(s) for tarot not found."
      );
      return;
    }

    // Modal content elements (optional check, good practice)
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

    // --- Deck Element Click Listener (if you keep deck element) ---
    if (deckElement) {
      deckElement.addEventListener("click", drawRandomCard);
    }

    // --- Random Card Pull Button (using your button from right container) ---
    if (pullCardBtn) {
      pullCardBtn.addEventListener("click", drawRandomCardToRightContainer); // New function for right container pull
    }

    if (resetButtonElement) {
      resetButtonElement.addEventListener("click", resetDeck);
    }
    if (closeButtonElement) {
      closeButtonElement.addEventListener("click", closeCardFocus);
    }
    if (overlayElement) {
      overlayElement.addEventListener("click", closeCardFocus);
    }
    document.addEventListener("keydown", (event) => {
      if (
        event.key === "Escape" &&
        cardFocusModal &&
        cardFocusModal.classList.contains("visible")
      ) {
        closeCardFocus();
      }
    });

    if (drawnCardContainer) {
      initResizeListener(drawnCardContainer);
    }
  }

  function drawRandomCard() {
    if (shuffledDeck.length === 0) {
      alert("Deck is empty! Please shuffle the deck.");
      return;
    }

    const card = shuffledDeck.pop();
    const isReversed = Math.random() < 0.5;

    drawnCardContainer.innerHTML = `
        <img src="./images/tarot/${card.image}" alt="${card.name} ${
      isReversed ? "(Reversed)" : "(Upright)"
    }">
        <h3>${card.name} ${isReversed ? "(Reversed)" : "(Upright)"}</h3>
        <p>${
          isReversed ? card.description.reversed : card.description.upright
        }</p>
    `;
  }

  function handleCardClick(cardId) {
    const cardElement = drawnCardElements.find(
      (el) => el.dataset.cardId === cardId
    );
    const cardJsonData = tarotData.find((c) => c.name === cardId); // Modified to search by name
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

    const descObj = cardData.description || {};
    const orientationKey = isReversed ? "reversed" : "upright";
    const descText =
      descObj[orientationKey] ||
      "Description not available for this orientation.";

    focusCardText.innerHTML = descText.replace(/<br\s*\/?>/gi, "\n");

    focusCardImage.src = cardData.image; // Modified to use image path from your JSON
    focusCardImage.alt = `${cardData.name || "Tarot Card"} ${
      isReversed ? "(Reversed)" : "(Upright)"
    }`;
    focusCardImage.className = "modal-card-image";
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

  // --- Top Box Functionality (from original script.js) ---
  topBox.addEventListener("click", () => {
    topBox.classList.toggle("expanded");
    middleBox.classList.toggle("hidden", topBox.classList.contains("expanded"));
    bottomBox.classList.toggle("hidden", topBox.classList.contains("expanded"));
  });

  // --- Middle Box Functionality (modified to hold tarot arc deck) ---
  middleBox.addEventListener("click", () => {
    middleBox.classList.add("bounce");
    topBox.classList.add("hidden");
    bottomBox.classList.add("hidden");

    setTimeout(() => {
      middleBox.classList.remove("bounce");
      topBox.style.display = "none";
      middleBox.style.display = "none";
      bottomBox.style.display = "none";

      gridContainer.classList.add("show");
      generateGridItems(gridContainer);
    }, 800);
  });

  function generateGridItems(container) {
    container.innerHTML = "";
    const numItems = 6;
    for (let i = 0; i < numItems; i++) {
      const item = document.createElement("div");
      item.classList.add("grid-item");
      item.textContent = `Grid Item ${i + 1}`;
      item.addEventListener("click", () => {
        expandGridItem(item);
      });
      container.appendChild(item);
    }
  }

  function expandGridItem(item) {
    const expandedItem = item.cloneNode(true);
    expandedItem.classList.add("expanded-grid");
    expandedItem.textContent = `Expanded Content for ${item.textContent}.  This is a lot more text to show how scrolling would work in an expanded grid item. You can put detailed descriptions, images, or any other content here.`;
    document.body.appendChild(expandedItem);

    expandedItem.addEventListener("click", () => {
      expandedItem.remove();
    });
  }

  // --- Bottom Box Functionality (from original script.js) ---
  bottomBox.addEventListener("click", () => {
    bottomBox.classList.toggle("expanded");
    topBox.classList.toggle("hidden", bottomBox.classList.contains("expanded"));
    middleBox.classList.toggle(
      "hidden",
      bottomBox.classList.contains("expanded")
    );

    if (bottomBox.classList.contains("expanded")) {
      setTimeout(() => {
        columnContainer.classList.add("show");
        generateColumns(columnContainer);
      }, 500);
    } else {
      columnContainer.classList.remove("show");
      columnContainer.innerHTML = "";
    }
  });

  function generateColumns(container) {
    container.innerHTML = "";
    const numColumns = 4;
    for (let i = 0; i < numColumns; i++) {
      const column = document.createElement("div");
      column.classList.add("column-item");
      column.textContent = `Column ${i + 1}`;
      column.addEventListener("click", () => {
        expandColumnItem(column);
      });
      container.appendChild(column);
    }
  }

  function expandColumnItem(item) {
    const expandedColumn = item.cloneNode(true);
    expandedColumn.classList.add("expanded-column");
    expandedColumn.textContent = `Expanded Content for ${item.textContent}.  This is a lot more text to demonstrate scrolling in an expanded column. You can add detailed information, images, or any other content.`;
    document.body.appendChild(expandedColumn);

    expandedColumn.addEventListener("click", () => {
      expandedColumn.remove();
    });
  }

  // --- Search Functionality (from original script.js) ---
  let tarotCards = []; // Will be populated by initTarot now

  initTarot().then(() => {
    // Initialize tarot and THEN setup search and random pull
    tarotCards = tarotData; // Assign loaded data to tarotCards for search

    searchInput.addEventListener("input", () => {
      const searchTerm = searchInput.value.toLowerCase();
      const filteredCards = tarotCards.filter((card) =>
        card.name.toLowerCase().includes(searchTerm)
      );
      displaySearchResults(filteredCards);
    });

    function displaySearchResults(results) {
      searchResultsDiv.innerHTML = "";
      if (results.length > 0 && searchInput.value.trim() !== "") {
        searchResultsDiv.classList.add("show");
        results.forEach((card) => {
          const resultItem = document.createElement("div");
          resultItem.classList.add("search-result-item");
          resultItem.innerHTML = `<img src="${card.image}" alt="${card.name}"> ${card.name}`;
          resultItem.addEventListener("click", () => {
            searchInput.value = card.name;
            searchResultsDiv.classList.remove("show");
            displayCardDescription(card);
          });
          searchResultsDiv.appendChild(resultItem);
        });
      } else {
        searchResultsDiv.classList.remove("show");
      }
    }

    function displayCardDescription(card) {
      const cardDisplayArea = document.querySelector(".left-container");
      cardDisplayArea.innerHTML = `
                <h3>${card.name}</h3>
                <img src="${card.image}" alt="${
        card.name
      }" style="max-width: 100px; margin-bottom: 10px;">
                <p>${
                  card.description.upright ||
                  card.description.reversed ||
                  "No description available"
                }</p>
            `;
    }
  });

  // --- Random Card Pull (Right Container - Modified from original script.js and tarot.js) ---
  function drawRandomCardToRightContainer() {
    if (tarotCards.length > 0) {
      const randomIndex = Math.floor(Math.random() * tarotCards.length);
      const randomCard = tarotCards[randomIndex];
      const isReversed = Math.random() < 0.5; // Randomize reversed for random pull too

      randomCardDisplay.innerHTML = `
                <h3>Your Card: ${randomCard.name} ${
        isReversed ? "(Reversed)" : "(Upright)"
      }</h3>
                <img src="${randomCard.image}" alt="${randomCard.name}">
                <p>${
                  isReversed
                    ? randomCard.description.reversed ||
                      "No reversed description"
                    : randomCard.description.upright || "No upright description"
                }</p>
            `;
    } else {
      randomCardDisplay.textContent = "Tarot cards data not loaded yet.";
    }
  }
});
