const appointmentRepository = require('../repositories/appointment.repository');
const { query } = require('../config/db');
const { AppointmentNotFoundException, PaymentVerificationException } = require('../exceptions');

class AppointmentService {
  async book(payload) {
    const queueRows = await query('SELECT COUNT(*) AS total FROM appointments WHERE doctor_id = ? AND appointment_date = ?', [payload.doctorId, payload.date]);
    const queueNo = queueRows[0].total + 1;
    const result = await appointmentRepository.create({ ...payload, queueNo });
    return appointmentRepository.findById(result.insertId);
  }

  list(user) {
    return appointmentRepository.listForUser(user);
  }

  async updateStatus(id, status, actorId) {
    const appointment = await appointmentRepository.findById(id);
    if (!appointment) throw new AppointmentNotFoundException();
    await appointmentRepository.updateStatus(id, status, actorId);
    return appointmentRepository.findById(id);
  }

  async uploadPayment(appointmentId, file, amount) {
    const appointment = await appointmentRepository.findById(appointmentId);
    if (!appointment) throw new AppointmentNotFoundException();
    await query('INSERT INTO payments (appointment_id, amount, screenshot_path, status) VALUES (?, ?, ?, "PENDING")', [appointmentId, amount, file.path]);
    await query('UPDATE appointments SET status = "PAYMENT_UNDER_REVIEW" WHERE id = ?', [appointmentId]);
    return { appointmentId, status: 'PAYMENT_UNDER_REVIEW' };
  }

  async verifyPayment(paymentId, status, assistantUserId, remarks) {
    const rows = await query('SELECT * FROM payments WHERE id = ?', [paymentId]);
    if (!rows[0]) throw new PaymentVerificationException('Payment record not found');
    await query('UPDATE payments SET status = ?, verified_by = ?, verified_at = NOW(), remarks = ? WHERE id = ?', [status, assistantUserId, remarks || null, paymentId]);
    await query('UPDATE appointments SET status = ? WHERE id = ?', [status === 'VERIFIED' ? 'CONFIRMED' : 'REJECTED', rows[0].appointment_id]);
    return { paymentId, status };
  }
}

module.exports = new AppointmentService();
