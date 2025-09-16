/*Search cards by types of pokemon*/
const searchInput = document.getElementById("searchInput");
const cards = document.querySelectorAll(".card");
const typeCards = document.getElementById("type-cards");
const pokemonSection = document.getElementById("pokemon-section");
const pokemonList = document.getElementById("pokemon-list");
const typeTitle = document.getElementById("type-title");
const loadMoreBtn = document.getElementById("load-more");
const backBtn = document.getElementById("back-btn");


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
        <img src="${pokeData.sprites.front_default}" alt="${pokeData.name}">
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
});


pokemonList.addEventListener("click", async (e) => {
  const card = e.target.closest(".pokemon-card");
  if (!card) return;

  const name = card.querySelector("p").textContent;
  await showPokemonDetail(name);
});

async function showPokemonDetail(name) {
  // pokemon details
  pokemonSection.style.display = "none";   
  const detailSection = document.getElementById("pokemon-detail");
  const detailCards = document.getElementById("pokemon-detail-cards");
  const detailTitle = document.getElementById("pokemon-detail-title");

  detailSection.style.display = "block";
  detailTitle.textContent = `Detalles de ${name}`;
  detailCards.innerHTML = "<p>Cargando...</p>";

  try {
    // firs
    const pokeData = await fetch(`${CONFIG.API_URL}pokemon/${name}`).then(res => res.json());

    const speciesData = await fetch(pokeData.species.url).then(res => res.json());
    const evoChainUrl = speciesData.evolution_chain.url;
    const evoData = await fetch(evoChainUrl).then(res => res.json());

    // evolutions whith imgs
      const evolutions = [];
      let evo = evoData.chain;

      do {
        evolutions.push(evo.species.name);
        evo = evo.evolves_to[0];
      } while (evo && evo.hasOwnProperty("evolves_to"));

      // evolutions sprites
      const evolutionSprites = await Promise.all(
        evolutions.map(async (name) => {
          const evoData = await fetch(`${CONFIG.API_URL}pokemon/${name}`).then(res => res.json());
          return {
            name,
            img: evoData.sprites.front_default
          };
        })
      );


  
    const mainCard = `
      <div class="detail-card">
        <h3>Datos principales</h3>
        <img src="${pokeData.sprites.front_default}" alt="${pokeData.name}">
        <p><b>Nombre:</b> ${pokeData.name}</p>
        <p><b>Altura:</b> ${pokeData.height}</p>
        <p><b>Peso:</b> ${pokeData.weight}</p>
        <p><b>Tipos:</b> ${pokeData.types.map(t => t.type.name).join(", ")}</p>
        <div><b>Evoluciones:</b></div>
        <div class="evolution-chain">
          ${evolutionSprites.map(e => `
            <div class="evolution-item">
              <img src="${e.img}" alt="${e.name}">
              <p>${e.name}</p>
            </div>
          `).join(" → ")}
        </div>
      </div>
    `;

  
    const fightCard = `
      <div class="detail-card">
        <h3>Datos de pelea</h3>
        ${pokeData.stats.map(s => `<p><b>${s.stat.name}:</b> ${s.base_stat}</p>`).join("")}
        <p><b>Habilidades:</b> ${pokeData.abilities.map(a => a.ability.name).join(", ")}</p>
      </div>
    `;


    const extraCard = `
      <div class="detail-card">
        <h3>Datos extra</h3>
        <p><b>Experiencia base:</b> ${pokeData.base_experience}</p>
        <p><b>Orden:</b> ${pokeData.order}</p>
        <p><b>Formas:</b> ${pokeData.forms.map(f => f.name).join(", ")}</p>
      </div>
    `;

    
    detailCards.innerHTML = mainCard + fightCard + extraCard;

  } catch (err) {
    detailCards.innerHTML = `<p>Error cargando datos de ${name}</p>`;
    console.error(err);
  }
}

document.getElementById("back-to-list").addEventListener("click", () => {
  document.getElementById("pokemon-detail").style.display = "none";
  pokemonSection.style.display = "block";
});
