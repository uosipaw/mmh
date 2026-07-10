const hangers = [...document.querySelectorAll(".hanger")];
const reducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

const pointer = {
  x: window.innerWidth / 2,
  lastX: window.innerWidth / 2,
  velocityX: 0,
  active: false,
};

let lastScrollY = window.scrollY;
let scrollVelocity = 0;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

const pieces = hangers.map((hanger, index) => {
  const arm = hanger.querySelector(".swing-arm");
  const isCloud = hanger.classList.contains("cloud");
  const isLetter = hanger.classList.contains("letter");
  const isCharm = hanger.classList.contains("charm");

  let amplitude;
  let speed;

  if (isCloud) {
    amplitude = randomBetween(0.35, 0.9);
    speed = randomBetween(0.00074, 0.00105);
  } else if (isLetter) {
    amplitude = randomBetween(0.75, 1.65);
    speed = randomBetween(0.00105, 0.00145);
  } else if (isCharm) {
    amplitude = randomBetween(1.0, 2.0);
    speed = randomBetween(0.0009, 0.00125);
  } else {
    amplitude = randomBetween(0.7, 1.4);
    speed = randomBetween(0.00095, 0.00135);
  }

  return {
    hanger,
    arm,
    isCloud,
    isLetter,
    isCharm,
    amplitude,
    speed,
    phase: Math.random() * Math.PI * 2,
    pointerPush: 0,
    scrollPush: 0,
    settlePush: randomBetween(-0.35, 0.35),
    drift: index % 2 === 0 ? -1 : 1,
  };
});

function triggerStringWiggle(hanger) {
  window.clearTimeout(hanger.stringWiggleTimer);
  hanger.classList.remove("string-wiggle");
  void hanger.offsetWidth;
  hanger.classList.add("string-wiggle");
  hanger.stringWiggleTimer = window.setTimeout(() => {
    hanger.classList.remove("string-wiggle");
  }, 700);
}

function maybeWiggleStringAt(clientX, clientY, force = false) {
  const now = performance.now();

  pieces.forEach((piece) => {
    if (!force && piece.lastStringWiggle && now - piece.lastStringWiggle < 420) {
      return;
    }

    const strings = piece.hanger.querySelectorAll(
      ".single-string, .double-string span",
    );

    const isNearString = [...strings].some((string) => {
      const rect = string.getBoundingClientRect();
      const xPadding = force ? 22 : 14;

      return (
        clientX >= rect.left - xPadding &&
        clientX <= rect.right + xPadding &&
        clientY >= rect.top &&
        clientY <= rect.bottom
      );
    });

    if (!isNearString) return;

    piece.lastStringWiggle = now;
    triggerStringWiggle(piece.hanger);
  });
}

const dropdownSun = document.getElementById("dropdownSun");
const openingMobile = document.getElementById("openingMobile");
const curtainStage = document.getElementById("curtainStage");
const curtainOpenButton = document.getElementById("curtainOpenButton");

if (curtainStage && curtainOpenButton) {
  curtainOpenButton.addEventListener("click", () => {
    curtainStage.classList.add("is-open");
    curtainOpenButton.disabled = true;

    window.setTimeout(() => {
      openingMobile?.classList.add("mobile-ready");
    }, 3400);
  });
}

if (dropdownSun) {
  const sunImage = dropdownSun.querySelector("img");
  let resetSunTimer;

  dropdownSun.addEventListener("click", () => {
    if (!sunImage) return;

    window.clearTimeout(resetSunTimer);
    sunImage.src = sunImage.dataset.angrySrc;
    dropdownSun.classList.add("is-angry");
    dropdownSun.setAttribute("aria-pressed", "true");
    dropdownSun.setAttribute("aria-label", "The sun is angry");

    resetSunTimer = window.setTimeout(() => {
      sunImage.src = sunImage.dataset.smileSrc;
      dropdownSun.classList.remove("is-angry");
      dropdownSun.setAttribute("aria-pressed", "false");
      dropdownSun.setAttribute("aria-label", "Make the sun angry");
    }, 380);
  });
}

function handlePointerMove(event) {
  pointer.lastX = pointer.x;
  pointer.x = event.clientX;
  pointer.velocityX = pointer.x - pointer.lastX;
  pointer.active = true;
  maybeWiggleStringAt(event.clientX, event.clientY);
}

function handleTouchMove(event) {
  const touch = event.touches[0];

  if (!touch) return;

  pointer.lastX = pointer.x;
  pointer.x = touch.clientX;
  pointer.velocityX = pointer.x - pointer.lastX;
  pointer.active = true;
  maybeWiggleStringAt(touch.clientX, touch.clientY);
}

function handlePointerLeave() {
  pointer.active = false;
}

window.addEventListener("pointermove", handlePointerMove, { passive: true });
window.addEventListener("touchmove", handleTouchMove, { passive: true });
window.addEventListener("mouseleave", handlePointerLeave, { passive: true });
window.addEventListener(
  "pointerdown",
  (event) => {
    maybeWiggleStringAt(event.clientX, event.clientY, true);
  },
  { passive: true },
);

window.addEventListener(
  "scroll",
  () => {
    scrollVelocity = window.scrollY - lastScrollY;
    lastScrollY = window.scrollY;
  },
  { passive: true },
);

window.addEventListener(
  "resize",
  () => {
    pointer.x = window.innerWidth / 2;
    pointer.lastX = pointer.x;
  },
  { passive: true },
);

function animate(time) {
  if (reducedMotion) return;

  const viewportCenter = window.innerWidth / 2;

  pieces.forEach((piece) => {
    const rect = piece.hanger.getBoundingClientRect();
    const itemCenter = rect.left + rect.width / 2;

    const distanceFromPointer = Math.abs(pointer.x - itemCenter);
    const pointerRange = piece.isCloud ? 420 : 320;
    const proximity = clamp(1 - distanceFromPointer / pointerRange, 0, 1);

    const distanceFromViewportCenter =
      viewportCenter === 0 ? 0 : (itemCenter - viewportCenter) / viewportCenter;

    const naturalSwing =
      Math.sin(time * piece.speed + piece.phase) * piece.amplitude;

    const pointerForce = pointer.active
      ? clamp(pointer.velocityX * 0.014 * proximity, -2.4, 2.4)
      : 0;

    const scrollForce = clamp(scrollVelocity * 0.01, -1.7, 1.7);

    const responsiveLean =
      distanceFromViewportCenter * (piece.isCloud ? 0.28 : 0.48) * piece.drift;

    piece.pointerPush += (pointerForce - piece.pointerPush) * 0.06;
    piece.scrollPush += (scrollForce - piece.scrollPush) * 0.04;

    const angle =
      naturalSwing +
      piece.pointerPush +
      piece.scrollPush +
      responsiveLean +
      piece.settlePush;

    piece.arm.style.transform = `rotate(${angle.toFixed(3)}deg)`;
  });

  pointer.velocityX *= 0.88;
  scrollVelocity *= 0.9;

  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
