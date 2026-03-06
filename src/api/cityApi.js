const BASE_URL = "/api/cities";

const getAuthToken = () => {
  const authData = localStorage.getItem("auth");
  if (authData) {
    try {
      const parsedData = JSON.parse(authData);
      return parsedData.token;
    } catch (err) {
      return null;
    }
  }
  return null;
};

export const fetchCities = async () => {
  const response = await fetch(`${BASE_URL}/all`);
  return await response.json();
};

export const addCity = async (cityName) => {
  const token = getAuthToken();
  const response = await fetch(`${BASE_URL}/add`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ cityname: cityName }), 
  });
  return await response.json();
};

export const updateCity = async (id, newName) => {
  const token = getAuthToken();
  const response = await fetch(`${BASE_URL}/update/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ cityname: newName }), 
  });
  return await response.json();
};

export const deleteCity = async (id) => {
  const response = await fetch(`${BASE_URL}/delete/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${getAuthToken()}`,
    },
  });
  return await response.json();
};
