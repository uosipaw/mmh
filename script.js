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
    amplitude = randomBetween(0.8, 1.8);
    speed = randomBetween(0.00042, 0.00068);
  } else if (isLetter) {
    amplitude = randomBetween(1.6, 3.6);
    speed = randomBetween(0.00068, 0.00105);
  } else if (isCharm) {
    amplitude = randomBetween(2.2, 4.4);
    speed = randomBetween(0.00058, 0.00088);
  } else {
    amplitude = randomBetween(1.5, 3);
    speed = randomBetween(0.0005, 0.0009);
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
}

function handleTouchMove(event) {
  const touch = event.touches[0];

  if (!touch) return;

  pointer.lastX = pointer.x;
  pointer.x = touch.clientX;
  pointer.velocityX = pointer.x - pointer.lastX;
  pointer.active = true;
}

function handlePointerLeave() {
  pointer.active = false;
}

window.addEventListener("pointermove", handlePointerMove, { passive: true });
window.addEventListener("touchmove", handleTouchMove, { passive: true });
window.addEventListener("mouseleave", handlePointerLeave, { passive: true });

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
      ? clamp(pointer.velocityX * 0.026 * proximity, -4.5, 4.5)
      : 0;

    const scrollForce = clamp(scrollVelocity * 0.018, -3.2, 3.2);

    const responsiveLean =
      distanceFromViewportCenter * (piece.isCloud ? 0.5 : 0.9) * piece.drift;

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
