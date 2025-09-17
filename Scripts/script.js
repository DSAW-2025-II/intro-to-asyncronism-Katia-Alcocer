document.addEventListener("DOMContentLoaded", () => {

/*Search cards by types of pokemon*/
const searchInput = document.getElementById("searchInput");
const cards = document.querySelectorAll(".card");
const typeCards = document.getElementById("type-cards");
const pokemonSection = document.getElementById("pokemon-section");
const pokemonList = document.getElementById("pokemon-list");
const typeTitle = document.getElementById("type-title");
const loadMoreBtn = document.getElementById("load-more");
const backBtn = document.getElementById("back-btn");
// Img "¿Who is that Pokémon??"
const FALLBACK_SPRITE = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png";
const tipoHeader = document.getElementById("tipo-header");

if (searchInput) {
searchInput.addEventListener("input", () => {
  const value = searchInput.value.toLowerCase();
  cards.forEach(card => {
    const text = card.innerText.toLowerCase();
    card.style.display = text.includes(value) ? "flex" : "none";
  });
});
}

let currentPokemons = [];
let currentIndex = 0;

cards.forEach(card => {
  card.addEventListener("click", async () => {
    const type = card.classList[1]; // "fire", "water", etc.
    await loadPokemonByType(type);
  });
});

async function loadPokemonByType(type) {
  typeCards.style.display = "none";       // hide cards
  pokemonSection.style.display = "block"; // see pokemon section
  tipoHeader.style.display = "none"; 
  typeTitle.textContent = `Pokémon tipo ${type}`;

  pokemonList.innerHTML = `<p>Cargando...</p>`;
  currentPokemons = [];
  currentIndex = 0;

  try {
    const response = await fetch(`${CONFIG.API_URL}type/${type}`);
    const data = await response.json();

     if (!data.pokemon.length) {
        pokemonList.innerHTML = `<p>No hay Pokémon registrados para el tipo ${type}</p>`;
        loadMoreBtn.style.display = "none"; // hide button
        return;
        }
    currentPokemons = data.pokemon.map(p => p.pokemon);
    pokemonList.innerHTML = "";
    showMorePokemons();
  } catch (error) {
    pokemonList.innerHTML = `<p>Error al cargar Pokémon de tipo ${type}</p>`;
    console.error(error);
  }
}

async function showMorePokemons() {
  const nextBatch = currentPokemons.slice(currentIndex, currentIndex + 20);

  for (let poke of nextBatch) {
    const pokeData = await fetch(poke.url).then(res => res.json());
    const mainType = pokeData.types[0].type.name;

    pokemonList.innerHTML += `
      <div class="card pokemon-card ${mainType}">
        <img src="${pokeData.sprites.front_default || FALLBACK_SPRITE}" alt="${pokeData.name}">
        <p>${pokeData.name}</p>
      </div>
    `;
  }

  currentIndex += 20;

  // show/hide "see more" button
  if (currentIndex < currentPokemons.length) {
    loadMoreBtn.style.display = "block";
  } else {
    loadMoreBtn.style.display = "none";
  }
}



// Event "see more"
loadMoreBtn.addEventListener("click", showMorePokemons);

// return to the cards
backBtn.addEventListener("click", () => {
  pokemonSection.style.display = "none";
  typeCards.style.display = "grid";
  tipoHeader.style.display = "block"; 
});


pokemonList.addEventListener("click", async (e) => {
  const card = e.target.closest(".pokemon-card");
  if (!card) return;

  const name = card.querySelector("p").textContent;
  await showPokemonDetail(name);
});


document.getElementById("back-to-list").addEventListener("click", () => {
  document.getElementById("pokemon-detail").style.display = "none";
  pokemonSection.style.display = "block";
});




});
