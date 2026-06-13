import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Calendar, Users, DollarSign, Star, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { analyticsService } from '../../services/medicalService';
import PageHeader from '../../components/shared/PageHeader';
import StatsCard from '../../components/shared/StatsCard';
import { StatSkeleton } from '../../components/ui/Skeleton';
import { formatCurrency } from '../../lib/utils';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const DoctorAnalytics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await analyticsService.getDoctorStats();
        setStats(res.data?.data);
      } catch { } finally { setLoading(false); }
    };
    load();
  }, []);

  const chartData = stats?.monthlyStats?.map((m) => ({
    name: MONTHS[m._id.month - 1],
    total: m.count,
    completed: m.completed,
  })) || [];

  const statCards = stats ? [
    { title: 'Total Appointments', value: stats.totalAppointments, icon: Calendar, color: 'primary' },
    { title: 'Completed', value: stats.completedAppointments, icon: CheckCircle, color: 'success' },
    { title: 'Upcoming', value: stats.pendingAppointments, icon: Clock, color: 'warning' },
    { title: 'Total Revenue', value: formatCurrency(stats.totalRevenue), icon: DollarSign, color: 'secondary' },
    { title: 'Total Patients', value: stats.totalPatients, icon: Users, color: 'purple' },
    { title: 'Rating', value: `${stats.rating?.average?.toFixed(1) || '0.0'} ⭐`, icon: Star, color: 'warning' },
  ] : [];

  return (
    <div className="space-y-6">
      <PageHeader title="My Analytics" subtitle="Your performance overview" />

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {loading ? [...Array(6)].map((_, i) => <StatSkeleton key={i} />) : statCards.map((s, i) => <StatsCard key={s.title} {...s} index={i} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly appointments */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-5 shadow-card">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary-600" /> Monthly Appointments
          </h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="total" fill="#2563EB" radius={[4,4,0,0]} name="Total" />
                <Bar dataKey="completed" fill="#14B8A6" radius={[4,4,0,0]} name="Completed" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center">
              <p className="text-slate-400 text-sm">No data available yet</p>
            </div>
          )}
        </div>

        {/* Rating card */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-5 shadow-card">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500" /> Patient Rating
          </h3>
          <div className="flex flex-col items-center justify-center h-40">
            <div className="text-7xl font-bold text-amber-400 mb-2">
              {stats?.rating?.average?.toFixed(1) || '—'}
            </div>
            <div className="flex gap-1 mb-2">
              {[1,2,3,4,5].map((s) => (
                <Star key={s} className={`w-6 h-6 ${s <= Math.round(stats?.rating?.average || 0) ? 'text-amber-400 fill-current' : 'text-gray-300'}`} />
              ))}
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Based on {stats?.rating?.count || 0} review(s)
            </p>
          </div>
        </div>
      </div>

      {/* Recent appointments summary */}
      {stats?.recentAppointments?.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-5 shadow-card">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Recent Patients</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {stats.recentAppointments.map((appt, i) => {
              const pat = appt.patient;
              return (
                <motion.div key={appt._id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
                  className="flex flex-col items-center p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl text-center">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white text-sm font-bold overflow-hidden mb-2">
                    {pat?.profilePicture?.url
                      ? <img src={pat.profilePicture.url} alt="" className="w-full h-full object-cover" />
                      : `${pat?.firstName?.[0] || ''}${pat?.lastName?.[0] || ''}`}
                  </div>
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate w-full">
                    {pat?.firstName} {pat?.lastName}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
export default DoctorAnalytics;
