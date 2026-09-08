import { LayoutDashboard, Package, ShoppingCart, Users, LogOut, X, Image, FolderTree, PanelTop, LayoutTemplate, FileText, GalleryHorizontal, Boxes, ExternalLink, ListFilter } from 'lucide-react'
import { useAdminAuth } from '../../context/AdminAuthContext'
import { useNavigate } from 'react-router-dom'
import { useShop } from '../../context/ShopContext'

const navItems = [
  { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'homepage', label: 'Homepage', icon: GalleryHorizontal },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'inventory', label: 'Inventory', icon: Boxes },
  { id: 'categories', label: 'Categories', icon: FolderTree },
  { id: 'category-filters', label: 'Category Filters', icon: ListFilter },
  { id: 'orders', label: 'Orders', icon: ShoppingCart },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'branding', label: 'Branding', icon: Image },
  { id: 'topbar', label: 'Top Bar', icon: PanelTop },
  { id: 'footer', label: 'Footer', icon: LayoutTemplate },
  { id: 'pages', label: 'Pages & FAQ', icon: FileText },
]

export default function AdminSidebar({ activeTab, setActiveTab, isOpen, onClose, adminEmail }) {
  const navigate = useNavigate()
  const { siteAssets } = useShop()
  const { logout } = useAdminAuth()

  const handleLogout = () => {
    logout()
    navigate('/page/admin', { replace: true })
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={`fixed top-0 left-0 h-screen w-64 z-50 flex flex-col text-white transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        style={{ background: 'linear-gradient(180deg, #581c87 0%, #7e22ce 55%, #9333ea 100%)' }}
      >
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="bg-white/15 p-2 rounded-lg">
              <img src={siteAssets.logoUrl} alt="Logo" className="h-6 w-auto object-contain" />
            </div>
            <div>
              <p className="font-bold text-sm leading-tight">HASHTELICOM</p>
              <p className="text-[11px] text-white/60 leading-tight">Admin Panel</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-white/70 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => { setActiveTab(id); onClose?.() }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === id
                  ? 'bg-white text-purple-700 shadow-lg'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-white/10">
          <div className="px-4 py-2.5 mb-2">
            <p className="text-[11px] text-white/50">Signed in as</p>
            <p className="text-xs font-semibold truncate">{adminEmail}</p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-3 px-4 py-2.5 mb-2 rounded-xl text-sm font-semibold text-white/80 hover:bg-white/10 hover:text-white transition-all"
          >
            <ExternalLink size={18} />
            View Live Site
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-white/80 hover:bg-white/10 hover:text-white transition-all"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>
    </>
  )
}
