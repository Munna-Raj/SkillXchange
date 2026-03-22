import api from './api';

const getUsers = async () => {
  const response = await api.get('/admin/users');
  return response.data;
};

const deleteUser = async (id) => {
  const response = await api.delete(`/admin/users/${id}`);
  return response.data;
};

const promoteToMentor = async (id) => {
  const response = await api.put(`/admin/users/${id}/promote`);
  return response.data;
};

const getDashboardStats = async () => {
  const response = await api.get('/admin/stats');
  return response.data;
};

const getSkills = async () => {
  const response = await api.get('/admin/skills');
  return response.data;
};

const deleteSkill = async (skillId, ownerId, type) => {
  const response = await api.delete(`/admin/skills/${skillId}/${ownerId}/${type}`);
  return response.data;
};

const getRequests = async () => {
  const response = await api.get('/admin/requests');
  return response.data;
};

const deleteRequest = async (id) => {
  const response = await api.delete(`/admin/requests/${id}`);
  return response.data;
};

const getReportsData = async () => {
  const response = await api.get('/admin/reports');
  return response.data;
};

const adminService = {
  getUsers,
  deleteUser,
  promoteToMentor,
  getDashboardStats,
  getSkills,
  deleteSkill,
  getRequests,
  deleteRequest,
  getReportsData,
};

export default adminService;
