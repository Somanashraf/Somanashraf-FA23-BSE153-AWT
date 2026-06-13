import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Stethoscope } from 'lucide-react';
import { doctorService } from '../../services/doctorService';
import { useToast } from '../../hooks/useToast';
import PageHeader from '../../components/shared/PageHeader';
import DataTable from '../../components/shared/DataTable';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { formatDate, getInitials } from '../../lib/utils';

const ManageDoctors = () => {
  const toast = useToast();
  const [doctors, setDoctors] = useState([]);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('pending');
  const [processing, setProcessing] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [allRes, pendRes] = await Promise.all([
        doctorService.getDoctors({ limit: 50 }),
        doctorService.getPendingDoctors(),
      ]);
      setDoctors(allRes.data?.data || []);
      setPending(pendRes.data?.data?.doctors || []);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleApprove = async (id) => {
    setProcessing(id);
    try {
      await doctorService.approveDoctor(id);
      toast.success('Doctor approved');
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setProcessing(null); }
  };

  const pendingCols = [
    { key: 'user', header: 'Doctor', render: (val) => (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-xs font-bold">
          {val ? getInitials(val.firstName, val.lastName) : 'DR'}
        </div>
        <div><p className="font-medium text-sm">Dr. {val?.firstName} {val?.lastName}</p><p className="text-xs text-slate-400">{val?.email}</p></div>
      </div>
    )},
    { key: 'specialization', header: 'Specialization', render: (val) => <span className="text-sm">{val?.[0] || '—'}</span> },
    { key: 'doctorType', header: 'Type', render: (val) => <Badge variant="primary" className="capitalize">{val}</Badge> },
    { key: 'experience', header: 'Experience', render: (val) => <span className="text-sm">{val} yrs</span> },
    { key: 'user', header: 'Applied', render: (val) => <span className="text-sm text-slate-500">{formatDate(val?.createdAt)}</span> },
    { key: '_id', header: 'Actions', render: (val) => (
      <Button size="xs" variant="success" isLoading={processing === val} onClick={() => handleApprove(val)} leftIcon={<CheckCircle className="w-3.5 h-3.5" />}>
        Approve
      </Button>
    )},
  ];

  const allCols = [
    { key: 'user', header: 'Doctor', render: (val) => (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-xs font-bold">
          {val ? getInitials(val.firstName, val.lastName) : 'DR'}
        </div>
        <div><p className="font-medium text-sm">Dr. {val?.firstName} {val?.lastName}</p><p className="text-xs text-slate-400">{val?.email}</p></div>
      </div>
    )},
    { key: 'specialization', header: 'Specialty', render: (val) => <span className="text-sm">{val?.[0] || '—'}</span> },
    { key: 'doctorType', header: 'Type', render: (val) => <Badge variant="primary" className="capitalize">{val}</Badge> },
    { key: 'rating', header: 'Rating', render: (val) => <span className="text-sm">⭐ {val?.average?.toFixed(1) || 0}</span> },
    { key: 'isApproved', header: 'Status', render: (val) => <Badge variant={val ? 'success' : 'warning'}>{val ? 'Approved' : 'Pending'}</Badge> },
    { key: 'isAvailable', header: 'Available', render: (val) => <Badge variant={val ? 'success' : 'default'}>{val ? 'Yes' : 'No'}</Badge> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Manage Doctors" subtitle={`${pending.length} pending approvals`} />
      <div className="flex gap-2 border-b border-gray-200 dark:border-slate-700">
        {[['pending', `Pending (${pending.length})`], ['all', `All Doctors (${doctors.length})`]].map(([val, label]) => (
          <button key={val} onClick={() => setTab(val)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 ${tab === val ? 'border-primary-600 text-primary-600 dark:text-primary-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
            {label}
          </button>
        ))}
      </div>
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-card overflow-hidden">
        <DataTable columns={tab === 'pending' ? pendingCols : allCols} data={tab === 'pending' ? pending : doctors} isLoading={loading}
          emptyTitle={tab === 'pending' ? 'No pending approvals' : 'No doctors found'} />
      </div>
    </div>
  );
};
export default ManageDoctors;
