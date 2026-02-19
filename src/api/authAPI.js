const API = `http://localhost:8000/api/user`;

// 1. Centralized Response Handler
const handleResponse = async (response) => {
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || data.message || 'Something went wrong');
    }
    return data;
};

export const register = async (formData) => {
    try {
        const response = await fetch(`${API}/register`, {
            method: "POST",
            headers: {
                "Accept": 'application/json',
            },
            body: formData
        });
        return await handleResponse(response);
    } catch (error) {
        console.error("Registration error:", error.message);
        throw error; 
    }
};

export const verify = async (token) => {
    try {
        const response = await fetch(`${API}/verify/${token}`);
        return await handleResponse(response);
    } catch (error) {
        console.error("Verification error:", error.message);
        throw error;
    }
};

export const signin = async (user) => {
    try {
        const response = await fetch(`${API}/login`, {
            method: "POST",
            headers: {
                "Accept": 'application/json',
                "Content-Type": "application/json"
            },
            body: JSON.stringify(user)
        });
        return await handleResponse(response);
    } catch (error) {
        console.error("Login error:", error.message);
        throw error;
    }
};

export const forgetPassword = async (email) => {
    try {
        const response = await fetch(`${API}/forgetpassword`, {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email }) 
        });
        return await handleResponse(response);
    } catch (error) {
        console.error("Forget Password error:", error.message);
        throw error;
    }
};

export const resetPassword = async (token, password) => {
    try {
        const response = await fetch(`${API}/resetpassword/${token}`, {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ password }) 
        });
        return await handleResponse(response);
    } catch (error) {
        console.error("Reset Password error:", error.message);
        throw error;
    }
};

export const resendVerification = async (email) => {
    try {
        const response = await fetch(`${API}/resendverification`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email })
        });
        return await handleResponse(response);
    } catch (error) {
        throw error;
    }
};

// 2. Session Management
export const keepLoggedIn = (data) => {
    if (typeof window !== "undefined") {
        localStorage.setItem("auth", JSON.stringify(data));
    }
};

export const isLoggedIn = () => {
    if (typeof window === "undefined") return false;
    const auth = localStorage.getItem('auth');
    return auth ? JSON.parse(auth) : false;
};

export const logout = () => {
    if (typeof window !== "undefined") {
        localStorage.removeItem("auth");
    }
};