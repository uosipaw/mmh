let tarotDeck = [];

// DOM
const cardsContainer = document.getElementById("cards-container");
const dealBtn = document.getElementById("deal-btn");
const spreadSelect = document.getElementById("spread-select");
const modal = document.getElementById("card-modal");
const modalTitle = document.getElementById("modal-title");
const modalDesc = document.getElementById("modal-desc");
let modalClose = document.getElementById("modal-close");
const searchInput = document.getElementById("search-input");
const searchResults = document.getElementById("search-results");

// Cache modal DOM elements for performance
const modalReversed = document.getElementById("modal-reversed");
const modalKeywords = document.getElementById("modal-keywords");
const modalImgOnly = document.querySelector(".card-modal-image-only");

// Disable deal until data loads
dealBtn.disabled = true;

/**
 * Convert HTML-ish strings (e.g., "<br>") into plain text safely.
 * Keeps line breaks, strips other tags.
 */
function htmlishToText(raw) {
  return String(raw || "")
    .replace(/\r\n/g, "\n")
    .replace(/<br\s*\/?>/gi, "\n") // keep line breaks
    .replace(/<\/?[^>]+>/g, "") // strip any other tags
    .trim();
}

/**
 * Normalize meaning text so it displays nicely in a <p> via textContent.
 * - Converts <br> to real newlines
 * - Removes markdown headings (## etc.) if present
 * - Converts simple list markers to bullets
 */
function normalizeMeaning(raw) {
  return htmlishToText(raw)
    .replace(/^\s*#{1,6}\s*/gm, "") // remove markdown headings if present
    .replace(/^\s*[-*]\s+/gm, "• ") // list bullets
    .replace(/\n{3,}/g, "\n\n") // collapse huge gaps
    .trim();
}

/**
 * Optional: extract keywords from the first line of upright description
 * if it looks like: "a - b - c<br>..."
 */
function extractKeywordsFromDescription(uprightRaw) {
  const text = String(uprightRaw || "");
  const [beforeBreak] = text.split(/<br\s*\/?>/i);
  const parts = beforeBreak
    .split(/\s*-\s*/)
    .map((s) => s.trim())
    .filter(Boolean);

  // Heuristic: treat as keywords only if it looks like a chain
  return parts.length >= 3 ? parts : [];
}

// --- Load deck JSON (same folder as this HTML) ---
fetch("./tarot-cards.json")
  .then((r) => {
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
  })
  .then((data) => {
    if (!Array.isArray(data) || !data.length) throw new Error("Empty deck");
    tarotDeck = data;
    dealBtn.disabled = false;
  })
  .catch((err) => {
    console.error("Failed to load tarot-cards.json:", err);
    alert(
      "Could not load tarot data. Make sure tarot-cards.json is in the same folder and you're using a local server."
    );
  });

// Ensure improved accessibility semantics on the dialog
if (modal) {
  const existing = modal.getAttribute("aria-describedby") || "";
  const targetIds = "modal-desc modal-keywords";
  if (!existing.includes("modal-desc")) {
    modal.setAttribute(
      "aria-describedby",
      existing ? `${existing} ${targetIds}`.trim() : targetIds
    );
  }
}

// --- Events ---
dealBtn.addEventListener("click", () => dealSpread(spreadSelect.value));

// Modal helpers: open/close with focus management and focus trap
let lastFocusedElement = null;
let _modalFocusable = [];

function openModal() {
  if (!modal) return;
  lastFocusedElement = document.activeElement;
  modal.classList.remove("hidden");
  document.body.classList.add("modal-open");

  // collect focusable elements inside modal for trapping
  _modalFocusable = Array.from(
    modal.querySelectorAll(
      'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
  );
  if (modalClose && _modalFocusable.indexOf(modalClose) === -1)
    _modalFocusable.unshift(modalClose);

  // Prefer focusing the title if it's focusable; otherwise close button
  if (modalTitle && modalTitle.tabIndex >= 0) {
    modalTitle.focus();
  } else if (_modalFocusable.length) {
    _modalFocusable[0].focus();
  } else if (modalClose) {
    modalClose.focus();
  }
}

function closeModal() {
  if (!modal) return;
  modal.classList.add("hidden");
  document.body.classList.remove("modal-open");

  // remove any image rotation so modal content is clean next open
  if (modalImgOnly) {
    modalImgOnly.style.transform = "none";
  }
  if (lastFocusedElement) lastFocusedElement.focus();
}

// Close interactions
if (modalClose) modalClose.addEventListener("click", closeModal);
if (modal)
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

// Basic focus trap: keep focus inside modal when open
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeModal();
    return;
  }
  if (!modal || modal.classList.contains("hidden")) return;

  if (e.key === "Tab") {
    const focusable =
      _modalFocusable && _modalFocusable.length
        ? _modalFocusable
        : modal.querySelectorAll(
            'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])'
          );

    if (!focusable || !focusable.length) {
      e.preventDefault();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }
});

