const deckEl = document.getElementById("deck");
const spreadSelect = document.getElementById("spreadSelect");
const spreadDescriptionsDiv = document.getElementById("spreadDescriptions");

let fullDeck = [];

const spreadLayouts = {
  celticCross: {
    numCards: 10,
    columns: 3,
    rows: 4,
    positions: {
      1: { label: "Present", gridArea: "2 / 2 / 3 / 3" },
      2: { label: "Challenge", gridArea: "2 / 3 / 3 / 4" },
      3: { label: "Past", gridArea: "1 / 2 / 2 / 3" },
      4: { label: "Future", gridArea: "3 / 2 / 4 / 3" },
      5: { label: "Above", gridArea: "2 / 1 / 3 / 2" },
      6: { label: "Below", gridArea: "4 / 2 / 5 / 3" },
      7: { label: "Advice", gridArea: "1 / 3 / 2 / 4" },
      8: { label: "External", gridArea: "3 / 3 / 4 / 4" },
      9: { label: "Hopes", gridArea: "4 / 3 / 5 / 4" },
      10: { label: "Outcome", gridArea: "4 / 1 / 5 / 2" },
    },
  },
  threeCard: {
    numCards: 3,
    columns: 3,
    rows: 1,
    positions: {
      1: { label: "Past", gridArea: "1 / 1 / 2 / 2" },
      2: { label: "Present", gridArea: "1 / 2 / 2 / 3" },
      3: { label: "Future", gridArea: "1 / 3 / 2 / 4" },
    },
  },
};

fetch("tarot-cards.json")
  .then((res) => res.json())
  .then((data) => {
    fullDeck = data.cards;
  })
  .catch((err) => console.error("Error loading JSON:", err));

function shuffleDeck(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function calculateCardSize(spread, containerWidth, containerHeight) {
  const padding = 20;
  const cols = spread.columns;
  const rows = spread.rows;

  const width = (containerWidth - (cols + 1) * padding) / cols;
  const height = (containerHeight - (rows + 1) * padding) / rows;

  return {
    width: Math.min(width, 180),
    height: Math.min(height, 270),
  };
}

function createCardElement(
  cardData,
  index,
  orientation = "upright",
  label = "",
  size
) {
  const card = document.createElement("div");
  card.className = "card";
  card.tabIndex = 0;
  card.style.width = `${size.width}px`;
  card.style.height = `${size.height}px`;

  // Do NOT add 'flipped' class initially; all cards start face down
  // Do NOT add 'reversed' class at creation, only use orientation for later logic if needed
  // Only add 'flipped' when user clicks

  const inner = document.createElement("div");
  inner.className = "card-inner";

  const front = document.createElement("div");
  front.className = "card-front";
  const face = document.createElement("img");
  face.src = `./images/tarot/${cardData.id}.png`;
  face.alt = cardData.name;
  front.appendChild(face);

  const back = document.createElement("div");
  back.className = "card-back";
  const backImg = document.createElement("img");
  backImg.src = "./images/tarot/back.png";
  backImg.alt = "Back of card";
  back.appendChild(backImg);

  inner.appendChild(front);
  inner.appendChild(back);
  card.appendChild(inner);

  // Remove manual visibility settings; let CSS handle face up/down
  // (Do not set front.style.visibility or back.style.visibility)

  // Set up upright/reversed logic for description and image rotation
  let cardOrientation = orientation;
  let cardDescription =
    cardData.description?.[cardOrientation] || cardData.meaning;
  if (cardOrientation === "reversed") {
    face.style.transform = "rotate(180deg)";
  } else {
    face.style.transform = "none";
  }

  card.addEventListener("click", () => {
    if (!card.classList.contains("flipped")) {
      card.classList.add("flipped");
      setTimeout(() => {
        addCardDescription(
          { ...cardData, description: { [cardOrientation]: cardDescription } },
          cardOrientation,
          label
        );
      }, 800);
    } else {
      showModal(
        { ...cardData, description: { [cardOrientation]: cardDescription } },
        cardOrientation
      );
    }
  });

  return card;
}

function addCardDescription(cardData, orientation, label = "") {
  const descBlock = document.createElement("div");
  descBlock.className = "card-desc-block";
  descBlock.innerHTML = `
    <div class="card-desc-label">${label} (${orientation})</div>
    <div class="card-desc-text">${
      cardData.description?.[orientation] || cardData.meaning
    }</div>
  `;
  spreadDescriptionsDiv.appendChild(descBlock);
}

function createCards(cardPool) {
  const layoutKey = spreadSelect.value;
  const spread = spreadLayouts[layoutKey];
  if (!spread) return;

  const selectedCards = cardPool.slice(0, spread.numCards);
  deckEl.innerHTML = "";
  spreadDescriptionsDiv.innerHTML = "";

  deckEl.style.gridTemplateColumns = `repeat(${spread.columns}, 1fr)`;
  deckEl.style.gridTemplateRows = `repeat(${spread.rows}, 1fr)`;

  const cardSize = calculateCardSize(
    spread,
    deckEl.offsetWidth,
    deckEl.offsetHeight
  );

  selectedCards.forEach((cardData, i) => {
    const pos = spread.positions[i + 1];
    const orientation = Math.random() > 0.5 ? "upright" : "reversed";
    const card = createCardElement(
      cardData,
      i,
      orientation,
      pos?.label || cardData.name,
      cardSize
    );
    if (pos?.gridArea) card.style.gridArea = pos.gridArea;
    deckEl.appendChild(card);
  });
}

function showModal(cardData, orientation = "upright") {
  const modal = document.getElementById("cardModal");
  modal.classList.add("show");
  document.body.classList.add("modal-bg-blur");

  const content = modal.querySelector(".modal-content");
  content.innerHTML = `
    <span class="close-modal" tabindex="0">&times;</span>
    <img src="./images/tarot/${cardData.id}.png" 
         alt="${cardData.name}" 
         style="transform: ${
           orientation === "reversed" ? "rotate(180deg)" : "none"
         };" />
    <h2>${cardData.name} (${orientation})</h2>
    <p>${cardData.description?.[orientation] || cardData.meaning}</p>
  `;

  const close = () => {
    modal.classList.remove("show");
    document.body.classList.remove("modal-bg-blur");
  };

  content.querySelector(".close-modal").onclick = close;
  modal.onclick = (e) => {
    if (e.target === modal) close();
  };
}

spreadSelect.addEventListener("change", () => {
  if (spreadSelect.value === "default" || fullDeck.length === 0) return;
  const cardPool = shuffleDeck(fullDeck);
  createCards(cardPool);
});

document.getElementById("reshuffleBtn").addEventListener("click", () => {
  if (spreadSelect.value === "default" || fullDeck.length === 0) return;
  const cardPool = shuffleDeck(fullDeck);
  createCards(cardPool);
});

document.getElementById("resetBtn").addEventListener("click", () => {
  deckEl.innerHTML = "";
  spreadDescriptionsDiv.innerHTML = "";
});
