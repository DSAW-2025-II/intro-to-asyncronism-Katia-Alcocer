/*Search cards by types of pokemon*/
const searchInput = document.getElementById("searchInput");
const cards = document.querySelectorAll(".card");

searchInput.addEventListener("input", () => {
  const value = searchInput.value.toLowerCase();
  cards.forEach(card => {
    const text = card.innerText.toLowerCase();
    card.style.display = text.includes(value) ? "flex" : "none";
  });
});

