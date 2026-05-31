const { Router } = require('express');
const controller = require('../controllers/auth.controller');
const validate = require('../middleware/validate');

const router = Router();
router.post('/register', controller.registerValidation, validate, controller.register);
router.post('/login', controller.loginValidation, validate, controller.login);
router.post('/refresh', controller.refresh);
module.exports = router;
