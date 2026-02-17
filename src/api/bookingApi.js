// src/api/bookingApi.js

const BASE_URL = "http://localhost:8000/api/bookings";

const getHeaders = () => {
  const authData = localStorage.getItem("auth");
  let token = "";

  if (authData) {
    try {
      const parsedAuth = JSON.parse(authData);
      token = parsedAuth.token;
    } catch (error) {
      console.error("Error parsing auth data:", error);
    }
  }

  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
};

export const createBooking = async (bookingData) => {
  const response = await fetch(`${BASE_URL}/confirm`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(bookingData),
  });
  return response.json();
};

export const adminCreateBooking = async (bookingData) => {
  const response = await fetch(`${BASE_URL}/admin-confirm`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(bookingData),
  });
  return response.json();
};

export const getAllBookings = async () => {
  const response = await fetch(`${BASE_URL}/all`, {
    method: "GET",
    headers: getHeaders(),
  });
  return response.json();
};

export const updateBookingStatus = async (id, status) => {
  const response = await fetch(`${BASE_URL}/status/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify({ status }),
  });
  return response.json();
};

export const deleteBooking = async (id) => {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    return response.json();
  };

export const getEsewaSignature = async (paymentData) => {
  const response = await fetch(`${BASE_URL}/initiate-esewa`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(paymentData),
  });
  return response.json();
};
