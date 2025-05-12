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
const stoppedIndexes = new Array(numReels);
let reels = [];
let playerName = "";

const creditsDisplay = document.getElementById("credits");
const betInput = document.getElementById("bet");
const spinButton = document.getElementById("spinButton");
const resultDisplay = document.getElementById("result");
const playerNameInput = document.getElementById("playerName");
const leaderboardList = document.getElementById("leaderboard");

const winningLinesConfig = [
  [
    { reel: 0, row: 0 },
    { reel: 1, row: 0 },
    { reel: 2, row: 0 },
    { reel: 3, row: 0 },
    { reel: 4, row: 0 },
  ], // Top
  [
    { reel: 0, row: 1 },
    { reel: 1, row: 1 },
    { reel: 2, row: 1 },
    { reel: 3, row: 1 },
    { reel: 4, row: 1 },
  ], // Middle
  [
    { reel: 0, row: 2 },
    { reel: 1, row: 2 },
    { reel: 2, row: 2 },
    { reel: 3, row: 2 },
    { reel: 4, row: 2 },
  ], // Bottom
  [
    { reel: 0, row: 0 },
    { reel: 1, row: 1 },
    { reel: 2, row: 2 },
    { reel: 3, row: 1 },
    { reel: 4, row: 0 },
  ], // Diagonal 1
  [
    { reel: 0, row: 2 },
    { reel: 1, row: 1 },
    { reel: 2, row: 0 },
    { reel: 3, row: 1 },
    { reel: 4, row: 2 },
  ], // Diagonal 2
];

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

init();

function populateReel(reelEl) {
  reelEl.innerHTML = "";
  const symbolsHTML = Array.from({ length: 20 }, () => {
    const rand = Math.floor(Math.random() * symbolPaths.length);
    return `<div class="symbol"><img src="${symbolPaths[rand]}" alt="symbol"></div>`;
  }).join("");
  reelEl.innerHTML = symbolsHTML;

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
  populateReel(reelEl);
  reelEl.style.transition = "none";
  reelEl.style.transform = "translateY(0px)";

  return new Promise((resolve) => {
    setTimeout(() => {
      reelEl.style.transition =
        "transform 2.5s cubic-bezier(0.25, 1.5, 0.5, 1)";
      const stopIndex = Math.floor(Math.random() * 17) + 3;
      stoppedIndexes[index] = stopIndex;
      const translateY = -(stopIndex * 70);
      reelEl.style.transform = `translateY(${translateY}px)`;

      setTimeout(() => {
        reelEl.style.transition = "none";
        reelEl.style.transform = `translateY(${translateY % (20 * 70)}px)`;
        resolve();
      }, 2500);
    }, index * 400);
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
  clearWinningHighlights();

  await Promise.all(reels.map((reelEl, index) => spinReel(reelEl, index)));

  const lines = getAllWinningLines();
  const payout = calculatePayout(lines, bet);
  const winningSymbolElements = getWinningSymbolElements(lines);
  highlightSymbols(winningSymbolElements);

  credits += payout;
  creditsDisplay.textContent = credits;
  displayResult(lines, payout);

  if (credits > 0) {
    updateLeaderboard(playerNameInput.value.trim(), credits);
  }
  spinButton.disabled = false;
}

function getSymbolAt(reelIndex, rowIndex) {
  const allSymbols = reels[reelIndex].querySelectorAll(".symbol");
  const symbol = allSymbols[stoppedIndexes[reelIndex] + rowIndex + 1];
  return symbol?.querySelector("img")?.src || null;
}

function getAllWinningLines() {
  const lines = [];
  for (const lineConfig of winningLinesConfig) {
    const line = lineConfig.map(({ reel, row }) => getSymbolAt(reel, row));
    lines.push(line);
  }
  return lines;
}

function calculatePayout(lines, bet) {
  let totalPayout = 0;
  for (const line of lines) {
    if (!line) continue;
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
      if (count === 3) multiplier = baseValue;
      else if (count === 4) multiplier = baseValue * 2;
      else if (count === 5) multiplier = baseValue * 10;
      linePayout = Math.max(linePayout, bet * multiplier);
    }
    totalPayout += linePayout;
  }
  return totalPayout;
}

function getWinningSymbolElements(lines) {
  const winningSymbolElements = [];
  reels.forEach((reelEl, reelIndex) => {
    const base = stoppedIndexes[reelIndex];
    const allSymbols = reelEl.querySelectorAll(".symbol"); // Cache the result
    for (let row = 0; row < 3; row++) {
      const symbolEl = allSymbols[base + row + 1];
      if (!symbolEl) continue;
      const lineIndex = row;
      const line = lines[lineIndex];
      if (
        line &&
        line[reelIndex] === line[0] &&
        line.filter((sym) => sym === line[0]).length >= 3
      ) {
        winningSymbolElements.push(symbolEl);
      }
    }

    const symbolEl1 = allSymbols[base + (reelIndex < 3 ? reelIndex : 2)];
    if (symbolEl1) {
      const diagonal1 = lines[3];
      if (
        diagonal1 &&
        diagonal1[reelIndex] === diagonal1[0] &&
        diagonal1.filter((sym) => sym === diagonal1[0]).length >= 3
      ) {
        winningSymbolElements.push(symbolEl1);
      }
    }

    const symbolEl2 = allSymbols[base + (reelIndex < 3 ? 2 - reelIndex : 2)];
    if (symbolEl2) {
      const diagonal2 = lines[4];
      if (
        diagonal2 &&
        diagonal2[reelIndex] === diagonal2[0] &&
        diagonal2.filter((sym) => sym === diagonal2[0]).length >= 3
      ) {
        winningSymbolElements.push(symbolEl2);
      }
    }
  });
  return winningSymbolElements;
}

function highlightSymbols(symbolElements) {
  symbolElements.forEach((el) => el.classList.add("winning"));
}

function clearWinningHighlights() {
  reels.forEach((reelEl) => {
    reelEl
      .querySelectorAll(".symbol")
      .forEach((symbol) => symbol.classList.remove("winning"));
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
  // Dummy implementation
  console.log(`Updated leaderboard: ${playerName} - ${credits}`);
  // Add to your leaderboard display logic here (e.g., localStorage)
}

spinButton.addEventListener("click", spin);
