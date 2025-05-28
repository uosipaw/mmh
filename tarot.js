const deckEl = document.getElementById("deck");
const spreadSelect = document.getElementById("spreadSelect");
const spreadDescriptionsDiv = document.getElementById("spreadDescriptions");

let fullDeck = [];

// Updated spreadLayouts keys to match HTML and CSS (camelCase)
const spreadLayouts = {
  celticCross: {
    numCards: 10,
    columns: 4,
    rows: 4,
    positions: {
      1: { label: "Present" },
      2: { label: "Challenge" },
      3: { label: "Past" },
      4: { label: "Future" },
      5: { label: "Above" },
      6: { label: "Below" },
      7: { label: "Advice" },
      8: { label: "External" },
      9: { label: "Hopes" },
      10: { label: "Outcome" },
    },
  },
  threeCard: {
    numCards: 3,
    columns: 3,
    rows: 1,
    positions: {
      1: { label: "Past" },
      2: { label: "Present" },
      3: { label: "Future" },
    },
  },
  crossSpread: {
    numCards: 5,
    columns: 3,
    rows: 3,
    positions: {
      1: { label: "Center" },
      2: { label: "Top" },
      3: { label: "Right" },
      4: { label: "Bottom" },
      5: { label: "Left" },
    },
  },
  horseshoe: {
    numCards: 7,
    columns: 7,
    rows: 1,
    positions: {
      1: { label: "Past" },
      2: { label: "Present" },
      3: { label: "Hidden" },
      4: { label: "Obstacles" },
      5: { label: "Environment" },
      6: { label: "Advice" },
      7: { label: "Outcome" },
    },
  },
  pentagram: {
    numCards: 5,
    columns: 3,
    rows: 3,
    positions: {
      1: { label: "Spirit" },
      2: { label: "Air" },
      3: { label: "Water" },
      4: { label: "Fire" },
      5: { label: "Earth" },
    },
  },
  eightCards: {
    // fixed key
    numCards: 8,
    columns: 3,
    rows: 4,
    positions: {
      1: { label: "Card1" },
      2: { label: "Card2" },
      3: { label: "Card3" },
      4: { label: "Card4" },
      5: { label: "Card5" },
      6: { label: "Card6" },
      7: { label: "Card7" },
      8: { label: "Card8" },
    },
  },
  sixCards: {
    // fixed key
    numCards: 6,
    columns: 3,
    rows: 3,
    positions: {
      1: { label: "Card1" },
      2: { label: "Card2" },
      3: { label: "Card3" },
      4: { label: "Card4" },
      5: { label: "Card5" },
      6: { label: "Card6" },
    },
  },
  loveSpread: {
    // fixed key
    numCards: 8,
    columns: 3,
    rows: 3,
    positions: {
      1: { label: "Card1" },
      2: { label: "Card2" },
      3: { label: "Card3" },
      4: { label: "Card4" },
      5: { label: "Card5" },
      6: { label: "Card6" },
      7: { label: "Card7" },
      8: { label: "Card8" },
    },
  },
};

