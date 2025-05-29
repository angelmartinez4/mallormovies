import {generarValoracionMedia} from './graficos.js';

async function getCard(item, index, rol) {
    if (rol != " "){
        if (!item.participant?.some(p => p.jobTitle?.toLowerCase() === rol.toLowerCase())) return;
    }

    console.log(item.sameAs);
    const val = item.aggregateRating.ratingValue;
    

    return `
        <article class="col-md-6 col-lg-4 wow fadeInUp" data-wow-delay="0.1s">
            <div class="service-item rounded overflow-hidden bg-dark">
                <figure>
                    <img class="img-fluid" src="imgs/${item.image}" alt="Portada de ${item.name}">
                </figure>
                <div class="position-relative p-4 pt-0">
                    <div class="service-icon bg-dark">
                        ${generarValoracionMedia(val)}
                    </div>
                    <h4 class="mb-3">${item.name}</h4>
                    <p>${item.description}</p>
                    <a class="small fw-medium" href="movie.html?movieid=${index}">Ver ficha<i class="fa fa-arrow-right ms-2"></i></a>
                </div>
            </div>
        </article>
    `;
}

async function filtrarDirector(){
    const container = document.getElementById('peliculas');

    const htmlDirector = await Promise.all(
        moviesArray.map(async (item, index) => await getCard(item, index, "director")).filter(card => card)
    );
    const htmlDirectora = await Promise.all(
        moviesArray.map(async (item, index) => await getCard(item, index, "directora")).filter(card => card)
    );

    container.innerHTML = htmlDirector.concat(htmlDirectora).join('');
}

async function filtrarActor(){
    const container = document.getElementById('peliculas');

    const htmlActor = await Promise.all(
        moviesArray.map(async (item, index) => await getCard(item, index, "actor")).filter(card => card)
    );
    const htmlActriz = await Promise.all(
        moviesArray.map(async (item, index) => await getCard(item, index, "actriz")).filter(card => card)
    );

    container.innerHTML = htmlActor.concat(htmlActriz).join('');
}

async function filtrarTecnico(){
    const container = document.getElementById('peliculas');

    const htmlTecnico = await Promise.all(
        moviesArray.map(async (item, index) => await getCard(item, index, "Técnico de efectos visuales")).filter(card => card)
    );

    numero_peliculas.innerHTML = `${moviesArray.length} Peliculas con participantes de Mallorca`;

    container.innerHTML = htmlTecnico.join('');
}

function addEvent() {
    const filtrar_dir = document.getElementById("filtrar_dir");
    filtrar_dir.addEventListener("click", filtrarDirector);

    const filtrar_act = document.getElementById("filtrar_act");
    filtrar_act.addEventListener("click", filtrarActor);

    const filtrar_tec = document.getElementById("filtrar_tec");
    filtrar_tec.addEventListener("click", filtrarTecnico);
}

async function renderItems() {
    const container = document.getElementById('peliculas');

    // Use Promise.all to wait for all async getCard calls
    const htmlCards = await Promise.all(
        moviesArray.map(async (item, index) => await getCard(item, index, " "))
    );

    container.innerHTML = htmlCards.join('');
}

let moviesArray;
let numero_peliculas;
async function loadMovies() {
    try {
        const response = await fetch('json/movies.json');
        const movies = await response.json();

        moviesArray = movies['@graph'];
        
        numero_peliculas = document.getElementById('N-peliculas');

        numero_peliculas.innerHTML = `${moviesArray.length} Peliculas con participantes de Mallorca`;

        await renderItems();
    } catch (error) {
        console.error('Error loading movies:', error);
    }
}

loadMovies();
addEvent();