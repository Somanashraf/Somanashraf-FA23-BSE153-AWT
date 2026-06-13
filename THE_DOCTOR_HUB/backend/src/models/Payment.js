import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true, index: true },
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'PKR' },
    paymentMethod: {
      type: String,
      enum: ['bank_transfer', 'easypaisa', 'jazzcash', 'sadapay', 'nayapay', 'other'],
    },
    transactionId: { type: String, trim: true },
    screenshot: {
      url: { type: String },
      publicId: { type: String },
      uploadedAt: { type: Date, default: Date.now },
    },
    status: {
      type: String,
      enum: ['pending', 'uploaded', 'verified', 'rejected', 'refunded'],
      default: 'pending',
      index: true,
    },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    verifiedAt: { type: Date },
    verificationNote: { type: String },
    rejectionReason: { type: String },
    rejectedAt: { type: Date },
    rejectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    refundedAt: { type: Date },
    refundReason: { type: String },
  },
  { timestamps: true }
);

paymentSchema.index({ patient: 1, status: 1 });
paymentSchema.index({ appointment: 1 });
paymentSchema.index({ createdAt: -1 });

export default mongoose.model('Payment', paymentSchema);
