import api from "./api";

export const createSessionApi = async (payload) => {
  const { data } = await api.post("/sessions", payload);
  return data;
};

export const getSessionsByRequestApi = async (requestId) => {
  const { data } = await api.get(`/sessions/request/${requestId}`);
  return data;
};

export const updateSessionApi = async (id, payload) => {
  const { data } = await api.put(`/sessions/${id}`, payload);
  return data;
};

export const getUpcomingForMeApi = async () => {
  const { data } = await api.get(`/sessions/upcoming/me`);
  return data;
};
