import { useNavigate } from 'react-router-dom'
import { Heart, ShoppingBag, Zap, Star, ShieldCheck, Truck, Sparkles, ArrowRight } from 'lucide-react'

export default function HeroProductBanner({ product, onAddToCart, onBuyNow, isWishlisted, onToggleWishlist }) {
  const navigate = useNavigate()

  if (!product || !product.id) return null

  const handleCardClick = () => {
    window.scrollTo({ top: 0, behavior: 'instant' })
    navigate(`/product/${product.id}`)
  }

  const wishlisted = isWishlisted ? isWishlisted(product.id) : false
  const rating = product.rating != null ? Number(product.rating) : 4.8
  const reviews = product.reviews != null ? Number(product.reviews) : 240
  const discountStr =
    product.discount ||
    (product.originalPrice > product.price
      ? `${Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF`
      : null)

  return (
    <div className="mt-14 px-4 md:px-8">
      {/* ── Outer Hero Card Container (min-h-[360px] md:min-h-[440px] - exactly 2x Feature Banner height) ── */}
      <div
        onClick={handleCardClick}
        className="relative rounded-3xl overflow-hidden cursor-pointer group min-h-[360px] md:min-h-[440px] bg-gradient-to-br from-purple-50/70 via-white to-pink-50/50 border border-purple-100/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col md:flex-row items-stretch"
      >
        {/* Subtle decorative background glow circles */}
        <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-purple-200/30 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-pink-200/30 blur-3xl pointer-events-none" />

        {/* ── LEFT SIDE: Product Image Preview (Takes ~48%-50% on desktop) ── */}
        <div className="relative w-full md:w-[48%] lg:w-[50%] p-4 sm:p-6 md:p-8 flex items-center justify-center flex-shrink-0 bg-white/70 md:bg-transparent border-b md:border-b-0 md:border-r border-purple-100/60">
          {/* Badge: Top-Left (Discount Tag if applicable) */}
          {discountStr && (
            <div className="absolute top-4 sm:top-6 left-4 sm:left-6 z-20 flex flex-wrap gap-2">
              <span className="bg-rose-500 text-white text-[10px] sm:text-xs font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-md">
                {discountStr}
              </span>
            </div>
          )}

          {/* Wishlist Button: Top-Right */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              if (onToggleWishlist) onToggleWishlist(product)
            }}
            className="absolute top-4 sm:top-6 right-4 sm:right-6 z-20 w-10 h-10 rounded-full bg-white/90 backdrop-blur-md border border-gray-200/80 shadow-md flex items-center justify-center text-gray-500 hover:text-pink-500 hover:scale-110 transition-all cursor-pointer"
            aria-label="Add to wishlist"
          >
            <Heart
              size={18}
              fill={wishlisted ? 'currentColor' : 'none'}
              className={wishlisted ? 'text-pink-500' : ''}
            />
          </button>

          {/* Product Image */}
          <div className="relative w-full h-72 sm:h-80 md:h-96 lg:h-[420px] flex items-center justify-center overflow-hidden">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full max-w-[96%] max-h-[96%] object-contain drop-shadow-xl group-hover:scale-105 transition-transform duration-500 ease-out"
            />
          </div>
        </div>

        {/* ── RIGHT SIDE: Product Details & Actions ── */}
        <div className="relative z-10 flex-1 p-6 sm:p-8 lg:p-10 flex flex-col justify-between">
          <div>
            {/* Product Title */}
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 leading-tight mb-2 group-hover:text-purple-600 transition-colors">
              {product.name}
            </h3>

            {/* Stars & Reviews */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    fill={i < Math.floor(rating) ? 'currentColor' : 'none'}
                    className={i < Math.floor(rating) ? 'text-amber-400' : 'text-gray-300'}
                  />
                ))}
              </div>
              <span className="font-bold text-gray-800 text-xs sm:text-sm">
                {rating.toFixed(1)}
              </span>
              <span className="text-gray-400 text-xs sm:text-sm">
                ({reviews.toLocaleString()} verified reviews)
              </span>
            </div>

            {/* Description */}
            <p className="text-gray-600 text-xs sm:text-sm md:text-[15px] leading-relaxed line-clamp-3 mb-5 font-normal">
              {product.description ||
                'Experience premium craftsmanship with industry-leading quality and comfort designed to elevate your everyday lifestyle.'}
            </p>

            {/* Price Section */}
            <div className="flex items-baseline gap-3 mb-6 flex-wrap">
              <span className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
                ₹{product.price?.toLocaleString()}
              </span>
              {product.originalPrice > product.price && (
                <span className="text-gray-400 line-through text-lg sm:text-xl font-medium">
                  ₹{product.originalPrice?.toLocaleString()}
                </span>
              )}
              {discountStr && (
                <span className="text-rose-600 bg-rose-50 border border-rose-100 text-xs sm:text-sm font-black px-2.5 py-1 rounded-lg">
                  Save {discountStr}
                </span>
              )}
            </div>

            {/* Trust Perks Row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1 pb-6 border-t border-gray-100 text-gray-600 text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <Truck size={15} className="text-purple-600 shrink-0" />
                <span>Free Fast Delivery</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck size={15} className="text-purple-600 shrink-0" />
                <span>100% Genuine Tech</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Sparkles size={15} className="text-purple-600 shrink-0" />
                <span>7-Day Easy Returns</span>
              </div>
            </div>
          </div>

          {/* ── ACTION BUTTONS: Add to Cart & Buy Now ── */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            {/* Add to Cart Button */}
            <button
              type="button"
              onClick={(e) => onAddToCart(e, product)}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 shadow-md shadow-purple-600/25 hover:shadow-lg hover:shadow-purple-600/40 transition-all text-sm cursor-pointer"
            >
              <ShoppingBag size={18} />
              Add to Cart
            </button>

            {/* Buy Now Button */}
            <button
              type="button"
              onClick={(e) => onBuyNow(e, product)}
              className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 shadow-md shadow-pink-500/25 hover:shadow-lg hover:shadow-pink-500/40 transition-all text-sm cursor-pointer"
            >
              <Zap size={18} fill="currentColor" />
              Buy Now
            </button>

            {/* View Details Link */}
            <button
              type="button"
              onClick={handleCardClick}
              className="hidden lg:flex items-center justify-center px-4 py-3.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold gap-1 transition-colors cursor-pointer"
            >
              Details <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
