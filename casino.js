const defaultSymbolPaths = [
  "images/6slots0.png",
  "images/7slots1.png",
  "images/8slots2.png",
  "images/9slots3.png",
  "images/10slots4.png",
  "images/11slots5.png",
];

const symbolPaths =
  Array.isArray(window.slotSymbolImages) &&
  window.slotSymbolImages.every(
    (path) => typeof path === "string" && path.trim() !== ""
  )
    ? window.slotSymbolImages
    : defaultSymbolPaths;

const symbolValues = {
  "6slots0.png": 1,
  "7slots1.png": 2,
  "8slots2.png": 3,
  "9slots3.png": 4,
  "10slots4.png": 5,
  "11slots5.png": 6,
};

const numReels = 5;
const symbolsPerReel = 20;
const visibleSymbols = 3;
let credits = 100;
const stoppedIndexes = new Array(numReels).fill(0);
let reels = [];
let playerName = "";
let spinning = false;

const creditsDisplay = document.getElementById("credits");
const betInput = document.getElementById("bet");
const spinButton = document.getElementById("spinButton");
const resultDisplay = document.getElementById("result");
const playerNameInput = document.getElementById("playerName");
const leaderboardList = document.getElementById("leaderboard");
const linesDisplay = document.getElementById("lines");

// Configuration for winning lines in the slot machine.
// Each line is an array of objects, where each object specifies the reel index and row index
// for a symbol that is part of the line. For example:
// - The first three lines represent horizontal lines (top, middle, bottom).
// - The last two lines represent diagonal lines (from top-left to bottom-right and vice versa).
const winningLinesConfig = [
  [...Array(5)].map((_, i) => ({ reel: i, row: 0 })), // Top
  [...Array(5)].map((_, i) => ({ reel: i, row: 1 })), // Middle
  [...Array(5)].map((_, i) => ({ reel: i, row: 2 })), // Bottom
  [0, 1, 2, 3, 4].map((i) => ({ reel: i, row: [0, 1, 2, 1, 0][i] })), // Diagonal 1
  [0, 1, 2, 3, 4].map((i) => ({ reel: i, row: [2, 1, 0, 1, 2][i] })), // Diagonal 2
];

const linesMap = ["top", "middle", "bottom", "diagonal1", "diagonal2"];

function init() {
  playerName = playerNameInput.value.trim();
  reels = Array.from({ length: numReels }, (_, i) =>
    document.querySelector(`#reel${i} .symbols`)
  );
  reels.forEach(populateReel);
  creditsDisplay.textContent = credits;
  displayLeaderboard();
}

function generateSymbolsHTML(count) {
  return Array.from({ length: count }, () => {
    const path = symbolPaths[Math.floor(Math.random() * symbolPaths.length)];
    return `<div class="symbol"><img src="${path}" alt="symbol"></div>`;
  }).join("");
}

function populateReel(reelEl) {
  reelEl.innerHTML = generateSymbolsHTML(symbolsPerReel + visibleSymbols);
}

function isValidBet(bet) {
  const num = Number(bet);
  return Number.isFinite(num) && num >= 1 && num <= credits;
}

function extractFileName(url) {
  return url.split("/").pop();
}

function spinReel(reelEl, index) {
  const totalNew = symbolsPerReel + visibleSymbols;
  const symbolHeight = reelEl.querySelector(".symbol")?.offsetHeight || 70;
  const spinRounds = 3 + Math.floor(Math.random() * 2);
  const randomOffset = Math.floor(Math.random() * symbolsPerReel);
  const stopOffset = randomOffset * symbolHeight;
  const spinDistance = spinRounds * totalNew * symbolHeight + stopOffset;

  reelEl.insertAdjacentHTML(
    "beforeend",
    generateSymbolsHTML(symbolsPerReel + visibleSymbols)
  );

  reelEl.style.transition = "none";
  reelEl.style.transform = "translateY(0px)";
  reelEl.classList.add("spinning");

  return new Promise((resolve) => {
    let start = null;
    const duration = 2200;
    function animate(ts) {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = spinDistance * ease;
      reelEl.style.transform = `translateY(-${current}px)`;
      if (progress < 1) requestAnimationFrame(animate);
      else {
        while (reelEl.childNodes.length > totalNew)
          reelEl.removeChild(reelEl.firstChild);
        reelEl.style.transition = "none";
        reelEl.style.transform = `translateY(-${stopOffset}px)`;
        reelEl.classList.remove("spinning");
        stoppedIndexes[index] = randomOffset;
        resolve();
      }
    }
    requestAnimationFrame(animate);
  });
}

