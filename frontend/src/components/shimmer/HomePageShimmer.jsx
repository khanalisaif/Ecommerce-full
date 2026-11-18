export default function HomePageShimmer() {
  return (
    <div className="w-full max-w-[1720px] mx-auto px-2 sm:px-3 lg:px-4 py-4 space-y-6 select-none">
      {/* ── Hero Banner Shimmer (Matches Hero 2 Banner layout) ── */}
      <div className="relative rounded-3xl sm:rounded-[36px] overflow-hidden border border-pink-100 p-6 sm:p-10 md:p-14 lg:p-16 flex flex-col md:flex-row items-center justify-between gap-8 bg-gradient-to-r from-[#fce4ec] via-[#fdf2f8] to-[#fed7e2] animate-pulse">
        {/* Left Text Skeleton */}
        <div className="flex-1 w-full space-y-4 max-w-xl text-center md:text-left">
          {/* Tagline */}
          <div className="h-4 sm:h-5 w-40 sm:w-48 bg-pink-200/90 rounded-full mx-auto md:mx-0" />

          {/* Big Title Lines */}
          <div className="space-y-2.5 pt-1">
            <div className="h-9 sm:h-11 md:h-14 w-full sm:w-5/6 bg-pink-300/60 rounded-2xl mx-auto md:mx-0" />
            <div className="h-8 sm:h-10 md:h-12 w-3/4 sm:w-2/3 bg-pink-300/50 rounded-2xl mx-auto md:mx-0" />
          </div>

          {/* Description Paragraph */}
          <div className="space-y-2 pt-2">
            <div className="h-3.5 sm:h-4 w-full sm:w-11/12 bg-pink-200/70 rounded-lg mx-auto md:mx-0" />
            <div className="h-3.5 sm:h-4 w-5/6 sm:w-4/5 bg-pink-200/60 rounded-lg mx-auto md:mx-0" />
          </div>

          {/* Feature Badge Pills */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 sm:gap-4 pt-3">
            <div className="h-6 sm:h-7 w-24 sm:w-28 bg-pink-200/80 rounded-full" />
            <div className="h-6 sm:h-7 w-24 sm:w-28 bg-pink-200/80 rounded-full" />
            <div className="h-6 sm:h-7 w-20 sm:w-24 bg-pink-200/80 rounded-full" />
          </div>

          {/* Button Pill */}
          <div className="pt-3">
            <div className="h-11 sm:h-12 w-36 sm:w-44 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full mx-auto md:mx-0 shadow-md shadow-pink-400/20" />
          </div>
        </div>

        {/* Right Mockup Box Skeleton */}
        <div className="w-56 h-60 sm:w-72 sm:h-76 md:w-80 md:h-88 lg:w-96 lg:h-96 rounded-3xl bg-pink-200/60 flex items-center justify-center shrink-0 border border-pink-200/50 shadow-inner">
          <div className="w-24 h-40 bg-pink-300/40 rounded-2xl" />
        </div>
      </div>

      {/* ── Marquee Ticker Shimmer ── */}
      <div className="relative w-full rounded-2xl md:rounded-3xl overflow-hidden py-5 sm:py-6 bg-[#d81b60]/25 border border-pink-200/30 flex items-center justify-between px-6 gap-6 animate-pulse">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex items-center gap-2.5 shrink-0">
            <div className="w-7 h-7 rounded-full bg-white/40" />
            <div className="h-4 w-24 sm:w-32 rounded-md bg-white/40" />
          </div>
        ))}
      </div>

      {/* ── Circles Showcase Strip Shimmer ── */}
      <div className="py-4 sm:py-6 border-b border-gray-100 flex items-center justify-start lg:justify-between gap-4 sm:gap-6 overflow-hidden animate-pulse">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2 shrink-0 w-[78px] sm:w-[92px] md:w-[104px]">
            <div className="w-[72px] h-[72px] sm:w-[86px] sm:h-[86px] md:w-[96px] md:h-[96px] rounded-full bg-pink-100/70 border border-pink-200/50" />
            <div className="h-3 w-16 rounded bg-gray-200" />
          </div>
        ))}
      </div>

      {/* ── Spotlight / Wellness Banner Shimmer ── */}
      <div className="rounded-3xl bg-gradient-to-r from-orange-50 via-amber-50 to-orange-100/60 p-6 sm:p-10 border border-orange-100 flex flex-col md:flex-row items-center justify-between gap-6 animate-pulse my-6">
        <div className="space-y-3 flex-1 w-full">
          <div className="h-3.5 w-32 bg-orange-200/80 rounded-full" />
          <div className="h-8 sm:h-10 w-2/3 bg-orange-300/60 rounded-xl" />
          <div className="h-3.5 w-4/5 bg-orange-200/60 rounded-md" />
          <div className="h-10 w-32 bg-orange-300/80 rounded-full pt-2" />
        </div>
        <div className="w-48 h-48 sm:w-60 sm:h-60 rounded-2xl bg-orange-200/70 shrink-0" />
      </div>

      {/* ── Best Sellers Product Grid Shimmer ── */}
      <div className="pt-4">
        <div className="flex justify-between items-center mb-5 animate-pulse">
          <div className="h-6 w-36 bg-gray-200 rounded-lg" />
          <div className="h-4 w-20 bg-gray-200 rounded-lg" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-3 sm:p-4 shadow-xs animate-pulse">
              <div className="aspect-square w-full rounded-xl bg-gray-200/80 mb-3" />
              <div className="h-3 w-16 bg-gray-200 rounded mb-2" />
              <div className="h-4 w-3/4 bg-gray-200 rounded mb-2" />
              <div className="h-4 w-20 bg-gray-200 rounded mb-3" />
              <div className="h-8 w-full bg-gray-200/70 rounded-full mt-2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
