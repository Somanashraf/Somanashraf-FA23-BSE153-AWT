import api from './api';

export const medicalService = {
  getMyHistory: () => api.get('/history/me'),
  getPatientHistory: (patientId) => api.get(`/history/${patientId}`),
  addRecord: (patientId, formData) =>
    api.post(`/history/${patientId}/records`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  updateProfile: (patientId, data) => api.put(`/history/${patientId}/profile`, data),
};

export const prescriptionService = {
  create: (data) => api.post('/prescriptions', data),
  getAll: (params) => api.get('/prescriptions', { params }),
  getById: (id) => api.get(`/prescriptions/${id}`),
};

export const messageService = {
  getConversations: () => api.get('/messages/conversations'),
  getConversation: (userId, params) => api.get(`/messages/${userId}`, { params }),
  sendMessage: (data) => api.post('/messages', data),
  markAsRead: (messageId) => api.put(`/messages/${messageId}/read`),
};

export const analyticsService = {
  getOverview: () => api.get('/analytics/overview'),
  getAppointmentsTrend: (params) => api.get('/analytics/appointments-trend', { params }),
  getRevenueTrend: (params) => api.get('/analytics/revenue-trend', { params }),
  getUserGrowth: (params) => api.get('/analytics/user-growth', { params }),
  getDoctorStats: () => api.get('/analytics/doctor-stats'),
  getAuditLogs: (params) => api.get('/analytics/audit-logs', { params }),
};

export const userService = {
  getAllUsers: (params) => api.get('/users', { params }),
  getUserById: (id) => api.get(`/users/${id}`),
  updateProfile: (data) => api.put('/users/profile', data),
  uploadProfilePicture: (formData) =>
    api.post('/users/profile-picture', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  suspendUser: (id, data) => api.put(`/users/${id}/suspend`, data),
  activateUser: (id) => api.put(`/users/${id}/activate`),
  assignRole: (id, data) => api.put(`/users/${id}/role`, data),
};
