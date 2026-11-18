import { useNavigate } from 'react-router-dom'
import { Sparkles, Leaf, CheckCircle2, ShieldCheck, Award } from 'lucide-react'

// Custom certificate badge icons matching the image (scaled 2x for prominent visibility)
function CertIcon({ type, image }) {
  if (image) {
    return (
      <img
        src={image}
        alt={type || 'Certificate Badge'}
        className="h-7 sm:h-8 w-auto max-w-[48px] object-contain drop-shadow-xs shrink-0"
      />
    )
  }
  switch (type) {
    case 'Halal':
      return (
        <span className="inline-flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 border-white/90 text-[11px] sm:text-xs font-black leading-none shrink-0 shadow-xs">
          حلال
        </span>
      )
    case 'ISO':
      return (
        <span className="inline-flex items-center justify-center px-2 py-1 rounded-md border-2 border-white/90 text-[12px] sm:text-[13px] font-black tracking-tighter leading-none shrink-0 shadow-xs">
          ISO
        </span>
      )
    case 'FSSAI':
      return (
        <span className="inline-flex items-center justify-center italic font-black text-[14px] sm:text-[16px] tracking-tight border-b-2 border-white leading-none shrink-0">
          fssai
        </span>
      )
    case 'Leaf':
    case 'Gelatin':
      return <Leaf className="w-6 h-6 sm:w-7 sm:h-7 shrink-0 text-white drop-shadow-xs" />
    case 'Keto':
      return (
        <svg className="w-6 h-6 sm:w-7 sm:h-7 shrink-0 text-white fill-current drop-shadow-xs" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z" opacity="0.3"/>
          <path d="M12 3a9 9 0 0 0-9 9c0 3.31 1.79 6.2 4.47 7.73A8.96 8.96 0 0 1 6 12a6 6 0 0 1 12 0c0 2.92-1.4 5.51-3.56 7.15A8.99 8.99 0 0 0 21 12a9 9 0 0 0-9-9z"/>
        </svg>
      )
    case 'GMP':
      return (
        <span className="inline-flex items-center justify-center px-2 py-1 rounded-md border-2 border-white/90 text-[12px] sm:text-[13px] font-black tracking-tighter leading-none shrink-0 shadow-xs">
          GMP
        </span>
      )
    default:
      return <CheckCircle2 className="w-6 h-6 sm:w-7 sm:h-7 shrink-0 text-white drop-shadow-xs" />
  }
}

