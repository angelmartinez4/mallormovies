import {getUser, logout} from './js/user.js';

class NavBar extends HTMLElement {
    constructor() {
      super();
    }
  
        connectedCallback() {
            this.innerHTML = `
            <!-- Navbar Start -->
            <nav class="navbar navbar-expand-lg bg-dark navbar-dark sticky-top p-0">
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
                        <a href="amigos.html" class="nav-item nav-link">Amigos</a>
                        <a href="valoraciones.html" class="nav-item nav-link">Mis valoraciones</a>
                    </div>
                    
                    <div id="userNavBar"></div>
                </div>
            </nav>
            <!-- Navbar End -->
            `;
            

            const user = getUser();
            const c = document.getElementById('userNavBar');

            if (user == null) {
                c.innerHTML = `<a href="login.html" class="btn btn-primary rounded-0 py-4 px-lg-5 d-none d-lg-block">Log in<i class="fa fa-arrow-right ms-3"></i></a>`;
            }
            else {
                c.innerHTML =  `
                                <img src="icons/profile.svg" class="flex-grow-0 user-select-none"/>
                                <a href="users.html?username=${user}" class="ms-3 text-white">${user}</a>
                                <img src="./icons/exit.svg" class="ms-4 me-4" style="cursor: pointer;" onclick="salir()" />`
            }
        }
    }

    window.salir = () => {
        logout();
        const c = document.getElementById('userNavBar');
        c.innerHTML = `<a href="login.html" class="btn btn-primary rounded-0 py-4 px-lg-5 d-none d-lg-block">Log in<i class="fa fa-arrow-right ms-3"></i></a>`;
    }
  
  // Define the new element
  customElements.define('nav-bar', NavBar);
  