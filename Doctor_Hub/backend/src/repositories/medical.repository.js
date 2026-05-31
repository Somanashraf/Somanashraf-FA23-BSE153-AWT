const { query, transaction } = require('../config/db');

class MedicalRepository {
  history(patientId) {
    return query(
      `SELECT mh.*, du.full_name AS doctor_name FROM medical_history mh
       LEFT JOIN doctors d ON d.id = mh.doctor_id LEFT JOIN users du ON du.id = d.user_id
       WHERE mh.patient_id = ? ORDER BY mh.created_at DESC`, [patientId]
    );
  }

  appendHistory(entry, connection) {
    const runner = connection ? connection.execute.bind(connection) : query;
    return runner(
      `INSERT INTO medical_history (patient_id, doctor_id, appointment_id, entry_type, title, description, attachment_path)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [entry.patientId, entry.doctorId, entry.appointmentId, entry.entryType, entry.title, entry.description, entry.attachmentPath || null]
    );
  }

  createPrescription(data) {
    return transaction(async (connection) => {
      const [result] = await connection.execute(
        `INSERT INTO prescriptions (appointment_id, patient_id, doctor_id, diagnosis, recommendations, follow_up_date, locked)
         VALUES (?, ?, ?, ?, ?, ?, 1)`,
        [data.appointmentId, data.patientId, data.doctorId, data.diagnosis, data.recommendations, data.followUpDate]
      );
      for (const item of data.items) {
        await connection.execute(
          `INSERT INTO prescription_items (prescription_id, medicine_name, dosage, frequency, duration, instructions)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [result.insertId, item.medicineName, item.dosage, item.frequency, item.duration, item.instructions]
        );
      }
      await this.appendHistory({ patientId: data.patientId, doctorId: data.doctorId, appointmentId: data.appointmentId, entryType: 'PRESCRIPTION', title: data.diagnosis, description: data.recommendations }, connection);
      return result.insertId;
    });
  }

  prescriptions(patientId) {
    return query(
      `SELECT pr.*, du.full_name AS doctor_name FROM prescriptions pr JOIN doctors d ON d.id = pr.doctor_id JOIN users du ON du.id = d.user_id WHERE pr.patient_id = ? ORDER BY pr.created_at DESC`,
      [patientId]
    );
  }
}

module.exports = new MedicalRepository();
