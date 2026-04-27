import { Skeleton } from '@/components/common/LoadingSkeleton';

export function ReportesDashboardSkeleton() {
  return (
    <div className="space-y-5">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 md:p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton height="h-10" />
          <Skeleton height="h-10" />
          <Skeleton height="h-10" />
          <Skeleton height="h-10" />
        </div>
        <div className="flex gap-2 mt-4">
          <Skeleton width="w-20" height="h-9" />
          <Skeleton width="w-28" height="h-9" />
          <Skeleton width="w-24" height="h-9" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} height="h-28" />
        ))}
      </div>

      <Skeleton height="h-72" />
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton height="h-64" />
        <Skeleton height="h-64" />
      </div>
      <Skeleton height="h-64" />
    </div>
  );
}

