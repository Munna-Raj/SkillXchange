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

export const addSkillApi = (skillData) =>
  api.post("/profile/skills", skillData, { headers: getAuthHeader() });

export const deleteSkillApi = (type, skillId) =>
  api.delete(`/profile/skills/${type}/${skillId}`, { headers: getAuthHeader() });

export const updateSkillApi = (type, skillId, skillData) =>
  api.put(`/profile/skills/${type}/${skillId}`, skillData, { headers: getAuthHeader() });

