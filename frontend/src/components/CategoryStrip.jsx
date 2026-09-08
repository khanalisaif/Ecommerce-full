import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Heart, Home, User, PersonStanding, List, Flower2, Droplet, Camera, Music, Gift, Sparkles, Flame, Menu, ChevronDown, Laptop, Tablet, Smartphone, Headphones, Package, ShoppingBag, Watch, Shirt } from 'lucide-react'
import { useShop } from '../context/ShopContext'

const iconComponents = {
  Home, User, PersonStanding, Heart, List, Flower2, Droplet, Camera, Music, Gift, Sparkles, Flame,
  Laptop, Tablet, Smartphone, Headphones, Package, ShoppingBag, Watch, Shirt,
}

export default function CategoryStrip() {
  const navigate = useNavigate()
  const { category } = useParams()
  const [isOpen, setIsOpen] = useState(false)
  const { categories } = useShop()

  useEffect(() => {
    setIsOpen(false)
  }, [category])

  useEffect(() => {
    const handler = () => setIsOpen(prev => !prev)
    window.addEventListener('toggle-category-sidebar', handler)
    return () => window.removeEventListener('toggle-category-sidebar', handler)
  }, [])

  const handleAllCategoriesClick = () => {
    if (!window.location.pathname.startsWith('/category')) {
      window.scrollTo({ top: 0, behavior: 'instant' })
      navigate('/category/For-You')
    } else {
      window.dispatchEvent(new CustomEvent('toggle-category-sidebar'))
    }
  }

  return (
    <div className="bg-white border-b border-gray-200 sticky top-[68px] z-40">
      <div className="w-full max-w-[1500px] mx-auto px-4 md:px-6">
        <div className="flex items-center">

          {/* All Categories Button */}
          <div className="flex-shrink-0 pr-4 border-r border-gray-200 my-2">
            <button
              onClick={handleAllCategoriesClick}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold text-[13px] transition-all duration-300 ${isOpen ? 'bg-purple-600 text-white shadow-md' : 'bg-purple-100 hover:bg-purple-200 text-purple-700'}`}
            >
              <Menu size={16} />
              <span className="hidden sm:inline">All Categories</span>
              <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Category Tabs */}
          <div className="flex-1 flex overflow-x-auto scrollbar-hide">
            <div className="flex w-full justify-between items-center px-2 md:px-4">
              {categories.map((cat) => {
                const Icon = iconComponents[cat.icon] || Heart
                const isActive = category === cat.slug
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      window.scrollTo({ top: 0, behavior: 'instant' })
                      navigate(`/category/${cat.slug}`)
                    }}
                    className={`flex flex-col items-center gap-1.5 px-2 md:px-3 pb-3 pt-3 flex-shrink-0 min-w-[60px] md:min-w-[72px] border-b-[3px] transition-all duration-200 ${
                      isActive
                        ? 'border-purple-600 text-purple-600'
                        : 'border-transparent text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    {cat.image ? (
                      <img src={cat.image} alt="" className={`w-6 h-6 rounded-full object-cover ${isActive ? 'ring-2 ring-purple-600' : ''}`} />
                    ) : (
                      <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                    )}
                    <span className={`text-[11px] md:text-[12px] whitespace-nowrap ${isActive ? 'font-bold' : 'font-semibold'}`}>
                      {cat.name}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
