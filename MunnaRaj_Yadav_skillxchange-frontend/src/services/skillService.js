import { api } from "./api";

// Search skills
export const searchSkillsApi = async (params) => {
  const response = await api.get("/skills/search", { params });
  return response.data;
};
