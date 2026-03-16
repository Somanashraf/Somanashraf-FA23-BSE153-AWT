const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');

/**
 * Book Routes
 * RESTful routes for book resource
 */

// GET /api/books - Retrieve all books
router.get('/', bookController.getAllBooks);

// GET /api/books/:id - Retrieve a specific book
router.get('/:id', bookController.getBookById);

// POST /api/books - Create a new book
router.post('/', bookController.createBook);

// PUT /api/books/:id - Update a book
router.put('/:id', bookController.updateBook);

// DELETE /api/books/:id - Delete a book
router.delete('/:id', bookController.deleteBook);

module.exports = router;
