import { useState } from 'react'
import { Menu } from 'lucide-react'
import AdminSidebar from '../../components/admin/AdminSidebar'
import OverviewTab from '../../components/admin/tabs/OverviewTab'
import ProductsTab from '../../components/admin/tabs/ProductsTab'
import HomepageTab from '../../components/admin/tabs/HomepageTab'
import CategoriesTab from '../../components/admin/tabs/CategoriesTab'
import CategoryFiltersTab from '../../components/admin/tabs/CategoryFiltersTab'
import InventoryTab from '../../components/admin/tabs/InventoryTab'
import OrdersTab from '../../components/admin/tabs/OrdersTab'
import CustomersTab from '../../components/admin/tabs/CustomersTab'
import BrandingTab from '../../components/admin/tabs/BrandingTab'
import TopbarTab from '../../components/admin/tabs/TopbarTab'
import FooterTab from '../../components/admin/tabs/FooterTab'
import PagesTab from '../../components/admin/tabs/PagesTab'
import { useAdminAuth } from '../../context/AdminAuthContext'
import { useShop } from '../../context/ShopContext'

const titles = {
  overview: 'Dashboard Overview',
  products: 'Products',
  homepage: 'Homepage',
  categories: 'Categories',
  'category-filters': 'Category Filters',
  inventory: 'Inventory',
  orders: 'Orders',
  customers: 'Customers',
  branding: 'Branding',
  topbar: 'Top Bar',
  footer: 'Footer',
  pages: 'Pages & FAQ',
}

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { admin } = useAdminAuth()
  const { siteAssets } = useShop()
  const adminEmail = admin?.email || 'admin@hashtelicom.com'

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        adminEmail={adminEmail}
      />

      <div className="flex-1 min-w-0 flex flex-col lg:ml-64">
        {/* Topbar */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-500 hover:text-gray-800"
            >
              <Menu size={22} />
            </button>
            <h1 className="font-bold text-gray-900 text-base sm:text-lg truncate">{titles[activeTab]}</h1>
          </div>
          <div className="flex items-center gap-3">
            {siteAssets?.logoUrl && (
              <img src={siteAssets.logoUrl} alt="Logo" className="h-7 w-auto object-contain max-h-7" />
            )}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 sm:p-6">
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'products' && <ProductsTab />}
          {activeTab === 'homepage' && <HomepageTab />}
          {activeTab === 'categories' && <CategoriesTab />}
          {activeTab === 'category-filters' && <CategoryFiltersTab />}
          {activeTab === 'inventory' && <InventoryTab />}
          {activeTab === 'orders' && <OrdersTab />}
          {activeTab === 'customers' && <CustomersTab />}
          {activeTab === 'branding' && <BrandingTab />}
          {activeTab === 'topbar' && <TopbarTab />}
          {activeTab === 'footer' && <FooterTab />}
          {activeTab === 'pages' && <PagesTab />}
        </main>
      </div>
    </div>
  )
}