// Defensive: check for required DOM elements
if (!deckEl || !spreadSelect || !spreadDescriptionsDiv) {
  throw new Error(
    "Required DOM elements not found. Check your HTML structure."
  );
}

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
  const gap = 1; // match CSS grid gap
  const cols = spread.columns;
  const rows = spread.rows;

  // Clamp padding to match .tarot-right and #deck
  const horizontalPadding = 2 * 0.01 * window.innerWidth; // 2vw left/right
  const verticalPadding = 2 * 0.01 * window.innerHeight; // 2vw top/bottom

  // Calculate available width/height for the grid inside .tarot-right
  const availableWidth = containerWidth - horizontalPadding;
  const availableHeight = Math.min(
    containerHeight - verticalPadding,
    window.innerHeight * 0.8
  );

  // Calculate available width/height for cards (subtracting total gaps)
  const totalGapWidth = gap * (cols - 1);
  const totalGapHeight = gap * (rows - 1);

  const maxWidth = (availableWidth - totalGapWidth) / cols;
  const maxHeight = (availableHeight - totalGapHeight) / rows;

  // Maintain 343:480 aspect ratio
  const aspect = 343 / 480;
  let width = maxWidth;
  let height = width / aspect;
  if (height > maxHeight) {
    height = maxHeight;
    width = height * aspect;
  }

  // Clamp to reasonable min/max for usability
  width = Math.max(40, Math.min(width, 240));
  height = Math.max(56, Math.min(height, 336)); // 40/0.714 ≈ 56, 240/0.714 ≈ 336

  return {
    width,
    height,
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
  // Set calculated size
  card.style.width = `${size.width}px`;
  card.style.height = `${size.height}px`;

  const inner = document.createElement("div");
  inner.className = "card-inner";

  const front = document.createElement("div");
  front.className = "card-front";
  const face = document.createElement("img");
  face.src = `./images/tarot/${cardData.id}.png`;
  face.alt = cardData.name;
  face.onerror = function () {
    this.src = "./images/tarot/back.png";
    this.alt = "Image not found";
  };
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

  deckEl.className = layoutKey !== "default" ? layoutKey : "";

  // Get the actual size of the right panel for sizing
  const rightPanel = document.querySelector(".tarot-right");
  let containerWidth = rightPanel
    ? rightPanel.clientWidth
    : window.innerWidth * 0.6;
  let containerHeight = rightPanel
    ? rightPanel.clientHeight
    : window.innerHeight;

  // For mobile, use window size if right panel is too small
  if (window.innerWidth < 900) {
    containerWidth = window.innerWidth * 0.95;
    containerHeight = window.innerHeight * 0.48;
  }

  const cardSize = calculateCardSize(spread, containerWidth, containerHeight);

  const selectedCards = cardPool.slice(0, spread.numCards);
  deckEl.innerHTML = "";
  spreadDescriptionsDiv.innerHTML = "";

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
    if (pos?.label) {
      // Use area names matching CSS (lowercase, no spaces)
      const area = pos.label.toLowerCase().replace(/[^a-z0-9]/g, "");
      card.setAttribute("data-area", area);
    }
    deckEl.appendChild(card);
  });
}

function showModal(cardData, orientation = "upright") {
  const modal = document.getElementById("cardModal");
  if (!modal) return;
  modal.classList.add("show");
  document.body.classList.add("modal-bg-blur");

  const content = modal.querySelector(".modal-content");
  if (!content) return;
  content.innerHTML = `
    <span class="close-modal" tabindex="0">&times;</span>
    <img src="./images/tarot/${cardData.id}.png" 
         alt="${cardData.name}" 
         style="transform: ${
           orientation === "reversed" ? "rotate(180deg)" : "none"
         };" onerror="this.src='./images/tarot/back.png';this.alt='Image not found';" />
    <h2>${cardData.name} (${orientation})</h2>
    <p>${cardData.description?.[orientation] || cardData.meaning}</p>
  `;

  const close = () => {
    modal.classList.remove("show");
    document.body.classList.remove("modal-bg-blur");
  };

  const closeBtn = content.querySelector(".close-modal");
  if (closeBtn) {
    closeBtn.onclick = close;
    closeBtn.onkeydown = (e) => {
      if (e.key === "Enter" || e.key === " " || e.key === "Escape") {
        close();
      }
    };
  }
  // Remove previous event to avoid stacking
  modal.onclick = null;
  modal.onclick = (e) => {
    if (e.target === modal) close();
  };
  // Allow ESC key to close modal
  document.onkeydown = function (e) {
    if (modal.classList.contains("show") && e.key === "Escape") {
      close();
    }
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

// Optional: Re-render cards on window resize for full responsiveness
window.addEventListener("resize", () => {
  if (spreadSelect.value !== "default" && fullDeck.length > 0) {
    const cardPool = shuffleDeck(fullDeck);
    createCards(cardPool);
  }
});
