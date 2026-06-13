import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

const Card = ({ children, className, hover = false, glass = false, ...props }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'rounded-xl border bg-white dark:bg-slate-800 dark:border-slate-700',
        hover && 'transition-all duration-300 hover:shadow-card-hover hover:-translate-y-0.5 cursor-pointer',
        glass && 'bg-white/80 backdrop-blur-sm border-white/20 dark:bg-slate-800/80',
        'shadow-card',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
};

const CardHeader = ({ children, className, ...props }) => (
  <div className={cn('p-6 pb-0', className)} {...props}>{children}</div>
);

const CardTitle = ({ children, className, ...props }) => (
  <h3 className={cn('text-lg font-semibold text-slate-800 dark:text-white', className)} {...props}>
    {children}
  </h3>
);

const CardDescription = ({ children, className, ...props }) => (
  <p className={cn('text-sm text-slate-500 dark:text-slate-400 mt-1', className)} {...props}>
    {children}
  </p>
);

const CardContent = ({ children, className, ...props }) => (
  <div className={cn('p-6', className)} {...props}>{children}</div>
);

const CardFooter = ({ children, className, ...props }) => (
  <div className={cn('p-6 pt-0 flex items-center', className)} {...props}>{children}</div>
);

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
export default Card;
