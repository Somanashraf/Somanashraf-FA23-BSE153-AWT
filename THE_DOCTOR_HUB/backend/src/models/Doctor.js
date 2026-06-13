import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    licenseNumber: { type: String, required: true, unique: true, trim: true },
    specialization: [{ type: String, trim: true, index: true }],
    qualifications: [
      {
        degree: { type: String, required: true },
        institution: { type: String, required: true },
        year: { type: Number },
        country: { type: String },
      },
    ],
    experience: { type: Number, default: 0, index: true }, // years
    doctorType: {
      type: String,
      enum: ['allopathic', 'homeopathic', 'herbal'],
      required: true,
      index: true,
    },
    treatmentTypes: [{ type: String, trim: true, index: true }],
    diseases: [{ type: String, trim: true, index: true }], // conditions treated
    consultationFee: { type: Number, default: 0, index: true },
    consultationFeeOnline: { type: Number, default: 0 },
    about: { type: String, maxlength: 1000 },
    languages: [{ type: String }],
    clinics: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Clinic' }],
    isApproved: { type: Boolean, default: false, index: true },
    isAvailable: { type: Boolean, default: true, index: true },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date },
    rating: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0 },
    },
    totalPatients: { type: Number, default: 0 },
    totalAppointments: { type: Number, default: 0 },
    profileCompletion: { type: Number, default: 0 },
    assistants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    documents: [
      {
        name: { type: String },
        url: { type: String },
        publicId: { type: String },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    availability: {
      monday: { isOpen: Boolean, slots: [{ start: String, end: String }] },
      tuesday: { isOpen: Boolean, slots: [{ start: String, end: String }] },
      wednesday: { isOpen: Boolean, slots: [{ start: String, end: String }] },
      thursday: { isOpen: Boolean, slots: [{ start: String, end: String }] },
      friday: { isOpen: Boolean, slots: [{ start: String, end: String }] },
      saturday: { isOpen: Boolean, slots: [{ start: String, end: String }] },
      sunday: { isOpen: Boolean, slots: [{ start: String, end: String }] },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for search
doctorSchema.index({ specialization: 1 });
doctorSchema.index({ treatmentTypes: 1 });
doctorSchema.index({ diseases: 1 });
doctorSchema.index({ doctorType: 1, isApproved: 1, isAvailable: 1 });
doctorSchema.index({ consultationFee: 1 });
doctorSchema.index({ 'rating.average': -1 });
doctorSchema.index({ experience: -1 });

export default mongoose.model('Doctor', doctorSchema);
