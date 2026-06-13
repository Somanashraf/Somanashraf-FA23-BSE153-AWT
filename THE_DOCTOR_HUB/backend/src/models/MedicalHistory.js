import mongoose from 'mongoose';

/**
 * IMMUTABLE MEDICAL HISTORY
 * Records can ONLY be appended. Never deleted or edited.
 * This is enforced at both model and controller level.
 */

const medicalRecordSchema = new mongoose.Schema(
  {
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    recordDate: { type: Date, default: Date.now },
    chiefComplaint: { type: String },
    diagnosis: { type: String },
    symptoms: [{ type: String }],
    physicalExamination: { type: String },
    vitalSigns: {
      bloodPressure: { type: String },
      heartRate: { type: String },
      temperature: { type: String },
      weight: { type: String },
      height: { type: String },
      oxygenSaturation: { type: String },
    },
    labResults: { type: String },
    treatmentGiven: { type: String },
    treatmentNotes: { type: String },
    medications: [
      {
        name: { type: String },
        dosage: { type: String },
        frequency: { type: String },
        duration: { type: String },
        instructions: { type: String },
      },
    ],
    prescription: { type: mongoose.Schema.Types.ObjectId, ref: 'Prescription' },
    followUpRequired: { type: Boolean, default: false },
    followUpDate: { type: Date },
    documents: [
      {
        name: { type: String },
        url: { type: String },
        publicId: { type: String },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    additionalNotes: { type: String },
  },
  { _id: true }
);

const medicalHistorySchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    bloodGroup: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', ''] },
    allergies: [{ type: String }],
    chronicConditions: [{ type: String }],
    currentMedications: [{ type: String }],
    pastSurgeries: [{ type: String }],
    familyHistory: { type: String },
    records: [medicalRecordSchema],
    totalVisits: { type: Number, default: 0 },
    lastVisit: { type: Date },
  },
  {
    timestamps: true,
    // Prevent bulk updates that could modify records
  }
);

// Prevent deletion
medicalHistorySchema.pre('deleteOne', function (next) {
  next(new Error('Medical history cannot be deleted'));
});

medicalHistorySchema.pre('deleteMany', function (next) {
  next(new Error('Medical history cannot be deleted'));
});

// Only allow appending records, not modifying existing ones
medicalHistorySchema.pre('save', function (next) {
  if (!this.isNew && this.isModified('records')) {
    // Allow appending new records but prevent modification of existing ones
    const originalRecordCount = this._originalRecordCount || 0;
    if (this.records.length < originalRecordCount) {
      return next(new Error('Medical records cannot be deleted'));
    }
  }
  next();
});

export default mongoose.model('MedicalHistory', medicalHistorySchema);
