import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Users, Star, DollarSign, Clock, CheckCircle, ArrowRight, TrendingUp } from 'lucide-react';
import { useSelector } from 'react-redux';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Button from '../../components/ui/Button';
import { analyticsService } from '../../services/medicalService';
import { appointmentService } from '../../services/appointmentService';
import { doctorService } from '../../services/doctorService';
import StatsCard from '../../components/shared/StatsCard';
import AppointmentStatusBadge from '../../components/shared/AppointmentStatusBadge';
import { StatSkeleton } from '../../components/ui/Skeleton';
import { formatDate, formatTime, formatCurrency, getInitials } from '../../lib/utils';

const DoctorDashboard = () => {
  const { user } = useSelector((s) => s.auth);
  const [stats, setStats] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profileExists, setProfileExists] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        // Check if doctor profile exists
        try {
          await doctorService.getMyProfile();
          setProfileExists(true);
        } catch {
          setProfileExists(false);
        }

        const [statsRes, apptRes] = await Promise.all([
          analyticsService.getDoctorStats(),
          appointmentService.getAppointments({ limit: 5 }),
        ]);
        setStats(statsRes.data?.data);
        setAppointments(apptRes.data?.data || []);
      } catch { } finally { setLoading(false); }
    };
    load();
  }, []);

  const statCards = [
    { title: 'Total Appointments', value: stats?.totalAppointments ?? '—', icon: Calendar, color: 'primary' },
    { title: 'Completed', value: stats?.completedAppointments ?? '—', icon: CheckCircle, color: 'success' },
    { title: 'Upcoming', value: stats?.pendingAppointments ?? '—', icon: Clock, color: 'warning' },
    { title: 'Total Revenue', value: stats ? formatCurrency(stats.totalRevenue) : '—', icon: DollarSign, color: 'secondary' },
    { title: 'Total Patients', value: stats?.totalPatients ?? '—', icon: Users, color: 'purple' },
    { title: 'Rating', value: stats ? `${stats.rating?.average?.toFixed(1) || '0.0'} ⭐` : '—', icon: Star, color: 'warning' },
  ];

  const chartData = stats?.monthlyStats?.map((m) => ({
    name: new Date(2024, m._id.month - 1).toLocaleString('default', { month: 'short' }),
    total: m.count, completed: m.completed,
  })) || [];

  return (
    <div className="space-y-6">
      {/* Profile incomplete banner */}
      {!profileExists && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="font-semibold text-amber-800 dark:text-amber-400">Doctor Profile Incomplete</p>
              <p className="text-sm text-amber-700 dark:text-amber-500">Complete your professional profile to get approved and receive appointments.</p>
            </div>
          </div>
          <Link to="/doctor/setup-profile">
            <Button variant="warning" size="sm">Complete Profile →</Button>
          </Link>
        </motion.div>
      )}
      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-emerald-600 to-teal-500 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
        <div className="relative z-10">
          <p className="text-white/80 text-sm mb-1">Welcome back,</p>
          <h1 className="text-2xl font-bold mb-1">Dr. {user?.firstName} {user?.lastName} 👨‍⚕️</h1>
          <p className="text-white/70 text-sm">You have {stats?.pendingAppointments || 0} appointments waiting.</p>
          <Link to="/doctor/appointments" className="inline-flex items-center gap-2 mt-4 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all">
            View Schedule <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {loading ? [...Array(6)].map((_, i) => <StatSkeleton key={i} />) : statCards.map((s, i) => <StatsCard key={s.title} {...s} index={i} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-5 shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-slate-800 dark:text-white">Monthly Appointments</h3>
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="total" fill="#2563EB" radius={[4, 4, 0, 0]} name="Total" />
                <Bar dataKey="completed" fill="#14B8A6" radius={[4, 4, 0, 0]} name="Completed" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-400 text-sm">No data yet</div>
          )}
        </div>

        {/* Recent appointments */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-card">
          <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-slate-700">
            <h3 className="font-semibold text-slate-800 dark:text-white">Recent Appointments</h3>
            <Link to="/doctor/appointments" className="text-sm text-primary-600 hover:underline flex items-center gap-1">View all <ArrowRight className="w-3.5 h-3.5" /></Link>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-slate-700/50">
            {loading ? [...Array(4)].map((_, i) => (
              <div key={i} className="p-4 flex items-center gap-3"><div className="skeleton w-9 h-9 rounded-full" /><div className="flex-1"><div className="skeleton h-3 w-32 mb-1.5" /><div className="skeleton h-2.5 w-20" /></div></div>
            )) : appointments.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">No appointments yet</div>
            ) : appointments.map((appt) => {
              const pat = appt.patient;
              return (
                <Link key={appt._id} to={`/doctor/appointments/${appt._id}`} className="flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {pat ? getInitials(pat.firstName, pat.lastName) : 'P'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-slate-800 dark:text-white truncate">{pat?.firstName} {pat?.lastName}</p>
                    <p className="text-xs text-slate-400">{formatDate(appt.appointmentDate)} · {formatTime(appt.appointmentTime)}</p>
                  </div>
                  <AppointmentStatusBadge status={appt.status} />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
export default DoctorDashboard;
