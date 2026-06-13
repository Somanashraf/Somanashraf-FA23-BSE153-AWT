import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true, maxlength: 50 },
    lastName: { type: String, required: true, trim: true, maxlength: 50 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: { type: String, required: true, minlength: 8, select: false },
    phone: { type: String, trim: true },
    role: {
      type: String,
      enum: ['patient', 'doctor', 'assistant', 'admin', 'super_admin'],
      default: 'patient',
      index: true,
    },
    profilePicture: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    gender: { type: String, enum: ['male', 'female', 'other', ''] },
    dateOfBirth: { type: Date },
    address: {
      street: { type: String },
      city: { type: String, index: true },
      state: { type: String },
      country: { type: String, default: 'Pakistan' },
      zipCode: { type: String },
    },
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String, select: false },
    emailVerificationExpires: { type: Date, select: false },
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
    refreshToken: { type: String, select: false },
    isActive: { type: Boolean, default: true, index: true },
    isSuspended: { type: Boolean, default: false },
    suspensionReason: { type: String },
    lastLogin: { type: Date },
    loginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },
    notifications: [
      {
        title: { type: String },
        message: { type: String },
        type: {
          type: String,
          enum: [
            'appointment',
            'payment',
            'prescription',
            'message',
            'system',
          ],
        },
        isRead: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now },
        link: { type: String },
      },
    ],
    preferences: {
      darkMode: { type: Boolean, default: false },
      emailNotifications: { type: Boolean, default: true },
      smsNotifications: { type: Boolean, default: false },
      language: { type: String, default: 'en' },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: full name
userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Pre-save: hash password
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Method: compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method: check if account is locked
userSchema.methods.isLocked = function () {
  return this.lockUntil && this.lockUntil > Date.now();
};

// Method: increment login attempts
userSchema.methods.incrementLoginAttempts = async function () {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    await this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 },
    });
    return;
  }
  const updates = { $inc: { loginAttempts: 1 } };
  if (this.loginAttempts + 1 >= 5 && !this.isLocked()) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }
  await this.updateOne(updates);
};

// Indexes
userSchema.index({ email: 1, role: 1 });
userSchema.index({ 'address.city': 1 });

export default mongoose.model('User', userSchema);
