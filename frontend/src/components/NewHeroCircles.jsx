import { useNavigate } from 'react-router-dom'

export default function NewHeroCircles({ settings }) {
  const navigate = useNavigate()

  if (!settings || settings.circlesEnabled === false) return null

  const circles = settings.circles || []
  if (circles.length === 0) return null

  const handleClick = (link) => {
    window.scrollTo({ top: 0, behavior: 'instant' })
    navigate(link || '/category/Best-Sellers')
  }

  return (
    <section className="w-full bg-white py-6 sm:py-8 border-b border-gray-100">
      <div className="w-full max-w-[1720px] mx-auto px-3 sm:px-4 lg:px-4">
        {/* Horizontal scroll on mobile, centered/spread flex on tablet & desktop */}
        <div className="flex items-start justify-start lg:justify-between gap-4 sm:gap-6 md:gap-8 overflow-x-auto scrollbar-hide py-2 px-1">
          {circles.map((item, idx) => {
            const name = item.name || `Product ${idx + 1}`
            const image = item.image
            const bg = item.bg || '#fdf2f8'

            return (
              <div
                key={item.id || idx}
                onClick={() => handleClick(item.link)}
                className="flex flex-col items-center group cursor-pointer shrink-0 w-[78px] sm:w-[92px] md:w-[108px] text-center select-none"
              >
                {/* Circular image pod with pastel circular backdrop */}
                <div
                  className="w-[72px] h-[72px] sm:w-[86px] sm:h-[86px] md:w-[100px] md:h-[100px] rounded-full flex items-center justify-center p-2.5 sm:p-3 transition-all duration-300 ease-out group-hover:scale-110 group-hover:shadow-lg shadow-sm border border-black/5"
                  style={{ backgroundColor: bg }}
                >
                  {image ? (
                    <img
                      src={image}
                      alt={name}
                      className="w-full h-full object-contain drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <span className="font-black text-pink-700/60 text-base sm:text-lg select-none">
                      {name ? name.charAt(0).toUpperCase() : '★'}
                    </span>
                  )}
                </div>

                {/* Name underneath */}
                <span className="mt-2 text-[11px] sm:text-xs md:text-[13px] font-bold text-gray-800 group-hover:text-pink-600 transition-colors leading-tight line-clamp-2 px-1">
                  {name}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
