const doctorService = require('../services/doctor.service');
const asyncHandler = require('../middleware/asyncHandler');

exports.search = asyncHandler(async (req, res) => {
  const doctors = await doctorService.search(req.query);
  res.json({ success: true, data: doctors });
});

exports.clinics = asyncHandler(async (req, res) => {
  const clinics = await doctorService.clinics(req.params.doctorId);
  res.json({ success: true, data: clinics });
});

exports.schedules = asyncHandler(async (req, res) => {
  const schedules = await doctorService.schedules(req.params.doctorId);
  res.json({ success: true, data: schedules });
});
