import {getUser} from './user.js';
import {generarPfpSvg} from './graficos.js'

async function loadUsers(forceRefresh = false) {
    try {
        let url = 'json/users.json';
        
        // Solo añadir timestamp si se solicita refresh
        if (forceRefresh) {
            url += '?t=' + Date.now();
        }
        
        const response = await fetch(url);
        const data = await response.json();
        return data['@graph'];
    } catch (error) {
        console.error('Error cargando usuarios:', error);
        return {};
    }
}

// Función para cargar ratings (simplificada)
async function loadRatings(forceRefresh = false) {
    try {
        let url = 'json/ratings.json';
        
        // Solo añadir timestamp si se solicita refresh
        if (forceRefresh) {
            url += '?t=' + Date.now();
        }
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error cargando ratings:', error);
        return [];
    }
}

// Función para calcular la puntuación promedio de un usuario
function calculateAverageRating(username, ratingsData) {
    if (!Array.isArray(ratingsData) || ratingsData.length === 0) {
        return null;
    }
    
    // Filtrar ratings por username
    const userRatings = ratingsData.filter(rating => rating.username === username);
    
    if (userRatings.length === 0) {
        return null; // No hay ratings
    }
    
    // Calcular promedio de ratingValue
    const sum = userRatings.reduce((total, rating) => {
        const ratingValue = parseFloat(rating.ratingValue);
        return total + (isNaN(ratingValue) ? 0 : ratingValue);
    }, 0);
    
    return sum / userRatings.length;
}

// guardar usuarios en JSON (simplificado)
async function saveUsers(usersData) {
    try {
        const dataToSave = {
            "@graph": usersData
        };
        
        const response = await fetch('php/saveUsers.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dataToSave)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.error || 'Error desconocido al guardar');
        }
        
        return true;
    } catch (error) {
        console.error('Error guardando usuarios:', error);
        throw error;
    }
}

function getUsernameFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('user') || urlParams.get('username');
}

function areFriends(currentUserData, targetUsername) {
    if (!currentUserData || !currentUserData.friends) {
        return false;
    }
    return currentUserData.friends.includes(targetUsername);
}

// Función para actualizar solo el botón de amistad
async function updateFriendButton(targetUsername, usersData) {
    const currentUser = getUser();
    if (!currentUser || currentUser === targetUsername) return;
    
    const currentUserData = usersData[currentUser];
    if (!currentUserData) return;
    
    const isFriend = areFriends(currentUserData, targetUsername);
    
    const friendButton = document.querySelector(`button[onclick="toggleFriendship('${targetUsername}')"]`);
    if (friendButton) {
        friendButton.className = `btn ${isFriend ? 'btn-outline-danger' : 'btn-primary'}`;
        friendButton.textContent = isFriend ? 'Eliminar amigo' : 'Añadir amigo';
    } else {
        console.log('No se encontró el botón de amistad');
    }
}

async function toggleFriendship(targetUsername) {
    const currentUser = getUser();
    if (!currentUser) return;    
    try {
        // cargar datos actuales
        const usersData = await loadUsers();
        const currentUserData = usersData[currentUser];
        
        if (!currentUserData) {
            console.error('Usuario actual no encontrado');
            return;
        }
        
        // inicializar friends si no existe
        if (!currentUserData.friends) {
            currentUserData.friends = [];
        }
        
        const friendsList = currentUserData.friends;
        const friendIndex = friendsList.indexOf(targetUsername);
        
        if (friendIndex > -1) { // eliminar amigo
            friendsList.splice(friendIndex, 1);
        } else { // añadir amigo
            friendsList.push(targetUsername);
        }
        
        await saveUsers(usersData);
        
        // refrescar
        window.location.reload();
        
    } catch (error) {
        console.error('Error al actualizar amistad:', error);
        alert('Error al actualizar la lista de amigos. Por favor, inténtalo de nuevo.');
    }
}

