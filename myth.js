const startBtn = document.getElementById("startBtn");
const resetBtn = document.getElementById("resetBtn");
const difficultySelect = document.getElementById("difficulty");
const cardGrid = document.getElementById("cardGrid");
const matchesList = document.getElementById("matchesList");
const creatures = [
  {
    name: "Leviathan",
    code: "leviathan",
    image: "mythcards/leviathan.png",
    description:
      "A colossal sea serpent of biblical legend, basically the ocean's version of a boss fight.",
  },
  {
    name: "Satyr",
    code: "satyr",
    image: "mythcards/satyr.png",
    description:
      "Half-man, half-goat, full-time party animal with a penchant for pan flutes and poor decisions.",
  },
  {
    name: "Nymph",
    code: "nymph",
    image: "mythcards/nymph.png",
    description:
      "Nature spirits that embody the beauty of forests, rivers, and fields—like Mother Nature’s influencers.",
  },
  {
    name: "Anansi",
    code: "anansi",
    image: "mythcards/anansi.png",
    description:
      "A clever spider-trickster from African folklore who spins both webs and stories.",
  },
  {
    name: "Troll",
    code: "troll",
    image: "mythcards/troll.png",
    description:
      "Grumpy bridge-dwellers or mountain giants with questionable hygiene and zero social skills.",
  },
  {
    name: "Bunyip",
    code: "bunyip",
    image: "mythcards/bunyip.png",
    description:
      "A mysterious Australian swamp creature—think cryptid meets cautionary tale.",
  },
  {
    name: "Iktomi",
    code: "iktomi",
    image: "mythcards/iktomi.png",
    description:
      "A Lakota spider-trickster god who weaves chaos with intelligence and mischief.",
  },
  {
    name: "Loch Ness Monster",
    code: "loch_ness_monster",
    image: "mythcards/loch_ness_monster.png",
    description:
      "Scotland’s most elusive lake dweller—photogenic, yet camera shy.",
  },
  {
    name: "Chupacabra",
    code: "chupacabra",
    image: "mythcards/chupacabra.png",
    description:
      "The goat-sucker of Latin American lore, feared by livestock and embraced by late-night TV.",
  },
  {
    name: "Jackalope",
    code: "jackalope",
    image: "mythcards/jackalope.png",
    description: "A mythical horned rabbit—equal parts adorable and armed.",
  },
  {
    name: "Phoenix",
    code: "phoenix",
    image: "mythcards/phoenix.png",
    description:
      "A firebird that bursts into flames and rises from the ashes. Ultimate glow-up.",
  },
  {
    name: "Griffin",
    code: "griffin",
    image: "mythcards/griffin.png",
    description:
      "The majestic fusion of lion and eagle—basically nature's power couple.",
  },
  {
    name: "Minotaur",
    code: "minotaur",
    image: "mythcards/minotaur.png",
    description: "Bull-headed maze dweller with anger management issues.",
  },
  {
    name: "Dragon",
    code: "dragon",
    image: "mythcards/dragon.png",
    description:
      "Winged, fire-breathing legends found in nearly every culture—mythology’s most iconic hothead.",
  },
  {
    name: "Unicorn",
    code: "unicorn",
    image: "mythcards/unicorn.png",
    description: "A magical horse with a horn and a brand deal with rainbows.",
  },
  {
    name: "Cerberus",
    code: "cerberus",
    image: "mythcards/cerberus.png",
    description:
      "The three-headed hound guarding the gates of the Underworld—think security with bite.",
  },
  {
    name: "Hydra",
    code: "hydra",
    image: "mythcards/hydra.png",
    description:
      "Cut off one head, two more grow—medieval multitasking nightmare.",
  },
  {
    name: "Cyclops",
    code: "cyclops",
    image: "mythcards/cyclops.png",
    description:
      "A one-eyed giant with a terrible depth perception and worse manners.",
  },
  {
    name: "Chimera",
    code: "chimera",
    image: "mythcards/chimera.png",
    description:
      "A fiery mashup of lion, goat, and snake—ancient Greece's version of a patch update gone rogue.",
  },
  {
    name: "Sphinx",
    code: "sphinx",
    image: "mythcards/sphinx.png",
    description:
      "Riddle-loving guardian with the body of a lion and the face of a trivia night champion.",
  },
  {
    name: "Kraken",
    code: "kraken",
    image: "mythcards/kraken.png",
    description:
      "Giant sea monster with a flair for dramatic ship-smashing entrances.",
  },
  {
    name: "Banshee",
    code: "banshee",
    image: "mythcards/banshee.png",
    description:
      "A wailing Irish spirit—when she screams, someone’s about to get ghosted. Literally.",
  },
  {
    name: "Centaur",
    code: "centaur",
    image: "mythcards/centaur.png",
    description:
      "Half-man, half-horse, all gallop. Known for archery and identity confusion.",
  },
  {
    name: "Pegasus",
    code: "pegasus",
    image: "mythcards/pegasus.png",
    description:
      "A winged horse who makes a dramatic entrance look like child's play.",
  },
  {
    name: "Basilisk",
    code: "basilisk",
    image: "mythcards/basilisk.png",
    description:
      "Deadly reptile that can kill with a glare—basically a toxic gaze personified.",
  },
  {
    name: "Gorgon",
    code: "gorgon",
    image: "mythcards/gorgon.png",
    description:
      "Snake-haired women whose gaze turns folks to stone. Zero tolerance for awkward stares.",
  },
  {
    name: "Harpy",
    code: "harpy",
    image: "mythcards/harpy.png",
    description:
      "Winged women of vengeance and shrieking doom. Not your ideal dinner guests.",
  },
  {
    name: "Siren",
    code: "siren",
    image: "mythcards/siren.png",
    description:
      "Sea-dwelling singers whose songs spell doom. Basically ancient Spotify with bad intentions.",
  },
  {
    name: "Djinn",
    code: "djinn",
    image: "mythcards/djinn.png",
    description: "Magical beings with big powers and even bigger fine print.",
  },
  {
    name: "Kitsune",
    code: "kitsune",
    image: "mythcards/kitsune.png",
    description:
      "Shapeshifting fox spirit of Japanese lore, equally known for wisdom and mischief.",
  },
  {
    name: "Wendigo",
    code: "wendigo",
    image: "mythcards/wendigo.png",
    description:
      "Cannibal spirit of the frozen north, driven by hunger and spooky winter vibes.",
  },
  {
    name: "Kappa",
    code: "kappa",
    image: "mythcards/kappa.png",
    description:
      "A polite yet dangerous river creature from Japan—just bow back and you’ll be fine.",
  },
  {
    name: "Rusalka",
    code: "rusalka",
    image: "mythcards/rusalka.png",
    description:
      "Slavic water spirit with a haunting beauty and ghost story energy.",
  },
  {
    name: "Naga",
    code: "naga",
    image: "mythcards/naga.png",
    description:
      "Serpent beings from Hindu and Buddhist mythology—divine and deadly.",
  },
  {
    name: "Valkyrie",
    code: "valkyrie",
    image: "mythcards/valkyrie.png",
    description:
      "Norse warrior-maidens who choose the slain—Valkyrie Uber to Valhalla.",
  },
  {
    name: "Thunderbird",
    code: "thunderbird",
    image: "mythcards/thunderbird.png",
    description:
      "Giant bird of Native American lore that brings the storm—and the thunder.",
  },
  {
    name: "Manticore",
    code: "manticore",
    image: "mythcards/manticore.png",
    description:
      "Lion body, scorpion tail, human face—nature’s uncanny collage.",
  },
  {
    name: "Selkie",
    code: "selkie",
    image: "mythcards/selkie.png",
    description:
      "Seal by sea, human by shore—romantic shapeshifters with trust issues.",
  },
  {
    name: "Yeti",
    code: "yeti",
    image: "mythcards/yeti.png",
    description:
      "Himalayan snow monster. Cold, elusive, and probably tired of the paparazzi.",
  },
  {
    name: "Upyr",
    code: "upyr",
    image: "mythcards/upyr.png",
    description:
      "A Slavic vampire who snacks during the day. A real overachiever in the undead community.",
  },
  {
    name: "Chort",
    code: "chort",
    image: "mythcards/chort.png",
    description:
      "A demon of Slavic folklore—goat horns, evil laugh, and chaotic energy.",
  },
  {
    name: "Polyovyk",
    code: "polyovyk",
    image: "mythcards/polyovyk.png",
    description:
      "Field spirit of Slavic myth, more at home in wheat than your average scarecrow.",
  },
  {
    name: "Poludnytsya",
    code: "poludnytsya",
    image: "mythcards/poludnytsya.png",
    description:
      "The ‘Lady Midday’ who appears in fields to strike down lazy workers. Your HR department's nightmare.",
  },
  {
    name: "Povitruya",
    code: "povitruya",
    image: "mythcards/povitruya.png",
    description:
      "Slavic air spirit with a breezy attitude and a twist of mischief.",
  },
  {
    name: "Mavka",
    code: "mavka",
    image: "mythcards/mavka.png",
    description:
      "Forest nymphs with tragic origins and a haunting gaze. Think enchanted ghost, not Casper.",
  },
  {
    name: "Vodyanoy",
    code: "vodyanoy",
    image: "mythcards/vodyanoy.png",
    description:
      "Slavic water spirit with a grudge and a tendency to drown fishermen. Hydration with consequences.",
  },
  {
    name: "Vodyanitsa",
    code: "vodyanitsa",
    image: "mythcards/vodyanitsa.png",
    description:
      "Female counterpart to the Vodyanoy, equally mysterious and equally fond of ponds.",
  },
  {
    name: "Domovik",
    code: "domovik",
    image: "mythcards/domovik.png",
    description:
      "Household spirit from Slavic folklore. Part ghost, part roommate, all vibes.",
  },
  {
    name: "Baba Yaga",
    code: "baba_yaga",
    image: "mythcards/baba_yaga.png",
    description:
      "Witch of the woods who flies in a mortar and pestle—your grandma if she were an eldritch boss.",
  },
  {
    name: "Leshy",
    code: "leshy",
    image: "mythcards/leshy.png",
    description:
      "Forest guardian with a talent for leading travelers astray and sprouting from trees.",
  },
];

