import {getUser} from './user.js';
import {generarPfpSvg} from './graficos.js'
// Función para cargar datos de usuarios
async function loadUsers() {
    try {
        const response = await fetch('json/users.json');
        const data = await response.json();
        return data['@graph'];
    } catch (error) {
        console.error('Error cargando usuarios:', error);
        return {};
    }
}

// Función para guardar usuarios en el JSON
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
function updateFriendButton(targetUsername, usersData) {
    const currentUser = getUser();
    if (!currentUser || currentUser === targetUsername) return;
    
    const currentUserData = usersData[currentUser];
    const isFriend = areFriends(currentUserData, targetUsername);
    
    const friendButton = document.querySelector(`button[onclick="toggleFriendship('${targetUsername}')"]`);
    if (friendButton) {
        friendButton.className = `btn ${isFriend ? 'btn-outline-danger' : 'btn-primary'}`;
        friendButton.textContent = isFriend ? 'Eliminar amigo' : 'Añadir amigo';
    }
}

// Función para alternar amistad
async function toggleFriendship(targetUsername) {
    const currentUser = getUser();
    if (!currentUser) return;
    
    try {
        const usersData = await loadUsers();
        const currentUserData = usersData[currentUser];
        
        if (!currentUserData) {
            console.error('Usuario actual no encontrado');
            return;
        }
        
        // Inicializar friends si no existe
        if (!currentUserData.friends) {
            currentUserData.friends = [];
        }
        
        const friendsList = currentUserData.friends;
        const friendIndex = friendsList.indexOf(targetUsername);
        
        if (friendIndex > -1) {
            // Eliminar amigo
            friendsList.splice(friendIndex, 1);
            console.log(`Eliminado ${targetUsername} de la lista de amigos`);
        } else {
            // Añadir amigo
            friendsList.push(targetUsername);
            console.log(`Añadido ${targetUsername} a la lista de amigos`);
        }
        
        // Guardar cambios en el servidor
        await saveUsers(usersData);
        console.log('Cambios guardados exitosamente');
        
        // Actualizar la barra lateral de amigos
        const friendsSidebar = document.querySelector('friends-sidebar');
        if (friendsSidebar) {
            await friendsSidebar.loadFriends();
        }
        
        // Actualizar solo el botón de amistad sin recargar todo el perfil
        updateFriendButton(targetUsername, usersData);
        
    } catch (error) {
        console.error('Error al actualizar amistad:', error);
        alert('Error al actualizar la lista de amigos. Por favor, inténtalo de nuevo.');
    }
}

// Función para formatear fecha
function formatDate(dateString) {
    if (!dateString) return 'No especificada';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Función principal para renderizar el perfil
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

    const usersData = await loadUsers();
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

    // Determinar imagen de perfil
    let profileImageHtml;
    if (userData.image) {
        // Es una URL de imagen
        profileImageHtml = `<img src="${userData.image}" 
                                 alt="Foto de perfil de ${userData.name}" 
                                 class="friend-avatar mb-3" 
                                 style="width: 150px; height: 150px;">`;
    } else {
        const svg = generarPfpSvg(username);
        profileImageHtml = `<div class="friend-avatar mb-3" style="width: 150px; height: 150px; margin: 0 auto;">${svg}</div>`;
    }

    // Generar lista de amigos en común
    let friendsListHtml = '';
    if (userData.friends && userData.friends.length > 0 && currentUserData && currentUserData.friends) {
        // Filtrar solo amigos en común
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
                    <div class="col-md-6 col-lg-4 mb-2">
                        <a href="?user=${friendUsername}" class="text-decoration-none">
                            <div class="friend-item">
                                ${friendImageHtml}
                                <div>
                                    <div class="fw-bold">${friendName}</div>
                                    <small class="text-muted">@${friendUsername}</small>
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
                            <div class="col-sm-4"><strong>Género favorito:</strong></div>
                            <div class="col-sm-8">${userData.favgenre || 'No especificado'}</div>
                        </div>
                        
                        <div class="row mb-3">
                            <div class="col-sm-4"><strong>Director favorito:</strong></div>
                            <div class="col-sm-8">${userData.favdirector || 'No especificado'}</div>
                        </div>
                        
                        <div class="row mb-3">
                            <div class="col-sm-4"><strong>Puntuación promedio:</strong></div>
                            <div class="col-sm-8">
                                <span class="badge ${userData.avgrating && userData.avgrating < 5 ? 'bg-danger' : 'bg-success'} fs-6">${userData.avgrating ? userData.avgrating.toFixed(1) : 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                ${friendsListHtml}
            </div>
        </div>
    `;
}

// Cargar el perfil cuando se carga la página
document.addEventListener('DOMContentLoaded', renderUserProfile);

// Hacer la función toggleFriendship accesible globalmente
window.toggleFriendship = toggleFriendship;