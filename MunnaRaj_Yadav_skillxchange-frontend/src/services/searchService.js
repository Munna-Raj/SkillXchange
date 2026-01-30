import { api } from "./api";

// Search users and skills
export const searchUsersApi = async (query) => {
  const response = await api.get(`/search?query=${query}`);
  return response.data;
};

// Get public user profile
export const getUserProfileApi = async (id) => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};
