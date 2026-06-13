import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, UserCheck, UserX, Shield } from 'lucide-react';
import { userService } from '../../services/medicalService';
import { useToast } from '../../hooks/useToast';
import PageHeader from '../../components/shared/PageHeader';
import DataTable from '../../components/shared/DataTable';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { formatDate, getInitials } from '../../lib/utils';

const ROLES = ['', 'patient', 'doctor', 'assistant', 'admin'];

const ManageUsers = () => {
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [suspendModal, setSuspendModal] = useState({ open: false, user: null });
  const [suspendReason, setSuspendReason] = useState('');
  const [processing, setProcessing] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (search) params.search = search;
      if (role) params.role = role;
      const res = await userService.getAllUsers(params);
      setUsers(res.data?.data || []);
      setPagination(res.data?.pagination || {});
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [page, role]);
  useEffect(() => {
    const t = setTimeout(() => { setPage(1); load(); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const handleSuspend = async () => {
    setProcessing(true);
    try {
      await userService.suspendUser(suspendModal.user._id, { reason: suspendReason });
      toast.success('User suspended');
      setSuspendModal({ open: false, user: null });
      setSuspendReason('');
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setProcessing(false); }
  };

  const handleActivate = async (id) => {
    try {
      await userService.activateUser(id);
      toast.success('User activated');
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const roleColors = { patient: 'primary', doctor: 'success', assistant: 'purple', admin: 'warning', super_admin: 'danger' };

  const columns = [
    { key: 'firstName', header: 'User', render: (val, row) => (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-white text-xs font-bold overflow-hidden">
          {row.profilePicture?.url ? <img src={row.profilePicture.url} alt="" className="w-full h-full object-cover" /> : getInitials(val, row.lastName)}
        </div>
        <div><p className="font-medium text-sm">{val} {row.lastName}</p><p className="text-xs text-slate-400">{row.email}</p></div>
      </div>
    )},
    { key: 'role', header: 'Role', render: (val) => <Badge variant={roleColors[val] || 'default'} className="capitalize">{val?.replace('_', ' ')}</Badge> },
    { key: 'isEmailVerified', header: 'Verified', render: (val) => val ? <span className="text-emerald-600 text-sm">✓ Yes</span> : <span className="text-red-500 text-sm">✗ No</span> },
    { key: 'createdAt', header: 'Joined', render: (val) => <span className="text-sm text-slate-500">{formatDate(val)}</span> },
    { key: 'isSuspended', header: 'Status', render: (val) => <Badge variant={val ? 'danger' : 'success'}>{val ? 'Suspended' : 'Active'}</Badge> },
    { key: '_id', header: 'Actions', render: (val, row) => (
      <div className="flex gap-1.5">
        {row.isSuspended
          ? <Button size="xs" variant="success" onClick={() => handleActivate(val)} leftIcon={<UserCheck className="w-3.5 h-3.5" />}>Activate</Button>
          : row.role !== 'super_admin' && <Button size="xs" variant="danger" onClick={() => setSuspendModal({ open: true, user: row })} leftIcon={<UserX className="w-3.5 h-3.5" />}>Suspend</Button>
        }
      </div>
    )},
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Manage Users" subtitle={`${pagination.total || 0} total users`} />
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white" />
        </div>
        <select value={role} onChange={(e) => { setRole(e.target.value); setPage(1); }}
          className="px-3 py-2.5 border border-gray-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white">
          {ROLES.map((r) => <option key={r} value={r}>{r ? r.replace('_', ' ') : 'All Roles'}</option>)}
        </select>
      </div>
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-card overflow-hidden">
        <DataTable columns={columns} data={users} isLoading={loading} emptyTitle="No users found" pagination={pagination} onPageChange={setPage} />
      </div>

      <Modal isOpen={suspendModal.open} onClose={() => setSuspendModal({ open: false, user: null })} title="Suspend User" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">Suspending: <strong>{suspendModal.user?.firstName} {suspendModal.user?.lastName}</strong></p>
          <textarea value={suspendReason} onChange={(e) => setSuspendReason(e.target.value)} rows={3} placeholder="Reason for suspension *"
            className="w-full px-3 py-2.5 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white resize-none" />
          <div className="flex gap-3">
            <Button variant="outline" fullWidth onClick={() => setSuspendModal({ open: false, user: null })}>Cancel</Button>
            <Button variant="danger" fullWidth isLoading={processing} onClick={handleSuspend}>Suspend</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
export default ManageUsers;
