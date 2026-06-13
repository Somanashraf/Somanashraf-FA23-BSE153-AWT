import api from './api';

export const doctorService = {
  getDoctors: (params) => api.get('/doctors', { params }),
  getDoctorById: (id) => api.get(`/doctors/${id}`),
  createProfile: (data) => api.post('/doctors', data),
  updateProfile: (data) => api.put('/doctors/my-profile', data),
  approveDoctor: (id) => api.put(`/doctors/${id}/approve`),
  getPendingDoctors: () => api.get('/doctors/pending'),
  getMyProfile: () => api.get('/doctors/my-profile'),
};

export const clinicService = {
  createClinic: (data) => api.post('/clinics', data),
  getMyClinics: () => api.get('/clinics/my-clinics'),
  updateClinic: (id, data) => api.put(`/clinics/${id}`, data),
  deleteClinic: (id) => api.delete(`/clinics/${id}`),
  getClinicById: (id) => api.get(`/clinics/${id}`),
};
