const { Router } = require('express');
const controller = require('../controllers/doctor.controller');
const { authenticate } = require('../middleware/auth');

const router = Router();
router.get('/', authenticate, controller.search);
router.get('/:doctorId/clinics', authenticate, controller.clinics);
router.get('/:doctorId/schedules', authenticate, controller.schedules);
module.exports = router;
