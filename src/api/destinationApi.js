const BASE_URL = "http://localhost:8000/api/destinations";

// Create Destination
export const createDestination = async (destinationData, token) => {
  const response = await fetch(`${BASE_URL}/createdestination`, {
    method: "POST",
    headers: {
      // "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`

    },
    body: destinationData
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || data.message || "Failed to create destination");
  }

  return data;
};

// Get all destinations
export const getAllDestinations = async () => {
  const response = await fetch(`${BASE_URL}/getalldestination`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to fetch destinations");
  return data;
};

// Get single destination
export const getDestinationById = async (id) => {
  const response = await fetch(`${BASE_URL}/getdestination/${id}`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to fetch destination");
  return data;
};

// Update a destination
export const updateDestination = async (id, destinationData, token) => {
  const response = await fetch(`${BASE_URL}/updatedestination/${id}`, {
    method: "PUT",
    headers: {
      // If destinationData is FormData (for images), don't set Content-Type
      "Authorization": `Bearer ${token}`
    },
    body: destinationData
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to update destination");
  return data;
};

// Delete a destination 
export const deleteDestination = async (id, token) => {
  const response = await fetch(`${BASE_URL}/deletedestination/${id}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to delete destination");
  return data;
};


