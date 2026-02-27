import api from './api';

const getUsers = async () => {
  const response = await api.get('/admin/users');
  return response.data;
};

const deleteUser = async (id) => {
  const response = await api.delete(`/admin/users/${id}`);
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

const adminService = {
  getUsers,
  deleteUser,
  getDashboardStats,
  getSkills,
  deleteSkill,
};

export default adminService;
