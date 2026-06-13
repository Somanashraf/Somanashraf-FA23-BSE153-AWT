import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Filter } from 'lucide-react';
import { appointmentService } from '../../services/appointmentService';
import PageHeader from '../../components/shared/PageHeader';
import AppointmentStatusBadge from '../../components/shared/AppointmentStatusBadge';
import DataTable from '../../components/shared/DataTable';
import EmptyState from '../../components/shared/EmptyState';
import { formatDate, formatTime, formatCurrency } from '../../lib/utils';

const STATUSES = ['', 'pending', 'payment_pending', 'payment_uploaded', 'payment_verified', 'confirmed', 'in_progress', 'completed', 'cancelled', 'rejected'];

const PatientAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const params = { page, limit: 10 };
        if (status) params.status = status;
        const res = await appointmentService.getAppointments(params);
        setAppointments(res.data?.data || []);
        setPagination(res.data?.pagination || { page: 1, pages: 1, total: 0 });
      } catch { } finally { setLoading(false); }
    };
    load();
  }, [page, status]);

  const columns = [
    { key: 'doctor', header: 'Doctor', render: (_, row) => {
      const doc = row.doctor?.user;
      return <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-white text-xs font-bold">{doc ? `${doc.firstName?.[0]}${doc.lastName?.[0]}` : 'DR'}</div><div><p className="font-medium text-sm">Dr. {doc?.firstName} {doc?.lastName}</p><p className="text-xs text-slate-400">{row.doctor?.specialization?.[0]}</p></div></div>;
    }},
    { key: 'appointmentDate', header: 'Date & Time', render: (val, row) => <div><p className="text-sm font-medium">{formatDate(val)}</p><p className="text-xs text-slate-400">{formatTime(row.appointmentTime)}</p></div> },
    { key: 'type', header: 'Type', render: (val) => <span className="capitalize text-sm">{val}</span> },
    { key: 'consultationFee', header: 'Fee', render: (val) => <span className="font-semibold text-sm">{formatCurrency(val)}</span> },
    { key: 'status', header: 'Status', render: (val) => <AppointmentStatusBadge status={val} /> },
    { key: '_id', header: 'Action', render: (val) => <Link to={`/patient/appointments/${val}`} className="text-sm text-primary-600 hover:underline font-medium">View →</Link> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="My Appointments" subtitle={`${pagination.total} total appointments`} />

      <div className="flex items-center gap-3">
        <Filter className="w-4 h-4 text-slate-400" />
        <span className="text-sm text-slate-500 dark:text-slate-400">Filter:</span>
        <div className="flex flex-wrap gap-2">
          {STATUSES.map((s) => (
            <button key={s} onClick={() => { setStatus(s); setPage(1); }}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border ${status === s ? 'bg-primary-600 text-white border-primary-600' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-gray-200 dark:border-slate-600 hover:border-primary-300'}`}>
              {s || 'All'}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-card overflow-hidden">
        <DataTable columns={columns} data={appointments} isLoading={loading} emptyTitle="No appointments found"
          emptyDescription="Book your first appointment with a doctor"
          pagination={pagination} onPageChange={setPage} />
      </div>
    </div>
  );
};
export default PatientAppointments;
