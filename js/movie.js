import {generarPfpSvg, generarBarchartValoraciones} from './graficos.js';
let cachedRatings = null; // cache de ratings.json para usos en sitios distintos

async function loadRatingsData() {
    if (cachedRatings !== null) {
        return cachedRatings;
    }   
    try {
        const response = await fetch('json/ratings.json');
        cachedRatings = await response.json();
        return cachedRatings;
    } catch (error) {
        console.error('Error loading ratings:', error);
        return [];
    }
}

async function renderData(data) {
    var container = document.getElementById('titulo');
    container.innerHTML = data.name;

    container = document.getElementById('sipnosis');
    container.innerHTML = data.description;

    container = document.getElementById('portada');
    container.src = "imgs/"+data.image;

    container = document.getElementById('vid');
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = data.trailer.embedUrl.match(regExp);
    container.src = "https://www.youtube.com/embed/"+match[2];

    const movieRatings = await loadMovieRatings();
    console.log(movieRatings);
    container = [...document.getElementsByClassName('grafico')];
    container.forEach(itm => itm.innerHTML = generarBarchartValoraciones(movieRatings)); 

    // Informacion
    container = document.getElementById('director');
    container.innerHTML = data.director.name;

    container = document.getElementById('genero');
    container.innerHTML = data.genre.join(', ');
    for (var field of ['name', 'birthDate', 'birthPlace', 'jobTitle']) {
        container = [...document.getElementsByClassName(field)];

        if (data.participant == null) // Si no hay participante mallorquin no mostramos esos campos
            container.forEach( element => {element.classList.add('d-none');} );
        else
            container[1].innerHTML = data.participant[0][field];
    }
}

async function loadMovie() {
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get('movieid');

    try {
        const response = await fetch('json/movies.json');
        var movies = await response.json();
        movies = movies['@graph'];

        await renderData(movies[movieId]);
        loadIMDBRating(movies[movieId].sameAs);
        loadLocalRating();
    } catch (error) {
        console.error('Error loading movie:', error);
    }
}

async function loadMovieRatings() {
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get('movieid');
    
    const ratings = await loadRatingsData();
    const movieRatings = ratings.filter(m => m.movieId == movieId);    
    const ratingFrequencies = [];

    for (let i = 1; i <= 10; i++) {
        ratingFrequencies[i] = 0;
    }

    // Contar las frecuencias
    movieRatings.forEach(rating => {
        const roundedRating = Math.round(rating.ratingValue);
        if (roundedRating >= 1 && roundedRating <= 10) {
            ratingFrequencies[roundedRating]++;
        }
    });
    
    return ratingFrequencies.slice(1);
}

loadMovie();


async function loadLocalRating() { // ratings de nuestro JSON
    const movieRatings = await loadMovieRatings();
    const totalCount = movieRatings.reduce((sum, freq) => sum + freq, 0);
    
    if (totalCount === 0) {
        // Si no hay valoraciones, mostrar mensaje
        [...document.getElementsByClassName('localrating')].forEach(itm => itm.innerHTML = 'N/A');
        [...document.getElementsByClassName('localcount')].forEach(itm => itm.innerHTML = 'Sin valoraciones');
        return;
    }
    
    // Calcular el rating promedio ponderado
    let totalWeightedRating = 0;
    movieRatings.forEach((frequency, index) => {
        const rating = index + 1; // El índice 0 corresponde a rating 1, índice 1 a rating 2, etc.
        totalWeightedRating += rating * frequency;
    });
    
    const averageRating = totalWeightedRating / totalCount;
    const roundedAverage = Math.round(averageRating * 10) / 10; // Redondear a 1 decimal
    
    // Actualizar elementos del DOM
    const ratingText = roundedAverage.toLocaleString('es-ES');
    [...document.getElementsByClassName('localrating')].forEach(itm => itm.innerHTML = ratingText);
    
    const countText = totalCount === 1 ? '1 valoración' : `${totalCount.toLocaleString('es-ES')} valoraciones`;
    [...document.getElementsByClassName('localcount')].forEach(itm => itm.innerHTML = countText);
    
    console.log(`Rating local: ${ratingText} (${countText})`);
    console.log('Frecuencias por rating:', movieRatings);
}


export async function loadIMDBRating(url) {
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

    var str = "";
    if (year != null)
        str += year;
    if (runtime != null)
        str += " / "+runtime+" mins";

    document.getElementById('year').innerHTML = str;

    var txt = rating[0].toLocaleString('es-ES');
    [...document.getElementsByClassName('imdbrating')].forEach(itm => itm.innerHTML = txt);

    txt = Math.round(rating[1]/1000).toLocaleString('es-ES');
    txt += "k valoraciones";
    [...document.getElementsByClassName('imdbcount')].forEach(itm => itm.innerHTML = txt);
  }
