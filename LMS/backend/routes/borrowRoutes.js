const express = require('express');
const router = express.Router();
const borrowController = require('../controllers/borrowController');

/**
 * Borrow Routes
 * Routes for borrow records
 */

// GET /api/borrow-records - Get all borrow records
router.get('/', borrowController.getAllBorrowRecords);

module.exports = router;
