import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { TableSkeleton } from '../ui/Skeleton';
import EmptyState from './EmptyState';
import { cn } from '../../lib/utils';

const DataTable = ({ columns, data, isLoading, emptyTitle = 'No data', emptyDescription, pagination, onPageChange }) => {
  if (isLoading) return <TableSkeleton rows={6} cols={columns.length} />;

  return (
    <div>
      <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-slate-700">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 dark:bg-slate-700/50 border-b border-gray-100 dark:border-slate-700">
              {columns.map((col) => (
                <th key={col.key} className={cn('px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider', col.className)}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-slate-700/50">
            {data.length === 0 ? (
              <tr><td colSpan={columns.length}><EmptyState title={emptyTitle} description={emptyDescription} /></td></tr>
            ) : (
              data.map((row, i) => (
                <motion.tr
                  key={row._id || i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors"
                >
                  {columns.map((col) => (
                    <td key={col.key} className={cn('px-4 py-3 text-sm text-slate-700 dark:text-slate-300', col.cellClassName)}>
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </td>
                  ))}
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between mt-4 px-2">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Page {pagination.page} of {pagination.pages} ({pagination.total} total)
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="p-2 rounded-lg border border-gray-200 dark:border-slate-600 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => {
              const page = i + 1;
              return (
                <button key={page} onClick={() => onPageChange(page)}
                  className={cn('w-8 h-8 rounded-lg text-sm font-medium transition-colors',
                    pagination.page === page ? 'bg-primary-600 text-white' : 'hover:bg-gray-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400'
                  )}
                >{page}</button>
              );
            })}
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.pages}
              className="p-2 rounded-lg border border-gray-200 dark:border-slate-600 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
export default DataTable;
