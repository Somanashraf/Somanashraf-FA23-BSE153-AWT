import { motion } from 'framer-motion';
import Button from '../ui/Button';

const EmptyState = ({ icon: Icon, title, description, actionLabel, onAction }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-16 text-center"
  >
    {Icon && (
      <div className="w-16 h-16 bg-gray-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Icon className="w-8 h-8 text-gray-400 dark:text-slate-500" />
      </div>
    )}
    <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-1">{title}</h3>
    {description && <p className="text-sm text-slate-400 dark:text-slate-500 max-w-xs">{description}</p>}
    {actionLabel && onAction && (
      <Button onClick={onAction} variant="primary" className="mt-6">{actionLabel}</Button>
    )}
  </motion.div>
);
export default EmptyState;
