let drawnCards = [];
const deck = document.getElementById("deck");
const spreadArea = document.getElementById("spreadArea");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");
const popupImg = document.getElementById("popup-img");
const popupText = document.getElementById("popup-text");
const closePopup = document.getElementById("close-popup");

const tarotPositions = ["Past", "Present", "Future", "Advice", "Outcome"];

let tarotData = {};

fetch("tarot-cards.json")
  .then((response) => response.json())
  .then((data) => (tarotData = data));

deck.addEventListener("click", drawCard);

function drawCard() {
  if (drawnCards.length >= tarotPositions.length) return;

  let cardNames = Object.keys(tarotData);
  let randomCard = cardNames[Math.floor(Math.random() * cardNames.length)];

  let isReversed = Math.random() > 0.5;
  let position = tarotPositions[drawnCards.length];
  let imgSrc = `images/${randomCard}.png`;

  let cardElement = document.createElement("img");
  cardElement.src = imgSrc;
  cardElement.classList.add("card");
  if (isReversed) cardElement.classList.add("reversed");

  spreadArea.appendChild(cardElement);
  drawnCards.push({ name: randomCard, position, isReversed });

  updateSidebar();

  cardElement.addEventListener("click", () =>
    showPopup(randomCard, isReversed)
  );
}

function updateSidebar() {
  sidebar.innerHTML = "<h3>Drawn Cards</h3>";
  drawnCards.forEach((card) => {
    let desc = tarotData[card.name];
    let meaning = card.isReversed ? desc.reversed : desc.upright;
    let cardInfo = document.createElement("p");
    cardInfo.innerHTML = `<strong>${card.position}:</strong> ${card.name} - ${meaning}`;
    sidebar.appendChild(cardInfo);
  });
}

function showPopup(cardName, isReversed) {
  let desc = tarotData[cardName];
  popupImg.src = `images/${cardName}.png`;
  popupImg.classList.toggle("reversed", isReversed);
  popupText.innerText = isReversed ? desc.reversed : desc.upright;

  overlay.style.display = "flex";
}

closePopup.addEventListener("click", () => {
  overlay.style.display = "none";
});
