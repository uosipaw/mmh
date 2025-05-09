/* tarot.js */
document.addEventListener("DOMContentLoaded", () => {
  const deck = document.getElementById("deck");
  const spreadSelect = document.getElementById("spreadSelect");

  const modal = document.getElementById("cardModal");
  const closeModal = document.querySelector(".close-modal");
  const modalCardDescription = document.getElementById("modalCardDescription");

  let cardElements = []; // Add this to track card elements
  const cardBackImage = "./images/tarot/back.png";

  // Spread Layouts (simplified - add more as needed)
  const spreadLayouts = {
    "celtic-cross": {
      columns: 4,
      rows: 4,
      numCards: 10,
      positions: {
        1: { gridArea: "2 / 2 / 3 / 3", margin: "2px" },
        2: {
          gridArea: "2 / 3 / 3 / 4",
          transform: "rotate(90deg)",
          margin: "2px",
        },
        3: { gridArea: "1 / 2 / 2 / 3", margin: "2px" },
        4: { gridArea: "3 / 2 / 4 / 3", margin: "2px" },
        5: { gridArea: "2 / 1 / 3 / 2", margin: "2px" },
        6: { gridArea: "2 / 4 / 3 / 5", margin: "2px" },
        7: { gridArea: "4 / 3 / 5 / 4", margin: "2px" },
        8: { gridArea: "3 / 3 / 4 / 4", margin: "2px" },
        9: { gridArea: "2 / 3 / 3 / 4", zIndex: 1, margin: "2px" },
        10: { gridArea: "1 / 3 / 2 / 4", margin: "2px" },
      },
    },
    guidance: {
      columns: 4,
      rows: 3,
      numCards: 6,
      positions: {
        1: { gridArea: "1 / 1 / 2 / 2", margin: "2px" },
        2: { gridArea: "1 / 4 / 2 / 5", margin: "2px" },
        3: { gridArea: "1 / 2 / 2 / 4", margin: "2px" },
        4: { gridArea: "2 / 2 / 3 / 4", margin: "2px" },
        5: { gridArea: "3 / 1 / 4 / 2", margin: "2px" },
        6: { gridArea: "3 / 4 / 4 / 5", margin: "2px" },
      },
    },
    "ancestral-connection": {
      columns: 3,
      rows: 3,
      numCards: 4,
      positions: {
        1: { gridArea: "2 / 2 / 3 / 3" },
        2: { gridArea: "2 / 1 / 3 / 2" },
        3: { gridArea: "1 / 2 / 2 / 3" },
        4: { gridArea: "2 / 3 / 3 / 4" },
      },
    },
    "two-options": {
      columns: 3,
      rows: 3,
      numCards: 7,
      positions: {
        1: { gridArea: "3 / 2 / 4 / 3" },
        2: { gridArea: "2 / 2 / 3 / 3" },
        3: { gridArea: "1 / 2 / 2 / 3" },
        4: { gridArea: "2 / 1 / 3 / 2" },
        5: { gridArea: "3 / 1 / 4 / 2" },
        6: { gridArea: "2 / 3 / 3 / 4" },
        7: { gridArea: "3 / 3 / 4 / 4" },
      },
    },
    "three-card": {
      columns: 3,
      rows: 1,
      numCards: 3,
      positions: {
        1: { gridArea: "1/ 1/2/2" },
        2: { gridArea: "1/2/2/3" },
        3: { gridArea: "1/3/2/4" },
      },
    },
    fan: {
      columns: 1,
      rows: 1,
      numCards: 7, // Default number of cards for fan layout
      positions: {},
    },
  };

  // Dynamically calculates the card size depending on window size, layout, etc.
  function calculateCardSize(layout, deckWidth, deckHeight) {
    const spreadLayout = spreadLayouts[layout];

    if (!spreadLayout) {
      return 100; // Return fallback size if bad name given
    }
    const columns = spreadLayout.columns;
    const rows = spreadLayout.rows;

    const horizontalCardSize = (deckWidth / columns) * 0.98; // Adjust for 1% padding on each side
    const verticalCardSize = (deckHeight / rows) * 0.98;

    return Math.min(horizontalCardSize, verticalCardSize); // Ensure cards fit within container
  }

  // Create card function modified to use new card size
  function createCardElement(cardData, cardSize) {
    const card = document.createElement("div");
    card.classList.add("card");

    card.style.width = `${cardSize}px`; // Card size applied to HTML
    card.style.height = `${cardSize * 1.4}px`; // Card size applied to HTML

    const isReversed = Math.random() < 0.5;

    if (isReversed) {
      card.classList.add("reversed");
    }

    const inner = document.createElement("div");
    inner.classList.add("card-inner");

    const front = document.createElement("div");
    front.classList.add("card-front");

    // Set the card face image
    const frontImagePath = `./images/tarot/${cardData.id}.png`;
    front.style.backgroundImage = `url('${frontImagePath}')`;

    const back = document.createElement("div");
    back.classList.add("card-back");
    back.style.backgroundImage = `url('${cardBackImage}')`;

    inner.appendChild(front);
    inner.appendChild(back);
    card.appendChild(inner);

    // Add click event to flip the card
    card.addEventListener("click", () => {
      card.classList.toggle("flipped");
      displayCardInModal(cardData, card.classList.contains("reversed"));
    });

    return card;
  }

  // --- Card and Deck Functions ---
  function createCards(cards) {
    const layout = spreadSelect.value;
    const spreadLayout = spreadLayouts[layout];

    if (!spreadLayout) {
      deck.classList.remove("visible"); // Hide cards if no valid layout
      return;
    }

    let calculatedCardSize = calculateCardSize(
      layout,
      deck.offsetWidth,
      deck.offsetHeight
    );

    // Get the correct number of cards for this spread
    const numCards = spreadLayout.numCards;
    const selectedCards = cards.slice(0, numCards);

    deck.innerHTML = "";
    cardElements = []; // Clear and re-write card elements array

    deck.style.gridTemplateColumns = `repeat(${spreadLayout.columns}, 1fr)`;
    deck.style.gridTemplateRows = `repeat(${spreadLayout.rows}, 1fr)`;

    selectedCards.forEach((cardData, i) => {
      const card = createCardElement(cardData, calculatedCardSize);

      if (spreadLayout.positions[i + 1]) {
        const position = spreadLayout.positions[i + 1];
        Object.assign(card.style, position);
      }

      deck.appendChild(card);
      cardElements.push(card);
    });

    deck.classList.add("visible"); // Show cards when a valid layout is selected
  }

  // Events for drag and drop functionality
  function createControlButton(iconPath, altText, onClickHandler) {
    const button = document.createElement("button");
    const icon = document.createElement("img");
    icon.src = iconPath;
    icon.alt = altText;
    button.appendChild(icon);
    button.addEventListener("click", onClickHandler);
    return button;
  }

  function setupControls() {
    const controls = document.getElementById("controls");
    controls.innerHTML = ""; // Clear existing controls

    const randomizeBtn = createControlButton(
      "./icons/randomize.png",
      "Randomize",
      () => {
        cardElements.forEach((card, index) => {
          const randX = Math.random() * 400 - 200;
          const randY = Math.random() * 300 - 150;
          const randRotation = Math.random() * 360 - 180;
          gsap.to(card, {
            x: randX,
            y: randY,
            rotation: randRotation,
            duration: 0.5,
            ease: "power2.inOut",
          });
          card.style.zIndex = index;
        });
      }
    );

    const resetBtn = createControlButton("./icons/reset.png", "Reset", () => {
      cardElements.forEach((card, index) => {
        gsap.to(card, {
          x: 0,
          y: 0,
          rotation: 0,
          duration: 0.5,
          ease: "power2.out",
        });
        card.style.zIndex = index;
      });
    });

    const reshuffleBtn = createControlButton(
      "./icons/reshuffle.png",
      "Reshuffle",
      reshuffle
    );

    controls.appendChild(randomizeBtn);
    controls.appendChild(resetBtn);
    controls.appendChild(reshuffleBtn);
  }

  let cachedCardData = null;

  function reshuffle() {
    if (cachedCardData) {
      const shuffledCards = cachedCardData.cards.sort(
        () => Math.random() - 0.5
      );
      createCards(shuffledCards);
    } else {
      fetch("./tarot-cards.json")
        .then((response) => response.json())
        .then((data) => {
          cachedCardData = data; // Cache the fetched data
          const shuffledCards = data.cards.sort(() => Math.random() - 0.5);
          createCards(shuffledCards);
        })
        .catch((error) => {
          console.error("Failed to fetch tarot cards:", error);
          alert("Unable to load tarot cards. Please try again later.");
        });
    }
  }

  function displayCardInModal(card, isReversed) {
    modalCardDescription.innerHTML = `
        <h3>${card.name} ${isReversed ? "(Reversed)" : ""}</h3>
        <img src="./images/tarot/${card.id}.png" alt="${card.name}" style="${
      isReversed ? "transform: rotate(180deg);" : ""
    }">
        <p>${
          isReversed ? card.description.reversed : card.description.upright
        }</p>
    `;
    modal.classList.add("show"); // Add the 'show' class to display the modal
  }

  closeModal.addEventListener("click", () => {
    modal.classList.remove("show"); // Remove the 'show' class to hide the modal
  });

  // When the user clicks anywhere outside of the modal, close it
  window.onclick = function (event) {
    if (event.target == modal) {
      modal.classList.remove("show"); // Remove the 'show' class to hide the modal
    }
  };

  function initialSetup() {
    fetch("./tarot-cards.json")
      .then((response) => response.json())
      .then((data) => {
        const shuffledCards = data.cards.sort(() => Math.random() - 0.5);
        createCards(shuffledCards);
      })
      .catch((error) => {
        console.error("Failed to fetch tarot cards:", error);
        alert("Unable to load tarot cards. Please try again later.");
      });
  }

  // Debounce function to limit the frequency of calls
  function debounce(func, wait) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  // Ensure dropdown menu items trigger reshuffle on hover
  document.querySelectorAll(".dropdown-menu a").forEach((item) => {
    item.addEventListener("mouseover", (event) => {
      event.preventDefault();
      const selectedSpread = event.target.getAttribute("data-spread");
      spreadSelect.value = selectedSpread; // Update the hidden select value
      reshuffle(); // Trigger reshuffle for the selected spread
    });
  });

  window.addEventListener("resize", reshuffle);
});

initialSetup();
setupControls();
