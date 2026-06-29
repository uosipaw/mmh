// script.js

const pages = [
  {
    title: "about",
    href: "about.html",
    image: "assets/about.jpg",
    placeholder: "about image",
    accent: "#ff3ea5",
    icon: "★",
    note: "A little intro, but not in a corporate hostage-note way.",
  },
  {
    title: "shop",
    href: "shop.html",
    image: "assets/shop.jpg",
    placeholder: "shop image",
    accent: "#f4ff4f",
    icon: "🛒",
    note: "Products, weird treasures, prints, furniture, whatever is currently alive.",
  },
  {
    title: "portfolio",
    href: "portfolio.html",
    image: "assets/portfolio.jpg",
    placeholder: "portfolio image",
    accent: "#29d9d5",
    icon: "👁",
    note: "A place to show the work without pretending to be normal about it.",
  },
  {
    title: "blog",
    href: "blog.html",
    image: "assets/blog.jpg",
    placeholder: "blog image",
    accent: "#b78cff",
    icon: "✎",
    note: "Updates, thoughts, process notes, tiny chaos, useful rambling.",
  },
  {
    title: "contact",
    href: "contact.html",
    image: "assets/contact.jpg",
    placeholder: "contact image",
    accent: "#ff8a3d",
    icon: "✉",
    note: "The polite little doorway for messages, questions, and business.",
  },
];

const rotations = ["-3deg", "2deg", "1.5deg", "-2deg", "2.5deg"];

const cardGrid = document.getElementById("cardGrid");
const board = document.getElementById("board");
const toast = document.getElementById("toast");
const soundButton = document.getElementById("soundButton");
const shuffleButton = document.getElementById("shuffleButton");
const drawer = document.getElementById("drawer");
const drawerToggle = document.getElementById("drawerToggle");

let soundOn = false;
let audioContext;

function makeCard(page, index) {
  const card = document.createElement("a");

  card.className = "nav-card";
  card.href = page.href;
  card.style.setProperty("--rotate", rotations[index % rotations.length]);
  card.style.setProperty("--accent", page.accent);
  card.style.setProperty("--img", `url("${page.image}")`);
  card.dataset.href = page.href;
  card.dataset.title = page.title;

  card.innerHTML = `
    <span class="pin" aria-hidden="true"></span>

    <div class="photo" data-placeholder="${page.placeholder}"></div>

    <div class="label">
      <span>${page.title}</span>
      <small>${page.icon}</small>
    </div>

    <div class="card-back">
      <p>${page.note}<br><br>double tap to flip back</p>
    </div>
  `;

  return card;
}

function renderCards() {
  pages.forEach((page, index) => {
    cardGrid.appendChild(makeCard(page, index));
  });
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");

  window.clearTimeout(showToast.timer);

  showToast.timer = window.setTimeout(() => {
    toast.classList.remove("show");
  }, 1800);
}

function playSound(type = "tap") {
  if (!soundOn) return;

  audioContext ||= new (window.AudioContext || window.webkitAudioContext)();

  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();

  const now = audioContext.currentTime;

  const settings = {
    tap: [520, 0.04, "square"],
    drag: [180, 0.025, "triangle"],
    flip: [760, 0.08, "sawtooth"],
    secret: [980, 0.13, "square"],
  }[type] || [420, 0.05, "square"];

  oscillator.frequency.setValueAtTime(settings[0], now);
  oscillator.type = settings[2];

  gain.gain.setValueAtTime(0.001, now);
  gain.gain.exponentialRampToValueAtTime(0.08, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, now + settings[1]);

  oscillator.connect(gain);
  gain.connect(audioContext.destination);

  oscillator.start(now);
  oscillator.stop(now + settings[1] + 0.02);
}

