import { cn } from '../../lib/utils';

const variants = {
  default: 'bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-slate-300',
  primary: 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400',
  secondary: 'bg-secondary-100 text-secondary-700',
  success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  danger: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
};

const Badge = ({ children, variant = 'default', className, dot = false, ...props }) => {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium',
        variants[variant],
        className
      )}
      {...props}
    >
      {dot && (
        <span className={cn('w-1.5 h-1.5 rounded-full', {
          'bg-gray-500': variant === 'default',
          'bg-primary-600': variant === 'primary',
          'bg-emerald-600': variant === 'success',
          'bg-amber-600': variant === 'warning',
          'bg-red-600': variant === 'danger',
          'bg-blue-600': variant === 'info',
        })} />
      )}
      {children}
    </span>
  );
};

export default Badge;
