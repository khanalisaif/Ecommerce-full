import { useState, useMemo } from 'react'
import { X, Search, Check, Sparkles, ShoppingBag } from 'lucide-react'

export default function HeroProductSelectModal({ products = [], categories = [], selectedProductId, onClose, onSelect }) {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('ALL')

  // Calculate product counts per category
  const categoryCounts = useMemo(() => {
    const counts = { ALL: products.length }
    products.forEach((p) => {
      const cat = p.category || 'Uncategorized'
      counts[cat] = (counts[cat] || 0) + 1
    })
    return counts
  }, [products])

  // Filtered products by selected category and search query
  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase()
    return products.filter((p) => {
      const matchCat =
        selectedCategory === 'ALL' ||
        (p.category && p.category.toLowerCase() === selectedCategory.toLowerCase())
      if (!matchCat) return false

      if (!q) return true
      const name = (p.name || '').toLowerCase()
      const brand = (p.brand_name || p.brand || '').toLowerCase()
      const cat = (p.category || '').toLowerCase()
      return name.includes(q) || brand.includes(q) || cat.includes(q)
    })
  }, [products, selectedCategory, search])

  // Extract unique category names from products & categories list
  const categoryList = useMemo(() => {
    const set = new Set()
    categories.forEach((c) => { if (c.name) set.add(c.name); if (c.slug) set.add(c.slug) })
    products.forEach((p) => { if (p.category) set.add(p.category) })
    return Array.from(set).filter(Boolean)
  }, [categories, products])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs" onClick={onClose}>
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Modal Header ────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-purple-50/50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-tr from-purple-600 to-pink-500 text-white shadow-md shadow-purple-500/20">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="font-black text-gray-900 text-lg sm:text-xl leading-tight">
                Select Hero Product
              </h3>
              <p className="text-gray-500 text-xs sm:text-sm">
                Spotlight a product on the homepage above the Feature Banner
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* ── Search Bar & Category Filter Strip ────────────────── */}
        <div className="p-4 sm:p-6 border-b border-gray-100 space-y-3 bg-gray-50/40">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products by name, category, brand..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-100 transition-all shadow-xs"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs bg-gray-100 rounded-full w-5 h-5 flex items-center justify-center"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Tabs (Horizontally Scrollable) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === 'ALL'
                  ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/30'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              All Categories ({categoryCounts['ALL'] || 0})
            </button>
            {categoryList.map((cat) => {
              const count = categoryCounts[cat] || 0
              const isActive = selectedCategory.toLowerCase() === cat.toLowerCase()
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/30'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {cat} {count > 0 && `(${count})`}
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Product List Grid ─────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 min-h-[320px]">
          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-3">
                <ShoppingBag size={28} />
              </div>
              <h4 className="font-bold text-gray-700 text-base mb-1">No products found</h4>
              <p className="text-gray-400 text-xs sm:text-sm max-w-sm">
                Try selecting a different category or clearing your search filter.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
              {filteredProducts.map((p) => {
                const isSelected = String(p.id) === String(selectedProductId)
                return (
                  <div
                    key={p.id}
                    className={`relative bg-white rounded-2xl border p-3.5 sm:p-4 flex flex-col justify-between transition-all group hover:shadow-md ${
                      isSelected
                        ? 'border-purple-600 ring-2 ring-purple-500/20 bg-purple-50/10'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    {/* Top Row: Image & Info */}
                    <div>
                      <div className="relative w-full h-36 bg-gray-50 rounded-xl overflow-hidden mb-3 flex items-center justify-center border border-gray-100">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                        />
                        {p.category && (
                          <span className="absolute top-2 left-2 bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                            {p.category}
                          </span>
                        )}
                        {p.discount && (
                          <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-md">
                            {p.discount}
                          </span>
                        )}
                      </div>

                      <h4 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2 mb-1.5 title-hover">
                        {p.name}
                      </h4>

                      <div className="flex items-center gap-2 mb-3">
                        <span className="font-black text-gray-900 text-base">
                          ₹{p.price?.toLocaleString()}
                        </span>
                        {p.originalPrice > p.price && (
                          <span className="text-xs text-gray-400 line-through">
                            ₹{p.originalPrice?.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => onSelect(p)}
                      className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs ${
                        isSelected
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'bg-purple-600 text-white hover:bg-purple-700 hover:shadow-md'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <Check size={14} strokeWidth={3} /> Active Hero Product
                        </>
                      ) : (
                        <>
                          <Sparkles size={14} /> Spotlight This Product
                        </>
                      )}
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* ── Modal Footer ────────────────────────────────────── */}
        <div className="px-6 py-3.5 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
          <span className="text-xs text-gray-500">
            Showing {filteredProducts.length} of {products.length} products
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl border border-gray-300 bg-white text-gray-700 font-bold text-xs hover:bg-gray-100 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
