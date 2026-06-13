import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    conversation: { type: String, required: true, index: true }, // composed: `${userId1}_${userId2}` sorted
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    content: { type: String, required: true, maxlength: 2000 },
    type: {
      type: String,
      enum: ['text', 'image', 'document', 'prescription'],
      default: 'text',
    },
    attachment: {
      url: { type: String },
      publicId: { type: String },
      name: { type: String },
    },
    isRead: { type: Boolean, default: false, index: true },
    readAt: { type: Date },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

messageSchema.index({ conversation: 1, createdAt: 1 });
messageSchema.index({ sender: 1, receiver: 1 });

export default mongoose.model('Message', messageSchema);
