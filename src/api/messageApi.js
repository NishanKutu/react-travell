const BASE_URL = "/api/messages";

const getHeaders = () => {
  const authData = localStorage.getItem("auth");
  let token = "";

  if (authData) {
    try {
      token = JSON.parse(authData)?.token || "";
    } catch {
      localStorage.removeItem("auth");
    }
  }

  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
};

const handleResponse = async (response) => {
  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : { message: await response.text() };

  if (!response.ok) {
    throw new Error(data.message || data.error || "Message request failed");
  }

  return data;
};

export const getMessageConversations = async () => {
  const response = await fetch(`${BASE_URL}/conversations`, {
    method: "GET",
    headers: getHeaders(),
  });

  return handleResponse(response);
};

export const getConversationMessages = async (bookingId, staffRole) => {
  const response = await fetch(`${BASE_URL}/${bookingId}/${staffRole}`, {
    method: "GET",
    headers: getHeaders(),
  });

  return handleResponse(response);
};

export const sendConversationMessage = async ({ bookingId, staffRole, text }) => {
  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ bookingId, staffRole, text }),
  });

  return handleResponse(response);
};