function makeDraggable(element, options = {}) {
  let pointerStartX = 0;
  let pointerStartY = 0;
  let startDragX = 0;
  let startDragY = 0;
  let currentX = 0;
  let currentY = 0;
  let moved = false;
  let lastTap = 0;
  let suppressClick = false;

  element.addEventListener("pointerdown", (event) => {
    if (event.button !== undefined && event.button !== 0) return;

    pointerStartX = event.clientX;
    pointerStartY = event.clientY;
    startDragX = currentX;
    startDragY = currentY;
    moved = false;

    element.classList.add("dragging");
    element.setPointerCapture(event.pointerId);
  });

  element.addEventListener("pointermove", (event) => {
    if (!element.classList.contains("dragging")) return;

    const deltaX = event.clientX - pointerStartX;
    const deltaY = event.clientY - pointerStartY;

    currentX = startDragX + deltaX;
    currentY = startDragY + deltaY;

    if (Math.hypot(deltaX, deltaY) > 4) {
      moved = true;
    }

    element.style.setProperty("--drag-x", `${currentX}px`);
    element.style.setProperty("--drag-y", `${currentY}px`);

    if (moved && Math.random() > 0.96) {
      playSound("drag");
    }
  });

  element.addEventListener("pointerup", (event) => {
    element.classList.remove("dragging");

    try {
      element.releasePointerCapture(event.pointerId);
    } catch {
      // Nothing dramatic. Browser already released it.
    }

    const now = Date.now();
    const isDoubleTap = now - lastTap < 280;
    lastTap = now;

    if (isDoubleTap && options.flip !== false) {
      event.preventDefault();
      suppressClick = true;
      element.classList.toggle("flipped");
      playSound("flip");
      return;
    }

    if (!moved && element.matches(".nav-card")) {
      event.preventDefault();
      suppressClick = true;
      element.classList.add("popped");
      playSound("tap");

      window.setTimeout(() => {
        window.location.href = element.dataset.href;
      }, 180);
    } else if (!moved) {
      playSound("tap");
    }

    window.setTimeout(() => {
      element.classList.remove("popped");
    }, 320);
  });

  element.addEventListener("click", (event) => {
    if (suppressClick || moved) {
      event.preventDefault();
      suppressClick = false;
    }
  });

  element.addEventListener("pointercancel", () => {
    element.classList.remove("dragging");
  });
}

function enableDraggableElements() {
  document.querySelectorAll(".nav-card").forEach((card) => {
    makeDraggable(card);
  });

  document.querySelectorAll(".sticker").forEach((sticker) => {
    makeDraggable(sticker, { flip: false });

    sticker.addEventListener("click", () => {
      showToast("tiny sticker behavior. very serious technology.");
    });
  });
}

function shuffleBoard() {
  const cards = document.querySelectorAll(".nav-card");

  cards.forEach((card) => {
    const x = Math.round((Math.random() - 0.5) * 26);
    const y = Math.round((Math.random() - 0.5) * 22);
    const r = `${Math.round((Math.random() - 0.5) * 8)}deg`;

    card.style.setProperty("--drag-x", `${x}px`);
    card.style.setProperty("--drag-y", `${y}px`);
    card.style.setProperty("--rotate", r);
    card.classList.add("popped");

    setTimeout(() => {
      card.classList.remove("popped");
    }, 340);
  });

  playSound("flip");
  showToast("board shuffled.");
}

function applyParallax(x, y) {
  document.querySelectorAll(".nav-card").forEach((card, index) => {
    const depth = (index + 1) * 0.8;

    card.style.setProperty("--parallax-x", `${x * depth}px`);
    card.style.setProperty("--parallax-y", `${y * depth}px`);
  });
}

async function toggleSound() {
  soundOn = !soundOn;

  if (soundOn) {
    audioContext ||= new (window.AudioContext || window.webkitAudioContext)();

    if (audioContext.state === "suspended") {
      await audioContext.resume();
    }

    soundButton.textContent = "🔊";
    showToast("sound on. deeply unnecessary. obviously staying.");
    playSound("secret");
  } else {
    soundButton.textContent = "🔇";
    showToast("sound off.");
  }
}

function bindEvents() {
  soundButton.addEventListener("click", toggleSound);

  shuffleButton.addEventListener("click", shuffleBoard);

  drawerToggle.addEventListener("click", () => {
    drawer.classList.toggle("open");
    playSound("flip");
  });

  document.querySelectorAll("[data-secret]").forEach((button) => {
    button.addEventListener("click", () => {
      playSound("secret");
      showToast(button.dataset.secret);
    });
  });

  board.addEventListener("pointermove", (event) => {
    const rect = board.getBoundingClientRect();

    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;

    applyParallax(x * 4, y * 4);
  });

  board.addEventListener("pointerleave", () => {
    applyParallax(0, 0);
  });

  if ("DeviceOrientationEvent" in window) {
    window.addEventListener("deviceorientation", (event) => {
      const gamma = Math.max(-12, Math.min(12, event.gamma || 0));
      const beta = Math.max(-12, Math.min(12, event.beta || 0));

      applyParallax(gamma / 4, beta / 6);
    });
  }
}

renderCards();
enableDraggableElements();
bindEvents();

