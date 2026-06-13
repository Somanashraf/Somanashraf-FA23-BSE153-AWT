import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, ChevronLeft, ExternalLink } from 'lucide-react';
import { paymentService } from '../../services/appointmentService';
import { useToast } from '../../hooks/useToast';
import Button from '../../components/ui/Button';
import AppointmentStatusBadge from '../../components/shared/AppointmentStatusBadge';
import { formatDate, formatCurrency, getInitials } from '../../lib/utils';

const PaymentVerification = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verifyNote, setVerifyNote] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await paymentService.getPaymentById(id);
        setPayment(res.data?.data?.payment);
      } catch { toast.error('Payment not found'); navigate('/assistant/payments'); }
      finally { setLoading(false); }
    };
    load();
  }, [id]);

  const handle = async (status) => {
    setProcessing(true);
    try {
      await paymentService.verifyPayment(id, {
        status,
        verificationNote: verifyNote,
        rejectionReason: rejectReason,
      });
      toast.success(`Payment ${status}`);
      navigate('/assistant/payments');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setProcessing(false); }
  };

  if (loading) return <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-32 rounded-xl" />)}</div>;
  if (!payment) return null;

  const pat = payment.patient;
  const appt = payment.appointment;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-slate-500 hover:text-primary-600 transition-colors">
        <ChevronLeft className="w-4 h-4" /> Back
      </button>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-6 shadow-card">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Payment Verification</h2>
          <AppointmentStatusBadge status={payment.status} />
        </div>

        <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl mb-5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold">
            {pat ? getInitials(pat.firstName, pat.lastName) : 'P'}
          </div>
          <div>
            <p className="font-semibold text-slate-800 dark:text-white">{pat?.firstName} {pat?.lastName}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{pat?.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-5">
          {[
            { label: 'Amount', value: formatCurrency(payment.amount) },
            { label: 'Method', value: payment.paymentMethod?.replace('_', ' ') || '—' },
            { label: 'Transaction ID', value: payment.transactionId || '—' },
            { label: 'Uploaded', value: formatDate(payment.screenshot?.uploadedAt) },
          ].map((item) => (
            <div key={item.label} className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-3">
              <p className="text-xs text-slate-400 mb-0.5">{item.label}</p>
              <p className="font-semibold text-sm text-slate-800 dark:text-white capitalize">{item.value}</p>
            </div>
          ))}
        </div>

        {payment.screenshot?.url && (
          <div className="mb-5">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Payment Screenshot</p>
            <div className="relative group">
              <img src={payment.screenshot.url} alt="Payment proof" className="w-full max-h-64 object-contain rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700" />
              <a href={payment.screenshot.url} target="_blank" rel="noreferrer"
                className="absolute top-2 right-2 p-2 bg-white/90 dark:bg-slate-800/90 rounded-lg shadow opacity-0 group-hover:opacity-100 transition-opacity">
                <ExternalLink className="w-4 h-4 text-slate-600 dark:text-slate-300" />
              </a>
            </div>
          </div>
        )}

        {payment.status === 'uploaded' && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Verification Note</label>
              <textarea value={verifyNote} onChange={(e) => setVerifyNote(e.target.value)} rows={2} placeholder="Optional note for patient..."
                className="w-full px-3 py-2.5 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white resize-none" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Rejection Reason (if rejecting)</label>
              <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} rows={2} placeholder="Required if rejecting payment..."
                className="w-full px-3 py-2.5 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white resize-none" />
            </div>
            <div className="flex gap-3">
              <Button variant="danger" fullWidth isLoading={processing} leftIcon={<XCircle className="w-4 h-4" />} onClick={() => handle('rejected')}>
                Reject Payment
              </Button>
              <Button variant="success" fullWidth isLoading={processing} leftIcon={<CheckCircle className="w-4 h-4" />} onClick={() => handle('verified')}>
                Verify Payment
              </Button>
            </div>
          </div>
        )}

        {payment.status !== 'uploaded' && (
          <div className={`p-4 rounded-xl ${payment.status === 'verified' ? 'bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100' : 'bg-red-50 dark:bg-red-900/10 border border-red-100'}`}>
            <p className="font-semibold text-sm mb-1">{payment.status === 'verified' ? '✅ Payment Verified' : '❌ Payment Rejected'}</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">{payment.verificationNote || payment.rejectionReason}</p>
          </div>
        )}
      </div>
    </div>
  );
};
export default PaymentVerification;