// LEVELS object for mapping difficulty to number of pairs
const LEVELS = {
  1: 2, // easiest (4 cards)
  2: 4, // easier (8 cards)
  3: 6, // medium (12 cards)
  4: 8, // hard (16 cards)
  5: Math.floor(creatures.length / 2), // hardest: all pairs
};

// Utility: Calculate row count for diamond/circle layout
function calculateRowCount(i, mid, remaining) {
  return Math.min(mid - Math.abs(i - mid + 1), remaining);
}

// --- Game Logic ---
let firstCard, secondCard, lockBoard, matches, cards;

startBtn.addEventListener("click", startGame);
resetBtn.addEventListener("click", resetGame);

// --- Game Logic ---
function startGame() {
  resetGame();
  lockBoard = false;
  const level = parseInt(difficultySelect.value);
  const numPairs = LEVELS[level];
  let selected = shuffleArray([...creatures]).slice(0, numPairs);
  const cardData = shuffleArray([...selected, ...selected]);

  // Calculate grid size for a more regular layout
  const totalCards = cardData.length;
  const cardsPerRow = Math.ceil(Math.sqrt(totalCards));
  const numRows = Math.ceil(totalCards / cardsPerRow);

  cardGrid.innerHTML = "";
  cards = [];
  let index = 0;
  for (let rowNum = 0; rowNum < numRows; rowNum++) {
    const row = document.createElement("div");
    row.classList.add("card-row");
    for (let col = 0; col < cardsPerRow && index < totalCards; col++, index++) {
      const creature = cardData[index];
      const card = createCard(creature);
      row.appendChild(card);
      cards.push(card);
    }
    cardGrid.appendChild(row);
  }
}

