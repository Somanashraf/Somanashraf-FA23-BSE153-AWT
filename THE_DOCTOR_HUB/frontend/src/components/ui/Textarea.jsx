import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

const Textarea = forwardRef(({ className, label, error, rows = 4, required, ...props }, ref) => (
  <div className="w-full">
    {label && (
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
    )}
    <textarea ref={ref} rows={rows}
      className={cn(
        'w-full px-3 py-2.5 text-sm border rounded-lg transition-all duration-200 resize-none',
        'bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400',
        'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
        error ? 'border-red-400' : 'border-gray-200 dark:border-slate-600',
        className
      )}
      {...props} />
    {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
  </div>
));
Textarea.displayName = 'Textarea';
export default Textarea;
