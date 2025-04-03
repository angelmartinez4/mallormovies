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

    container = [...document.getElementsByClassName('grafico')];
    container.forEach(itm => itm.innerHTML = generarBarchartValoraciones([30, 20, 5, 10, 40, 20, 50, 80, 100, 20])); 

    // Informacion
    container = document.getElementById('director');
    container.innerHTML = data.director.name;

    container = document.getElementById('genero');
    container.innerHTML = data.genre.join(', ');

    console.log(data.participant);

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
        const response = await fetch('js/movies.json');
        var movies = await response.json();
        movies = movies['@graph'];

        renderData(movies[movieId]);
        loadIMDBRating(movies[movieId].sameAs);
    } catch (error) {
        console.error('Error loading movie:', error);
    }
}

loadMovie();


async function loadIMDBRating(url) {
    var rating;
    var runtime;
    var year;
    console.log(url);
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