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

// dibuja mapa con Leaflet y OpenStreetMaps
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


obtenerCoordenadasUsuarios().then(coordenadas => {
    dibujarMapa(coordenadas, 'mapa');
});