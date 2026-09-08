import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import CategoryStrip from '../components/CategoryStrip'
import Footer from '../components/Footer'
import { Heart, Trash2, Share2, ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react'
import { useShop } from '../context/ShopContext'
export default function WishlistPage() {
  const navigate = useNavigate()
  const {
    wishlistItems, removeFromWishlist, moveWishlistItemToCart,
    moveAllWishlistToCart, showToast, products,
  } = useShop()
  const scrollRef = useRef(null)

  const items = wishlistItems

  const handleRemove = (id) => {
    removeFromWishlist(id)
    showToast('Removed from wishlist')
  }

  const scrollRecs = (dir) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir * 300, behavior: 'smooth' })
    }
  }

  const handleShare = async () => {
    const shareData = {
      title: 'My Hashtelicom Wishlist',
      text: `Check out my wishlist with ${items.length} amazing items!`,
      url: window.location.origin + '/wishlist'
    }
    if (navigator.share) {
      try { await navigator.share(shareData) } catch {}
    } else {
      navigator.clipboard.writeText(shareData.url)
      showToast('Wishlist link copied to clipboard!')
    }
  }

  const youMightLove = products.filter((p) => p.isBestSeller).map(p => ({
    id: p.id,
    name: p.name,
    price: p.price,
    image: p.image,
  }))

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <CategoryStrip />

      <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 md:px-6 py-8">
        
        {/* ── Header ──────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0">
              <Heart size={24} className="text-pink-600" fill="currentColor" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 leading-tight">
                My Wishlist <span className="text-gray-400 font-bold text-xl">({items.length})</span>
              </h1>
              <p className="text-gray-500 text-[13px] font-medium">Items you love, all in one place.</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button onClick={handleShare} className="px-5 py-2.5 border border-gray-300 bg-white rounded-lg font-bold text-[13px] text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2">
              <Share2 size={16} />
              Share Wishlist
            </button>
            <button
              onClick={moveAllWishlistToCart}
              className="px-5 py-2.5 bg-purple-600 text-white rounded-lg font-bold text-[13px] hover:bg-purple-700 transition-colors flex items-center gap-2 shadow-md shadow-purple-600/20"
            >
              <ShoppingCart size={16} />
              Move All to Cart
            </button>
          </div>
        </div>

        {/* ── Wishlist Grid ───────────────────────────────── */}
        {items.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 text-center border border-gray-100">
            <Heart size={48} className="text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 font-semibold">Your wishlist is empty</p>
            <button onClick={() => navigate('/')} className="mt-4 px-5 py-2.5 bg-purple-600 text-white rounded-lg font-bold text-[13px] hover:bg-purple-700 transition-colors">
              Continue Shopping
            </button>
          </div>
        ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
              
              <div className="relative aspect-square bg-gray-500 overflow-hidden group">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" />
                <button
                  onClick={() => handleRemove(item.id)}
                  className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-md text-pink-500 hover:scale-110 transition-transform"
                >
                  <Heart size={16} fill="currentColor" />
                </button>
              </div>

              <div className="p-4">
                <p className="text-gray-400 text-[10px] font-bold tracking-wider uppercase mb-1">{item.brand}</p>
                <h3 className="text-gray-900 text-[13px] font-semibold mb-2 line-clamp-2 min-h-[38px] leading-snug">
                  {item.name}
                </h3>

                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="text-gray-900 font-black text-lg">₹{item.price.toLocaleString()}</span>
                  <span className="text-gray-400 line-through text-[12px]">₹{item.originalPrice.toLocaleString()}</span>
                  <span className="text-red-500 text-[11px] font-bold">{item.discount}</span>
                </div>

                <p className="text-[10px] text-gray-500 font-medium mb-4">
                  Size: {item.size} <span className="mx-1">|</span> Color: {item.color}
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="w-11 h-11 flex-shrink-0 flex items-center justify-center border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                  <button
                    onClick={() => moveWishlistItemToCart(item)}
                    className="flex-1 bg-[#5b32d1] hover:bg-purple-800 text-white rounded-lg font-bold text-[13px] transition-colors shadow-sm"
                  >
                    Move to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        )}

        {/* ── You might also love ─────────────────────────── */}
        <div className="mt-16 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black text-gray-900">You might also love</h2>
            <button onClick={() => navigate('/category/Best-Sellers')} className="text-purple-600 font-bold text-sm hover:underline">
              View All <span className="text-lg leading-none">&gt;</span>
            </button>
          </div>

          <div className="relative">
            <button onClick={() => scrollRecs(-1)} className="absolute -left-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:text-purple-600 shadow-sm">
              <ChevronLeft size={20} />
            </button>
            <button onClick={() => scrollRecs(1)} className="absolute -right-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:text-purple-600 shadow-sm">
              <ChevronRight size={20} />
            </button>

            <div ref={scrollRef} className="flex gap-4 overflow-x-auto scrollbar-hide py-2 px-1 scroll-smooth">
              {youMightLove.map((item) => (
                <div key={item.id} onClick={() => navigate(`/product/${item.id}`)} className="flex-shrink-0 w-[280px] border border-gray-200 bg-white rounded-xl p-3 flex items-center gap-4 cursor-pointer hover:shadow-md transition-shadow">
                  <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-gray-900 font-bold text-[13px] truncate">{item.name}</p>
                    <p className="text-gray-600 font-medium text-[13px] mt-1">₹{item.price.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </main>
      <Footer />
    </div>
  )
}
