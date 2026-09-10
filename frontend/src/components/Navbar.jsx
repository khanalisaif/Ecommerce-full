import { useState, useRef, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search, Heart, User, ShoppingBag, ArrowRight, Home, PersonStanding, List, Flower2,
  Droplet, Camera, Music, Gift, Sparkles, Flame, Laptop, Tablet, Smartphone,
  Headphones, Package, ShoppingBag as ShoppingBagIcon, Watch, Shirt, FolderTree,
  X, Loader2, Tag, ChevronRight
} from 'lucide-react'
import { useShop } from '../context/ShopContext'
import { productService } from '../services/productService'
import Logo from './Logo'

const categoryIconComponents = {
  Home, User, PersonStanding, Heart, List, Flower2, Droplet, Camera, Music,
  Gift, Sparkles, Flame, Laptop, Tablet, Smartphone, Headphones, Package,
  ShoppingBag: ShoppingBagIcon, Watch, Shirt,
}

export default function Navbar() {
  const navigate = useNavigate()
  const { cartCount, wishlistCount, topbarSettings, popularSearches, categories, products } = useShop()
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [remoteProducts, setRemoteProducts] = useState([])
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)
  const searchRef = useRef(null)
  const debounceTimerRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Auto-suggestions trigger when query length >= 3
  useEffect(() => {
    const q = searchQuery.trim()
    if (q.length < 3) {
      setRemoteProducts([])
      setIsLoadingSuggestions(false)
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
      return
    }

    setIsLoadingSuggestions(true)
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)

    debounceTimerRef.current = setTimeout(async () => {
      try {
        const res = await productService.search(q)
        setRemoteProducts(res.data?.products || [])
      } catch (err) {
        // Fall back gracefully to local products
      } finally {
        setIsLoadingSuggestions(false)
      }
    }, 250)

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
    }
  }, [searchQuery])

  // Combined matching products (deduplicated by id)
  const matchingProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (q.length < 3) return []

    const pool = [...(products || []), ...(remoteProducts || [])]
    const seen = new Set()
    const list = []

    for (const p of pool) {
      const id = String(p.id || p._id || '')
      if (!id || seen.has(id)) continue
      seen.add(id)

      const name = (p.name || '').toLowerCase()
      const brand = (p.brand_name || p.brand || '').toLowerCase()
      const category = (p.category || '').toLowerCase()
      const tags = Array.isArray(p.tags) ? p.tags.join(' ').toLowerCase() : ''

      if (name.includes(q) || brand.includes(q) || category.includes(q) || tags.includes(q)) {
        list.push(p)
      }
    }
    return list.slice(0, 6)
  }, [searchQuery, products, remoteProducts])

  // Matching categories
  const matchingCategories = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (q.length < 3) return []
    return (categories || [])
      .filter((cat) => {
        const name = (cat.name || '').toLowerCase()
        const slug = (cat.slug || '').toLowerCase()
        return name.includes(q) || slug.includes(q)
      })
      .slice(0, 4)
  }, [searchQuery, categories])

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      setIsSearchOpen(false)
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    } else if (e.key === 'Escape') {
      setIsSearchOpen(false)
    }
  }

  const goSearch = () => {
    if (searchQuery.trim()) {
      setIsSearchOpen(false)
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const handleSelectProduct = (product) => {
    setIsSearchOpen(false)
    setSearchQuery('')
    navigate(`/product/${product.id || product._id}`)
  }

  const handleSelectCategory = (slug) => {
    setIsSearchOpen(false)
    setSearchQuery('')
    navigate(`/category/${slug}`)
  }

  const handleSelectPopular = (term) => {
    setIsSearchOpen(false)
    setSearchQuery('')
    navigate(`/search?q=${encodeURIComponent(term.toLowerCase())}`)
  }

  const queryTrimmed = searchQuery.trim()
  const is3Plus = queryTrimmed.length >= 3

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      {topbarSettings.announcementEnabled && topbarSettings.announcementText && (
        <div
          className="text-white text-center text-[11px] md:text-xs font-semibold py-1.5 px-4"
          style={{
            background: topbarSettings.announcementBgType === 'gradient3'
              ? `linear-gradient(135deg, ${topbarSettings.announcementBgColor1 || '#a855f7'} 0%, ${topbarSettings.announcementBgColor2 || '#ec4899'} 50%, ${topbarSettings.announcementBgColor3 || '#fca5a5'} 100%)`
              : topbarSettings.announcementBgType === 'gradient'
              ? `linear-gradient(135deg, ${topbarSettings.announcementBgColor1 || '#a855f7'} 0%, ${topbarSettings.announcementBgColor2 || '#ec4899'} 100%)`
              : (topbarSettings.announcementBgColor1 || '#a855f7')
          }}
        >
          {topbarSettings.announcementText}
        </div>
      )}
      <div className="w-full px-4 md:px-10 py-3 md:py-0 md:h-[68px] flex flex-col md:flex-row justify-center md:items-center gap-3 md:gap-6">

        <div className="flex items-center justify-between w-full md:w-auto">
          {/* ── Logo ─────────────────────────────────────────── */}
          <button onClick={() => navigate('/')} className="flex-shrink-0 text-left mr-2">
            <Logo size="sm" />
          </button>

          {/* Mobile Right Icons */}
          <div className="flex md:hidden items-center gap-5 flex-shrink-0">
            <button onClick={() => navigate('/wishlist')} className="text-gray-700 relative hover:text-purple-600 transition-colors">
              <Heart size={22} strokeWidth={1.5} />
              {wishlistCount > 0 && <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[9px] font-bold rounded-full min-w-[15px] h-[15px] flex items-center justify-center px-0.5">{wishlistCount > 9 ? '9+' : wishlistCount}</span>}
            </button>
            <button onClick={() => navigate('/account')} className="text-gray-700 hover:text-purple-600 transition-colors">
              <User size={22} strokeWidth={1.5} />
            </button>
            <button onClick={() => navigate('/cart')} className="text-gray-700 relative hover:text-purple-600 transition-colors">
              <ShoppingBag size={22} strokeWidth={1.5} />
              <span className={`absolute -top-2 -right-2 bg-pink-500 text-white text-[9px] font-black rounded-full min-w-[17px] h-[17px] flex items-center justify-center border-[1.5px] border-white px-0.5 ${cartCount === 0 ? 'hidden' : ''}`}>{cartCount > 9 ? '9+' : cartCount}</span>
            </button>
          </div>
        </div>

        {/* ── Search Bar ── */}
        <div ref={searchRef} className="flex flex-1 relative w-full max-w-[700px] mx-auto md:px-4 lg:px-8">
          <div className="relative w-full flex items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                if (!isSearchOpen) setIsSearchOpen(true)
              }}
              onKeyDown={handleSearch}
              onFocus={() => setIsSearchOpen(true)}
              placeholder="Search for products, categories or brands..."
              className={`w-full bg-gray-50 border transition-all pl-6 pr-24 py-2.5 text-[14px] text-gray-700 placeholder-gray-500 focus:outline-none focus:bg-white focus:border-purple-300 focus:shadow-md rounded-full shadow-sm hover:border-gray-300 ${isSearchOpen ? 'border-purple-300 ring-2 ring-purple-100' : 'border-gray-200'}`}
            />

            {/* Clear Button (X) */}
            {searchQuery.length > 0 && !isLoadingSuggestions && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('')
                  setRemoteProducts([])
                }}
                className="absolute right-12 text-gray-400 hover:text-gray-600 p-1 rounded-full transition-colors"
                title="Clear search"
              >
                <X size={16} />
              </button>
            )}

            {/* Loading Spinner */}
            {isLoadingSuggestions && (
              <div className="absolute right-12 text-purple-600 p-1 pointer-events-none">
                <Loader2 size={16} className="animate-spin" />
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={goSearch}
              className="absolute right-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-full p-2 transition-colors z-10 shadow-sm"
              title="Search"
            >
              <Search size={18} strokeWidth={2.5} />
            </button>
          </div>

          {/* ── Search Dropdown Modal ── */}
          {isSearchOpen && (
            <div className="absolute top-[calc(100%+8px)] left-0 right-0 md:left-4 md:right-4 lg:left-8 lg:right-8 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 overflow-hidden max-h-[82vh] overflow-y-auto">

              {/* ──────────────── Case 1: 3+ Letters Typed (Live Auto-Suggestions) ──────────────── */}
              {is3Plus ? (
                <div className="p-4 md:p-5">
                  {/* Status header */}
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Suggestions for <span className="text-purple-600 normal-case font-bold">"{queryTrimmed}"</span>
                    </span>
                    {isLoadingSuggestions && (
                      <span className="text-[11px] text-purple-600 flex items-center gap-1 font-medium">
                        <Loader2 size={12} className="animate-spin" /> Searching live...
                      </span>
                    )}
                  </div>

                  {/* Matching Categories Quick Links */}
                  {matchingCategories.length > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700 mb-2">
                        <Tag size={13} className="text-purple-600" /> Matching Categories
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {matchingCategories.map((cat) => {
                          const Icon = categoryIconComponents[cat.icon] || FolderTree
                          return (
                            <button
                              key={cat.id || cat.slug}
                              onClick={() => handleSelectCategory(cat.slug || cat.name)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-semibold rounded-full transition-colors"
                            >
                              <Icon size={13} />
                              <span>{cat.name}</span>
                              <ChevronRight size={12} className="opacity-60" />
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Matching Products List */}
                  {matchingProducts.length > 0 ? (
                    <div>
                      <div className="flex items-center justify-between text-xs font-bold text-gray-700 mb-2.5">
                        <span>Products ({matchingProducts.length})</span>
                      </div>
                      <div className="divide-y divide-gray-100">
                        {matchingProducts.map((product) => {
                          const pId = product.id || product._id
                          const img = product.image || (Array.isArray(product.images) ? product.images[0] : '')
                          return (
                            <button
                              key={pId}
                              onClick={() => handleSelectProduct(product)}
                              className="w-full text-left py-2.5 px-2 hover:bg-purple-50/70 rounded-xl transition-all flex items-center gap-3.5 group"
                            >
                              {/* Product Thumbnail */}
                              <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 p-1 flex items-center justify-center shrink-0 overflow-hidden group-hover:border-purple-200 transition-colors">
                                {img ? (
                                  <img
                                    src={img}
                                    alt={product.name}
                                    className="w-full h-full object-contain"
                                    onError={(e) => { e.currentTarget.style.display = 'none' }}
                                  />
                                ) : (
                                  <Package size={20} className="text-gray-400" />
                                )}
                              </div>

                              {/* Title & Category */}
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-semibold text-gray-900 truncate group-hover:text-purple-600 transition-colors">
                                  {product.name}
                                </h4>
                                <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
                                  {product.brand_name && (
                                    <span className="font-medium text-gray-700">{product.brand_name}</span>
                                  )}
                                  {product.brand_name && product.category && <span>•</span>}
                                  {product.category && (
                                    <span className="capitalize">{product.category}</span>
                                  )}
                                </div>
                              </div>

                              {/* Price & Stock */}
                              <div className="text-right shrink-0">
                                <div className="text-sm font-bold text-gray-900">
                                  ₹{Number(product.price || 0).toLocaleString('en-IN')}
                                </div>
                                {product.discount && (
                                  <span className="text-[10px] bg-green-50 text-green-700 font-bold px-1.5 py-0.5 rounded">
                                    {product.discount}
                                  </span>
                                )}
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ) : (
                    /* No Products Found State */
                    <div className="text-center py-6">
                      <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Search size={22} />
                      </div>
                      <p className="text-gray-800 font-bold text-sm mb-1">
                        No products found for "{queryTrimmed}"
                      </p>
                      <p className="text-gray-500 text-xs mb-4">
                        Try searching with a different keyword or explore popular categories below.
                      </p>
                      {/* Suggestions pills */}
                      <div className="flex flex-wrap justify-center gap-1.5 max-w-sm mx-auto">
                        {popularSearches.slice(0, 4).map((item, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSelectPopular(item)}
                            className="text-xs bg-gray-100 hover:bg-purple-100 hover:text-purple-700 text-gray-700 px-3 py-1 rounded-full transition-colors"
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* View All Search Results Bottom Action */}
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <button
                      onClick={goSearch}
                      className="w-full bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold text-sm py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
                    >
                      View all results for "{queryTrimmed}" <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                /* ──────────────── Case 2: Under 3 Letters Typed or Empty (Popular & Categories) ──────────────── */
                <div className="p-6">
                  {/* Subtle 3-letter hint if user has typed 1 or 2 characters */}
                  {queryTrimmed.length > 0 && queryTrimmed.length < 3 && (
                    <div className="mb-5 p-2.5 bg-purple-50/70 border border-purple-100 rounded-xl flex items-center gap-2 text-xs text-purple-700 font-medium">
                      <Sparkles size={14} className="text-purple-600 shrink-0" />
                      <span>Type at least <strong>3 characters</strong> to see instant live product suggestions.</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Popular Searches */}
                    <div>
                      <h3 className="font-bold text-gray-900 mb-4 text-[15px] flex items-center gap-2">
                        <Sparkles size={16} className="text-purple-600" /> Popular Searches
                      </h3>
                      <ul className="space-y-3.5">
                        {popularSearches.map((item, idx) => (
                          <li key={idx}>
                            <button
                              onClick={() => handleSelectPopular(item)}
                              className="flex items-center gap-3 text-gray-600 hover:text-purple-600 w-full text-left transition-colors group"
                            >
                              <Search size={15} className="text-gray-400 group-hover:text-purple-600 transition-colors" />
                              <span className="text-[14px]">{item}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                      {popularSearches.length > 0 && (
                        <button
                          onClick={() => handleSelectPopular(popularSearches[0])}
                          className="mt-6 flex items-center gap-1.5 text-purple-600 font-semibold text-[14px] hover:text-purple-700 hover:underline transition-all"
                        >
                          View all results for "{popularSearches[0]}" <ArrowRight size={16} />
                        </button>
                      )}
                    </div>

                    {/* Top Categories */}
                    <div className="md:border-l md:border-gray-100 md:pl-6">
                      <h3 className="font-bold text-gray-900 mb-4 text-[15px] flex items-center gap-2">
                        <Flame size={16} className="text-pink-500" /> Top Categories
                      </h3>
                      <ul className="space-y-3">
                        {categories.slice(0, 5).map((cat) => {
                          const Icon = categoryIconComponents[cat.icon] || FolderTree
                          return (
                            <li key={cat.id || cat.slug}>
                              <button
                                onClick={() => handleSelectCategory(cat.slug || cat.name)}
                                className="flex items-center gap-3 text-gray-700 hover:text-purple-600 w-full text-left transition-colors group"
                              >
                                {cat.image ? (
                                  <img
                                    src={cat.image}
                                    alt=""
                                    className="w-9 h-9 rounded-full object-cover shadow-sm group-hover:ring-2 group-hover:ring-purple-200 transition-all shrink-0"
                                  />
                                ) : (
                                  <div className="w-9 h-9 rounded-full bg-purple-50 flex items-center justify-center shadow-sm group-hover:ring-2 group-hover:ring-purple-200 transition-all shrink-0">
                                    <Icon size={16} className="text-purple-600" />
                                  </div>
                                )}
                                <span className="text-[14px] font-medium">{cat.name}</span>
                              </button>
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}
        </div>


        {/* ── Right icons (Desktop) ─────────────────────────── */}
        <div className="hidden md:flex items-center gap-6 md:gap-8 flex-shrink-0 ml-auto md:ml-0">

          {/* Wishlist */}
          <button
            onClick={() => navigate('/wishlist')}
            className="flex flex-col items-center gap-[2px] text-gray-700 hover:text-purple-600 transition-colors relative"
          >
            <Heart size={22} strokeWidth={1.5} />
            <span className="text-[11px] font-semibold hidden md:block">Wishlist</span>
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[9px] font-bold rounded-full min-w-[15px] h-[15px] flex items-center justify-center px-0.5">
                {wishlistCount > 9 ? '9+' : wishlistCount}
              </span>
            )}
          </button>

          {/* Account */}
          <button
            onClick={() => navigate('/account')}
            className="flex flex-col items-center gap-[2px] text-gray-700 hover:text-purple-600 transition-colors"
          >
            <User size={22} strokeWidth={1.5} />
            <span className="text-[11px] font-semibold hidden md:block">Account</span>
          </button>

          {/* Cart */}
          <button
            onClick={() => navigate('/cart')}
            className="flex flex-col items-center gap-[2px] text-gray-700 hover:text-purple-600 transition-colors relative"
          >
            <div className="relative">
              <ShoppingBag size={22} strokeWidth={1.5} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-[9px] font-black rounded-full min-w-[17px] h-[17px] flex items-center justify-center border-[1.5px] border-white px-0.5">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </div>
            <span className="text-[11px] font-semibold hidden md:block">Cart</span>
          </button>

        </div>
      </div>
    </nav>
  )
}
