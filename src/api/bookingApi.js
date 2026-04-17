
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

export const cancelAndRefund = async (id) => {
  const response = await fetch(`${BASE_URL}/refund/${id}`, {
    method: "PUT",
    headers: getHeaders(),
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
  try {
    const response = await fetch(`${BASE_URL}/initiate-esewa`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(paymentData),
    });

    // Check if the server actually returned a 200 OK
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Server Error Response:", errorText);
      throw new Error(`Server returned ${response.status}: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Fetch Error in bookingApi.js:", error);
    throw error;
  }
};

// Initiate Stripe Payment
export const initiateStripePayment = async (paymentData) => {
  try {
    const response = await fetch(`${BASE_URL}/initiate-stripe`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(paymentData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to initiate Stripe");
    }

    return await response.json();
  } catch (error) {
    console.error("Stripe Initiation Error:", error);
    throw error;
  }
};

// Verify Stripe Payment
export const verifyStripePayment = async (sessionId, bookingId) => {
  try {
    const response = await fetch(
      `${BASE_URL}/verify-stripe?session_id=${sessionId}&bookingId=${bookingId}`,
      {
        method: "GET",
        headers: getHeaders(),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Stripe verification failed");
    }

    return await response.json();
  } catch (error) {
    console.error("Stripe Verification Error:", error);
    throw error;
  }
};

export const getAvailableStaff = async (date, role, destinationId) => {
  try {
    const response = await fetch(`${BASE_URL}/available-staff?date=${date}&role=${role}&destinationId=${destinationId}`, {
      method: "GET",
      headers: getHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch available staff");
    }

    return await response.json();
  } catch (error) {
    console.error("Fetch Available Staff Error:", error);
    throw error;
  }
};
