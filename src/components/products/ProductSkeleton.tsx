import { Skeleton } from '@/components/ui/skeleton'

export function ProductSkeleton() {
  return (
    <div className="bg-card rounded-2xl overflow-hidden border border-border">
      {/* Image Skeleton */}
      <Skeleton className="aspect-[4/5] w-full" />

      {/* Content Skeleton */}
      <div className="p-5 space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>

        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-7 w-24" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      </div>
    </div>
  )
}
