import { useEffect, useState } from 'react'
import { Search, Minus, Plus, PackageCheck, PackageX, PackageMinus, Boxes } from 'lucide-react'
import { useShop } from '../../../context/ShopContext'
import ProductDetailModal from '../ProductDetailModal'
import VariantStockModal from '../VariantStockModal'
import Pagination from '../Pagination'

const FILTERS = ['All', 'In Stock', 'Low Stock', 'Out of Stock']
const PER_PAGE = 10

function stockStatus(stock) {
  if (stock === 0) return 'Out of Stock'
  if (stock <= 3) return 'Low Stock'
  return 'In Stock'
}

function statusBadgeClass(status) {
  if (status === 'Out of Stock') return 'bg-red-100 text-red-600'
  if (status === 'Low Stock') return 'bg-amber-100 text-amber-700'
  return 'bg-green-100 text-green-700'
}

export default function InventoryTab() {
  const { products, updateProduct, showToast } = useShop()
  const [query, setQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('All')
  const [editingId, setEditingId] = useState(null)
  const [draftValue, setDraftValue] = useState('')
  const [viewProduct, setViewProduct] = useState(null)
  const [variantStockProduct, setVariantStockProduct] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)

  const totalUnits = products.reduce((sum, p) => sum + (p.stock || 0), 0)
  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= 3).length
  const outOfStockCount = products.filter((p) => p.stock === 0).length

  const filtered = products
    .filter((p) => p.name.toLowerCase().includes(query.toLowerCase()) || p.sku.toLowerCase().includes(query.toLowerCase()))
    .filter((p) => activeFilter === 'All' || stockStatus(p.stock) === activeFilter)

  useEffect(() => { setCurrentPage(1) }, [query, activeFilter])

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paginated = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE)

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) setCurrentPage(totalPages)
  }, [totalPages, currentPage])

  const applyStockChange = (product, newStock) => {
    const clamped = Math.max(0, Math.min(99999, newStock))
    updateProduct(product.id, { stock: clamped })
  }

  const startEdit = (product) => {
    setEditingId(product.id)
    setDraftValue(String(product.stock))
  }

  const commitEdit = (product) => {
    const parsed = parseInt(draftValue, 10)
    if (!isNaN(parsed)) {
      applyStockChange(product, parsed)
      showToast('Stock updated')
    }
    setEditingId(null)
  }

  const statCards = [
    { label: 'Total Stock Units', value: totalUnits.toLocaleString('en-IN'), icon: Boxes, color: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)' },
    { label: 'In Stock Products', value: products.length - lowStockCount - outOfStockCount, icon: PackageCheck, color: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' },
    { label: 'Low Stock (≤3 left)', value: lowStockCount, icon: PackageMinus, color: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' },
    { label: 'Out of Stock', value: outOfStockCount, icon: PackageX, color: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' },
  ]

  return (
    <div className="space-y-4">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: color }}>
              <Icon size={18} className="text-white" />
            </div>
            <p className="text-gray-500 text-xs font-medium">{label}</p>
            <p className="text-xl font-bold text-gray-900 mt-0.5">{value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 sm:px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">Inventory <span className="text-gray-400 font-medium">({filtered.length})</span></h3>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search product or SKU..."
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 px-5 sm:px-6 py-3 border-b border-gray-50">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
                activeFilter === f ? 'text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
              style={activeFilter === f ? { background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)' } : {}}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-600 text-xs uppercase tracking-wide">
                <th className="px-5 sm:px-6 py-3 font-semibold">Product</th>
                <th className="px-5 sm:px-6 py-3 font-semibold">SKU</th>
                <th className="px-5 sm:px-6 py-3 font-semibold">Status</th>
                <th className="px-5 sm:px-6 py-3 font-semibold">Stock</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((p) => {
                const status = stockStatus(p.stock)
                return (
                  <tr key={p.id} className="border-t border-gray-50 hover:bg-gray-50/70 cursor-pointer" onClick={() => setViewProduct(p)}>
                    <td className="px-5 sm:px-6 py-3">
                      <div className="flex items-center gap-3">
                        <img src={p.image} alt="" className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
                        <span className="font-semibold text-gray-800 max-w-[220px] truncate">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-5 sm:px-6 py-3 text-gray-500">{p.sku}</td>
                    <td className="px-5 sm:px-6 py-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusBadgeClass(status)}`}>{status}</span>
                    </td>
                    <td className="px-5 sm:px-6 py-3" onClick={(e) => e.stopPropagation()}>
                      {p.colors && p.colors.length > 0 ? (
                        <button
                          onClick={() => setVariantStockProduct(p)}
                          className="px-3 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors whitespace-nowrap"
                        >
                          Manage Variants ({p.stock})
                        </button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => applyStockChange(p, p.stock - 1)}
                            disabled={p.stock === 0}
                            className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:border-purple-400 hover:text-purple-600 disabled:opacity-30 disabled:hover:border-gray-200 disabled:hover:text-gray-500 transition-colors"
                          >
                            <Minus size={13} />
                          </button>

                          {editingId === p.id ? (
                            <input
                              autoFocus
                              type="number"
                              min="0"
                              value={draftValue}
                              onChange={(e) => setDraftValue(e.target.value)}
                              onBlur={() => commitEdit(p)}
                              onKeyDown={(e) => e.key === 'Enter' && commitEdit(p)}
                              className="w-16 text-center border border-purple-300 rounded-lg py-1 text-sm focus:outline-none"
                            />
                          ) : (
                            <button
                              onClick={() => startEdit(p)}
                              className="w-16 text-center font-semibold text-gray-800 hover:bg-purple-50 rounded-lg py-1 transition-colors"
                            >
                              {p.stock}
                            </button>
                          )}

                          <button
                            onClick={() => applyStockChange(p, p.stock + 1)}
                            className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:border-purple-400 hover:text-purple-600 transition-colors"
                          >
                            <Plus size={13} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
              {!filtered.length && (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-gray-400 text-sm">No products found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>

      {viewProduct && (
        <ProductDetailModal
          product={viewProduct}
          onClose={() => setViewProduct(null)}
        />
      )}
      {variantStockProduct && (
        <VariantStockModal
          product={variantStockProduct}
          onClose={() => setVariantStockProduct(null)}
          onSave={(id, updates) => {
            updateProduct(id, updates)
            showToast('Variant stock updated')
            setVariantStockProduct(null)
          }}
        />
      )}
    </div>
  )
}
