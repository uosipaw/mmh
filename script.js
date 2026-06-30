// script.js

const titleText = "mdsn mchll";

const pageGroups = {
  cute: [
    {
      title: "ms paint",
      href: "paint.html",
      icon: "✎",
      note: "draw something dumb",
      color: "#ff9bd0",
    },
    {
      title: "stickers",
      href: "stickers.html",
      icon: "☻",
      note: "puffy sticker nonsense",
      color: "#ffe66b",
    },
    {
      title: "balloon dog",
      href: "balloon-graveyard.html",
      icon: "犬",
      note: "cute, for now",
      color: "#8bd8ff",
    },
  ],

  weird: [
    {
      title: "dinosaurs",
      href: "dinosaurs.html",
      icon: "✦",
      note: "ancient lizards, modern judgment",
      color: "#9dffd2",
    },
    {
      title: "animals",
      href: "animals.html",
      icon: "◎",
      note: "scientific-ish creature drawer",
      color: "#ffb15f",
    },
    {
      title: "quotes",
      href: "quotes.html",
      icon: "❝",
      note: "wisdom, probably fake",
      color: "#fff2a8",
    },
    {
      title: "trivia",
      href: "trivia.html",
      icon: "?",
      note: "tiny trivia trap",
      color: "#b895ff",
    },
  ],

  myth: [
    {
      title: "myth match",
      href: "myth.html",
      icon: "☉",
      note: "matching game for tiny gods",
      color: "#d7aa35",
    },
    {
      title: "folklore",
      href: "folklore.html",
      icon: "♢",
      note: "stories from the weird drawer",
      color: "#c9798d",
    },
    {
      title: "creatures",
      href: "creatures.html",
      icon: "✺",
      note: "bugs, beasts, and bad vibes",
      color: "#8ebf9f",
    },
    {
      title: "symbols",
      href: "symbols.html",
      icon: "⌘",
      note: "dreamy little decoder",
      color: "#c4a1ff",
    },
  ],

  dark: [
    {
      title: "tarot reader",
      href: "tarot.html",
      icon: "✹",
      note: "the big one",
      color: "#ff3fa4",
    },
    {
      title: "oracle drawer",
      href: "oracle.html",
      icon: "◌",
      note: "ask something unserious",
      color: "#ccff33",
    },
    {
      title: "slot machine",
      href: "casino.html",
      icon: "$",
      note: "spin the thing",
      color: "#ff4040",
    },
    {
      title: "donate",
      href: "donate.html",
      icon: "♡",
      note: "feed the machine",
      color: "#ffe66b",
    },
    {
      title: "basement",
      href: "basement.html",
      icon: "↓",
      note: "do not click, obviously",
      color: "#9dffd2",
    },
  ],
};

const body = document.body;
const puppetTitle = document.getElementById("puppetTitle");
const enterButton = document.getElementById("enterButton");
const sunButton = document.getElementById("sunButton");
const toast = document.getElementById("toast");

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");

  window.clearTimeout(showToast.timer);

  showToast.timer = window.setTimeout(() => {
    toast.classList.remove("show");
  }, 1800);
}

function buildHangingTitle() {
  titleText.split("").forEach((character, index) => {
    const letter = document.createElement("span");

    letter.className = "title-letter";

    if (character === " ") {
      letter.classList.add("space");
      puppetTitle.appendChild(letter);
      return;
    }

    letter.style.animationDelay = `${index * 80}ms`;

    letter.innerHTML = `
      <span class="letter-paper">${character}</span>
    `;

    puppetTitle.appendChild(letter);
  });
}

function breakOneString() {
  const letters = [...document.querySelectorAll(".title-letter:not(.space)")];
  const letterToBreak = letters[6] || letters[letters.length - 1];

  if (!letterToBreak) return;

  letterToBreak.classList.add("broken-right");
  showToast("one string gave up. fair.");
}

function swayTitle() {
  const letters = [...document.querySelectorAll(".title-letter:not(.space)")];

  letters.forEach((letter, index) => {
    window.setTimeout(() => {
      letter.classList.remove("sway-now");
      void letter.offsetWidth;
      letter.classList.add("sway-now");
    }, index * 45);
  });
}

function renderCards() {
  Object.entries(pageGroups).forEach(([groupName, pages]) => {
    const container = document.querySelector(`[data-links="${groupName}"]`);

    if (!container) return;

    pages.forEach((page, index) => {
      const card = document.createElement("a");

      card.className = "page-card";
      card.href = page.href;
      card.style.setProperty("--card-accent", page.color);
      card.style.setProperty("--card-bg", getSoftCardBackground(index));
      card.style.setProperty("--r", `${getRotation(index)}deg`);

      card.innerHTML = `
        <span class="card-icon">${page.icon}</span>
        <div>
          <h3 class="card-title">${page.title}</h3>
          <p class="card-note">${page.note}</p>
        </div>
      `;

      container.appendChild(card);
    });
  });
}

function getRotation(index) {
  const rotations = [-1.8, 1.2, -0.7, 1.7, -1.1, 0.9];
  return rotations[index % rotations.length];
}

function getSoftCardBackground(index) {
  const backgrounds = [
    "#fff3d7",
    "#ffe1ef",
    "#d9f5ff",
    "#e0ffef",
    "#fff2a8",
    "#eadcff",
  ];

  return backgrounds[index % backgrounds.length];
}

function openIntro() {
  window.setTimeout(() => {
    body.classList.add("intro-open");
  }, 450);

  window.setTimeout(() => {
    breakOneString();
  }, 2350);

  window.setTimeout(() => {
    body.classList.add("intro-ready");
  }, 2800);
}

function bindEvents() {
  puppetTitle.addEventListener("click", () => {
    swayTitle();
  });

  puppetTitle.addEventListener("pointerenter", () => {
    swayTitle();
  });

  enterButton.addEventListener("click", () => {
    document.getElementById("landing").scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  });

  sunButton.addEventListener("click", () => {
    sunButton.classList.remove("annoyed");
    void sunButton.offsetWidth;
    sunButton.classList.add("annoyed");

    showToast("do not touch the sun.");
  });

  document.querySelectorAll(".page-card").forEach((card) => {
    card.addEventListener("click", () => {
      card.style.transform = "translateY(4px) scale(0.98)";
    });
  });
}

buildHangingTitle();
renderCards();
bindEvents();
openIntro();
