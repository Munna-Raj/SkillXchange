import { api } from "./api";

const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getChatHistoryApi = async (requestId) => {
  const response = await api.get(`/chat/history/${requestId}`, { headers: getAuthHeader() });
  return response.data;
};

export const markChatAsReadApi = async (requestId) => {
  const response = await api.put(`/chat/read/${requestId}`, {}, { headers: getAuthHeader() });
  return response.data;
};
