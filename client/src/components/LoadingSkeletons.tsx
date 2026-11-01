import { Skeleton } from "@/components/ui/skeleton";

const surface = "bg-[oklch(0.94_0.012_80)]";

export function PageSpinner({ label = "Loading" }: { label?: string }) {
  return (
    <div className="min-h-screen pt-20 flex items-center justify-center" role="status" aria-label={label}>
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-[oklch(0.72_0.12_75)] border-t-transparent rounded-full animate-spin" />
        <span className="sr-only">{label}…</span>
      </div>
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="border border-[oklch(0.88_0.015_75)] overflow-hidden" aria-hidden="true">
      <Skeleton className={`aspect-[3/4] rounded-none ${surface}`} />
      <div className="p-4 space-y-3">
        <Skeleton className={`h-5 w-4/5 ${surface}`} />
        <Skeleton className={`h-3 w-2/5 ${surface}`} />
        <Skeleton className={`h-3 w-1/3 ${surface}`} />
        <Skeleton className={`h-4 w-1/2 ${surface}`} />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" role="status" aria-label="Loading products">
      {Array.from({ length: count }).map((_, index) => <ProductCardSkeleton key={index} />)}
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="min-h-screen pt-20" role="status" aria-label="Loading product">
      <div className="container py-12">
        <Skeleton className={`h-4 w-28 mb-8 ${surface}`} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <Skeleton className={`aspect-[4/5] rounded-none ${surface}`} />
          <div className="space-y-5 py-4">
            <Skeleton className={`h-3 w-2/5 ${surface}`} />
            <Skeleton className={`h-12 w-4/5 ${surface}`} />
            <Skeleton className={`h-8 w-1/3 ${surface}`} />
            <Skeleton className={`h-4 w-full ${surface}`} />
            <Skeleton className={`h-4 w-11/12 ${surface}`} />
            <Skeleton className={`h-24 w-full ${surface}`} />
            <Skeleton className={`h-12 w-44 ${surface}`} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function CartSkeleton() {
  return (
    <div className="min-h-screen pt-20" role="status" aria-label="Loading cart">
      <div className="container py-12">
        <Skeleton className={`h-10 w-48 mb-10 ${surface}`} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex gap-5 py-6 border-b border-[oklch(0.88_0.015_75)]">
                <Skeleton className={`w-24 h-28 rounded-none ${surface}`} />
                <div className="flex-1 space-y-3">
                  <Skeleton className={`h-5 w-2/3 ${surface}`} />
                  <Skeleton className={`h-3 w-1/4 ${surface}`} />
                  <Skeleton className={`h-8 w-24 ${surface}`} />
                </div>
              </div>
            ))}
          </div>
          <Skeleton className={`h-64 w-full rounded-none ${surface}`} />
        </div>
      </div>
    </div>
  );
}

export function OrderListSkeleton() {
  return (
    <div className="space-y-4" role="status" aria-label="Loading orders">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="flex items-center justify-between p-5 border border-[oklch(0.88_0.015_75)]">
          <div className="space-y-2">
            <Skeleton className={`h-4 w-28 ${surface}`} />
            <Skeleton className={`h-3 w-36 ${surface}`} />
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className={`h-6 w-20 ${surface}`} />
            <Skeleton className={`h-4 w-20 ${surface}`} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function AdminTableSkeleton({ columns = 6 }: { columns?: number }) {
  return (
    <div className="bg-white border border-[oklch(0.88_0.015_75)] overflow-hidden" role="status" aria-label="Loading table">
      <div className="h-11 bg-[oklch(0.96_0.012_80)] border-b border-[oklch(0.88_0.015_75)]" />
      <div className="divide-y divide-[oklch(0.88_0.015_75)]">
        {Array.from({ length: 6 }).map((_, row) => (
          <div key={row} className="grid gap-4 px-4 py-4" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
            {Array.from({ length: columns }).map((_, column) => (
              <Skeleton key={column} className={`h-4 ${surface} ${column === 0 ? "w-4/5" : "w-3/5"}`} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
