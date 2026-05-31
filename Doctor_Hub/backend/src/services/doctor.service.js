const doctorRepository = require('../repositories/doctor.repository');
const { query } = require('../config/db');

class DoctorService {
  async search(filters) {
    if (filters.disease) await query('INSERT INTO search_logs (disease_name, city, treatment_type) VALUES (?, ?, ?)', [filters.disease, filters.city || null, filters.treatmentType || null]);
    return doctorRepository.search(filters);
  }

  profile(userId) {
    return doctorRepository.findByUserId(userId);
  }

  clinics(doctorId) {
    return doctorRepository.clinics(doctorId);
  }

  schedules(doctorId) {
    return doctorRepository.schedules(doctorId);
  }
}

module.exports = new DoctorService();
