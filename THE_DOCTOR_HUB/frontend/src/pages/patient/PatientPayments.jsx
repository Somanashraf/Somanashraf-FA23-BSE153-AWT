import { useState, useEffect } from 'react';
import { CreditCard } from 'lucide-react';
import { paymentService } from '../../services/appointmentService';
import PageHeader from '../../components/shared/PageHeader';
import AppointmentStatusBadge from '../../components/shared/AppointmentStatusBadge';
import DataTable from '../../components/shared/DataTable';
import { formatDate, formatCurrency } from '../../lib/utils';

const PatientPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [page, setPage] = useState(1);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await paymentService.getPayments({ page, limit: 10 });
        setPayments(res.data?.data || []);
        setPagination(res.data?.pagination || {});
      } catch { } finally { setLoading(false); }
    };
    load();
  }, [page]);

  const columns = [
    { key: 'appointment', header: 'Appointment', render: (val) => <div><p className="text-sm font-medium">{formatDate(val?.appointmentDate)}</p><p className="text-xs text-slate-400">{val?.appointmentTime}</p></div> },
    { key: 'amount', header: 'Amount', render: (val) => <span className="font-bold text-sm">{formatCurrency(val)}</span> },
    { key: 'paymentMethod', header: 'Method', render: (val) => <span className="capitalize text-sm">{val?.replace('_', ' ') || '—'}</span> },
    { key: 'status', header: 'Status', render: (val) => <AppointmentStatusBadge status={val} /> },
    { key: 'createdAt', header: 'Date', render: (val) => <span className="text-sm text-slate-500">{formatDate(val)}</span> },
    { key: 'verificationNote', header: 'Note', render: (val) => <span className="text-xs text-slate-500">{val || '—'}</span> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Payment History" subtitle={`${pagination.total || 0} total payments`} />
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-card overflow-hidden">
        <DataTable columns={columns} data={payments} isLoading={loading} emptyTitle="No payments found"
          emptyDescription="Your payment history will appear here" pagination={pagination} onPageChange={setPage} />
      </div>
    </div>
  );
};
export default PatientPayments;
