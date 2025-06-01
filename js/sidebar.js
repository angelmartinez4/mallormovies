import {getUser} from './user.js';
import {generarPfpSvg} from './graficos.js'
// sidebar de amigos
class FriendsSidebar extends HTMLElement {
    constructor() {
        super();
    }


    connectedCallback() {
        this.render(); // crear html
        this.initializeElements(); // buscar elementos
        this.init();
    }
    
    init() {
        this.loadFriends();
        this.setupEventListeners();
    }

    initializeElements() {
        // buscar elementos dentro del componente
        this.sidebar = this.querySelector('#friendsSidebar');
        this.toggleBtn = this.querySelector('#toggleSidebar');
        this.closeBtn = this.querySelector('#closeSidebar');
        this.friendsList = this.querySelector('#friendsList');
    }
    
    render() {
    this.innerHTML = `
        <!-- Botón flotante para sidebar en móvil -->
        <button class="btn btn-primary sidebar-toggle-btn d-lg-none" type="button" id="toggleSidebar">
            👥
        </button>
        <!-- Sidebar -->
        <aside id="friendsSidebar" class="friends-sidebar">
            <div class="sidebar-header">
                <h5>Amigos</h5>
                <button class="btn-close d-lg-none" id="closeSidebar"></button>
            </div>
            <div id="friendsList" class="friends-list">
                <!-- Los amigos se cargarán aquí -->
            </div>
        </div>
        `;
    }
    
    setupEventListeners() {
        this.toggleBtn?.addEventListener('click', () => this.toggleSidebar());
        this.closeBtn?.addEventListener('click', () => this.closeSidebar());
        
        // cerrar al hacer click fuera en movil
        document.addEventListener('click', (e) => {
            if (window.innerWidth < 992 && 
                this.sidebar.classList.contains('show') && 
                !this.sidebar.contains(e.target) && 
                !this.toggleBtn.contains(e.target)) {
                this.closeSidebar();
            }
        });
    }
    
    async loadFriends() {
        try {
            // usuario loggeado
            const currentUsername = getUser();
            if (!currentUsername) {
                this.hideSidebar();
                return;
            }
            const response = await fetch('json/users.json');
            const data = await response.json();
            
            // Buscar el usuario en el JSON
            const currentUser = data["@graph"][currentUsername];
            if (!currentUser || !currentUser.friends || currentUser.friends.length === 0) {
                this.friendsList.innerHTML = '<p class="text-muted p-3">No tienes amigos 😂</p>';
                return;
            }
            const allUsers = data["@graph"];
            const friends = currentUser.friends.map(username => {
                const user = allUsers[username];
                return {
                    id: username,
                    name: user?.name ?? "Desconocido",
                    image: user?.image,                  // puede ser null o undefined
                    fallbackSVG: generarPfpSvg(username)
                };
            });

            this.renderFriends(friends);
        } catch (error) {
            console.error('Error cargando amigos:', error);
            this.friendsList.innerHTML = '<p class="text-muted p-3">Error cargando amigos</p>';
        }
    }

    hideSidebar() {
        const sidebarCol = document.getElementById("sidebarCol"); // div.col-lg-3 ...
        const mainCol = sidebarCol.nextElementSibling; // debería ser div.col-lg-9 ...
        this.sidebar.style.display = 'none';
        this.toggleBtn.style.display = 'none';
        sidebarCol.style.display = "none";

        // cambiar clases de la columna principal para que ocupe todo el ancho
        mainCol.classList.remove("col-lg-9", "col-xl-10");
        mainCol.classList.add("col-12");
    }

    
    renderFriends(friends) {
      this.friendsList.innerHTML = friends.map(friend => `
          <a href="users.html?username=${friend.id}" class="friend-item">
              ${
                  friend.image
                  ? `<img src="${friend.image}" alt="${friend.name}" class="friend-avatar">`
                  : `<div class="friend-avatar">${friend.fallbackSVG}</div>`
              }
              <span class="friend-name">${friend.name}</span>
          </a>
        `).join('');
    }

    
    toggleSidebar() {
        this.sidebar.classList.toggle('show');
        this.toggleBtn.classList.toggle('hidden', this.sidebar.classList.contains('show'));
    }
    
    closeSidebar() {
        this.sidebar.classList.remove('show');
        this.toggleBtn.classList.remove('hidden');
    }
}
customElements.define('friends-sidebar', FriendsSidebar);