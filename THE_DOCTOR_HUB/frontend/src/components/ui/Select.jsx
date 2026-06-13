import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

const Select = forwardRef(({ className, label, error, options = [], placeholder, required, ...props }, ref) => (
  <div className="w-full">
    {label && (
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
    )}
    <select ref={ref}
      className={cn(
        'w-full px-3 py-2.5 text-sm border rounded-lg transition-all duration-200',
        'bg-white dark:bg-slate-800 text-gray-900 dark:text-white',
        'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
        error ? 'border-red-400' : 'border-gray-200 dark:border-slate-600',
        className
      )}
      {...props}>
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => (
        <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>
      ))}
    </select>
    {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
  </div>
));
Select.displayName = 'Select';
export default Select;
