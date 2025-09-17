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
    searchInput.disabled = false; 
  } catch (error) {
    console.error("Error cargando lista de Pokémon:", error);
  }
}


async function showResults(value) {
  resultsContainer.innerHTML = ""; 

  if (value === "") return;

  const filtered = allPokemon.filter(poke =>
    poke.name.toLowerCase().includes(value.toLowerCase())
  );


  for (let poke of filtered.slice(0, 20)) {
    const item = document.createElement("div");
    item.classList.add("card", "pokemon-card");

   
    const pokeData = await fetch(poke.url).then(res => res.json());
    const mainType = pokeData.types[0].type.name;
    item.classList.add(mainType);

   
    item.innerHTML = `
       
        <img src="${pokeData.sprites.front_default || FALLBACK_SPRITE}" alt="${pokeData.name}">
        <p>${pokeData.name}</p>
     
    `;

    resultsContainer.appendChild(item);
  }
}


// while write
searchInput.addEventListener("input", (e) => {
  const value = e.target.value.trim();
  showResults(value);
});


fetchAllPokemon();



let currentFilter = null;   // current filter
let filteredPokemon = [];   // list of pokemons filtered
let visibleCount = 20;      
const loadMoreBtn = document.createElement("button");

// button see more styles
loadMoreBtn.textContent = "Ver más";
loadMoreBtn.style.display = "none";
loadMoreBtn.classList.add("load-more");
document.querySelector(".main").appendChild(loadMoreBtn);

// show the results on screen
function renderPokemonList(reset = false) {
  if (reset) resultsContainer.innerHTML = "";

  const toShow = filteredPokemon.slice(0, visibleCount);
  toShow.forEach(async poke => {
  
   const item = document.createElement("div");
item.classList.add("card", "pokemon-card"); // 👈 mismo estilo

const pokeData = await fetch(poke.url).then(res => res.json());
const mainType = pokeData.types[0].type.name;
item.classList.add(mainType);

item.innerHTML = `
  <img src="${pokeData.sprites.front_default || FALLBACK_SPRITE}" alt="${pokeData.name}">
  <p>${pokeData.name}</p>
`;

resultsContainer.appendChild(item);

  });

  // see more button, if more to show
  loadMoreBtn.style.display = (visibleCount < filteredPokemon.length) ? "block" : "none";
}

// Filters pokemons
async function applyFilter(endpoint, value) {
  if (!value) {
    resultsContainer.innerHTML = "";
    loadMoreBtn.style.display = "none";
    return;
  }

  try {
    const response = await fetch(`${CONFIG.API_URL}${endpoint}/${value}`);
    const data = await response.json();

    // type button
    if (endpoint === "type") {
      filteredPokemon = data.pokemon.map(p => p.pokemon);
    }
    else if (endpoint === "generation" || endpoint === "pokemon-habitat" || endpoint === "pokemon-color") {
        filteredPokemon = data.pokemon_species.map(p => {
            // id because i need the img
            const urlParts = p.url.split("/").filter(Boolean);
            const id = urlParts[urlParts.length - 1];
            return {
            name: p.name,
            url: `${CONFIG.API_URL}pokemon/${id}/`
            };
        });
    }
    // generation
    else if (endpoint === "generation") {
      filteredPokemon = data.pokemon_species.map(p => ({
        name: p.name,
        url: `${CONFIG.API_URL}pokemon/${p.name}`
      }));
    }
    // habitat
    else if (endpoint === "pokemon-habitat") {
      filteredPokemon = data.pokemon_species.map(p => ({
        name: p.name,
        url: `${CONFIG.API_URL}pokemon/${p.name}`
      }));
    }
    // color
    else if (endpoint === "pokemon-color") {
      filteredPokemon = data.pokemon_species.map(p => ({
        name: p.name,
        url: `${CONFIG.API_URL}pokemon/${p.name}`
      }));
    }

    visibleCount = 20; // reiniciar cantidad 
    renderPokemonList(true);

  } catch (error) {
    console.error("Error aplicando filtro:", error);
  }
}

document.getElementById("filter-type").addEventListener("change", e => {
  applyFilter("type", e.target.value);
});

document.getElementById("filter-generation").addEventListener("change", e => {
  applyFilter("generation", e.target.value);
});

document.getElementById("filter-habitat").addEventListener("change", e => {
  applyFilter("pokemon-habitat", e.target.value);
});

document.getElementById("filter-color").addEventListener("change", e => {
  applyFilter("pokemon-color", e.target.value);
});

document.getElementById("filter-region").addEventListener("change", e => {
  applyFilter("region", e.target.value);
});

// see more button
loadMoreBtn.addEventListener("click", () => {
  visibleCount += 20;
  renderPokemonList(true);
});
