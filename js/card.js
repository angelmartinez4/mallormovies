import {generarValoracionMedia} from './graficos.js';

function getCard(item, index) {
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


function renderItems(data) {
    const container = document.getElementById('peliculas');

    const moviesArray = data['@graph'];

    // Map each item to HTML using the template, then join into one string
    container.innerHTML = moviesArray.map((item, index) => getCard(item, index)).join('');

    // Add event listeners
    // document.querySelectorAll('.details-button').forEach(button => {
    //     button.addEventListener('click', (e) => {
    //     const id = e.target.closest('.item').dataset.id;
    //     showDetails(id);
    //     });
    // });
}


async function loadMovies() {
    try {
        const response = await fetch('js/movies.json');
        const movies = await response.json();
        
        renderItems(movies);
    } catch (error) {
        console.error('Error loading movies:', error);
    }
}

loadMovies();