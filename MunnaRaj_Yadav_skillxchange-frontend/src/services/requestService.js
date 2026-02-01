import { api } from "./api";

// Helper to get token
const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Send a request
export const sendRequestApi = async (requestData) => {
  const response = await api.post("/requests", requestData, { headers: getAuthHeader() });
  return response.data;
};

// Get sent requests
export const getSentRequestsApi = async () => {
  const response = await api.get("/requests/sent", { headers: getAuthHeader() });
  return response.data;
};

// Get received requests
export const getReceivedRequestsApi = async () => {
  const response = await api.get("/requests/received", { headers: getAuthHeader() });
  return response.data;
};

// Respond to a request (accept/reject)
export const respondToRequestApi = async (requestId, status) => {
  const response = await api.put(
    `/requests/${requestId}/respond`,
    { status },
    { headers: getAuthHeader() }
  );
  return response.data;
};
