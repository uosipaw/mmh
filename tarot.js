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

  // --- Tarot Arc Deck Elements ---
  const deckElement = document.getElementById("deck");
  const drawnCardContainer = document.getElementById("drawn-card-container");
  const cardFocusModal = document.getElementById("card-focus");
  const overlayElement = document.getElementById("overlay");
  const closeButtonElement = document.getElementById("close-button");

  // --- Tarot Configuration ---
  const ARC_STRUCTURE = [1, 2, 3, 4, 5, 6, 7];
  const MAX_CARDS = ARC_STRUCTURE.reduce((sum, count) => sum + count, 0);
  let tarotData = [];
  let shuffledDeck = [];
  let drawnCardElements = []; // Assuming this is used elsewhere, keep it

  // --- Initialize Tarot ---
  async function initTarot() {
    const tarotJsonPath = "tarot-cards.json";

    try {
      const response = await fetch(tarotJsonPath);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      tarotData = await response.json();
      console.log("Tarot card data loaded.");

      if (tarotData && tarotData.cards) {
        tarotData = tarotData.cards; // Access the cards array
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
    if (!tarotData) return;
    shuffledDeck = [...tarotData].sort(() => Math.random() - 0.5);
    console.log("Deck Shuffled");
  }

  function initTarotInterface() {
    // Combined conditional for element checks
    if (
      !deckElement &&
      !pullCardBtn &&
      !drawnCardContainer &&
      !middleBox &&
      !cardFocusModal &&
      !overlayElement &&
      !closeButtonElement
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

    if (deckElement) {
      deckElement.addEventListener("click", drawRandomCard);
    }
    if (pullCardBtn) {
      pullCardBtn.addEventListener("click", drawRandomCardToRightContainer);
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
      //initResizeListener(drawnCardContainer); // Assuming this function is defined elsewhere if needed
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
        <img src="/images/tarot/${card.id}.png" alt="${card.name} ${
      isReversed ? "(Reversed)" : "(Upright)"
    }" 
             class="${isReversed ? "reversed" : ""}">
        <h3>${card.name} ${isReversed ? "(Reversed)" : "(Upright)"}</h3>
        <p>${
          isReversed ? card.description.reversed : card.description.upright
        }</p>
    `;
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

    focusCardImage.src = `/images/tarot/${cardData.id}.png`;
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

  // Create reset buttons
  const resetTopBoxButton = document.createElement("button");
  resetTopBoxButton.textContent = "Reset Top Box";
  resetTopBoxButton.style.display = "none";

  const resetMiddleBoxButton = document.createElement("button");
  resetMiddleBoxButton.textContent = "Reset Middle Box";
  resetMiddleBoxButton.style.display = "none";

  const resetBottomBoxButton = document.createElement("button");
  resetBottomBoxButton.textContent = "Reset Bottom Box";
  resetBottomBoxButton.style.display = "none";

  // Append reset buttons below their respective containers
  topBox.insertAdjacentElement("afterend", resetTopBoxButton);
  middleBox.insertAdjacentElement("afterend", resetMiddleBoxButton);
  bottomBox.insertAdjacentElement("afterend", resetBottomBoxButton);

  resetTopBoxButton.classList.add("reset-button");
  resetMiddleBoxButton.classList.add("reset-button");
  resetBottomBoxButton.classList.add("reset-button");

  // --- Top Box Functionality ---
  topBox.addEventListener("click", () => {
    topBox.classList.add("expanded"); // Changed to add for consistent behavior
    topBox.classList.toggle("container-expanded"); // Use reusable class
    topBox.classList.toggle("show"); // Use reusable class for visibility
    middleBox.classList.toggle("hidden", topBox.classList.contains("expanded"));
    bottomBox.classList.toggle("hidden", topBox.classList.contains("expanded"));
    resetTopBoxButton.style.display = "block";
  });

  resetTopBoxButton.addEventListener("click", () => {
    topBox.classList.remove("expanded", "container-expanded", "show");
    middleBox.classList.remove("hidden");
    bottomBox.classList.remove("hidden");
    resetTopBoxButton.style.display = "none";
  });

  // --- Middle Box Functionality ---
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
      resetMiddleBoxButton.style.display = "block";
    }, 800);
  });

  resetMiddleBoxButton.addEventListener("click", () => {
    topBox.style.display = "";
    middleBox.style.display = "";
    bottomBox.style.display = "";
    gridContainer.classList.remove("show");
    gridContainer.innerHTML = "";
    resetMiddleBoxButton.style.display = "none";
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

  // --- Bottom Box Functionality ---
  bottomBox.addEventListener("click", () => {
    bottomBox.classList.add("expanded"); // Changed to add for consistent behavior
    bottomBox.classList.toggle("container-expanded"); // Use reusable class
    bottomBox.classList.toggle("show"); // Use reusable class for visibility
    topBox.classList.toggle("hidden", bottomBox.classList.contains("expanded"));
    middleBox.classList.toggle(
      "hidden",
      bottomBox.classList.contains("expanded")
    );

    if (bottomBox.classList.contains("expanded")) {
      setTimeout(() => {
        columnContainer.classList.add("show");
        generateColumns(columnContainer);
        resetBottomBoxButton.style.display = "block";
      }, 500);
    } else {
      columnContainer.classList.remove("show");
      columnContainer.innerHTML = "";
    }
  });

  resetBottomBoxButton.addEventListener("click", () => {
    bottomBox.classList.remove("expanded", "container-expanded", "show");
    topBox.classList.remove("hidden");
    middleBox.classList.remove("hidden");
    columnContainer.classList.remove("show");
    columnContainer.innerHTML = "";
    resetBottomBoxButton.style.display = "none";
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

  // --- Search Functionality ---
  let tarotCards = [];

  initTarot().then(() => {
    tarotCards = tarotData;

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
          resultItem.innerHTML = `<img src="/images/tarot/${card.id}.png" alt="${card.name}"> ${card.name}`;
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
        <img src="/images/tarot/${card.id}.png" alt="${
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

  // --- Random Card Pull (Right Container) ---
  function drawRandomCardToRightContainer() {
    if (tarotCards.length > 0) {
      const randomIndex = Math.floor(Math.random() * tarotCards.length);
      const randomCard = tarotCards[randomIndex];
      const isReversed = Math.random() < 0.5;

      randomCardDisplay.innerHTML = `
        <h3>Your Card: ${randomCard.name} ${
        isReversed ? "(Reversed)" : "(Upright)"
      }</h3>
        <img src="/images/tarot/${randomCard.id}.png" alt="${randomCard.name}">
        <p>${
          isReversed
            ? randomCard.description.reversed || "No reversed description"
            : randomCard.description.upright || "No upright description"
        }</p>
      `;
    } else {
      randomCardDisplay.textContent = "Tarot cards data not loaded yet.";
    }
  }

  // --- Intro Title Functionality ---
  const introTitle = document.querySelector(".intro-title");
  const introDescription = document.querySelector(".intro-description");

  if (introTitle && introDescription) {
    introTitle.addEventListener("click", () => {
      introTitle.classList.toggle("clicked");
    });
  }

  initTarot(); // Initialize tarot data and interface on page load
});
