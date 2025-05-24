import { getUser } from "./user.js";

var ratings;
var movieRatings;
var movie;

// Función para crear el objeto Review
function Rating(movie, rating, body) {
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return {
        username: getUser(),  // Obtienes el nombre del usuario desde las cookies,
        movieId: movie,
        ratingValue: rating,  // Valor de la calificación
        reviewBody: body,  // El contenido de la reseña
        datePublished: new Date().toLocaleDateString('en-US', options)  // La fecha actual en formato ISO
    };
}

//cargamos reseñas hechas de la pelicula
export async function printRatings() {
    const urlParams = new URLSearchParams(window.location.search);
    movie = urlParams.get('movieid');

    try {
        const response = await fetch('json/ratings.json');
        ratings = await response.json();
    }
    catch(error) {console.error('Error cargando las valoraciones: ', error)}

    //buscamos las valoraciones de la pelicula con movieId igual a el de la pelicula
    movieRatings = ratings.filter(m => m.movieId == movie);

    //ponemos valoraciones del json en el contenedor
    const container = document.getElementById('ratings');
    container.innerHTML += movieRatings.map(({datePublished, ratingValue, reviewBody, username}) => getRating(datePublished, ratingValue, reviewBody, username)).join('');


    // Mostramos la rating previa si ya habiamos hecho una
    var prevRating = ratings.filter(m => (m.username == getUser() && m.movieId == movie));
    if (prevRating.length != 0) {
        prevRating = prevRating[0];
        
        const slider = document.getElementById('slider');
        slider.value = prevRating.ratingValue;

        const puntuacion = document.getElementById('punt');
        puntuacion.textContent = "Puntuación de " + prevRating.ratingValue.toLocaleString('es-ES');

        const comentario = document.getElementById('comentario');
        comentario.textContent = prevRating.reviewBody;
    }
}

// ratings.js
export async function addRating(rating, body) {
    ratings = ratings.filter(m => !(m.username == getUser() && m.movieId == movie));
    var newRating = Rating(movie, rating, body);
    ratings.push(newRating);
    var jsonData = JSON.stringify(ratings, null, 2);

    try {
        await fetch('php/addRating.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: jsonData
        });
        
        const userRating = document.getElementById('userRating');
        const userBody = document.getElementById('userBody');
        const userDate = document.getElementById('userDate');
        if (userRating == null || userBody == null || userDate == null) {
            const container = document.getElementById('ratings');
            container.innerHTML += getRating(newRating.datePublished, newRating.ratingValue, newRating.reviewBody, getUser());
        }
        else {
            userRating.textContent = newRating.ratingValue;
            userBody.textContent = newRating.reviewBody;
            userDate.textContent = newRating.datePublished;
        }
        
    }
    catch (error) {
        console.error('Error:', error);
        alert('Error saving ratings!');
    }
}

//contenedor de la reseña
// Bastante malo para xss :(
function getRating(Date, rating, body, username){
    return `<div class="col mt-4">
                <div class="card mx-3 bg-transparent">
                    <div class="d-flex">
                        <img src="icons/profile.svg" class="flex-grow-0 user-select-none" />
                        <h6 class="mt-3 ms-2 flex-grow-0">${username}</h6>
                        <div class="flex-grow-1 d-flex justify-content-end">
                            <span ${username==getUser() ? 'id="userDate"': ''}> ${Date} </span>
                            <div class="ms-4">

                                <span ${username==getUser() ? 'id="userRating"': ''} class="text-white align-top">${rating}</span><span class="d-inline-block pt-2"
                                    style="font-size:0.8rem;">/10</span><img src="icons/star.svg"
                                    class="align-baseline" />
                            </div>
                        </div>
                    </div>
                    <p ${username==getUser() ? 'id="userBody"': ''} class="ps-5" style="font-size: 0.8rem;">
                        ${body}
                    </p>
                </div>
            </div>
    `;
}


  printRatings();

  window.addRating = addRating;