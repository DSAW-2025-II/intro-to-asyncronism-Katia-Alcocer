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
    // pokemon data
    const pokeData = await fetch(`${CONFIG.API_URL}pokemon/${name}`).then(res => res.json());
    const speciesData = await fetch(pokeData.species.url).then(res => res.json());

    // evolutions
    let evoData = null;
    if (speciesData.evolution_chain && speciesData.evolution_chain.url) {
      try {
        const evoRes = await fetch(speciesData.evolution_chain.url);
        evoData = evoRes.ok ? await evoRes.json() : null;
      } catch (e) {
        console.warn("No se pudo cargar evolution_chain:", e);
        evoData = null;
      }
    }

    let evolutionHtml = "<p>Este Pokémon no tiene evoluciones.</p>";
    if (evoData && evoData.chain) {
      evolutionHtml = await renderEvolutionTree(evoData.chain);
    }

    const mainCard = `
      <div class="detail-card">
        <h3>Datos principales</h3>
        <img src="${pokeData.sprites.front_default || FALLBACK_SPRITE}" alt="${pokeData.name}">
        <p><b>Nombre:</b> ${pokeData.name}</p>
        <p><b>Altura:</b> ${pokeData.height}</p>
        <p><b>Peso:</b> ${pokeData.weight}</p>
        <p><b>Tipos:</b> ${pokeData.types.map(t => t.type.name).join(", ")}</p>
        <div><b>Evoluciones:</b></div>
        <div class="evolution-chain evolution-tree">
          ${evolutionHtml}
        </div>
      </div>
    `;

    const fightCard = `
      <div class="detail-card">
        <h3>Datos de pelea</h3>
       ${pokeData.stats.map(s => `
          <div class="stat-bar">
            <span class="stat-name">${s.stat.name}</span>
            <div class="bar-container">
              <div class="bar-fill" data-value="${s.base_stat > 150 ? 150 : s.base_stat}"
              style="background:${getStatColor(s.stat.name)}">  
              <span class="bar-value">${s.base_stat}</span>
              </div>
            </div>
          </div>
        `).join("")}


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

    const bars = document.querySelectorAll(".bar-fill");
    bars.forEach(bar => {
      const value = bar.getAttribute("data-value");
      setTimeout(() => {
        bar.style.width = value + "px";
      }, 200); 
    });

    bars.forEach(bar => {
      const value = parseInt(bar.getAttribute("data-value"));
      let current = 0;
      const text = bar.querySelector(".bar-value");

      const interval = setInterval(() => {
        if (current >= value) {
          clearInterval(interval);
        } else {
          current++;
          text.textContent = current;
        }
      }, 15);
    });


  } catch (err) {
    detailCards.innerHTML = `<p>Error cargando datos de ${name}</p>`;
    console.error(err);
  }
}

// Evee evolutions
async function renderEvolutionTree(chain) {
  let img = "";
  try {
    const resp = await fetch(`${CONFIG.API_URL}pokemon/${chain.species.name}`);
    if (resp.ok) {
      const pd = await resp.json();
      img = pd.sprites.front_default 
        || (pd.sprites.other?.['official-artwork']?.front_default) 
        || FALLBACK_SPRITE;
    }
  } catch (err) {
    console.warn("No se pudo obtener sprite de", chain.species.name, err);
  }

  const nodeHtml = `
    <div class="evolution-node">
      ${img ? `<img src="${img}" alt="${chain.species.name}">` : ""}
      <p>${chain.species.name}</p>
    </div>
  `;

  if (chain.evolves_to && chain.evolves_to.length > 0) {
    const childrenHtml = await Promise.all(
      chain.evolves_to.map(evo => renderEvolutionTree(evo))
    );
    return `
      <div class="evolution-branch">
        ${nodeHtml}
        <div class="evolution-children">
          ${childrenHtml.join("")}
        </div>
      </div>
    `;
  } else {
    return nodeHtml;
  }
}


document.getElementById("back-to-list").addEventListener("click", () => {
  document.getElementById("pokemon-detail").style.display = "none";
  pokemonSection.style.display = "block";
});


function getStatColor(stat) {
  switch(stat) {
    case "hp": return "linear-gradient(90deg, #ff5959, #d32f2f)";
    case "attack": return "linear-gradient(90deg, #ff9f43, #e65100)";
    case "defense": return "linear-gradient(90deg, #4fc3f7, #0277bd)";
    case "special-attack": return "linear-gradient(90deg, #ba68c8, #6a1b9a)";
    case "special-defense": return "linear-gradient(90deg, #81c784, #2e7d32)";
    case "speed": return "linear-gradient(90deg, #fdd835, #f57f17)";
    default: return "linear-gradient(90deg, #b0bec5, #455a64)";
  }
}




