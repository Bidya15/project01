import axios from 'axios';

/**
 * Senior-grade API Communication Layer.
 * Centralized interceptors for security and global error handling.
 */
const API_URL = import.meta.env.VITE_API_URL || '/api/';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request Interceptor: Inject JWT Token
api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(sessionStorage.getItem('user'));
    if (user && user.token) {
      config.headers['Authorization'] = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Intelligent Error Logging
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message;
    console.warn(`[API ERROR] ${error.config.url}: ${message}`);

    if (error.response?.status === 401) {
      console.error("Session expired or unauthorized. Clearing credentials.");
      sessionStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (username, password) => {
    const { data } = await api.post('auth/signin', { username, password });
    if (data.token) sessionStorage.setItem('user', JSON.stringify(data));
    return data;
  },
  googleLogin: async (idToken) => {
    const { data } = await api.post('auth/google', { idToken });
    if (data.token) sessionStorage.setItem('user', JSON.stringify(data));
    return data;
  },
  register: (username, fullName, email, password) =>
    api.post('auth/signup', { username, fullName, email, password }),
  resetPassword: (username, email, newPassword) =>
    api.post('auth/reset-password', { username, email, newPassword }),
  logout: () => sessionStorage.removeItem('user'),
  getCurrentUser: () => JSON.parse(sessionStorage.getItem('user')),
};

export const scannerService = {
  scan: (url) => api.post('scanner/scan', { url }),
  getPreview: (url) => api.get('scanner/preview', { params: { url } }),
  getHistory: () => api.get('history/my-scans'),
};

export const reportService = {
  submit: (domain) => api.post('reports/submit', { domain }),
  getRecent: () => api.get('reports/recent'),
  verify: (id) => api.put(`reports/${id}/verify`),
  delete: (id) => api.delete(`reports/${id}`),
};

export const adminService = {
  getStats: () => api.get('admin/stats'),
  getUsers: () => api.get('admin/users'),
  approveUser: (id) => api.put(`admin/users/${id}/approve`),
  rejectUser: (id) => api.delete(`admin/users/${id}/reject`),
  blockUser: (id) => api.put(`admin/users/${id}/block`),
  unblockUser: (id) => api.put(`admin/users/${id}/unblock`),
  changeRole: (id, role) => api.put(`admin/users/${id}/role`, { role }),
  getAuditLogs: () => api.get('admin/audit-logs'),
  manualBlacklist: (domain) => api.post('admin/blacklist', { domain }),
};

export const feedbackService = {
  submit: (data) => api.post('feedback/submit', data),
  getAll: () => api.get('feedback/all'),
  toggleFeature: (id) => api.put(`feedback/${id}/feature`, {}),
  delete: (id) => api.delete(`feedback/${id}`),
};

export const statsService = {
  getGlobalStats: () => api.get('stats'),
};

export default api;