// script.js

const pages = [
  {
    title: "about",
    href: "about.html",
    image: "assets/about.jpg",
    placeholder: "about image",
    accent: "#ff3ea5",
    icon: "★",
    note: "A little intro, but not in a corporate hostage-note way.",
  },
  {
    title: "shop",
    href: "shop.html",
    image: "assets/shop.jpg",
    placeholder: "shop image",
    accent: "#f4ff4f",
    icon: "🛒",
    note: "Products, weird treasures, prints, furniture, whatever is currently alive.",
  },
  {
    title: "portfolio",
    href: "portfolio.html",
    image: "assets/portfolio.jpg",
    placeholder: "portfolio image",
    accent: "#29d9d5",
    icon: "👁",
    note: "A place to show the work without pretending to be normal about it.",
  },
  {
    title: "blog",
    href: "blog.html",
    image: "assets/blog.jpg",
    placeholder: "blog image",
    accent: "#b78cff",
    icon: "✎",
    note: "Updates, thoughts, process notes, tiny chaos, useful rambling.",
  },
  {
    title: "contact",
    href: "contact.html",
    image: "assets/contact.jpg",
    placeholder: "contact image",
    accent: "#ff8a3d",
    icon: "✉",
    note: "The polite little doorway for messages, questions, and business.",
  },
];

const rotations = ["-3deg", "2deg", "1.5deg", "-2deg", "2.5deg"];

const cardGrid = document.getElementById("cardGrid");
const board = document.getElementById("board");
const toast = document.getElementById("toast");
const soundButton = document.getElementById("soundButton");
const shuffleButton = document.getElementById("shuffleButton");
const drawer = document.getElementById("drawer");
const drawerToggle = document.getElementById("drawerToggle");

let soundOn = false;
let audioContext;

function makeCard(page, index) {
  const card = document.createElement("a");

  card.className = "nav-card";
  card.href = page.href;
  card.style.setProperty("--rotate", rotations[index % rotations.length]);
  card.style.setProperty("--accent", page.accent);
  card.style.setProperty("--img", `url("${page.image}")`);
  card.dataset.href = page.href;
  card.dataset.title = page.title;

  card.innerHTML = `
    <span class="pin" aria-hidden="true"></span>

    <div class="photo" data-placeholder="${page.placeholder}"></div>

    <div class="label">
      <span>${page.title}</span>
      <small>${page.icon}</small>
    </div>

    <div class="card-back">
      <p>${page.note}<br><br>double tap to flip back</p>
    </div>
  `;

  return card;
}

function renderCards() {
  pages.forEach((page, index) => {
    cardGrid.appendChild(makeCard(page, index));
  });
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");

  window.clearTimeout(showToast.timer);

  showToast.timer = window.setTimeout(() => {
    toast.classList.remove("show");
  }, 1800);
}

function playSound(type = "tap") {
  if (!soundOn) return;

  audioContext ||= new (window.AudioContext || window.webkitAudioContext)();

  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();

  const now = audioContext.currentTime;

  const settings = {
    tap: [520, 0.04, "square"],
    drag: [180, 0.025, "triangle"],
    flip: [760, 0.08, "sawtooth"],
    secret: [980, 0.13, "square"],
  }[type] || [420, 0.05, "square"];

  oscillator.frequency.setValueAtTime(settings[0], now);
  oscillator.type = settings[2];

  gain.gain.setValueAtTime(0.001, now);
  gain.gain.exponentialRampToValueAtTime(0.08, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, now + settings[1]);

  oscillator.connect(gain);
  gain.connect(audioContext.destination);

  oscillator.start(now);
  oscillator.stop(now + settings[1] + 0.02);
}

