export default function ProductDetailShimmer() {
  return (
    <div className="w-full max-w-[1400px] mx-auto px-4 py-8 select-none">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 animate-pulse">
        {/* Left: Product Images Skeleton */}
        <div className="space-y-4">
          <div className="aspect-square w-full rounded-3xl bg-gray-200/80 border border-gray-150" />
          <div className="flex items-center gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-20 h-20 rounded-xl bg-gray-200/80 border border-gray-150 shrink-0" />
            ))}
          </div>
        </div>

        {/* Right: Product Details Skeleton */}
        <div className="space-y-5">
          <div className="h-4 w-28 bg-gray-200 rounded-full" />
          <div className="h-8 md:h-10 w-4/5 bg-gray-200 rounded-xl" />
          <div className="flex items-center gap-2">
            <div className="h-5 w-24 bg-gray-200 rounded-md" />
            <div className="h-4 w-20 bg-gray-200 rounded-md" />
          </div>

          <div className="h-8 w-40 bg-gray-200 rounded-lg" />

          {/* Color options skeleton */}
          <div className="space-y-2 pt-2">
            <div className="h-3.5 w-16 bg-gray-200 rounded" />
            <div className="flex gap-2.5">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-gray-200" />
              ))}
            </div>
          </div>

          {/* Size options skeleton */}
          <div className="space-y-2 pt-2">
            <div className="h-3.5 w-16 bg-gray-200 rounded" />
            <div className="flex gap-2.5">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-9 w-16 rounded-xl bg-gray-200" />
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-4">
            <div className="h-12 flex-1 rounded-full bg-gray-200" />
            <div className="h-12 flex-1 rounded-full bg-gray-200" />
          </div>

          {/* Description skeleton */}
          <div className="space-y-2.5 pt-6 border-t border-gray-100">
            <div className="h-4 w-full bg-gray-200 rounded" />
            <div className="h-4 w-5/6 bg-gray-200 rounded" />
            <div className="h-4 w-3/4 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    </div>
  )
}
