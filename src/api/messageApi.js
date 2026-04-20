const BASE_URL = "/api/messages";

const getHeaders = () => {
  const authData = localStorage.getItem("auth");
  let token = "";

  if (authData) {
    try {
      const parsed = JSON.parse(authData);
      token = parsed?.token || "";
    } catch (e) {
      console.error("Auth parsing error:", e);
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
  let data;

  try {
    data = contentType.includes("application/json")
      ? await response.json()
      : { message: await response.text() };
  } catch (e) {
    data = { message: "Server error occurred" };
  }

  if (!response.ok) {
    // If unauthorized, you might want to redirect to login or clear auth
    if (response.status === 401) {
      localStorage.removeItem("auth");
    }
    throw new Error(data.message || data.error || "Request failed");
  }

  return data;
};

/**
 * Fetch all conversations for the sidebar
 */
export const getMessageConversations = async () => {
  const response = await fetch(`${BASE_URL}/conversations`, {
    method: "GET",
    headers: getHeaders(),
  });
  return handleResponse(response);
};

/**
 * Fetch messages for a specific thread
 */
export const getConversationMessages = async (bookingId, staffRole) => {
  const response = await fetch(`${BASE_URL}/${bookingId}/${staffRole}`, {
    method: "GET",
    headers: getHeaders(),
  });
  return handleResponse(response);
};

/**
 * Send a message
 */
export const sendConversationMessage = async ({
  bookingId,
  staffRole,
  text,
}) => {
  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ bookingId, staffRole, text }),
  });
  return handleResponse(response);
};