function formatDate(dateString) {
    if (!dateString) return 'No especificada';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

async function renderUserProfile() {
    const username = getUsernameFromUrl();
    if (!username) {
        document.getElementById('userProfile').innerHTML = `
            <div class="alert alert-warning" role="alert">
                <h4 class="alert-heading">Usuario no especificado</h4>
                <p>No se ha especificado un usuario en la URL. Añade ?user=username a la URL.</p>
            </div>
        `;
        return;
    }
    
    // forzar refresh en la carga inicial
    const usersData = await loadUsers(true);
    const ratingsData = await loadRatings(true);
    const userData = usersData[username];
    
    if (!userData) {
        document.getElementById('userProfile').innerHTML = `
            <div class="alert alert-danger" role="alert">
                <h4 class="alert-heading">Usuario no encontrado</h4>
                <p>El usuario "${username}" no existe.</p>
            </div>
        `;
        return;
    }

    const currentUser = getUser();
    const currentUserData = currentUser ? usersData[currentUser] : null;
    const isFriend = currentUserData ? areFriends(currentUserData, username) : false;
    const showFriendButton = currentUser && currentUser !== username;

    // calcular puntuacion promedio dinamicamente
    const avgRating = calculateAverageRating(username, ratingsData);

    let profileImageHtml;
    if (userData.image) {
        // es una URL de imagen
        profileImageHtml = `<img src="${userData.image}" 
                                 alt="Foto de perfil de ${userData.name}" 
                                 class="friend-avatar mb-3" 
                                 style="width: 150px; height: 150px;">`;
    } else {
        const svg = generarPfpSvg(username);
        profileImageHtml = `<div class="friend-avatar mb-3" style="width: 150px; height: 150px; margin: 0 auto;">${svg}</div>`;
    }

    // amigos comunes
    let friendsListHtml = '';
    if (userData.friends && userData.friends.length > 0 && currentUserData && currentUserData.friends) {
        const commonFriends = userData.friends.filter(friendUsername => 
            currentUserData.friends.includes(friendUsername)
        );
        
        if (commonFriends.length > 0) {
            const friendsCards = commonFriends.map(friendUsername => {
                const friendData = usersData[friendUsername];
                const friendName = friendData?.name || friendUsername;
                
                let friendImageHtml;
                if (friendData?.image) {
                    friendImageHtml = `<img src="${friendData.image}" 
                                        alt="${friendUsername}" 
                                        class="friend-avatar">`;
                } else {
                    const friendSvg = generarPfpSvg(friendUsername);
                    friendImageHtml = `<div class="friend-avatar">${friendSvg}</div>`;
                }
                
                return `
                    <div class="col-12 col-sm-6 col-lg-4 mb-2">
                        <a href="?user=${friendUsername}" class="text-decoration-none">
                            <div class="friend-item">
                                ${friendImageHtml}
                                <div class="friend-text-content">
                                    <div class="fw-bold friend-name">${friendName}</div>
                                    <small class="text-muted friend-username">@${friendUsername}</small>
                                </div>
                            </div>
                        </a>
                    </div>
                `;
            }).join('');
        
        friendsListHtml = `
            <div class="card mt-3">
                <div class="card-header">
                    <h5>Amigos en común</h5>
                </div>
                <div class="card-body">
                    <div class="row">
                        ${friendsCards}
                    </div>
                </div>
            </div>
        `;
        }
    }

    document.getElementById('userProfile').innerHTML = `
        <div class="row">
            <div class="col-md-4">
                <div class="card">
                    <div class="card-body text-center">
                        ${profileImageHtml}
                        <h3 class="card-title">${userData.name}</h3>
                        <p class="text-muted">@${username}</p>
                        ${showFriendButton ? `
                            <button class="btn ${isFriend ? 'btn-outline-danger' : 'btn-primary'}" 
                                    onclick="toggleFriendship('${username}')">
                                ${isFriend ? 'Eliminar amigo' : 'Añadir amigo'}
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
            
            <div class="col-md-8">
                <div class="card">
                    <div class="card-header">
                        <h4>Información del perfil</h4>
                    </div>
                    <div class="card-body">
                        <div class="row mb-3">
                            <div class="col-sm-4"><strong>Nombre:</strong></div>
                            <div class="col-sm-8">${userData.name}</div>
                        </div>
                        <div class="row mb-3">
                            <div class="col-sm-4"><strong>Fecha de registro:</strong></div>
                            <div class="col-sm-8">${formatDate(userData.dateCreated)}</div>
                        </div>                        
                        <div class="row mb-3">
                            <div class="col-sm-4"><strong>Puntuación promedio:</strong></div>
                            <div class="col-sm-8">
                                <span class="badge ${avgRating !== null && avgRating < 5 ? 'bg-danger' : 'bg-success'} fs-6">
                                    ${avgRating !== null ? avgRating.toFixed(1) : 'N/A'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                
                ${friendsListHtml}
            </div>
        </div>
    `;
}

// cargar el perfil cuando se carga la página
document.addEventListener('DOMContentLoaded', renderUserProfile);

window.toggleFriendship = toggleFriendship;