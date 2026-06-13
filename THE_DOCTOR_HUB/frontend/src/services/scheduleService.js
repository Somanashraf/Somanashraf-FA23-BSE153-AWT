import api from './api';

export const scheduleService = {
  getAvailableSlots: (doctorId, date) => api.get(`/schedule/slots/${doctorId}`, { params: { date } }),
  updateAvailability: (data) => api.put('/schedule/availability', data),
  getDoctorCalendar: (doctorId, month, year) => api.get(`/schedule/calendar/${doctorId}`, { params: { month, year } }),
};
