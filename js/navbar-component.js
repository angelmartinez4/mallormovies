import {getUser, logout} from './user.js';
import { generarPfpSvg } from './graficos.js';

class NavBar extends HTMLElement {
    constructor() {
      super();
    }
  
        connectedCallback() {
            this.innerHTML = `
            <!-- Navbar Start -->
            <header class="navbar navbar-expand-lg bg-dark navbar-dark sticky-top p-0">
                <a href="index.html" class="navbar-brand d-flex align-items-center px-4 px-lg-5">
                    <h2 class="m-0 text-primary">MallorMovies</h2>
                </a>
                <button type="button" class="navbar-toggler me-4" data-bs-toggle="collapse" data-bs-target="#navbarCollapse">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarCollapse">
                    <div class="navbar-nav ms-auto p-4 p-lg-0">
                        <a href="video.html" class="nav-item nav-link">Video</a>
                        <a href="mapa.html" class="nav-item nav-link">Mapa</a>    
                        <div id="userNavBar1" class="userNavBar d-lg-none"></div>
                    </div>
                    
                    <div id="userNavBar2" class="d-none d-lg-block"></div>
                    
                </div>
            </nav>
            <!-- Navbar End -->
            `;

            const user = getUser();
            const c = document.getElementById('userNavBar2');
            const d = document.getElementById('userNavBar1');
            
            if (user == null) {
                c.innerHTML = `<a href="login.html" class="btn btn-primary rounded-0 py-4 px-lg-5 d-none d-lg-block text-dark">Log in<i class="fa fa-arrow-right ms-3"></i></a>`;
                d.innerHTML = `<a href="login.html" class="nav-item nav-link">LOG IN</a>`;
            }
            else {
                const profileImage = (user && user.image) ? 
                    `<img src="${user.image}" class="flex-grow-0 user-select-none" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover;"/>` : 
                    `<div style="width: 32px; height: 32px; flex-shrink: 0; vertical-align:middle; display: inline-block; align-items: center; justify-content: center; border-radius: 50%; overflow: hidden;" class="user-select-none">${generarPfpSvg(user)}</div>`;
                c.innerHTML = `
                    ${profileImage}
                    <a href="users.html?username=${user}" class="ms-3 text-white">${user}</a>
                    <img src="./icon/exit.svg" class="ms-4 me-4" style="cursor: pointer;" onclick="salir()" />
                `;

                d.innerHTML = `<a href="users.html?username=${user}" class="nav-item nav-link">${user}<img src="./icon/exit.svg" class="ms-4 me-4" style="cursor: pointer;" onclick="salir()" /></a>`;
            }
        }
    }

    window.salir = () => {
        logout();
        const friendsSidebar = document.querySelector('friends-sidebar');
        if (friendsSidebar) { // ocultar lista amigos en logout
            friendsSidebar.hideSidebar();
        }
        const c = document.getElementById('userNavBar2');
        
        c.innerHTML = `<a href="login.html" class="btn btn-primary rounded-0 py-4 px-lg-5 d-none d-lg-block">Log in<i class="fa fa-arrow-right ms-3"></i></a>`;
    }
  
  // Define the new element
  customElements.define('nav-bar', NavBar);
  