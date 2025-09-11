/*Search cards by types of pokemon*/
const searchInput = document.getElementById("searchInput");
const cards = document.querySelectorAll(".card");

if (searchInput) {
searchInput.addEventListener("input", () => {
  const value = searchInput.value.toLowerCase();
  cards.forEach(card => {
    const text = card.innerText.toLowerCase();
    card.style.display = text.includes(value) ? "flex" : "none";
  });
});
}


// selects automatic
async function fillSelect(endpoint, selectId, labelKey = "name") {
  try {
    const response = await fetch(`https://pokeapi.co/api/v2/${endpoint}`);
    const data = await response.json();

    const select = document.getElementById(selectId);
    data.results.forEach(item => {
      const option = document.createElement("option");
      option.value = item.name;
      option.textContent = item[labelKey] || item.name;
      select.appendChild(option);
    });
  } catch (error) {
    console.error(`Error cargando ${endpoint}:`, error);
  }
}

// filter automatic
fillSelect("type", "filter-type");            
fillSelect("generation", "filter-generation"); 
fillSelect("pokemon-habitat", "filter-habitat"); 
fillSelect("region", "filter-region");         
fillSelect("pokemon-color", "filter-color");   

console.log(endpoint, data.results);//check
