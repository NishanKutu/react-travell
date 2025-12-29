const API = `http://localhost:5000/api/user`

export const register = (user) => {
    console.log(API)
    return fetch(`${API}/register`, {
        method: "POST",
        headers: {
            Accept: 'application/json',
            "Content-Type": "application/json"
        },
        body: JSON.stringify(user)
    })
        .then(response => response.json())
        .catch(error => console.log(error))
}

export const verify = token => {
    return fetch(`${API}/verify/${token}`)
        .then(response => response.json())
        .catch(error => console.log(error))
}

export const signin = (user) => {
    return fetch(`${API}/login`, {
        method: "POST",
        headers: {
            Accept: 'application/json',
            "Content-Type": "application/json"
        },
        body: JSON.stringify(user)
    })
        .then(response => response.json())
        .catch(error => console.log(error))
}

export const keepLoggedIn = data => {
    localStorage.setItem("auth", JSON.stringify(data))

}

export const isLoggedIn = () => {
    return localStorage.getItem('auth') ? JSON.parse(localStorage.getItem('auth')) : false
}