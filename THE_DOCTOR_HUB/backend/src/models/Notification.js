import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ['appointment', 'payment', 'prescription', 'message', 'system', 'account'],
      required: true,
    },
    isRead: { type: Boolean, default: false, index: true },
    readAt: { type: Date },
    link: { type: String },
    data: { type: mongoose.Schema.Types.Mixed },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    priority: { type: String, enum: ['low', 'normal', 'high'], default: 'normal' },
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ recipient: 1, createdAt: -1 });
// Auto-delete after 90 days
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });

export default mongoose.model('Notification', notificationSchema);
