const { Router } = require('express');
const controller = require('../controllers/admin.controller');
const { authenticate, authorize } = require('../middleware/auth');

const router = Router();
router.get('/analytics', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), controller.dashboard);
router.get('/users', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), controller.users);
module.exports = router;
