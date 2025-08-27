let tarotDeck = [];

const cardsContainer = document.getElementById("cards-container");
const dealBtn = document.getElementById("deal-btn");
const spreadSelect = document.getElementById("spread-select");
const modal = document.getElementById("card-modal");
const modalTitle = document.getElementById("modal-title");
const modalDesc = document.getElementById("modal-desc");
const modalClose = document.getElementById("modal-close");
const searchInput = document.getElementById("search-input");
const searchResults = document.getElementById("search-results");

// Prevent double-binding
let dealBtnHandler = null;

// Disable deal button until deck is loaded
dealBtn.disabled = true;

// Use RELATIVE path; run from a local server for fetch to work
fetch("./tarot-cards.json")
  .then((res) => {
    if (!res.ok) throw new Error("Failed to fetch tarot-cards.json");
    return res.json();
  })
  .then((data) => {
    if (!Array.isArray(data) || !data.length) {
      alert("Tarot deck data is empty or invalid.");
      return;
    }
    tarotDeck = data;
    dealBtn.disabled = false;

    if (dealBtnHandler) dealBtn.removeEventListener("click", dealBtnHandler);
    dealBtnHandler = () => {
      if (!tarotDeck.length) {
        alert("Tarot deck not loaded yet.");
        return;
      }
      dealSpread(spreadSelect.value);
    };
    dealBtn.addEventListener("click", dealBtnHandler);
  })
  .catch((err) => {
    dealBtn.disabled = true;
    alert("Could not load tarot data: " + err.message);
    console.error("Could not load tarot data:", err);
  });

// Modal close interactions
modalClose.addEventListener("click", () => modal.classList.add("hidden"));
modal.addEventListener("click", (e) => {
  if (e.target === modal) modal.classList.add("hidden");
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") modal.classList.add("hidden");
});

// Search
searchInput.addEventListener("input", () => {
  const term = searchInput.value.trim().toLowerCase();
  if (!term) {
    searchResults.style.display = "none";
    searchResults.innerHTML = "";
    return;
  }
  const matches = tarotDeck.filter((c) => c.name.toLowerCase().includes(term));
  searchResults.innerHTML = matches
    .map(
      (c, i) =>
        `<div role="option" aria-selected="${
          i === 0 ? "true" : "false"
        }" data-name="${c.name}">${c.name}</div>`
    )
    .join("");
  searchResults.style.display = matches.length ? "block" : "none";
});

searchResults.addEventListener("click", (e) => {
  const target = e.target.closest("[data-name]");
  if (!target) return;
  const cardName = target.dataset.name;
  const card = tarotDeck.find((c) => c.name === cardName);
  if (card) showCardModal(card, false); // upright by default
  searchResults.style.display = "none";
  searchInput.value = "";
});

// Deal & render
function dealSpread(type) {
  if (!Array.isArray(tarotDeck) || tarotDeck.length === 0) {
    alert("Tarot deck is empty. Please reload the page.");
    return;
  }
  cardsContainer.innerHTML = "";
  cardsContainer.className = ""; // clear previous layout

  const count = type === "3" ? 3 : type === "celtic" ? 10 : 3;
  const shuffled = [...tarotDeck]
    .sort(() => Math.random() - 0.5)
    .slice(0, count);

  cardsContainer.classList.add(type === "3" ? "spread-3" : "spread-celtic");

  shuffled.forEach((card) => {
    const cardEl = document.createElement("div");
    cardEl.className = "card";
    cardEl.dataset.card = card.name;

    const front = document.createElement("div");
    front.className = "front";
    // USE RELATIVE PATH HERE
    front.style.background = `url("./tarot/${card.id}.png") center/cover no-repeat`;

    const back = document.createElement("div");
    back.className = "back";

    cardEl.append(back, front);
    cardsContainer.append(cardEl);

    cardEl.addEventListener("click", () => {
      if (!cardEl.classList.contains("flipped")) {
        cardEl.classList.add("flipped");
        const reversed = Math.random() < 0.5;
        cardEl.dataset.reversed = String(reversed);
      } else {
        showCardModal(card, cardEl.dataset.reversed === "true");
      }
    });
  });
}

function showCardModal(card, reversed) {
  modalTitle.textContent = `${card.name}${reversed ? " (Reversed)" : ""}`;
  modalDesc.textContent = reversed
    ? (card.description && card.description.reversed) || "No reversed meaning."
    : (card.description && card.description.upright) || "No upright meaning.";
  modal.classList.remove("hidden");
}
