/*    {
      "@context": "https://schema.org",
      "@type": "Review",
      "author": {
        "@type": "Person",
        "name": "user_001"
      },
      "itemReviewed": {
        "@type": "Movie",
        "name": "Inception",
        "sameAs": "https://www.imdb.com/title/tt1375666/"
      },
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": 5
      },
      "reviewBody": "Una película increíble con una trama compleja y efectos visuales impresionantes.",
      "datePublished": "2024-03-10T12:30:00Z"
    },*/

import { getUser } from "./user";

// Función para crear el objeto Review
function Rating(movie, rating, body) {
    return {
        '@type': 'Review',
        author: {
            '@type': 'Person',
            name: getCookie('user')  // Obtienes el nombre del usuario desde las cookies
        },
        itemReviewed: {
            '@type': 'Movie',
            name: movie  // El nombre de la película
        },
        reviewRating: {
            '@type': 'Rating',
            ratingValue: rating  // Valor de la calificación
        },
        reviewBody: body,  // El contenido de la reseña
        datePublished: new Date().toISOString()  // La fecha actual en formato ISO
    };
}

//cargamos reseñas hechas de la pelicula
export async function printRatings(){
    const urlParams = new URLSearchParams(window.location.search);
    const movie = urlParams.get('movieid');

    const response = await fetch('js/ratings.json');
    const ratings = await response.json();

    //buscamos las valoraciones de la pelicula
    //! se ha de cambiar m.itemReviewed.name para que haga referencia al id de la pelicula y no al nombre
    //!tmb se ha de cambiar el nombre por el id en el json
    ratings = ratings.filter(m => m.itemReviewed.name === movie);

    //ponemos valoraciones del json en el contenedor
    const container = document.getElementById('ratings');
    container.innerHTML =  ratings.map((Date, rating, body)=> getRating(Date, rating, body)).join('');
}

// ratings.js
export async function addRating(rating, body) {
    //removeWarnings();

    const urlParams = new URLSearchParams(window.location.search);
    const movie = urlParams.get('movieid');
    try {
        // Obtener los ratings existentes desde el archivo JSON
        const response = await fetch('js/users.json');
        const ratings = await response.json();

        const user = getUser();  // Obtener el nombre del usuario desde las cookies

        let valorada = null;

        //bucle para mirar si el usuario ya ha hecho una valoracion de la pelicula
        //!esta hecho así porque el browser me decia que ratings.filter() no es una funcion
        for (let i = 0; i < ratings.length; i++) {
            const r = ratings[i];
        
            // Aseguramos que los campos existen antes de comparar
            if (
                r &&
                r.author && r.author.name === user &&
                r.itemReviewed && r.itemReviewed.name === movie
            ) {
                valorada = r;
                break; // encontramos la coincidencia
            }
        }
        
        
        // Si ya existe una reseña, mostramos un mensaje
        if (valorada != null) {
            console.warn("El usuario ya ha valorado esta pelicula.");
            return;  // Detener la ejecución de la función si ya existe la reseña
        }

        // Crear el nuevo objeto de reseña usando la función `rating`
        const nuevaReseña = Rating(movie, rating, body);

        // Agregar la nueva reseña al array de ratings
        ratings.push(nuevaReseña);

        // Convertir el array de ratings a un formato JSON
        const jsonData = JSON.stringify(ratings);

        // Enviar el JSON al servidor usando fetch
        const addResponse = await fetch('addRating.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: jsonData
        });

        if (addResponse.ok) {
            console.log('Reseña agregada exitosamente');
            const container = document.getElementById('ratings');
            container.innerHTML +=  getRating(this.Date, this.rating, this.body)

        } else {
            console.error('Error al agregar la reseña');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al guardar la reseña!');
    }
}

//contenedor de la reseña
function getRating(Date, rating, body){
    return `<div class="col mt-4">
                <div class="card mx-3 bg-transparent">
                    <div class="d-flex">
                        <img src="icons/profile.svg" class="flex-grow-0 user-select-none" />
                        <h6 class="mt-3 ms-2 flex-grow-0">kjorda02</h6>
                        <div class="flex-grow-1 d-flex justify-content-end">
                            ${Date}
                            <div class="ms-4">

                                <!-- Esta parte se deberia cambiar por el svg dinamico -->
                                <span class="text-white align-top">${rating}</span><span class="d-inline-block pt-2"
                                    style="font-size:0.8rem;">/10</span><img src="icons/star.svg"
                                    class="align-baseline" />
                            </div>
                        </div>
                    </div>
                    <p class="ps-5" style="font-size: 0.8rem;">
                        ${body}
                    </p>
                </div>
            </div>
    `;
}

function removeWarnings() {
    const e = document.getElementById('warningbox');
    e.classList.add('d-none');
}

function warn(txt) {
    var e = document.getElementById('warningbox');
    e.classList.remove('d-none');
    e = document.getElementById('warning');
    e.innerHTML = txt;
}

function getCookie(c) {
    console.log(document.cookie);
    const cookies = document.cookie.split('; ');
    for (const cookie of cookies) {
      const [cookieName, value] = cookie.split('=');
      if (cookieName === c) {
        return `${decodeURIComponent(value)}`;
      }
    }
    return "";
  }

  window.addRating = addRating;