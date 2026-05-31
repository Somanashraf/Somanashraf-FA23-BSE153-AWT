const analyticsService = require('../services/analytics.service');
const userRepository = require('../repositories/user.repository');
const asyncHandler = require('../middleware/asyncHandler');

exports.dashboard = asyncHandler(async (req, res) => {
  const data = await analyticsService.dashboard();
  res.json({ success: true, data });
});

exports.users = asyncHandler(async (req, res) => {
  const users = await userRepository.list();
  res.json({ success: true, data: users });
});
