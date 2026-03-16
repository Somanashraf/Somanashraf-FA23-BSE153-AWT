const express = require('express');
const router = express.Router();
const memberController = require('../controllers/memberController');
const borrowController = require('../controllers/borrowController');

/**
 * Member Routes
 * RESTful routes for member resource and nested borrowed-books resource
 */

// GET /api/members - Retrieve all members
router.get('/', memberController.getAllMembers);

// GET /api/members/:id - Retrieve a specific member
router.get('/:id', memberController.getMemberById);

// POST /api/members - Create a new member
router.post('/', memberController.createMember);

// PUT /api/members/:id - Update a member
router.put('/:id', memberController.updateMember);

// DELETE /api/members/:id - Delete a member
router.delete('/:id', memberController.deleteMember);

// Hierarchical routes for member's borrowed books
// GET /api/members/:memberId/borrowed-books - Get all books borrowed by a member
router.get('/:memberId/borrowed-books', borrowController.getMemberBorrowedBooks);

// POST /api/members/:memberId/borrowed-books - Borrow a book for a member
router.post('/:memberId/borrowed-books', borrowController.borrowBook);

// PUT /api/members/:memberId/borrowed-books/:recordId - Return a borrowed book
router.put('/:memberId/borrowed-books/:recordId', borrowController.returnBook);

module.exports = router;