function makeDraggable(element, options = {}) {
  let pointerStartX = 0;
  let pointerStartY = 0;
  let startDragX = 0;
  let startDragY = 0;
  let currentX = 0;
  let currentY = 0;
  let moved = false;
  let lastTap = 0;
  let suppressClick = false;

  element.addEventListener("pointerdown", (event) => {
    if (event.button !== undefined && event.button !== 0) return;

    pointerStartX = event.clientX;
    pointerStartY = event.clientY;
    startDragX = currentX;
    startDragY = currentY;
    moved = false;

    element.classList.add("dragging");
    element.setPointerCapture(event.pointerId);
  });

  element.addEventListener("pointermove", (event) => {
    if (!element.classList.contains("dragging")) return;

    const deltaX = event.clientX - pointerStartX;
    const deltaY = event.clientY - pointerStartY;

    currentX = startDragX + deltaX;
    currentY = startDragY + deltaY;

    if (Math.hypot(deltaX, deltaY) > 4) {
      moved = true;
    }

    element.style.setProperty("--drag-x", `${currentX}px`);
    element.style.setProperty("--drag-y", `${currentY}px`);

    if (moved && Math.random() > 0.96) {
      playSound("drag");
    }
  });

  element.addEventListener("pointerup", (event) => {
    element.classList.remove("dragging");

    try {
      element.releasePointerCapture(event.pointerId);
    } catch {
      // Nothing dramatic. Browser already released it.
    }

    const now = Date.now();
    const isDoubleTap = now - lastTap < 280;
    lastTap = now;

    if (isDoubleTap && options.flip !== false) {
      event.preventDefault();
      suppressClick = true;
      element.classList.toggle("flipped");
      playSound("flip");
      return;
    }

    if (!moved && element.matches(".nav-card")) {
      event.preventDefault();
      suppressClick = true;
      element.classList.add("popped");
      playSound("tap");

      window.setTimeout(() => {
        window.location.href = element.dataset.href;
      }, 180);
    } else if (!moved) {
      playSound("tap");
    }

    window.setTimeout(() => {
      element.classList.remove("popped");
    }, 320);
  });

  element.addEventListener("click", (event) => {
    if (suppressClick || moved) {
      event.preventDefault();
      suppressClick = false;
    }
  });

  element.addEventListener("pointercancel", () => {
    element.classList.remove("dragging");
  });
}

function enableDraggableElements() {
  document.querySelectorAll(".nav-card").forEach((card) => {
    makeDraggable(card);
  });

  document.querySelectorAll(".sticker").forEach((sticker) => {
    makeDraggable(sticker, { flip: false });

    sticker.addEventListener("click", () => {
      showToast("tiny sticker behavior. very serious technology.");
    });
  });
}

function shuffleBoard() {
  const cards = document.querySelectorAll(".nav-card");

  cards.forEach((card) => {
    const x = Math.round((Math.random() - 0.5) * 26);
    const y = Math.round((Math.random() - 0.5) * 22);
    const r = `${Math.round((Math.random() - 0.5) * 8)}deg`;

    card.style.setProperty("--drag-x", `${x}px`);
    card.style.setProperty("--drag-y", `${y}px`);
    card.style.setProperty("--rotate", r);
    card.classList.add("popped");

    setTimeout(() => {
      card.classList.remove("popped");
    }, 340);
  });

  playSound("flip");
  showToast("board shuffled.");
}

function applyParallax(x, y) {
  document.querySelectorAll(".nav-card").forEach((card, index) => {
    const depth = (index + 1) * 0.8;

    card.style.setProperty("--parallax-x", `${x * depth}px`);
    card.style.setProperty("--parallax-y", `${y * depth}px`);
  });
}

async function toggleSound() {
  soundOn = !soundOn;

  if (soundOn) {
    audioContext ||= new (window.AudioContext || window.webkitAudioContext)();

    if (audioContext.state === "suspended") {
      await audioContext.resume();
    }

    soundButton.textContent = "🔊";
    showToast("sound on. deeply unnecessary. obviously staying.");
    playSound("secret");
  } else {
    soundButton.textContent = "🔇";
    showToast("sound off.");
  }
}

function bindEvents() {
  soundButton.addEventListener("click", toggleSound);

  shuffleButton.addEventListener("click", shuffleBoard);

  drawerToggle.addEventListener("click", () => {
    drawer.classList.toggle("open");
    playSound("flip");
  });

  document.querySelectorAll("[data-secret]").forEach((button) => {
    button.addEventListener("click", () => {
      playSound("secret");
      showToast(button.dataset.secret);
    });
  });

  board.addEventListener("pointermove", (event) => {
    const rect = board.getBoundingClientRect();

    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;

    applyParallax(x * 4, y * 4);
  });

  board.addEventListener("pointerleave", () => {
    applyParallax(0, 0);
  });

  if ("DeviceOrientationEvent" in window) {
    window.addEventListener("deviceorientation", (event) => {
      const gamma = Math.max(-12, Math.min(12, event.gamma || 0));
      const beta = Math.max(-12, Math.min(12, event.beta || 0));

      applyParallax(gamma / 4, beta / 6);
    });
  }
}

renderCards();
enableDraggableElements();
bindEvents();
