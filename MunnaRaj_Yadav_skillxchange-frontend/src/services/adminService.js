import api from './api';

const getUsers = async (page = 1, limit = 10, search = '') => {
  let url = `/admin/users?page=${page}&limit=${limit}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;
  const response = await api.get(url);
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

const getSkills = async (page = 1, limit = 10) => {
  const response = await api.get(`/admin/skills?page=${page}&limit=${limit}`);
  return response.data;
};

const deleteSkill = async (skillId, ownerId, type) => {
  const response = await api.delete(`/admin/skills/${skillId}/${ownerId}/${type}`);
  return response.data;
};

const getRequests = async (page = 1, limit = 10) => {
  const response = await api.get(`/admin/requests?page=${page}&limit=${limit}`);
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

const getSessions = async (filters = {}) => {
  const { status, date, search, page = 1, limit = 10 } = filters;
  let url = `/admin/sessions?page=${page}&limit=${limit}&`;
  if (status) url += `status=${status}&`;
  if (date) url += `date=${date}&`;
  if (search) url += `search=${encodeURIComponent(search)}&`;
  const response = await api.get(url);
  return response.data;
};

const getCategories = async () => {
  const response = await api.get('/admin/categories');
  return response.data;
};

const getAssignmentsOverview = async () => {
  const response = await api.get('/admin/assignments');
  return response.data;
};

const deleteCategory = async (id) => {
  const response = await api.delete(`/admin/categories/${id}`);
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
  getSessions,
  getCategories,
  getAssignmentsOverview,
  deleteCategory,
};

export default adminService;
