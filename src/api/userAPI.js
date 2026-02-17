const API = `http://localhost:8000/api/user`

export const getAllUsers = (token) => {
    return fetch(`${API}/getallusers`, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    })
    .then(res => res.json())
    .catch(error => console.log(error))
}

export const getAllGuides = () => {
    return fetch(`${API}/getallguides`) // No token needed if you made it public
    .then(res => res.json())
    .catch(error => console.log(error));
}

export const deleteUser = (id, token) => {
    return fetch(`${API}/deleteuser/${id}`, {
        method: "DELETE",
        headers: {
            authorization: `Bearer ${token}` 
        }
    })
    .then(res => res.json())
    .catch(error => console.log(error));
}

export const toggleUserRole = (id, token, role) => {
    return fetch(`${API}/togglerole/${id}`, {
        method: "PUT",
        headers: {
            authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({role})
    })
    .then(res => res.json())
    .catch(error => console.log(error));
};

export const updateProfile = (id, userData, token) => {
    return fetch(`${API}/update-profile/${id}`, {
        method: "PUT",
        headers: {
            "Authorization": `Bearer ${token}`
            // Note: If sending FormData (for images), don't set Content-Type header manually
        },
        body: userData
    })
    .then(res => res.json())
    .catch(error => console.log(error));
}

export const manualVerifyUser = (id, token) => {
    return fetch(`${API}/manual-verify/${id}`, {
        method: "PUT",
        headers: {
            authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
        }
    })
    .then(res => res.json())
    .catch(error => console.log(error));
};