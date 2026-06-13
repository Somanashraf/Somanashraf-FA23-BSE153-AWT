import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Upload, CheckCircle, Clock, AlertCircle, FileText, Download, Star } from 'lucide-react';
import { appointmentService, paymentService } from '../../services/appointmentService';
import { useToast } from '../../hooks/useToast';
import Button from '../../components/ui/Button';
import AppointmentStatusBadge from '../../components/shared/AppointmentStatusBadge';
import Modal from '../../components/ui/Modal';
import { formatDate, formatTime, formatCurrency, getInitials } from '../../lib/utils';

const WORKFLOW_STEPS = [
  { key: 'pending', label: 'Booked' },
  { key: 'payment_pending', label: 'Pay' },
  { key: 'payment_uploaded', label: 'Uploaded' },
  { key: 'payment_verified', label: 'Verified' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'completed', label: 'Done' },
];

const statusOrder = ['pending', 'payment_pending', 'payment_uploaded', 'payment_verified', 'confirmed', 'in_progress', 'completed'];

const AppointmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const fileRef = useRef();
  const [appt, setAppt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [ratingOpen, setRatingOpen] = useState(false);
  const [ratingScore, setRatingScore] = useState(5);
  const [ratingReview, setRatingReview] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  const [transactionId, setTransactionId] = useState('');
  const [file, setFile] = useState(null);

  const load = async () => {
    try {
      const res = await appointmentService.getAppointmentById(id);
      setAppt(res.data?.data?.appointment);
    } catch { toast.error('Appointment not found'); navigate('/patient/appointments'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [id]);

  const handleUpload = async () => {
    if (!file) { toast.error('Please select a file'); return; }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('screenshot', file);
      fd.append('paymentMethod', paymentMethod);
      if (transactionId) fd.append('transactionId', transactionId);
      await paymentService.uploadProof(id, fd);
      toast.success('Payment uploaded! Awaiting verification.');
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Upload failed'); }
    finally { setUploading(false); setFile(null); }
  };

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await appointmentService.updateAppointment(id, { status: 'cancelled', cancellationReason: 'Cancelled by patient' });
      toast.success('Appointment cancelled');
      setCancelOpen(false);
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Cannot cancel'); }
    finally { setCancelling(false); }
  };

  const handleRate = async () => {
    try {
      await appointmentService.rateAppointment(id, { score: ratingScore, review: ratingReview });
      toast.success('Rating submitted. Thank you!');
      setRatingOpen(false);
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Rating failed'); }
  };

  if (loading) return <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-32 rounded-xl" />)}</div>;
  if (!appt) return null;

  const doc = appt.doctor?.user;
  const currentStepIdx = statusOrder.indexOf(appt.status);
  const workflowIdx = WORKFLOW_STEPS.findIndex((s) => s.key === appt.status);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-slate-500 hover:text-primary-600 transition-colors">
        <ChevronLeft className="w-4 h-4" /> Back
      </button>

      {/* Progress workflow */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-6 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-800 dark:text-white">Appointment Progress</h2>
          <AppointmentStatusBadge status={appt.status} />
        </div>
        <div className="flex items-center">
          {WORKFLOW_STEPS.map((step, i) => {
            const done = currentStepIdx >= statusOrder.indexOf(step.key);
            const current = step.key === appt.status;
            return (
              <div key={step.key} className="flex items-center flex-1 last:flex-none">
                <div className={`flex flex-col items-center gap-1`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${done ? 'bg-primary-600 border-primary-600 text-white' : current ? 'border-primary-600 text-primary-600 bg-primary-50' : 'border-gray-200 text-gray-400 bg-white dark:bg-slate-800 dark:border-slate-600'}`}>
                    {done && !current ? <CheckCircle className="w-4 h-4" /> : i + 1}
                  </div>
                  <span className={`text-xs whitespace-nowrap ${done ? 'text-primary-600 font-medium' : 'text-slate-400'}`}>{step.label}</span>
                </div>
                {i < WORKFLOW_STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-1 ${done && statusOrder.indexOf(WORKFLOW_STEPS[i + 1].key) <= currentStepIdx ? 'bg-primary-600' : 'bg-gray-200 dark:bg-slate-600'}`} />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Appointment info */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-6 shadow-card">
        <div className="flex items-start gap-4 mb-5">
          <div className="w-14 h-14 rounded-xl bg-gradient-primary flex items-center justify-center text-white font-bold text-lg overflow-hidden flex-shrink-0">
            {doc?.profilePicture?.url ? <img src={doc.profilePicture.url} alt="" className="w-full h-full object-cover" /> : getInitials(doc?.firstName, doc?.lastName)}
          </div>
          <div>
            <h3 className="font-semibold text-lg text-slate-800 dark:text-white">Dr. {doc?.firstName} {doc?.lastName}</h3>
            <p className="text-sm text-primary-600 dark:text-primary-400">{appt.doctor?.specialization?.[0]}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
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
        {appt.symptoms && <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/30"><p className="text-xs text-amber-600 dark:text-amber-400 font-medium mb-1">Symptoms</p><p className="text-sm text-slate-700 dark:text-slate-300">{appt.symptoms}</p></div>}
      </div>

      {/* Payment section */}
      {appt.status === 'payment_pending' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-amber-200 dark:border-amber-900/40 p-6 shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            <h3 className="font-semibold text-slate-800 dark:text-white">Payment Required</h3>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-5">Please pay <strong className="text-primary-600">{formatCurrency(appt.consultationFee)}</strong> and upload your payment screenshot to confirm your appointment.</p>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Payment Method</label>
              <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white">
                {['bank_transfer', 'easypaisa', 'jazzcash', 'sadapay', 'nayapay', 'other'].map((m) => (
                  <option key={m} value={m}>{m.replace('_', ' ').toUpperCase()}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Transaction ID (Optional)</label>
              <input value={transactionId} onChange={(e) => setTransactionId(e.target.value)} placeholder="Enter transaction reference"
                className="w-full px-3 py-2.5 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Payment Screenshot *</label>
              <div onClick={() => fileRef.current?.click()} className="border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-xl p-6 text-center cursor-pointer hover:border-primary-400 transition-colors">
                {file ? (<p className="text-sm text-emerald-600 font-medium">✓ {file.name}</p>) : (<><Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" /><p className="text-sm text-slate-500">Click to upload screenshot</p><p className="text-xs text-slate-400 mt-1">JPG, PNG, PDF up to 10MB</p></>)}
              </div>
              <input ref={fileRef} type="file" accept="image/*,.pdf" onChange={(e) => setFile(e.target.files[0])} className="hidden" />
            </div>
            <Button onClick={handleUpload} isLoading={uploading} variant="gradient" fullWidth size="lg" leftIcon={<Upload className="w-4 h-4" />}>
              Upload Payment Proof
            </Button>
          </div>
        </div>
      )}

      {/* Payment status */}
      {appt.payment && appt.status !== 'payment_pending' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-5 shadow-card">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-3">Payment Details</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-3"><p className="text-xs text-slate-400 mb-0.5">Amount</p><p className="font-bold text-slate-800 dark:text-white">{formatCurrency(appt.payment.amount)}</p></div>
            <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-3"><p className="text-xs text-slate-400 mb-0.5">Status</p><AppointmentStatusBadge status={appt.payment.status} /></div>
          </div>
          {appt.payment.verificationNote && <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 bg-emerald-50 dark:bg-emerald-900/10 p-3 rounded-lg">✓ {appt.payment.verificationNote}</p>}
          {appt.payment.rejectionReason && <p className="mt-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 p-3 rounded-lg">✗ {appt.payment.rejectionReason}</p>}
        </div>
      )}

      {/* Prescription */}
      {appt.prescription && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-5 shadow-card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-800 dark:text-white">Prescription</h3>
            <Button variant="outline" size="sm" leftIcon={<FileText className="w-4 h-4" />} onClick={() => navigate(`/patient/prescriptions/${appt.prescription._id}`)}>
              View Details
            </Button>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">{appt.prescription.diagnosis}</p>
          <p className="text-xs text-slate-400 mt-1">{appt.prescription.medicines?.length || 0} medicine(s) prescribed</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        {['pending', 'payment_pending'].includes(appt.status) && (
          <Button variant="danger" onClick={() => setCancelOpen(true)} className="flex-1">Cancel Appointment</Button>
        )}
        {appt.status === 'completed' && !appt.rating?.score && (
          <Button variant="outline" onClick={() => setRatingOpen(true)} leftIcon={<Star className="w-4 h-4" />} className="flex-1">Rate this Appointment</Button>
        )}
      </div>

      {/* Cancel modal */}
      <Modal isOpen={cancelOpen} onClose={() => setCancelOpen(false)} title="Cancel Appointment" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">Are you sure you want to cancel this appointment? This action cannot be undone.</p>
          <div className="flex gap-3">
            <Button variant="outline" fullWidth onClick={() => setCancelOpen(false)}>Keep</Button>
            <Button variant="danger" fullWidth isLoading={cancelling} onClick={handleCancel}>Yes, Cancel</Button>
          </div>
        </div>
      </Modal>

      {/* Rating modal */}
      <Modal isOpen={ratingOpen} onClose={() => setRatingOpen(false)} title="Rate Your Experience" size="sm">
        <div className="space-y-4">
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <button key={s} onClick={() => setRatingScore(s)}>
                <Star className={`w-8 h-8 transition-colors ${s <= ratingScore ? 'text-amber-400 fill-current' : 'text-gray-300'}`} />
              </button>
            ))}
          </div>
          <textarea value={ratingReview} onChange={(e) => setRatingReview(e.target.value)} rows={3} placeholder="Share your experience..."
            className="w-full px-3 py-2.5 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white resize-none" />
          <div className="flex gap-3">
            <Button variant="outline" fullWidth onClick={() => setRatingOpen(false)}>Cancel</Button>
            <Button variant="gradient" fullWidth onClick={handleRate}>Submit Rating</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
export default AppointmentDetail;
