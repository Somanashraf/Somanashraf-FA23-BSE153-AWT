import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, FileText, CreditCard, ClipboardList, ArrowRight, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useSelector } from 'react-redux';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import StatsCard from '../../components/shared/StatsCard';
import AppointmentStatusBadge from '../../components/shared/AppointmentStatusBadge';
import { StatSkeleton, CardSkeleton } from '../../components/ui/Skeleton';
import { appointmentService } from '../../services/appointmentService';
import { formatDate, formatTime, formatCurrency } from '../../lib/utils';

const PatientDashboard = () => {
  const { user } = useSelector((s) => s.auth);
  const [stats, setStats] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await appointmentService.getAppointments({ limit: 5 });
        const appts = res.data?.data || [];
        setAppointments(appts);
        const completed = appts.filter((a) => a.status === 'completed').length;
        const pending = appts.filter((a) => ['pending', 'payment_pending', 'payment_uploaded', 'payment_verified', 'confirmed'].includes(a.status)).length;
        setStats({ total: res.data?.pagination?.total || 0, completed, pending });
      } catch { } finally { setLoading(false); }
    };
    load();
  }, []);

  const statCards = [
    { title: 'Total Appointments', value: stats?.total ?? '—', icon: Calendar, color: 'primary' },
    { title: 'Completed', value: stats?.completed ?? '—', icon: CheckCircle, color: 'success' },
    { title: 'Upcoming', value: stats?.pending ?? '—', icon: Clock, color: 'warning' },
  ];

  const quickLinks = [
    { label: 'Find a Doctor', desc: 'Search & filter doctors', path: '/patient/doctors', icon: '🔍', color: 'from-blue-500 to-cyan-500' },
    { label: 'My Appointments', desc: 'View all appointments', path: '/patient/appointments', icon: '📅', color: 'from-purple-500 to-indigo-500' },
    { label: 'Prescriptions', desc: 'Download prescriptions', path: '/patient/prescriptions', icon: '💊', color: 'from-teal-500 to-emerald-500' },
    { label: 'Medical History', desc: 'Complete health records', path: '/patient/medical-history', icon: '📋', color: 'from-orange-500 to-amber-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-primary rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="absolute rounded-full bg-white"
              style={{ width: Math.random() * 80 + 20, height: Math.random() * 80 + 20, top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%` }} />
          ))}
        </div>
        <div className="relative z-10">
          <p className="text-white/80 text-sm mb-1">Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'},</p>
          <h1 className="text-2xl font-bold mb-1">{user?.firstName} {user?.lastName} 👋</h1>
          <p className="text-white/70 text-sm">Your health journey continues. Book an appointment today.</p>
          <Link to="/patient/doctors" className="inline-flex items-center gap-2 mt-4 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all backdrop-blur-sm">
            Find a Doctor <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {loading ? [...Array(3)].map((_, i) => <StatSkeleton key={i} />) : statCards.map((s, i) => <StatsCard key={s.title} {...s} index={i} />)}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickLinks.map((q, i) => (
          <motion.div key={q.path} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
            <Link to={q.path} className="block bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4 hover:shadow-card-hover transition-all duration-300 hover:-translate-y-0.5 group">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${q.color} flex items-center justify-center text-xl mb-3`}>{q.icon}</div>
              <p className="font-semibold text-sm text-slate-800 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{q.label}</p>
              <p className="text-xs text-slate-400 mt-0.5">{q.desc}</p>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Recent Appointments */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-card">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-slate-700">
          <h2 className="font-semibold text-slate-800 dark:text-white">Recent Appointments</h2>
          <Link to="/patient/appointments" className="text-sm text-primary-600 dark:text-primary-400 hover:underline font-medium flex items-center gap-1">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="divide-y divide-gray-50 dark:divide-slate-700/50">
          {loading ? [...Array(3)].map((_, i) => (
            <div key={i} className="p-4 flex items-center gap-4">
              <div className="skeleton w-10 h-10 rounded-full" /><div className="flex-1"><div className="skeleton h-3 w-40 mb-2" /><div className="skeleton h-3 w-24" /></div>
            </div>
          )) : appointments.length === 0 ? (
            <div className="p-10 text-center">
              <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-slate-400 text-sm">No appointments yet</p>
              <Link to="/patient/doctors" className="text-sm text-primary-600 hover:underline mt-1 block">Book your first appointment</Link>
            </div>
          ) : appointments.map((appt) => {
            const doc = appt.doctor?.user;
            return (
              <Link key={appt._id} to={`/patient/appointments/${appt._id}`} className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {doc ? `${doc.firstName?.[0]}${doc.lastName?.[0]}` : 'DR'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-slate-800 dark:text-white truncate">Dr. {doc?.firstName} {doc?.lastName}</p>
                  <p className="text-xs text-slate-400">{formatDate(appt.appointmentDate)} · {formatTime(appt.appointmentTime)}</p>
                </div>
                <AppointmentStatusBadge status={appt.status} />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};
export default PatientDashboard;
