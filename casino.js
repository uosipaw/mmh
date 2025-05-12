const symbolPaths = [
  "./images/1slots.png",
  "./images/2slots.png",
  "./images/3slots.png",
  "./images/4slots.png",
  "./images/5slots.png",
  "./images/6slots.png",
  "./images/7slots.png",
  "./images/8slots.png",
];

const symbolValues = {
  "./images/1slots.png": 1,
  "./images/2slots.png": 2,
  "./images/3slots.png": 3,
  "./images/4slots.png": 4,
  "./images/5slots.png": 5,
  "./images/6slots.png": 6,
  "./images/7slots.png": 7,
  "./images/8slots.png": 10,
};

const numReels = 5;
let credits = 100;
const stoppedIndexes = new Array(numReels); // Initialize array with size
let reels = []; // Declare reels here
let playerName = "";

const creditsDisplay = document.getElementById("credits");
const betInput = document.getElementById("bet");
const spinButton = document.getElementById("spinButton");
const resultDisplay = document.getElementById("result");
const playerNameInput = document.getElementById("playerName");
const leaderboardList = document.getElementById("leaderboard");
const linesMap = {
  0: "top",
  1: "middle",
  2: "bottom",
  3: "diagonal1",
  4: "diagonal2",
};

function init() {
  playerName = playerNameInput.value.trim();
  reels = Array.from({ length: numReels }, (_, i) =>
    document.querySelector(`#reel${i} .symbols`)
  );
  reels.forEach(populateReel);
  creditsDisplay.textContent = credits;
}

init(); // Call init on page load

function populateReel(reelEl) {
  reelEl.innerHTML = "";
  const symbolsHTML = Array.from({ length: 20 }, () => {
    const rand = Math.floor(Math.random() * symbolPaths.length);
    return `<div class="symbol"><img src="${symbolPaths[rand]}" alt="symbol"></div>`;
  }).join(""); // Use join for efficient string concatenation
  reelEl.innerHTML = symbolsHTML;

  // Add extra symbols to ensure seamless spinning
  const extraSymbolsHTML = Array.from({ length: 3 }, () => {
    const rand = Math.floor(Math.random() * symbolPaths.length);
    return `<div class="symbol"><img src="${symbolPaths[rand]}" alt="symbol"></div>`;
  }).join("");
  reelEl.innerHTML += extraSymbolsHTML;
}

function isValidBet(bet) {
  const numBet = Number(bet);
  return !isNaN(numBet) && numBet >= 1 && numBet <= credits;
}

function spinReel(reelEl, index) {
  populateReel(reelEl); // Ensure symbols are populated before spinning
  reelEl.style.transition = "none";
  reelEl.style.transform = "translateY(0px)";

  return new Promise((resolve) => {
    setTimeout(() => {
      reelEl.style.transition =
        "transform 2.5s cubic-bezier(0.25, 1.5, 0.5, 1)";
      const stopIndex = Math.floor(Math.random() * 17) + 3; // Optimized range
      stoppedIndexes[index] = stopIndex;
      const translateY = -(stopIndex * 70); // Adjusted for symbol height (70px)
      reelEl.style.transform = `translateY(${translateY}px)`;

      setTimeout(() => {
        reelEl.style.transition = "none";
        reelEl.style.transform = `translateY(${translateY % (20 * 70)}px)`; // Normalize position
        resolve();
      }, 2500);
    }, index * 400); // Staggered spin delay
  });
}

async function spin() {
  const bet = Number(betInput.value);
  if (!isValidBet(bet)) {
    alert("Invalid bet amount.");
    return;
  }

  credits -= bet;
  creditsDisplay.textContent = credits;
  spinButton.disabled = true;
  resultDisplay.textContent = "";
  resultDisplay.className = "";

  // Clear previous winning highlights
  reels.forEach((reelEl) => {
    reelEl
      .querySelectorAll(".symbol")
      .forEach((symbol) => symbol.classList.remove("winning"));
  });

  // Spin all reels
  await Promise.all(reels.map((reelEl, index) => spinReel(reelEl, index)));

  // Determine results after spinning
  const lines = getAllWinningLines();
  const payout = calculatePayout(lines, bet);
  highlightWinningSymbols(lines);
  credits += payout;
  creditsDisplay.textContent = credits;
  displayResult(lines, payout);

  if (credits > 0) {
    updateLeaderboard(playerNameInput.value.trim(), credits);
  }
  spinButton.disabled = false;
}

