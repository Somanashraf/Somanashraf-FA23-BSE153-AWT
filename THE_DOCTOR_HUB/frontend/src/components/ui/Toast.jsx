import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { removeToast } from '../../store/slices/uiSlice';
import { cn } from '../../lib/utils';

const icons = {
  success: <CheckCircle className="w-5 h-5 text-emerald-500" />,
  error: <AlertCircle className="w-5 h-5 text-red-500" />,
  info: <Info className="w-5 h-5 text-blue-500" />,
  warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
};

const styles = {
  success: 'border-l-4 border-emerald-500',
  error: 'border-l-4 border-red-500',
  info: 'border-l-4 border-blue-500',
  warning: 'border-l-4 border-amber-500',
};

const ToastItem = ({ toast }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const timer = setTimeout(() => dispatch(removeToast(toast.id)), toast.duration || 5000);
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, dispatch]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={cn(
        'bg-white dark:bg-slate-800 rounded-xl shadow-premium p-4 flex items-start gap-3 max-w-sm w-full',
        'border border-gray-100 dark:border-slate-700',
        styles[toast.type] || styles.info
      )}
    >
      {icons[toast.type] || icons.info}
      <div className="flex-1 min-w-0">
        {toast.title && (
          <p className="font-semibold text-sm text-slate-800 dark:text-white">{toast.title}</p>
        )}
        <p className={cn('text-sm text-slate-600 dark:text-slate-300', toast.title && 'mt-0.5')}>
          {toast.message}
        </p>
      </div>
      <button
        onClick={() => dispatch(removeToast(toast.id))}
        className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors flex-shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
};

const ToastContainer = () => {
  const toasts = useSelector((state) => state.ui.toasts);

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ToastContainer;
