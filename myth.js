// Construct CHARACTERS array using the data from myth.json (manually, for static use)
const CHARACTERS = [
  {
    name: "Leviathan",
    code: "leviathan",
    image: "/mythcards/leviathan.png",
    description:
      "A colossal sea serpent of biblical legend, basically the ocean's version of a boss fight.",
  },
  {
    name: "Satyr",
    code: "satyr",
    image: "/mythcards/satyr.png",
    description:
      "Half-man, half-goat, full-time party animal with a penchant for pan flutes and poor decisions.",
  },
  {
    name: "Nymph",
    code: "nymph",
    image: "/mythcards/nymph.png",
    description:
      "Nature spirits that embody the beauty of forests, rivers, and fields—like Mother Nature’s influencers.",
  },
  {
    name: "Anansi",
    code: "anansi",
    image: "/mythcards/anansi.png",
    description:
      "A clever spider-trickster from African folklore who spins both webs and stories.",
  },
  {
    name: "Troll",
    code: "troll",
    image: "/mythcards/troll.png",
    description:
      "Grumpy bridge-dwellers or mountain giants with questionable hygiene and zero social skills.",
  },
  {
    name: "Bunyip",
    code: "bunyip",
    image: "/mythcards/bunyip.png",
    description:
      "A mysterious Australian swamp creature—think cryptid meets cautionary tale.",
  },
  {
    name: "Iktomi",
    code: "iktomi",
    image: "/mythcards/iktomi.png",
    description:
      "A Lakota spider-trickster god who weaves chaos with intelligence and mischief.",
  },
  {
    name: "Loch Ness Monster",
    code: "loch_ness_monster",
    image: "/mythcards/loch_ness_monster.png",
    description:
      "Scotland’s most elusive lake dweller—photogenic, yet camera shy.",
  },
  {
    name: "Chupacabra",
    code: "chupacabra",
    image: "/mythcards/chupacabra.png",
    description:
      "The goat-sucker of Latin American lore, feared by livestock and embraced by late-night TV.",
  },
  {
    name: "Jackalope",
    code: "jackalope",
    image: "/mythcards/jackalope.png",
    description: "A mythical horned rabbit—equal parts adorable and armed.",
  },
  {
    name: "Phoenix",
    code: "phoenix",
    image: "/mythcards/phoenix.png",
    description:
      "A firebird that bursts into flames and rises from the ashes. Ultimate glow-up.",
  },
  {
    name: "Griffin",
    code: "griffin",
    image: "/mythcards/griffin.png",
    description:
      "The majestic fusion of lion and eagle—basically nature's power couple.",
  },
  {
    name: "Minotaur",
    code: "minotaur",
    image: "/mythcards/minotaur.png",
    description: "Bull-headed maze dweller with anger management issues.",
  },
  {
    name: "Dragon",
    code: "dragon",
    image: "/mythcards/dragon.png",
    description:
      "Winged, fire-breathing legends found in nearly every culture—mythology’s most iconic hothead.",
  },
  {
    name: "Unicorn",
    code: "unicorn",
    image: "/mythcards/unicorn.png",
    description: "A magical horse with a horn and a brand deal with rainbows.",
  },
  {
    name: "Cerberus",
    code: "cerberus",
    image: "/mythcards/cerberus.png",
    description:
      "The three-headed hound guarding the gates of the Underworld—think security with bite.",
  },
  {
    name: "Hydra",
    code: "hydra",
    image: "/mythcards/hydra.png",
    description:
      "Cut off one head, two more grow—medieval multitasking nightmare.",
  },
  {
    name: "Cyclops",
    code: "cyclops",
    image: "/mythcards/cyclops.png",
    description:
      "A one-eyed giant with a terrible depth perception and worse manners.",
  },
  {
    name: "Chimera",
    code: "chimera",
    image: "/mythcards/chimera.png",
    description:
      "A fiery mashup of lion, goat, and snake—ancient Greece's version of a patch update gone rogue.",
  },
  {
    name: "Sphinx",
    code: "sphinx",
    image: "/mythcards/sphinx.png",
    description:
      "Riddle-loving guardian with the body of a lion and the face of a trivia night champion.",
  },
  {
    name: "Kraken",
    code: "kraken",
    image: "/mythcards/kraken.png",
    description:
      "Giant sea monster with a flair for dramatic ship-smashing entrances.",
  },
  {
    name: "Banshee",
    code: "banshee",
    image: "/mythcards/banshee.png",
    description:
      "A wailing Irish spirit—when she screams, someone’s about to get ghosted. Literally.",
  },
  {
    name: "Centaur",
    code: "centaur",
    image: "/mythcards/centaur.png",
    description:
      "Half-man, half-horse, all gallop. Known for archery and identity confusion.",
  },
  {
    name: "Pegasus",
    code: "pegasus",
    image: "/mythcards/pegasus.png",
    description:
      "A winged horse who makes a dramatic entrance look like child's play.",
  },
  {
    name: "Basilisk",
    code: "basilisk",
    image: "/mythcards/basilisk.png",
    description:
      "Deadly reptile that can kill with a glare—basically a toxic gaze personified.",
  },
  {
    name: "Gorgon",
    code: "gorgon",
    image: "/mythcards/gorgon.png",
    description:
      "Snake-haired women whose gaze turns folks to stone. Zero tolerance for awkward stares.",
  },
  {
    name: "Harpy",
    code: "harpy",
    image: "/mythcards/harpy.png",
    description:
      "Winged women of vengeance and shrieking doom. Not your ideal dinner guests.",
  },
  {
    name: "Siren",
    code: "siren",
    image: "/mythcards/siren.png",
    description:
      "Sea-dwelling singers whose songs spell doom. Basically ancient Spotify with bad intentions.",
  },
  {
    name: "Djinn",
    code: "djinn",
    image: "/mythcards/djinn.png",
    description: "Magical beings with big powers and even bigger fine print.",
  },
  {
    name: "Kitsune",
    code: "kitsune",
    image: "/mythcards/kitsune.png",
    description:
      "Shapeshifting fox spirit of Japanese lore, equally known for wisdom and mischief.",
  },
  {
    name: "Wendigo",
    code: "wendigo",
    image: "/mythcards/wendigo.png",
    description:
      "Cannibal spirit of the frozen north, driven by hunger and spooky winter vibes.",
  },
  {
    name: "Kappa",
    code: "kappa",
    image: "/mythcards/kappa.png",
    description:
      "A polite yet dangerous river creature from Japan—just bow back and you’ll be fine.",
  },
  {
    name: "Rusalka",
    code: "rusalka",
    image: "/mythcards/rusalka.png",
    description:
      "Slavic water spirit with a haunting beauty and ghost story energy.",
  },
  {
    name: "Naga",
    code: "naga",
    image: "/mythcards/naga.png",
    description:
      "Serpent beings from Hindu and Buddhist mythology—divine and deadly.",
  },
  {
    name: "Valkyrie",
    code: "valkyrie",
    image: "/mythcards/valkyrie.png",
    description:
      "Norse warrior-maidens who choose the slain—Valkyrie Uber to Valhalla.",
  },
  {
    name: "Thunderbird",
    code: "thunderbird",
    image: "/mythcards/thunderbird.png",
    description:
      "Giant bird of Native American lore that brings the storm—and the thunder.",
  },
  {
    name: "Manticore",
    code: "manticore",
    image: "/mythcards/manticore.png",
    description:
      "Lion body, scorpion tail, human face—nature’s uncanny collage.",
  },
  {
    name: "Selkie",
    code: "selkie",
    image: "/mythcards/selkie.png",
    description:
      "Seal by sea, human by shore—romantic shapeshifters with trust issues.",
  },
  {
    name: "Yeti",
    code: "yeti",
    image: "/mythcards/yeti.png",
    description:
      "Himalayan snow monster. Cold, elusive, and probably tired of the paparazzi.",
  },
  {
    name: "Upyr",
    code: "upyr",
    image: "/mythcards/upyr.png",
    description:
      "A Slavic vampire who snacks during the day. A real overachiever in the undead community.",
  },
  {
    name: "Poludnytsya",
    code: "poludnytsya",
    image: "/mythcards/poludnytsya.png",
    description:
      "The ‘Lady Midday’ who appears in fields to strike down lazy workers. Your HR department's nightmare.",
  },
  {
    name: "Povitruya",
    code: "povitruya",
    image: "/mythcards/povitruya.png",
    description:
      "Slavic air spirit with a breezy attitude and a twist of mischief.",
  },
  {
    name: "Baba Yaga",
    code: "baba_yaga",
    image: "/mythcards/baba_yaga.png",
    description:
      "Witch of the woods who flies in a mortar and pestle—your grandma if she were an eldritch boss.",
  },
  {
    name: "Leshy",
    code: "leshy",
    image: "/mythcards/leshy.png",
    description:
      "Forest guardian with a talent for leading travelers astray and sprouting from trees.",
  },
];

const LEVELS = {
  easier: 2,
  easy: 4,
  normal: 5,
  hard: 7,
  harder: 10,
};

const getTemplate = (creature, flipped = true, disabled = false) => {
  let flippedClass = flipped ? "flipped" : "";
  let disabledAttr = disabled ? "disabled" : "";
  return `<div class="card-place"><button ${disabledAttr} style="--deg: ${getRandomArbitrary(
    -1.5,
    1.5
  )}deg;" data-code="${creature.code}" class="card ${flippedClass} ${
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
  card.classList.remove("flipped");
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
        opened[0].classList.add("flipped");
        opened[1].classList.add("flipped");
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
