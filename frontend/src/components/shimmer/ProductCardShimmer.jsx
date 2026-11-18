export default function ProductCardShimmer() {
  return (
    <div className="bg-white rounded-2xl border border-gray-150 p-3 sm:p-3.5 flex flex-col h-full shadow-xs relative overflow-hidden animate-pulse">
      {/* Product Image Box */}
      <div className="aspect-square w-full rounded-xl bg-gray-200/80 relative overflow-hidden mb-3">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
      </div>

      {/* Brand & Assured */}
      <div className="flex justify-between items-center mb-2">
        <div className="h-3 w-16 bg-gray-200 rounded-md" />
        <div className="h-3 w-12 bg-gray-200 rounded-md" />
      </div>

      {/* Title */}
      <div className="h-3.5 w-4/5 bg-gray-200 rounded-md mb-2" />
      <div className="h-3 w-2/3 bg-gray-200/70 rounded-md mb-3" />

      {/* Price */}
      <div className="flex items-center gap-2 mb-3 mt-auto">
        <div className="h-4 w-20 bg-gray-200 rounded-md" />
        <div className="h-3 w-14 bg-gray-200/60 rounded-md" />
      </div>

      {/* Bottom CTA / Stock */}
      <div className="pt-2 border-t border-gray-100 flex justify-between items-center">
        <div className="h-3 w-14 bg-gray-200/60 rounded-md" />
        <div className="h-6 w-16 bg-gray-200 rounded-full" />
      </div>
    </div>
  )
}
