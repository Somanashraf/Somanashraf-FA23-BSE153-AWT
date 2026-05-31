const { query } = require('../config/db');

class DoctorRepository {
  search(filters) {
    const where = ['u.status = "ACTIVE"'];
    const params = [];
    if (filters.disease) { where.push('EXISTS (SELECT 1 FROM doctor_diseases dd JOIN diseases di ON di.id = dd.disease_id WHERE dd.doctor_id = d.id AND di.name LIKE ?)'); params.push(`%${filters.disease}%`); }
    if (filters.specialization) { where.push('d.specialization LIKE ?'); params.push(`%${filters.specialization}%`); }
    if (filters.treatmentType) { where.push('d.treatment_type = ?'); params.push(filters.treatmentType); }
    if (filters.city) { where.push('c.city LIKE ?'); params.push(`%${filters.city}%`); }
    if (filters.minFee) { where.push('d.consultation_fee >= ?'); params.push(Number(filters.minFee)); }
    if (filters.maxFee) { where.push('d.consultation_fee <= ?'); params.push(Number(filters.maxFee)); }

    return query(
      `SELECT d.id, u.full_name, d.specialization, d.treatment_type, d.consultation_fee, d.experience_years, d.rating, c.name AS clinic_name, c.city
       FROM doctors d
       JOIN users u ON u.id = d.user_id
       LEFT JOIN clinics c ON c.doctor_id = d.id AND c.is_primary = 1
       WHERE ${where.join(' AND ')}
       ORDER BY d.rating DESC, d.experience_years DESC`,
      params
    );
  }

  findByUserId(userId) {
    return query('SELECT * FROM doctors WHERE user_id = ? LIMIT 1', [userId]).then(rows => rows[0]);
  }

  clinics(doctorId) {
    return query('SELECT * FROM clinics WHERE doctor_id = ? ORDER BY is_primary DESC, name ASC', [doctorId]);
  }

  schedules(doctorId) {
    return query('SELECT s.*, c.name AS clinic_name FROM schedules s JOIN clinics c ON c.id = s.clinic_id WHERE s.doctor_id = ? ORDER BY day_of_week, start_time', [doctorId]);
  }
}

module.exports = new DoctorRepository();
