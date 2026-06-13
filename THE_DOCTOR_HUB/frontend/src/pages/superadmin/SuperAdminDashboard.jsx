import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Shield, Activity, TrendingUp, ArrowRight, Lock } from 'lucide-react';
import { analyticsService } from '../../services/medicalService';
import StatsCard from '../../components/shared/StatsCard';
import { StatSkeleton } from '../../components/ui/Skeleton';
import { formatCurrency } from '../../lib/utils';

const SuperAdminDashboard = () => {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await analyticsService.getOverview();
        setOverview(res.data?.data);
      } catch { } finally { setLoading(false); }
    };
    load();
  }, []);

  const statCards = overview ? [
    { title: 'Total Users', value: overview.totalUsers, icon: Users, color: 'primary' },
    { title: 'Active Doctors', value: overview.totalDoctors, icon: Shield, color: 'success' },
    { title: 'Total Patients', value: overview.totalPatients, icon: Activity, color: 'secondary' },
    { title: 'Revenue', value: formatCurrency(overview.totalRevenue), icon: TrendingUp, color: 'purple' },
    { title: 'Appointments', value: overview.totalAppointments, icon: Activity, color: 'warning' },
    { title: 'Pending', value: overview.pendingApprovals, icon: Lock, color: 'danger' },
  ] : [];

  const quickActions = [
    { label: 'All Users', icon: '👥', path: '/superadmin/users', color: 'from-blue-500 to-cyan-500' },
    { label: 'Audit Logs', icon: '📜', path: '/superadmin/audit-logs', color: 'from-purple-500 to-indigo-500' },
    { label: 'Roles', icon: '🔐', path: '/superadmin/roles', color: 'from-rose-500 to-pink-500' },
    { label: 'Analytics', icon: '📊', path: '/superadmin/analytics', color: 'from-emerald-500 to-teal-500' },
    { label: 'Doctors', icon: '🩺', path: '/superadmin/doctors', color: 'from-orange-500 to-amber-500' },
    { label: 'Settings', icon: '⚙️', path: '/superadmin/settings', color: 'from-slate-500 to-gray-600' },
  ];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-rose-600 to-pink-600 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 w-40 h-40 bg-white/10 rounded-full -translate-y-10 translate-x-10" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-6 h-6" />
            <span className="text-white/70 font-medium text-sm uppercase tracking-wider">Super Admin</span>
          </div>
          <h1 className="text-2xl font-bold mb-1">Platform Control Center</h1>
          <p className="text-white/70">Full access to all platform systems and configurations</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {loading ? [...Array(6)].map((_, i) => <StatSkeleton key={i} />) : statCards.map((s, i) => <StatsCard key={s.title} {...s} index={i} />)}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {quickActions.map((a, i) => (
          <motion.div key={a.path} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
            <Link to={a.path} className="block bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4 hover:shadow-card-hover transition-all group text-center">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${a.color} flex items-center justify-center text-2xl mx-auto mb-2`}>{a.icon}</div>
              <p className="font-semibold text-xs text-slate-700 dark:text-slate-300 group-hover:text-primary-600">{a.label}</p>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
export default SuperAdminDashboard;