export default function NewHero({ settings }) {
  const navigate = useNavigate()

  if (!settings || settings.enabled === false) return null

  const {
    tagline = '',
    title = '',
    titleHighlight = '',
    description = '',
    badges = [],
    buttonText = 'SHOP NOW',
    buttonLink = '/category/Best-Sellers',
    image = '',
    bgColor = '#fce4ec',
    bgGradientEnd = '#fed7e2',
    tickerBgColor = '#d81b60',
    tickerItems = [],
  } = settings || {}

  const hasBannerContent = Boolean(title || titleHighlight || description || image)
  const hasTickerContent = Array.isArray(tickerItems) && tickerItems.length > 0
  if (!hasBannerContent && !hasTickerContent) return null

  const handleButtonClick = (e) => {
    e.stopPropagation()
    window.scrollTo({ top: 0, behavior: 'instant' })
    navigate(buttonLink || '/category/Best-Sellers')
  }

  return (
    <div className="w-full mx-auto px-3 sm:px-4 lg:px-4 mt-5">
      {/* ── Main Banner Box ──────────────────────────────────── */}
      {hasBannerContent && (
        <div
          className="relative rounded-3xl sm:rounded-[36px] overflow-hidden shadow-sm border border-pink-100 flex flex-col md:flex-row items-stretch"
          style={{
            background: `linear-gradient(135deg, ${bgColor} 0%, ${bgGradientEnd || bgColor} 100%)`,
          }}
        >
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-pink-300/20 blur-3xl pointer-events-none" />

          {/* ── Text Content (Desktop Left / Mobile Bottom) ────── */}
          <div className="relative z-10 flex-1 p-6 sm:p-8 md:p-12 lg:p-16 flex flex-col justify-center order-2 md:order-1 text-center md:text-left">
            {tagline && (
              <p className="text-[10px] sm:text-xs font-black text-pink-600 tracking-[0.22em] uppercase mb-2 sm:mb-3">
                {tagline}
              </p>
            )}

            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 leading-[1.15] mb-3 sm:mb-4 tracking-tight">
              {title}{' '}
              {titleHighlight && (
                <span className="text-pink-600 block sm:inline">
                  {titleHighlight}
                </span>
              )}
            </h2>

            {description && (
              <p className="text-gray-700 text-xs sm:text-sm md:text-base leading-relaxed mb-5 sm:mb-6 max-w-xl mx-auto md:mx-0 font-medium">
                {description}
              </p>
            )}

            {badges && badges.length > 0 && (
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 sm:gap-6 mb-6 sm:mb-8 text-xs sm:text-sm font-bold text-gray-800">
                {badges.map((b, i) => (
                  <span key={i} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-pink-500 inline-block" />
                    {b}
                  </span>
                ))}
              </div>
            )}

            <div>
              <button
                onClick={handleButtonClick}
                className="inline-flex items-center justify-center bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-black text-xs sm:text-sm px-8 py-3.5 sm:px-9 sm:py-4 rounded-full shadow-lg shadow-pink-500/30 hover:shadow-xl hover:scale-105 active:scale-95 transition-all tracking-wider uppercase cursor-pointer"
              >
                {buttonText || 'SHOP NOW'}
              </button>
            </div>
          </div>

          {/* ── Product Mockup Image (Desktop Right / Mobile Top: takes ~half view) ── */}
          <div className="relative flex-1 order-1 md:order-2 flex items-center justify-center p-4 sm:p-6 md:p-8 min-h-[260px] sm:min-h-[320px] md:min-h-[380px] lg:min-h-[440px]">
            {image && (
              <img
                src={image}
                alt={title}
                className="w-full max-h-[280px] sm:max-h-[340px] md:max-h-[420px] object-contain drop-shadow-xl hover:scale-102 transition-transform duration-500"
              />
            )}
          </div>
        </div>
      )}

      {/* ── Scrolling Certifications Ticker Strip (Right to Left Marquee) ── */}
      {tickerItems && tickerItems.length > 0 && (
        <div
          className="relative w-full rounded-2xl md:rounded-3xl lg:rounded-[32px] overflow-hidden mt-3 shadow-md py-5 sm:py-6 md:py-7"
          style={{ backgroundColor: tickerBgColor || '#d81b60' }}
        >
          {/* Subtle edge fade overlays for infinite scroll effect */}
          <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-r from-[#d81b60] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-l from-[#d81b60] to-transparent z-10 pointer-events-none" />

          {/* Marquee Track: duplicated seamlessly for 100% infinite continuous loop */}
          <div className="marquee-wrapper flex overflow-hidden select-none">
            <div className="marquee-track flex items-center gap-10 sm:gap-14 shrink-0 animate-marquee">
              {tickerItems.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 sm:gap-4 text-white whitespace-nowrap">
                  <CertIcon type={item.icon || item.text} image={item.image} />
                  {item.text && (
                    <span className="font-extrabold text-sm sm:text-base md:text-lg tracking-wide">
                      {item.text}
                    </span>
                  )}
                  <span className="text-white/40 text-base sm:text-lg ml-6 sm:ml-10">•</span>
                </div>
              ))}
            </div>

            {/* Duplicate set for seamless continuous loop */}
            <div className="marquee-track flex items-center gap-10 sm:gap-14 shrink-0 animate-marquee" aria-hidden="true">
              {tickerItems.map((item, idx) => (
                <div key={`dup-${idx}`} className="flex items-center gap-3 sm:gap-4 text-white whitespace-nowrap">
                  <CertIcon type={item.icon || item.text} image={item.image} />
                  {item.text && (
                    <span className="font-extrabold text-sm sm:text-base md:text-lg tracking-wide">
                      {item.text}
                    </span>
                  )}
                  <span className="text-white/40 text-base sm:text-lg ml-6 sm:ml-10">•</span>
                </div>
              ))}
            </div>

            {/* Triplicate for ultra-wide screens */}
            <div className="marquee-track flex items-center gap-10 sm:gap-14 shrink-0 animate-marquee" aria-hidden="true">
              {tickerItems.map((item, idx) => (
                <div key={`trip-${idx}`} className="flex items-center gap-3 sm:gap-4 text-white whitespace-nowrap">
                  <CertIcon type={item.icon || item.text} image={item.image} />
                  {item.text && (
                    <span className="font-extrabold text-sm sm:text-base md:text-lg tracking-wide">
                      {item.text}
                    </span>
                  )}
                  <span className="text-white/40 text-base sm:text-lg ml-6 sm:ml-10">•</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Global CSS for seamless infinite marquee animation */}
      <style>{`
        @keyframes marqueeLoop {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
        .animate-marquee {
          animation: marqueeLoop 24s linear infinite;
        }
        .marquee-wrapper:hover .animate-marquee {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  )
}
