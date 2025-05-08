/* tarot.js */
document.addEventListener("DOMContentLoaded", () => {
  const deck = document.getElementById("deck");
  const spreadSelect = document.getElementById("spreadSelect");
  const reshuffleBtn = document.getElementById("reshuffleBtn");

  const modal = document.getElementById("cardModal");
  const closeModal = document.querySelector(".close-modal");
  const modalCardDescription = document.getElementById("modalCardDescription");

  let cardElements = []; //add this to track card elements
  const cardBackImage = "./images/tarot/back.png";

  // Spread Layouts (simplified - add more as needed)
  const spreadLayouts = {
    "celtic-cross": {
      columns: 4,
      rows: 4,
      numCards: 10,
      positions: {
        1: { gridArea: "2 / 2 / 3 / 3" },
        2: {
          gridArea: "2 / 3 / 3 / 4",
          transform: "rotate(90deg)",
        },
        3: {
          gridArea: "1 / 2 / 2 / 3",
        },
        4: {
          gridArea: "3 / 2 / 4 / 3",
        },
        5: {
          gridArea: "2 / 1 / 3 / 2",
        },
        6: {
          gridArea: "2 / 4 / 3 / 5",
        },
        7: {
          gridArea: "4 / 3 / 5 / 4",
        },
        8: {
          gridArea: "3 / 3 / 4 / 4",
        },
        9: {
          gridArea: "2 / 3 / 3 / 4",
          zIndex: 1,
        },
        10: {
          gridArea: "1 / 3 / 2/ 4",
        },
      },
    },
    guidance: {
      columns: 4,
      rows: 3,
      numCards: 6,
      positions: {
        1: { gridArea: "1 / 1 / 2 / 2" },
        2: { gridArea: "1 / 4 / 2 / 5" },
        3: { gridArea: "1 / 2 / 2 / 4" },
        4: { gridArea: "2 / 2 / 3 / 4" },
        5: { gridArea: "3 / 1 / 4 / 2" },
        6: { gridArea: "3 / 4 / 4 / 5" },
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

  //Dynamically calculates the Card Size depending on window Size, layout etc. This happens in CreateCard()
  function calculateCardSize(layout, deckWidth, deckHeight) {
    const spreadLayout = spreadLayouts[layout];

    if (!spreadLayout) {
      return 100; //return fallback size if  bad name given
    }
    const columns = spreadLayout.columns;
    const rows = spreadLayout.rows;

    const horizontalCardSize = deckWidth / columns - 10; // Adjust 10 as grid gap
    const verticalCardSize = deckHeight / rows - 10;

    let cardWidth = Math.min(horizontalCardSize, verticalCardSize);

    return cardWidth;
  }

  //createCardFunction Modified To Use new Card Size;

  function createCardElement(cardData, i, cardSize) {
    const card = document.createElement("div");
    card.classList.add("card");

    card.style.width = `${cardSize}px`; //Card size Applied to HTML

    card.style.height = `${cardSize * 1.4}px`; //Card size Applied to HTML

    const isReversed = Math.random() < 0.5;

    if (isReversed) {
      card.classList.add("reversed");
    }
    const inner = document.createElement("div");
    inner.classList.add("card-inner");

    const front = document.createElement("div");

    front.classList.add("card-front");

    front.style.backgroundImage = `url('./images/tarot/${cardData.id}.png')`;

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

    let calculatedCardSize = calculateCardSize(
      layout,
      deck.offsetWidth,
      deck.offsetHeight
    );

    // Get the correct number of cards for this spread
    const numCards = spreadLayout ? spreadLayout.numCards : 3; // Default to 3 if layout not found
    const selectedCards = cards.slice(0, numCards);

    deck.innerHTML = "";
    cardElements = []; // Clear and re-write Card elements array

    if (spreadLayout) {
      deck.style.gridTemplateColumns = `repeat(${spreadLayout.columns}, 1fr)`;
      deck.style.gridTemplateRows = `repeat(${spreadLayout.rows}, 1fr)`;
    }

    selectedCards.forEach((cardData, i) => {
      const card = createCardElement(cardData, i, calculatedCardSize);

      // Position Card Code Block
      if (spreadLayout && spreadLayout.positions[i + 1]) {
        const position = spreadLayout.positions[i + 1];
        Object.assign(card.style, position);
      }

      deck.appendChild(card);
      cardElements.push(card);
    });
  }

  function reshuffle() {
    fetch("./tarot-cards.json")
      .then((response) => response.json())
      .then((data) => {
        const shuffledCards = data.cards.sort(() => Math.random() - 0.5);
        createCards(shuffledCards);
      });
  }

  function displayCardInModal(card, isReversed) {
    modalCardDescription.innerHTML = `

          <h3>${card.name} ${isReversed ? "(Reversed)" : ""}</h3>
                  <img src="./images/tarot/${card.id}.png" alt="${
      card.name
    }" style="${isReversed ? "transform: rotate(180deg);" : ""}">

        <p>${
          isReversed ? card.description.reversed : card.description.upright
        }</p>
    `;
    modal.style.display = "block";
  }

  closeModal.addEventListener("click", () => {
    modal.style.display = "none";
  });

  // When the user clicks anywhere outside of the modal, close it

  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  };
  function initialSetup() {
    fetch("./tarot-cards.json")
      .then((response) => response.json())
      .then((data) => {
        const shuffledCards = data.cards.sort(() => Math.random() - 0.5);
        createCards(shuffledCards);
      });
  }
  //Add Event Listeners

  reshuffleBtn.addEventListener("click", reshuffle);
  spreadSelect.addEventListener("change", reshuffle);

  window.addEventListener("resize", reshuffle);
  initialSetup();
});