async function spin() {
  if (spinning) return;
  const bet = Number(betInput.value);
  if (!isValidBet(bet)) return alert("Invalid bet amount.");

  credits -= bet;
  creditsDisplay.textContent = credits;
  spinButton.disabled = true;
  spinning = true;
  resultDisplay.textContent = "";
  resultDisplay.className = "";
  linesDisplay.textContent = "";

  clearWinningHighlights();
  await Promise.all(reels.map(spinReel));

  const lines = getAllWinningLines();
  const payout = calculatePayout(lines, bet);
  highlightSymbols(getWinningSymbolElements(lines));

  credits += payout;
  creditsDisplay.textContent = credits;
  displayResult(payout);
  updateLeaderboard(playerNameInput.value.trim(), credits);

  if (credits <= 0) alert("Game over! You ran out of credits.");
  spinButton.disabled = credits <= 0;
  spinning = false;
}

function getSymbolAt(reelIndex, rowIndex) {
  const all = reels[reelIndex]?.querySelectorAll(".symbol");
  const idx = (stoppedIndexes[reelIndex] + rowIndex) % symbolsPerReel;
  const img = all[idx]?.querySelector("img");
  if (!img) return null;
  return extractFileName(img.src) || null;
}

function getAllWinningLines() {
  return winningLinesConfig.map((line) =>
    line.map(({ reel, row }) => getSymbolAt(reel, row))
  );
}

function calculatePayout(lines, bet) {
  let total = 0;
  linesDisplay.textContent = "";
  lines.forEach((line, i) => {
    const counts = {};
    line.forEach((sym) => {
      counts[sym] = (counts[sym] || 0) + 1;
    });
    let payout = 0;
    for (const [sym, count] of Object.entries(counts)) {
      const val = symbolValues[sym] || 0;
      let multiplier = 0;
      if (count === 5) {
        multiplier = val * 10;
      } else if (count === 4) {
        multiplier = val * 2;
      } else if (count === 3) {
        multiplier = val;
      }
      payout = Math.max(payout, bet * multiplier);
    }
    if (payout > 0)
      linesDisplay.textContent += `Line ${i + 1} (${
        linesMap[i]
      }): ${payout} credits\n`;
    total += payout;
  });
  return total;
}

function getWinningSymbolElements(lines) {
  const elements = [];
  reels.forEach((reelEl, reelIndex) => {
    for (let row = 0; row < visibleSymbols; row++) {
      const idx = (stoppedIndexes[reelIndex] + row) % symbolsPerReel;
      const el = reelEl.querySelectorAll(".symbol")[idx];
      const sym = extractFileName(el?.querySelector("img")?.src || "");
      if (
        el &&
        lines.some(
          (line) =>
            line[reelIndex] === sym && line.filter((s) => s === sym).length >= 3
        )
      ) {
        elements.push(el);
      }
    }
  });
  return elements;
}

function highlightSymbols(symbols) {
  symbols.forEach((el) => el && el.classList.add("winning-symbol"));
}

function clearWinningHighlights() {
  reels.forEach((reelEl) =>
    reelEl
      .querySelectorAll(".symbol")
      .forEach((sym) => sym && sym.classList.remove("winning-symbol"))
  );
}

function displayResult(payout) {
  resultDisplay.textContent =
    payout > 0 ? `You won ${payout} credits!` : "No win. Try again!";
  let leaderboard;
  try {
    const parsed = JSON.parse(localStorage.getItem("leaderboard"));
    leaderboard =
      Array.isArray(parsed) &&
      parsed.every(
        (entry) =>
          typeof entry.player === "string" && typeof entry.score === "number"
      )
        ? parsed
        : [];
  } catch {
    leaderboard = [];
  }
  resultDisplay.classList.toggle("win", payout > 0);
}

function updateLeaderboard(player, score) {
  if (!player) return;
  const leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
  const index = leaderboard.findIndex((entry) => entry.player === player);
  if (index !== -1 && score > leaderboard[index].score)
    leaderboard[index].score = score;
  else if (index === -1) leaderboard.push({ player, score });

  leaderboard.sort(
    (a, b) => b.score - a.score || a.player.localeCompare(b.player)
  );
  localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
  displayLeaderboard();
}

function displayLeaderboard() {
  leaderboardList.innerHTML = "";
  (JSON.parse(localStorage.getItem("leaderboard")) || [])
    .slice(0, 5)
    .forEach(({ player, score }) => {
      const li = document.createElement("li");
      li.textContent = `${player}: ${score} credits`;
      leaderboardList.appendChild(li);
    });
}

document.getElementById("playerForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const player = playerNameInput.value.trim();
  if (player) {
    playerName = player;
    localStorage.setItem("playerName", player);
    const notification = document.createElement("div");
    notification.textContent = "Player name set!";
    notification.className = "notification";
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
    playerNameInput.value = stored.trim();
    playerName = stored.trim();
  } else {
    localStorage.removeItem("playerName");
    playerNameInput.value = "";
    playerName = "";
  }
});

spinButton.addEventListener("click", spin);
const stored = localStorage.getItem("playerName");
if (stored) {
  playerNameInput.value = stored;
  playerName = stored;
}
init();
