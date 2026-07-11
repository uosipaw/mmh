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
let paintScrollStarted = window.scrollY > 8;
const openingRevealDelay = 2900;
const openingUnlockDelay = 4700;

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

  if (curtainOpenButton && !curtainOpenButton.disabled) {
    const buttonString = curtainOpenButton.querySelector(".curtain-button-string");

    if (buttonString) {
      const rect = buttonString.getBoundingClientRect();
      const xPadding = force ? 22 : 14;
      const canWiggleButtonString =
        force ||
        !curtainOpenButton.lastStringWiggle ||
        now - curtainOpenButton.lastStringWiggle >= 420;
      const isNearButtonString =
        clientX >= rect.left - xPadding &&
        clientX <= rect.right + xPadding &&
        clientY >= rect.top &&
        clientY <= rect.bottom;

      if (canWiggleButtonString && isNearButtonString) {
        curtainOpenButton.lastStringWiggle = now;
        triggerStringWiggle(curtainOpenButton);
      }
    }
  }

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
const dontTouchCallout = document.getElementById("dontTouchCallout");
const openingMobile = document.getElementById("openingMobile");
const curtainStage = document.getElementById("curtainStage");
const curtainOpenButton = document.getElementById("curtainOpenButton");
const scrollBannerDivider = document.getElementById("scrollBannerDivider");
const landingLinks = [...document.querySelectorAll(".landing-link")];
const paintSplotches = [...document.querySelectorAll(".paint-splotch")];
let openingUnlockTimer;

function releaseOpeningScrollLock() {
  document.body.classList.remove("opening-scroll-locked");
  window.clearTimeout(openingUnlockTimer);
}

if (curtainStage && curtainOpenButton && !reducedMotion && window.scrollY < 8) {
  document.body.classList.add("opening-scroll-locked");
  openingUnlockTimer = window.setTimeout(releaseOpeningScrollLock, 8000);
}

if (curtainStage && curtainOpenButton) {
  curtainOpenButton.addEventListener("click", () => {
    curtainStage.classList.add("is-open");
    curtainOpenButton.disabled = true;

    window.setTimeout(() => {
      openingMobile?.classList.add("mobile-ready");
    }, openingRevealDelay);

    window.setTimeout(() => {
      releaseOpeningScrollLock();
    }, openingUnlockDelay);
  });
}

if (dropdownSun) {
  const sunImage = dropdownSun.querySelector("img");
  let resetSunTimer;
  let dontTouchTimer;
  let sunTapCount = 0;

  dropdownSun.addEventListener("click", () => {
    if (!sunImage) return;

    sunTapCount += 1;
    window.clearTimeout(resetSunTimer);
    window.clearTimeout(dontTouchTimer);
    sunImage.src = sunImage.dataset.angrySrc;
    dropdownSun.classList.add("is-angry");
    dropdownSun.setAttribute("aria-pressed", "true");
    dropdownSun.setAttribute("aria-label", "The sun is angry");

    if (dontTouchCallout && sunTapCount >= 2) {
      dontTouchCallout.classList.remove("is-showing");
      void dontTouchCallout.offsetWidth;
      dontTouchCallout.classList.add("is-showing");
      dontTouchTimer = window.setTimeout(() => {
        dontTouchCallout.classList.remove("is-showing");
      }, 1800);
    }

    resetSunTimer = window.setTimeout(() => {
      sunImage.src = sunImage.dataset.smileSrc;
      dropdownSun.classList.remove("is-angry");
      dropdownSun.setAttribute("aria-pressed", "false");
      dropdownSun.setAttribute("aria-label", "Make the sun angry");
    }, 380);
  });
}

if (landingLinks.length) {
  landingLinks.forEach((link) => {
    if (!link.classList.contains("is-placeholder")) return;

    link.addEventListener("click", (event) => {
      event.preventDefault();
    });
  });

  if ("IntersectionObserver" in window && !reducedMotion) {
    const linkObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add("is-visible");
          linkObserver.unobserve(entry.target);
        });
      },
      {
        rootMargin: "0px 0px -12% 0px",
        threshold: 0.18,
      },
    );

    landingLinks.forEach((link, index) => {
      link.style.transitionDelay = `${(index % 3) * 90}ms`;
      linkObserver.observe(link);
    });
  } else {
    landingLinks.forEach((link) => link.classList.add("is-visible"));
  }
}

