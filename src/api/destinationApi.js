const BASE_URL = "http://localhost:8000/api/destinations";

// Create Destination
export const createDestination = async (destinationData, token) => {
  const response = await fetch(`${BASE_URL}/createdestination`, {
    method: "POST",
    headers: {
      // "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: destinationData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error || data.message || "Failed to create destination"
    );
  }

  return data;
};

// Get all destinations
export const getAllDestinations = async () => {
  const response = await fetch(`${BASE_URL}/getalldestination`);
  const data = await response.json();
  if (!response.ok)
    throw new Error(data.message || "Failed to fetch destinations");
  return data;
};

// Get single destination
export const getDestinationById = async (id) => {
  // Stop the request if the ID is missing or "undefined"
  if (!id || id === "undefined" || id === null) {
    console.warn("getDestinationById: ID is invalid, skipping fetch.");
    return { success: false, message: "Invalid ID", data: null };
  }

  try {
    const response = await fetch(`${BASE_URL}/getdestination/${id}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch destination");
    }

    return data;
  } catch (error) {
    console.error("API Error in getDestinationById:", error);
    return { success: false, message: error.message, data: null };
  }
};

// Update a destination
export const updateDestination = async (id, destinationData, token) => {
  const response = await fetch(`${BASE_URL}/updatedestination/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: destinationData,
  });

  const data = await response.json();
  if (!response.ok)
    throw new Error(data.message || "Failed to update destination");
  return data;
};

// Delete a destination
export const deleteDestination = async (id, token) => {
  const response = await fetch(`${BASE_URL}/deletedestination/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await response.json();
  if (!response.ok)
    throw new Error(data.message || "Failed to delete destination");
  return data;
};
