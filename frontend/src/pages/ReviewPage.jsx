import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import {
  Star, CheckCircle2, ShieldCheck, ArrowLeft, Package, Sparkles,
  AlertCircle, Loader2, ExternalLink, ShoppingBag, Edit3
} from 'lucide-react'
import { useShop } from '../context/ShopContext'
import { useAuth } from '../context/AuthContext'
import reviewService from '../services/reviewService'
import productService from '../services/productService'

const RATING_DESCRIPTIONS = {
  1: { label: 'Poor', desc: 'Disappointed with the product', color: 'text-red-500 bg-red-50 border-red-200' },
  2: { label: 'Fair', desc: 'Below expectations, needs improvement', color: 'text-amber-600 bg-amber-50 border-amber-200' },
  3: { label: 'Average', desc: 'Decent, meets basic expectations', color: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
  4: { label: 'Good', desc: 'Satisfied, works very well', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  5: { label: 'Outstanding', desc: 'Loved it! Highly recommended', color: 'text-purple-600 bg-purple-50 border-purple-200' },
}

const REVIEW_TAGS = [
  'Quality & Finish',
  'Value for Money',
  'Battery / Longevity',
  'Performance',
  'Packaging & Delivery',
  'Design & Comfort',
]

export default function ReviewPage() {
  const { productId } = useParams()
  const navigate = useNavigate()
  const { showToast, products } = useShop()
  const { user } = useAuth()

  const [product, setProduct] = useState(null)
  const [loadingProduct, setLoadingProduct] = useState(true)
  const [productError, setProductError] = useState('')

  // Review Form State
  const [rating, setRating] = useState(5)
  const [hoverRating, setHoverRating] = useState(0)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [selectedTags, setSelectedTags] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  // Existing Review State
  const [existingReview, setExistingReview] = useState(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [submittedReview, setSubmittedReview] = useState(null)

  // 1. Fetch Product details
  useEffect(() => {
    if (!productId) {
      setProductError('Invalid product specified.')
      setLoadingProduct(false)
      return
    }

    // Try finding in existing shop catalog first
    const catalogItem = products?.find((p) => String(p.id) === String(productId))
    if (catalogItem) {
      setProduct(catalogItem)
      setLoadingProduct(false)
    } else {
      setLoadingProduct(true)
      productService
        .getProductById(productId)
        .then((res) => {
          const p = res.data?.product
          if (p) {
            setProduct({
              id: p.id || p._id,
              name: p.name,
              brand: p.brandName || p.brand || 'He & She',
              price: p.price,
              originalPrice: p.originalPrice || p.price,
              image: p.images?.[0] || p.image || '',
              rating: p.rating || 4.5,
              reviews: p.reviews || 0,
            })
          } else {
            setProductError('Product not found.')
          }
        })
        .catch((err) => {
          setProductError(err.response?.data?.message || 'Failed to load product details.')
        })
        .finally(() => setLoadingProduct(false))
    }
  }, [productId, products])

  // 2. Check if user already reviewed this product
  useEffect(() => {
    reviewService
      .getMyReviews()
      .then((res) => {
        const myReviews = res.data?.reviews || []
        const current = myReviews.find(
          (r) => String(r.product) === String(productId) || String(r.product?._id) === String(productId)
        )
        if (current) {
          setExistingReview(current)
          setRating(current.rating || 5)
          setTitle(current.title || '')
          setBody(current.body || '')
          setIsEditMode(true)
        }
      })
      .catch(() => {
        // Ignore silent failure for myReviews
      })
  }, [productId])

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')

    if (!rating || rating < 1 || rating > 5) {
      setFormError('Please select a rating between 1 and 5 stars.')
      return
    }

    if (!body.trim()) {
      setFormError('Please write your review feedback.')
      return
    }

    if (body.trim().length < 5) {
      setFormError('Review must be at least 5 characters long.')
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        rating: Number(rating),
        title: title.trim(),
        body: body.trim(),
      }

      let res
      if (isEditMode && existingReview?.id) {
        res = await reviewService.updateReview(existingReview.id, payload)
        showToast('Review updated successfully!', 'success')
      } else {
        res = await reviewService.createReview(productId, payload)
        showToast('Review submitted successfully!', 'success')
      }

      setSubmittedReview(res.data?.review || { rating, title, body, date: 'Just now' })
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to submit review.'
      setFormError(msg)
      showToast(msg, 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const activeStarLevel = hoverRating || rating
  const currentRatingInfo = RATING_DESCRIPTIONS[activeStarLevel] || RATING_DESCRIPTIONS[5]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-purple-50/20 to-white flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 md:px-6 py-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-purple-700 transition-colors"
          >
            <ArrowLeft size={16} /> Back
          </button>
          <div className="flex items-center gap-2">
            <Link
              to="/account"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-purple-600 transition-colors"
            >
              <ShoppingBag size={14} /> My Orders
            </Link>
            {product && (
              <>
                <span className="text-gray-300">/</span>
                <Link
                  to={`/product/${productId}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-600 hover:underline"
                >
                  View Product <ExternalLink size={12} />
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loadingProduct && (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-purple-600 mb-3" size={36} />
            <p className="text-sm font-semibold text-gray-600">Loading product details...</p>
          </div>
        )}

        {/* Product Error */}
        {!loadingProduct && productError && (
          <div className="bg-white rounded-3xl p-8 border border-red-100 shadow-sm text-center">
            <AlertCircle size={44} className="text-red-500 mx-auto mb-3" />
            <h2 className="text-lg font-bold text-gray-900 mb-1">Product Not Available</h2>
            <p className="text-sm text-gray-500 mb-5">{productError}</p>
            <Link
              to="/account"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 transition shadow-sm"
            >
              Go to My Orders
            </Link>
          </div>
        )}

        {/* Success Confirmation State */}
        {!loadingProduct && !productError && submittedReview && (
          <div className="bg-white rounded-3xl border border-purple-100 shadow-xl p-8 md:p-10 text-center animate-in fade-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-gradient-to-tr from-green-500 to-emerald-400 text-white rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg shadow-green-500/30">
              <CheckCircle2 size={36} />
            </div>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200 mb-3">
              <Sparkles size={13} /> Review Published Live
            </span>

            <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">
              Thank you for your review!
            </h1>
            <p className="text-gray-500 text-sm max-w-md mx-auto mb-8">
              Your feedback for <span className="font-bold text-gray-800">{product?.name}</span> has been submitted and is now displayed on the product page.
            </p>

            {/* Preview of Submitted Review */}
            <div className="bg-gray-50/80 rounded-2xl p-5 max-w-lg mx-auto text-left border border-gray-100 mb-8">
              <div className="flex items-center justify-between mb-2">
                <div className="flex gap-1 text-yellow-400">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={16}
                      className={s <= submittedReview.rating ? 'fill-yellow-400' : 'text-gray-200 fill-gray-200'}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-400 font-medium">Just now</span>
              </div>
              {submittedReview.title && (
                <p className="font-bold text-gray-900 text-sm mb-1">{submittedReview.title}</p>
              )}
              <p className="text-gray-600 text-xs leading-relaxed whitespace-pre-line">
                {submittedReview.body}
              </p>
              <div className="mt-3 pt-3 border-t border-gray-200/60 flex items-center gap-2">
                <ShieldCheck size={14} className="text-green-600" />
                <span className="text-[11px] font-bold text-green-700">Verified Buyer Review</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to={`/product/${productId}#reviews`}
                className="w-full sm:w-auto px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-sm shadow-md hover:shadow-purple-500/25 transition-all text-center"
              >
                View on Product Page →
              </Link>
              <Link
                to="/account"
                className="w-full sm:w-auto px-6 py-3 rounded-full border border-gray-200 text-gray-700 hover:bg-gray-50 font-bold text-sm transition-all text-center"
              >
                Back to My Orders
              </Link>
            </div>
          </div>
        )}

        {/* Review Form State */}
        {!loadingProduct && !productError && !submittedReview && product && (
          <div className="space-y-6">
            {/* Ordered Product Card */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 md:p-6 flex flex-col sm:flex-row items-center sm:items-start gap-5">
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-100">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <Package size={32} />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0 text-center sm:text-left">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1.5">
                  <span className="text-[11px] font-black uppercase tracking-wider text-purple-600">
                    {product.brand}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    <ShieldCheck size={11} /> Verified Purchase
                  </span>
                </div>

                <h1 className="text-lg md:text-xl font-bold text-gray-900 line-clamp-2 mb-2">
                  {product.name}
                </h1>

                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <span className="text-base font-black text-gray-900">
                    ₹{product.price?.toLocaleString()}
                  </span>
                  {product.originalPrice > product.price && (
                    <span className="text-xs text-gray-400 line-through">
                      ₹{product.originalPrice?.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>

              <Link
                to={`/product/${productId}`}
                target="_blank"
                rel="noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-purple-600 hover:text-purple-800 bg-purple-50 hover:bg-purple-100 px-3.5 py-2 rounded-xl transition"
              >
                Product Details <ExternalLink size={12} />
              </Link>
            </div>

            {/* Existing Review Alert */}
            {isEditMode && existingReview && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
                <Edit3 className="text-amber-600 flex-shrink-0 mt-0.5" size={18} />
                <div className="text-xs text-amber-800">
                  <p className="font-bold">You previously reviewed this product</p>
                  <p className="text-amber-700 mt-0.5">
                    Your existing rating and comments are pre-filled below. Updating will replace your review on the product page.
                  </p>
                </div>
              </div>
            )}

            {/* Review Form Card */}
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8 space-y-6"
            >
              <div>
                <h2 className="text-xl font-black text-gray-900">
                  {isEditMode ? 'Update Your Review' : 'Rate & Review This Product'}
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Your feedback helps other buyers make confident purchasing decisions.
                </p>
              </div>

              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl p-3.5 flex items-center gap-2">
                  <AlertCircle size={16} className="flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* 1. Star Rating Selector */}
              <div className="bg-gray-50/70 border border-gray-100 rounded-2xl p-5 text-center">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
                  Overall Rating
                </label>

                <div className="flex items-center justify-center gap-2 sm:gap-3 my-2">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isFilled = star <= (hoverRating || rating)
                    return (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 sm:p-2 transition-transform hover:scale-125 active:scale-95 focus:outline-none"
                        aria-label={`${star} star`}
                      >
                        <Star
                          size={36}
                          className={`transition-colors ${
                            isFilled
                              ? 'text-yellow-400 fill-yellow-400 drop-shadow-[0_2px_8px_rgba(250,204,21,0.4)]'
                              : 'text-gray-300 hover:text-yellow-200'
                          }`}
                        />
                      </button>
                    )
                  })}
                </div>

                {/* Rating Label Badge */}
                <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 rounded-full text-xs font-bold border transition-all">
                  <span className={`px-2 py-0.5 rounded-full font-extrabold ${currentRatingInfo.color}`}>
                    {activeStarLevel} ★ {currentRatingInfo.label}
                  </span>
                  <span className="text-gray-500 font-medium">{currentRatingInfo.desc}</span>
                </div>
              </div>

              {/* 2. Review Title */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Review Headline <span className="text-gray-400 font-normal lowercase">(optional)</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Excellent build quality and fast charging!"
                  maxLength={100}
                  className="w-full px-4 py-3 text-sm bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:bg-white transition"
                />
                <div className="flex justify-between items-center text-[10px] text-gray-400 mt-1 px-1">
                  <span>Summarize your experience in one line</span>
                  <span>{title.length}/100</span>
                </div>
              </div>

              {/* 3. Review Body */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Detailed Review <span className="text-purple-600">*</span>
                </label>
                <textarea
                  rows={5}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="What did you like or dislike? How was the build quality, performance, packaging, and battery life?"
                  className="w-full px-4 py-3 text-sm bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:bg-white transition resize-none leading-relaxed"
                />
                <div className="flex justify-between items-center text-[10px] text-gray-400 mt-1 px-1">
                  <span>Minimum 5 characters recommended</span>
                  <span>{body.length} characters</span>
                </div>
              </div>

              {/* Quick Feature Tags (Helps user write easily) */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Key Highlights You Liked
                </label>
                <div className="flex flex-wrap gap-2">
                  {REVIEW_TAGS.map((tag) => {
                    const isSelected = selectedTags.includes(tag)
                    return (
                      <button
                        type="button"
                        key={tag}
                        onClick={() => {
                          toggleTag(tag)
                          if (!isSelected && !body.includes(tag)) {
                            setBody((b) => (b ? `${b}\n• ${tag}: ` : `• ${tag}: `))
                          }
                        }}
                        className={`text-xs px-3 py-1.5 rounded-full font-semibold border transition ${
                          isSelected
                            ? 'bg-purple-600 text-white border-purple-600'
                            : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-purple-300 hover:text-purple-600'
                        }`}
                      >
                        {isSelected ? `✓ ${tag}` : `+ ${tag}`}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Verified User Notice */}
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-purple-50/50 border border-purple-100 text-xs text-purple-900">
                <ShieldCheck size={16} className="text-purple-600 flex-shrink-0" />
                <span>
                  Posting as <b className="font-bold">{user?.fullName || 'Verified Customer'}</b>. Your review will immediately display on the product page.
                </span>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || !body.trim()}
                  className={`w-full py-3.5 px-6 rounded-2xl font-bold text-sm text-white shadow-md flex items-center justify-center gap-2 transition-all ${
                    isSubmitting || !body.trim()
                      ? 'bg-purple-300 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-600 via-purple-700 to-pink-600 hover:opacity-95 hover:shadow-purple-500/25 active:scale-[0.99]'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      {isEditMode ? 'Updating Review...' : 'Submitting Review...'}
                    </>
                  ) : (
                    <>
                      <Star size={16} className="fill-white" />
                      {isEditMode ? 'Update Review' : 'Submit Review'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
