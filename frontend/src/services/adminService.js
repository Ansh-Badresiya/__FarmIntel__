import api from './api';

export const adminService = {
  // ── Dashboard ─────────────────────────────────────────────────────────────
  getDashboardStats: () => api.get('/admin/dashboard'),

  // ── Users ─────────────────────────────────────────────────────────────────
  getUsers: (role = '') =>
    api.get('/admin/users', { params: role ? { role } : {} }),
  updateUserRole: (userId, role) =>
    api.put(`/admin/users/${userId}/role`, { role }),

  // ── Schemes ───────────────────────────────────────────────────────────────
  getSchemes: () => api.get('/admin/schemes'),
  createScheme: (data) => api.post('/admin/scheme', data),
  updateScheme: (id, data) => api.put(`/admin/scheme/${id}`, data),
  deleteScheme: (id) => api.delete(`/admin/scheme/${id}`),

  // ── Eligibility Rules ─────────────────────────────────────────────────────
  getRules: (schemeId = '') =>
    api.get('/admin/rules', { params: schemeId ? { scheme_id: schemeId } : {} }),
  createRule: (data) => api.post('/admin/rule', data),
  updateRule: (id, data) => api.put(`/admin/rule/${id}`, data),
  deleteRule: (id) => api.delete(`/admin/rule/${id}`),
};
