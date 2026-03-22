import api from "./api";

export const markAttendanceApi = async (sessionId) => {
  const response = await api.post("/attendance/join", { sessionId });
  return response.data;
};

export const getUserAttendanceApi = async (userId) => {
  const response = await api.get(`/attendance/${userId}`);
  return response.data;
};
