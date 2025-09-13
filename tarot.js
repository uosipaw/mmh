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
  // focus the close button for keyboard users
  // collect focusable elements inside modal for trapping
  _modalFocusable = Array.from(
    modal.querySelectorAll(
      'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
  );
  if (modalClose && _modalFocusable.indexOf(modalClose) === -1)
    _modalFocusable.unshift(modalClose);
  if (_modalFocusable.length) {
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
if (modal) modal.addEventListener("click", (e) => {
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

// Search (by name)
searchInput.addEventListener("input", () => {
  const q = searchInput.value.trim().toLowerCase();
  if (!q) {
    searchResults.style.display = "none";
    searchResults.innerHTML = "";
    return;
  }
  const matches = tarotDeck.filter((c) =>
    (c.name || "").toLowerCase().includes(q)
  );
  searchResults.innerHTML = matches
    .map(
      (c, i) =>
        `<div role="option" aria-selected="${i === 0}" data-name="${c.name}">${
          c.name
        }</div>`
    )
    .join("");
  searchResults.style.display = matches.length ? "block" : "none";
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
        // image already preloaded; fallback remains the back image if missing
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

  // Set keywords
  if (modalKeywords) {
    if (Array.isArray(card.keywords) && card.keywords.length) {
      modalKeywords.textContent = card.keywords.join(", ");
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
    if (reversed) {
      modalImgOnly.style.transform = "rotate(180deg)";
    } else {
      modalImgOnly.style.transform = "none";
    }
    // fallback for missing image
    const testImg = new window.Image();
    testImg.onerror = function () {
      modalImgOnly.style.backgroundImage = "url('./images/tarot/back0.png')";
    };
    testImg.src = imgUrl;
  }
  // aria-describedby is set at init to include keywords/description

  const uprightText =
    card?.description?.upright || card?.upright || card?.meaning_up || "";
  const reversedText =
    card?.description?.reversed || card?.reversed || card?.meaning_rev || "";
  if (modalDesc) {
    modalDesc.textContent = reversed
      ? reversedText || "No reversed meaning."
      : uprightText || "No upright meaning.";
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
