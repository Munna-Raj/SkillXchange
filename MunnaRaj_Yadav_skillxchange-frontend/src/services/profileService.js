import { api } from "./api";

// Get token from localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getProfileApi = () => 
  api.get("/profile", { headers: getAuthHeader() });

export const updateProfileApi = (data) => 
  api.put("/profile", data, { headers: getAuthHeader() });
