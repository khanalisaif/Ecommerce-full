import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Heart, User, ShoppingBag, ArrowRight, Home, PersonStanding, List, Flower2, Droplet, Camera, Music, Gift, Sparkles, Flame, Laptop, Tablet, Smartphone, Headphones, Package, ShoppingBag as ShoppingBagIcon, Watch, Shirt, FolderTree } from 'lucide-react'
import { useShop } from '../context/ShopContext'
import Logo from './Logo'

const categoryIconComponents = {
  Home, User, PersonStanding, Heart, List, Flower2, Droplet, Camera, Music,
  Gift, Sparkles, Flame, Laptop, Tablet, Smartphone, Headphones, Package,
  ShoppingBag: ShoppingBagIcon, Watch, Shirt,
}

export default function Navbar() {
  const navigate = useNavigate()
  const { cartCount, wishlistCount, topbarSettings, popularSearches, categories } = useShop()
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const searchRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      setIsSearchOpen(false)
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const goSearch = () => {
    if (searchQuery.trim()) navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
  }

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
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearch}
            onFocus={() => setIsSearchOpen(true)}
            placeholder="Search for products, categories or brands..."
            className={`w-full bg-gray-50 border transition-all pl-6 pr-14 py-2.5 text-[14px] text-gray-700 placeholder-gray-500 focus:outline-none focus:bg-white focus:border-purple-300 focus:shadow-md rounded-full shadow-sm hover:border-gray-300 ${isSearchOpen ? 'border-purple-300 ring-2 ring-purple-100' : 'border-gray-200'}`}
          />
          <button
            onClick={goSearch}
            className="absolute right-5 lg:right-9 top-1/2 -translate-y-1/2 bg-purple-600 hover:bg-purple-700 text-white rounded-full p-2 transition-colors z-10"
          >
            <Search size={18} strokeWidth={2.5} />
          </button>

          {/* ── Search Dropdown Modal ── */}
          {isSearchOpen && (
            <div className="absolute top-[calc(100%+8px)] left-4 right-4 lg:left-8 lg:right-8 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 p-6 gap-6">
                
                {/* Popular Searches */}
                <div>
                  <h3 className="font-bold text-gray-900 mb-4 text-[15px]">Popular Searches</h3>
                  <ul className="space-y-4">
                    {popularSearches.map((item, idx) => (
                      <li key={idx}>
                        <button 
                          onClick={() => {
                            setIsSearchOpen(false)
                            navigate(`/search?q=${item.toLowerCase()}`)
                          }}
                          className="flex items-center gap-3 text-gray-600 hover:text-purple-600 w-full text-left transition-colors"
                        >
                          <Search size={16} className="text-gray-400" />
                          <span className="text-[14.5px]">{item}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                  <button 
                    onClick={() => {
                      setIsSearchOpen(false)
                      navigate('/search?q=' + (popularSearches[0] || ''))
                    }}
                    className="mt-6 flex items-center gap-1.5 text-purple-600 font-semibold text-[14.5px] hover:text-purple-700 hover:underline transition-all"
                  >
                    View all results for "{popularSearches[0] || ''}" <ArrowRight size={16} />
                  </button>
                </div>

                {/* Top Categories */}
                <div className="border-l border-gray-100 pl-6">
                  <h3 className="font-bold text-gray-900 mb-4 text-[15px]">Top Categories</h3>
                  <ul className="space-y-4">
                    {categories.slice(0, 5).map((cat) => {
                      const Icon = categoryIconComponents[cat.icon] || FolderTree
                      return (
                        <li key={cat.id}>
                          <button 
                            onClick={() => {
                              setIsSearchOpen(false)
                              navigate(`/category/${cat.slug}`)
                            }}
                            className="flex items-center gap-4 text-gray-700 hover:text-purple-600 w-full text-left transition-colors group"
                          >
                            {cat.image ? (
                              <img src={cat.image} alt="" className="w-10 h-10 rounded-full object-cover shadow-sm group-hover:ring-2 group-hover:ring-purple-200 transition-all shrink-0" />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center shadow-sm group-hover:ring-2 group-hover:ring-purple-200 transition-all shrink-0">
                                <Icon size={17} className="text-purple-600" />
                              </div>
                            )}
                            <span className="text-[14.5px]">{cat.name}</span>
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
