import { api, getAuthHeader } from "./api";

export const signupApi = (data) => api.post("/auth/signup", data);
export const loginApi = (data) => api.post("/auth/login", data);
export const changePasswordApi = (data) => api.post("/auth/change-password", data, { headers: getAuthHeader() });

