window.addEventListener("DOMContentLoaded", () => {
  initTarot();
});

let tarotData = null;

async function initTarot() {
  const tarotJsonPath = "./tarot-cards.json";

  try {
    const response = await fetch(tarotJsonPath);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    tarotData = await response.json();
    console.log("Tarot card data loaded successfully", tarotData);

    initTarotInterface();
  } catch (error) {
    console.error("Error loading tarot card data:", error);
  }
}

function initTarotInterface() {
  const deck = document.getElementById("deck");
  const drawnCards = document.getElementById("drawn-cards");
  const cardFocus = document.getElementById("card-focus");
  const overlay = document.getElementById("overlay");
  const closeButton = document.getElementById("close-button");
  const cardName = document.getElementById("card-name");
  const cardOrientation = document.getElementById("card-orientation");
  const cardText = document.getElementById("card-text");
  const cardImage = document.getElementById("card-image");

  if (
    !deck ||
    !drawnCards ||
    !cardFocus ||
    !overlay ||
    !closeButton ||
    !cardImage
  ) {
    console.error("Required elements not found in the document");
    return;
  }

  const shuffledDeck = tarotData.cards.sort(() => Math.random() - 0.5);
  let currentCardIndex = 0;

  deck.addEventListener("click", () => {
    if (currentCardIndex >= shuffledDeck.length) {
      alert("The deck is empty!");
      return;
    }

    const card = shuffledDeck[currentCardIndex++];
    const isReversed = Math.random() < 0.5;

    const cardDiv = document.createElement("div");
    cardDiv.classList.add("card");
    cardDiv.style.backgroundImage = `url('./images/tarot/${card.id}.png')`;
    if (isReversed) cardDiv.classList.add("reversed");

    cardDiv.addEventListener("click", () => focusCard(card, isReversed));
    drawnCards.appendChild(cardDiv);
  });

  closeButton.addEventListener("click", closeCardFocus);
  overlay.addEventListener("click", closeCardFocus);

  function focusCard(card, isReversed) {
    cardName.textContent = card.name;
    cardOrientation.textContent = isReversed ? "Reversed" : "Upright";
    cardText.textContent =
      card.description[isReversed ? "reversed" : "upright"];

    cardFocus.classList.add("visible");
    overlay.classList.add("visible");
  }

  function closeCardFocus() {
    cardFocus.classList.remove("visible");
    overlay.classList.remove("visible");
  }
}
