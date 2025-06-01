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

const BASE_SPINNING_DURATION = 2.7;
const COLUMN_SPINNING_DURATION = 0.3;
const spinSound = new Audio("sounds/spin.mp3");

let cols;

window.addEventListener("DOMContentLoaded", () => {
  cols = document.querySelectorAll(".col");
  setInitialItems();
  if (window.innerWidth < 700) {
    setTimeout(() => {
      document
        .getElementById("container")
        ?.scrollIntoView({ behavior: "smooth" });
    }, 200);
  }
});

function setInitialItems() {
  const baseItemAmount = window.innerWidth < 700 ? 20 : 40;

  cols.forEach((col, i) => {
    const amountOfItems =
      baseItemAmount + i * (window.innerWidth < 700 ? 1 : 3);
    let elms = "";
    let firstThreeElms = "";

    for (let x = 0; x < amountOfItems; x++) {
      const icon = getRandomIcon();
      const item = `<div class="icon" data-item="${icon}"><img src="${icon}" alt="Slot icon"></div>`;
      elms += item;
      if (x < 3) firstThreeElms += item;
    }
    col.innerHTML = elms + firstThreeElms;
  });
}

function spin(button) {
  spinSound.play();
  let duration = BASE_SPINNING_DURATION + randomDuration();

  cols.forEach((col) => {
    duration += COLUMN_SPINNING_DURATION + randomDuration();
    col.style.animationDuration = `${duration}s`;
  });

  button.disabled = true;
  const container = document.getElementById("container");
  container.classList.add("spinning");

  setTimeout(() => setResult(), (BASE_SPINNING_DURATION * 1000) / 2);

  setTimeout(() => {
    container.classList.remove("spinning");
    button.disabled = false;
  }, duration * 1000);
}

function setResult() {
  cols.forEach((col) => {
    const results = Array.from({ length: 3 }, getRandomIcon);
    const icons = col.querySelectorAll(".icon img");

    for (let i = 0; i < 3; i++) {
      icons[i].src = results[i];
      icons[icons.length - 3 + i].src = results[i];
    }
  });
}

function getRandomIcon() {
  return ICONS[Math.floor(Math.random() * ICONS.length)];
}

function randomDuration() {
  return Math.random() * 0.09;
}

function toggleReferralSidebar(btn) {
  const sidebar = document.getElementById("referrals-sidebar");
  const expanded = sidebar.classList.toggle("active");
  btn.setAttribute("aria-expanded", expanded);
}
