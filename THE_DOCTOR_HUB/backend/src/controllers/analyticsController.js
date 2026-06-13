import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import Appointment from '../models/Appointment.js';
import Payment from '../models/Payment.js';
import Prescription from '../models/Prescription.js';
import AuditLog from '../models/AuditLog.js';
import { successResponse, ApiError } from '../utils/apiResponse.js';

// @GET /api/analytics/overview (Admin+)
export const getOverview = async (req, res, next) => {
  try {
    const [
      totalUsers, totalDoctors, totalPatients, totalAppointments,
      pendingApprovals, totalPayments, completedAppointments,
      cancelledAppointments, totalPrescriptions,
    ] = await Promise.all([
      User.countDocuments({ isActive: true }),
      Doctor.countDocuments({ isApproved: true }),
      User.countDocuments({ role: 'patient', isActive: true }),
      Appointment.countDocuments(),
      Doctor.countDocuments({ isApproved: false }),
      Payment.countDocuments({ status: 'verified' }),
      Appointment.countDocuments({ status: 'completed' }),
      Appointment.countDocuments({ status: 'cancelled' }),
      Prescription.countDocuments(),
    ]);

    const totalRevenue = await Payment.aggregate([
      { $match: { status: 'verified' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    return successResponse(res, 200, 'Overview retrieved', {
      totalUsers,
      totalDoctors,
      totalPatients,
      totalAppointments,
      pendingApprovals,
      totalPayments,
      completedAppointments,
      cancelledAppointments,
      totalPrescriptions,
      totalRevenue: totalRevenue[0]?.total || 0,
    });
  } catch (error) {
    next(error);
  }
};

// @GET /api/analytics/appointments-trend (Admin+)
export const getAppointmentsTrend = async (req, res, next) => {
  try {
    const { months = 12 } = req.query;
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - Number(months));

    const trend = await Appointment.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
          },
          cancelled: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] },
          },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    return successResponse(res, 200, 'Appointment trend retrieved', { trend });
  } catch (error) {
    next(error);
  }
};

// @GET /api/analytics/revenue-trend (Admin+)
export const getRevenueTrend = async (req, res, next) => {
  try {
    const { months = 12 } = req.query;
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - Number(months));

    const trend = await Payment.aggregate([
      { $match: { status: 'verified', createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          revenue: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    return successResponse(res, 200, 'Revenue trend retrieved', { trend });
  } catch (error) {
    next(error);
  }
};

// @GET /api/analytics/user-growth (Admin+)
export const getUserGrowth = async (req, res, next) => {
  try {
    const { months = 12 } = req.query;
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - Number(months));

    const growth = await User.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            role: '$role',
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    return successResponse(res, 200, 'User growth retrieved', { growth });
  } catch (error) {
    next(error);
  }
};

// @GET /api/analytics/doctor-stats (Doctor)
export const getDoctorStats = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) throw new ApiError(404, 'Doctor profile not found');

    const [
      totalAppointments, completedAppointments, pendingAppointments,
      totalRevenue, recentAppointments,
    ] = await Promise.all([
      Appointment.countDocuments({ doctor: doctor._id }),
      Appointment.countDocuments({ doctor: doctor._id, status: 'completed' }),
      Appointment.countDocuments({ doctor: doctor._id, status: { $in: ['confirmed', 'payment_verified'] } }),
      Payment.aggregate([
        { $match: { doctor: doctor._id, status: 'verified' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Appointment.find({ doctor: doctor._id })
        .populate('patient', 'firstName lastName profilePicture')
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    const monthlyStats = await Appointment.aggregate([
      { $match: { doctor: doctor._id, createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)) } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    return successResponse(res, 200, 'Doctor stats retrieved', {
      totalAppointments,
      completedAppointments,
      pendingAppointments,
      totalRevenue: totalRevenue[0]?.total || 0,
      rating: doctor.rating,
      totalPatients: doctor.totalPatients,
      recentAppointments,
      monthlyStats,
    });
  } catch (error) {
    next(error);
  }
};

// @GET /api/analytics/audit-logs (Super Admin)
export const getAuditLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, userId, action, startDate, endDate } = req.query;
    const query = {};

    if (userId) query.user = userId;
    if (action) query.action = new RegExp(action, 'i');
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .populate('user', 'firstName lastName email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      AuditLog.countDocuments(query),
    ]);

    return successResponse(res, 200, 'Audit logs retrieved', {
      logs,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    next(error);
  }
};
