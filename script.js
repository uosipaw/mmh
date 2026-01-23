/*
          Scatter layout logic
          --------------------
          We avoid overlap and “even spacing” by using a curated set of
          hand-picked (x,y) percentage positions that never collide.
          On load, we shuffle the positions so each visit feels organic.
        */
(function () {
  const itemsWrap = document.getElementById("items");
  const items = Array.from(itemsWrap.querySelectorAll(".item"));
  const menuBtn = document.getElementById("menuBtn");

  // Safe, non-overlapping anchors inside the padded frame (percentages).
  // Tweak or add more to change the composition.
  const POS = [
    { x: 18, y: 22 },
    { x: 36, y: 18 },
    { x: 68, y: 22 },
    { x: 82, y: 40 },
    { x: 62, y: 62 },
    { x: 40, y: 70 },
    { x: 20, y: 62 },
    { x: 50, y: 44 }, // reserve one for the menu trigger
    { x: 78, y: 78 },
    { x: 24, y: 42 },
  ];

  // Fisher–Yates shuffle for natural randomness
  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // Assign positions
  const shuffled = shuffle(POS.slice());
  items.forEach((el, i) => {
    const p = shuffled[i] || shuffled[shuffled.length - 1];
    el.style.left = p.x + "%";
    el.style.top = p.y + "%";

    // add small, unique delays so floats feel unsynchronized
    el.style.animationDelay = (Math.random() * 2 - 1).toFixed(2) + "s";
    el.style.rotate = (Math.random() * 6 - 3).toFixed(2) + "deg";
  });

  /*
              Gooey menu interactions
              - The nav sits “on” the trigger; we mirror the trigger's position
                so the blobs expand from the same spot even after random placement.
            */
  const gooeyNav = document.getElementById("gooey-nav");
  function syncNavToTrigger() {
    const t = menuBtn.style.left || "50%";
    const l = menuBtn.style.top || "50%";
    gooeyNav.style.left = t;
    gooeyNav.style.top = l;
  }
  syncNavToTrigger();

  const gooeyWrap = document.querySelector(".gooey-wrap");
  function setOpen(open) {
    document.body.classList.toggle("menu-open", open);
    menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    // Manage aria-hidden so screen readers ignore hidden links
    gooeyWrap.setAttribute("aria-hidden", open ? "false" : "true");
  }

  menuBtn.addEventListener("click", () => {
    const willOpen = !document.body.classList.contains("menu-open");
    setOpen(willOpen);
  });

  // Keyboard: Enter/Space toggles menu; Esc closes
  menuBtn.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      menuBtn.click();
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setOpen(false);
  });

  // Close menu when clicking outside
  document.addEventListener("click", (e) => {
    const isTrigger = e.target === menuBtn;
    const isGooey = e.target.closest?.(".gooey-nav");
    if (!isTrigger && !isGooey) setOpen(false);
  });

  // Re-center nav on resize (in case of layout changes)
  window.addEventListener("resize", syncNavToTrigger);
})();
