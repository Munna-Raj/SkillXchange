import { api } from "./api";

export const searchUsersApi = async (query) => {
  const response = await api.get(`/search?query=${query}`);
  return response.data;
};

export const getUserProfileApi = async (id) => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};

export const getFeaturedUsersApi = async () => {
  const response = await api.get("/featured-users");
  return response.data;
};
