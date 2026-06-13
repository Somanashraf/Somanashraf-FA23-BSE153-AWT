import { useState, useEffect } from 'react';
import { Search, History } from 'lucide-react';
import { motion } from 'framer-motion';
import { analyticsService } from '../../services/medicalService';
import PageHeader from '../../components/shared/PageHeader';
import DataTable from '../../components/shared/DataTable';
import Badge from '../../components/ui/Badge';
import { formatDate, timeAgo, getInitials } from '../../lib/utils';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const params = { page, limit: 20 };
        if (search) params.action = search;
        const res = await analyticsService.getAuditLogs(params);
        const data = res.data?.data;
        setLogs(data?.logs || []);
        setPagination(data?.pagination || { page: 1, pages: 1, total: 0 });
      } catch { } finally { setLoading(false); }
    };
    load();
  }, [page, search]);

  const actionColors = {
    USER_REGISTER: 'success', USER_LOGIN: 'primary', USER_LOGOUT: 'default',
    USER_SUSPEND: 'danger', USER_ACTIVATE: 'success', PASSWORD_RESET: 'warning',
    DOCTOR_APPROVE: 'success', APPOINTMENT_BOOK: 'info', APPOINTMENT_CONFIRMED: 'success',
    APPOINTMENT_CANCELLED: 'danger', PAYMENT_UPLOAD: 'info', PAYMENT_VERIFIED: 'success',
    PAYMENT_REJECTED: 'danger', PRESCRIPTION_CREATE: 'success', MEDICAL_RECORD_ADD: 'info',
  };

  const columns = [
    { key: 'user', header: 'User', render: (val) => val ? (
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-gradient-primary flex items-center justify-center text-white text-xs font-bold">
          {getInitials(val.firstName, val.lastName)}
        </div>
        <div>
          <p className="text-sm font-medium">{val.firstName} {val.lastName}</p>
          <p className="text-xs text-slate-400 capitalize">{val.role}</p>
        </div>
      </div>
    ) : <span className="text-xs text-slate-400">System</span> },
    { key: 'action', header: 'Action', render: (val) => (
      <Badge variant={actionColors[val] || 'default'} className="text-xs font-mono">{val}</Badge>
    )},
    { key: 'resource', header: 'Resource', render: (val) => <span className="text-sm">{val}</span> },
    { key: 'status', header: 'Status', render: (val) => (
      <Badge variant={val === 'success' ? 'success' : val === 'failure' ? 'danger' : 'warning'}>{val}</Badge>
    )},
    { key: 'ipAddress', header: 'IP', render: (val) => <span className="text-xs font-mono text-slate-500">{val || '—'}</span> },
    { key: 'createdAt', header: 'Time', render: (val) => (
      <div>
        <p className="text-xs text-slate-600 dark:text-slate-300">{timeAgo(val)}</p>
        <p className="text-xs text-slate-400">{formatDate(val)}</p>
      </div>
    )},
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Audit Logs" subtitle={`${pagination.total || 0} total events`} />

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search by action (e.g. USER_LOGIN)..."
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white" />
      </div>

      {/* Quick filter chips */}
      <div className="flex flex-wrap gap-2">
        {['USER_LOGIN', 'USER_REGISTER', 'DOCTOR_APPROVE', 'PAYMENT_VERIFIED', 'APPOINTMENT_BOOK'].map((a) => (
          <button key={a} onClick={() => { setSearch(a); setPage(1); }}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border ${search === a ? 'bg-primary-600 text-white border-primary-600' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-gray-200 dark:border-slate-600 hover:border-primary-300'}`}>
            {a}
          </button>
        ))}
        {search && (
          <button onClick={() => { setSearch(''); setPage(1); }}
            className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-600 border border-red-200 hover:bg-red-200 transition-colors">
            ✕ Clear
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-card overflow-hidden">
        <DataTable columns={columns} data={logs} isLoading={loading}
          emptyTitle="No audit logs found"
          emptyDescription="System events will appear here"
          pagination={pagination} onPageChange={setPage} />
      </div>
    </div>
  );
};
export default AuditLogs;
