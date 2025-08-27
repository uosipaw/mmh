/* ==========================================================
   Tarot App — stable build
   - Fixes duplicate ID issue
   - Proper card flip (back shows first, face on click)
   - Defensive DOM wiring + image path handling
   ========================================================== */

// ---------- DOM
const deckEl = document.getElementById("deck");
const drawBtn = document.getElementById("drawBtn");
const reshuffleBtn = document.getElementById("reshuffleBtn");
const resetBtn = document.getElementById("resetBtn");
const guidesToggle = document.getElementById("guidesToggle");
const spreadSelect = document.getElementById("spreadSelect");

if (!deckEl || !drawBtn || !spreadSelect) {
  console.error("Required elements missing in HTML.");
}

// ---------- Config
const IMG_BASE = "./images/tarot/"; // folder with your card images
const BACK_IMAGE = IMG_BASE + "back.png"; // card-back image
const DATA_URL = "./tarot-cards.json"; // JSON with {id,name,description}

// ---------- State
let fullDeck = [];
let dataReady = false;
let dealing = false;

let currentSpreadKey = "threeCard";
let currentDraw = null; // {cards: [], orientations: [], spreadKey: "..."}

// ---------- Utils
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// ---------- Spreads
const namedSpreads = {
  threeCard: {
    mode: "areas",
    numCards: 3,
    columns: 3,
    rows: 1,
    positions: [{ label: "Past" }, { label: "Present" }, { label: "Future" }],
  },
  horseshoe: {
    mode: "areas",
    numCards: 7,
    columns: 7,
    rows: 3,
    positions: [
      { label: "Past" },
      { label: "Present" },
      { label: "Hidden" },
      { label: "Obstacles" },
      { label: "Environment" },
      { label: "Advice" },
      { label: "Outcome" },
    ],
  },
};

const coordsSpreads = {
  celticCross: {
    mode: "coords",
    grid: [12, 12],
    numCards: 10,
    positions: [
      { label: "#1", col: 4, row: 2 },
      { label: "#2", col: 10, row: 2 },
      { label: "#3", col: 4, row: 5 },
      { label: "#4", col: 6, row: 5, emphasis: true },
      { label: "#5", col: 8, row: 5 },
      { label: "#6", col: 6, row: 8 },
      { label: "#7", col: 10, row: 4 },
      { label: "#8", col: 10, row: 7 },
      { label: "#9", col: 10, row: 9 },
      { label: "#10", col: 10, row: 11 },
    ],
  },
};

const spreads = { ...namedSpreads, ...coordsSpreads };
const isCoords = (s) => s.mode === "coords";

// ---------- Board helpers
let currentGridBox = { baseCol: 1, baseRow: 1, cols: 1, rows: 1 };

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

function setupBoard(spread) {
  // Clear existing cards + markers
  Array.from(deckEl.querySelectorAll(".slot-marker")).forEach((el) =>
    el.remove()
  );
  deckEl.innerHTML = "";

  deckEl.classList.remove("freegrid");
  deckEl.style.gridTemplateColumns = "";
  deckEl.style.gridTemplateRows = "";

  if (isCoords(spread)) {
    const box = getUsedGrid(spread);
    currentGridBox = box;
    deckEl.classList.add("freegrid");
    deckEl.style.gridTemplateColumns = `repeat(${box.cols}, 1fr)`;
    deckEl.style.gridTemplateRows = `repeat(${box.rows}, minmax(0, 1fr))`;
    // optional markers
    spread.positions.forEach((p, idx) => {
      const m = document.createElement("div");
      m.className = "slot-marker";
      m.style.gridColumn = `${p.col - box.baseCol + 1} / span ${
        p.colSpan || 1
      }`;
      m.style.gridRow = `${p.row - box.baseRow + 1} / span ${p.rowSpan || 1}`;
      m.dataset.idx = String(idx);
      deckEl.appendChild(m);
    });
  } else {
    deckEl.style.gridTemplateColumns = `repeat(${spread.columns}, minmax(0, 1fr))`;
    deckEl.style.gridTemplateRows = `repeat(${spread.rows}, minmax(0, 1fr))`;
  }

  deckEl.classList.toggle(
    "show-guides",
    !!(guidesToggle && guidesToggle.checked)
  );
}