function getSymbolAt(reelIndex, rowIndex) {
  const all = reels[reelIndex].querySelectorAll(".symbol");
  return (
    all[stoppedIndexes[reelIndex] + rowIndex + 1]?.querySelector("img")?.src ||
    null
  );
}

function getAllWinningLines() {
  const symbols = [[], [], []]; // rows: top, middle, bottom

  for (let i = 0; i < numReels; i++) {
    for (let row = 0; row < 3; row++) {
      symbols[row].push(getSymbolAt(i, row));
    }
  }

  // Diagonals (optimized)
  const diagonals = [
    [
      symbols[0][0],
      symbols[1][1],
      symbols[2][2],
      getSymbolAt(3, 3),
      getSymbolAt(4, 4),
    ], // ↘
    [
      getSymbolAt(0, 2),
      symbols[1][1],
      symbols[0][2],
      symbols[1][3],
      getSymbolAt(4, 2),
    ], // ↙
  ];

  return [...symbols, ...diagonals];
}

function calculatePayout(lines, bet) {
  let total = 0;

  lines.forEach((line) => {
    if (!line) return; // Skip empty line
    const counts = {};
    for (const symbol of line) {
      counts[symbol] = (counts[symbol] || 0) + 1;
    }
    let linePayout = 0;
    for (const symbol in counts) {
      if (!symbol) continue;
      const count = counts[symbol];
      const baseValue = symbolValues[symbol] || 0;
      let multiplier = 0;
      if (count === 3) multiplier = baseValue * 1;
      else if (count === 4) multiplier = baseValue * 2;
      else if (count === 5) multiplier = baseValue * 10;

      linePayout = Math.max(linePayout, bet * multiplier);
    }
    total += linePayout;
  });

  return total;
}

function highlightWinningSymbols(lines) {
  reels.forEach((reelEl, reelIndex) => {
    const base = stoppedIndexes[reelIndex];
    for (let row = 0; row < 3; row++) {
      const symbolEl = reelEl.querySelectorAll(".symbol")[base + row + 1];
      if (!symbolEl) continue; // prevent errors
      const lineIndex = row;
      const line = lines[lineIndex];
      if (
        line &&
        line[reelIndex] === line[0] &&
        line.filter((sym) => sym === line[0]).length >= 3
      ) {
        symbolEl.classList.add("winning");
      }
    }
    const symbolEl1 =
      reelEl.querySelectorAll(".symbol")[
        base + (reelIndex < 3 ? reelIndex : 2)
      ];
    if (symbolEl1) {
      const diagonal1 = lines[3];
      if (
        diagonal1 &&
        diagonal1[reelIndex] === diagonal1[0] &&
        diagonal1.filter((sym) => sym === diagonal1[0]).length >= 3
      ) {
        symbolEl1.classList.add("winning");
      }
    }
    const symbolEl2 =
      reelEl.querySelectorAll(".symbol")[
        base + (reelIndex < 3 ? 2 - reelIndex : 2)
      ];
    if (symbolEl2) {
      const diagonal2 = lines[4];
      if (
        diagonal2 &&
        diagonal2[reelIndex] === diagonal2[0] &&
        diagonal2.filter((sym) => sym === diagonal2[0]).length >= 3
      ) {
        symbolEl2.classList.add("winning");
      }
    }
  });
}

function displayResult(lines, payout) {
  let message = `You won ${payout} credits!`;
  let linesDetails = Object.entries(linesMap)
    .map(([lineIndex, lineName]) => {
      if (!lines[lineIndex]) return;
      if (
        lines[lineIndex].filter((sym) => sym === lines[lineIndex][0]).length >=
        3
      )
        return `Line ${lineName}`;
    })
    .filter(Boolean)
    .join(", ");
  if (linesDetails) message += ` on ${linesDetails}`;
  resultDisplay.textContent = message;
  resultDisplay.className = payout > 0 ? "win" : "lose";
}

function updateLeaderboard(playerName, credits) {
  // Dummy implementation: In real app, use localStorage or server
  console.log(`Updated leaderboard: ${playerName} - ${credits}`);
  // Add to your leaderboard display logic here
}

spinButton.addEventListener("click", spin);