// Search (by name) — safer rendering (no innerHTML)
function renderSearchResults(matches) {
  searchResults.textContent = "";
  matches.forEach((c, i) => {
    const row = document.createElement("div");
    row.setAttribute("role", "option");
    row.setAttribute("aria-selected", String(i === 0));
    row.dataset.name = c.name;
    row.textContent = c.name || "(Unnamed card)";
    searchResults.appendChild(row);
  });
  searchResults.style.display = matches.length ? "block" : "none";
}

searchInput.addEventListener("input", () => {
  const q = searchInput.value.trim().toLowerCase();
  if (!q) {
    searchResults.style.display = "none";
    searchResults.textContent = "";
    return;
  }
  const matches = tarotDeck.filter((c) =>
    (c.name || "").toLowerCase().includes(q)
  );
  renderSearchResults(matches);
});

searchResults.addEventListener("click", (e) => {
  const el = e.target.closest("[data-name]");
  if (!el) return;
  const card = tarotDeck.find((c) => c.name === el.dataset.name);
  if (card) showCardModal(card, false);
  searchResults.style.display = "none";
  searchInput.value = "";
});

// --- Core ---
function dealSpread(type) {
  if (!tarotDeck.length) return;

  cardsContainer.className = "";
  cardsContainer.innerHTML = "";

  const count = type === "3" ? 3 : 10;
  const shuffled = [...tarotDeck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const selected = shuffled.slice(0, count);

  cardsContainer.classList.add(type === "3" ? "spread-3" : "spread-celtic");

  selected.forEach((card) => {
    const cardEl = document.createElement("div");
    cardEl.className = "card";
    cardEl.title = "Click to flip, click again for details";

    const back = document.createElement("div");
    back.className = "face back";

    const front = document.createElement("div");
    front.className = "face front";

    const imgUrl = `./images/tarot/${card.id}.png`;

    front.style.backgroundImage = "url('./images/tarot/back0.png')";
    preload(imgUrl)
      .then(() => {
        front.style.backgroundImage = `url('${imgUrl}')`;
      })
      .catch(() => {
        console.warn(
          `[tarot] Missing image for id ${card.id}. Expected: ${imgUrl}`
        );
      });

    cardEl.append(back, front);
    cardsContainer.append(cardEl);

    cardEl.addEventListener("click", () => {
      if (!cardEl.classList.contains("flipped")) {
        cardEl.classList.add("flipped");
        const isReversed = Math.random() < 0.5;
        cardEl.dataset.reversed = isReversed ? "true" : "false";
        if (isReversed) {
          front.classList.add("reversed");
        } else {
          front.classList.remove("reversed");
        }
      } else {
        const reversed = cardEl.dataset.reversed === "true";
        showCardModal(card, reversed);
      }
    });
  });
}

function showCardModal(card, reversed) {
  if (modalTitle) modalTitle.textContent = card.name || "";

  // Set reversed label
  if (modalReversed) {
    if (reversed) {
      modalReversed.textContent = "(Reversed)";
      modalReversed.style.display = "block";
    } else {
      modalReversed.textContent = "";
      modalReversed.style.display = "none";
    }
  }

  // Set keywords (prefer explicit keywords; otherwise infer from upright description)
  let kws = Array.isArray(card.keywords) ? card.keywords : [];
  if (!kws.length && card?.description?.upright) {
    kws = extractKeywordsFromDescription(card.description.upright);
  }

  if (modalKeywords) {
    if (kws.length) {
      modalKeywords.textContent = kws.join(", ");
      modalKeywords.style.display = "block";
    } else {
      modalKeywords.textContent = "";
      modalKeywords.style.display = "none";
    }
  }

  // Set card image as background on the image-only div
  if (modalImgOnly) {
    const imgUrl = `./images/tarot/${card.id}.png`;
    modalImgOnly.style.backgroundImage = `url('${imgUrl}')`;
    modalImgOnly.style.transform = reversed ? "rotate(180deg)" : "none";

    // fallback for missing image
    const testImg = new window.Image();
    testImg.onerror = function () {
      modalImgOnly.style.backgroundImage = "url('./images/tarot/back0.png')";
    };
    testImg.src = imgUrl;
  }

  // Meanings: upright/reversed; fallback to card.meaning for upright if needed
  const uprightRaw =
    card?.description?.upright ||
    card?.upright ||
    card?.meaning_up ||
    card?.meaning ||
    "";

  const reversedRaw =
    card?.description?.reversed || card?.reversed || card?.meaning_rev || "";

  const chosenRaw = reversed ? reversedRaw : uprightRaw;
  const cleaned = normalizeMeaning(chosenRaw);

  if (modalDesc) {
    modalDesc.textContent =
      cleaned || (reversed ? "No reversed meaning." : "No upright meaning.");
  }

  // open modal via centralized helper so focus is managed
  openModal();
}

function preload(url) {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res();
    img.onerror = () => rej(new Error("Image not found"));
    img.src = url;
  });
}
