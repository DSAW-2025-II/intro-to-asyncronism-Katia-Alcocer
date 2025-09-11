const searchInput = document.querySelector(".search");
const resultsContainer = document.createElement("div");

// selects automatic
async function fillSelect(endpoint, selectId, labelKey = "name") {
  try {
    const response = await fetch(`${CONFIG.API_URL}${endpoint}`);
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



resultsContainer.classList.add("results-container");
document.querySelector(".main").appendChild(resultsContainer);

let allPokemon = [];

// Loanding pokemones not use imput
searchInput.disabled = true; 

async function fetchAllPokemon() {
  try {
    const response = await fetch(`${CONFIG.API_URL}pokemon?limit=1000`);
    const data = await response.json();
    allPokemon = data.results; 
    searchInput.disabled = false; // use input
  } catch (error) {
    console.error("Error cargando lista de Pokémon:", error);
  }
}


function showResults(value) {
  resultsContainer.innerHTML = ""; // clear previous results

  if (value === "") return;

  const filtered = allPokemon.filter(poke =>
    poke.name.toLowerCase().includes(value.toLowerCase())
  );

  // max 10 results
  filtered.slice(0, 10).forEach(poke => {
    const item = document.createElement("div");
    item.classList.add("result-item");
    item.textContent = poke.name;

    //see img
    const img = document.createElement("img");
    const id = poke.url.split("/").filter(Boolean).pop();
    img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
    img.alt = poke.name;
    item.prepend(img);

    resultsContainer.appendChild(item);
  });
}

// while write
searchInput.addEventListener("input", (e) => {
  const value = e.target.value.trim();
  showResults(value);
});


fetchAllPokemon();


