let tarotDeck = [];

// DOM
const cardsContainer = document.getElementById("cards-container");
const dealBtn = document.getElementById("deal-btn");
const spreadSelect = document.getElementById("spread-select");
const modal = document.getElementById("card-modal");
const modalTitle = document.getElementById("modal-title");
const modalDesc = document.getElementById("modal-desc");
const modalImg = document.getElementById("modal-img");
const modalClose = document.getElementById("modal-close");
const searchInput = document.getElementById("search-input");
const searchResults = document.getElementById("search-results");

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

// --- Events ---
dealBtn.addEventListener("click", () => dealSpread(spreadSelect.value));

modalClose.addEventListener("click", () => modal.classList.add("hidden"));
modal.addEventListener("click", (e) => {
  if (e.target === modal) modal.classList.add("hidden");
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") modal.classList.add("hidden");
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
  const shuffled = [...tarotDeck]
    .sort(() => Math.random() - 0.5)
    .slice(0, count);

  cardsContainer.classList.add(type === "3" ? "spread-3" : "spread-celtic");

  for (const card of shuffled) {
    const cardEl = document.createElement("div");
    cardEl.className = "card";
    cardEl.title = "Click to flip, click again for details";

    const back = document.createElement("div");
    back.className = "face back";

    const front = document.createElement("div");
    front.className = "face front";

    // 1:1 mapping here — MUST exist at ./images/tarot/{id}.png
    const imgUrl = `./images/tarot/${card.id}.png`;
    front.style.backgroundImage = `url('${imgUrl}')`;

    cardEl.append(back, front);
    cardsContainer.append(cardEl);

    // First click: flip + set reversed (random)
    // Second click (when flipped): open modal with upright/reversed meaning
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
        // Optional: preflight check to surface missing images in console
        preload(imgUrl).catch(() => {
          console.warn(
            `[tarot] Missing image for id ${card.id}. Expected: ${imgUrl}`
          );
          // Optionally, show a fallback image or style
          front.style.backgroundImage = "url('./images/tarot/back0.png')";
        });
      } else {
        const reversed = cardEl.dataset.reversed === "true";
        showCardModal(card, reversed);
      }
    });
  }
}

function showCardModal(card, reversed) {
  modalTitle.textContent = `${card.name}${reversed ? " (Reversed)" : ""}`;
  // Set card image as background on the image-only div
  const modalBg = document.querySelector(".card-modal-image-bg");
  const modalImgOnly = document.querySelector(".card-modal-image-only");
  if (modalImgOnly) {
    let imgUrl = `./images/tarot/${card.id}.png`;
    modalImgOnly.style.backgroundImage = `url('${imgUrl}')`;
    modalImgOnly.style.backgroundSize = "cover";
    modalImgOnly.style.backgroundPosition = "center top";
    modalImgOnly.style.position = "absolute";
    modalImgOnly.style.inset = "0";
    modalImgOnly.style.zIndex = "0";
    modalImgOnly.style.borderRadius = "22px";
    modalImgOnly.style.transition = "transform 0.4s";
    if (reversed) {
      modalImgOnly.style.transform = "rotate(180deg)";
    } else {
      modalImgOnly.style.transform = "";
    }
    // fallback for missing image
    const testImg = new window.Image();
    testImg.onerror = function () {
      modalImgOnly.style.backgroundImage = "url('./images/tarot/back0.png')";
    };
    testImg.src = imgUrl;
  }
  // Set description
  const uprightText =
    card?.description?.upright || card?.upright || card?.meaning_up || "";
  const reversedText =
    card?.description?.reversed || card?.reversed || card?.meaning_rev || "";
  modalDesc.textContent = reversed
    ? reversedText || "No reversed meaning."
    : uprightText || "No upright meaning.";
  modal.classList.remove("hidden");
}

// Small helper: preloads image and rejects if not found
function preload(url) {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res();
    img.onerror = () => rej(new Error("Image not found"));
    img.src = url;
  });
}
