import { useState, useEffect } from 'react';
import { paymentService } from '../../services/appointmentService';
import PageHeader from '../../components/shared/PageHeader';
import AppointmentStatusBadge from '../../components/shared/AppointmentStatusBadge';
import DataTable from '../../components/shared/DataTable';
import { formatDate, formatCurrency, getInitials } from '../../lib/utils';

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const params = { page, limit: 15 };
        if (status) params.status = status;
        const res = await paymentService.getPayments(params);
        setPayments(res.data?.data || []);
        setPagination(res.data?.pagination || {});
      } catch { } finally { setLoading(false); }
    };
    load();
  }, [page, status]);

  const columns = [
    { key: 'patient', header: 'Patient', render: (val) => (
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-gradient-primary flex items-center justify-center text-white text-xs font-bold">
          {val ? getInitials(val.firstName, val.lastName) : 'P'}
        </div>
        <div><p className="text-sm font-medium">{val?.firstName} {val?.lastName}</p><p className="text-xs text-slate-400">{val?.email}</p></div>
      </div>
    )},
    { key: 'amount', header: 'Amount', render: (val) => <span className="font-bold">{formatCurrency(val)}</span> },
    { key: 'paymentMethod', header: 'Method', render: (val) => <span className="capitalize text-sm">{val?.replace('_', ' ') || '—'}</span> },
    { key: 'status', header: 'Status', render: (val) => <AppointmentStatusBadge status={val} /> },
    { key: 'verifiedBy', header: 'Verified By', render: (val) => <span className="text-sm">{val ? `${val.firstName} ${val.lastName}` : '—'}</span> },
    { key: 'createdAt', header: 'Date', render: (val) => <span className="text-sm text-slate-500">{formatDate(val)}</span> },
  ];

  const STATUSES = ['', 'pending', 'uploaded', 'verified', 'rejected', 'refunded'];

  return (
    <div className="space-y-6">
      <PageHeader title="All Payments" subtitle={`${pagination.total || 0} total`} />
      <div className="flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <button key={s} onClick={() => { setStatus(s); setPage(1); }}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border ${status === s ? 'bg-primary-600 text-white border-primary-600' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-gray-200 dark:border-slate-600'}`}>
            {s || 'All'}
          </button>
        ))}
      </div>
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-card overflow-hidden">
        <DataTable columns={columns} data={payments} isLoading={loading} emptyTitle="No payments found" pagination={pagination} onPageChange={setPage} />
      </div>
    </div>
  );
};
export default AdminPayments;
