import { api } from "./api";

const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getNotificationsApi = async () => {
  const response = await api.get("/notifications", { headers: getAuthHeader() });
  return response.data;
};

export const markNotificationReadApi = async (id) => {
  const response = await api.put(`/notifications/${id}/read`, {}, { headers: getAuthHeader() });
  return response.data;
};

export const markAllNotificationsReadApi = async () => {
  const response = await api.put("/notifications/read-all", {}, { headers: getAuthHeader() });
  return response.data;
};
