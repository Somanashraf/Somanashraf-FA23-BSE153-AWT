import { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { appointmentService } from '../../services/appointmentService';
import PageHeader from '../../components/shared/PageHeader';
import AppointmentStatusBadge from '../../components/shared/AppointmentStatusBadge';
import DataTable from '../../components/shared/DataTable';
import { formatDate, formatTime, formatCurrency, getInitials } from '../../lib/utils';

const AdminAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');

  const STATUSES = ['', 'pending', 'payment_pending', 'payment_uploaded', 'payment_verified', 'confirmed', 'completed', 'cancelled'];

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const params = { page, limit: 15 };
        if (status) params.status = status;
        const res = await appointmentService.getAppointments(params);
        setAppointments(res.data?.data || []);
        setPagination(res.data?.pagination || {});
      } catch { } finally { setLoading(false); }
    };
    load();
  }, [page, status]);

  const columns = [
    { key: 'patient', header: 'Patient', render: (val) => (
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
          {val ? getInitials(val.firstName, val.lastName) : 'P'}
        </div>
        <span className="text-sm font-medium">{val?.firstName} {val?.lastName}</span>
      </div>
    )},
    { key: 'doctor', header: 'Doctor', render: (val) => (
      <span className="text-sm">Dr. {val?.user?.firstName} {val?.user?.lastName}</span>
    )},
    { key: 'appointmentDate', header: 'Date', render: (val, row) => (
      <div><p className="text-sm">{formatDate(val)}</p><p className="text-xs text-slate-400">{formatTime(row.appointmentTime)}</p></div>
    )},
    { key: 'consultationFee', header: 'Fee', render: (val) => <span className="text-sm font-semibold">{formatCurrency(val)}</span> },
    { key: 'type', header: 'Type', render: (val) => <span className="capitalize text-sm">{val}</span> },
    { key: 'status', header: 'Status', render: (val) => <AppointmentStatusBadge status={val} /> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="All Appointments" subtitle={`${pagination.total || 0} total`} />
      <div className="flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <button key={s} onClick={() => { setStatus(s); setPage(1); }}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border ${status === s ? 'bg-primary-600 text-white border-primary-600' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-gray-200 dark:border-slate-600'}`}>
            {s || 'All'}
          </button>
        ))}
      </div>
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-card overflow-hidden">
        <DataTable columns={columns} data={appointments} isLoading={loading}
          emptyTitle="No appointments found" pagination={pagination} onPageChange={setPage} />
      </div>
    </div>
  );
};
export default AdminAppointments;
