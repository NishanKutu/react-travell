const BASE_URL = "http://localhost:8000/api/activities";

const getAuthToken = () => {
  const authData = localStorage.getItem("auth");
  if (authData) {
    try {
      const parsed = JSON.parse(authData);
      return parsed.token;
    } catch {
      return null;
    }
  }
  return null;
};

export const createActivity = async (activityData) => {
  const response = await fetch(`${BASE_URL}/add`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getAuthToken()}`,
    },
    body: JSON.stringify(activityData),
  });
  return await response.json();
};

/**
 * Fetch activities using the City's ObjectId
 */
export const getActivitiesByCity = async (cityId) => {
  // API URL remains the same, but the variable passed is the ID
  const response = await fetch(`${BASE_URL}/places/${cityId}`);
  return await response.json();
};

export const getAllActivities = async () => {
  const response = await fetch(`${BASE_URL}/`);
  return await response.json();
};

export const updateActivity = async (activityId, updatedData) => {
  try {
    const response = await fetch(`${BASE_URL}/${activityId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(updatedData),
    });
    return await response.json();
  } catch (error) {
    console.error("Error updating activity:", error);
    throw error;
  }
};

export const deleteActivity = async (activityId) => {
  try {
    const response = await fetch(`${BASE_URL}/${activityId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return await response.json();
  } catch (error) {
    console.error("Error deleting activity:", error);
    throw error;
  }
};
