import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, CheckCircle, XCircle, FileText, Plus, ClipboardList } from 'lucide-react';
import { motion } from 'framer-motion';
import { appointmentService } from '../../services/appointmentService';
import { useToast } from '../../hooks/useToast';
import Button from '../../components/ui/Button';
import AppointmentStatusBadge from '../../components/shared/AppointmentStatusBadge';
import Modal from '../../components/ui/Modal';
import { formatDate, formatTime, formatCurrency, getInitials } from '../../lib/utils';

const DoctorAppointmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [appt, setAppt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rejectModal, setRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [processing, setProcessing] = useState(false);

  const load = async () => {
    try {
      const res = await appointmentService.getAppointmentById(id);
      setAppt(res.data?.data?.appointment);
    } catch { toast.error('Appointment not found'); navigate(-1); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [id]);

  const handleAction = async (status, extra = {}) => {
    setProcessing(true);
    try {
      await appointmentService.updateAppointment(id, { status, ...extra });
      toast.success(`Appointment ${status}`);
      setRejectModal(false);
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setProcessing(false); }
  };

  if (loading) return <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-32 rounded-xl" />)}</div>;
  if (!appt) return null;

  const patient = appt.patient;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-slate-500 hover:text-primary-600 transition-colors">
        <ChevronLeft className="w-4 h-4" /> Back to Appointments
      </button>

      {/* Patient info */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-6 shadow-card">
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white text-lg font-bold overflow-hidden">
              {patient?.profilePicture?.url
                ? <img src={patient.profilePicture.url} alt="" className="w-full h-full object-cover" />
                : getInitials(patient?.firstName, patient?.lastName)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">{patient?.firstName} {patient?.lastName}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">{patient?.email} · {patient?.phone}</p>
              {patient?.gender && <p className="text-xs text-slate-400 capitalize">{patient.gender} · {patient?.dateOfBirth ? formatDate(patient.dateOfBirth) : ''}</p>}
            </div>
          </div>
          <AppointmentStatusBadge status={appt.status} />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
          {[
            { label: 'Date', value: formatDate(appt.appointmentDate) },
            { label: 'Time', value: formatTime(appt.appointmentTime) },
            { label: 'Type', value: appt.type?.replace('-', ' ') },
            { label: 'Fee', value: formatCurrency(appt.consultationFee) },
            { label: 'Clinic', value: appt.clinic?.name || 'N/A' },
            { label: 'Booked', value: formatDate(appt.createdAt) },
          ].map((item) => (
            <div key={item.label} className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-3">
              <p className="text-xs text-slate-400 mb-0.5">{item.label}</p>
              <p className="font-medium text-slate-800 dark:text-white capitalize">{item.value}</p>
            </div>
          ))}
        </div>

        {appt.symptoms && (
          <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/30">
            <p className="text-xs font-semibold text-amber-600 mb-1">Patient's Symptoms</p>
            <p className="text-sm text-slate-700 dark:text-slate-300">{appt.symptoms}</p>
          </div>
        )}
      </div>

      {/* Payment info */}
      {appt.payment && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-5 shadow-card">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-3">Payment</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-lg text-slate-800 dark:text-white">{formatCurrency(appt.payment.amount)}</p>
              <p className="text-xs text-slate-400 capitalize">{appt.payment.paymentMethod?.replace('_', ' ')}</p>
            </div>
            <AppointmentStatusBadge status={appt.payment.status} />
          </div>
          {appt.payment.screenshot?.url && (
            <a href={appt.payment.screenshot.url} target="_blank" rel="noreferrer"
              className="mt-3 block text-xs text-primary-600 hover:underline">View Payment Screenshot →</a>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-5 shadow-card">
        <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Actions</h3>
        <div className="flex flex-wrap gap-3">
          {appt.status === 'payment_verified' && (
            <>
              <Button variant="success" onClick={() => handleAction('confirmed')} isLoading={processing} leftIcon={<CheckCircle className="w-4 h-4" />}>
                Confirm Appointment
              </Button>
              <Button variant="danger" onClick={() => setRejectModal(true)} leftIcon={<XCircle className="w-4 h-4" />}>
                Reject
              </Button>
            </>
          )}
          {appt.status === 'confirmed' && (
            <>
              <Button variant="secondary" onClick={() => handleAction('in_progress')} isLoading={processing}>
                Start Consultation
              </Button>
            </>
          )}
          {appt.status === 'in_progress' && (
            <>
              <Button variant="success" onClick={() => handleAction('completed')} isLoading={processing} leftIcon={<CheckCircle className="w-4 h-4" />}>
                Mark Completed
              </Button>
              {!appt.prescription && (
                <Button variant="primary" onClick={() => navigate('/doctor/prescriptions/new', { state: { appointmentId: id } })} leftIcon={<FileText className="w-4 h-4" />}>
                  Write Prescription
                </Button>
              )}
            </>
          )}
          {appt.status === 'completed' && (
            <>
              {!appt.prescription && (
                <Button variant="primary" onClick={() => navigate('/doctor/prescriptions/new', { state: { appointmentId: id } })} leftIcon={<FileText className="w-4 h-4" />}>
                  Write Prescription
                </Button>
              )}
              <Button variant="outline" onClick={() => navigate('/doctor/patients')} leftIcon={<ClipboardList className="w-4 h-4" />}>
                View Patient History
              </Button>
            </>
          )}
        </div>
        {appt.prescription && (
          <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-900/10 rounded-lg border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-between">
            <p className="text-sm text-emerald-700 dark:text-emerald-400">✅ Prescription already created</p>
            <Button size="xs" variant="outline" onClick={() => navigate(`/doctor/prescriptions/${appt.prescription._id || appt.prescription}`)}>
              View
            </Button>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      <Modal isOpen={rejectModal} onClose={() => setRejectModal(false)} title="Reject Appointment" size="sm">
        <div className="space-y-4">
          <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} rows={3}
            placeholder="Reason for rejection..."
            className="w-full px-3 py-2.5 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white resize-none" />
          <div className="flex gap-3">
            <Button variant="outline" fullWidth onClick={() => setRejectModal(false)}>Cancel</Button>
            <Button variant="danger" fullWidth isLoading={processing} onClick={() => handleAction('rejected', { rejectionReason: rejectReason })}>Reject</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
export default DoctorAppointmentDetail;
