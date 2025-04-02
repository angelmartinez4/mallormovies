import {generarPfpSvg, generarBarchartValoraciones} from './graficos.js';

function renderData(data) {
    console.log(data);

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

    container = document.getElementById('grafico');
    container.innerHTML = generarBarchartValoraciones([30, 20, 5, 10, 40, 20, 50, 80, 100, 20]);
}

async function loadMovie() {
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get('movieid');

    try {
        const response = await fetch('js/movies.json');
        var movies = await response.json();
        movies = movies['@graph'];

        renderData(movies[movieId]);
    } catch (error) {
        console.error('Error loading movie:', error);
    }
}

loadMovie();


async function loadIMDBRating() {
    var rating;
    try {
      const response = await fetch('https://graph.imdbapi.dev/v1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `{
            title(id: "tt0468569") {
              rating {
                aggregate_rating
                votes_count
              }
            }
          }`
        })
      });
  
      const data = await response.json();
      rating = [data.data.title.rating.aggregate_rating, data.data.title.rating.votes_count];
    } catch (error) {
      console.error('Error fetching IMDB data:', error);
    }


  }

  loadIMDBRating();