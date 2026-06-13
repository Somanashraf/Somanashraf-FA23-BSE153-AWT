import { cn } from '../../lib/utils';

const Skeleton = ({ className, ...props }) => (
  <div className={cn('skeleton rounded-lg', className)} {...props} />
);

export const CardSkeleton = () => (
  <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-100 dark:border-slate-700 shadow-card">
    <div className="flex items-center gap-4 mb-4">
      <Skeleton className="w-14 h-14 rounded-full" />
      <div className="flex-1">
        <Skeleton className="h-4 w-3/4 mb-2" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
    <Skeleton className="h-3 w-full mb-2" />
    <Skeleton className="h-3 w-5/6 mb-4" />
    <div className="flex gap-2">
      <Skeleton className="h-8 w-24 rounded-lg" />
      <Skeleton className="h-8 w-20 rounded-lg" />
    </div>
  </div>
);

export const TableSkeleton = ({ rows = 5, cols = 4 }) => (
  <div className="space-y-2">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-4 p-3">
        {Array.from({ length: cols }).map((_, j) => (
          <Skeleton key={j} className="h-4 flex-1" />
        ))}
      </div>
    ))}
  </div>
);

export const StatSkeleton = () => (
  <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-100 dark:border-slate-700">
    <div className="flex justify-between items-start mb-4">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-10 w-10 rounded-lg" />
    </div>
    <Skeleton className="h-8 w-32 mb-2" />
    <Skeleton className="h-3 w-20" />
  </div>
);

export default Skeleton;
