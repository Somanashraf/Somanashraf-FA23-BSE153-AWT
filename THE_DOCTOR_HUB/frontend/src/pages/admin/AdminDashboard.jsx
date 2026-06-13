import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Stethoscope, Calendar, CreditCard, TrendingUp, UserCheck, ArrowRight, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { analyticsService } from '../../services/medicalService';
import StatsCard from '../../components/shared/StatsCard';
import { StatSkeleton } from '../../components/ui/Skeleton';
import { formatCurrency } from '../../lib/utils';

const COLORS = ['#2563EB', '#14B8A6', '#8B5CF6', '#F59E0B', '#EF4444'];

const AdminDashboard = () => {
  const [overview, setOverview] = useState(null);
  const [trend, setTrend] = useState([]);
  const [revTrend, setRevTrend] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [ovRes, trRes, rvRes] = await Promise.all([
          analyticsService.getOverview(),
          analyticsService.getAppointmentsTrend({ months: 6 }),
          analyticsService.getRevenueTrend({ months: 6 }),
        ]);
        setOverview(ovRes.data?.data);
        const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        setTrend((trRes.data?.data?.trend || []).map((d) => ({
          name: months[d._id.month - 1],
          total: d.count, completed: d.completed, cancelled: d.cancelled,
        })));
        setRevTrend((rvRes.data?.data?.trend || []).map((d) => ({
          name: months[d._id.month - 1],
          revenue: d.revenue, count: d.count,
        })));
      } catch { } finally { setLoading(false); }
    };
    load();
  }, []);

  const statCards = overview ? [
    { title: 'Total Users', value: overview.totalUsers, icon: Users, color: 'primary', trend: 12 },
    { title: 'Active Doctors', value: overview.totalDoctors, icon: Stethoscope, color: 'secondary', trend: 8 },
    { title: 'Total Patients', value: overview.totalPatients, icon: UserCheck, color: 'success', trend: 15 },
    { title: 'Appointments', value: overview.totalAppointments, icon: Calendar, color: 'warning' },
    { title: 'Revenue', value: formatCurrency(overview.totalRevenue), icon: CreditCard, color: 'purple' },
    { title: 'Pending Approvals', value: overview.pendingApprovals, icon: Activity, color: 'danger' },
  ] : [];

  const pieData = overview ? [
    { name: 'Completed', value: overview.completedAppointments || 0 },
    { name: 'Pending', value: (overview.totalAppointments - overview.completedAppointments - overview.cancelledAppointments) || 0 },
    { name: 'Cancelled', value: overview.cancelledAppointments || 0 },
  ] : [];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute right-6 top-1/2 -translate-y-1/2 w-24 h-24 bg-white/10 rounded-full" />
        <div className="relative z-10">
          <h1 className="text-2xl font-bold mb-1">Admin Dashboard 🛡️</h1>
          <p className="text-white/80">Full platform overview and management</p>
          {overview?.pendingApprovals > 0 && (
            <Link to="/admin/doctors" className="inline-flex items-center gap-2 mt-4 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium">
              {overview.pendingApprovals} doctor(s) pending approval <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {loading ? [...Array(6)].map((_, i) => <StatSkeleton key={i} />) : statCards.map((s, i) => <StatsCard key={s.title} {...s} index={i} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-5 shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-slate-800 dark:text-white">Appointment Trends</h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trend}>
              <defs>
                <linearGradient id="total" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="completed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14B8A6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#14B8A6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Area type="monotone" dataKey="total" stroke="#2563EB" fill="url(#total)" name="Total" />
              <Area type="monotone" dataKey="completed" stroke="#14B8A6" fill="url(#completed)" name="Completed" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-5 shadow-card">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Appointment Status</h3>
          {pieData.some((d) => d.value > 0) ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Legend formatter={(v) => <span className="text-xs text-slate-600 dark:text-slate-400">{v}</span>} />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-52 flex items-center justify-center text-slate-400 text-sm">No data yet</div>
          )}
        </div>
      </div>

      {/* Revenue trend */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-5 shadow-card">
        <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Revenue Trend</h3>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={revTrend}>
            <defs>
              <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip formatter={(v) => formatCurrency(v)} />
            <Area type="monotone" dataKey="revenue" stroke="#8B5CF6" fill="url(#rev)" name="Revenue" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
export default AdminDashboard;
