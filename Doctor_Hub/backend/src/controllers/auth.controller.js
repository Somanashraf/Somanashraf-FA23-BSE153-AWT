const { body } = require('express-validator');
const authService = require('../services/auth.service');
const asyncHandler = require('../middleware/asyncHandler');

exports.registerValidation = [body('fullName').isLength({ min: 3 }), body('email').isEmail(), body('password').isStrongPassword(), body('phone').isLength({ min: 8 })];
exports.loginValidation = [body('email').isEmail(), body('password').notEmpty()];

exports.register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  res.status(201).json({ success: true, data: result });
});

exports.login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body.email, req.body.password);
  res.json({ success: true, data: result });
});

exports.refresh = asyncHandler(async (req, res) => {
  const result = await authService.refresh(req.body.refreshToken);
  res.json({ success: true, data: result });
});
