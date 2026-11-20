import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'

// Ensures every spotlight product description consistently renders in 3 lines
function format3LineDescription(desc, name) {
  if (!desc || typeof desc !== 'string') {
    return `Discover the natural wellness benefits of ${name || 'Zenpha'}. Thoughtfully crafted with premium ingredients to elevate your daily vitality, balance and mindful self-care journey.`
  }
  const clean = desc.trim()
  if (clean.length < 110) {
    const period = clean.endsWith('.') ? '' : '.'
    return `${clean}${period} Crafted with premium natural ingredients to elevate your daily vitality, balance and mindful self-care routine.`
  }
  return clean
}

export default function Hero2ProductCarousel({ settings }) {
  const navigate = useNavigate()
  const containerRef = useRef(null)
  const [containerWidth, setContainerWidth] = useState(0)
  const touchStartX = useRef(null)
  const touchEndX = useRef(null)
  const isSlidingRef = useRef(false)

  const items = settings?.spotlightCarousel || []
  const bgColor = settings?.spotlightBgColor || '#fce4ec'
  const bgGradientEnd = settings?.spotlightBgGradientEnd || bgColor

  // Initialize virtualIndex so that by default, Item 1 (Ashwagandha Gummies) is in the center
  // with Item 0 (Bright as Day) on the left and Item 2 (Loss Herbal Tea) on the right.
  const [virtualIndex, setVirtualIndex] = useState(() => (items.length > 2 ? items.length + 1 : items.length))
  const [isTransitioning, setIsTransitioning] = useState(true)
  const initializedRef = useRef(false)

  // Keep virtualIndex aligned if items are loaded asynchronously
  useEffect(() => {
    if (items.length > 0 && !initializedRef.current) {
      const defaultIdx = items.length > 2 ? items.length + 1 : items.length
      setVirtualIndex(defaultIdx)
      initializedRef.current = true
    }
  }, [items.length])

  // Measure container width for exact centering and edge button positioning
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth)
      }
    }
    updateWidth()
    window.addEventListener('resize', updateWidth)
    return () => window.removeEventListener('resize', updateWidth)
  }, [])

  // Auto-enable transition after seamless instant repositioning
  useEffect(() => {
    if (!isTransitioning) {
      const timer = setTimeout(() => {
        setIsTransitioning(true)
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [isTransitioning])

  if (!settings || settings.spotlightCarouselEnabled === false) return null
  if (items.length === 0) return null

  // Create 3 sets for 100% infinite continuous sliding track where both sides always have cards
  const extendedItems = items.length > 1 ? [...items, ...items, ...items] : items

  const handlePrev = () => {
    if (isSlidingRef.current || items.length <= 1) return
    isSlidingRef.current = true
    setIsTransitioning(true)
    setVirtualIndex((prev) => prev - 1)
    setTimeout(() => {
      isSlidingRef.current = false
    }, 850)
  }

  const handleNext = () => {
    if (isSlidingRef.current || items.length <= 1) return
    isSlidingRef.current = true
    setIsTransitioning(true)
    setVirtualIndex((prev) => prev + 1)
    setTimeout(() => {
      isSlidingRef.current = false
    }, 850)
  }

  // When transition ends, silently normalize virtualIndex within the middle set to loop infinitely
  const handleTransitionEnd = () => {
    isSlidingRef.current = false
    if (items.length <= 1) return

    if (virtualIndex >= 2 * items.length) {
      setIsTransitioning(false)
      setVirtualIndex((prev) => prev - items.length)
    } else if (virtualIndex < items.length) {
      setIsTransitioning(false)
      setVirtualIndex((prev) => prev + items.length)
    }
  }

  // Touch swipe support for mobile
  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX
  }

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX
  }

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return
    const distance = touchStartX.current - touchEndX.current
    if (distance > 50) {
      handleNext()
    } else if (distance < -50) {
      handlePrev()
    }
    touchStartX.current = null
    touchEndX.current = null
  }

  const handleExplore = (item) => {
    window.scrollTo({ top: 0, behavior: 'instant' })
    const targetLink = item.link || (item.productId ? `/product/${item.productId}` : '/category/Best-Sellers')
    navigate(targetLink)
  }

  // Calculate card width & gap for physical sliding track
  const isMobile = containerWidth < 768
  const cardWidth = containerWidth
    ? isMobile
      ? Math.min(containerWidth * 0.88, 380)
      : Math.min(containerWidth * 0.78, 1020)
    : 880
  const gap = isMobile ? 18 : 32

  // Center the active card in the middle of container
  const trackOffset = containerWidth
    ? (containerWidth - cardWidth) / 2 - virtualIndex * (cardWidth + gap)
    : 0

  // Exact positions for arrow buttons placed on card boundaries matching the reference image
  const leftButtonPos = containerWidth
    ? Math.max(20, (containerWidth - cardWidth) / 2)
    : 40
  const rightButtonPos = containerWidth
    ? Math.min(containerWidth - 20, (containerWidth + cardWidth) / 2)
    : 880

  // Currently active item index in the original items array (0 to items.length - 1)
  const activeOriginalIndex = items.length > 0 ? ((virtualIndex % items.length) + items.length) % items.length : 0

  return (
    <section
      className="relative w-full overflow-hidden py-10 sm:py-14 md:py-18 select-none border-t border-b border-black/5"
      style={{
        background: `linear-gradient(135deg, ${bgColor} 0%, ${bgGradientEnd || bgColor} 100%)`,
      }}
    >
      <div className="w-full max-w-[1720px] mx-auto px-2 sm:px-3 lg:px-4">
        
        {/* ── Carousel Container with Physical Sliding Track ─── */}
        <div
          ref={containerRef}
          className="relative w-full overflow-hidden py-4"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Horizontal Track that smoothly glides when buttons are pressed */}
          <div
            className="flex items-center"
            style={{
              transform: `translateX(${trackOffset}px)`,
              gap: `${gap}px`,
              willChange: 'transform',
              transition: isTransitioning ? 'transform 800ms cubic-bezier(0.25, 1, 0.5, 1)' : 'none',
            }}
            onTransitionEnd={handleTransitionEnd}
          >
            {extendedItems.map((item, vIdx) => {
              const isActive = vIdx === virtualIndex

              return (
                <div
                  key={`${item.id || item.productId || 'item'}-${vIdx}`}
                  onClick={() => {
                    if (!isActive) {
                      setIsTransitioning(true)
                      setVirtualIndex(vIdx)
                    }
                  }}
                  className={`shrink-0 rounded-3xl sm:rounded-[36px] overflow-hidden p-5 sm:p-7 md:p-12 text-white relative flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 cursor-pointer ${
                    isActive
                      ? 'scale-100 z-20 shadow-2xl pointer-events-auto'
                      : 'scale-[0.96] z-10 shadow-lg hover:scale-[0.98]'
                  }`}
                  style={{
                    width: `${cardWidth}px`,
                    height: isMobile ? '500px' : '430px',
                    opacity: 1, // Both center and side cards are 100% clear as requested
                    background: `linear-gradient(135deg, ${item.bgColor || '#f99d26'} 0%, ${item.bgGradientEnd || item.bgColor || '#ea580c'} 100%)`,
                    transition: 'transform 800ms cubic-bezier(0.25, 1, 0.5, 1), box-shadow 400ms ease',
                  }}
                >
                  {/* Subtle inner background glow */}
                  <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-white/10 blur-3xl pointer-events-none" />

                  {/* ── IMAGE CONTENT (Mobile Top: order-1, Desktop Right: order-2) ── */}
                  <div className="relative flex-1 w-full md:w-[50%] lg:w-[52%] order-1 md:order-2 h-[48%] sm:h-[50%] md:h-full flex items-center justify-center min-h-[190px] sm:min-h-[240px] md:min-h-[300px]">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="max-h-[180px] sm:max-h-[240px] md:max-h-[310px] w-auto max-w-[90%] object-contain drop-shadow-2xl z-10 transition-transform duration-500 group-hover:scale-105 select-none pointer-events-none"
                      />
                    )}
                  </div>

                  {/* ── TEXT CONTENT (Mobile Bottom: order-2, Desktop Left: order-1) ── */}
                  <div className="flex-1 w-full md:w-[50%] lg:w-[48%] order-2 md:order-1 flex flex-col justify-end md:justify-center text-left z-10 pt-1 pb-1 md:py-1">
                    {item.tagline && (
                      <p
                        className="text-[11px] sm:text-xs md:text-sm font-black tracking-widest uppercase mb-1 drop-shadow-xs"
                        style={{ color: item.taglineColor || '#ffffff' }}
                      >
                        {item.tagline}
                      </p>
                    )}

                    <h3
                      className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-black leading-tight mb-1.5 sm:mb-2.5 tracking-tight drop-shadow-xs"
                      style={{ color: item.nameColor || item.titleColor || '#ffffff' }}
                    >
                      {item.name}
                    </h3>

                    {/* Clean 3-line description matching reference design */}
                    <p
                      className="text-xs sm:text-sm md:text-[15px] font-medium leading-relaxed mb-4 sm:mb-6 md:mb-8 line-clamp-3 drop-shadow-xs max-w-md"
                      style={{ color: item.descriptionColor || 'rgba(255, 255, 255, 0.95)' }}
                    >
                      {format3LineDescription(item.description, item.name)}
                    </p>

                    <div className="flex justify-start">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleExplore(item)
                        }}
                        className="inline-flex items-center justify-center font-black text-xs sm:text-sm px-7 py-3 sm:px-9 sm:py-3.5 rounded-full shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all tracking-wider uppercase cursor-pointer w-max"
                        style={{
                          color: item.buttonTextColor || '#111827',
                          backgroundColor: item.buttonBgColor || '#ffffff',
                        }}
                      >
                        {item.buttonText || 'EXPLORE >'}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* ── Left / Right Navigation Buttons (Positioned on Card Borders matching image) ── */}
          {items.length > 1 && containerWidth > 0 && (
            <>
              <button
                type="button"
                onClick={handlePrev}
                className="absolute top-1/2 w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-white text-gray-800 shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all cursor-pointer z-30 border border-gray-100"
                style={{
                  left: `${leftButtonPos}px`,
                  transform: 'translate(-50%, -50%)',
                }}
                aria-label="Previous product"
              >
                <ChevronLeft size={isMobile ? 20 : 24} className="text-gray-800" strokeWidth={2.5} />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="absolute top-1/2 w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-white text-gray-800 shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all cursor-pointer z-30 border border-gray-100"
                style={{
                  left: `${rightButtonPos}px`,
                  transform: 'translate(-50%, -50%)',
                }}
                aria-label="Next product"
              >
                <ChevronRight size={isMobile ? 20 : 24} className="text-gray-800" strokeWidth={2.5} />
              </button>
            </>
          )}
        </div>

        {/* ── Bottom Pagination Indicator Dots ────────────────── */}
        {items.length > 1 && (
          <div className="flex items-center justify-center gap-2 mt-4 sm:mt-6">
            {items.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setIsTransitioning(true)
                  setVirtualIndex(items.length + idx)
                }}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  idx === activeOriginalIndex
                    ? 'w-7 sm:w-8 h-2.5 bg-pink-600 shadow-sm'
                    : 'w-2.5 h-2.5 bg-pink-300/80 hover:bg-pink-400'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}

      </div>
    </section>
  )
}
