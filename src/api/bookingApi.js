// src/api/bookingApi.js

const BASE_URL = "http://localhost:8000/api/bookings";

const getHeaders = () => {
    // 1. Get the 'auth' string from localStorage
    const authData = localStorage.getItem("auth");
    let token = "";

    if (authData) {
        try {
            // 2. Parse the JSON string into an object
            const parsedAuth = JSON.parse(authData);
            // 3. Access the token inside that object
            token = parsedAuth.token; 
        } catch (error) {
            console.error("Error parsing auth data:", error);
        }
    }

    return {
        "Content-Type": "application/json",
        "Authorization": token ? `Bearer ${token}` : ""
    };
};

export const createBooking = async (bookingData) => {
    const response = await fetch(`${BASE_URL}/confirm`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(bookingData)
    });
    return response.json();
};

export const getEsewaSignature = async (paymentData) => {
    const response = await fetch(`${BASE_URL}/initiate-esewa`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(paymentData)
    });
    return response.json();
};