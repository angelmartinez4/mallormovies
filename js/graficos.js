/**
 * Genera profile picture svg con color aleatorio y primera letra del nombre de usuario
 * @param {string} name  nombre de usuario
 * @returns 
 */
export function generarPfpSvg(name) {
    const firstLetter = name.charAt(0).toUpperCase();
    const randomColor = stringToColor(name);
    const svg = `
        <svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="title">
            <title id="title">Avatar de usuario por defecto</title>
            <rect width="100" height="100" fill="${randomColor}" />
            <text x="50" y="55" font-size="70" font-family="Arial" fill="white" text-anchor="middle" dominant-baseline="middle">
                ${firstLetter}
            </text>
        </svg>
    `;
    return svg;
}

/* Genera un color a partir de un nombre usando el hash
Asi el color es determinista para cada nombre y parece aleatorio */
function stringToColor(name) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash); // hash * 31 + charCode
        hash = hash & hash; // Convertir a entero 32 bits
    }

    // Convertir hash a color hex (#RRGGBB)
    let color = '#';
    for (let i = 0; i < 3; i++) {
        // Extraemos 8 bits para cada canal RGB
        const value = (hash >> (i * 8)) & 0xFF;
        // Convertimos a hexadecimal y aseguramos dos dígitos
        color += ('00' + value.toString(16)).slice(-2);
    }
    return color;
}


/**
 * Genera un grafico de barras a partir de un array de valoraciones
 * la posicion del array indica la valoracion, el valor la cantidad
 * @param {number[]} valoraciones array, (idx, valor) = (valoracion+1, cantidad)
 * @returns svg con plot de barras de valoraciones
 */
export function generarBarchartValoraciones(valoraciones) {
    const xLine = 20
    const xRectDesp = 2
    const maxValoraciones = Math.max(...valoraciones);
    if (maxValoraciones === 0) {
        return `<svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <line x1="${xLine}" y1="0" x2="${xLine}" y2="100" stroke="white" stroke-width="2"/>
            <text x="50" y="50" font-size="6" fill="white" text-anchor="middle">Sin valoraciones</text>
        </svg>`;
    }
    const svgRectangulos = []
    let posY = 0
    for (let i=10; i>=1; i--) {
        posY += 10
        svgRectangulos.push(`
        <g aria-label="Valoración de ${i}">
            <text x="5" y="${posY}" font-size="8" fill="white">${i}</text>    
            <rect x="${xLine+xRectDesp}" y="${posY-8}"
            width="${(100-xLine-xRectDesp)*valoraciones[i-1]/maxValoraciones}" height="8" fill="#00F36D">
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
export function generarValoracionMedia(valoracion) {
    const MAX_DECIMALES = 2
    const valRedondeado = Math.round(valoracion * 10**MAX_DECIMALES) / 10**MAX_DECIMALES
    const valStr = valRedondeado.toString();
    const decimales = valStr.includes(".") ? valStr.split(".")[1].length : 0; // Lo siento
    const despXDecimales = decimales*25 // desplaza estrella derecha segun los decimales
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