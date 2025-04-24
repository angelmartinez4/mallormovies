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

// Función para crear el objeto Review
function rating(movie, rating, body) {
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

// ratings.js
export async function addRating(rating, body, movie) {
    try {
        // Obtener los ratings existentes desde el archivo JSON
        const response = await fetch('js/users.json');
        const ratings = await response.json();

        const user = getCookie('user');  // Obtener el nombre del usuario desde las cookies

        // Verificar si ya existe una reseña para esta película del mismo usuario
        const valorada = ratings.find(r =>
            r.author?.name === user &&  // Comparar el nombre del autor
            r.itemReviewed?.name === movie  // Comparar el nombre de la película
        );
        
        // Si ya existe una reseña, mostramos un mensaje
        if (valorada != null) {
            console.warn("Ya existe una reseña para esa película de ese autor.");
            return;  // Detener la ejecución de la función si ya existe la reseña
        }

        // Crear el nuevo objeto de reseña usando la función `rating`
        const nuevaReseña = rating(movie, rating, body);

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

        // Asegurarse de manejar la respuesta del servidor
        if (addResponse.ok) {
            console.log('Reseña agregada exitosamente');
        } else {
            console.error('Error al agregar la reseña');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al guardar la reseña!');
    }
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
