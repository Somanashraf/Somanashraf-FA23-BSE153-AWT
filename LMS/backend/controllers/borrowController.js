const BorrowRecord = require('../models/BorrowRecord');
const Book = require('../models/Book');
const Member = require('../models/Member');

/**
 * Borrow Controller
 * Handles book borrowing and returning logic
 */

// GET /api/members/:memberId/borrowed-books - Get all books borrowed by a member
exports.getMemberBorrowedBooks = async (req, res) => {
  try {
    const records = await BorrowRecord.find({ 
      memberId: req.params.memberId 
    })
    .populate('bookId')
    .populate('memberId')
    .sort({ borrowDate: -1 });
    
    res.status(200).json({
      success: true,
      count: records.length,
      data: records
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving borrowed books',
      error: error.message
    });
  }
};

// POST /api/members/:memberId/borrowed-books - Borrow a book for a member
exports.borrowBook = async (req, res) => {
  try {
    const { bookId, dueDate } = req.body;
    const memberId = req.params.memberId;
    
    // Check if member exists
    const member = await Member.findById(memberId);
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }
    
    // Check if member is active
    if (member.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Member account is inactive'
      });
    }
    
    // Check if book exists and is available
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }
    
    if (book.availableCopies < 1) {
      return res.status(400).json({
        success: false,
        message: 'No copies available for borrowing'
      });
    }
    
    // Create borrow record
    const borrowRecord = await BorrowRecord.create({
      memberId,
      bookId,
      dueDate
    });
    
    // Decrease available copies
    book.availableCopies -= 1;
    await book.save();
    
    const populatedRecord = await BorrowRecord.findById(borrowRecord._id)
      .populate('bookId')
      .populate('memberId');
    
    res.status(201).json({
      success: true,
      message: 'Book borrowed successfully',
      data: populatedRecord
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error borrowing book',
      error: error.message
    });
  }
};

// PUT /api/members/:memberId/borrowed-books/:recordId - Return a borrowed book
exports.returnBook = async (req, res) => {
  try {
    const { recordId } = req.params;
    
    const borrowRecord = await BorrowRecord.findById(recordId)
      .populate('bookId')
      .populate('memberId');
    
    if (!borrowRecord) {
      return res.status(404).json({
        success: false,
        message: 'Borrow record not found'
      });
    }
    
    if (borrowRecord.status === 'returned') {
      return res.status(400).json({
        success: false,
        message: 'Book already returned'
      });
    }
    
    // Update borrow record
    borrowRecord.returnDate = new Date();
    borrowRecord.status = 'returned';
    await borrowRecord.save();
    
    // Increase available copies
    const book = await Book.findById(borrowRecord.bookId);
    book.availableCopies += 1;
    await book.save();
    
    res.status(200).json({
      success: true,
      message: 'Book returned successfully',
      data: borrowRecord
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error returning book',
      error: error.message
    });
  }
};

// GET /api/borrow-records - Get all borrow records
exports.getAllBorrowRecords = async (req, res) => {
  try {
    const records = await BorrowRecord.find()
      .populate('bookId')
      .populate('memberId')
      .sort({ borrowDate: -1 });
    
    res.status(200).json({
      success: true,
      count: records.length,
      data: records
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving borrow records',
      error: error.message
    });
  }
};
