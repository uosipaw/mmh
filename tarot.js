document.addEventListener("DOMContentLoaded", () => {
  const gridContainer = document.getElementById("gridContainer");
  const columnContainer = document.getElementById("columnContainer");
  const searchInput = document.getElementById("searchInput");
  const searchResultsDiv = document.getElementById("searchResults");

  // --- UI Initialization ---
  function initUI() {
    initSearch();
  }

  // --- Search Functionality ---
  function initSearch() {
    if (!searchInput || !searchResultsDiv) {
      console.error("Search elements missing.");
      return;
    }

    searchInput.addEventListener("input", () => {
      const searchTerm = searchInput.value.toLowerCase();
      const filteredCards = []; // No tarot data available
      displaySearchResults(filteredCards);
    });
  }

  function displaySearchResults(results) {
    searchResultsDiv.innerHTML = "";
    if (results.length > 0 && searchInput.value.trim() !== "") {
      searchResultsDiv.classList.add("show");
      results.forEach((card) => {
        const resultItem = createSearchResultItem(card);
        searchResultsDiv.appendChild(resultItem);
      });
    } else {
      searchResultsDiv.classList.remove("show");
    }
  }

  function createSearchResultItem(card) {
    const resultItem = document.createElement("div");
    resultItem.classList.add("search-result-item");
    resultItem.innerHTML = `<img src="/images/tarot/${card.id}.png" alt="${card.name}"> ${card.name}`;
    resultItem.addEventListener("click", () => {
      searchInput.value = card.name;
      searchResultsDiv.classList.remove("show");
      displayCardDescription(card);
    });
    return resultItem;
  }

  function displayCardDescription(card) {
    const cardDisplayArea = document.querySelector(
      ".left-container .container-content"
    );
    if (!cardDisplayArea) {
      console.error(
        "Left container content area not found for card description."
      );
      return;
    }
    cardDisplayArea.innerHTML = `
            <h3>${card.name}</h3>
            <img src="/images/tarot/${card.id}.png" alt="${
      card.name
    }" style="max-width: 100px; margin-bottom: 10px;">
            <p>${
              card.description.upright ||
              card.description.reversed ||
              "No description available"
            }</p>
        `;
  }

  // --- Initialize ---
  initUI();
});
