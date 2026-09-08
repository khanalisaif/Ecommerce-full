import { useState, useMemo, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import CategoryStrip from '../components/CategoryStrip'
import Footer from '../components/Footer'
import { ChevronDown, ChevronRight, Heart, ShieldCheck, X, SlidersHorizontal } from 'lucide-react'
import { useShop } from '../context/ShopContext'
import { getColorName } from '../data/colorUtils'

const ITEMS_PER_PAGE = 8

const SORT_OPTIONS = [
  'Price - Low to High',
  'Price - High to Low',
  'Newest First',
  'Most Popular',
  'Customer Rating',
]

export default function SearchPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const initialQuery = searchParams.get('q') || ''
  const { toggleWishlist, isWishlisted, products: catalogProducts } = useShop()

  // Get all products across all categories & bestsellers for search
  const allProducts = useMemo(() => {
    // Deduplicate by ID
    const unique = []
    const ids = new Set()
    for (const p of catalogProducts) {
      if (!ids.has(p.id)) {
        ids.add(p.id)
        unique.push({
          ...p,
          // ensure consistent fields for filtering
          brand_name: p.brand_name || p.brand || p.category || 'Generic',
          color: getColorName(p.colors?.[0]) || 'Black',
          rating: p.rating || 4
        })
      }
    }
    return unique
  }, [catalogProducts])

  // 1. Filter by search query first
  const baseProducts = useMemo(() => {
    const q = initialQuery.trim().toLowerCase()
    if (!q) return allProducts
    return allProducts.filter(p => 
      p.name.toLowerCase().includes(q) || 
      (p.brand_name && p.brand_name.toLowerCase().includes(q)) ||
      (p.category && p.category.toLowerCase().includes(q))
    )
  }, [allProducts, initialQuery])

  // Extract dynamic filters from baseProducts
  const { BRANDS, COLORS, SIZES, minPrice, maxPrice } = useMemo(() => {
    const brands = new Set()
    const colors = new Set()
    const sizesMap = {}
    let minP = 999999
    let maxP = 0
    
    baseProducts.forEach(p => {
      if (p.brand_name) brands.add(p.brand_name)
      if (p.color) colors.add(p.color)
      if (p.price < minP) minP = p.price
      if (p.price > maxP) maxP = p.price
      if (p.sizes && Array.isArray(p.sizes)) {
        p.sizes.forEach(s => {
          sizesMap[s] = (sizesMap[s] || 0) + 1
        })
      } else if (typeof p.sizes === 'string') {
        const parts = p.sizes.split(',').map(s=>s.trim())
        parts.forEach(s => { sizesMap[s] = (sizesMap[s] || 0) + 1 })
      }
    })

    const sizeArr = Object.entries(sizesMap).map(([label, count]) => ({ label, count })).sort((a,b)=>b.count-a.count)

    return {
      BRANDS: Array.from(brands),
      COLORS: Array.from(colors),
      SIZES: sizeArr,
      minPrice: minP === 999999 ? 0 : minP,
      maxPrice: maxP === 0 ? 10000 : maxP
    }
  }, [baseProducts])

  const DISCOUNTS = ['10% and above', '20% and above', '30% and above', '40% and above']
  const RATINGS = ['4 and above', '3 and above', '2 and above']

  // Sidebar open/close
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const handler = () => setSidebarOpen(prev => !prev)
    window.addEventListener('toggle-category-sidebar', handler)
    return () => window.removeEventListener('toggle-category-sidebar', handler)
  }, [])

  // Sort
  const [sortBy, setSortBy] = useState('Price - Low to High')
  const [sortOpen, setSortOpen] = useState(false)

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)

  // Filters
  const [openFilters, setOpenFilters] = useState({ brand: false, color: false, discount: false, rating: false })
  const [selectedSizes, setSelectedSizes] = useState([])
  const [selectedBrands, setSelectedBrands] = useState([])
  const [selectedColors, setSelectedColors] = useState([])
  const [selectedDiscount, setSelectedDiscount] = useState('')
  const [selectedRating, setSelectedRating] = useState('')
  const [priceRange, setPriceRange] = useState([minPrice, maxPrice])
  const [showAllSizes, setShowAllSizes] = useState(false)

  // Reset all filters & pagination when query changes
  useEffect(() => {
    setCurrentPage(1)
    setSelectedSizes([])
    setSelectedBrands([])
    setSelectedColors([])
    setSelectedDiscount('')
    setSelectedRating('')
    setPriceRange([minPrice, maxPrice])
    setSidebarOpen(false)
  }, [initialQuery, minPrice, maxPrice])

  const toggleFilter = (key) => setOpenFilters(prev => ({ ...prev, [key]: !prev[key] }))
  const toggleSize = (s) => setSelectedSizes(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])
  const toggleBrand = (b) => setSelectedBrands(prev => prev.includes(b) ? prev.filter(x => x !== b) : [...prev, b])
  const toggleColor = (c) => setSelectedColors(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])
  const clearAll = () => {
    setSelectedSizes([]); setSelectedBrands([]); setSelectedColors([])
    setSelectedDiscount(''); setSelectedRating(''); setPriceRange([minPrice, maxPrice])
    setCurrentPage(1)
  }

  // Filtered + sorted products
  const processed = useMemo(() => {
    let data = [...baseProducts]
    
    if (selectedSizes.length) data = data.filter(p => {
      const pSizes = Array.isArray(p.sizes) ? p.sizes : (typeof p.sizes === 'string' ? p.sizes.split(',').map(s=>s.trim()) : [])
      return selectedSizes.some(s => pSizes.includes(s))
    })
    if (selectedBrands.length) data = data.filter(p => selectedBrands.includes(p.brand_name))
    if (selectedColors.length) data = data.filter(p => selectedColors.includes(p.color))
    
    if (selectedDiscount) {
      const discountInt = parseInt(selectedDiscount)
      data = data.filter(p => {
        const pct = Math.round((1 - p.price / p.originalPrice) * 100)
        return pct >= discountInt
      })
    }

    if (selectedRating) {
      const ratingInt = parseInt(selectedRating)
      data = data.filter(p => p.rating >= ratingInt)
    }

    data = data.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1])
    
    if (sortBy === 'Price - Low to High') data.sort((a, b) => a.price - b.price)
    else if (sortBy === 'Price - High to Low') data.sort((a, b) => b.price - a.price)
    else if (sortBy === 'Customer Rating') data.sort((a, b) => b.rating - a.rating)
    return data
  }, [baseProducts, selectedSizes, selectedBrands, selectedColors, selectedDiscount, selectedRating, priceRange, sortBy])


  const totalPages = Math.ceil(processed.length / ITEMS_PER_PAGE)
  const paginated = processed.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  // Pagination window builder
  const pageNumbers = useMemo(() => {
    const pages = []
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, '...', totalPages)
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, '...', totalPages - 2, totalPages - 1, totalPages)
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages)
      }
    }
    return pages
  }, [currentPage, totalPages])

  const goPage = (p) => { if (p !== '...') { setCurrentPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }) } }

  // Sidebar JSX extracted for reuse
  const Sidebar = () => (
    <aside className="w-full flex flex-col gap-5">
      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-[15px] font-black text-gray-900">Filter By</h3>
          <button onClick={clearAll} className="text-purple-600 text-[12px] font-bold hover:underline">Clear All</button>
        </div>

        {/* Price Range */}
        <div className="px-5 py-4 border-b border-gray-100">
          <h4 className="font-bold text-gray-900 text-[13.5px] mb-4">Price Range</h4>
          <input
            type="range"
            min={minPrice} max={maxPrice}
            value={priceRange[1]}
            onChange={e => { setPriceRange([minPrice, Math.max(minPrice, Number(e.target.value))]); setCurrentPage(1) }}
            className="w-full accent-purple-600 cursor-pointer"
          />
          <div className="flex justify-between text-[12px] font-bold text-gray-700 mt-1">
            <span>₹{priceRange[0].toLocaleString()}</span>
            <span>₹{priceRange[1].toLocaleString()}</span>
          </div>
        </div>

        {/* Size */}
        {SIZES.length > 0 && (
          <div className="px-5 py-4 border-b border-gray-100">
            <h4 className="font-bold text-gray-900 text-[13.5px] mb-3">Size</h4>
            <div className="space-y-2.5">
              {(showAllSizes ? SIZES : SIZES.slice(0, 5)).map(s => (
                <label key={s.label} className="flex justify-between items-center cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div
                      onClick={() => { toggleSize(s.label); setCurrentPage(1) }}
                      className={`w-4 h-4 border-2 rounded flex-shrink-0 flex items-center justify-center transition-colors cursor-pointer ${
                        selectedSizes.includes(s.label) ? 'bg-purple-600 border-purple-600' : 'border-gray-300 group-hover:border-purple-400'
                      }`}
                    >
                      {selectedSizes.includes(s.label) && <span className="text-white text-[8px] font-black">✓</span>}
                    </div>
                    <span className="text-[13px] text-gray-700">{s.label}</span>
                  </div>
                  <span className="text-gray-400 text-[11px]">({s.count.toLocaleString()})</span>
                </label>
              ))}
            </div>
            {SIZES.length > 5 && (
              <button
                onClick={() => setShowAllSizes(!showAllSizes)}
                className="text-purple-600 font-bold text-[11px] mt-3 hover:underline"
              >
                {showAllSizes ? '- View Less' : '+ View More'}
              </button>
            )}
          </div>
        )}

        {/* Collapsible: Brand */}
        {BRANDS.length > 0 && (
          <CollapsibleFilter
            title="Brand" isOpen={openFilters.brand}
            onToggle={() => toggleFilter('brand')}
          >
            <div className="space-y-2 mt-2">
              {BRANDS.map(b => (
                <label key={b} className="flex items-center gap-3 cursor-pointer group">
                  <div
                    onClick={() => { toggleBrand(b); setCurrentPage(1) }}
                    className={`w-4 h-4 border-2 rounded flex-shrink-0 flex items-center justify-center transition-colors cursor-pointer ${
                      selectedBrands.includes(b) ? 'bg-purple-600 border-purple-600' : 'border-gray-300 group-hover:border-purple-400'
                    }`}
                  >
                    {selectedBrands.includes(b) && <span className="text-white text-[8px] font-black">✓</span>}
                  </div>
                  <span className="text-[13px] text-gray-700">{b}</span>
                </label>
              ))}
            </div>
          </CollapsibleFilter>
        )}

        {/* Collapsible: Color */}
        {COLORS.length > 0 && (
          <CollapsibleFilter
            title="Color" isOpen={openFilters.color}
            onToggle={() => toggleFilter('color')}
          >
            <div className="flex flex-wrap gap-2 mt-2">
              {COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => { toggleColor(c); setCurrentPage(1) }}
                  className={`px-3 py-1 rounded-full text-[11px] font-semibold border transition-colors ${
                    selectedColors.includes(c)
                      ? 'bg-purple-600 text-white border-purple-600'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-purple-400'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </CollapsibleFilter>
        )}

        {/* Collapsible: Discount */}
        <CollapsibleFilter
          title="Discount" isOpen={openFilters.discount}
          onToggle={() => toggleFilter('discount')}
        >
          <div className="space-y-2 mt-2">
            {DISCOUNTS.map(d => (
              <label key={d} className="flex items-center gap-3 cursor-pointer">
                <div
                  onClick={() => { setSelectedDiscount(selectedDiscount === d ? '' : d); setCurrentPage(1) }}
                  className={`w-4 h-4 border-2 rounded-full flex-shrink-0 flex items-center justify-center transition-colors cursor-pointer ${
                    selectedDiscount === d ? 'bg-purple-600 border-purple-600' : 'border-gray-300'
                  }`}
                >
                  {selectedDiscount === d && <span className="w-2 h-2 bg-white rounded-full block"></span>}
                </div>
                <span className="text-[13px] text-gray-700">{d}</span>
              </label>
            ))}
          </div>
        </CollapsibleFilter>

        {/* Collapsible: Rating */}
        <CollapsibleFilter
          title="Customer Rating" isOpen={openFilters.rating}
          onToggle={() => toggleFilter('rating')}
          noBorder
        >
          <div className="space-y-2 mt-2">
            {RATINGS.map(r => (
              <label key={r} className="flex items-center gap-3 cursor-pointer">
                <div
                  onClick={() => { setSelectedRating(selectedRating === r ? '' : r); setCurrentPage(1) }}
                  className={`w-4 h-4 border-2 rounded-full flex-shrink-0 flex items-center justify-center transition-colors cursor-pointer ${
                    selectedRating === r ? 'bg-purple-600 border-purple-600' : 'border-gray-300'
                  }`}
                >
                  {selectedRating === r && <span className="w-2 h-2 bg-white rounded-full block"></span>}
                </div>
                <span className="text-[13px] text-yellow-500 font-semibold">{r}</span>
              </label>
            ))}
          </div>
        </CollapsibleFilter>
      </div>
    </aside>
  )

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <CategoryStrip />

      <main className="flex-1 w-full max-w-[1500px] mx-auto px-4 md:px-6 py-6 flex flex-row gap-0">
        
        {/* Sidebar */}
        <div className="hidden md:block w-[270px] flex-shrink-0 mr-6">
          <Sidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">

          {/* Breadcrumb */}
          <nav className="flex items-center text-[12px] text-gray-500 mb-1.5 gap-1">
            <button onClick={() => navigate('/')} className="hover:text-purple-600 transition-colors">Home</button>
            <ChevronRight size={12} />
            <span className="text-gray-900 font-semibold">Search Results</span>
          </nav>

          <h1 className="text-[22px] font-semibold text-gray-800 mb-4">
            {initialQuery ? `Results for "${initialQuery}"` : 'All Products'}
          </h1>

          {/* Subheader & Sort */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
            <p className="text-gray-500 text-[13px]">
              Showing {processed.length > 0 ? ((currentPage - 1) * ITEMS_PER_PAGE) + 1 : 0}–{Math.min(currentPage * ITEMS_PER_PAGE, processed.length)} of{' '}
              <strong className="text-gray-800">{processed.length.toLocaleString()}</strong> results
            </p>

            <div className="relative">
              <button
                onClick={() => setSortOpen(!sortOpen)}
                className="flex items-center gap-2 border border-gray-300 bg-white rounded-md px-4 py-2 text-[13px] font-bold text-gray-800 hover:border-purple-400 transition-colors"
              >
                Sort By: {sortBy}
                <ChevronDown size={14} className={`text-gray-500 transition-transform duration-200 ${sortOpen ? 'rotate-180' : ''}`} />
              </button>
              {sortOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setSortOpen(false)} />
                  <div className="absolute right-0 top-[calc(100%+4px)] z-40 bg-white border border-gray-200 rounded-xl shadow-xl w-52 py-1 overflow-hidden">
                    {SORT_OPTIONS.map(opt => (
                      <button
                        key={opt}
                        onClick={() => { setSortBy(opt); setSortOpen(false); setCurrentPage(1) }}
                        className={`w-full text-left px-4 py-2.5 text-[13px] transition-colors ${
                          sortBy === opt ? 'bg-purple-100 text-purple-700 font-bold' : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Active Filter Chips */}
          {(selectedSizes.length + selectedBrands.length + selectedColors.length + (selectedDiscount ? 1 : 0) + (selectedRating ? 1 : 0)) > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedSizes.map(s => <Chip key={s} label={`Size: ${s}`} onRemove={() => toggleSize(s)} />)}
              {selectedBrands.map(b => <Chip key={b} label={`Brand: ${b}`} onRemove={() => toggleBrand(b)} />)}
              {selectedColors.map(c => <Chip key={c} label={`Color: ${c}`} onRemove={() => toggleColor(c)} />)}
              {selectedDiscount && <Chip label={`Discount: ${selectedDiscount}`} onRemove={() => setSelectedDiscount('')} />}
              {selectedRating && <Chip label={`Rating: ${selectedRating}`} onRemove={() => setSelectedRating('')} />}
              <button onClick={clearAll} className="text-purple-600 font-bold text-[12px] hover:underline ml-1">Clear All</button>
            </div>
          )}

          {/* Product Grid */}
          {paginated.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
              {paginated.map(product => (
                <div
                  key={product.id}
                  className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all cursor-pointer group flex flex-col"
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  <div className="relative aspect-square bg-[#cecece] overflow-hidden">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <button
                      onClick={e => { e.stopPropagation(); toggleWishlist(product) }}
                      className="absolute top-2.5 right-2.5 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm text-gray-400 hover:text-pink-500 transition-colors"
                    >
                      <Heart size={16} fill={isWishlisted(product.id) ? 'currentColor' : 'none'} className={isWishlisted(product.id) ? 'text-pink-500' : ''} />
                    </button>
                  </div>

                  <div className="p-3.5 flex flex-col flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-gray-900 font-bold text-[12px]">{product.brand_name || 'Generic'}</span>
                      {product.isAssured && (
                        <div className="flex items-center gap-0.5 text-[10px] font-bold text-gray-500">
                          <ShieldCheck size={11} className="text-yellow-500" fill="currentColor" />
                          <span>Assured</span>
                        </div>
                      )}
                    </div>
                    <h3 className="text-gray-600 text-[12.5px] line-clamp-1 mb-2">{product.name}</h3>
                    <div className="text-gray-900 font-black text-[15px] mb-0.5">₹{product.price.toLocaleString()}</div>
                    <div className={`text-[11px] font-bold mb-3 ${product.stockInfo === 'Only 1 left' ? 'text-red-600' : 'text-green-600'}`}>
                      {product.stockInfo || 'In Stock'}
                    </div>
                    <div className="mt-auto text-gray-400 text-[11px] font-medium border-t border-gray-100 pt-2">
                      {Array.isArray(product.sizes) ? product.sizes.join(', ') : product.sizes}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl p-16 text-center border border-gray-200 mb-8">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">No products found</h3>
              <p className="text-gray-500 text-sm mb-4">Try adjusting your filters</p>
              <button onClick={clearAll} className="bg-purple-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-purple-700 transition-colors">Clear Filters</button>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mb-4">
              <button
                onClick={() => goPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 rounded-full bg-white border border-gray-200 text-gray-600 hover:text-purple-600 hover:border-purple-600 flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} className="rotate-180" />
              </button>

              {pageNumbers.map((p, idx) =>
                p === '...' ? (
                  <span key={`dot-${idx}`} className="w-8 text-center text-gray-400 text-sm font-bold">...</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => goPage(p)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold transition-colors ${
                      currentPage === p
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                        : 'bg-white border border-gray-200 text-gray-700 hover:border-purple-500 hover:text-purple-600'
                    }`}
                  >
                    {p}
                  </button>
                )
              )}

              <button
                onClick={() => goPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="w-8 h-8 rounded-full bg-white border border-gray-200 text-gray-600 hover:text-purple-600 hover:border-purple-600 flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

// ── Reusable Components ────────────────────────────────────────────────────

function CollapsibleFilter({ title, isOpen, onToggle, children, noBorder = false }) {
  return (
    <div className={`${!noBorder ? 'border-b border-gray-100' : ''}`}>
      <button
        onClick={onToggle}
        className="w-full flex justify-between items-center px-5 py-3.5 text-[13.5px] font-bold text-gray-900 hover:bg-gray-50 transition-colors"
      >
        {title}
        <ChevronDown size={15} className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && <div className="px-5 pb-4">{children}</div>}
    </div>
  )
}

function Chip({ label, onRemove }) {
  return (
    <span className="flex items-center gap-1.5 bg-purple-100 text-purple-700 text-[11px] font-bold px-3 py-1 rounded-full">
      {label}
      <button onClick={onRemove} className="hover:text-purple-900 transition-colors">
        <X size={11} />
      </button>
    </span>
  )
}
