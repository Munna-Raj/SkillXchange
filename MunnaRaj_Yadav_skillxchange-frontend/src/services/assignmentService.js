import api from "./api";

export const getAssignmentsByGroupApi = async (groupId) => {
  const res = await api.get(`/assignments/group/${groupId}`);
  return res.data;
};

export const getAssignmentDetailsApi = async (assignmentId) => {
  const res = await api.get(`/assignments/${assignmentId}`);
  return res.data;
};

export const createAssignmentApi = async (payload) => {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") formData.append(key, value);
  });
  const res = await api.post("/assignments", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const updateAssignmentApi = async (id, payload) => {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") formData.append(key, value);
  });
  const res = await api.put(`/assignments/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const deleteAssignmentApi = async (id) => {
  const res = await api.delete(`/assignments/${id}`);
  return res.data;
};

export const getAssignmentSubmissionsApi = async (assignmentId) => {
  const res = await api.get(`/assignments/${assignmentId}/submissions`);
  return res.data;
};

export const submitAssignmentApi = async (assignmentId, payload) => {
  const formData = new FormData();
  if (payload.file) formData.append("file", payload.file);
  if (payload.text !== undefined) formData.append("text", payload.text);
  const res = await api.post(`/assignments/${assignmentId}/submissions`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const resubmitAssignmentApi = async (assignmentId, payload) => {
  const formData = new FormData();
  if (payload.file) formData.append("file", payload.file);
  if (payload.text !== undefined) formData.append("text", payload.text);
  const res = await api.put(`/assignments/${assignmentId}/submissions/me`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const reviewSubmissionApi = async (submissionId, payload) => {
  const res = await api.put(`/assignments/submissions/${submissionId}/review`, payload);
  return res.data;
};
