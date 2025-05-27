import {generarValoracionMedia} from './graficos.js';

async function loadIMDBRating(url) {
    var rating;
    var runtime;
    var year;
    const regex = /\/title\/(tt\d+)/;
    const imdbcode = regex.exec(url)[1];

    try {
      const response = await fetch('https://graph.imdbapi.dev/v1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `{
            title(id: "${imdbcode}") {
                rating {
                    aggregate_rating
                    votes_count
                }
                start_year
                runtime_minutes
            }
          }`
        })
      });
  
      const data = await response.json();
      rating = [data.data.title.rating.aggregate_rating, data.data.title.rating.votes_count];
      runtime = data.data.title.runtime_minutes;
      year = data.data.title.start_year;
    } catch (error) {
      console.error('Error fetching IMDB data:', error);
    }

    return rating[0];
  }

async function getCard(item, index, rol) {
    if (rol != " "){
        if (!item.participant?.some(p => p.jobTitle?.toLowerCase() === rol.toLowerCase())) return '';
    }

    console.log(item.sameAs);
    const val = await loadIMDBRating(item.sameAs);
    

    return `
        <div class="col-md-6 col-lg-4 wow fadeInUp" data-wow-delay="0.1s">
            <div class="service-item rounded overflow-hidden bg-dark">
                <img class="img-fluid" src="imgs/${item.image}" alt="">
                <div class="position-relative p-4 pt-0">
                    <div class="service-icon bg-dark">
                        ${generarValoracionMedia(val)}
                    </div>
                    <h4 class="mb-3">${item.name}</h4>
                    <p>${item.description}</p>
                    <a class="small fw-medium" href="movie.html?movieid=${index}">Ver ficha<i class="fa fa-arrow-right ms-2"></i></a>
                </div>
            </div>
        </div>
    `;
}

async function filtrarDirector(){
    const container = document.getElementById('peliculas');
    const moviesArray = movies['@graph'];

    const htmlDirector = await Promise.all(
        moviesArray.map(async (item, index) => await getCard(item, index, "director"))
    );
    const htmlDirectora = await Promise.all(
        moviesArray.map(async (item, index) => await getCard(item, index, "directora"))
    );

    container.innerHTML = htmlDirector.concat(htmlDirectora).join('');
}

async function filtrarActor(){
    const container = document.getElementById('peliculas');
    const moviesArray = movies['@graph'];

    const htmlActor = await Promise.all(
        moviesArray.map(async (item, index) => await getCard(item, index, "actor"))
    );
    const htmlActriz = await Promise.all(
        moviesArray.map(async (item, index) => await getCard(item, index, "actriz"))
    );

    container.innerHTML = htmlActor.concat(htmlActriz).join('');
}

async function filtrarTecnico(){
    const container = document.getElementById('peliculas');
    const moviesArray = movies['@graph'];

    const htmlTecnico = await Promise.all(
        moviesArray.map(async (item, index) => await getCard(item, index, "Técnico de efectos visuales"))
    );

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

async function renderItems(data) {
    const container = document.getElementById('peliculas');
    const moviesArray = data['@graph'];

    // Use Promise.all to wait for all async getCard calls
    const htmlCards = await Promise.all(
        moviesArray.map(async (item, index) => await getCard(item, index, " "))
    );

    container.innerHTML = htmlCards.join('');
}

let movies;
async function loadMovies() {
    try {
        const response = await fetch('json/movies.json');
        movies = await response.json();
        
        await renderItems(movies);
    } catch (error) {
        console.error('Error loading movies:', error);
    }
}

loadMovies();
addEvent();