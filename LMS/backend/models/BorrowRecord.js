const mongoose = require('mongoose');

/**
 * BorrowRecord Model
 * Represents a book borrowing transaction
 */
const borrowRecordSchema = new mongoose.Schema({
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    required: [true, 'Member ID is required']
  },
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: [true, 'Book ID is required']
  },
  borrowDate: {
    type: Date,
    default: Date.now
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required']
  },
  returnDate: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['borrowed', 'returned', 'overdue'],
    default: 'borrowed'
  }
}, {
  timestamps: true
});

// Check if book is overdue
borrowRecordSchema.methods.checkOverdue = function() {
  if (this.status === 'borrowed' && new Date() > this.dueDate) {
    this.status = 'overdue';
    return true;
  }
  return false;
};

module.exports = mongoose.model('BorrowRecord', borrowRecordSchema);
