
function User(password, name, lat, long) {
    this['@type'] = "Person";
    this.password = password;
    this.name = name;
    this.dateCreated = new Date().toISOString();
    this.homeLocation = {
        "@type": "GeoCoordinates",
        "geo": {
            "latitude": `${lat}`,
            "longitude": `${long}`
        }
    }
}

async function saveUser(users, username, userdata) {
    users['@graph'][username] = userdata;
    var jsonData = JSON.stringify(users, null, 2);

    try {
        const response = await fetch('saveUsers.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: jsonData
        });
    }
    catch (error) {
        console.error('Error:', error);
        alert('Error saving data!');
    }

    document.cookie = `user=${username}; SameSite=None; Secure`;
    window.location.href = "/";
}

export async function register(username, name, password1, password2) {
    removeWarnings();
    const response = await fetch('js/users.json');
    const users = await response.json();

    if (users['@graph'][username] != null) {
        warn('El nombre de usuario '+username+' ya esta en uso!')
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            const userdata = new User(password1, name, lat, lon);
            saveUser(users, username, userdata);
        },
        (error) => {
            warn('Si no nos das tu ubicacion, no puedes crear una cuenta.')
        },
        {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        }
    );
}

export async function login(user, password) {
    removeWarnings();
    const response = await fetch('js/users.json');
    var users = await response.json();

    if (users['@graph'][user] == null) {
        warn(`Usuario ${user} no existe.`)
        return;
    }

    if (users['@graph'][user]['password'] == password) {
        document.cookie = `user=${user}; SameSite=None; Secure`;
    }
    else {
        warn("Contraseña incorrecta");
    }

    window.location.href = "/";
}

export function getUser() {
    const cookies = document.cookie.split('; ');

    for (const cookie of cookies) {
    const [cookieName, cookieValue] = cookie.split('=');
    
    if (decodeURIComponent(cookieName) === 'user') {
        return decodeURIComponent(cookieValue);
    }
    }
    
    return null;
}

export function logout() {
    document.cookie = 'user' + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

function removeWarnings() {
    const e = document.getElementById('warningbox');
    e.classList.add('d-none');
}

function warn(txt) {
    var e = document.getElementById('warningbox');
    e.classList.remove('d-none');
    e = document.getElementById('warning');
    e.innerHTML = txt;
}

window.register = register;
window.login = login;
window.logout = logout;
window.getUser = getUser;