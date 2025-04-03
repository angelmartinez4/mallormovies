/**
 * Genera profile picture svg con color aleatorio y primera letra del nombre de usuario
 * @param {string} name  nombre de usuario
 * @returns 
 */
function generarPfpSvg(name) {
    const firstLetter = name.charAt(0).toUpperCase();
    const randomColor = `#${Math.floor(Math.random()*16777215).toString(16)}`;
    const svg = `
        <svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="title">
            <title id="title">Avatar de usuario por defecto</title>
            <rect width="100" height="100" fill="${randomColor}" />
            <text x="50" y="55" font-size="90" font-family="Arial" fill="white" text-anchor="middle" dominant-baseline="middle">
                ${firstLetter}
            </text>
        </svg>
    `;
    return svg;
}

/**
 * Genera un grafico de barras a partir de un array de valoraciones
 * la posicion del array indica la valoracion, el valor la cantidad
 * @param {number[]} valoraciones array, (idx, valor) = (valoracion+1, cantidad)
 * @returns svg con plot de barras de valoraciones
 */
function generarBarchartValoraciones(valoraciones) {
    const xLine = 20
    const xRectDesp = 2
    // valoraciones = [30, 20, 5, 10, 40, 20, 50, 80, 100, 20] // valor de test
    const maxValoraciones = Math.max(...valoraciones);
    const svgRectangulos = []
    let posY = 0
    for (let i=10; i>=1; i--) {
        posY += 10
        svgRectangulos.push(`
        <g aria-label="Valoración de ${i}">
            <text x="5" y="${posY}" font-size="10" fill="white">${i}</text>    
            <rect x="${xLine+xRectDesp}" y="${posY-8}"
            width="${(100-xLine-xRectDesp)*valoraciones[i-1]/maxValoraciones}" height="8" fill="green">
                <title>${valoraciones[i - 1]} valoraciones</title>
            </rect>
        </g>`)
    }
    const svg = `<svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
    <line x1="${xLine}" y1="0" x2="${xLine}" y2="100" stroke="white" stroke-width="2"/>
        ${svgRectangulos.join("\n")}
    </svg>
    `;
    return svg;
}

/**
 * Genera svg dinamico adaptando el tamano al numero de decimales de la valoracion media
 * @param {number} valoracion numero con o sin decimales 
 * @returns 
 */
function generarValoracionMedia(valoracion) {
    const MAX_DECIMALES = 2
    const valRedondeado = Math.round(valoracion * 10**MAX_DECIMALES) / 10**MAX_DECIMALES
    const valStr = valRedondeado.toString();
    const decimales = valStr.includes(".") ? valStr.split(".")[1].length : 0; // Lo siento
    const despXDecimales = decimales*10 // desplaza estrella derecha segun los decimales
    const svg = `
    <svg width="150" height="50" viewBox="0 0 ${125+despXDecimales} 50">
    <title>Valoración promedio de película: ${valRedondeado}</title>
    <text x="10" y="35" font-size="20" fill="white">${valRedondeado}/10</text>
    <polygon points="${80+despXDecimales},0 ${86+despXDecimales},20 ${105+despXDecimales},20 ${89+despXDecimales},30 ${95+despXDecimales},50
    ${80+despXDecimales},38 ${65+despXDecimales},50 ${71+despXDecimales},30 ${55+despXDecimales},20 ${74+despXDecimales},20" 
        fill="gold" stroke="black" stroke-width="2"/>
    </svg>
    `
    return svg
}

// Función para obtener las coordenadas de los usuarios y devolverlas
function obtenerCoordenadasUsuarios() {
    return fetch("js/users.json")
      .then(response => {
        if (!response.ok) {
          throw new Error("Error al obtener el archivo JSON");
        }
        return response.json();
      })
      .then(data => {
        return data["@graph"]
          .filter(user => user.homeLocation && user.homeLocation.geo)
          .map(user => ({
            name: user.name,
            latitude: parseFloat(user.homeLocation.geo.latitude),
            longitude: parseFloat(user.homeLocation.geo.longitude)
          }));
      })
      .catch(error => {
        console.error("Error en la obtención de coordenadas:", error);
        return [];
      });
  }  

function dibujarMapa(coordenadas, contenedorId) {
    const mapa = L.map(contenedorId);
    // base del mapa
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapa);
    const puntos = [];
    coordenadas.forEach(coord => {
           L.marker([coord.latitude, coord.longitude])
            .addTo(mapa)
            .bindPopup(`<b>${coord.name}</b><br>Lat: ${coord.latitude}<br>Lon: ${coord.longitude}`);        
        puntos.push([coord.latitude, coord.longitude]);
    });

    // ajustar vista para que se vean todos los puntos
    if (puntos.length > 0) {
        const bounds = L.latLngBounds(puntos);
        mapa.fitBounds(bounds);
    }
    return mapa;
}

  