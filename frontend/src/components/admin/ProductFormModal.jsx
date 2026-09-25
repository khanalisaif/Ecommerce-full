import { useEffect, useRef, useState } from 'react'
import { X, UploadCloud, Trash2, Loader2, Plus, Search, Tag } from 'lucide-react'
import { useShop } from '../../context/ShopContext'
import { normalizeColorList, getSwatchStyle } from '../../data/colorUtils'
import { compressImage } from '../../utils/imageCompression'
import ColorPickerModal from './ColorPickerModal'
import VariantPromptModal from './VariantPromptModal'
import VariantDetailsModal from './VariantDetailsModal'

const MAX_IMAGE_MB = 2
const MAX_IMAGES = 5

const PRESET_KEYWORDS = [
  'New Arrival',
  'Best Seller',
  'Trending',
  'Featured',
  'Premium Quality',
  'Top Rated',
  'Hot Deal',
  'Special Offer',
  'Popular',
]

const emptyForm = {
  name: '',
  brand: '',
  category: '',
  subcategory: '',
  subcategorySlug: '',
  keywords: [],
  price: '',
  originalPrice: '',
  stock: '50',
  colors: [],
  sizes: [{ size: '', qty: '' }],
  description: '',
  isBestSeller: false,
  images: [],
  // Delhivery shipping dimensions
  weight: '0.05',
  length: '10',
  width: '10',
  height: '5',
  shippingMode: 'Surface',
}

