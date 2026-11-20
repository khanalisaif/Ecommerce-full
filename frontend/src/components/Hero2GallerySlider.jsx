import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

// Circular arch curve matching the user's reference image 2:
// Forms a gentle dome/circle arc across the cards:
// - Leftmost card: dips down and tilts clockwise (rotate-[9deg] translate-y-8)
// - Mid-left card: rises slightly, gentle tilt (rotate-[4deg] translate-y-2)
// - Center card: at the apex/peak of the arc (-rotate-[2deg] -translate-y-2)
// - Mid-right card: descends, tilts counter-clockwise (-rotate-[6deg] translate-y-3)
// - Rightmost card: lowest down, tilts counter-clockwise (-rotate-[10deg] translate-y-9)
const ARC_STYLES = [
  { tilt: 'rotate-[9deg]', y: 'translate-y-8 sm:translate-y-9' },
  { tilt: 'rotate-[4deg]', y: 'translate-y-2 sm:translate-y-2.5' },
  { tilt: '-rotate-[2deg]', y: '-translate-y-2 sm:-translate-y-3' },
  { tilt: '-rotate-[6deg]', y: 'translate-y-3 sm:translate-y-4' },
  { tilt: '-rotate-[10deg]', y: 'translate-y-8 sm:translate-y-9' },
]

export default function Hero2GallerySlider({ settings }) {
  const navigate = useNavigate()
  const [activeCardId, setActiveCardId] = useState(null)

  if (!settings || settings.galleryEnabled === false) return null

  const title = settings.galleryTitle || ''
  const titleHighlight = settings.galleryTitleHighlight || ''
  const cards = settings.galleryCards || []
  const bgColor = settings.galleryBgColor || '#fce4ec'
  const bgGradientEnd = settings.galleryBgGradientEnd || bgColor

  if (cards.length === 0) return null

  // Duplicate cards for seamless continuous infinite marquee loop
  const duplicatedCards = [...cards, ...cards]

  const handleCardClick = (link) => {
    window.scrollTo({ top: 0, behavior: 'instant' })
    navigate(link || '/category/Best-Sellers')
  }

  return (
    <section
      className="relative w-full overflow-hidden py-10 sm:py-14 md:py-16 border-t border-b border-black/5 my-4 sm:my-6 select-none"
      style={{
        background: `linear-gradient(135deg, ${bgColor} 0%, ${bgGradientEnd || bgColor} 100%)`,
      }}
    >
      {/* ── Section Title ─────────────────────────────────────── */}
      <div className="w-full max-w-[1720px] mx-auto px-3 sm:px-4 lg:px-4 text-center mb-6 sm:mb-10">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-gray-900 leading-tight">
          <span>{title} </span>
          <span className="text-pink-600 block sm:inline">{titleHighlight}</span>
        </h2>
      </div>

      {/* ── Infinite Slow Scrolling Circular Arc Marquee Track ─────────── */}
      <div className="wellness-marquee-container relative w-full overflow-hidden py-14 sm:py-18 md:py-22">
        {/* Soft edge blur overlays */}
        <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-28 bg-gradient-to-r from-[#fce4ec] to-transparent z-20 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-28 bg-gradient-to-l from-[#fce4ec] to-transparent z-20 pointer-events-none" />

        <div className="wellness-marquee-track flex items-center gap-5 sm:gap-7 md:gap-9 shrink-0">
          {duplicatedCards.map((card, idx) => {
            const arc = ARC_STYLES[idx % ARC_STYLES.length]
            const isTouched = activeCardId === `${card.id}-${idx}`

            return (
              <div
                key={`${card.id}-${idx}`}
                onClick={() => handleCardClick(card.link)}
                onTouchStart={() => setActiveCardId(`${card.id}-${idx}`)}
                onTouchEnd={() => setTimeout(() => setActiveCardId(null), 1500)}
                className={`group relative shrink-0 cursor-pointer transition-all duration-400 ease-out 
                  ${arc.tilt} ${arc.y}
                  hover:scale-110 hover:rotate-0 hover:-translate-y-8 hover:z-30 
                  ${isTouched ? 'scale-110 rotate-0 -translate-y-8 z-30' : ''}
                `}
                style={{ willChange: 'transform' }}
              >
                {/* Poster Card: matching Image 2 with smooth rounded corners and no white frame */}
                <div
                  className={`w-52 h-72 sm:w-60 sm:h-84 md:w-68 md:h-92 lg:w-72 lg:h-96 rounded-[32px] sm:rounded-[36px] overflow-hidden shadow-xl group-hover:shadow-2xl transition-all duration-400 relative ${isTouched ? 'shadow-2xl' : ''
                    }`}
                >
                  {card.image ? (
                    <img
                      src={card.image}
                      alt={card.title || 'Wellness Card'}
                      className="w-full h-full object-cover object-center transition-transform duration-500 ease-out"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-white font-black text-sm p-4 text-center">
                      {card.title}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── CSS for Smooth Right to Left Marquee & Pause on Hover ── */}
      <style>{`
        @keyframes marqueeSlowLoop {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .wellness-marquee-track {
          width: max-content;
          animation: marqueeSlowLoop 45s linear infinite;
        }
        .wellness-marquee-container:hover .wellness-marquee-track,
        .wellness-marquee-container:active .wellness-marquee-track {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  )
}
