

export async function login(user, password) {
    const response = await fetch('users.json');
    var users = await response.json();

    

}