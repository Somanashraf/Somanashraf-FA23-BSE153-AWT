import mongoose from 'mongoose';

const clinicSchema = new mongoose.Schema(
  {
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true, index: true },
    name: { type: String, required: true, trim: true },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true, index: true },
      state: { type: String },
      country: { type: String, default: 'Pakistan' },
      zipCode: { type: String },
    },
    contact: {
      phone: { type: String },
      email: { type: String },
      website: { type: String },
    },
    workingDays: [
      {
        type: String,
        enum: [
          'monday',
          'tuesday',
          'wednesday',
          'thursday',
          'friday',
          'saturday',
          'sunday',
        ],
      },
    ],
    openingTime: { type: String },
    closingTime: { type: String },
    mapLocation: {
      latitude: { type: Number },
      longitude: { type: Number },
      mapUrl: { type: String },
    },
    images: [{ url: String, publicId: String }],
    isActive: { type: Boolean, default: true },
    description: { type: String, maxlength: 500 },
  },
  { timestamps: true }
);

clinicSchema.index({ 'address.city': 1 });
clinicSchema.index({ doctor: 1, isActive: 1 });

export default mongoose.model('Clinic', clinicSchema);
