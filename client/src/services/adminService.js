import api from './api';

const adminService = {
  getDashboardStats: () => api.get('/admin/stats'),
  getAllUsers: (params) => api.get('/admin/users', { params }),
  suspendUser: (userId) => api.put(`/admin/users/${userId}/suspend`),
  getAllProjects: (params) => api.get('/admin/projects', { params }),
  resolveDispute: (projectId, data) =>
    api.put(`/admin/projects/${projectId}/resolve-dispute`, data),
};

export default adminService;
