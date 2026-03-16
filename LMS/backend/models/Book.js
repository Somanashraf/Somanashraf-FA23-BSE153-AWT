const mongoose = require('mongoose');

/**
 * Book Model
 * Represents a book in the library system
 */
const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Book title is required'],
    trim: true
  },
  author: {
    type: String,
    required: [true, 'Author name is required'],
    trim: true
  },
  isbn: {
    type: String,
    required: [true, 'ISBN is required'],
    unique: true,
    trim: true
  },
  publishedYear: {
    type: Number,
    min: [1000, 'Published year must be valid'],
    max: [new Date().getFullYear(), 'Published year cannot be in the future']
  },
  genre: {
    type: String,
    trim: true
  },
  availableCopies: {
    type: Number,
    default: 1,
    min: [0, 'Available copies cannot be negative']
  },
  totalCopies: {
    type: Number,
    default: 1,
    min: [1, 'Total copies must be at least 1']
  }
}, {
  timestamps: true
});

// Validation: availableCopies cannot exceed totalCopies
bookSchema.pre('save', function(next) {
  if (this.availableCopies > this.totalCopies) {
    next(new Error('Available copies cannot exceed total copies'));
  }
  next();
});

module.exports = mongoose.model('Book', bookSchema);
