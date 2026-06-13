import api from './api';

export const appointmentService = {
  bookAppointment: (data) => api.post('/appointments', data),
  getAppointments: (params) => api.get('/appointments', { params }),
  getAppointmentById: (id) => api.get(`/appointments/${id}`),
  updateAppointment: (id, data) => api.put(`/appointments/${id}`, data),
  rateAppointment: (id, data) => api.post(`/appointments/${id}/rate`, data),
};

export const paymentService = {
  uploadProof: (appointmentId, formData) =>
    api.post(`/payments/${appointmentId}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  verifyPayment: (id, data) => api.put(`/payments/${id}/verify`, data),
  getPayments: (params) => api.get('/payments', { params }),
  getPendingPayments: () => api.get('/payments/pending'),
  getPaymentById: (id) => api.get(`/payments/${id}`),
};
