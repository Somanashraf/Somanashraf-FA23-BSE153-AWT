import { useState, useEffect } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { TrendingUp, Users, Calendar, DollarSign, Stethoscope, CheckCircle } from 'lucide-react';
import { analyticsService } from '../../services/medicalService';
import PageHeader from '../../components/shared/PageHeader';
import StatsCard from '../../components/shared/StatsCard';
import { StatSkeleton } from '../../components/ui/Skeleton';
import { formatCurrency } from '../../lib/utils';

const COLORS = ['#2563EB', '#14B8A6', '#8B5CF6', '#F59E0B', '#EF4444'];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const AdminAnalytics = () => {
  const [overview, setOverview] = useState(null);
  const [apptTrend, setApptTrend] = useState([]);
  const [revTrend, setRevTrend] = useState([]);
  const [userGrowth, setUserGrowth] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [ovRes, apptRes, revRes, userRes] = await Promise.all([
          analyticsService.getOverview(),
          analyticsService.getAppointmentsTrend({ months: 12 }),
          analyticsService.getRevenueTrend({ months: 12 }),
          analyticsService.getUserGrowth({ months: 12 }),
        ]);
        setOverview(ovRes.data?.data);
        setApptTrend((apptRes.data?.data?.trend || []).map(d => ({ name: MONTHS[d._id.month-1], total: d.count, completed: d.completed, cancelled: d.cancelled })));
        setRevTrend((revRes.data?.data?.trend || []).map(d => ({ name: MONTHS[d._id.month-1], revenue: d.revenue, count: d.count })));
        // Group user growth by month
        const growthMap = {};
        (userRes.data?.data?.growth || []).forEach(d => {
          const key = MONTHS[d._id.month-1];
          if (!growthMap[key]) growthMap[key] = { name: key, patients: 0, doctors: 0 };
          if (d._id.role === 'patient') growthMap[key].patients += d.count;
          if (d._id.role === 'doctor') growthMap[key].doctors += d.count;
        });
        setUserGrowth(Object.values(growthMap));
      } catch { } finally { setLoading(false); }
    };
    load();
  }, []);

  const statCards = overview ? [
    { title: 'Total Users', value: overview.totalUsers, icon: Users, color: 'primary' },
    { title: 'Active Doctors', value: overview.totalDoctors, icon: Stethoscope, color: 'secondary' },
    { title: 'Total Patients', value: overview.totalPatients, icon: Users, color: 'success' },
    { title: 'Total Appointments', value: overview.totalAppointments, icon: Calendar, color: 'warning' },
    { title: 'Completed', value: overview.completedAppointments, icon: CheckCircle, color: 'success' },
    { title: 'Total Revenue', value: formatCurrency(overview.totalRevenue), icon: DollarSign, color: 'purple' },
  ] : [];

  const pieData = overview ? [
    { name: 'Completed', value: overview.completedAppointments || 0 },
    { name: 'Pending', value: Math.max(0, (overview.totalAppointments - overview.completedAppointments - overview.cancelledAppointments)) },
    { name: 'Cancelled', value: overview.cancelledAppointments || 0 },
  ] : [];

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics & Reports" subtitle="Platform performance overview" />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {loading ? [...Array(6)].map((_, i) => <StatSkeleton key={i} />) : statCards.map((s, i) => <StatsCard key={s.title} {...s} index={i} />)}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-5 shadow-card">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2"><Calendar className="w-4 h-4 text-primary-600" /> Appointment Trends (12 Months)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={apptTrend}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#2563EB" stopOpacity={0.15}/><stop offset="95%" stopColor="#2563EB" stopOpacity={0}/></linearGradient>
                <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#14B8A6" stopOpacity={0.15}/><stop offset="95%" stopColor="#14B8A6" stopOpacity={0}/></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Area type="monotone" dataKey="total" stroke="#2563EB" fill="url(#g1)" name="Total" />
              <Area type="monotone" dataKey="completed" stroke="#14B8A6" fill="url(#g2)" name="Completed" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-5 shadow-card">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Appointment Status</h3>
          {pieData.some(d => d.value > 0) ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Legend formatter={(v) => <span className="text-xs text-slate-600 dark:text-slate-400">{v}</span>} />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : <div className="h-52 flex items-center justify-center text-slate-400 text-sm">No data yet</div>}
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-5 shadow-card">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2"><DollarSign className="w-4 h-4 text-purple-500" /> Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={revTrend}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.15}/><stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => formatCurrency(v)} />
              <Area type="monotone" dataKey="revenue" stroke="#8B5CF6" fill="url(#rev)" name="Revenue" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-5 shadow-card">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2"><Users className="w-4 h-4 text-primary-600" /> User Growth</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={userGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="patients" fill="#2563EB" radius={[3,3,0,0]} name="Patients" />
              <Bar dataKey="doctors" fill="#14B8A6" radius={[3,3,0,0]} name="Doctors" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
export default AdminAnalytics;
