document.addEventListener("DOMContentLoaded", () => {
  const gameBoard = document.getElementById("gameBoard");
  const messageDisplay = document.getElementById("message");
  const startBtn = document.getElementById("startBtn");
  const difficultySelect = document.getElementById("difficulty");
  let cards = []; // Array to hold card objects
  let flippedCards = []; // Array to store currently flipped cards
  let matchedPairs = 0;
  let allCardData = [];
  let cardData = [];
  let dataLoaded = false;

  // Fetch card data from JSON file
  fetch("myth.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      allCardData = data;
      dataLoaded = true;
      startBtn.disabled = false;
    })
    .catch((error) => {
      console.error("Error loading card data:", error);
      messageDisplay.textContent = "Failed to load game data.";
      startBtn.disabled = true;
    });

  // Function to get card count based on difficulty
  function getCardCountByDifficulty() {
    const val = parseInt(difficultySelect.value, 10);
    if (isNaN(val) || val < 1)
      return Math.max(2, Math.floor(allCardData.length * 0.05));
    if (val === 1) return Math.max(2, Math.floor(allCardData.length * 0.05)); // ~5%
    if (val === 2) return Math.max(4, Math.floor(allCardData.length * 0.15)); // ~15%
    if (val === 3) return Math.max(8, Math.floor(allCardData.length * 0.35)); // ~35%
    if (val === 4) return Math.max(12, Math.floor(allCardData.length * 0.65)); // ~65%
    return allCardData.length; // hardest: all cards
  }

  // Function to shuffle the card data
  function shuffleCards(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  // Function to get card size percent based on card count
  function getCardSizePercent(cardCount) {
    if (cardCount <= 6) return 18;
    if (cardCount <= 12) return 13;
    if (cardCount <= 20) return 10;
    if (cardCount <= 32) return 8;
    if (cardCount <= 48) return 6.5;
    return 5.5;
  }

  // Function to create a card element
  function createCard(data, idx) {
    const card = document.createElement("div");
    card.classList.add("card");
    card.dataset.image = data.image;
    card.dataset.description = data.description;
    // Alternate rotation
    card.style.transform = `rotate(${idx % 2 === 0 ? 3 : -3}deg)`;
    // Remove all direct width/height/aspect-ratio styling from JS

    const cardInner = document.createElement("div");
    cardInner.classList.add("card-inner");

    const cardFront = document.createElement("div");
    cardFront.classList.add("card-front");
    cardFront.textContent = "?"; // Show a question mark or leave blank

    const cardBack = document.createElement("div");
    cardBack.classList.add("card-back");
    const img = document.createElement("img");
    img.src = data.image; // Set image source
    img.alt = data.description;
    cardBack.appendChild(img);

    cardInner.appendChild(cardFront);
    cardInner.appendChild(cardBack);
    card.appendChild(cardInner);
    card.addEventListener("click", flipCard);
    return card;
  }

  // Function to flip a card
  function flipCard() {
    if (flippedCards.length < 2 && !this.classList.contains("flipped")) {
      this.classList.add("flipped");
      flippedCards.push(this);

      if (flippedCards.length === 2) {
        setTimeout(checkForMatch, 700); // Delay before checking for match
      }
    }
  }

  // Function to check for a match
  function checkForMatch() {
    const card1 = flippedCards[0];
    const card2 = flippedCards[1];

    if (card1.dataset.image === card2.dataset.image) {
      // Match!
      messageDisplay.textContent = "It's a match!";
      matchedPairs++;
      card1.classList.add("matched");
      card2.classList.add("matched");
      enableDescriptionHover(card1);
      enableDescriptionHover(card2);
      disableCards();
      if (matchedPairs === cardData.length / 2) {
        messageDisplay.textContent = "Congratulations! You won!";
      }
    } else {
      // No match
      messageDisplay.textContent = "Not a match!";
      unflipCards();
    }
  }

  // Function to enable description hover on matched cards
  function enableDescriptionHover(card) {
    card.addEventListener("click", showDescriptionModal);
  }

  // Modal logic
  function showDescriptionModal(e) {
    // Only trigger for matched cards
    if (!this.classList.contains("matched")) return;
    // Prevent double modal on click (e.g. from flip)
    if (e && e.target && e.target.closest(".close-modal")) return;
    // Remove any existing modal
    let oldModal = document.getElementById("descModal");
    if (oldModal) oldModal.remove();
    // Create modal
    const modal = document.createElement("div");
    modal.id = "descModal";
    modal.className = "description-modal";
    const content = document.createElement("div");
    content.className = "description-modal-content";
    content.textContent = this.dataset.description;
    // Add close button
    const closeBtn = document.createElement("button");
    closeBtn.className = "close-modal";
    closeBtn.type = "button";
    closeBtn.innerHTML = "&times;";
    closeBtn.onclick = (evt) => {
      evt.stopPropagation();
      modal.remove();
    };
    content.appendChild(closeBtn);
    modal.appendChild(content);
    // Close modal on background click
    modal.onclick = (evt) => {
      if (evt.target === modal) modal.remove();
    };
    document.body.appendChild(modal);
    // Accessibility: focus close button
    closeBtn.focus();
  }

  // Function to disable matched cards
  function disableCards() {
    flippedCards.forEach((card) => {
      card.removeEventListener("click", flipCard); // Disable clicking
    });
    resetFlippedCards();
  }

  // Function to unflip cards
  function unflipCards() {
    setTimeout(() => {
      flippedCards.forEach((card) => {
        card.classList.remove("flipped");
      });
      resetFlippedCards();
      messageDisplay.textContent = ""; // Clear message
    }, 1000); // Delay before unflipping
  }

  // Function to reset the flipped cards array
  function resetFlippedCards() {
    flippedCards = [];
  }

  // Function to initialize the game
  function initializeGame() {
    if (!dataLoaded) return;
    document.body.classList.add("game-active");
    matchedPairs = 0;
    flippedCards = [];
    messageDisplay.textContent = "";
    const sidePanel = document.getElementById("sidePanel");
    sidePanel.textContent = "";
    sidePanel.classList.remove("active");
    // Select cards based on difficulty
    let count = getCardCountByDifficulty();
    let selected = allCardData.slice();
    shuffleCards(selected);
    selected = selected.slice(0, count);
    cardData = [...selected, ...selected]; // duplicate for pairs
    shuffleCards(cardData);
    cards = cardData.map((data, idx) => createCard(data, idx));
    gameBoard.innerHTML = "";
    cards.forEach((card) => gameBoard.appendChild(card));
  }

  // Start button event
  startBtn.addEventListener("click", () => {
    initializeGame();
    startBtn.blur();
  });

  // Optionally, remove blur/dim when game is reset or page is left
  window.addEventListener("beforeunload", () => {
    document.body.classList.remove("game-active");
  });

  // Optionally, disable the button until data is loaded
  startBtn.disabled = true;
});
