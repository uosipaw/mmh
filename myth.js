// Update creature list according to myth.json
let CHARACTERS = [];
let LEVELS = {};

// Fetch data from myth.json
fetch("myth.json")
  .then((response) => response.json())
  .then((data) => {
    CHARACTERS = data.creatures;
    LEVELS = data.levels;
    // Initialize the game after data is loaded
    startScreen();
  })
  .catch((error) => {
    console.error("Error loading myth.json:", error);
    // Fallback to start the game even if loading fails
    startScreen();
  });

const getTemplate = (creature, fliped = true, disabled = false) => {
  let flipedClass = fliped ? "fliped" : "";
  let disabledAttr = disabled ? "disabled" : "";
  return `<div class="card-place"><button ${disabledAttr} style="--deg: ${getRandomArbitrary(
    -1.5,
    1.5
  )}deg;" data-code="${creature.code}" class="card ${flipedClass} ${
    creature.code
  }">
        <div class="card__side_back"></div>
        <div class="card__side_front"></div>
</button></div>`;
};

const getTemplateArticle = (creature) => {
  return `<article><button disabled style="--deg: 0deg;" class="card ${creature.code}">
        <div class="card__side_back"></div>
        <div class="card__side_front"></div>
</button><div><h2 style="color: var(--${creature.code}-tcap-color)">${creature.name}</h2><p>${creature.description}</p></div></article>`;
};

const victoryEvent = new Event("victory");

window.addEventListener(
  "victory",
  function (e) {
    let html = ``;

    openPairs.forEach((p) => {
      html += getTemplateArticle(p, true, false);
    });
    html += "</div>";
    victoryBlock.innerHTML = html;
    cardTable.innerHTML = ``;
  },
  false
);

let cardTable = document.querySelector("#cardTable");
let victoryBlock = document.querySelector(".victory");
let statsBlock = document.querySelector("#stats");
let allPairs = 0;
let openPairs = [];
let moves = 0;

function resetStats() {
  allPairs = 0;
  openPairs = [];
  moves = 0;
}

function getCharacterByCode(code) {
  for (let i = 0; i < CHARACTERS.length; i++) {
    const ch = CHARACTERS[i];
    if (ch.code == code) return ch;
  }

  return null;
}

// start()
startScreen();

function startScreen() {
  let html = ``;

  CHARACTERS.forEach((p) => {
    html += getTemplate(p, false, true);
  });
  cardTable.innerHTML = html;
}

let opened = [];

function openCard(card) {
  if (opened.length >= 2) return;

  card.style.setProperty("--deg", `${getRandomArbitrary(-1.5, 1.5)}deg`);
  card.classList.remove("fliped");
  card.disabled = true;
  card.blur();
  opened.push(card);

  if (opened.length == 2) {
    moves++;
    if (opened[0].dataset["code"] == opened[1].dataset["code"]) {
      openPairs.push(getCharacterByCode(opened[0].dataset["code"]));
      opened = [];
    } else {
      setTimeout(() => {
        // console.log("WRONG :(");
        opened[0].classList.add("fliped");
        opened[1].classList.add("fliped");
        opened[0].disabled = false;
        opened[1].disabled = false;
        opened = [];
      }, 1000);
    }

    updateStats();

    if (allPairs == openPairs.length) {
      window.dispatchEvent(victoryEvent);
    }
  }
}

function updateStats() {
  statsBlock.innerText = `Open: ${openPairs.length}/${allPairs} pairs by ${moves} moves`;
}

function init() {
  let cards = document.querySelectorAll(".card");

  cards.forEach((card) => {
    card.addEventListener("click", (e) => {
      openCard(card);
    });
  });
}

function start(e) {
  resetStats();
  victoryBlock.innerHTML = ``;
  e.innerText = "ReStart";

  opened = [];

  let l = document.querySelector('input[name="level"]:checked').value;

  cardTable.className = "";
  cardTable.classList.add("card_table", l);

  let pairs = createArray(LEVELS[l]);
  allPairs = LEVELS[l];
  pairs = shuffle(shuffle(shuffle(pairs)));
  let html = ``;

  pairs.forEach((p) => {
    html += getTemplate(p, true, false);
  });
  cardTable.innerHTML = html;
  init();
}

function createArray(pairCount = 5) {
  if (pairCount > CHARACTERS.length) {
    throw new Error(`Pair count more ${CHARACTERS.length}`);
  }

  let source = [];
  source.push(...CHARACTERS);
  let result = [];

  for (let i = 0; i < pairCount; i++) {
    let randomIndex = Math.floor(Math.random() * source.length);
    let removed = source.splice(randomIndex, 1);
    result.push(removed[0]);
    result.push(removed[0]);
  }

  return result;
}

function shuffle(array) {
  let currentIndex = array.length,
    randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}

/**
 * Returns a random number between min (inclusive) and max (exclusive)
 */
function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

/**
 * Returns a random integer between min (inclusive) and max (inclusive).
 * The value is no lower than min (or the next integer greater than min
 * if min isn't an integer) and no greater than max (or the next integer
 * lower than max if max isn't an integer).
 * Using Math.round() will give you a non-uniform distribution!
 */
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
