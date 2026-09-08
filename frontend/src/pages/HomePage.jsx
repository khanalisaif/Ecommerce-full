import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import {
  Heart, Home, User, PersonStanding, List, Flower2, Droplet, Camera,
  Music, Gift, Sparkles, Flame, ShoppingBag, Shield, ShieldCheck, Truck, Headphones,
  ChevronLeft, ChevronRight, MessageCircle, Laptop, Tablet, Smartphone, Package, Watch, Shirt
} from 'lucide-react'
import { useShop } from '../context/ShopContext'
import { getColorName } from '../data/colorUtils'

const iconComponents = {
  Home, User, PersonStanding, Heart, List, Flower2, Droplet, Camera, Music, Gift, Sparkles, Flame,
  Laptop, Tablet, Smartphone, Headphones, Package, ShoppingBag, Watch, Shirt,
}

export default function HomePage() {
  const navigate = useNavigate()
  const { addToCart, toggleWishlist, isWishlisted, cartCount, products, categories, banners, collections, categoryCards, featureBanners } = useShop()
  const bestSellers = products.filter((p) => p.isBestSeller)
  const [currentBanner, setCurrentBanner] = useState(0)
  const [activeCategory, setActiveCategory] = useState(0)

  // Auto-slide banner every 4 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner(prev => (prev + 1) % banners.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  const nextBanner = () => setCurrentBanner(prev => (prev + 1) % banners.length)
  const prevBanner = () => setCurrentBanner(prev => (prev - 1 + banners.length) % banners.length)

  const handleAddToCart = (e, product) => {
    e.stopPropagation()
    addToCart(product, { quantity: 1, color: getColorName(product.colors?.[0]), size: product.sizes?.[0] })
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar cartCount={cartCount} />

      {/* ── Category Tab Strip ─────────────────────────── */}
      <div className="bg-white border-b border-gray-100 sticky top-[72px] z-40">
        <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8">
          <div className="flex justify-between items-center overflow-x-auto scrollbar-hide">
            {categories.map((cat, idx) => {
              const Icon = iconComponents[cat.icon] || Heart
              const slug = cat.slug || cat.name.replace(/\s+/g, '-')
              const isActive = activeCategory === idx
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveCategory(idx)
                    window.scrollTo({ top: 0, behavior: 'instant' })
                    navigate(`/category/${slug}`)
                  }}
                  className={`flex flex-col items-center gap-2 px-2 pb-3 pt-4 flex-shrink-0 min-w-[72px] border-b-[3px] transition-all duration-200 ${
                    isActive
                      ? 'border-purple-600 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {cat.image ? (
                    <img src={cat.image} alt="" className={`w-7 h-7 rounded-full object-cover ${isActive ? 'ring-2 ring-purple-600' : ''}`} />
                  ) : (
                    <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                  )}
                  <span className={`text-[12px] whitespace-nowrap ${isActive ? 'font-bold' : 'font-semibold'}`}>
                    {cat.name}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <main className="w-full">

        {/* ── Hero Banner Carousel ────────────────────────── */}
        <div className="relative mx-4 md:mx-8 mt-6 rounded-2xl overflow-hidden h-[280px] md:h-[340px]">
          {banners.map((banner, index) => (
            <div
              key={banner.id}
              className={`absolute inset-0 transition-all duration-700 ${index === currentBanner ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
            >
              {/* gradient bg */}
              <div className="h-full w-full bg-gradient-to-br from-purple-200 via-pink-200 to-purple-700 relative overflow-hidden">
                {/* right side image */}
                <img
                  src={banner.image}
                  alt={banner.title}
                  className="absolute right-0 top-0 h-full w-1/2 object-cover object-left opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-purple-100/90 via-pink-100/60 to-transparent" />

                {/* text content */}
                <div className="relative z-10 h-full flex flex-col justify-center px-5 md:px-12 max-w-[100%] sm:max-w-[90%] md:max-w-[55%] pt-2">
                  <p className="text-[9px] sm:text-[10px] font-bold text-pink-600 tracking-[0.2em] uppercase mb-1.5 sm:mb-2">
                    PRIVATE. PREMIUM.
                  </p>
                  <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-gray-900 leading-tight mb-1.5 sm:mb-2">
                    {banner.title}
                    <br />
                    <span className="text-purple-600">{banner.subtitle}</span>
                  </h2>
                  <p className="text-gray-600 text-[11px] sm:text-sm md:text-base mb-4 sm:mb-6 max-w-[85%] sm:max-w-full leading-snug">
                    {banner.description}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-start">
                    <button
                      onClick={() => {
                        window.scrollTo({ top: 0, behavior: 'instant' })
                        navigate('/category/Best-Sellers')
                      }}
                      className="bg-purple-600 text-white px-4 py-2 sm:px-5 sm:py-2.5 rounded-full font-bold text-[11px] sm:text-sm hover:bg-purple-700 transition-colors flex items-center justify-center gap-1.5 w-max"
                    >
                      {banner.buttonText} →
                    </button>
                    <button
                      onClick={() => {
                        window.scrollTo({ top: 0, behavior: 'instant' })
                        navigate('/category/New-Arrivals')
                      }}
                      className="border-2 border-gray-600 text-gray-800 bg-white/80 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full font-bold text-[11px] sm:text-sm hover:border-gray-900 transition-colors w-max"
                    >
                      Explore Collections
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Prev / Next */}
          <button
            onClick={prevBanner}
            className="absolute left-2 md:left-3 top-1/2 -translate-y-1/2 z-20 bg-white/40 md:bg-white/90 hover:bg-white/70 md:hover:bg-white shadow-sm md:shadow p-1.5 md:p-2 rounded-full opacity-60 md:opacity-100 transition-all"
          >
            <ChevronLeft size={16} className="text-gray-800 md:text-gray-700" />
          </button>
          <button
            onClick={nextBanner}
            className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 z-20 bg-white/40 md:bg-white/90 hover:bg-white/70 md:hover:bg-white shadow-sm md:shadow p-1.5 md:p-2 rounded-full opacity-60 md:opacity-100 transition-all"
          >
            <ChevronRight size={16} className="text-gray-800 md:text-gray-700" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentBanner(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === currentBanner ? 'bg-purple-600 w-6' : 'bg-white/70 w-1.5'}`}
              />
            ))}
          </div>
        </div>

        {/* ── Collections 5-Column Grid ───────────────────── */}
        <div className="mt-8 px-4 md:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {collections.map((col) => (
              <div
                key={col.id}
                onClick={() => {
                window.scrollTo({ top: 0, behavior: 'instant' })
                navigate(`/category/${col.slug}`)
              }}
                className="relative rounded-2xl overflow-hidden cursor-pointer group h-[140px] md:h-[160px]"
              >
                <img
                  src={col.image}
                  alt={col.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-between p-3">
                  <div>
                    <h3 className="text-white font-black text-base leading-tight drop-shadow">{col.name}</h3>
                    {col.subtitle && (
                      <p className="text-white/90 text-[12px] mt-0.5 leading-tight font-medium drop-shadow">{col.subtitle}</p>
                    )}
                  </div>
                  <div className="bg-white w-7 h-7 rounded-full flex items-center justify-center shadow">
                    <span className="text-gray-900 text-[11px] font-black">→</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Category Cards (Phone / Tab / Laptop) ──────── */}
        <div className="mt-8 px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {categoryCards.map((card) => (
              <div
                key={card.id}
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'instant' })
                  navigate(`/category/${card.slug}`)
                }}
                className="relative rounded-3xl overflow-hidden cursor-pointer group h-[220px] md:h-[260px] bg-[#e8e0d5]"
              >
                <img
                  src={card.image}
                  alt={card.name}
                  className="absolute right-0 top-0 h-full w-2/3 object-cover object-left group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#e8e0d5] via-[#e8e0d5]/80 to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-between p-7">
                  <div>
                    <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 mb-1 sm:mb-2 tracking-tight">{card.name}</h3>
                    <p className="text-gray-700 text-[11px] sm:text-[13px] font-semibold leading-relaxed max-w-[150px] mb-3 sm:mb-4">{card.subtitle}</p>
                    <button className="border-2 border-gray-800 text-gray-900 px-4 py-1.5 sm:px-5 sm:py-2 rounded-full font-bold text-[10px] sm:text-[12px] hover:bg-gray-900 hover:text-white transition-colors w-max">
                      {card.cta} →
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2 sm:mt-0">
                    <span className="bg-white/90 backdrop-blur-sm text-gray-800 text-[9px] sm:text-[11px] font-bold px-2 py-1 sm:px-3 sm:py-1.5 rounded flex items-center gap-1 shadow-sm w-max">
                      ⚗ {card.styles}
                    </span>
                    <span className="bg-white/90 backdrop-blur-sm text-gray-800 text-[9px] sm:text-[11px] font-bold px-2 py-1 sm:px-3 sm:py-1.5 rounded flex items-center gap-1 shadow-sm w-max">
                      📐 {card.sizes}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Best Sellers ────────────────────────────────── */}
        <div className="mt-12 px-4 md:px-8">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-xl md:text-2xl font-black text-gray-900">Best Sellers</h2>
            <button
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'instant' })
                navigate(`/category/Best-Sellers`)
              }}
              className="text-purple-600 font-bold text-sm flex items-center gap-1 hover:underline"
            >
              View All <span>→</span>
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {bestSellers.map((product) => (
              <div
                key={product.id}
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'instant' })
                  navigate(`/product/${product.id}`)
                }}
                className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              >
                {/* Image */}
                <div className="relative h-[140px] md:h-[160px] bg-gray-100 overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                  {product.badge && (
                    <span className={`absolute top-2 left-2 text-white text-[9px] font-bold px-2 py-0.5 rounded ${
                      product.badge === 'Bestseller' ? 'bg-orange-500' :
                      product.badge === 'Popular' ? 'bg-pink-500' :
                      product.badge === 'New' ? 'bg-green-500' : 'bg-purple-500'
                    }`}>
                      {product.badge}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="p-3">
                  <p className="text-gray-500 text-[11px] font-bold mb-0.5 uppercase tracking-wide">{product.category}</p>
                  <h3 className="text-gray-900 font-bold text-[14px] mb-1.5 line-clamp-1">{product.name}</h3>

                  {/* Stars */}
                  <div className="flex items-center gap-1 mb-2">
                    <div className="flex text-yellow-400 text-[13px]">
                      {'★'.repeat(Math.floor(product.rating))}
                    </div>
                    <span className="text-gray-500 text-[11px] font-medium">({product.reviews.toLocaleString()})</span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span className="text-gray-900 font-black text-[15px]">₹{product.price.toLocaleString()}</span>
                    <span className="text-gray-400 line-through text-[12px]">₹{product.originalPrice.toLocaleString()}</span>
                    <span className="text-red-500 text-[11px] font-bold">{product.discount}</span>
                  </div>

                  <button
                    onClick={(e) => handleAddToCart(e, product)}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white text-[12px] font-bold py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <ShoppingBag size={14} /> Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Feature Banner (Category Promo Strip right above Trust Badges / Footer) ───────────── */}
        {featureBanners.map((fb) => (
          <div key={fb.id} className="mt-16 px-4 md:px-8 pb-12">
            <div
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'instant' })
                navigate(`/category/${fb.slug || 'For-Her'}`)
              }}
              className="relative rounded-3xl overflow-hidden cursor-pointer group min-h-[180px] md:min-h-[220px] flex flex-col md:flex-row items-center justify-between p-6 sm:p-8 md:p-12 gap-6 bg-gray-900"
            >
              <img
                src={fb.image}
                alt={fb.title}
                className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />

              <div className="relative z-10 text-center md:text-left flex flex-col items-center md:items-start">
                <h2 className="text-2xl md:text-4xl font-black text-white mb-1.5 md:mb-2 tracking-tight">{fb.title}</h2>
                <p className="text-white/90 text-xs md:text-sm leading-relaxed whitespace-pre-line">
                  {fb.subtitle}
                </p>
                <button className="mt-3 md:mt-5 border-2 border-white text-white px-5 py-2 md:px-6 md:py-2.5 rounded-full font-bold text-xs md:text-sm hover:bg-white hover:text-gray-900 transition-colors w-max">
                  {fb.buttonText || 'Shop Now'}
                </button>
              </div>

              <div className="relative z-10 flex flex-row md:flex-col gap-2 md:gap-3 flex-wrap justify-center">
                {fb.badge1 && (
                  <span className="bg-white/20 backdrop-blur-md text-white text-[11px] md:text-xs font-bold px-3.5 py-1.5 md:px-5 md:py-2.5 rounded-lg flex items-center gap-2 border border-white/10 shadow-sm w-max">
                    {fb.badge1}
                  </span>
                )}
                {fb.badge2 && (
                  <span className="bg-white/20 backdrop-blur-md text-white text-[11px] md:text-xs font-bold px-3.5 py-1.5 md:px-5 md:py-2.5 rounded-lg flex items-center gap-2 border border-white/10 shadow-sm w-max">
                    {fb.badge2}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}

      </main>

      <Footer />
    </div>
  )
}

