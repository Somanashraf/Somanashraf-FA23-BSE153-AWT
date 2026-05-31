const medicalRepository = require('../repositories/medical.repository');
const doctorRepository = require('../repositories/doctor.repository');
const { query } = require('../config/db');
const { UnauthorizedAccessException, PrescriptionLockedException } = require('../exceptions');

class MedicalService {
  async historyForPatient(patientId) {
    return medicalRepository.history(patientId);
  }

  async appendLabReport(patientId, file, title) {
    await medicalRepository.appendHistory({ patientId, doctorId: null, appointmentId: null, entryType: 'LAB_REPORT', title, description: 'Patient uploaded lab report', attachmentPath: file.path });
    return this.historyForPatient(patientId);
  }

  async createPrescription(user, payload) {
    const doctor = await doctorRepository.findByUserId(user.id);
    if (!doctor) throw new UnauthorizedAccessException('Doctor profile not found');
    const existing = await query('SELECT id FROM prescriptions WHERE appointment_id = ?', [payload.appointmentId]);
    if (existing.length) throw new PrescriptionLockedException('Prescription already exists for this appointment');
    const prescriptionId = await medicalRepository.createPrescription({ ...payload, doctorId: doctor.id });
    return { prescriptionId, locked: true };
  }

  prescriptions(patientId) {
    return medicalRepository.prescriptions(patientId);
  }
}

module.exports = new MedicalService();
