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
        1: { gridArea: "1 / 1 / 2 / 2", label: "Past" },
        2: { gridArea: "1 / 2 / 2 / 3", label: "Present" },
        3: { gridArea: "1 / 3 / 2 / 4", label: "Future" },
      },
    },
    "celtic-cross": {
      columns: 4,
      rows: 4,
      numCards: 10,
      positions: {
        1: { gridArea: "2 / 2 / 3 / 3", label: "Present" },
        2: { gridArea: "2 / 3 / 3 / 4", label: "Challenge" },
        3: { gridArea: "1 / 2 / 2 / 3", label: "Past" },
        4: { gridArea: "3 / 2 / 4 / 3", label: "Future" },
        5: { gridArea: "2 / 1 / 3 / 2", label: "Above" },
        6: { gridArea: "2 / 4 / 3 / 5", label: "Below" },
        7: { gridArea: "4 / 3 / 5 / 4", label: "Self" },
        8: { gridArea: "3 / 3 / 4 / 4", label: "Environment" },
        9: { gridArea: "2 / 3 / 3 / 4", zIndex: 1, label: "Hopes/Fears" },
        10: { gridArea: "1 / 3 / 2 / 4", label: "Outcome" },
      },
    },
  };

  let cardElements = [];
  let cachedCardData = null;

  deckIntro.addEventListener("click", () => {
    introOverlay.classList.add("hide");
    setTimeout(() => {
      introOverlay.style.display = "none";
    }, 600); // Wait for fade-out transition
    reshuffle();
  });

  spreadSelect.addEventListener("change", reshuffle);

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
    card.style.width = `${cardSize}px`;
    card.style.height = `${cardSize * 1.4}px`;

    const inner = document.createElement("div");
    inner.classList.add("card-inner");

    const front = document.createElement("div");
    front.classList.add("card-front");
    front.style.backgroundImage = `url('./images/tarot/${cardData.id}.png')`;

    const back = document.createElement("div");
    back.classList.add("card-back");
    back.style.backgroundImage = `url('./images/tarot/back.png')`;

    inner.appendChild(front);
    inner.appendChild(back);
    card.appendChild(inner);

    // Modal logic
    card.addEventListener("click", (e) => {
      // Only open modal if not already open
      if (!document.querySelector(".modal.show")) {
        card.classList.toggle("flipped");
        showModal(cardData);
      }
    });

    return card;
  }

  // Modal logic
  function showModal(cardData) {
    let modal = document.querySelector(".modal");
    if (!modal) {
      // Create modal if not present
      modal = document.createElement("div");
      modal.className = "modal";
      document.body.appendChild(modal);
    }
    modal.innerHTML = `
      <div class="modal-content">
        <span class="close-modal">&times;</span>
        <img src="./images/tarot/${cardData.id}.png" alt="${cardData.name}" />
        <h2>${cardData.name}</h2>
        <p>${cardData.meaning || ""}</p>
      </div>
    `;
    modal.classList.add("show");
    // Close modal logic (close button)
    modal.querySelector(".close-modal").onclick = () => {
      modal.classList.remove("show");
    };
    // Close modal when clicking outside modal-content
    modal.onclick = (e) => {
      if (e.target === modal) {
        modal.classList.remove("show");
      }
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
      if (pos) {
        Object.assign(card.style, pos);
        if (pos.label) {
          const label = document.createElement("div");
          label.className = "card-label";
          label.textContent = pos.label;
          card.appendChild(label);
        }
      }
      deck.appendChild(card);
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
});
