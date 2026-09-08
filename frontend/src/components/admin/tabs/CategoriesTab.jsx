import { useState } from 'react'
import {
  Plus, Pencil, Trash2, ChevronUp, ChevronDown, FolderTree,
  Home, User, PersonStanding, Heart, List, Flower2, Droplet, Camera, Music,
  Gift, Sparkles, Flame, Laptop, Tablet, Smartphone, Headphones, Package,
  ShoppingBag, Watch, Shirt,
} from 'lucide-react'
import { useShop } from '../../../context/ShopContext'
import CategoryFormModal from '../CategoryFormModal'

const iconComponents = {
  Home, User, PersonStanding, Heart, List, Flower2, Droplet, Camera, Music,
  Gift, Sparkles, Flame, Laptop, Tablet, Smartphone, Headphones, Package,
  ShoppingBag, Watch, Shirt,
}

export default function CategoriesTab() {
  const { categories, addCategory, updateCategory, deleteCategory, reorderCategory, products, showToast } = useShop()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const productCountFor = (slug) => products.filter((p) => p.category === slug).length

  const openAddModal = () => { setEditingCategory(null); setModalOpen(true) }
  const openEditModal = (cat) => { setEditingCategory(cat); setModalOpen(true) }

  const handleSave = (data) => {
    const request = editingCategory ? updateCategory(editingCategory.id, data) : addCategory(data)
    return request.then(() => {
      showToast(editingCategory ? 'Category updated' : 'Category added')
      setModalOpen(false)
      setEditingCategory(null)
    })
  }

  const confirmDelete = () => {
    if (deleteTarget) {
      deleteCategory(deleteTarget.id)
      showToast('Category deleted')
      setDeleteTarget(null)
    }
  }

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between gap-3 px-5 sm:px-6 py-4 border-b border-gray-100">
          <div>
            <h3 className="font-bold text-gray-900">Categories <span className="text-gray-400 font-medium">({categories.length})</span></h3>
            <p className="text-gray-500 text-sm mt-0.5">Controls the category strip, footer links and product category options</p>
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white whitespace-nowrap transition-all hover:shadow-lg"
            style={{ background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)' }}
          >
            <Plus size={16} /> Add Category
          </button>
        </div>

        <div className="divide-y divide-gray-50">
          {categories.map((cat, idx) => {
            const IconComp = iconComponents[cat.icon] || FolderTree
            const count = productCountFor(cat.slug)
            return (
              <div key={cat.id} className="flex items-center gap-4 px-5 sm:px-6 py-3.5">
                <div className="flex flex-col">
                  <button
                    disabled={idx === 0}
                    onClick={() => reorderCategory(cat.id, 'up')}
                    className="text-gray-300 hover:text-purple-600 disabled:opacity-30 disabled:hover:text-gray-300 transition-colors"
                  >
                    <ChevronUp size={15} />
                  </button>
                  <button
                    disabled={idx === categories.length - 1}
                    onClick={() => reorderCategory(cat.id, 'down')}
                    className="text-gray-300 hover:text-purple-600 disabled:opacity-30 disabled:hover:text-gray-300 transition-colors"
                  >
                    <ChevronDown size={15} />
                  </button>
                </div>

                {cat.image ? (
                  <img src={cat.image} alt="" className="w-10 h-10 rounded-xl object-cover shrink-0" />
                ) : (
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)' }}
                  >
                    <IconComp size={18} className="text-white" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm truncate">{cat.name}</p>
                  <p className="text-gray-500 text-sm font-mono">/category/{cat.slug}</p>
                </div>

                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-50 text-purple-600 shrink-0">
                  {count} product{count === 1 ? '' : 's'}
                </span>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => openEditModal(cat)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(cat)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            )
          })}
          {!categories.length && (
            <div className="px-6 py-10 text-center text-gray-400 text-sm">No categories yet</div>
          )}
        </div>
      </div>

      {modalOpen && (
        <CategoryFormModal
          category={editingCategory}
          onClose={() => { setModalOpen(false); setEditingCategory(null) }}
          onSave={handleSave}
        />
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setDeleteTarget(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center" onClick={(e) => e.stopPropagation()}>
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} className="text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Delete this category?</h3>
            <p className="text-gray-500 text-sm mb-2">
              <span className="font-semibold">{deleteTarget.name}</span> will be removed from the site navigation.
            </p>
            {productCountFor(deleteTarget.slug) > 0 && (
              <p className="text-amber-600 text-xs font-semibold bg-amber-50 rounded-lg px-3 py-2 mb-4">
                {productCountFor(deleteTarget.slug)} product(s) currently use this category and will stay in the catalog, but won't show under this category anymore.
              </p>
            )}
            <div className="flex gap-3 mt-4">
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
    </>
  )
}
