const { query, transaction } = require('../config/db');

class AppointmentRepository {
  create(data) {
    return query(
      `INSERT INTO appointments (patient_id, doctor_id, clinic_id, schedule_id, appointment_date, appointment_time, reason, status, queue_no)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING_PAYMENT', ?)`,
      [data.patientId, data.doctorId, data.clinicId, data.scheduleId, data.date, data.time, data.reason, data.queueNo]
    );
  }

  findById(id) {
    return query(
      `SELECT a.*, pu.full_name AS patient_name, du.full_name AS doctor_name, c.name AS clinic_name
       FROM appointments a
       JOIN patients p ON p.id = a.patient_id JOIN users pu ON pu.id = p.user_id
       JOIN doctors d ON d.id = a.doctor_id JOIN users du ON du.id = d.user_id
       JOIN clinics c ON c.id = a.clinic_id WHERE a.id = ?`, [id]
    ).then(rows => rows[0]);
  }

  listForUser(user) {
    if (user.role === 'PATIENT') {
      return query(`SELECT a.*, du.full_name AS doctor_name, c.name AS clinic_name FROM appointments a JOIN patients p ON p.id = a.patient_id JOIN doctors d ON d.id = a.doctor_id JOIN users du ON du.id = d.user_id JOIN clinics c ON c.id = a.clinic_id WHERE p.user_id = ? ORDER BY a.appointment_date DESC`, [user.id]);
    }
    if (user.role === 'DOCTOR') {
      return query(`SELECT a.*, pu.full_name AS patient_name, c.name AS clinic_name FROM appointments a JOIN doctors d ON d.id = a.doctor_id JOIN patients p ON p.id = a.patient_id JOIN users pu ON pu.id = p.user_id JOIN clinics c ON c.id = a.clinic_id WHERE d.user_id = ? ORDER BY a.appointment_date DESC`, [user.id]);
    }
    return query(`SELECT a.*, pu.full_name AS patient_name, du.full_name AS doctor_name, c.name AS clinic_name FROM appointments a JOIN patients p ON p.id = a.patient_id JOIN users pu ON pu.id = p.user_id JOIN doctors d ON d.id = a.doctor_id JOIN users du ON du.id = d.user_id JOIN clinics c ON c.id = a.clinic_id ORDER BY a.appointment_date DESC LIMIT 200`);
  }

  updateStatus(id, status, actorId) {
    return transaction(async (connection) => {
      await connection.execute('UPDATE appointments SET status = ? WHERE id = ?', [status, id]);
      await connection.execute('INSERT INTO audit_logs (actor_user_id, action, entity_type, entity_id, metadata) VALUES (?, ?, ?, ?, JSON_OBJECT("status", ?))', [actorId, 'APPOINTMENT_STATUS_UPDATED', 'appointments', id, status]);
    });
  }
}

module.exports = new AppointmentRepository();
