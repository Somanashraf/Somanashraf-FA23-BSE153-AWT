import mongoose from 'mongoose';

/**
 * IMMUTABLE PRESCRIPTIONS
 * Once created, prescriptions cannot be modified or deleted.
 */

const prescriptionSchema = new mongoose.Schema(
  {
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true, index: true },
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    prescriptionDate: { type: Date, default: Date.now },
    diagnosis: { type: String, required: true },
    chiefComplaint: { type: String },
    medicines: [
      {
        name: { type: String, required: true },
        genericName: { type: String },
        dosage: { type: String, required: true },
        frequency: { type: String, required: true },
        duration: { type: String, required: true },
        route: { type: String, enum: ['oral', 'topical', 'injection', 'inhaled', 'other'] },
        instructions: { type: String },
        quantity: { type: String },
      },
    ],
    labTests: [{ type: String }],
    advice: { type: String },
    followUpDate: { type: Date },
    followUpInstructions: { type: String },
    doctorSignature: { type: String },
    pdfUrl: { type: String },
    pdfPublicId: { type: String },
    isFinalized: { type: Boolean, default: true },
    notes: { type: String },
  },
  {
    timestamps: true,
  }
);

// Prevent deletion
prescriptionSchema.pre('deleteOne', function (next) {
  next(new Error('Prescriptions cannot be deleted'));
});

// Prevent modification after creation
prescriptionSchema.pre('save', function (next) {
  if (!this.isNew) {
    return next(new Error('Prescriptions cannot be modified after creation'));
  }
  next();
});

prescriptionSchema.index({ patient: 1, createdAt: -1 });
prescriptionSchema.index({ appointment: 1 });

export default mongoose.model('Prescription', prescriptionSchema);
