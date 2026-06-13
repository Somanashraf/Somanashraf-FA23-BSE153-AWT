import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

const StatsCard = ({ title, value, subtitle, icon: Icon, color = 'primary', trend, index = 0 }) => {
  const colors = {
    primary: { bg: 'bg-primary-50 dark:bg-primary-900/20', icon: 'text-primary-600 dark:text-primary-400', badge: 'bg-primary-600' },
    secondary: { bg: 'bg-teal-50 dark:bg-teal-900/20', icon: 'text-teal-600 dark:text-teal-400', badge: 'bg-teal-600' },
    success: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', icon: 'text-emerald-600 dark:text-emerald-400', badge: 'bg-emerald-600' },
    warning: { bg: 'bg-amber-50 dark:bg-amber-900/20', icon: 'text-amber-600 dark:text-amber-400', badge: 'bg-amber-600' },
    danger: { bg: 'bg-red-50 dark:bg-red-900/20', icon: 'text-red-600 dark:text-red-400', badge: 'bg-red-600' },
    purple: { bg: 'bg-purple-50 dark:bg-purple-900/20', icon: 'text-purple-600 dark:text-purple-400', badge: 'bg-purple-600' },
  };
  const c = colors[color] || colors.primary;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-100 dark:border-slate-700 shadow-card hover:shadow-card-hover transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
        </div>
        {Icon && (
          <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', c.bg)}>
            <Icon className={cn('w-5 h-5', c.icon)} />
          </div>
        )}
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-3xl font-bold text-slate-800 dark:text-white">{value}</p>
          {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>}
        </div>
        {trend !== undefined && (
          <span className={cn('text-xs font-semibold px-2 py-1 rounded-full', trend >= 0 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400')}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
    </motion.div>
  );
};
export default StatsCard;
