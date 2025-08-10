/* ===========================
   Tarot App — Face-down first + Celtic Cross (coords)
   - Select a spread, then Draw
   - Animated deal from pile
   - Cards land face-down; click reveals; second click opens modal
   - Named-area + freeform (coords) layouts
   =========================== */

// ----- DOM
const deckEl = document.getElementById("deck");
const spreadSelect = document.getElementById("spreadSelect");
const spreadDescriptionsDiv = document.getElementById("spreadDescriptions");
const drawBtn = document.getElementById("drawBtn");
const reshuffleBtn = document.getElementById("reshuffleBtn");
const resetBtn = document.getElementById("resetBtn");
const guidesToggle = document.getElementById("guidesToggle");
const dealLayer = document.getElementById("dealLayer");
const deckPile = document.getElementById("deckPile");

if (!deckEl || !spreadSelect || !drawBtn || !dealLayer || !deckPile) {
  throw new Error(
    "Required DOM elements not found. Check your HTML structure."
  );
}

// ----- State
let fullDeck = [];
let dataReady = false;
let dealing = false;

// ----- Utility
const areaName = (label) =>
  (label || "").toLowerCase().replace(/[^a-z0-9]/g, "");

const themesFallback = {
  threeCard: ["#B35CFF", "#1B1622"],
  celticCross: ["#47B5FF", "#0F1722"], // used by your screenshot version too
  crossSpread: ["#FFB23D", "#1A1310"],
  horseshoe: ["#40D17A", "#0E1513"],
  pentagram: ["#FF7052", "#1A1311"],
  eightCards: ["#5DB7FF", "#0F1822"],
  sixCards: ["#FF76CE", "#17121A"],
  loveSpread: ["#FF5570", "#1A1012"],
  diamond7: ["#5DB7FF", "#0F1822"],
  staff9: ["#FFB23D", "#1A1310"],
};

