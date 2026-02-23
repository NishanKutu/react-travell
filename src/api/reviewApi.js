const BASE_URL = "http://localhost:8000/api/reviews";

export const submitReview = async (reviewData, token) => {
  const response = await fetch(`${BASE_URL}/add`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: reviewData,
  });
  return await response.json();
};

export const getAllReviews = async (token) => {
  const response = await fetch(`${BASE_URL}/all`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.json();
};

export const deleteReview = async (id, token) => {
  const response = await fetch(`${BASE_URL}/delete/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.json();
};

export const updateReview = async (id, reviewData, token) => {
  const response = await fetch(`${BASE_URL}/update/${id}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: reviewData,
  });
  return await response.json();
};
