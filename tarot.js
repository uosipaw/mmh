document.addEventListener("DOMContentLoaded", () => {
  const deck = document.getElementById("deck");
  const spreadSelect = document.getElementById("spreadSelect");
  const introOverlay = document.getElementById("introOverlay");
  const deckIntro = document.querySelector(".deck-intro");

  const spreadLayouts = {
    "three-card": {
      columns: 3,
      rows: 1,
      numCards: 3,
      positions: {
        1: { gridArea: "1 / 1 / 2 / 2", label: "Past", rotate: "0deg" },
        2: { gridArea: "1 / 2 / 2 / 3", label: "Present", rotate: "0deg" },
        3: { gridArea: "1 / 3 / 2 / 4", label: "Future", rotate: "0deg" },
      },
    },
    "celtic-cross": {
      columns: 4,
      rows: 4,
      numCards: 10,
      positions: {
        1: { gridArea: "2 / 2 / 3 / 3", label: "Present", rotate: "0deg" },
        2: {
          gridArea: "2 / 2 / 3 / 3",
          label: "Challenge",
          rotate: "90deg",
          zIndex: 1,
        },
        3: { gridArea: "1 / 2 / 2 / 3", label: "Past", rotate: "0deg" },
        4: { gridArea: "3 / 2 / 4 / 3", label: "Future", rotate: "0deg" },
        5: { gridArea: "2 / 1 / 3 / 2", label: "Above", rotate: "0deg" },
        6: { gridArea: "2 / 4 / 3 / 5", label: "Below", rotate: "0deg" },
        7: { gridArea: "4 / 3 / 5 / 4", label: "Self", rotate: "0deg" },
        8: { gridArea: "3 / 3 / 4 / 4", label: "Environment", rotate: "0deg" },
        9: {
          gridArea: "2 / 3 / 3 / 4",
          zIndex: 1,
          label: "Hopes/Fears",
          rotate: "0deg",
        },
        10: { gridArea: "1 / 3 / 2 / 4", label: "Outcome", rotate: "0deg" },
      },
    },
  };

  let cardElements = [];
  let cachedCardData = null;
  let lastFocusedElement = null;

  // Spread descriptions
  const spreadDescriptions = {
    "three-card":
      "Three Card Spread: Past - Present - Future, You - Your Path - Your Potential, You - Relationship - Partner, Situation - Action - Outcome, Idea - Process - Aspiration, Mind - Body - Spirit, Stop - Start - Continue, Problem - Cause - Solution, Opportunity - Obstacle - Potential",

    "celtic-cross":
      "Celtic Cross: A 10-card spread for deep insight into your situation, challenges, and outcomes.",
    guidance:
      "Guidance Spread: Receive advice and direction for your current path.",
    "ancestral-connection":
      "Ancestral Connection: Explore messages and wisdom from your ancestors.",
    "two-options":
      "Two Options: Compare two choices or paths to help make a decision.",
  };

  const updateSpreadDescription = () => {
    const val = spreadSelect.value;
    const desc = spreadDescriptions[val] || "";
    document.getElementById("spreadDescription").textContent = desc;
  };

  deckIntro.addEventListener("click", () => {
    introOverlay.classList.add("hide");
    setTimeout(() => {
      if (introOverlay.parentNode) {
        introOverlay.parentNode.removeChild(introOverlay);
      }
    }, 600); // Wait for fade-out transition
    reshuffle();
  });
  function calculateCardSize(layout, deckWidth, deckHeight) {
    const spreadLayout = spreadLayouts[layout];
    const columns = spreadLayout.columns;
    const rows = spreadLayout.rows;
    const horizontal = (deckWidth / columns) * 0.98;
    const vertical = (deckHeight / rows) * 0.98;
    return Math.min(horizontal, vertical);
  }

  function createCardElement(cardData, cardSize) {
    const card = document.createElement("div");
    card.classList.add("card");
    card.setAttribute("tabindex", "0");
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", cardData.name);
    card.style.width = `${cardSize}px`;
    card.style.height = `${cardSize * 1.4}px`;

    const inner = document.createElement("div");
    inner.classList.add("card-inner");

    const front = document.createElement("div");
    front.classList.add("card-front");
    front.style.backgroundImage = `url('./images/tarot/${cardData.id}.png')`;
    front.style.display = "block";

    const back = document.createElement("div");
    back.classList.add("card-back");
    back.style.backgroundImage = `url('./images/tarot/back.png')`;
    back.style.display = "block";

    inner.appendChild(front);
    inner.appendChild(back);
    card.appendChild(inner);

    // Only show back until click or keyboard, then flip and show modal
    function flipAndShow() {
      if (!card.classList.contains("flipped")) {
        card.classList.add("flipped");
        showModal(cardData);
      }
    }
    card.addEventListener("click", flipAndShow);
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        flipAndShow();
      }
    });

    return card;
  }

  // Modal logic
  function showModal(cardData) {
    // Overlay logic
    let overlay = document.querySelector(".modal-overlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.className = "modal-overlay";
      document.body.appendChild(overlay);
    }
    overlay.classList.add("show");
    document.body.style.overflow = "hidden";
    document.body.classList.add("modal-bg-blur");

    // Create modal if not present
    let modal = document.querySelector(".modal");
    if (!modal) {
      modal = document.createElement("div");
      modal.className = "modal";
      modal.setAttribute("role", "dialog");
      modal.setAttribute("aria-modal", "true");
      modal.setAttribute("tabindex", "-1");
      document.body.appendChild(modal);
    }
    modal.innerHTML = `
      <div class="modal-content" tabindex="0">
        <span class="close-modal" tabindex="0" aria-label="Close card details">&times;</span>
        <img src="./images/tarot/${cardData.id}.png" alt="${cardData.name}" />
        <h2 id="modalCardTitle">${cardData.name}</h2>
        <p id="modalCardDescription">${cardData.meaning || ""}</p>
      </div>
    `;
    modal.classList.add("show");
    // Focus trap logic
    const focusableSelectors =
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const focusableEls = modal.querySelectorAll(focusableSelectors);
    const firstFocusable = focusableEls[0];
    const lastFocusable = focusableEls[focusableEls.length - 1];
    lastFocusedElement = document.activeElement;
    if (firstFocusable) firstFocusable.focus();

    function trapFocus(e) {
      if (e.key !== "Tab") return;
      if (focusableEls.length === 0) return;
      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable.focus();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable.focus();
        }
      }
    }

    // Remove modal/overlay and restore scroll
    function closeModal() {
      modal.classList.remove("show");
      overlay.classList.remove("show");
      document.body.style.overflow = "";
      document.body.classList.remove("modal-bg-blur");
      document.removeEventListener("keydown", escListener);
      document.removeEventListener("keydown", trapFocus);
      if (lastFocusedElement) lastFocusedElement.focus();
    }
    // ESC key closes modal
    function escListener(e) {
      if (e.key === "Escape") closeModal();
    }
    document.addEventListener("keydown", escListener);
    document.addEventListener("keydown", trapFocus);

    // Close modal logic (close button)
    const closeBtn = modal.querySelector(".close-modal");
    closeBtn.onclick = closeModal;
    closeBtn.onkeydown = (e) => {
      if (e.key === "Enter" || e.key === " ") closeModal();
    };
    // Close modal when clicking outside modal-content
    overlay.onclick = closeModal;
    modal.onclick = (e) => {
      if (e.target === modal) closeModal();
    };
  }

  function createCards(cards) {
    const layout = spreadSelect.value;
    const spreadLayout = spreadLayouts[layout];
    if (!spreadLayout) return;

    const cardSize = calculateCardSize(
      layout,
      deck.offsetWidth,
      deck.offsetHeight
    );
    const selectedCards = cards.slice(0, spreadLayout.numCards);

    deck.innerHTML = "";
    cardElements = [];

    deck.style.gridTemplateColumns = `repeat(${spreadLayout.columns}, 1fr)`;
    deck.style.gridTemplateRows = `repeat(${spreadLayout.rows}, 1fr)`;

    selectedCards.forEach((cardData, i) => {
      const card = createCardElement(cardData, cardSize);
      const pos = spreadLayout.positions[i + 1];
      // Create a wrapper for card and label
      const cardWrapper = document.createElement("div");
      cardWrapper.style.display = "flex";
      cardWrapper.style.flexDirection = "column";
      cardWrapper.style.alignItems = "center";
      cardWrapper.style.justifyContent = "flex-start";
      cardWrapper.appendChild(card);
      if (pos && pos.label) {
        const label = document.createElement("div");
        label.className = "card-label";
        label.textContent = pos.label;
        label.style.position = "static";
        label.style.transform = "none";
        label.style.marginTop = "6px";
        label.style.textAlign = "center";
        label.style.width = "100%";
        cardWrapper.appendChild(label);
      }
      deck.appendChild(cardWrapper);
      cardElements.push(card);
    });
  }

  function reshuffle() {
    if (cachedCardData) {
      const shuffled = cachedCardData.cards.sort(() => Math.random() - 0.5);
      createCards(shuffled);
    } else {
      fetch("./tarot-cards.json")
        .then((res) => res.json())
        .then((data) => {
          cachedCardData = data;
          reshuffle();
        })
        .catch((err) => console.error("Error loading cards:", err));
    }
  }

  introOverlay.style.display = "flex";
  // Set initial description
  updateSpreadDescription();
});