function measureContainerRect() {
  const container =
    document.querySelector(".tarot-right") || deckEl.parentElement || deckEl;
  return container.getBoundingClientRect();
}

function calculateCardSize(spread) {
  const rect = measureContainerRect();
  const styles = window.getComputedStyle(deckEl);
  const gap = parseFloat(styles.gap || "14") || 14;

  const box = isCoords(spread)
    ? getUsedGrid(spread)
    : { cols: spread.columns, rows: spread.rows };
  const cols = box.cols,
    rows = box.rows;

  const totalGapW = gap * (cols - 1);
  const totalGapH = gap * (rows - 1);

  const availW = rect.width - totalGapW - 12;
  const availH =
    Math.max(rect.height, window.innerHeight * 0.48) - totalGapH - 12;

  const aspect = 2 / 3; // width / height
  let w = availW / cols;
  let h = w / aspect;
  if (h > availH / rows) {
    h = availH / rows;
    w = h * aspect;
  }
  return { width: clamp(w, 72, 320), height: clamp(h, 108, 480) };
}

// ---------- Cards
function createCardElement(cardData, orientation, label, size) {
  const card = document.createElement("div");
  card.className = "card";
  card.style.width = `${size.width}px`;
  card.style.height = `${size.height}px`;
  card.tabIndex = 0;
  if (orientation === "reversed") card.classList.add("is-reversed");

  const inner = document.createElement("div");
  inner.className = "card-inner";

  const back = document.createElement("div");
  back.className = "card-face card-back";
  const backImg = document.createElement("img");
  backImg.src = BACK_IMAGE;
  backImg.alt = "Back of card";
  back.appendChild(backImg);

  const front = document.createElement("div");
  front.className = "card-face card-front";
  const face = document.createElement("img");
  face.src = `${IMG_BASE}${cardData.id}.png`;
  face.alt = cardData.name || label || "Tarot card";
  face.style.transform = orientation === "reversed" ? "rotate(180deg)" : "none";
  face.onerror = function () {
    this.src = BACK_IMAGE;
    this.alt = "Image not found";
  };
  front.appendChild(face);

  // IMPORTANT: back first, then front — so we actually see the back initially
  inner.appendChild(back);
  inner.appendChild(front);
  card.appendChild(inner);

  // First click flips; second click opens modal with meaning
  card.addEventListener("click", () => {
    if (!card.classList.contains("is-flipped")) {
      card.classList.add("is-flipped");
    } else {
      showModal(cardData, orientation);
    }
  });

  // Gentle deal animation
  card.style.setProperty("--delay", `${Math.floor(Math.random() * 60)}ms`);
  card.classList.add("deal");

  return card;
}

function placeCard(card, spread, pos, index) {
  if (isCoords(spread)) {
    const box = currentGridBox;
    const col = pos.col - box.baseCol + 1;
    const row = pos.row - box.baseRow + 1;
    const colSpan = pos.colSpan || 1;
    const rowSpan = pos.rowSpan || 1;
    card.style.gridColumn = `${col} / span ${colSpan}`;
    card.style.gridRow = `${row} / span ${rowSpan}`;
  }
  deckEl.appendChild(card);
  card.style.setProperty("--delay", `${index * 110}ms`);
  // restart animation
  card.classList.remove("deal");
  void card.offsetWidth;
  card.classList.add("deal");
}

