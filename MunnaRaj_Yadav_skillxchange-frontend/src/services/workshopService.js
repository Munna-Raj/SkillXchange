import { api, getAuthHeader } from "./api";

export const listWorkshopsApi = (params = {}) =>
  api.get("/workshops", { params });

export const getWorkshopApi = (id) =>
  api.get(`/workshops/${id}`);

export const createWorkshopApi = (data) =>
  api.post("/workshops", data, { headers: getAuthHeader() });

export const updateWorkshopApi = (id, data) =>
  api.put(`/workshops/${id}`, data, { headers: getAuthHeader() });

export const deleteWorkshopApi = (id) =>
  api.delete(`/workshops/${id}`, { headers: getAuthHeader() });

export const joinWorkshopApi = (id) =>
  api.post(`/workshops/${id}/join`, {}, { headers: getAuthHeader() });

