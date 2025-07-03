const ICONS = [
  "images/6slots0.png",
  "images/7slots1.png",
  "images/8slots2.png",
  "images/9slots3.png",
  "images/10slots4.png",
  "images/11slots5.png",
  "images/slot12.png",
  "images/slot13.png",
  "images/slot14.png",
  "images/slot15.png",
  "images/slot16.png",
  "images/slot17.png",
];

const NUM_REELS = 5;
const NUM_ROWS = 3;
const SPIN_DURATION = 1000; // ms
const SYMBOLS_PER_REEL = ICONS.length;

let reels;
let spinButton;

window.addEventListener("DOMContentLoaded", () => {
  reels = Array.from(document.querySelectorAll(".col"));
  spinButton = document.querySelector(".start-button");
  setupReels();
  spinButton.addEventListener("click", () => spin(spinButton));
});

function setupReels() {
  reels.forEach((reelContainer) => {
    reelContainer.innerHTML = ""; // Clear existing items
    const reel = document.createElement("div");
    reel.classList.add("reel");
    for (let i = 0; i < NUM_ROWS; i++) {
      const iconContainer = document.createElement("div");
      iconContainer.classList.add("icon");
      const img = document.createElement("img");
      img.src = getRandomIcon();
      img.alt = "Slot icon";
      iconContainer.appendChild(img);
      reel.appendChild(iconContainer);
    }
    reelContainer.appendChild(reel);
  });
}

function spin(button) {
  button.disabled = true;
  let completedReels = 0;

  reels.forEach((reelContainer, reelIndex) => {
    const reel = reelContainer.querySelector(".reel");
    const icons = Array.from(reel.querySelectorAll(".icon img"));
    const startTime = Date.now();

    function animateReel() {
      const elapsedTime = Date.now() - startTime;
      const progress = elapsedTime / (SPIN_DURATION + reelIndex * 200); // Stagger stop

      icons.forEach((icon, iconIndex) => {
        const offset = Math.floor(Math.random() * SYMBOLS_PER_REEL);
        icon.src = ICONS[(offset + iconIndex) % SYMBOLS_PER_REEL];
      });

      if (progress < 1) {
        requestAnimationFrame(animateReel);
      } else {
        // Final symbols
        for (let i = 0; i < NUM_ROWS; i++) {
          icons[i].src = getRandomIcon();
        }
        completedReels++;
        if (completedReels === NUM_REELS) {
          button.disabled = false;
          // Add any win checking logic here
        }
      }
    }
    requestAnimationFrame(animateReel);
  });
}

function getRandomIcon() {
  return ICONS[Math.floor(Math.random() * ICONS.length)];
}

function toggleReferralSidebar(btn) {
  const sidebar = document.getElementById("referrals-sidebar");
  const expanded = sidebar.classList.toggle("active");
  btn.setAttribute("aria-expanded", expanded);
}
