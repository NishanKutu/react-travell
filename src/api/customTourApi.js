const BASE_URL = "http://localhost:8000/api/custom-tours";

const getAuthToken = () => {
  const authData = localStorage.getItem("auth");
  if (authData) {
    try {
      const parsed = JSON.parse(authData);
      return parsed.token;
    } catch (e) {
      console.error("Auth token parsing error:", e);
      return null;
    }
  }
  return null;
};

export const createCustomTour = async (tourData) => {
  try {
    const token = getAuthToken();
    const response = await fetch(`${BASE_URL}/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(tourData),
    });
    return await response.json();
  } catch (error) {
    console.error("Error saving custom tour:", error);
    throw error;
  }
};

export const getMyCustomTours = async () => {
  try {
    const token = getAuthToken();
    const response = await fetch(`${BASE_URL}/my-tours`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return await response.json();
  } catch (error) {
    console.error("Error fetching my custom tours:", error);
    throw error;
  }
};

export const getAllCustomTours = async () => {
  try {
    const token = getAuthToken();
    const response = await fetch(`${BASE_URL}/all`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch all tours");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching all custom tours:", error);
    return { success: false, message: error.message };
  }
};

export const getGuideCustomAssignments = async () => {
  try {
    const token = getAuthToken(); // Your existing helper
    const response = await fetch(`${BASE_URL}/guide-assignments`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return await response.json();
  } catch (error) {
    console.error("Error fetching guide assignments:", error);
    throw error;
  }
};

export const deleteCustomTour = async (id) => {
  try {
    const token = getAuthToken();
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return await response.json();
  } catch (error) {
    console.error("Error deleting custom tour:", error);
    return { success: false, message: error.message };
  }
};

export const updateCustomTourStatus = async (id, status) => {
  const token = getAuthToken();
  const response = await fetch(`${BASE_URL}/status/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });
  return response.json();
};