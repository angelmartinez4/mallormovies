// Función para obtener las coordenadas de los usuarios y devolverlas
async function obtenerCoordenadasUsuarios() {
  try {
      const response = await fetch("json/users.json");
      
      if (!response.ok) {
          throw new Error("Error al obtener el archivo JSON");
      }
      
      const data = await response.json();
      
      return Object.entries(data["@graph"])
          .filter(([username, userdata]) => userdata.homeLocation && userdata.homeLocation.geo)
          .map(([username, userdata]) => ({
              name: username,
              latitude: parseFloat(userdata.homeLocation.geo.latitude),
              longitude: parseFloat(userdata.homeLocation.geo.longitude)
          }));
  } catch (error) {
      console.error("Error en la obtención de coordenadas:", error);
      return [];
  }
}

async function obtenerCoordenadasPelis() {
  try {
    const response = await fetch("https://www.filmematv.com/mallorcaPeliculas.json");
    
    if (!response.ok) {
        throw new Error("Error al obtener el archivo JSON");
    }
    
    const data = await response.json();
    
    return data["movies"]
        .map(({name, url, locationCreated}) => ({
            name: name,
            locationName: locationCreated.name,
            desc: locationCreated.description,
            latitude: parseFloat(locationCreated.geo.latitude),
            longitude: parseFloat(locationCreated.geo.longitude),
            url: url
        }));
  } catch (error) {
      console.error("Error en la obtención de coordenadas:", error);
      return [];
  }
}

// dibuja mapa con Leaflet y OpenStreetMaps
function dibujarMapa(userCoords, movieCoords, contenedorId) {
  const mapa = L.map(contenedorId);
  // base del mapa
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(mapa);
  
  const puntos = [];
  userCoords.forEach(coord => {
      L.marker([coord.latitude, coord.longitude])
          .addTo(mapa)
          .bindPopup(`<a href="/users.html?username=${coord.name}"><b>${coord.name}</b></a><br>Lat: ${coord.latitude}<br>Lon: ${coord.longitude}`);        
      puntos.push([coord.latitude, coord.longitude]);
  });

  movieCoords.forEach(coord => {
      L.marker([coord.latitude, coord.longitude])
          .addTo(mapa)
          .bindPopup(`<a href="${coord.url}"><b>${coord.locationName}</b></a><br><b>Pelicula:</b> ${coord.name}<br><b>Rol del sitio:</b> ${coord.desc}`);        
      puntos.push([coord.latitude, coord.longitude]);
  });
  
  mapa.setMaxBounds([
      [-90, -180],
      [90, 180]
  ]);
  
  // ajustar vista para que se vean todos los puntos
  if (puntos.length > 0) {
      const bounds = L.latLngBounds(puntos);
      mapa.fitBounds(bounds);
  }
  
  return mapa;
}

// Función principal usando async/await
async function inicializarMapa() {
  const userCoords = await obtenerCoordenadasUsuarios();
  const movieCoords = await obtenerCoordenadasPelis();
  dibujarMapa(userCoords, movieCoords ,'mapa');
}

// Ejecutar la función principal
inicializarMapa();