const pickTheme = (key, spread) => {
  const [accent, bgDark] = spread?.theme ||
    themesFallback[key] || ["#8AA0FF", "#111"];
  deckEl.style.setProperty("--accent", accent);
  deckEl.style.setProperty(
    "--bg",
    `linear-gradient(180deg, ${bgDark}, color-mix(in oklab, ${bgDark} 88%, black 12%))`
  );
};

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// ----- Spreads (named-area)
const namedSpreads = {
  // Kept for others; Celtic Cross is replaced below with coords to match your image
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
    rows: 3,
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
    rows: 4,
    positions: {
      1: { label: "Spirit" },
      2: { label: "Air" },
      3: { label: "Water" },
      4: { label: "Fire" },
      5: { label: "Earth" },
    },
  },
  eightCards: {
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

let currentGridOffset = { baseCol: 1, baseRow: 1, cols: 12, rows: 12 };

// ----- Freeform (coords on 12x12)
// Includes your Celtic Cross as pictured (10 cards).
// Labels are #1..#10 by default; tell me your preferred names/order and I’ll swap them.
const freeformSpreads = {
  celticCross: {
    mode: "coords",
    grid: [12, 12],
    numCards: 10,
    positions: [
      { label: "#1", col: 4, row: 2 }, // top-left
      { label: "#2", col: 10, row: 2 }, // top-right (staff top)
      { label: "#3", col: 4, row: 5 }, // mid-left
      { label: "#4", col: 6, row: 5, emphasis: true }, // center
      { label: "#5", col: 8, row: 5 }, // mid-right
      { label: "#6", col: 6, row: 8 }, // bottom-center
      { label: "#7", col: 10, row: 4 }, // right staff 2
      { label: "#8", col: 10, row: 7 }, // right staff 3
      { label: "#9", col: 10, row: 9 }, // right staff 4
      { label: "#10", col: 10, row: 11 }, // right staff 5 (bottom)
    ],
    theme: ["#47B5FF", "#0F1722"],
  },

  // Examples from earlier (keep or remove)
  diamond7: {
    mode: "coords",
    grid: [12, 12],
    numCards: 7,
    positions: [
      { label: "Top", col: 6, row: 2 },
      { label: "Left-1", col: 4, row: 4 },
      { label: "Right-1", col: 8, row: 4 },
      { label: "Center", col: 6, row: 6, emphasis: true },
      { label: "Left-2", col: 4, row: 8 },
      { label: "Right-2", col: 8, row: 8 },
      { label: "Bottom", col: 6, row: 10 },
    ],
    theme: ["#5DB7FF", "#0F1822"],
  },

  staff9: {
    mode: "coords",
    grid: [12, 12],
    numCards: 9,
    positions: [
      { label: "Top-L", col: 4, row: 2 },
      { label: "Top-R", col: 9, row: 2 },
      { label: "Mid-L", col: 3, row: 5 },
      { label: "Center", col: 6, row: 5, emphasis: true },
      { label: "Mid-R", col: 9, row: 5 },
      { label: "Bottom-C", col: 6, row: 8 },
      { label: "Staff-Top", col: 10, row: 4 },
      { label: "Staff-Mid", col: 10, row: 7 },
      { label: "Staff-Bot", col: 10, row: 10 },
    ],
    theme: ["#FFB23D", "#1A1310"],
  },
};

// Combined registry
const spreadLayouts = { ...namedSpreads, ...freeformSpreads };
const isCoords = (spread) => spread.mode === "coords";

// ----- Sizing (gap-aware, coords-aware)
function calculateCardSize(spread, containerWidth, containerHeight) {
  const box = isCoords(spread)
    ? getUsedGrid(spread)
    : { cols: spread.columns, rows: spread.rows };

  const cols = box.cols,
    rows = box.rows;

  const styles = window.getComputedStyle(deckEl);
  const gapX = parseFloat(styles.columnGap || styles.gap || "12") || 12;
  const gapY = parseFloat(styles.rowGap || styles.gap || String(gapX)) || gapX;

  const horizontalPadding = 0.02 * containerWidth;
  const verticalPadding = Math.min(
    0.02 * containerHeight,
    window.innerHeight * 0.05
  );

  const availableWidth = containerWidth - horizontalPadding;
  const availableHeight = Math.min(
    containerHeight - verticalPadding,
    window.innerHeight * 0.98
  );

  const totalGapWidth = gapX * (cols - 1);
  const totalGapHeight = gapY * (rows - 1);

  const maxWidth = (availableWidth - totalGapWidth) / cols;
  const maxHeight = (availableHeight - totalGapHeight) / rows;

  const aspect = 343 / 480;
  let width = maxWidth;
  let height = width / aspect;
  if (height > maxHeight) {
    height = maxHeight;
    width = height * aspect;
  }

  // clamp but allow bigger than before since we now fit to bbox
  width = Math.max(48, Math.min(width, 320));
  height = Math.max(68, Math.min(height, 448));

  return { width, height };
}

// ----- Build card element (FACE-DOWN FIRST)
function createCardElement(cardData, orientation, label, size) {
  const card = document.createElement("div");
  card.className = "card flipped"; // start face-down
  card.tabIndex = 0;
  card.style.width = `${size.width}px`;
  card.style.height = `${size.height}px`;
  card.setAttribute("data-label", label || cardData.name);

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

  const cardDescription =
    cardData.description?.[orientation] || cardData.meaning;
  face.style.transform = orientation === "reversed" ? "rotate(180deg)" : "none";
  if (orientation === "reversed") card.classList.add("is-reversed");

  // CLICK: first click reveals; later clicks open modal
  card.addEventListener("click", () => {
    if (card.classList.contains("flipped")) {
      card.classList.remove("flipped"); // reveal the face
      setTimeout(
        () =>
          addCardDescription(
            { ...cardData, description: { [orientation]: cardDescription } },
            orientation,
            label
          ),
        600
      );
    } else {
      showModal(
        { ...cardData, description: { [orientation]: cardDescription } },
        orientation
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

// Track current normalization so card placement can mirror the markers

/** Compute the tightest bounding box of a coords spread (min/max with spans). */
function getUsedGrid(spread) {
  if (!isCoords(spread)) {
    return { baseCol: 1, baseRow: 1, cols: spread.columns, rows: spread.rows };
  }
  let minC = Infinity,
    maxC = -Infinity,
    minR = Infinity,
    maxR = -Infinity;
  for (const p of spread.positions) {
    const c1 = p.col,
      c2 = p.col + (p.colSpan || 1) - 1;
    const r1 = p.row,
      r2 = p.row + (p.rowSpan || 1) - 1;
    if (c1 < minC) minC = c1;
    if (c2 > maxC) maxC = c2;
    if (r1 < minR) minR = r1;
    if (r2 > maxR) maxR = r2;
  }
  return {
    baseCol: minC,
    baseRow: minR,
    cols: maxC - minC + 1,
    rows: maxR - minR + 1,
  };
}

// ----- Guides / Slot markers
function clearMarkers() {
  deckEl.querySelectorAll(".slot-marker").forEach((n) => n.remove());
}

function createSlotMarkers(spread) {
  clearMarkers();
  if (isCoords(spread)) {
    // normalize to the used bounding box so cards get bigger
    const box = getUsedGrid(spread);
    currentGridOffset = box;

    deckEl.classList.add("freegrid");
    deckEl.style.gridTemplateColumns = `repeat(${box.cols}, 1fr)`;
    deckEl.style.gridTemplateRows = `repeat(${box.rows}, minmax(0, 1fr))`;

    spread.positions.forEach((p, idx) => {
      const m = document.createElement("div");
      m.className = "slot-marker";
      m.dataset.idx = String(idx);
      m.dataset.emphasis = !!p.emphasis;

      const col = p.col - box.baseCol + 1;
      const row = p.row - box.baseRow + 1;
      const colSpan = p.colSpan || 1;
      const rowSpan = p.rowSpan || 1;

      m.style.gridColumn = `${col} / span ${colSpan}`;
      m.style.gridRow = `${row} / span ${rowSpan}`;
      deckEl.appendChild(m);
    });
  } else {
    deckEl.classList.remove("freegrid");
    deckEl.style.gridTemplateColumns = "";
    deckEl.style.gridTemplateRows = "";
    Object.values(spread.positions).forEach((p) => {
      const m = document.createElement("div");
      m.className = "slot-marker";
      m.style.gridArea = areaName(p.label);
      deckEl.appendChild(m);
    });
  }
}

// ----- Animation
function animateDeal(flying, fromCenter, toCenter, i) {
  const dx = toCenter.x - fromCenter.x;
  const dy = toCenter.y - fromCenter.y;
  const rot = Math.random() * 10 - 5;
  const pop = flying.animate(
    [
      {
        transform: `translate3d(0px,0px,0) scale(.92) rotate(${rot}deg)`,
        opacity: 0.0,
        offset: 0,
      },
      {
        transform: `translate3d(0px,-14px,0) scale(1) rotate(${rot}deg)`,
        opacity: 1,
        offset: 0.25,
      },
      {
        transform: `translate3d(${dx * 0.25}px, ${
          dy * 0.25
        }px, 0) rotate(${rot}deg)`,
        opacity: 1,
        offset: 0.45,
      },
      {
        transform: `translate3d(${dx}px, ${dy}px, 0) rotate(${rot}deg)`,
        opacity: 1,
        offset: 1,
      },
    ],
    {
      duration: 700,
      delay: i * 120,
      easing: "cubic-bezier(.16,1,.3,1)",
      fill: "forwards",
    }
  );
  return new Promise((res) =>
    pop.addEventListener("finish", res, { once: true })
  );
}

function placeCardInGrid(
  cardData,
  orientation,
  label,
  areaOrCoords,
  cardSize,
  spread
) {
  const card = createCardElement(cardData, orientation, label, cardSize);
  if (isCoords(spread)) {
    const box = currentGridOffset;
    const col = areaOrCoords.col - box.baseCol + 1;
    const row = areaOrCoords.row - box.baseRow + 1;
    const colSpan = areaOrCoords.colSpan || 1;
    const rowSpan = areaOrCoords.rowSpan || 1;
    card.style.gridColumn = `${col} / span ${colSpan}`;
    card.style.gridRow = `${row} / span ${rowSpan}`;
  } else {
    const area = areaOrCoords; // named area string
    card.style.gridArea = area;
    card.setAttribute("data-area", area);
  }
  deckEl.appendChild(card);
}

// ----- Deal orchestration
async function dealCardsAnimated(cardPool) {
  if (dealing) return;
  dealing = true;
  document.body.classList.add("dealing");
  drawBtn.disabled = true;
  reshuffleBtn.disabled = true;

  const layoutKey = spreadSelect.value;
  const spread = spreadLayouts[layoutKey];
  if (!spread) {
    dealing = false;
    return;
  }

  // Theme + grid class
  deckEl.className = layoutKey;
  pickTheme(layoutKey, spread);

  // Size
  const rightPanel = document.querySelector(".tarot-right");
  let containerWidth = rightPanel
    ? rightPanel.clientWidth
    : window.innerWidth * 0.6;
  let containerHeight = rightPanel
    ? rightPanel.clientHeight
    : window.innerHeight;
  if (window.innerWidth < 900) {
    containerWidth = window.innerWidth * 0.95;
    containerHeight = window.innerHeight * 0.48;
  }
  const cardSize = calculateCardSize(spread, containerWidth, containerHeight);

  // Prepare board
  deckEl.innerHTML = "";
  spreadDescriptionsDiv.innerHTML = "";
  createSlotMarkers(spread);
  deckEl.classList.toggle("show-guides", guidesToggle.checked);

  // Precompute geometry
  const dealRect = dealLayer.getBoundingClientRect();
  const pileRect = deckPile.getBoundingClientRect();
  const pileCenter = {
    x: pileRect.left + pileRect.width / 2,
    y: pileRect.top + pileRect.height / 2,
  };

  // Target centers
  let targetCenters = [];
  if (isCoords(spread)) {
    const markers = [...deckEl.querySelectorAll(".slot-marker")].sort(
      (a, b) => +a.dataset.idx - +b.dataset.idx
    );
    targetCenters = markers.map((m) => {
      const r = m.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    });
  } else {
    const markers = [...deckEl.querySelectorAll(".slot-marker")];
    const labels = Object.values(spread.positions).map((p) =>
      areaName(p.label)
    );
    targetCenters = labels.map((area) => {
      const m = markers.find((mk) => mk.style.gridArea === area);
      if (!m) return null;
      const r = m.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    });
  }

  const selectedCards = cardPool.slice(0, spread.numCards);
  const promises = selectedCards.map((cardData, i) => {
    const pos = isCoords(spread)
      ? spread.positions[i]
      : spread.positions[i + 1];
    const label = pos?.label || cardData.name;

    const target = targetCenters[i];
    if (!target) return Promise.resolve();

    // Flying card (back)
    const flying = document.createElement("div");
    flying.className = "flying-card";
    flying.style.width = `${cardSize.width}px`;
    flying.style.height = `${cardSize.height}px`;
    flying.style.left = `${
      pileCenter.x - dealRect.left - cardSize.width / 2
    }px`;
    flying.style.top = `${pileCenter.y - dealRect.top - cardSize.height / 2}px`;
    flying.innerHTML = `<img src="./images/tarot/back.png" width="${cardSize.width}" height="${cardSize.height}" alt="" />`;
    dealLayer.appendChild(flying);

    // Animate -> then place interactive card (which is face-down initially)
    return animateDeal(flying, pileCenter, target, i).then(() => {
      flying.remove();
      const orientation = Math.random() > 0.5 ? "upright" : "reversed";
      if (isCoords(spread)) {
        placeCardInGrid(cardData, orientation, label, pos, cardSize, spread);
      } else {
        const area = areaName(label);
        placeCardInGrid(cardData, orientation, label, area, cardSize, spread);
      }
    });
  });

  await Promise.all(promises);

  reshuffleBtn.disabled = false;
  resetBtn.disabled = false;
  dealing = false;
  document.body.classList.remove("dealing");
}

// ----- Events

// Select a spread by clicking an icon
document.querySelectorAll(".icon-option").forEach((option) => {
  option.addEventListener("click", () => {
    document
      .querySelectorAll(".icon-option")
      .forEach((opt) => opt.classList.remove("selected"));
    option.classList.add("selected");
    spreadSelect.value = option.dataset.value || "";
    drawBtn.disabled = !spreadSelect.value;
  });
});

// Draw button (deal animation)
drawBtn.addEventListener("click", () => {
  if (!dataReady || !spreadSelect.value) return;
  const pool = shuffle(fullDeck);
  dealCardsAnimated(pool);
});

// Reshuffle (same animation, same selected spread)
reshuffleBtn.addEventListener("click", () => {
  if (!dataReady || !spreadSelect.value) return;
  const pool = shuffle(fullDeck);
  dealCardsAnimated(pool);
});

// Reset board
resetBtn.addEventListener("click", () => {
  deckEl.innerHTML = "";
  spreadDescriptionsDiv.innerHTML = "";
  clearMarkers();
  reshuffleBtn.disabled = true;
  resetBtn.disabled = true;
});

// Guides toggle
guidesToggle.addEventListener("change", () => {
  deckEl.classList.toggle("show-guides", guidesToggle.checked);
});

// Load JSON (no auto-deal)
fetch("tarot-cards.json")
  .then((res) => res.json())
  .then((data) => {
    fullDeck = Array.isArray(data) ? data : data.cards || [];
    dataReady = true;
  })
  .catch((err) => console.error("Error loading JSON:", err));

// ----- Modal (with blur)
function showModal(cardData, orientation = "upright") {
  const modal = document.getElementById("cardModal");
  if (!modal) return;
  modal.classList.add("show");
  document.body.classList.add("modal-bg-blur");

  const content = modal.querySelector(".modal-content");
  if (!content) return;
  content.innerHTML = `
    <span class="close-modal" tabindex="0" aria-label="Close">&times;</span>
    <img src="./images/tarot/${cardData.id}.png" 
         alt="${cardData.name}" 
         style="max-width: 100%; height:auto; transform: ${
           orientation === "reversed" ? "rotate(180deg)" : "none"
         };"
         onerror="this.src='./images/tarot/back.png';this.alt='Image not found';" />
    <h2 style="margin:12px 0 6px">${cardData.name} (${orientation})</h2>
    <p>${cardData.description?.[orientation] || cardData.meaning}</p>
  `;

  const close = () => {
    modal.classList.remove("show");
    document.body.classList.remove("modal-bg-blur");
    window.removeEventListener("keydown", onKey);
  };
  const onKey = (e) => {
    if (e.key === "Escape") close();
  };

  const closeBtn = content.querySelector(".close-modal");
  if (closeBtn) {
    closeBtn.onclick = close;
    closeBtn.onkeydown = (e) => {
      if (e.key === "Enter" || e.key === " ") close();
    };
  }

  modal.onclick = (e) => {
    if (e.target === modal) close();
  };
  window.addEventListener("keydown", onKey);
}
