import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Eye, Calendar } from 'lucide-react';
import { appointmentService } from '../../services/appointmentService';
import { useToast } from '../../hooks/useToast';
import PageHeader from '../../components/shared/PageHeader';
import AppointmentStatusBadge from '../../components/shared/AppointmentStatusBadge';
import DataTable from '../../components/shared/DataTable';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { formatDate, formatTime, formatCurrency, getInitials } from '../../lib/utils';

const DoctorAppointments = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [rejectModal, setRejectModal] = useState({ open: false, id: null });
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (status) params.status = status;
      const res = await appointmentService.getAppointments(params);
      setAppointments(res.data?.data || []);
      setPagination(res.data?.pagination || {});
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [page, status]);

  const handleConfirm = async (id) => {
    setActionLoading(true);
    try {
      await appointmentService.updateAppointment(id, { status: 'confirmed' });
      toast.success('Appointment confirmed');
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setActionLoading(false); }
  };

  const handleReject = async () => {
    setActionLoading(true);
    try {
      await appointmentService.updateAppointment(rejectModal.id, { status: 'rejected', rejectionReason: rejectReason });
      toast.success('Appointment rejected');
      setRejectModal({ open: false, id: null });
      setRejectReason('');
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setActionLoading(false); }
  };

  const handleComplete = async (id) => {
    setActionLoading(true);
    try {
      await appointmentService.updateAppointment(id, { status: 'completed' });
      toast.success('Marked as completed');
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setActionLoading(false); }
  };

  const STATUSES = ['', 'payment_verified', 'confirmed', 'in_progress', 'completed', 'cancelled', 'rejected'];

  const columns = [
    { key: 'patient', header: 'Patient', render: (val) => (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
          {val ? getInitials(val.firstName, val.lastName) : 'P'}
        </div>
        <div><p className="font-medium text-sm">{val?.firstName} {val?.lastName}</p><p className="text-xs text-slate-400">{val?.phone || val?.email}</p></div>
      </div>
    )},
    { key: 'appointmentDate', header: 'Date & Time', render: (val, row) => <div><p className="text-sm font-medium">{formatDate(val)}</p><p className="text-xs text-slate-400">{formatTime(row.appointmentTime)}</p></div> },
    { key: 'type', header: 'Type', render: (val) => <span className="capitalize text-sm">{val}</span> },
    { key: 'consultationFee', header: 'Fee', render: (val) => <span className="font-semibold text-sm">{formatCurrency(val)}</span> },
    { key: 'status', header: 'Status', render: (val) => <AppointmentStatusBadge status={val} /> },
    { key: '_id', header: 'Actions', render: (val, row) => (
      <div className="flex items-center gap-1.5">
        <Button size="xs" variant="ghost" onClick={() => navigate(`/doctor/appointments/${val}`)}><Eye className="w-3.5 h-3.5" /></Button>
        {row.status === 'payment_verified' && (
          <>
            <Button size="xs" variant="success" onClick={() => handleConfirm(val)}><CheckCircle className="w-3.5 h-3.5" /></Button>
            <Button size="xs" variant="danger" onClick={() => setRejectModal({ open: true, id: val })}><XCircle className="w-3.5 h-3.5" /></Button>
          </>
        )}
        {row.status === 'confirmed' && (
          <Button size="xs" variant="secondary" onClick={() => handleComplete(val)}>Done</Button>
        )}
      </div>
    )},
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Appointments" subtitle={`${pagination.total || 0} total`} />
      <div className="flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <button key={s} onClick={() => { setStatus(s); setPage(1); }}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border ${status === s ? 'bg-primary-600 text-white border-primary-600' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-gray-200 dark:border-slate-600 hover:border-primary-300'}`}>
            {s || 'All'}
          </button>
        ))}
      </div>
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-card overflow-hidden">
        <DataTable columns={columns} data={appointments} isLoading={loading} emptyTitle="No appointments" pagination={pagination} onPageChange={setPage} />
      </div>

      <Modal isOpen={rejectModal.open} onClose={() => setRejectModal({ open: false, id: null })} title="Reject Appointment" size="sm">
        <div className="space-y-4">
          <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} rows={3} placeholder="Reason for rejection..."
            className="w-full px-3 py-2.5 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white resize-none" />
          <div className="flex gap-3">
            <Button variant="outline" fullWidth onClick={() => setRejectModal({ open: false, id: null })}>Cancel</Button>
            <Button variant="danger" fullWidth isLoading={actionLoading} onClick={handleReject}>Reject</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
export default DoctorAppointments;
