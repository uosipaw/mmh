document.addEventListener("DOMContentLoaded", () => {
  const gameBoard = document.getElementById("gameBoard");
  const messageDisplay = document.getElementById("message");
  const startBtn = document.getElementById("startBtn");
  const difficultySelect = document.getElementById("difficulty");
  const playerNameInput = document.getElementById("playerName");
  let cards = []; // Array to hold card objects
  let flippedCards = []; // Array to store currently flipped cards
  let matchedPairs = 0;
  let allCardData = [];
  let cardData = [];
  let dataLoaded = false;
  let timerInterval;
  let secondsElapsed = 0;
  let moveCount = 0;
  const leaderboardKey = "mythMatchLeaderboard";
  const leaderboardPanel = document.getElementById("leaderboardPanel");
  const leaderboardList = document.getElementById("leaderboardList");

  // Start button event
  startBtn.addEventListener("click", () => {
    initializeGame();
    startBtn.blur();
  });

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
    card.dataset.pairType = data.pairType || "image";
    card.style.transform = `rotate(${idx % 2 === 0 ? 3 : -3}deg)`;

    const cardInner = document.createElement("div");
    cardInner.classList.add("card-inner");

    const cardFront = document.createElement("div");
    cardFront.classList.add("card-front");
    cardFront.textContent = "?"; // Show a question mark or leave blank

    const cardBack = document.createElement("div");
    cardBack.classList.add("card-back");
    if (data.pairType === "description") {
      cardBack.textContent = data.description;
      cardBack.style.display = "flex";
      cardBack.style.alignItems = "center";
      cardBack.style.justifyContent = "center";
      cardBack.style.fontSize = "0.85em";
      cardBack.style.padding = "10px";
      cardBack.style.textAlign = "center";
    } else {
      const img = document.createElement("img");
      img.src = data.image; // Set image source
      img.alt = data.description;
      cardBack.appendChild(img);
    }

    cardInner.appendChild(cardFront);
    cardInner.appendChild(cardBack);
    card.appendChild(cardInner);
    card.addEventListener("click", flipCard);
    return card;
  }

  // Load leaderboard from localStorage
  function loadLeaderboard() {
    let data = localStorage.getItem(leaderboardKey);
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  // Save leaderboard to localStorage
  function saveLeaderboard(entries) {
    localStorage.setItem(leaderboardKey, JSON.stringify(entries));
  }

  // Update leaderboard UI
  function updateLeaderboardUI() {
    const entries = loadLeaderboard();
    leaderboardList.innerHTML = "";
    entries.slice(0, 10).forEach((entry, i) => {
      const li = document.createElement("li");
      const name = entry.name ? ` - ${entry.name}` : "";
      li.textContent = `#${i + 1}: ${entry.moves} moves${
        entry.difficulty ? ` (${entry.difficulty})` : ""
      }${name}`;
      leaderboardList.appendChild(li);
    });
  }

  // Add a new score to leaderboard
  function addToLeaderboard(moves, difficulty) {
    let entries = loadLeaderboard();
    let name = playerNameInput.value.trim().slice(0, 16) || "anon";
    entries.push({ moves, difficulty, name, date: Date.now() });
    entries.sort((a, b) => a.moves - b.moves);
    saveLeaderboard(entries);
    updateLeaderboardUI();
  }

  // Function to initialize the game
  function initializeGame() {
    if (!dataLoaded) return;
    document.body.classList.add("game-active");
    matchedPairs = 0;
    flippedCards = [];
    messageDisplay.textContent = "";
    moveCount = 0;
    // Select cards based on difficulty
    let count = getCardCountByDifficulty();
    let selected = allCardData.slice();
    shuffleCards(selected);
    selected = selected.slice(0, count);
    let isHardest = parseInt(difficultySelect.value, 10) === 5;
    let isHard = parseInt(difficultySelect.value, 10) === 4;
    if (isHardest) {
      // For hardest: use the same number of unique cards as hard level
      let hardCount = Math.max(12, Math.floor(allCardData.length * 0.65));
      let hardSelected = allCardData.slice();
      shuffleCards(hardSelected);
      hardSelected = hardSelected.slice(0, hardCount);
      cardData = [];
      hardSelected.forEach((card) => {
        cardData.push({ ...card, pairType: "image" });
        cardData.push({ ...card, pairType: "description" });
      });
      shuffleCards(cardData);
    } else {
      // Normal: duplicate for pairs
      cardData = [...selected, ...selected];
      shuffleCards(cardData);
    }
    cards = cardData.map((data, idx) => createCard(data, idx));
    gameBoard.innerHTML = "";
    cards.forEach((card) => gameBoard.appendChild(card));
    startTimer();
    updateLeaderboardUI();
  }

  let boardLocked = false;
  // Function to flip a card
  function flipCard() {
    if (
      boardLocked ||
      this.classList.contains("flipped") ||
      this.classList.contains("matched")
    )
      return;
    this.classList.add("flipped");
    flippedCards.push(this);

    if (flippedCards.length === 2) {
      boardLocked = true;
      moveCount++;
      setTimeout(checkForMatch, 700); // Delay before checking for match
    }
  }

  // Function to check for a match
  function checkForMatch() {
    const [card1, card2] = flippedCards;
    let isMatch = false;
    // Hardest: match image to description, not identical cards
    if (
      card1.dataset.image === card2.dataset.image &&
      card1.dataset.pairType !== card2.dataset.pairType
    ) {
      isMatch = true;
    }
    // Other: match identical cards
    if (
      card1.dataset.image === card2.dataset.image &&
      card1.dataset.pairType === card2.dataset.pairType
    ) {
      isMatch = true;
    }
    if (isMatch) {
      // Match!
      messageDisplay.textContent = "It's a match!";
      matchedPairs++;
      card1.classList.add("matched");
      card2.classList.add("matched");
      disableCards();
      if (matchedPairs === cardData.length / 2) {
        messageDisplay.textContent = "Congratulations! You won!";
        endGame();
        // Add to leaderboard
        const difficultyLabel =
          difficultySelect.options[difficultySelect.selectedIndex].text;
        addToLeaderboard(moveCount, difficultyLabel);
      }
    } else {
      // No match
      messageDisplay.textContent = "Not a match!";
      unflipCards();
    }
    boardLocked = false;
  }

  // Function to show the description modal
  function showDescriptionModal(card) {
    card.addEventListener("click", showDescriptionModal);
  }

  // Modal logic
  // Function to show the description modal
  function showDescriptionModal(e) {
    // Only trigger for matched cards
    if (!this.classList.contains("matched")) return;
    // Prevent double modal on click (e.g. from flip)
    if (e && e.target && e.target.closest(".close-modal")) return;
    openDescriptionModal(this.dataset.description); // Use shared function
  }

  function openDescriptionModal(description) {
    // Remove any existing modal
    let oldModal = document.getElementById("descModal");
    if (oldModal) oldModal.remove();

    // Create modal elements
    const modal = document.createElement("div");
    modal.id = "descModal";
    modal.className = "description-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");

    const content = document.createElement("div");
    content.className = "description-modal-content";
    content.textContent = description;

    const closeBtn = document.createElement("button");
    closeBtn.className = "close-modal";
    closeBtn.type = "button";
    closeBtn.innerHTML = "×";
    closeBtn.onclick = (evt) => {
      evt.stopPropagation(); // Prevent click from propagating to modal
      closeDescriptionModal();
    };
    content.appendChild(closeBtn);
    modal.appendChild(content);

    // Close modal on background click (only outside modal content)
    modal.addEventListener("click", (evt) => {
      if (evt.target === modal) {
        closeDescriptionModal();
      }
    });

    document.body.appendChild(modal);

    // Accessibility: focus close button
    closeBtn.focus();
  }

  // Function to close the description modal
  function closeDescriptionModal() {
    const modal = document.getElementById("descModal");
    if (modal) {
      modal.remove();
    }
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
    }, 100); // Delay before unflipping
  }

  // Function to reset the flipped cards array
  function resetFlippedCards() {
    flippedCards = [];
  }

  // Optionally, remove blur/dim when game is not active (e.g. after win)
  function endGame() {
    document.body.classList.remove("game-active");
    stopTimer();
  }

  // Optionally, disable the button until data is loaded
  startBtn.disabled = true;

  // On load, show leaderboard
  updateLeaderboardUI();
});
