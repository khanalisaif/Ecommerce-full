import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { Heart, ShoppingCart, Zap, Check, Maximize2, ChevronRight, ShieldCheck, Box, RotateCcw, Lock, X, Star } from 'lucide-react'
import { useShop } from '../context/ShopContext'
import { useAuth } from '../context/AuthContext'
import { normalizeColorList, getSwatchStyle } from '../data/colorUtils'
import reviewService from '../services/reviewService'
import productService from '../services/productService'
import { trackProductView } from './AccountPage'

export default function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart, toggleWishlist, isWishlisted, showToast, products } = useShop()

  const foundProduct = products.find(p => p.id === String(id))
  const [fetchedProduct, setFetchedProduct] = useState(null)

  useEffect(() => {
    if (!foundProduct && id) {
      productService.getProductById(id)
        .then(res => setFetchedProduct(res.data.product))
        .catch(() => {})
    }
  }, [id, foundProduct])

  // Track this product as recently viewed in localStorage
  useEffect(() => {
    if (id) trackProductView(id)
  }, [id])

  const product = foundProduct || fetchedProduct || {
    id: id || 'demo-1',
    name: 'Item Name',
    description: 'Product Description',
    price: 999,
    originalPrice: 1499,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80',
    colors: ['Black', 'Silver'],
    sizes: ['Standard'],
    category: 'Gadget'
  }

  const parsedSizes = Array.isArray(product.sizes) ? product.sizes : (product.sizes ? product.sizes.split(',').map(s=>s.trim()) : ['XS', 'S', 'M', 'L', 'XL', 'XXL'])
  const parsedColors = normalizeColorList(Array.isArray(product.colors) ? product.colors : (product.color ? [product.color] : ['Black', 'Grey', 'White']))

  const [selectedColorIndex, setSelectedColorIndex] = useState(0)
  const [selectedSize, setSelectedSize] = useState(parsedSizes[0] || 'M')
  const [activeThumb, setActiveThumb] = useState(0)

  useEffect(() => {
    setSelectedColorIndex(0)
    setSelectedSize(parsedSizes[0] || 'M')
  }, [id, product])

  useEffect(() => {
    setActiveThumb(0)
  }, [selectedColorIndex])

  const currentColorVariant = parsedColors[selectedColorIndex]
  const selectedColorName = currentColorVariant?.name || 'Black'
  
  const displayImages = (currentColorVariant && currentColorVariant.images && currentColorVariant.images.length > 0)
    ? currentColorVariant.images
    : (product.images && product.images.length > 0 ? product.images : [product.image, product.image, product.image, product.image, product.image].filter(Boolean))
    
  const displayStock = currentColorVariant?.stock !== undefined ? currentColorVariant.stock : (product.stock || 0)
  const stockInfo = displayStock > 0 ? 'In Stock' : 'Out of Stock'

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [id])

  const discountPercent = Math.round((1 - product.price / product.originalPrice) * 100)

  // Real reviews for this product, fetched from the backend
  const [reviewsList, setReviewsList] = useState([])
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    reviewService.getProductReviews(product.id)
      .then((res) => {
        const mapped = (res.data.reviews || []).map((r) => ({
          id: r.id, name: r.userName, date: r.date, stars: r.rating, text: r.body, images: r.images,
        }))
        setReviewsList(mapped)
      })
      .catch(() => setReviewsList([]))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id])

  const totalReviews = product.reviews || 0
  const avgRating = product.rating || 0
  const ratingBreakdown = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: reviewsList.filter((r) => r.stars === stars).length,
  }))
  const maxBreakdown = Math.max(1, ...ratingBreakdown.map(r => r.count))

  const relatedProducts = products.filter(p => p.isBestSeller && p.id !== product.id).slice(0, 4)

  const [showAllReviews, setShowAllReviews] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', body: '' })
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)

  const handleSubmitReview = () => {
    if (!reviewForm.body.trim()) return
    if (!isAuthenticated) {
      showToast('Please login to write a review')
      setShowReviewModal(false)
      navigate('/login')
      return
    }
    setIsSubmittingReview(true)
    reviewService.createReview(product.id, reviewForm)
      .then((res) => {
        const r = res.data.review
        setReviewsList((prev) => [{ id: r.id, name: r.userName, date: r.date, stars: r.rating, text: r.body, images: r.images }, ...prev])
        setShowReviewModal(false)
        showToast('Review submitted successfully!')
        setReviewForm({ rating: 5, title: '', body: '' })
      })
      .catch((err) => showToast(err.message))
      .finally(() => setIsSubmittingReview(false))
  }

  const StarRating = ({ rating, size = 12 }) => (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(s => <span key={s} style={{ fontSize: size }} className={s <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-200'}>★</span>)}
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50/30 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 md:px-6 py-8 flex flex-col gap-8">
        
        {/* TOP SECTION: Gallery & Actions */}
        <div className="bg-white border border-gray-100 rounded-[20px] p-6 shadow-sm flex flex-col md:flex-row gap-10">
          
          {/* Gallery Area */}
          <div className="flex flex-col-reverse md:flex-row gap-4 md:w-[55%]">
            {/* Thumbnails */}
            <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-visible">
              {displayImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveThumb(i)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                    activeThumb === i ? 'border-purple-600 p-0.5' : 'border-transparent bg-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img src={img} alt="thumb" className="w-full h-full object-cover rounded-lg" />
                </button>
              ))}
            </div>

            {/* Main Image */}
            <div className="relative flex-1 bg-gray-200 rounded-2xl overflow-hidden aspect-[4/5] md:aspect-auto md:h-[500px]">
              <img src={displayImages[activeThumb] || displayImages[0] || product.image} alt={product.name} className="w-full h-full object-cover" />
              
              {/* Wishlist Button */}
              <button
                onClick={(e) => { e.stopPropagation(); toggleWishlist(product) }}
                className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md text-gray-400 hover:text-pink-500 transition-colors z-10"
              >
                <Heart size={18} fill={isWishlisted(product.id) ? 'currentColor' : 'none'} className={isWishlisted(product.id) ? 'text-pink-500' : ''} />
              </button>

              {/* Top Left Badge */}
              <div className="absolute top-4 left-4 bg-pink-500 text-white w-10 h-10 rounded-full flex items-center justify-center text-[10px] font-black leading-tight text-center shadow-md">
                {discountPercent}%<br/>OFF
              </div>
              {/* Fullscreen button */}
              <button className="absolute bottom-4 right-4 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-gray-600 shadow hover:bg-white transition-colors">
                <Maximize2 size={14} />
              </button>
            </div>
          </div>

          {/* Details & Actions Area */}
          <div className="flex-1 flex flex-col pt-2">
            <h1 className="text-3xl font-bold text-gray-900 mb-1">{product.name}</h1>
            <p className="text-gray-500 text-sm mb-3">{product.description}</p>
            
            <div className="flex items-center gap-2 mb-4">
              <StarRating rating={4.6} size={14} />
              <span className="text-gray-900 font-bold text-sm">4.6</span>
              <span className="text-gray-400 text-xs">(256 Reviews)</span>
            </div>

            <div className="flex items-end gap-3 mb-1">
              <span className="text-2xl font-black text-pink-600">₹{product.price.toLocaleString()}</span>
              <span className="text-gray-400 line-through text-sm mb-1">₹{product.originalPrice.toLocaleString()}</span>
              <span className="text-green-500 font-bold text-xs mb-1">{discountPercent}% OFF</span>
            </div>
            <p className="text-gray-400 text-[11px] mb-5">Inclusive of all taxes</p>

            <div className="bg-blue-50/50 border border-blue-100 rounded-lg px-4 py-2.5 mb-6">
              <p className="text-blue-800 text-xs font-semibold flex items-center gap-2">
                🎉 Special Offer: Extra 10% OFF on Prepaid Orders
              </p>
            </div>

            {/* Colors */}
            <div className="mb-6">
              <p className="text-xs text-gray-800 mb-2">Color: <span className="font-semibold">{selectedColorName}</span></p>
              <div className="flex gap-2">
                {parsedColors.map((c, i) => (
                  <button 
                    key={i}
                    onClick={() => setSelectedColorIndex(i)}
                    title={c.name}
                    className={`w-8 h-8 rounded border-2 transition-all p-0.5 ${selectedColorIndex === i ? 'border-purple-600' : 'border-gray-200'}`}
                  >
                    <div className="w-full h-full rounded-sm border border-gray-200/50" style={getSwatchStyle(c, i)} />
                  </button>
                ))}
              </div>
            </div>

            {/* Sizes */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <p className="text-xs text-gray-800">Size: <span className="font-semibold">{selectedSize}</span></p>
                <button className="text-purple-600 text-[10px] font-bold hover:underline">Size Guide</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {parsedSizes.map(s => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={`min-w-[42px] px-2 h-9 rounded border flex items-center justify-center text-xs font-semibold transition-all ${
                      selectedSize === s ? 'border-purple-600 text-purple-600 bg-purple-50/50' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs mb-6">
              <div className={`w-2 h-2 rounded-full ${displayStock === 0 ? 'bg-red-500' : 'bg-green-500'}`} />
              <span className={`font-semibold ${displayStock === 0 ? 'text-red-600' : 'text-green-600'}`}>
                {stockInfo}
              </span>
              {displayStock > 0 && <span className="text-gray-400">Ships within 24 hours</span>}
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <button 
                onClick={() => displayStock > 0 && addToCart(product, { quantity: 1, size: selectedSize, color: selectedColorName })}
                disabled={displayStock === 0}
                className="flex-1 bg-purple-700 text-white rounded-xl py-3.5 flex items-center justify-center gap-2 font-bold text-sm hover:bg-purple-800 transition-colors shadow-sm disabled:bg-gray-300 disabled:cursor-not-allowed disabled:hover:bg-gray-300"
              >
                <ShoppingCart size={16} /> {displayStock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
              <button 
                onClick={() => {
                  if (displayStock === 0) return
                  addToCart(product, { quantity: 1, size: selectedSize, color: selectedColorName })
                    .then(() => navigate('/checkout'))
                    .catch(() => {})
                }}
                disabled={displayStock === 0}
                className="flex-1 bg-pink-600 text-white rounded-xl py-3.5 flex items-center justify-center gap-2 font-bold text-sm hover:bg-pink-700 transition-colors shadow-sm disabled:bg-gray-300 disabled:cursor-not-allowed disabled:hover:bg-gray-300"
              >
                <Zap size={16} fill="currentColor" /> Buy Now
              </button>
            </div>

            {/* Features list */}
            <div className="flex items-center justify-between px-2 pt-4 border-t border-gray-100">
              <div className="flex flex-col items-center gap-1.5 text-center">
                <Box size={14} className="text-purple-600" />
                <span className="text-[10px] text-gray-500 font-medium">Discreet Packaging</span>
              </div>
              <div className="flex flex-col items-center gap-1.5 text-center">
                <RotateCcw size={14} className="text-purple-600" />
                <span className="text-[10px] text-gray-500 font-medium">Easy Returns</span>
              </div>
              <div className="flex flex-col items-center gap-1.5 text-center">
                <Lock size={14} className="text-purple-600" />
                <span className="text-[10px] text-gray-500 font-medium">100% Secure Payment</span>
              </div>
            </div>

          </div>
        </div>

        {/* MIDDLE SECTION: Details & Reviews */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Product Details Card */}
          <div className="bg-white border border-gray-100 rounded-[20px] p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Product Details</h2>
            <p className="text-xs text-gray-500 mb-4">{product.description || 'Premium quality product with expert craftsmanship'}</p>
            
            <div className="space-y-2 mb-6">
              {[
                'Premium quality materials for lasting comfort',
                'Expertly crafted for the perfect fit',
                'Soft and breathable fabric',
                'Elegant design for all occasions',
                'Easy care and machine washable'
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Check size={14} className="text-purple-600" />
                  <span className="text-xs text-gray-600">{feature}</span>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              {[
                { l: 'Material',    v: 'Premium Lace & Microfiber' },
                { l: 'Care',        v: 'Machine Wash Cold, Gentle Cycle' },
                { l: 'Fit Type',    v: 'Regular Fit' },
                { l: 'Style',       v: product.category || 'Intimate Apparel' },
                { l: 'Country',     v: 'Made in India' },
                { l: 'Unit',        v: '1 Piece' },
                { l: 'Product Id',  v: String(product.id).padStart(8, '0') },
              ].map((item, idx) => (
                <div key={idx} className="flex text-xs">
                  <div className="w-[120px] font-semibold text-gray-900">{item.l}</div>
                  <div className="text-gray-500">{item.v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Reviews Card */}
          <div className="bg-white border border-gray-100 rounded-[20px] p-6 shadow-sm">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-lg font-bold text-gray-900">Customer Reviews ({totalReviews})</h2>
              <button onClick={() => setShowReviewModal(true)} className="bg-purple-700 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-purple-800 transition-colors">
                Write a Review
              </button>
            </div>

            <div className="flex items-start gap-6 mb-8">
              <div className="text-center">
                <div className="text-5xl font-black text-gray-900 mb-1">{avgRating.toFixed(1)}</div>
                <StarRating rating={avgRating} size={14} />
                <p className="text-[10px] text-gray-400 mt-1">Based on {totalReviews} reviews</p>
              </div>
              <div className="flex-1 flex flex-col gap-1.5">
                {ratingBreakdown.map(r => (
                  <div key={r.stars} className="flex items-center gap-2 text-[10px]">
                    <span className="w-3 text-right font-bold text-gray-600">{r.stars}</span>
                    <span className="text-yellow-400 text-xs">★</span>
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-600 rounded-full" style={{ width: `${(r.count / maxBreakdown) * 100}%` }} />
                    </div>
                    <span className="w-6 text-right text-gray-400">{r.count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              {reviewsList.length === 0 && (
                <p className="text-gray-400 text-sm py-4">No reviews yet. Be the first to review this product!</p>
              )}
              {reviewsList.slice(0, showAllReviews ? undefined : 2).map((rev, idx) => (
                <div key={rev.id || idx} className="border-t border-gray-50 pt-5">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                        <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80" alt="avatar" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-gray-900">{rev.name}</span>
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <ShieldCheck size={10} className="text-green-500" />
                          <span className="text-[9px] text-green-500 font-bold">Verified Buyer</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] text-gray-400">{rev.date}</span>
                  </div>
                  <div className="mb-2"><StarRating rating={rev.stars} size={10} /></div>
                  <p className="text-xs text-gray-600 mb-3 leading-relaxed">{rev.text}</p>
                  {rev.images && (
                    <div className="flex gap-2">
                      {rev.images.map((img, i) => (
                        <div key={i} className="w-14 h-14 rounded-lg overflow-hidden border border-gray-100">
                          <img src={img} alt="review" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button onClick={() => setShowAllReviews(v => !v)} className="text-purple-600 text-xs font-bold hover:underline flex items-center gap-1 mt-6">
              {showAllReviews ? 'Show fewer reviews' : 'Show all reviews'} <span>→</span>
            </button>
          </div>
        </div>

        {/* BOTTOM SECTION: You may also like */}
        <div className="mt-4">
          <div className="flex justify-between items-center mb-6 px-1">
            <h2 className="text-lg font-bold text-gray-900">You may also like</h2>
            <button onClick={() => navigate('/category/Best-Sellers')} className="border border-purple-200 text-purple-700 bg-white px-4 py-1.5 rounded-full text-xs font-bold hover:bg-purple-50 transition-colors">
              View All
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedProducts.map(prod => (
              <div
                key={prod.id}
                onClick={() => navigate(`/product/${prod.id}`)}
                className="bg-white rounded-[20px] overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="relative aspect-[4/5] bg-gray-100 overflow-hidden group">
                  <img src={prod.image} alt={prod.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleWishlist(prod) }}
                    className="absolute top-2.5 right-2.5 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm text-gray-400 hover:text-pink-500 transition-colors"
                  >
                    <Heart size={16} fill={isWishlisted(prod.id) ? 'currentColor' : 'none'} className={isWishlisted(prod.id) ? 'text-pink-500' : ''} />
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="text-gray-900 font-bold text-xs mb-2 line-clamp-1">{prod.name}</h3>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-gray-900 font-black text-sm">₹{prod.price.toLocaleString()}</span>
                    <span className="text-gray-400 line-through text-[10px]">₹{prod.originalPrice.toLocaleString()}</span>
                    <span className="text-green-500 text-[10px] font-bold">{prod.discount}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>

      <Footer />

      {/* Write a Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.45)' }} onClick={() => setShowReviewModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-black text-gray-900 text-lg">Write a Review</h3>
              <button onClick={() => setShowReviewModal(false)} className="text-gray-400 hover:text-gray-600 transition"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Your Rating</p>
                <div className="flex gap-1">
                  {[1,2,3,4,5].map(s => (
                    <button key={s} onClick={() => setReviewForm(f => ({ ...f, rating: s }))}>
                      <Star size={28} className={s <= reviewForm.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200 fill-gray-200'} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">Review Title</label>
                <input
                  type="text"
                  value={reviewForm.title}
                  onChange={e => setReviewForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Summarize your experience"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-400"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">Your Review</label>
                <textarea
                  value={reviewForm.body}
                  onChange={e => setReviewForm(f => ({ ...f, body: e.target.value }))}
                  placeholder="Tell us about your experience with this product..."
                  rows={4}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-400 resize-none"
                />
              </div>
              <button
                onClick={handleSubmitReview}
                disabled={!reviewForm.body.trim() || isSubmittingReview}
                className="w-full bg-purple-700 text-white py-3 rounded-xl font-bold text-sm hover:bg-purple-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
