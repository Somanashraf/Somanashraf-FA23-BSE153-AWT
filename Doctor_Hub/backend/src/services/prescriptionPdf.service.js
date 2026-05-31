const PDFDocument = require('pdfkit');
const medicalRepository = require('../repositories/medical.repository');
const { query } = require('../config/db');

class PrescriptionPdfService {
  async streamPrescription(prescriptionId, res) {
    const prescriptions = await query(`SELECT pr.*, pu.full_name AS patient_name, du.full_name AS doctor_name FROM prescriptions pr JOIN patients p ON p.id = pr.patient_id JOIN users pu ON pu.id = p.user_id JOIN doctors d ON d.id = pr.doctor_id JOIN users du ON du.id = d.user_id WHERE pr.id = ?`, [prescriptionId]);
    const prescription = prescriptions[0];
    const items = await query('SELECT * FROM prescription_items WHERE prescription_id = ?', [prescriptionId]);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=doctor-hub-prescription-${prescriptionId}.pdf`);
    const doc = new PDFDocument({ margin: 48 });
    doc.pipe(res);
    doc.fontSize(22).fillColor('#0f766e').text('Doctor Hub Prescription');
    doc.moveDown().fontSize(11).fillColor('#334155').text(`Patient: ${prescription.patient_name}`).text(`Doctor: ${prescription.doctor_name}`).text(`Diagnosis: ${prescription.diagnosis}`);
    doc.moveDown().fontSize(14).text('Medicines');
    items.forEach((item, index) => doc.fontSize(10).text(`${index + 1}. ${item.medicine_name} - ${item.dosage}, ${item.frequency}, ${item.duration}. ${item.instructions || ''}`));
    doc.moveDown().fontSize(12).text(`Recommendations: ${prescription.recommendations || 'None'}`);
    doc.text(`Follow up: ${prescription.follow_up_date || 'As advised'}`);
    doc.end();
  }
}

module.exports = new PrescriptionPdfService();
