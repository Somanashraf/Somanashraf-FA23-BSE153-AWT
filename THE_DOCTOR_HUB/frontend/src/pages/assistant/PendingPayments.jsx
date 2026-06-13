import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Eye } from 'lucide-react';
import { paymentService } from '../../services/appointmentService';
import PageHeader from '../../components/shared/PageHeader';
import AppointmentStatusBadge from '../../components/shared/AppointmentStatusBadge';
import DataTable from '../../components/shared/DataTable';
import Button from '../../components/ui/Button';
import { formatDate, formatCurrency, getInitials } from '../../lib/utils';

const PendingPayments = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = showAll ? await paymentService.getPayments({}) : await paymentService.getPendingPayments();
      setPayments(res.data?.data?.payments || res.data?.data || []);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [showAll]);

  const columns = [
    { key: 'patient', header: 'Patient', render: (val) => (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
          {val ? getInitials(val.firstName, val.lastName) : 'P'}
        </div>
        <div><p className="font-medium text-sm">{val?.firstName} {val?.lastName}</p><p className="text-xs text-slate-400">{val?.email}</p></div>
      </div>
    )},
    { key: 'amount', header: 'Amount', render: (val) => <span className="font-bold">{formatCurrency(val)}</span> },
    { key: 'paymentMethod', header: 'Method', render: (val) => <span className="capitalize text-sm">{val?.replace('_', ' ') || '—'}</span> },
    { key: 'createdAt', header: 'Uploaded', render: (val) => <span className="text-sm text-slate-500">{formatDate(val)}</span> },
    { key: 'status', header: 'Status', render: (val) => <AppointmentStatusBadge status={val} /> },
    { key: '_id', header: 'Action', render: (val) => (
      <Button size="xs" variant="primary" onClick={() => navigate(`/assistant/payments/${val}`)} leftIcon={<Eye className="w-3.5 h-3.5" />}>Review</Button>
    )},
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Payment Verifications" subtitle={`${payments.length} payment(s) to review`}
        actions={
          <button onClick={() => setShowAll(!showAll)} className={`text-sm px-3 py-1.5 rounded-lg border transition-colors ${showAll ? 'bg-primary-600 text-white border-primary-600' : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600 text-slate-600 dark:text-slate-300'}`}>
            {showAll ? 'Pending Only' : 'Show All'}
          </button>
        }
      />
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-card overflow-hidden">
        <DataTable columns={columns} data={payments} isLoading={loading} emptyTitle="No payments to review" emptyDescription="All payments have been processed" />
      </div>
    </div>
  );
};
export default PendingPayments;