function resetGame() {
  [firstCard, secondCard] = [null, null];
  lockBoard = false;
  matches = [];
  cards = [];
  matchesList.innerHTML = "";
  cardGrid.innerHTML = "";
}

function createCard(creature) {
  const card = document.createElement("div");
  card.classList.add("card");
  // Use only CSS classes for rotation
  card.classList.add(
    Math.random() > 0.5 ? "rotate-positive" : "rotate-negative"
  );

  const cardInner = document.createElement("div");
  cardInner.classList.add("card-inner");

  const cardFront = document.createElement("div");
  cardFront.classList.add("card-front");

  const cardBack = document.createElement("div");
  cardBack.classList.add("card-back");
  const img = document.createElement("img");
  img.src = creature.image;
  img.alt = creature.name;
  img.className = "creature-image";
  cardBack.appendChild(img);

  cardInner.appendChild(cardFront);
  cardInner.appendChild(cardBack);
  card.appendChild(cardInner);

  // Store creature data in the card element for event delegation
  card.dataset.code = creature.code;
  card.dataset.name = creature.name;

  // Add event listener for flipping the card
  card.addEventListener("click", () =>
    flipCard(card, creature.code, creature.name)
  );

  return card;
}

function flipCard(card, code, name) {
  // Prevent flipping if the board is locked or the card is already flipped
  if (lockBoard || card.classList.contains("flipped")) return;

  card.classList.add("flipped");

  if (!firstCard) {
    firstCard = { card, code, name };
    return;
  }

  secondCard = { card, code, name };
  lockBoard = true;

  // Check for a match
  if (firstCard.code === secondCard.code) {
    matches.push(firstCard.card);
    matches.push(secondCard.card);
    resetCards();
  } else {
    setTimeout(() => {
      firstCard.card.classList.remove("flipped");
      secondCard.card.classList.remove("flipped");
      resetCards();
    }, 1000);
  }
}

function resetCards() {
  [firstCard, secondCard] = [null, null];
  lockBoard = false;
}
