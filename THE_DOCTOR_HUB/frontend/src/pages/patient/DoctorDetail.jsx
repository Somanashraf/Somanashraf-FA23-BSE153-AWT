import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, MapPin, Award, Clock, DollarSign, Phone, Building2, CheckCircle, Calendar, ChevronLeft } from 'lucide-react';
import { doctorService } from '../../services/doctorService';
import { appointmentService } from '../../services/appointmentService';
import { scheduleService } from '../../services/scheduleService';
import { useToast } from '../../hooks/useToast';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { formatCurrency, formatDate, getInitials } from '../../lib/utils';

const timeSlots = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'];
const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

const DoctorDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingStep, setBookingStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedClinic, setSelectedClinic] = useState('');
  const [appointmentType, setAppointmentType] = useState('in-person');
  const [symptoms, setSymptoms] = useState('');
  const [booking, setBooking] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await doctorService.getDoctorById(id);
        setDoctor(res.data?.data?.doctor);
      } catch { toast.error('Doctor not found'); navigate('/patient/doctors'); }
      finally { setLoading(false); }
    };
    load();
  }, [id]);

  const handleDateSelect = async (date) => {
    setSelectedDate(date);
    setSelectedTime('');
    setLoadingSlots(true);
    try {
      const res = await scheduleService.getAvailableSlots(doctor._id, date);
      setAvailableSlots(res.data?.data?.slots || []);
    } catch {
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleBook = async () => {
    if (!selectedDate || !selectedTime) { toast.error('Please select date and time'); return; }
    setBooking(true);
    try {
      const res = await appointmentService.bookAppointment({
        doctorId: doctor._id, clinicId: selectedClinic || undefined,
        appointmentDate: selectedDate, appointmentTime: selectedTime,
        type: appointmentType, symptoms,
      });
      toast.success('Appointment booked! Please upload payment.');
      setBookingOpen(false);
      navigate(`/patient/appointments/${res.data?.data?.appointment?._id}`);
    } catch (err) { toast.error(err.response?.data?.message || 'Booking failed'); }
    finally { setBooking(false); }
  };

  if (loading) return (
    <div className="space-y-4">
      <div className="skeleton h-48 rounded-2xl" />
      <div className="grid grid-cols-3 gap-4">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-24 rounded-xl" />)}</div>
    </div>
  );

  if (!doctor) return null;
  const user = doctor.user || {};
  const rating = doctor.rating?.average || 0;

  // Generate next 14 days
  const availableDates = [];
  for (let i = 1; i <= 14; i++) {
    const d = new Date(); d.setDate(d.getDate() + i);
    const dayName = days[d.getDay()];
    if (doctor.availability?.[dayName]?.isOpen) {
      availableDates.push({ date: d.toISOString().split('T')[0], label: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) });
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
        <ChevronLeft className="w-4 h-4" /> Back to Doctors
      </button>

      {/* Profile card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-card overflow-hidden">
        <div className="h-28 bg-gradient-primary" />
        <div className="px-6 pb-6">
          <div className="flex items-end gap-5 -mt-14 mb-5">
            <div className="w-24 h-24 rounded-2xl border-4 border-white dark:border-slate-800 bg-gradient-primary flex items-center justify-center text-white text-2xl font-bold overflow-hidden flex-shrink-0">
              {user.profilePicture?.url ? <img src={user.profilePicture.url} alt="" className="w-full h-full object-cover" /> : getInitials(user.firstName, user.lastName)}
            </div>
            <div className="flex-1 pb-2">
              <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Dr. {user.firstName} {user.lastName}</h1>
              <p className="text-primary-600 dark:text-primary-400 font-medium">{doctor.specialization?.join(', ')}</p>
            </div>
            <Button onClick={() => setBookingOpen(true)} variant="gradient" size="lg" className="self-end" leftIcon={<Calendar className="w-4 h-4" />}>
              Book Appointment
            </Button>
          </div>

          <div className="flex flex-wrap gap-3 mb-5">
            <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
              <Star className="w-4 h-4 text-amber-400 fill-current" />
              <span className="font-semibold text-slate-800 dark:text-white">{rating.toFixed(1)}</span>
              <span>({doctor.rating?.count || 0} reviews)</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
              <Award className="w-4 h-4 text-primary-400" />
              <span>{doctor.experience} years experience</span>
            </div>
            {user.address?.city && (
              <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span>{user.address.city}</span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mb-5">
            <Badge variant={doctor.doctorType === 'allopathic' ? 'primary' : doctor.doctorType === 'homeopathic' ? 'secondary' : 'purple'}>
              {doctor.doctorType}
            </Badge>
            {doctor.treatmentTypes?.map((t) => <Badge key={t} variant="default">{t}</Badge>)}
          </div>

          {doctor.about && <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{doctor.about}</p>}
        </div>
      </motion.div>

      {/* Fee cards */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: 'In-Person Fee', value: formatCurrency(doctor.consultationFee), icon: Building2 },
          { label: 'Online Fee', value: formatCurrency(doctor.consultationFeeOnline), icon: Clock },
        ].map((item, i) => (
          <motion.div key={item.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-5 flex items-center gap-4 shadow-card">
            <div className="w-12 h-12 bg-primary-50 dark:bg-primary-900/20 rounded-xl flex items-center justify-center">
              <item.icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div><p className="text-xs text-slate-500 dark:text-slate-400">{item.label}</p><p className="text-2xl font-bold text-slate-800 dark:text-white">{item.value}</p></div>
          </motion.div>
        ))}
      </div>

      {/* Qualifications */}
      {doctor.qualifications?.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-5 shadow-card">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Qualifications</h3>
          <div className="space-y-3">
            {doctor.qualifications.map((q, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-8 h-8 bg-primary-50 dark:bg-primary-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Award className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <p className="font-medium text-sm text-slate-800 dark:text-white">{q.degree}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{q.institution}{q.year && `, ${q.year}`}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Clinics */}
      {doctor.clinics?.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-5 shadow-card">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Clinic Locations</h3>
          <div className="space-y-3">
            {doctor.clinics.map((clinic) => (
              <div key={clinic._id} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                <Building2 className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm text-slate-800 dark:text-white">{clinic.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{clinic.address?.street}, {clinic.address?.city}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{clinic.workingDays?.join(', ')} · {clinic.openingTime} - {clinic.closingTime}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Booking Modal */}
      <Modal isOpen={bookingOpen} onClose={() => { setBookingOpen(false); setBookingStep(1); }} title="Book Appointment" size="md">
        {bookingStep === 1 ? (
          <div className="space-y-5">
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">Appointment Type</label>
              <div className="grid grid-cols-2 gap-3">
                {[{ val: 'in-person', label: '🏥 In-Person', fee: formatCurrency(doctor.consultationFee) },
                  { val: 'online', label: '💻 Online', fee: formatCurrency(doctor.consultationFeeOnline) }].map((t) => (
                  <button key={t.val} onClick={() => setAppointmentType(t.val)}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${appointmentType === t.val ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-200 dark:border-slate-600'}`}>
                    <p className="font-medium text-sm text-slate-800 dark:text-white">{t.label}</p>
                    <p className="text-xs text-primary-600 dark:text-primary-400 mt-0.5">{t.fee}</p>
                  </button>
                ))}
              </div>
            </div>

            {doctor.clinics?.length > 0 && appointmentType === 'in-person' && (
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">Select Clinic</label>
                <select value={selectedClinic} onChange={(e) => setSelectedClinic(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white">
                  <option value="">Select a clinic</option>
                  {doctor.clinics.map((c) => <option key={c._id} value={c._id}>{c.name} - {c.address?.city}</option>)}
                </select>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">Select Date</label>
              {availableDates.length === 0 ? (
                <p className="text-sm text-red-500">No available dates. Doctor schedule not set.</p>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {availableDates.slice(0, 9).map((d) => (
                    <button key={d.date} onClick={() => handleDateSelect(d.date)}
                      className={`p-2 rounded-lg border text-xs text-center transition-all ${selectedDate === d.date ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 font-semibold' : 'border-gray-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:border-primary-300'}`}>
                      {d.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selectedDate && (
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">Select Time</label>
                {loadingSlots ? (
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                    Loading available slots...
                  </div>
                ) : availableSlots.length === 0 ? (
                  <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/10 p-3 rounded-lg">
                    No available time slots for this date. Please select another date.
                  </p>
                ) : (
                  <div className="grid grid-cols-4 gap-2">
                    {availableSlots.map((t) => (
                      <button key={t} onClick={() => setSelectedTime(t)}
                        className={`p-2 rounded-lg border text-xs text-center transition-all ${selectedTime === t ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 font-semibold' : 'border-gray-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:border-primary-300'}`}>
                        {t}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">Symptoms / Reason</label>
              <textarea value={symptoms} onChange={(e) => setSymptoms(e.target.value)} rows={3} placeholder="Describe your symptoms..."
                className="w-full px-3 py-2.5 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white resize-none" />
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setBookingOpen(false)} fullWidth>Cancel</Button>
              <Button variant="gradient" onClick={handleBook} isLoading={booking} fullWidth disabled={!selectedDate || !selectedTime}>
                Confirm Booking
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};
export default DoctorDetail;
