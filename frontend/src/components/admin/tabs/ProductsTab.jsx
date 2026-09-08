import { useEffect, useState } from 'react'
import { Search, Pencil, Trash2, Plus, Star } from 'lucide-react'
import { useShop } from '../../../context/ShopContext'
import ProductFormModal from '../ProductFormModal'
import ProductDetailModal from '../ProductDetailModal'
import Pagination from '../Pagination'

function stockBadge(stock) {
  if (stock === 0) return 'bg-red-100 text-red-600'
  if (stock < 15) return 'bg-amber-100 text-amber-700'
  return 'bg-green-100 text-green-700'
}

const PER_PAGE = 10

export default function ProductsTab() {
  const { products, addProduct, updateProduct, deleteProduct, showToast } = useShop()
  const [query, setQuery] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [viewProduct, setViewProduct] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.brand.toLowerCase().includes(query.toLowerCase()) ||
      p.sku.toLowerCase().includes(query.toLowerCase())
  )

  useEffect(() => { setCurrentPage(1) }, [query])

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paginated = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE)

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) setCurrentPage(totalPages)
  }, [totalPages, currentPage])

  const openAddModal = () => { setEditingProduct(null); setModalOpen(true) }
  const openEditModal = (product) => { setEditingProduct(product); setModalOpen(true) }

  const handleSave = (payload) => {
    const request = editingProduct ? updateProduct(editingProduct.id, payload) : addProduct(payload)
    return request.then(() => {
      showToast(editingProduct ? 'Product updated successfully' : 'Product added successfully')
      setModalOpen(false)
      setEditingProduct(null)
    })
  }

  const confirmDelete = () => {
    if (deleteTarget) {
      deleteProduct(deleteTarget.id)
      showToast('Product deleted')
      setDeleteTarget(null)
    }
  }

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 sm:px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">Products <span className="text-gray-400 font-medium">({filtered.length})</span></h3>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products, brand, SKU..."
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
            <button
              onClick={openAddModal}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white whitespace-nowrap transition-all hover:shadow-lg"
              style={{ background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)' }}
            >
              <Plus size={16} /> Add Product
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-600 text-xs uppercase tracking-wide">
                <th className="px-5 sm:px-6 py-3 font-semibold">Product</th>
                <th className="px-5 sm:px-6 py-3 font-semibold">Category</th>
                <th className="px-5 sm:px-6 py-3 font-semibold">Brand</th>
                <th className="px-5 sm:px-6 py-3 font-semibold">Price</th>
                <th className="px-5 sm:px-6 py-3 font-semibold">Stock</th>
                <th className="px-5 sm:px-6 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((p) => (
                <tr key={p.id} className="border-t border-gray-50 hover:bg-gray-50/70 cursor-pointer" onClick={() => setViewProduct(p)}>
                  <td className="px-5 sm:px-6 py-3">
                    <div className="flex items-center gap-3">
                      <img src={p.image} alt="" className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
                      <div className="flex items-center gap-1.5 max-w-[220px]">
                        <span className="font-semibold text-gray-800 truncate">{p.name}</span>
                        {p.isBestSeller && <Star size={12} className="text-amber-400 fill-amber-400 shrink-0" />}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 sm:px-6 py-3 text-gray-500">{p.category?.replace(/-/g, ' ')}</td>
                  <td className="px-5 sm:px-6 py-3 text-gray-600">{p.brand_name}</td>
                  <td className="px-5 sm:px-6 py-3 font-semibold text-gray-800">₹{p.price.toLocaleString('en-IN')}</td>
                  <td className="px-5 sm:px-6 py-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${stockBadge(p.stock)}`}>
                      {p.stock === 0 ? 'Out of stock' : `${p.stock} in stock`}
                    </span>
                  </td>
                  <td className="px-5 sm:px-6 py-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(p)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(p)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-400 text-sm">
                    No products found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>

      {modalOpen && (
        <ProductFormModal
          product={editingProduct}
          onClose={() => { setModalOpen(false); setEditingProduct(null) }}
          onSave={handleSave}
        />
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setDeleteTarget(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center" onClick={(e) => e.stopPropagation()}>
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} className="text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Delete this product?</h3>
            <p className="text-gray-500 text-sm mb-6">
              <span className="font-semibold">{deleteTarget.name}</span> will be permanently removed from your catalog.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 rounded-full border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-2.5 rounded-full bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {viewProduct && (
        <ProductDetailModal
          product={viewProduct}
          onClose={() => setViewProduct(null)}
        />
      )}
    </>
  )
}
