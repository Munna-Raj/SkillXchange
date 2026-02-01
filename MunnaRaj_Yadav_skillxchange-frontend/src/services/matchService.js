import { api } from "./api";

// Helper to get token
const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Get matched users
export const getMatchesApi = async () => {
  const response = await api.get("/matches", { headers: getAuthHeader() });
  return response.data;
};
