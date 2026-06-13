import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

const PageHeader = ({ title, subtitle, actions, className }) => (
  <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    className={cn('flex items-start justify-between mb-6', className)}
  >
    <div>
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white">{title}</h1>
      {subtitle && <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">{subtitle}</p>}
    </div>
    {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
  </motion.div>
);
export default PageHeader;
