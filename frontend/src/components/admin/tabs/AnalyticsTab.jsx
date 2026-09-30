import { useEffect, useState, useCallback } from 'react'
import { Search, Eye, Users, ChevronRight, ArrowLeft, Loader2, BarChart2, TrendingUp, User, X, Phone, Mail, Calendar, ShieldCheck, RefreshCw } from 'lucide-react'
import adminAnalyticsService from '../../../services/admin/adminAnalyticsService'

// ─── User Detail Modal ────────────────────────────────────────────────────────
function UserDetailModal({ user, onClose }) {
  if (!user) return null
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.55)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="px-6 py-5 flex items-center justify-between"
          style={{ background: 'linear-gradient(135deg, #581c87 0%, #9333ea 100%)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-base shrink-0"
              style={{ background: 'rgba(255,255,255,0.25)' }}
            >
              {user.fullName?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="text-white font-bold text-base leading-tight">{user.fullName}</p>
              <p className="text-purple-200 text-xs">{user.isActive ? 'Active User' : 'Inactive User'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
              <User size={17} className="text-purple-600" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">User ID</p>
              <p className="text-gray-800 font-semibold text-sm truncate font-mono">{user.userId}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
              <Mail size={17} className="text-blue-600" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">Email</p>
              <p className="text-gray-800 font-semibold text-sm truncate">{user.email || '—'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
              <Phone size={17} className="text-green-600" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">Mobile</p>
              <p className="text-gray-800 font-semibold text-sm">{user.mobileNumber || '—'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
              <Calendar size={17} className="text-amber-600" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">Last Viewed</p>
              <p className="text-gray-800 font-semibold text-sm">
                {user.lastViewedAt
                  ? new Date(user.lastViewedAt).toLocaleString('en-IN', {
                      day: '2-digit', month: 'short', year: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })
                  : '—'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <div className="w-9 h-9 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
              <ShieldCheck size={17} className="text-rose-600" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">Status</p>
              <span
                className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full mt-0.5 ${
                  user.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                }`}
              >
                {user.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Viewers Panel ────────────────────────────────────────────────────────────
function ViewersPanel({ product, onBack }) {
  const [viewers, setViewers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)

  useEffect(() => {
    setIsLoading(true)
    adminAnalyticsService
      .getProductViewers(product._id)
      .then((res) => setViewers(res.data.viewers || []))
      .catch(() => setViewers([]))
      .finally(() => setIsLoading(false))
  }, [product._id])

  const filtered = viewers.filter((v) => {
    const q = search.toLowerCase()
    return (
      !q ||
      v.fullName?.toLowerCase().includes(q) ||
      v.email?.toLowerCase().includes(q) ||
      v.mobileNumber?.includes(q) ||
      String(v.userId)?.includes(q)
    )
  })

  return (
    <div className="space-y-5">
      {/* Back + Product header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-purple-700 font-semibold text-sm hover:text-purple-900 transition-colors"
        >
          <ArrowLeft size={18} />
          Back to Products
        </button>
      </div>

      {/* Product card */}
      <div
        className="rounded-2xl p-5 flex items-center gap-4"
        style={{ background: 'linear-gradient(135deg, #581c87 0%, #9333ea 100%)' }}
      >
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-16 h-16 rounded-xl object-cover shrink-0 ring-2 ring-white/30"
          />
        ) : (
          <div className="w-16 h-16 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <BarChart2 size={24} className="text-white/70" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-white font-bold text-base leading-tight truncate">{product.name}</p>
          <p className="text-purple-200 text-sm font-medium">{product.brand}</p>
          <p className="text-purple-100 text-xs mt-1">₹{product.price?.toLocaleString('en-IN')}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-white/70 text-xs mb-0.5">Viewers</p>
          <p className="text-white font-black text-3xl leading-none">{viewers.length}</p>
        </div>
      </div>

      {/* Viewers table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 sm:px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">
            Users who viewed this product{' '}
            <span className="text-gray-400 font-medium">({filtered.length})</span>
          </h3>
          <div className="relative w-full sm:w-64">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, phone..."
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-600 text-xs uppercase tracking-wide bg-gray-50/70">
                <th className="px-5 sm:px-6 py-3 font-semibold">User</th>
                <th className="px-5 sm:px-6 py-3 font-semibold">User ID</th>
                <th className="px-5 sm:px-6 py-3 font-semibold">Phone</th>
                <th className="px-5 sm:px-6 py-3 font-semibold">Last Viewed</th>
                <th className="px-5 sm:px-6 py-3 font-semibold">Status</th>
                <th className="px-5 sm:px-6 py-3 font-semibold text-right">Details</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    <Loader2 className="animate-spin inline" size={20} />
                  </td>
                </tr>
              )}
              {!isLoading && filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400 text-sm">
                    {viewers.length === 0 ? 'No logged-in users have viewed this product yet.' : 'No users match your search.'}
                  </td>
                </tr>
              )}
              {!isLoading &&
                filtered.map((v, idx) => (
                  <tr
                    key={idx}
                    className="border-t border-gray-50 hover:bg-purple-50/40 cursor-pointer transition-colors"
                    onClick={() =>
                      setSelectedUser({
                        userId: v.userId,
                        fullName: v.fullName,
                        email: v.email,
                        mobileNumber: v.mobileNumber,
                        lastViewedAt: v.lastViewedAt,
                        isActive: v.isActive,
                      })
                    }
                  >
                    <td className="px-5 sm:px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                          style={{ background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)' }}
                        >
                          {v.fullName?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-800 truncate">{v.fullName}</p>
                          <p className="text-gray-500 text-xs truncate">{v.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 sm:px-6 py-3">
                      <span className="font-mono text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded truncate max-w-[100px] inline-block">
                        {String(v.userId).slice(-8)}…
                      </span>
                    </td>
                    <td className="px-5 sm:px-6 py-3 text-gray-600 text-sm">{v.mobileNumber || '—'}</td>
                    <td className="px-5 sm:px-6 py-3 text-gray-500 text-xs whitespace-nowrap">
                      {v.lastViewedAt
                        ? new Date(v.lastViewedAt).toLocaleString('en-IN', {
                            day: '2-digit', month: 'short', year: 'numeric',
                            hour: '2-digit', minute: '2-digit',
                          })
                        : '—'}
                    </td>
                    <td className="px-5 sm:px-6 py-3">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                          v.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {v.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-5 sm:px-6 py-3 text-right">
                      <ChevronRight size={16} className="text-gray-300 inline" />
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedUser && (
        <UserDetailModal user={selectedUser} onClose={() => setSelectedUser(null)} />
      )}
    </div>
  )
}

// ─── Main Analytics Tab ───────────────────────────────────────────────────────
export default function AnalyticsTab() {
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const fetchData = useCallback(() => {
    setIsLoading(true)
    adminAnalyticsService
      .getProductsAnalytics()
      .then((res) => setProducts(res.data.products || []))
      .catch(() => setProducts([]))
      .finally(() => setIsLoading(false))
  }, [])

  useEffect(() => {
    fetchData()
  }, [refreshKey, fetchData])

  const handleRefresh = () => {
    if (isRefreshing || isLoading) return
    setIsRefreshing(true)
    setTimeout(() => setIsRefreshing(false), 600)
    setRefreshKey((k) => k + 1)
  }

  if (selectedProduct) {
    return <ViewersPanel product={selectedProduct} onBack={() => setSelectedProduct(null)} />
  }

  const filtered = products
    .filter((p) => (p.totalViews || 0) > 0) // only products that have been viewed
    .filter((p) => {
      const q = search.toLowerCase()
      return !q || p.name?.toLowerCase().includes(q) || p.brand?.toLowerCase().includes(q) || p.categorySlug?.toLowerCase().includes(q)
    })

  const totalViews = products.reduce((sum, p) => sum + (p.totalViews || 0), 0)
  const topProduct = products[0]

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Total Views */}
        <div
          className="rounded-2xl p-5 text-white"
          style={{ background: 'linear-gradient(135deg, #581c87 0%, #9333ea 100%)' }}
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-purple-200 text-sm font-medium">Total Page Views</p>
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <Eye size={18} className="text-white" />
            </div>
          </div>
          <p className="text-3xl font-black">{totalViews.toLocaleString('en-IN')}</p>
          <p className="text-purple-200 text-xs mt-1">Across all products</p>
        </div>

        {/* Top Product */}
        <div
          className="rounded-2xl p-5 text-white"
          style={{ background: 'linear-gradient(135deg, #b45309 0%, #f59e0b 100%)' }}
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-amber-100 text-sm font-medium">Most Viewed</p>
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <TrendingUp size={18} className="text-white" />
            </div>
          </div>
          {topProduct ? (
            <>
              <p className="text-base font-bold leading-tight truncate">{topProduct.name}</p>
              <p className="text-amber-100 text-xs mt-1">{topProduct.totalViews} views</p>
            </>
          ) : (
            <p className="text-amber-100 text-sm">No data yet</p>
          )}
        </div>
      </div>


      {/* Products table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 sm:px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <BarChart2 size={18} className="text-purple-600" />
            <h3 className="font-bold text-gray-900">
              Product Views{' '}
              <span className="text-gray-400 font-medium">({filtered.length})</span>
            </h3>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative w-full sm:w-64">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              title="Refresh data"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-600 hover:text-purple-700 hover:border-purple-300 hover:bg-purple-50 transition-all disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
            >
              <RefreshCw
                size={15}
                className={isRefreshing ? 'animate-spin' : ''}
              />
              Refresh
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-600 text-xs uppercase tracking-wide bg-gray-50/70">
                <th className="px-5 sm:px-6 py-3 font-semibold">Product</th>
                <th className="px-5 sm:px-6 py-3 font-semibold">Category</th>
                <th className="px-5 sm:px-6 py-3 font-semibold">Price</th>
                <th className="px-5 sm:px-6 py-3 font-semibold">
                  <div className="flex items-center gap-1">
                    <Eye size={13} />
                    Total Views
                  </div>
                </th>
                <th className="px-5 sm:px-6 py-3 font-semibold">
                  <div className="flex items-center gap-1">
                    <Users size={13} />
                    Viewers
                  </div>
                </th>
                <th className="px-5 sm:px-6 py-3 font-semibold text-right">Details</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={6} className="px-6 py-14 text-center text-gray-400">
                    <Loader2 className="animate-spin inline" size={20} />
                  </td>
                </tr>
              )}
              {!isLoading && filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-14 text-center text-gray-400 text-sm">
                    {products.length === 0 ? 'No analytics data yet. Views will appear here once users browse products.' : 'No products match your search.'}
                  </td>
                </tr>
              )}
              {!isLoading &&
                filtered.map((p, idx) => {
                  const maxViews = products[0]?.totalViews || 1
                  const pct = Math.round(((p.totalViews || 0) / maxViews) * 100)
                  return (
                    <tr
                      key={p._id}
                      className="border-t border-gray-50 hover:bg-purple-50/40 cursor-pointer transition-colors"
                      onClick={() => setSelectedProduct(p)}
                    >
                      <td className="px-5 sm:px-6 py-3">
                        <div className="flex items-center gap-3">
                          {/* Rank */}
                          <span className="text-xs font-bold text-gray-300 w-5 shrink-0">{idx + 1}</span>
                          {p.image ? (
                            <img
                              src={p.image}
                              alt={p.name}
                              className="w-10 h-10 rounded-lg object-cover shrink-0 border border-gray-100"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                              <BarChart2 size={14} className="text-gray-400" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-800 truncate max-w-[180px]">{p.name}</p>
                            <p className="text-gray-400 text-xs">{p.brand}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 sm:px-6 py-3 text-gray-500 text-xs capitalize">
                        {p.categorySlug?.replace(/-/g, ' ') || '—'}
                      </td>
                      <td className="px-5 sm:px-6 py-3 text-gray-700 font-semibold">
                        ₹{p.price?.toLocaleString('en-IN')}
                      </td>
                      <td className="px-5 sm:px-6 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-800">{(p.totalViews || 0).toLocaleString('en-IN')}</span>
                          {p.totalViews > 0 && (
                            <div className="flex-1 max-w-[60px] bg-gray-100 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${pct}%`,
                                  background: 'linear-gradient(90deg, #9333ea, #ec4899)',
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-5 sm:px-6 py-3">
                        <div className="flex items-center gap-1.5">
                          <Users size={14} className="text-teal-500" />
                          <span className="font-semibold text-gray-700">
                            {(p.uniqueLoggedInUsers || 0).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 sm:px-6 py-3 text-right">
                        <button
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-600 hover:text-purple-800 transition-colors"
                          onClick={(e) => { e.stopPropagation(); setSelectedProduct(p) }}
                        >
                          View Viewers
                          <ChevronRight size={14} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
