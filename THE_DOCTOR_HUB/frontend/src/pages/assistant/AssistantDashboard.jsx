import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CreditCard, CheckCircle, XCircle, Clock, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { paymentService } from '../../services/appointmentService';
import StatsCard from '../../components/shared/StatsCard';
import AppointmentStatusBadge from '../../components/shared/AppointmentStatusBadge';
import { formatDate, formatCurrency, getInitials } from '../../lib/utils';
import { StatSkeleton } from '../../components/ui/Skeleton';

const AssistantDashboard = () => {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await paymentService.getPendingPayments();
        setPending(res.data?.data?.payments || []);
      } catch { } finally { setLoading(false); }
    };
    load();
  }, []);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-600 to-indigo-500 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
        <div className="relative z-10">
          <h1 className="text-2xl font-bold mb-1">Assistant Dashboard 📋</h1>
          <p className="text-white/70">{pending.length} payment(s) awaiting verification</p>
          <Link to="/assistant/payments" className="inline-flex items-center gap-2 mt-4 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all">
            Review Payments <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {loading ? [...Array(3)].map((_, i) => <StatSkeleton key={i} />) : [
          { title: 'Pending Payments', value: pending.length, icon: Clock, color: 'warning' },
          { title: 'Verified Today', value: 0, icon: CheckCircle, color: 'success' },
          { title: 'Rejected Today', value: 0, icon: XCircle, color: 'danger' },
        ].map((s, i) => <StatsCard key={s.title} {...s} index={i} />)}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-card">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-slate-700">
          <h2 className="font-semibold text-slate-800 dark:text-white">Pending Payment Verifications</h2>
          <Link to="/assistant/payments" className="text-sm text-primary-600 hover:underline flex items-center gap-1">View all <ArrowRight className="w-3.5 h-3.5" /></Link>
        </div>
        <div className="divide-y divide-gray-50 dark:divide-slate-700/50">
          {loading ? [...Array(3)].map((_, i) => (
            <div key={i} className="p-4 flex gap-3"><div className="skeleton w-10 h-10 rounded-full" /><div className="flex-1"><div className="skeleton h-3 w-40 mb-1.5" /><div className="skeleton h-2.5 w-24" /></div></div>
          )) : pending.length === 0 ? (
            <div className="p-10 text-center"><CreditCard className="w-10 h-10 text-gray-300 mx-auto mb-2" /><p className="text-slate-400 text-sm">No pending payments</p></div>
          ) : pending.slice(0, 5).map((pay) => {
            const pat = pay.patient;
            const appt = pay.appointment;
            return (
              <Link key={pay._id} to={`/assistant/payments/${pay._id}`} className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                  {pat ? getInitials(pat.firstName, pat.lastName) : 'P'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-slate-800 dark:text-white">{pat?.firstName} {pat?.lastName}</p>
                  <p className="text-xs text-slate-400">{formatDate(appt?.appointmentDate)} · {formatCurrency(pay.amount)}</p>
                </div>
                <AppointmentStatusBadge status={pay.status} />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};
export default AssistantDashboard;
