import { useState, useEffect, useRef } from 'react'
import {
  Megaphone,
  Gift,
  Send,
  Trash2,
  Calendar,
  DollarSign,
  Percent,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Mail,
  Copy,
  Plus,
  Eye,
  Tag,
  Clock,
  Users,
  UploadCloud,
} from 'lucide-react'
import { useShop } from '../../../context/ShopContext'
import { compressImage } from '../../../utils/imageCompression'
import adminBroadcastService from '../../../services/admin/adminBroadcastService'
import adminCouponService from '../../../services/admin/adminCouponService'

export default function OffersUpdatesTab() {
  const { showToast } = useShop()
  const [activeSubTab, setActiveSubTab] = useState('news') // 'news' | 'coupons'

  // --- News & Updates State ---
  const [newsTitle, setNewsTitle] = useState('')
  const [newsMessage, setNewsMessage] = useState('')
  const [newsBanner, setNewsBanner] = useState('')
  const [isUploadingBanner, setIsUploadingBanner] = useState(false)
  const bannerInputRef = useRef(null)
  const [isSendingNews, setIsSendingNews] = useState(false)
  const [broadcasts, setBroadcasts] = useState([])
  const [isLoadingBroadcasts, setIsLoadingBroadcasts] = useState(true)
  const [previewNews, setPreviewNews] = useState(false)

  // --- Coupons & Offers State ---
  const [couponCode, setCouponCode] = useState('')
  const [couponDesc, setCouponDesc] = useState('')
  const [discountType, setDiscountType] = useState('percentage')
  const [discountValue, setDiscountValue] = useState('')
  const [minOrderAmount, setMinOrderAmount] = useState('')
  const [validFrom, setValidFrom] = useState(new Date().toISOString().split('T')[0])
  const [validUntil, setValidUntil] = useState('')
  const [broadcastCouponEmail, setBroadcastCouponEmail] = useState(true)
  const [isCreatingCoupon, setIsCreatingCoupon] = useState(false)
  const [coupons, setCoupons] = useState([])
  const [isLoadingCoupons, setIsLoadingCoupons] = useState(true)

  // Load broadcasts & coupons on mount
  useEffect(() => {
    loadBroadcasts()
    loadCoupons()
  }, [])

  const loadBroadcasts = () => {
    setIsLoadingBroadcasts(true)
    adminBroadcastService
      .getAll()
      .then((res) => setBroadcasts(res.data.broadcasts || []))
      .catch((err) => showToast(err.message))
      .finally(() => setIsLoadingBroadcasts(false))
  }

  const loadCoupons = () => {
    setIsLoadingCoupons(true)
    adminCouponService
      .getAllCoupons()
      .then((res) => setCoupons(res.data.coupons || []))
      .catch((err) => showToast(err.message))
      .finally(() => setIsLoadingCoupons(false))
  }

  // --- Handlers: News Broadcast ---
  const handleBannerFile = async (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file')
      return
    }
    setIsUploadingBanner(true)
    try {
      const compressed = await compressImage(file)
      if (compressed) {
        setNewsBanner(compressed)
        showToast('Banner image uploaded')
      }
    } catch (err) {
      showToast('Failed to process image: ' + err.message)
    } finally {
      setIsUploadingBanner(false)
    }
  }

  const handleSendNews = async (e) => {
    e.preventDefault()
    if (!newsTitle.trim() || !newsMessage.trim()) {
      showToast('Please enter both a title and message')
      return
    }

    setIsSendingNews(true)
    try {
      const res = await adminBroadcastService.sendNews({
        title: newsTitle.trim(),
        message: newsMessage.trim(),
        bannerUrl: newsBanner.trim(),
      })
      showToast(res.message || 'News broadcast sent successfully!')
      setNewsTitle('')
      setNewsMessage('')
      setNewsBanner('')
      setPreviewNews(false)
      loadBroadcasts()
    } catch (err) {
      showToast(err.message)
    } finally {
      setIsSendingNews(false)
    }
  }

  const handleDeleteBroadcast = async (id) => {
    if (!window.confirm('Are you sure you want to delete this broadcast from history?')) return
    try {
      await adminBroadcastService.delete(id)
      setBroadcasts((prev) => prev.filter((b) => b._id !== id))
      showToast('Broadcast record deleted')
    } catch (err) {
      showToast(err.message)
    }
  }

  // --- Handlers: Coupons ---
  const handleCreateCoupon = async (e) => {
    e.preventDefault()
    if (!couponCode.trim()) {
      showToast('Please enter a coupon code')
      return
    }
    if (!discountValue || Number(discountValue) <= 0) {
      showToast('Please enter a valid discount value')
      return
    }
    if (!validUntil) {
      showToast('Please specify an expiry date for the coupon')
      return
    }

    setIsCreatingCoupon(true)
    try {
      const res = await adminCouponService.createCoupon({
        code: couponCode.trim().toUpperCase(),
        description: couponDesc.trim(),
        discountType,
        discountValue: Number(discountValue),
        minOrderAmount: Number(minOrderAmount) || 0,
        validFrom: validFrom ? new Date(validFrom) : new Date(),
        validUntil: new Date(validUntil),
        broadcastEmail: broadcastCouponEmail,
      })
      showToast(res.message || 'Coupon created successfully!')
      setCouponCode('')
      setCouponDesc('')
      setDiscountValue('')
      setMinOrderAmount('')
      setValidUntil('')
      loadCoupons()
    } catch (err) {
      showToast(err.message)
    } finally {
      setIsCreatingCoupon(false)
    }
  }

  const handleDeleteCoupon = async (id) => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) return
    try {
      await adminCouponService.deleteCoupon(id)
      setCoupons((prev) => prev.filter((c) => c._id !== id))
      showToast('Coupon deleted successfully')
    } catch (err) {
      showToast(err.message)
    }
  }

  const handleToggleCoupon = async (id) => {
    try {
      const res = await adminCouponService.toggleCoupon(id)
      setCoupons((prev) => prev.map((c) => (c._id === id ? res.data.coupon : c)))
      showToast(res.message)
    } catch (err) {
      showToast(err.message)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    showToast(`Copied ${text} to clipboard!`)
  }

  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Megaphone size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Offers & Updates Hub</h2>
              <p className="text-gray-500 text-xs mt-0.5">
                Broadcast news to subscribed users and manage promotional discount coupons
              </p>
            </div>
          </div>
        </div>

        {/* Sub-tab pills */}
        <div className="flex items-center bg-gray-100/80 p-1.5 rounded-xl border border-gray-200/50 self-start sm:self-auto">
          <button
            onClick={() => setActiveSubTab('news')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'news'
                ? 'bg-white text-purple-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Mail size={15} />
            News & Updates
          </button>
          <button
            onClick={() => setActiveSubTab('coupons')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'coupons'
                ? 'bg-white text-purple-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Gift size={15} />
            Offers & Coupons
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SUB-TAB 1: NEWS & UPDATES (BROADCAST NEWSLETTER)
      ───────────────────────────────────────────────────────────── */}
      {activeSubTab === 'news' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Form: Compose News */}
          <div className="lg:col-span-6 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Send size={16} />
                </div>
                <h3 className="font-bold text-gray-900">Broadcast News & Updates</h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewNews(!previewNews)}
                className="text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1"
              >
                <Eye size={14} />
                {previewNews ? 'Hide Preview' : 'Preview'}
              </button>
            </div>

            <form onSubmit={handleSendNews} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Announcement Title / Subject *
                </label>
                <input
                  type="text"
                  placeholder="e.g. New Electronics Arrivals & Weekend Super Sale!"
                  value={newsTitle}
                  onChange={(e) => setNewsTitle(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Banner Image (Upload Media)
                </label>
                {newsBanner ? (
                  <div className="relative rounded-xl border border-gray-200 overflow-hidden bg-gray-50 group">
                    <img src={newsBanner} alt="Banner Preview" className="w-full h-36 object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => bannerInputRef.current?.click()}
                        className="px-3 py-1.5 bg-white text-gray-800 text-xs font-bold rounded-lg shadow hover:bg-gray-100 transition cursor-pointer"
                      >
                        Change Image
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewsBanner('')}
                        className="p-1.5 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 transition cursor-pointer"
                        title="Remove Banner"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => bannerInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-200 hover:border-purple-400 hover:bg-purple-50/20 rounded-xl p-5 text-center cursor-pointer transition-colors"
                  >
                    {isUploadingBanner ? (
                      <div className="flex flex-col items-center justify-center py-2 text-purple-600">
                        <Loader2 size={24} className="animate-spin mb-1" />
                        <p className="text-xs font-semibold">Processing image...</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-gray-400 hover:text-purple-600">
                        <UploadCloud size={28} className="mb-1.5 text-purple-500" />
                        <p className="text-xs font-bold text-gray-700">Click to upload banner image</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">Select image from your device</p>
                      </div>
                    )}
                  </div>
                )}
                <input
                  ref={bannerInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleBannerFile(e.target.files[0])
                  }}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Message Content *
                </label>
                <textarea
                  rows={5}
                  placeholder="Write your announcement or news here. Explain what's new, exciting deals, or platform updates..."
                  value={newsMessage}
                  onChange={(e) => setNewsMessage(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 leading-relaxed"
                  required
                />
              </div>

              <div className="bg-purple-50/60 rounded-xl p-3 border border-purple-100 flex items-start gap-2 text-xs text-purple-700">
                <Users size={16} className="shrink-0 mt-0.5" />
                <span>
                  This news update will be dispatched directly to the email of all customers who have <b>News & Updates</b> enabled in their account preferences.
                </span>
              </div>

              <button
                type="submit"
                disabled={isSendingNews}
                className="w-full py-3 px-5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg disabled:opacity-60 cursor-pointer"
                style={{ background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)' }}
              >
                {isSendingNews ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Broadcasting Email...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Send News & Updates
                  </>
                )}
              </button>
            </form>

            {/* Email live preview card */}
            {previewNews && (
              <div className="mt-6 pt-5 border-t border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Email Live Preview</p>
                <div className="border border-purple-200 rounded-xl p-4 bg-white shadow-inner">
                  <div className="border-b border-gray-100 pb-2 mb-3 text-center">
                    <p className="font-extrabold text-purple-600 text-sm tracking-wider">HASHTELICOM NEWS</p>
                  </div>
                  {newsBanner && (
                    <img src={newsBanner} alt="Banner" className="w-full h-32 object-cover rounded-lg mb-3" />
                  )}
                  <h4 className="font-bold text-gray-900 text-base mb-2">{newsTitle || 'Announcement Title Preview'}</h4>
                  <p className="text-xs text-gray-600 whitespace-pre-line leading-relaxed mb-4">
                    {newsMessage || 'Your message content will be displayed here beautifully formatted.'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Sent Broadcast History */}
          <div className="lg:col-span-6 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
                  <Clock size={16} />
                </div>
                <h3 className="font-bold text-gray-900">Sent Broadcast History ({broadcasts.length})</h3>
              </div>
            </div>

            {isLoadingBroadcasts ? (
              <div className="flex justify-center py-16">
                <Loader2 size={28} className="animate-spin text-purple-600" />
              </div>
            ) : broadcasts.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <Mail size={40} className="mx-auto mb-2 opacity-40" />
                <p className="font-medium text-sm">No broadcasts sent yet</p>
                <p className="text-xs mt-1">Compose and send your first news update to subscribers!</p>
              </div>
            ) : (
              <div className="space-y-3.5 max-h-[600px] overflow-y-auto pr-1">
                {broadcasts.map((b) => (
                  <div
                    key={b._id}
                    className="p-4 rounded-xl border border-gray-100 hover:border-purple-200 transition-colors bg-gray-50/50 relative group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900 text-sm truncate">{b.title}</h4>
                        <p className="text-xs text-gray-500 line-clamp-2 mt-1 leading-relaxed">{b.message}</p>
                        <div className="flex flex-wrap items-center gap-3 mt-3 text-[11px] text-gray-400 font-medium">
                          <span className="flex items-center gap-1 text-purple-600 font-semibold bg-purple-50 px-2 py-0.5 rounded-md">
                            <Users size={12} /> {b.recipientCount} Recipients
                          </span>
                          <span>
                            {new Date(b.sentAt).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              b.status === 'sent'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-600'
                            }`}
                          >
                            {b.status}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteBroadcast(b._id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        title="Delete from history"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          SUB-TAB 2: OFFERS & COUPONS (COUPON BUILDER & PROMOTIONS)
      ───────────────────────────────────────────────────────────── */}
      {activeSubTab === 'coupons' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Form: Create Coupon */}
          <div className="lg:col-span-5 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-pink-50 text-pink-600 flex items-center justify-center">
                <Tag size={16} />
              </div>
              <h3 className="font-bold text-gray-900">Create New Coupon / Offer</h3>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Coupon Code *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g. SAVE20, FESTIVE500"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="w-full px-4 py-2.5 text-sm font-mono uppercase font-bold border border-gray-200 rounded-xl focus:outline-none focus:border-purple-500"
                    required
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                    UPPERCASE
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Offer Headline / Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Flat 20% OFF on all mobile accessories"
                  value={couponDesc}
                  onChange={(e) => setCouponDesc(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Discount Type
                  </label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 bg-white"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Discount Value *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      placeholder={discountType === 'percentage' ? '20' : '200'}
                      value={discountValue}
                      onChange={(e) => setDiscountValue(e.target.value)}
                      className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-purple-500"
                      required
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">
                      {discountType === 'percentage' ? '%' : '₹'}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Minimum Order Amount (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="0 (No minimum)"
                  value={minOrderAmount}
                  onChange={(e) => setMinOrderAmount(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-purple-500"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  Coupon will only apply if the customer's cart subtotal is equal to or greater than this amount.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Valid From
                  </label>
                  <input
                    type="date"
                    value={validFrom}
                    onChange={(e) => setValidFrom(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Expires On *
                  </label>
                  <input
                    type="date"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>
              </div>

              {/* Email Broadcast Toggle */}
              <div className="bg-pink-50/70 border border-pink-100 rounded-xl p-3 flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="broadcastCouponEmail"
                  checked={broadcastCouponEmail}
                  onChange={(e) => setBroadcastCouponEmail(e.target.checked)}
                  className="mt-0.5 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                />
                <label htmlFor="broadcastCouponEmail" className="text-xs text-pink-900 cursor-pointer">
                  <b>Email this coupon to subscribers</b> who have <b>Offers & Discounts</b> enabled in their notifications.
                </label>
              </div>

              <button
                type="submit"
                disabled={isCreatingCoupon}
                className="w-full py-3 px-5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg disabled:opacity-60 cursor-pointer"
                style={{ background: 'linear-gradient(135deg, #ec4899 0%, #a855f7 100%)' }}
              >
                {isCreatingCoupon ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Creating & Broadcasting...
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    Create & Broadcast Coupon
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Column: Active & Past Coupons */}
          <div className="lg:col-span-7 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Gift size={16} />
                </div>
                <h3 className="font-bold text-gray-900">Manage Coupons ({coupons.length})</h3>
              </div>
            </div>

            {isLoadingCoupons ? (
              <div className="flex justify-center py-16">
                <Loader2 size={28} className="animate-spin text-purple-600" />
              </div>
            ) : coupons.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <Tag size={40} className="mx-auto mb-2 opacity-40" />
                <p className="font-medium text-sm">No coupons created yet</p>
                <p className="text-xs mt-1">Create a promotional coupon code to reward your shoppers!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-1">
                {coupons.map((c) => {
                  const isExpired = new Date(c.validUntil) < new Date()
                  const statusClass = !c.isActive
                    ? 'bg-gray-100 text-gray-500'
                    : isExpired
                    ? 'bg-red-100 text-red-700'
                    : 'bg-green-100 text-green-700'

                  return (
                    <div
                      key={c._id}
                      className={`border-2 border-dashed rounded-2xl p-4 transition-all relative ${
                        c.isActive && !isExpired
                          ? 'border-purple-300 bg-purple-50/20'
                          : 'border-gray-200 bg-gray-50/50 opacity-80'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-base text-gray-900 tracking-wider">
                            {c.code}
                          </span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(c.code)}
                            className="text-gray-400 hover:text-purple-600 cursor-pointer"
                            title="Copy code"
                          >
                            <Copy size={13} />
                          </button>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusClass}`}>
                          {!c.isActive ? 'Inactive' : isExpired ? 'Expired' : 'Active'}
                        </span>
                      </div>

                      <p className="text-lg font-black text-purple-600 mt-2">
                        {c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`}
                      </p>

                      {c.description && (
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">{c.description}</p>
                      )}

                      <div className="mt-3 pt-3 border-t border-gray-100/80 space-y-1 text-[11px] text-gray-500">
                        {c.minOrderAmount > 0 && (
                          <p>
                            Min Order: <b>₹{c.minOrderAmount.toLocaleString('en-IN')}</b>
                          </p>
                        )}
                        <p>
                          Expires: <b>{new Date(c.validUntil).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</b>
                        </p>
                        <p className="text-purple-700 font-medium">
                          Used: <b>{c.usedCount || 0} times</b>
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100/60">
                        <button
                          type="button"
                          onClick={() => handleToggleCoupon(c._id)}
                          className={`text-xs font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                            c.isActive
                              ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                              : 'bg-green-50 text-green-700 hover:bg-green-100'
                          }`}
                        >
                          {c.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCoupon(c._id)}
                          className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Coupon"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
