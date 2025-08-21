const pokemonList = document.getElementById('pokemonList')
const loadMoreButton = document.getElementById('loadMoreButton')

const maxRecords = 151
const limit = 12
let offset = 0;

function createModal(pokemonNumber, pokemonType) {
    const existingModal = document.querySelector('.modal-overlay');
    if (existingModal) {
        existingModal.remove();
    }

    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';

    const modalContent = document.createElement('div');
    modalContent.className = `modal-content ${pokemonType}`;
    modalContent.style.backgroundColor = `var(--pokemon-${pokemonType})`;

    const closeButton = document.createElement('button');
    closeButton.innerHTML = '×';
    closeButton.className = 'modal-close-btn';
    closeButton.addEventListener('click', () => modalOverlay.remove());

    modalContent.innerHTML = `
        <div style="text-align: center; padding: 2rem;">
            <div style="font-size: 1.5rem; margin-bottom: 1rem;">Loading...</div>
        </div>
    `;

    modalContent.appendChild(closeButton);
    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);

    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            modalOverlay.remove();
        }
    });

    return modalContent;
}

async function fetchPokemonDetails(pokemonNumber) {
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonNumber}`);
        const pokemonData = await response.json();
        return pokemonData;
    } catch (error) {
        console.error('Error fetching Pokemon details:', error);
        return null;
    }
}

function displayPokemonDetails(modalContent, pokemonData) {
    const stats = pokemonData.stats.map(stat => 
        `<div style="margin: 0.5rem 0;">
            <span style="font-weight: bold;">${stat.stat.name}:</span> ${stat.ability ? stat.ability.name : stat.base_stat}
        </div>`
    ).join('');

    const abilities = pokemonData.abilities.map(ability => 
        `<span style="background: rgba(255,255,255,0.2); padding: 0.25rem 0.5rem; border-radius: 0.5rem; margin: 0.25rem; display: inline-block;">${ability.ability.name}</span>`
    ).join('');

    modalContent.innerHTML = `
        <div style="text-align: center;">
            <h2 style="margin-bottom: 1rem; text-transform: capitalize;">${pokemonData.name}</h2>
            <img src="${pokemonData.sprites.other.dream_world.front_default || pokemonData.sprites.front_default}" 
                 alt="${pokemonData.name}" 
                 style="width: 200px; height: 200px; margin-bottom: 1rem;">
            
            <div style="margin-bottom: 1rem;">
                <strong>Height:</strong> ${pokemonData.height / 10}m | 
                <strong>Weight:</strong> ${pokemonData.weight / 10}kg
            </div>
            
            <div style="margin-bottom: 1rem;">
                <strong>Types:</strong><br>
                ${pokemonData.types.map(type => 
                    `<span style="background: rgba(255,255,255,0.2); padding: 0.25rem 0.5rem; border-radius: 0.5rem; margin: 0.25rem; display: inline-block;">${type.type.name}</span>`
                ).join('')}
            </div>
            
            <div style="margin-bottom: 1rem;">
                <strong>Abilities:</strong><br>
                ${abilities}
            </div>
            
            <div style="margin-bottom: 1rem;">
                <strong>Base Stats:</strong><br>
                ${stats}
            </div>
        </div>
    `;

    const closeButton = document.createElement('button');
    closeButton.innerHTML = '×';
    closeButton.className = 'modal-close-btn';
    closeButton.addEventListener('click', () => {
        const modalOverlay = document.querySelector('.modal-overlay');
        if (modalOverlay) modalOverlay.remove();
    });
    modalContent.appendChild(closeButton);
}

function loadPokemonItens(offset, limit) {
    pokeApi.getPokemons(offset, limit).then((pokemons = []) => {
        pokemons.forEach(pokemon => {
            const pokemonElement = createPokemonElement(pokemon);
            pokemonList.appendChild(pokemonElement);
        });
    })
}

function createPokemonElement(pokemon) {
    const li = document.createElement('li');
    li.className = `pokemon ${pokemon.type}`;
    li.setAttribute('data-pokemon-number', pokemon.number);
    
    li.innerHTML = `
        <span class="number">#${pokemon.number}</span>
        <span class="name">${pokemon.name}</span>

        <div class="detail">
            <ol class="types">
                ${pokemon.types.map((type) => `<li class="type ${type}">${type}</li>`).join('')}
            </ol>

            <img src="${pokemon.photo}"
                 alt="${pokemon.name}">
        </div>
    `;
    
    li.addEventListener('click', async () => {
        const pokemonNumber = pokemon.number;
        const pokemonType = pokemon.type;
        
        const modalContent = createModal(pokemonNumber, pokemonType);
        
        const pokemonData = await fetchPokemonDetails(pokemonNumber);
        if (pokemonData) {
            displayPokemonDetails(modalContent, pokemonData);
        } else {
            modalContent.innerHTML = `
                <div style="text-align: center; padding: 2rem;">
                    <div style="font-size: 1.5rem; margin-bottom: 1rem;">Error loading Pokemon details</div>
                </div>
            `;
        }
    });
    
    return li;
}

loadPokemonItens(offset, limit)

loadMoreButton.addEventListener('click', () => {
    offset += limit
    const qtdRecordsWithNexPage = offset + limit

    if (qtdRecordsWithNexPage >= maxRecords) {
        const newLimit = maxRecords - offset
        loadPokemonItens(offset, newLimit)

        loadMoreButton.parentElement.removeChild(loadMoreButton)
    } else {
        loadPokemonItens(offset, limit)
    }
})