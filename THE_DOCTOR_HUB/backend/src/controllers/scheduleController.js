import Doctor from '../models/Doctor.js';
import Appointment from '../models/Appointment.js';
import { successResponse, ApiError } from '../utils/apiResponse.js';

// @PUT /api/schedule/availability
export const updateAvailability = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) throw new ApiError(404, 'Doctor profile not found');

    const { availability, isAvailable } = req.body;

    if (availability) doctor.availability = availability;
    if (isAvailable !== undefined) doctor.isAvailable = isAvailable;

    await doctor.save();
    return successResponse(res, 200, 'Availability updated', { doctor });
  } catch (error) {
    next(error);
  }
};

// @GET /api/schedule/slots/:doctorId
export const getAvailableSlots = async (req, res, next) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;

    if (!date) throw new ApiError(400, 'Date is required');

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) throw new ApiError(404, 'Doctor not found');

    const requestedDate = new Date(date);
    const dayName = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'][requestedDate.getDay()];
    const dayAvailability = doctor.availability?.[dayName];

    if (!dayAvailability?.isOpen) {
      return successResponse(res, 200, 'Doctor not available on this day', { slots: [], isAvailable: false });
    }

    // Generate time slots from availability
    const allSlots = [];
    const slots = dayAvailability.slots || [{ start: '09:00', end: '17:00' }];

    slots.forEach(({ start, end }) => {
      const [startH, startM] = start.split(':').map(Number);
      const [endH, endM] = end.split(':').map(Number);
      let current = startH * 60 + startM;
      const endMinutes = endH * 60 + endM;

      while (current < endMinutes) {
        const h = Math.floor(current / 60);
        const m = current % 60;
        allSlots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
        current += 30; // 30 min slots
      }
    });

    // Remove already booked slots
    const bookedAppointments = await Appointment.find({
      doctor: doctorId,
      appointmentDate: {
        $gte: new Date(requestedDate.setHours(0, 0, 0, 0)),
        $lt: new Date(requestedDate.setHours(23, 59, 59, 999)),
      },
      status: { $nin: ['cancelled', 'rejected', 'no_show'] },
    }).select('appointmentTime');

    const bookedTimes = new Set(bookedAppointments.map((a) => a.appointmentTime));
    const availableSlots = allSlots.filter((slot) => !bookedTimes.has(slot));

    return successResponse(res, 200, 'Available slots retrieved', {
      slots: availableSlots,
      bookedSlots: [...bookedTimes],
      date,
      dayName,
      isAvailable: true,
    });
  } catch (error) {
    next(error);
  }
};

// @GET /api/schedule/calendar/:doctorId
export const getDoctorCalendar = async (req, res, next) => {
  try {
    const { doctorId } = req.params;
    const { month, year } = req.query;

    const startDate = new Date(Number(year), Number(month) - 1, 1);
    const endDate = new Date(Number(year), Number(month), 0);

    const appointments = await Appointment.find({
      doctor: doctorId,
      appointmentDate: { $gte: startDate, $lte: endDate },
      status: { $nin: ['cancelled', 'rejected'] },
    }).select('appointmentDate appointmentTime status patient')
      .populate('patient', 'firstName lastName');

    return successResponse(res, 200, 'Calendar retrieved', { appointments });
  } catch (error) {
    next(error);
  }
};