function updatePaintSplotches() {
  if (!paintSplotches.length || reducedMotion) return;

  if (!paintScrollStarted) {
    paintSplotches.forEach((splotch) => {
      splotch.style.opacity = "0";
      splotch.style.setProperty("--splotch-offset-x", "0px");
      splotch.style.setProperty("--splotch-offset-y", "0px");
      splotch.style.setProperty("--splotch-scale", "0.18");
      splotch.style.setProperty("--droplet-scale", "0.25");
      splotch.style.setProperty("--droplet-opacity", "0");
    });
    return;
  }

  const viewportHeight = window.innerHeight || 1;

  paintSplotches.forEach((splotch) => {
    const rect = splotch.getBoundingClientRect();
    const rawReveal = clamp(
      1 - Math.abs(rect.top + rect.height * 0.35 - viewportHeight * 0.62) / viewportHeight,
      0,
      1,
    );
    const reveal = rawReveal * rawReveal * (3 - 2 * rawReveal);
    const throwX = Number.parseFloat(getComputedStyle(splotch).getPropertyValue("--throw-x")) || 0;
    const throwY = Number.parseFloat(getComputedStyle(splotch).getPropertyValue("--throw-y")) || 0;
    const travel = 1 - reveal;
    const opacity = rawReveal > 0.02 ? Math.min(rawReveal * 1.35, 0.9) : 0;
    const scale = 0.18 + reveal * 0.9;
    const dropletScale = 0.25 + reveal * 0.9;
    const dropletOpacity = Math.min(reveal * 1.45, 0.86);

    splotch.style.opacity = opacity.toFixed(3);
    splotch.style.setProperty("--splotch-offset-x", `${(throwX * travel).toFixed(1)}px`);
    splotch.style.setProperty("--splotch-offset-y", `${(throwY * travel).toFixed(1)}px`);
    splotch.style.setProperty("--splotch-scale", scale.toFixed(3));
    splotch.style.setProperty("--droplet-scale", dropletScale.toFixed(3));
    splotch.style.setProperty("--droplet-opacity", dropletOpacity.toFixed(3));
  });
}

if (paintSplotches.length && !reducedMotion && paintScrollStarted) {
  updatePaintSplotches();
}

function updateScrollBanner() {
  if (!scrollBannerDivider) return;

  if (reducedMotion) {
    scrollBannerDivider.style.setProperty("--unroll-progress", "1");
    scrollBannerDivider.style.setProperty("--banner-width", "100%");
    scrollBannerDivider.style.setProperty("--banner-render-width", `${Math.min(window.innerWidth, 980).toFixed(1)}px`);
    scrollBannerDivider.style.setProperty("--banner-left", `${((window.innerWidth - Math.min(window.innerWidth, 980)) / 2).toFixed(1)}px`);
    scrollBannerDivider.style.setProperty("--banner-right", `${((window.innerWidth + Math.min(window.innerWidth, 980)) / 2).toFixed(1)}px`);
    scrollBannerDivider.style.setProperty("--banner-link-opacity", "1");
    scrollBannerDivider.style.setProperty("--banner-link-lift", "0px");
    scrollBannerDivider.style.setProperty("--roller-opacity", "1");
    scrollBannerDivider.style.setProperty("--roller-rotation", "0deg");
    scrollBannerDivider.classList.add("is-ready");
    return;
  }

  const viewportHeight = window.innerHeight || 1;
  const rect = scrollBannerDivider.getBoundingClientRect();
  const start = viewportHeight * 0.96;
  const end = viewportHeight * 0.22;
  const progress = clamp((start - rect.top) / (start - end), 0, 1);
  const fullWidth = Math.min(window.innerWidth, 980);
  const minWidth = Math.max(34, Math.min(window.innerWidth * 0.08, 84));
  const renderWidth = minWidth + (fullWidth - minWidth) * progress;
  const bannerLeft = (window.innerWidth - fullWidth) / 2;
  const bannerRight = bannerLeft + renderWidth;
  const linkOpacity = clamp((progress - 0.48) * 3, 0, 1);
  const linkLift = (1 - progress) * 12;
  const rollerOpacity = clamp(progress * 1.5, 0, 1);
  const rollerRotation = progress * 540;

  scrollBannerDivider.style.setProperty("--unroll-progress", progress.toFixed(3));
  scrollBannerDivider.style.setProperty("--banner-width", `${renderWidth.toFixed(1)}px`);
  scrollBannerDivider.style.setProperty("--banner-render-width", `${renderWidth.toFixed(1)}px`);
  scrollBannerDivider.style.setProperty("--banner-left", `${bannerLeft.toFixed(1)}px`);
  scrollBannerDivider.style.setProperty("--banner-right", `${bannerRight.toFixed(1)}px`);
  scrollBannerDivider.style.setProperty("--banner-link-opacity", linkOpacity.toFixed(3));
  scrollBannerDivider.style.setProperty("--banner-link-lift", `${linkLift.toFixed(1)}px`);
  scrollBannerDivider.style.setProperty("--roller-opacity", rollerOpacity.toFixed(3));
  scrollBannerDivider.style.setProperty("--roller-rotation", `${rollerRotation.toFixed(1)}deg`);
  scrollBannerDivider.classList.toggle("is-ready", progress > 0.86);
}

updateScrollBanner();

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
    if (window.scrollY > 8) {
      paintScrollStarted = true;
    }
    updatePaintSplotches();
    updateScrollBanner();
  },
  { passive: true },
);

window.addEventListener(
  "resize",
  () => {
    pointer.x = window.innerWidth / 2;
    pointer.lastX = pointer.x;
    updatePaintSplotches();
    updateScrollBanner();
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
