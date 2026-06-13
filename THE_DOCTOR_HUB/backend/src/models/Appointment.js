import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true, index: true },
    clinic: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic' },
    appointmentDate: { type: Date, required: true, index: true },
    appointmentTime: { type: String, required: true },
    type: {
      type: String,
      enum: ['in-person', 'online'],
      default: 'in-person',
    },
    status: {
      type: String,
      enum: [
        'pending',
        'payment_pending',
        'payment_uploaded',
        'payment_verified',
        'confirmed',
        'in_progress',
        'completed',
        'cancelled',
        'rejected',
        'no_show',
      ],
      default: 'pending',
      index: true,
    },
    symptoms: { type: String, maxlength: 1000 },
    notes: { type: String, maxlength: 1000 },
    consultationFee: { type: Number, required: true },
    cancellationReason: { type: String },
    cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    cancelledAt: { type: Date },
    rejectionReason: { type: String },
    rejectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rejectedAt: { type: Date },
    confirmedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    confirmedAt: { type: Date },
    completedAt: { type: Date },
    payment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
    prescription: { type: mongoose.Schema.Types.ObjectId, ref: 'Prescription' },
    medicalHistory: { type: mongoose.Schema.Types.ObjectId, ref: 'MedicalHistory' },
    isFollowUp: { type: Boolean, default: false },
    followUpOf: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
    rating: {
      score: { type: Number, min: 1, max: 5 },
      review: { type: String },
      ratedAt: { type: Date },
    },
    reminderSent: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

appointmentSchema.index({ patient: 1, status: 1 });
appointmentSchema.index({ doctor: 1, status: 1 });
appointmentSchema.index({ appointmentDate: 1, doctor: 1 });
appointmentSchema.index({ createdAt: -1 });

export default mongoose.model('Appointment', appointmentSchema);