export default function ProductFormModal({ product, onClose, onSave }) {
  const { categories, addSubcategory } = useShop()
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [colorPickerOpen, setColorPickerOpen] = useState(false)
  const [promptColor, setPromptColor] = useState(null)
  const [detailsColor, setDetailsColor] = useState(null)
  const [isAddingSubcategory, setIsAddingSubcategory] = useState(false)
  const [newSubName, setNewSubName] = useState('')
  const [submittingSub, setSubmittingSub] = useState(false)
  const [newKeyword, setNewKeyword] = useState('')
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (product) {
      let initialSizes = []

      const normalizedColors = normalizeColorList(product.colors)
      const primaryColorSizes = normalizedColors.length > 0 && Array.isArray(normalizedColors[0].sizes)
        ? normalizedColors[0].sizes
        : []

      if (primaryColorSizes.length > 0) {
        // Primary color's sizes (set via InventoryTab) are the source of truth
        initialSizes = primaryColorSizes.map((s) => ({
          size: typeof s === 'object' ? (s.size || '') : String(s),
          qty: String(typeof s === 'object' ? (s.qty ?? '') : ''),
        }))
      } else if (Array.isArray(product.sizesWithQty) && product.sizesWithQty.length > 0) {
        initialSizes = product.sizesWithQty.map((s) => ({
          size: s.size || '',
          qty: String(s.qty ?? ''),
        }))
      } else if (Array.isArray(product.sizes) && product.sizes.length > 0) {
        initialSizes = product.sizes.map((s) => {
          if (typeof s === 'object' && s !== null) {
            return { size: s.size || '', qty: String(s.qty ?? '') }
          }
          return { size: String(s), qty: '' }
        })
      } else if (typeof product.sizes === 'string' && product.sizes.trim()) {
        initialSizes = product.sizes
          .split(',')
          .map((s) => ({ size: s.trim(), qty: '' }))
          .filter((s) => s.size)
      }
      if (!initialSizes.length) {
        initialSizes = [{ size: '', qty: '' }]
      }

      setForm({
        name: product.name || '',
        brand: product.brand_name || product.brand || '',
        category: product.category || categories[0]?.slug || '',
        subcategory: product.subcategory || '',
        subcategorySlug: product.subcategorySlug || '',
        keywords: Array.isArray(product.keywords) ? product.keywords : Array.isArray(product.tags) ? product.tags : [],
        price: String(product.price ?? ''),
        originalPrice: String(product.originalPrice ?? ''),
        stock: String(product.stock ?? '50'),
        colors: normalizedColors,
        sizes: initialSizes,
        description: product.description || '',
        isBestSeller: !!product.isBestSeller,
        images: product.images && product.images.length ? product.images : [product.image].filter(Boolean),
        // Delhivery shipping dimensions
        weight: String(product.weight ?? '0.05'),
        length: String(product.length ?? '10'),
        width: String(product.width ?? '10'),
        height: String(product.height ?? '5'),
        shippingMode: product.shippingMode || 'Surface',
      })
    } else {
      setForm({ ...emptyForm, category: categories[0]?.slug || '' })
    }
    setError('')
    setIsAddingSubcategory(false)
    setNewSubName('')
    setNewKeyword('')
  }, [product])


  const selectedCategoryDoc = categories.find((c) => c.slug === form.category || c.id === form.category)
  const availableSubcategories = selectedCategoryDoc?.subcategories || []

  const handleCategoryChange = (e) => {
    const newCatSlug = e.target.value
    setForm((f) => ({ ...f, category: newCatSlug, subcategory: '', subcategorySlug: '' }))
    setIsAddingSubcategory(false)
  }

  const handleQuickAddSubcategory = async () => {
    if (!newSubName.trim() || !selectedCategoryDoc) return
    setSubmittingSub(true)
    try {
      const updatedCat = await addSubcategory(selectedCategoryDoc.id, { name: newSubName.trim() })
      const added = (updatedCat?.subcategories || []).find(
        (s) => s.name.toLowerCase() === newSubName.trim().toLowerCase()
      )
      if (added) {
        setForm((f) => ({ ...f, subcategory: added.name, subcategorySlug: added.slug }))
      }
      setNewSubName('')
      setIsAddingSubcategory(false)
    } catch (err) {
      setError(err.message || 'Failed to add subcategory')
    } finally {
      setSubmittingSub(false)
    }
  }

  const handleAddKeyword = (kwToAdd) => {
    const val = (kwToAdd !== undefined ? kwToAdd : newKeyword).trim()
    if (!val) return
    if (form.keywords.some((k) => k.toLowerCase() === val.toLowerCase())) {
      setNewKeyword('')
      return
    }
    setForm((f) => ({ ...f, keywords: [...f.keywords, val] }))
    setNewKeyword('')
  }

  const handleRemoveKeyword = (idx) => {
    setForm((f) => ({ ...f, keywords: f.keywords.filter((_, i) => i !== idx) }))
  }

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
    setForm((f) => {
      const existingIdx = f.colors.findIndex((c) => c.name === colorWithDetails.name)
      if (existingIdx >= 0) {
        const nextColors = [...f.colors]
        nextColors[existingIdx] = colorWithDetails
        return { ...f, colors: nextColors }
      }
      return { ...f, colors: [...f.colors, colorWithDetails] }
    })
    setDetailsColor(null)
  }

  const removeColor = (idx) => {
    setForm((f) => ({ ...f, colors: f.colors.filter((_, i) => i !== idx) }))
  }

  const addSizeRow = (sizeName = '', qty = '') => {
    setForm((f) => ({
      ...f,
      sizes: [...(f.sizes || []), { size: sizeName, qty: String(qty) }],
    }))
  }

  const updateSizeRow = (index, fieldName, value) => {
    setForm((f) => {
      const updated = [...(f.sizes || [])]
      if (updated[index]) {
        updated[index] = { ...updated[index], [fieldName]: value }
      }
      return { ...f, sizes: updated }
    })
  }

  const removeSizeRow = (index) => {
    setForm((f) => {
      const filtered = (f.sizes || []).filter((_, i) => i !== index)
      return {
        ...f,
        sizes: filtered.length > 0 ? filtered : [{ size: '', qty: '' }],
      }
    })
  }

  const validSizes = (form.sizes || []).filter((s) => s.size && s.size.trim())
  const totalSizeQty = validSizes.reduce((sum, s) => sum + (parseInt(s.qty, 10) || 0), 0)

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (!form.name.trim()) return setError('Product name is required')
    if (!form.price || Number(form.price) <= 0) return setError('Please enter a valid price')
    if (!form.images.length) return setError('Please add at least one product image')

    setSaving(true)

    const cleanSizes = (form.sizes || [])
      .filter((s) => s.size && s.size.trim())
      .map((s) => ({
        size: s.size.trim(),
        qty: Math.max(0, parseInt(s.qty, 10) || 0),
      }))

    let finalColors = form.colors
    if (Array.isArray(finalColors) && finalColors.length > 0) {
      finalColors = finalColors.map((c, idx) => {
        if (idx === 0) {
          // Parent color inherits main product sizes & stock
          return {
            ...c,
            sizes: cleanSizes,
            stock: cleanSizes.reduce((acc, s) => acc + s.qty, 0),
          }
        }
        // Variant colors (dd, etc.) keep their configured sizes & stock
        const cSizes = (c.sizes || [])
          .filter((s) => s.size && s.size.trim())
          .map((s) => ({
            size: s.size.trim(),
            qty: Math.max(0, Number(s.qty) || 0),
          }))
        const cStock = cSizes.length > 0
          ? cSizes.reduce((acc, s) => acc + s.qty, 0)
          : Math.max(0, Number(c.stock) || 0)
        return {
          ...c,
          sizes: cSizes,
          stock: cStock,
        }
      })
    }

    let finalStock = 0
    if (finalColors.length > 0) {
      finalStock = finalColors.reduce((sum, c) => sum + (c.stock || 0), 0)
    } else if (cleanSizes.length > 0) {
      finalStock = cleanSizes.reduce((acc, s) => acc + s.qty, 0)
    } else {
      finalStock = Math.max(0, parseInt(form.stock, 10) || 0)
    }

    const aggMap = new Map()
    if (finalColors.length > 0) {
      finalColors.forEach((c) => {
        (c.sizes || []).forEach((s) => {
          if (s.size) {
            aggMap.set(s.size, (aggMap.get(s.size) || 0) + (s.qty || 0))
          }
        })
      })
    }
    const aggregatedSizes = aggMap.size > 0
      ? Array.from(aggMap.entries()).map(([size, qty]) => ({ size, qty }))
      : cleanSizes

    const payload = {
      name: form.name.trim(),
      brand: form.brand.trim() || 'Generic',
      brand_name: form.brand.trim() || 'Generic',
      category: form.category,
      subcategory: form.subcategory,
      subcategorySlug: form.subcategorySlug,
      keywords: form.keywords,
      tags: form.keywords,
      price: Number(form.price),
      originalPrice: form.originalPrice ? Number(form.originalPrice) : Number(form.price),
      stock: finalStock,
      colors: finalColors,
      sizes: aggregatedSizes,
      description: form.description.trim(),
      isBestSeller: form.isBestSeller,
      images: form.images,
      image: form.images[0],
      // Delhivery shipping dimensions
      weight: parseFloat(form.weight) || 0.05,
      length: parseFloat(form.length) || 10,
      width:  parseFloat(form.width)  || 10,
      height: parseFloat(form.height) || 5,
      shippingMode: form.shippingMode || 'Surface',
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
                onChange={handleCategoryChange}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-500 bg-white"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-gray-800 font-semibold text-sm">
                Subcategory <span className="text-gray-400 font-normal text-xs">(Optional)</span>
              </label>
              {!isAddingSubcategory && selectedCategoryDoc && (
                <button
                  type="button"
                  onClick={() => setIsAddingSubcategory(true)}
                  className="text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1 transition"
                >
                  <Plus size={13} /> Add New Subcategory
                </button>
              )}
            </div>

            {isAddingSubcategory ? (
              <div className="flex items-center gap-2 p-2 bg-purple-50/70 border border-purple-200 rounded-lg">
                <input
                  value={newSubName}
                  onChange={(e) => setNewSubName(e.target.value)}
                  placeholder={`New subcategory for ${selectedCategoryDoc?.name || 'Category'}...`}
                  autoFocus
                  className="flex-1 px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-md focus:outline-none focus:border-purple-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleQuickAddSubcategory()
                    }
                  }}
                />
                <button
                  type="button"
                  disabled={submittingSub || !newSubName.trim()}
                  onClick={handleQuickAddSubcategory}
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-md text-xs font-bold transition flex items-center gap-1 shrink-0"
                >
                  {submittingSub ? <Loader2 size={13} className="animate-spin" /> : 'Add'}
                </button>
                <button
                  type="button"
                  onClick={() => { setIsAddingSubcategory(false); setNewSubName('') }}
                  className="px-2.5 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md text-xs font-semibold transition shrink-0"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <select
                value={form.subcategorySlug}
                onChange={(e) => {
                  const slug = e.target.value
                  const matched = availableSubcategories.find((s) => s.slug === slug)
                  setForm((f) => ({
                    ...f,
                    subcategorySlug: slug,
                    subcategory: matched ? matched.name : '',
                  }))
                }}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-500 bg-white"
              >
                <option value="">-- No Subcategory / None --</option>
                {availableSubcategories.map((s) => (
                  <option key={s.slug || s.id || s._id} value={s.slug}>
                    {s.name}
                  </option>
                ))}
              </select>
            )}
            {availableSubcategories.length === 0 && !isAddingSubcategory && (
              <p className="text-gray-400 text-[11px] mt-1">
                No subcategories created for this category yet. Click "+ Add New Subcategory" to add one right here.
              </p>
            )}
          </div>

          {/* ── Product Keywords / Search Tags (Matches screenshot design) ── */}
          <div className="bg-gradient-to-br from-purple-50/50 via-white to-pink-50/30 border border-purple-100 rounded-2xl p-4 shadow-xs">
            <div className="flex items-center gap-2.5 mb-2">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-xs"
                style={{ background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)' }}
              >
                <Search size={15} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-gray-900 leading-tight">Product Keywords / Search Tags</h4>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Suggested terms shown when someone taps the search bar or searches this product
                </p>
              </div>
            </div>

            {/* Quick Add Suggestions */}
            <div className="mb-3 pt-1">
              <span className="text-[11px] font-bold text-gray-400 block mb-1.5 uppercase tracking-wider">
                Quick Add Suggestions:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_KEYWORDS.map((preset) => {
                  const isAdded = form.keywords.some((k) => k.toLowerCase() === preset.toLowerCase())
                  return (
                    <button
                      key={preset}
                      type="button"
                      disabled={isAdded}
                      onClick={() => handleAddKeyword(preset)}
                      className={`text-xs px-2.5 py-1 rounded-full border transition-all flex items-center gap-1 ${
                        isAdded
                          ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-60'
                          : 'bg-white text-purple-700 border-purple-200 hover:bg-purple-100/70 hover:border-purple-300 shadow-2xs active:scale-95'
                      }`}
                    >
                      <Plus size={11} /> {preset}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Active Keywords list (pill tags matching screenshot) */}
            {form.keywords.length > 0 ? (
              <div className="flex flex-wrap gap-2 mb-3 max-h-36 overflow-y-auto p-1 bg-white/80 rounded-xl border border-purple-50">
                {form.keywords.map((kw, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-semibold border border-purple-200/80 shadow-2xs group"
                  >
                    <span>{kw}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveKeyword(idx)}
                      className="text-purple-400 hover:text-red-500 rounded-full transition-colors ml-0.5"
                      title="Remove keyword"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-xs italic mb-3">No keywords added yet. Choose from suggestions above or type your own below.</p>
            )}

            {/* Add Search Term Input Row (Input + Gradient '+ Add' button) */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddKeyword()
                  }
                }}
                placeholder="Add a search term..."
                className="flex-1 px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all placeholder:text-gray-400"
              />
              <button
                type="button"
                onClick={() => handleAddKeyword()}
                disabled={!newKeyword.trim()}
                className="px-5 py-2.5 text-white font-bold text-sm rounded-xl transition-all hover:shadow-md disabled:opacity-50 disabled:hover:shadow-none flex items-center gap-1.5 shrink-0"
                style={{ background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)' }}
              >
                <Plus size={16} strokeWidth={2.5} /> Add
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-800 font-semibold text-sm mb-1.5">Price (₹) *</label>
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
          </div>

          <div>
            <label className="block text-gray-800 font-semibold text-sm mb-2">Colors</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {form.colors.map((c, idx) => {
                const isParent = idx === 0
                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-2 border rounded-full pl-1.5 pr-2 py-1 transition-all ${
                      isParent
                        ? 'bg-purple-50 border-purple-300 text-purple-900 cursor-default shadow-2xs'
                        : 'bg-gray-50 border-gray-200 hover:bg-purple-50 hover:border-purple-300 cursor-pointer text-gray-700'
                    }`}
                    onClick={() => {
                      if (!isParent) {
                        setDetailsColor(c)
                      }
                    }}
                    title={
                      isParent
                        ? 'Parent / Primary color (uses main product images and sizes above)'
                        : `Click to configure photos & size-wise stock for ${c.name}`
                    }
                  >
                    <div className="w-5 h-5 rounded-full border border-gray-200 shrink-0 shadow-2xs" style={getSwatchStyle(c, idx)} />
                    <span className="text-xs font-semibold">
                      {c.name} {isParent ? '(Primary)' : c.stock !== undefined && c.stock > 0 ? `(${c.stock} units)` : c.images?.length > 0 ? `(${c.images.length} photos)` : ''}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeColor(idx)
                      }}
                      className="text-gray-400 hover:text-red-500 transition-colors p-0.5 rounded-full"
                      title="Remove color"
                    >
                      <X size={13} />
                    </button>
                  </div>
                )
              })}
              <button
                type="button"
                onClick={() => setColorPickerOpen(true)}
                className="flex items-center gap-1 text-xs font-semibold text-purple-600 border border-purple-200 rounded-full px-3 py-1.5 hover:bg-purple-50 transition-colors"
              >
                <Plus size={13} /> Add Color
              </button>
            </div>
          </div>

          <div className="border border-purple-100 bg-purple-50/30 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-gray-900 font-semibold text-sm">Sizes & Quantities</label>
                <p className="text-gray-500 text-xs mt-0.5">Size ka naam aur us size ka stock/quantity enter karein</p>
              </div>
              {validSizes.length > 0 && (
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-100 text-purple-700 border border-purple-200">
                  Total Units: {totalSizeQty}
                </span>
              )}
            </div>

            {/* Quick Add Preset Sizes */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-xs text-gray-500 font-medium">Quick Add:</span>
              {['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'].map((preset) => {
                const alreadyAdded = form.sizes?.some((s) => s.size?.toUpperCase() === preset.toUpperCase())
                return (
                  <button
                    key={preset}
                    type="button"
                    disabled={alreadyAdded}
                    onClick={() => {
                      if (!alreadyAdded) {
                        if (form.sizes?.length === 1 && !form.sizes[0].size && !form.sizes[0].qty) {
                          updateSizeRow(0, 'size', preset)
                        } else {
                          addSizeRow(preset, '')
                        }
                      }
                    }}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-colors ${
                      alreadyAdded
                        ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                        : 'bg-white text-purple-700 hover:bg-purple-100 border-purple-200 shadow-sm'
                    }`}
                  >
                    +{preset}
                  </button>
                )
              })}
            </div>

            {/* Size + Qty 2-Input Rows */}
            <div className="space-y-2 pt-1">
              <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-gray-500 px-1">
                <span className="col-span-6">Size (Input 1)</span>
                <span className="col-span-4">Quantity (Input 2)</span>
                <span className="col-span-2 text-center">Action</span>
              </div>

              {(form.sizes || []).map((row, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-6">
                    <input
                      type="text"
                      placeholder="e.g. S, M, 32B"
                      value={row.size}
                      onChange={(e) => updateSizeRow(idx, 'size', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-purple-500 font-medium"
                    />
                  </div>
                  <div className="col-span-4">
                    <input
                      type="number"
                      min="0"
                      placeholder="e.g. 10"
                      value={row.qty}
                      onChange={(e) => updateSizeRow(idx, 'qty', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div className="col-span-2 flex justify-center">
                    <button
                      type="button"
                      onClick={() => removeSizeRow(idx)}
                      disabled={(form.sizes || []).length <= 1 && !row.size && !row.qty}
                      className="p-1.5 text-gray-400 hover:text-red-500 rounded-md hover:bg-red-50 transition-colors disabled:opacity-30"
                      title="Remove row"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => addSizeRow('', '')}
              className="flex items-center gap-1.5 text-xs font-bold text-purple-700 hover:text-purple-900 bg-white hover:bg-purple-50 border border-purple-200 rounded-xl px-4 py-2.5 transition-all shadow-sm w-full justify-center"
            >
              <Plus size={15} strokeWidth={2.5} /> Add Another Size & Quantity
            </button>
          </div>

          <div className="border border-orange-100 bg-orange-50/30 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-xs"
                   style={{ background: 'linear-gradient(135deg, #f97316 0%, #ef4444 100%)' }}>
                <span className="text-white text-xs font-black">📦</span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900 leading-tight">Shipping Dimensions</h4>
                <p className="text-[11px] text-gray-500 mt-0.5">Delhivery delivery estimate ke liye required — weight aur box size</p>
              </div>
            </div>

            {/* Weight + Mode row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-700 font-semibold text-xs mb-1.5">
                  Weight <span className="text-gray-400 font-normal">(kg, e.g. 0.5)</span>
                </label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.weight}
                  onChange={field('weight')}
                  placeholder="0.05"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-orange-400 bg-white"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold text-xs mb-1.5">Shipping Mode</label>
                <select
                  value={form.shippingMode}
                  onChange={field('shippingMode')}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-orange-400 bg-white"
                >
                  <option value="Surface">🚛 Surface (2–5 days)</option>
                  <option value="Express">✈️ Express (1–2 days)</option>
                </select>
              </div>
            </div>

            {/* L × W × H */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-gray-700 font-semibold text-xs mb-1.5">
                  Length <span className="text-gray-400 font-normal">(cm)</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={form.length}
                  onChange={field('length')}
                  placeholder="10"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-orange-400 bg-white"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold text-xs mb-1.5">
                  Width <span className="text-gray-400 font-normal">(cm)</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={form.width}
                  onChange={field('width')}
                  placeholder="10"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-orange-400 bg-white"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold text-xs mb-1.5">
                  Height <span className="text-gray-400 font-normal">(cm)</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={form.height}
                  onChange={field('height')}
                  placeholder="5"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-orange-400 bg-white"
                />
              </div>
            </div>
            <p className="text-[10px] text-gray-400">
              📍 These values auto-populate the Delhivery TAT estimate on the product page for customers.
            </p>
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
          parentSizes={validSizes.map((s) => s.size)}
          onSave={handleSaveVariantDetails}
          onClose={() => setDetailsColor(null)}
        />
      )}
    </div>
  )
}
