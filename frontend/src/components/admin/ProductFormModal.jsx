import { useEffect, useRef, useState } from 'react'
import { X, UploadCloud, Trash2, Loader2, Plus } from 'lucide-react'
import { useShop } from '../../context/ShopContext'
import { normalizeColorList, getSwatchStyle } from '../../data/colorUtils'
import { compressImage } from '../../utils/imageCompression'
import ColorPickerModal from './ColorPickerModal'
import VariantPromptModal from './VariantPromptModal'
import VariantDetailsModal from './VariantDetailsModal'

const MAX_IMAGE_MB = 2
const MAX_IMAGES = 5

const emptyForm = {
  name: '',
  brand: '',
  category: '',
  price: '',
  originalPrice: '',
  stock: '50',
  colors: [],
  sizes: '',
  description: '',
  isBestSeller: false,
  images: [],
}

export default function ProductFormModal({ product, onClose, onSave }) {
  const { categories } = useShop()
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [colorPickerOpen, setColorPickerOpen] = useState(false)
  const [promptColor, setPromptColor] = useState(null)
  const [detailsColor, setDetailsColor] = useState(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name || '',
        brand: product.brand_name || product.brand || '',
        category: product.category || categories[0]?.slug || '',
        price: String(product.price ?? ''),
        originalPrice: String(product.originalPrice ?? ''),
        stock: String(product.stock ?? '50'),
        colors: normalizeColorList(product.colors),
        sizes: (product.sizes || []).join(', '),
        description: product.description || '',
        isBestSeller: !!product.isBestSeller,
        images: product.images && product.images.length ? product.images : [product.image].filter(Boolean),
      })
    } else {
      setForm({ ...emptyForm, category: categories[0]?.slug || '' })
    }
    setError('')
  }, [product])

  const field = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleFiles = async (files) => {
    const remaining = MAX_IMAGES - form.images.length
    if (remaining <= 0) {
      setError(`You can add up to ${MAX_IMAGES} images`)
      return
    }
    const toRead = Array.from(files).slice(0, remaining)
    
    const compressedImages = await Promise.all(
      toRead.filter(f => f.type.startsWith('image/')).map(async (file) => {
        try {
          return await compressImage(file)
        } catch(err) {
          console.error('Image compression failed', err)
          return null
        }
      })
    )
    
    const validImages = compressedImages.filter(Boolean)
    if (validImages.length > 0) {
      setForm((f) => ({ ...f, images: [...f.images, ...validImages] }))
    }
  }

  const removeImage = (idx) => {
    setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== idx) }))
  }

  const addColor = (color) => {
    if (form.colors.length === 0) {
      setForm((f) => ({ ...f, colors: [...f.colors, color] }))
    } else {
      setPromptColor(color)
    }
    setColorPickerOpen(false)
  }

  const handlePromptYes = () => {
    setDetailsColor(promptColor)
    setPromptColor(null)
  }

  const handlePromptNo = () => {
    setForm((f) => ({ ...f, colors: [...f.colors, promptColor] }))
    setPromptColor(null)
  }

  const handleSaveVariantDetails = (colorWithDetails) => {
    setForm((f) => ({ ...f, colors: [...f.colors, colorWithDetails] }))
    setDetailsColor(null)
  }

  const removeColor = (idx) => {
    setForm((f) => ({ ...f, colors: f.colors.filter((_, i) => i !== idx) }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (!form.name.trim()) return setError('Product name is required')
    if (!form.price || Number(form.price) <= 0) return setError('Please enter a valid price')
    if (!form.images.length) return setError('Please add at least one product image')

    setSaving(true)
    const payload = {
      name: form.name.trim(),
      brand: form.brand.trim() || 'Generic',
      brand_name: form.brand.trim() || 'Generic',
      category: form.category,
      price: Number(form.price),
      originalPrice: form.originalPrice ? Number(form.originalPrice) : Number(form.price),
      stock: Number(form.stock),
      colors: form.colors,
      sizes: form.sizes.split(',').map((s) => s.trim()).filter(Boolean),
      description: form.description.trim(),
      isBestSeller: form.isBestSeller,
      images: form.images,
      image: form.images[0],
    }

    Promise.resolve(onSave(payload))
      .then(() => setSaving(false))
      .catch((err) => {
        setSaving(false)
        setError(err.message || 'Failed to save product')
      })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h3 className="font-bold text-gray-900 text-lg">{product ? 'Edit Product' : 'Add New Product'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Images */}
          <div>
            <label className="block text-gray-800 font-semibold text-sm mb-2">Product Images</label>
            <div className="flex flex-wrap gap-3">
              {form.images.map((img, idx) => (
                <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-gray-200 group">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center text-white"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              {form.images.length < MAX_IMAGES && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 hover:border-purple-400 hover:text-purple-500 transition-colors"
                >
                  <UploadCloud size={18} />
                  <span className="text-[9px] font-semibold mt-0.5">Upload</span>
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
            <p className="text-gray-400 text-[11px] mt-1.5">First image is used as the main thumbnail. Up to {MAX_IMAGES} images, {MAX_IMAGE_MB}MB each.</p>
          </div>

          <div>
            <label className="block text-gray-800 font-semibold text-sm mb-1.5">Product Name</label>
            <input
              value={form.name}
              onChange={field('name')}
              placeholder="e.g. Wireless Bluetooth Headphones"
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-800 font-semibold text-sm mb-1.5">Brand</label>
              <input
                value={form.brand}
                onChange={field('brand')}
                placeholder="e.g. Sony"
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-gray-800 font-semibold text-sm mb-1.5">Category</label>
              <select
                value={form.category}
                onChange={field('category')}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-500 bg-white"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-gray-800 font-semibold text-sm mb-1.5">Price (₹)</label>
              <input
                type="number"
                min="0"
                value={form.price}
                onChange={field('price')}
                placeholder="999"
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-gray-800 font-semibold text-sm mb-1.5">MRP (₹)</label>
              <input
                type="number"
                min="0"
                value={form.originalPrice}
                onChange={field('originalPrice')}
                placeholder="1499"
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-gray-800 font-semibold text-sm mb-1.5">Stock</label>
              <input
                type="number"
                min="0"
                value={form.stock}
                onChange={field('stock')}
                placeholder="50"
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-800 font-semibold text-sm mb-2">Colors</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {form.colors.map((c, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full pl-1 pr-2 py-1"
                >
                  <div className="w-6 h-6 rounded-full border border-gray-200 shrink-0" style={getSwatchStyle(c, idx)} />
                  <span className="text-xs font-semibold text-gray-700">{c.name} {c.stock !== undefined ? `(${c.stock})` : ''}</span>
                  <button
                    type="button"
                    onClick={() => removeColor(idx)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setColorPickerOpen(true)}
                className="flex items-center gap-1 text-xs font-semibold text-purple-600 border border-purple-200 rounded-full px-3 py-1.5 hover:bg-purple-50 transition-colors"
              >
                <Plus size={13} /> Add Color
              </button>
            </div>
          </div>

          <div>
            <label className="block text-gray-800 font-semibold text-sm mb-1.5">Sizes</label>
            <input
              value={form.sizes}
              onChange={field('sizes')}
              placeholder="S, M, L, XL"
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-500"
            />
            <p className="text-gray-400 text-[10px] mt-1">Comma separated</p>
          </div>

          <div>
            <label className="block text-gray-800 font-semibold text-sm mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={field('description')}
              rows={3}
              placeholder="Short product description shown on the product page"
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-500 resize-none"
            />
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isBestSeller}
              onChange={(e) => setForm((f) => ({ ...f, isBestSeller: e.target.checked }))}
              className="w-4 h-4 accent-purple-600"
            />
            <span className="text-sm text-gray-700 font-medium">Feature in Best Sellers on the homepage</span>
          </label>

          {error && <p className="text-red-500 text-xs font-medium">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-full border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 rounded-full text-white font-bold text-sm transition-all hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-70"
              style={{ background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)' }}
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : product ? 'Save Changes' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>

      {colorPickerOpen && (
        <ColorPickerModal onClose={() => setColorPickerOpen(false)} onAdd={addColor} />
      )}
      {promptColor && (
        <VariantPromptModal
          colorName={promptColor.name}
          onYes={handlePromptYes}
          onNo={handlePromptNo}
          onClose={() => setPromptColor(null)}
        />
      )}
      {detailsColor && (
        <VariantDetailsModal
          color={detailsColor}
          onSave={handleSaveVariantDetails}
          onClose={() => setDetailsColor(null)}
        />
      )}
    </div>
  )
}
