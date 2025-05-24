import {generarValoracionMedia} from './graficos.js';

function getCard(item, index, rol) {

    if (rol != " "){
        if (!item.participant?.some(p => p.jobTitle?.toLowerCase() === rol.toLowerCase())) return '';
    }

    return `
        <div class="col-md-6 col-lg-4 wow fadeInUp" data-wow-delay="0.1s">
            <div class="service-item rounded overflow-hidden bg-dark">
                <img class="img-fluid" src="imgs/${item.image}" alt="">
                <div class="position-relative p-4 pt-0">
                    <div class="service-icon bg-dark">
                        ${generarValoracionMedia(item.aggregateRating.ratingValue)}
                    </div>
                    <h4 class="mb-3">${item.name}</h4>
                    <p>${item.description}</p>
                    <a class="small fw-medium" href="movie.html?movieid=${index}">Ver ficha<i class="fa fa-arrow-right ms-2"></i></a>
                </div>
            </div>
        </div>
    `;
}

function filtrarDirector(){
    const container = document.getElementById('peliculas');

    const moviesArray = movies['@graph'];

    const htmlDirector = moviesArray.map((item, index) => getCard(item, index, "director"));
    const htmlDirectora = moviesArray.map((item, index) => getCard(item, index, "directora"));

    container.innerHTML = htmlDirector.concat(htmlDirectora).join('');
}

function filtrarActor(){
    const container = document.getElementById('peliculas');

    const moviesArray = movies['@graph'];

    const htmlDirector = moviesArray.map((item, index) => getCard(item, index, "actor"));
    const htmlDirectora = moviesArray.map((item, index) => getCard(item, index, "actriz"));

    container.innerHTML = htmlDirector.concat(htmlDirectora).join('');
}

function filtrarTecnico(){
    const container = document.getElementById('peliculas');

    const moviesArray = movies['@graph'];

    container.innerHTML = moviesArray.map((item, index) => getCard(item, index, "Técnico de efectos visuales"));
}

function addEvent() {
    const filtrar_dir = document.getElementById("filtrar_dir");
    filtrar_dir.addEventListener("click", filtrarDirector);

    const filtrar_act = document.getElementById("filtrar_act");
    filtrar_act.addEventListener("click", filtrarActor);

    const filtrar_tec = document.getElementById("filtrar_tec");
    filtrar_tec.addEventListener("click", filtrarTecnico);
}




function renderItems(data) {
    const container = document.getElementById('peliculas');

    const moviesArray = data['@graph'];

    // Map each item to HTML using the template, then join into one string
    container.innerHTML = moviesArray.map((item, index) => getCard(item, index, " ")).join('');
}


let movies;
async function loadMovies() {
    try {
        const response = await fetch('json/movies.json');
        movies = await response.json();
        
        renderItems(movies);
    } catch (error) {
        console.error('Error loading movies:', error);
    }
}

loadMovies();
addEvent();