// ---------- Deal orchestration
async function dealCards(pool, keepOrder = false) {
  if (dealing || !dataReady) return;
  dealing = true;
  drawBtn.disabled = true;
  reshuffleBtn.disabled = true;

  const key =
    (spreadSelect && spreadSelect.value) || currentSpreadKey || "threeCard";
  const spread = spreads[key] || spreads.threeCard;

  setupBoard(spread);
  const size = calculateCardSize(spread);
  const take = spread.numCards;

  // choose cards/orientations
  let chosen, orientations;
  if (
    keepOrder &&
    currentDraw &&
    currentDraw.cards.length === take &&
    currentDraw.spreadKey === key
  ) {
    chosen = currentDraw.cards;
    orientations = currentDraw.orientations;
  } else {
    const fresh = shuffle(pool);
    chosen = fresh.slice(0, take);
    orientations = Array.from({ length: take }, () =>
      Math.random() < 0.5 ? "upright" : "reversed"
    );
    currentDraw = { cards: chosen, orientations, spreadKey: key };
  }

  for (let i = 0; i < take; i++) {
    const cardData = chosen[i];
    const pos = spread.positions?.[i] || {};
    const label = pos?.label || cardData.name || `Card ${i + 1}`;
    const orientation = orientations[i];
    const el = createCardElement(cardData, orientation, label, size);
    placeCard(el, spread, pos, i);
  }

  reshuffleBtn.disabled = false;
  resetBtn.disabled = false;
  drawBtn.disabled = false;
  dealing = false;
}

// ---------- Modal
function showModal(cardData, orientation = "upright") {
  let modal = document.getElementById("cardModal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "cardModal";
    modal.className = "modal";
    modal.innerHTML = `<div class="modal-content"></div>`;
    document.body.appendChild(modal);
  }
  const content = modal.querySelector(".modal-content");
  content.innerHTML = `
    <span class="close-modal" tabindex="0" aria-label="Close">&times;</span>
    <img src="${IMG_BASE}${cardData.id}.png"
         alt="${cardData.name || "Card"}"
         style="max-width:100%;height:auto;transform:${
           orientation === "reversed" ? "rotate(180deg)" : "none"
         }"
         onerror="this.src='${BACK_IMAGE}';this.alt='Image not found';" />
    <h2 style="margin:12px 0 6px">${cardData.name || ""} ${
    orientation ? `(${orientation})` : ""
  }</h2>
    <p>${cardData.description?.[orientation] || ""}</p>
  `;
  const close = () => modal.classList.remove("show");
  content.querySelector(".close-modal").addEventListener("click", close);
  document.addEventListener("keydown", (e) => e.key === "Escape" && close(), {
    once: true,
  });
  modal.addEventListener("click", (e) => e.target === modal && close());
  modal.classList.add("show");
}

// ---------- Events
window.addEventListener("resize", () => {
  if (!currentDraw) return;
  // Re-deal same cards to recalibrate size
  dealCards(currentDraw.cards, true);
});

if (guidesToggle) {
  guidesToggle.addEventListener("change", () => {
    deckEl.classList.toggle("show-guides", !!guidesToggle.checked);
  });
}

if (spreadSelect) {
  spreadSelect.addEventListener("change", () => {
    currentSpreadKey = spreadSelect.value || "threeCard";
    // Changing spread invalidates current selection (fresh draw recommended)
    currentDraw = null;
  });
}

drawBtn?.addEventListener("click", () => {
  if (!dataReady) return;
  dealCards(fullDeck, false);
});

reshuffleBtn?.addEventListener("click", () => {
  if (!dataReady || !currentDraw) return;
  // Re-deal same selection/orientation (fresh animation & positions)
  dealCards(fullDeck, true);
});

resetBtn?.addEventListener("click", () => {
  currentDraw = null;
  deckEl.innerHTML = "";
  reshuffleBtn.disabled = true;
  resetBtn.disabled = true;
});

// ---------- Boot
(async function boot() {
  try {
    const res = await fetch(DATA_URL, { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to load ${DATA_URL}`);
    const data = await res.json();
    fullDeck = Array.isArray(data) ? data : [];
    dataReady = fullDeck.length > 0;
    drawBtn.disabled = !dataReady;
  } catch (err) {
    console.error(err);
    drawBtn.disabled = true;
  }
})();
