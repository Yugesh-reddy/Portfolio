import { Skeleton } from "@/components/ui/skeleton"

export default function StatsLoading() {
  return (
    <div className="min-h-svh motion-reduce:[&_[data-slot=skeleton]]:animate-none">
      <div className="space-y-3 px-4 py-5">
        <Skeleton className="h-3 w-14" />
        <Skeleton className="h-8 w-64 max-w-full" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <div className="screen-line-top space-y-4 p-4">
        <Skeleton className="h-12 w-full" />
        <div className="grid grid-cols-2 gap-px sm:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton className="h-24" key={index} />
          ))}
        </div>
        <Skeleton className="aspect-2/1 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    </div>
  )
}
