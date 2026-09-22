import { useState, useRef, useEffect } from 'react'
import { X, UploadCloud, Trash2, Plus, Boxes } from 'lucide-react'
import { compressImage } from '../../utils/imageCompression'

const MAX_IMAGE_MB = 2
const MAX_IMAGES = 5
const QUICK_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size']

export default function VariantDetailsModal({ color, parentSizes = [], onSave, onClose }) {
  const [images, setImages] = useState(color.images || [])
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)

  // Initialize sizes: use color.sizes if already configured, otherwise pre-fill with parentSizes
  const [sizes, setSizes] = useState(() => {
    if (Array.isArray(color.sizes) && color.sizes.length > 0) {
      return color.sizes.map((s) => ({
        size: typeof s === 'object' ? s.size || '' : String(s),
        qty: typeof s === 'object' ? String(s.qty ?? '') : '',
      }))
    }
    // Pre-populate with parent sizes from the main product form if available!
    if (Array.isArray(parentSizes) && parentSizes.length > 0) {
      return parentSizes
        .filter((s) => s && String(s).trim())
        .map((s) => {
          const sName = typeof s === 'object' ? s.size || '' : String(s)
          return { size: sName, qty: '' }
        })
    }
    return [{ size: 'S', qty: '' }, { size: 'M', qty: '' }, { size: 'L', qty: '' }]
  })

  const handleFiles = async (files) => {
    const remaining = MAX_IMAGES - images.length
    if (remaining <= 0) {
      setError(`You can add up to ${MAX_IMAGES} images`)
      return
    }
    const toRead = Array.from(files).slice(0, remaining)

    const compressedImages = await Promise.all(
      toRead
        .filter((f) => f.type.startsWith('image/'))
        .map(async (file) => {
          try {
            return await compressImage(file)
          } catch (err) {
            console.error('Image compression failed', err)
            return null
          }
        })
    )

    const validImages = compressedImages.filter(Boolean)
    if (validImages.length > 0) {
      setImages((prev) => [...prev, ...validImages])
    }
  }

  const removeImage = (idx) => {
    setImages((prev) => prev.filter((_, i) => i !== idx))
  }

  const addSizeRow = (sizeName = '', qty = '') => {
    setSizes((prev) => [...prev, { size: sizeName, qty: String(qty) }])
  }

  const updateSizeRow = (idx, field, val) => {
    setSizes((prev) => {
      const next = [...prev]
      if (next[idx]) next[idx] = { ...next[idx], [field]: val }
      return next
    })
  }

  const removeSizeRow = (idx) => {
    setSizes((prev) => prev.filter((_, i) => i !== idx))
  }

  const validSizes = sizes.filter((s) => s.size && s.size.trim())
  const totalSizeQty = validSizes.reduce((sum, s) => sum + (parseInt(s.qty, 10) || 0), 0)

  const handleSave = () => {
    const cleanSizes = validSizes.map((s) => ({
      size: s.size.trim(),
      qty: Math.max(0, parseInt(s.qty, 10) || 0),
    }))

    const finalStock = cleanSizes.length > 0
      ? cleanSizes.reduce((acc, s) => acc + s.qty, 0)
      : Math.max(0, Number(color?.stock) || 0)

    onSave({
      ...color,
      images,
      sizes: cleanSizes,
      stock: finalStock,
    })
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs" onClick={onClose}>
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <span
              className="w-5 h-5 rounded-full border border-gray-300 shadow-2xs"
              style={{ backgroundColor: color.hex || color.name || '#9333ea' }}
            />
            <div>
              <h3 className="font-extrabold text-gray-900 text-lg">
                Configure Variant: <span className="text-purple-700">{color.name}</span>
              </h3>
              <p className="text-[11px] text-gray-500">Add photos and size-wise stock for this color</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Product Images (Matching parent layout exactly) */}
          <div>
            <label className="block text-gray-800 font-semibold text-sm mb-2">Product Images</label>
            <div className="flex flex-wrap gap-3">
              {images.map((img, idx) => (
                <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-gray-200 group">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center text-white cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              {images.length < MAX_IMAGES && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 hover:border-purple-400 hover:text-purple-500 transition-colors cursor-pointer"
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

          {/* SECTION 2: SIZES & STOCK FOR THIS VARIANT */}
          <div className="border border-purple-100 bg-purple-50/30 rounded-2xl p-4 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-extrabold uppercase tracking-wider text-purple-950 block">
                  2. Sizes & Quantities for "{color.name}"
                </label>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Is colour ki sizes aur unka stock enter karein
                </p>
              </div>
              {validSizes.length > 0 && (
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-100 text-purple-700 border border-purple-200">
                  Total: {totalSizeQty} units
                </span>
              )}
            </div>

            {/* Quick Add Preset Buttons */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-xs text-gray-500 font-medium">Quick Add:</span>
              {QUICK_SIZES.map((preset) => {
                const alreadyAdded = sizes.some((s) => s.size?.trim().toUpperCase() === preset.toUpperCase())
                return (
                  <button
                    key={preset}
                    type="button"
                    disabled={alreadyAdded}
                    onClick={() => {
                      if (!alreadyAdded) {
                        if (sizes.length === 1 && !sizes[0].size && !sizes[0].qty) {
                          updateSizeRow(0, 'size', preset)
                        } else {
                          addSizeRow(preset, '')
                        }
                      }
                    }}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                      alreadyAdded
                        ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed line-through'
                        : 'bg-white text-purple-700 hover:bg-purple-600 hover:text-white border-purple-200 shadow-2xs'
                    }`}
                  >
                    +{preset}
                  </button>
                )
              })}
            </div>

            {/* Size + Quantity Rows */}
            <div className="space-y-2 pt-1">
              <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-gray-500 px-1">
                <span className="col-span-6">Size (Input 1)</span>
                <span className="col-span-4">Quantity (Input 2)</span>
                <span className="col-span-2 text-center">Action</span>
              </div>

              {sizes.map((row, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-white p-1.5 rounded-xl border border-gray-200 shadow-2xs">
                  <div className="col-span-6">
                    <input
                      type="text"
                      placeholder="e.g. S, M, XL"
                      value={row.size}
                      onChange={(e) => updateSizeRow(idx, 'size', e.target.value)}
                      className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-bold text-gray-900 bg-gray-50/50 focus:bg-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div className="col-span-4">
                    <input
                      type="number"
                      min="0"
                      placeholder="Qty"
                      value={row.qty}
                      onChange={(e) => updateSizeRow(idx, 'qty', e.target.value)}
                      className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-center font-bold text-gray-900 bg-gray-50/50 focus:bg-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div className="col-span-2 flex justify-center">
                    <button
                      type="button"
                      onClick={() => removeSizeRow(idx)}
                      disabled={sizes.length <= 1 && !row.size && !row.qty}
                      className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-30 cursor-pointer"
                      title="Remove row"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => addSizeRow('', '')}
              className="flex items-center gap-1.5 text-xs font-bold text-purple-700 hover:text-purple-900 bg-white hover:bg-purple-50 border border-purple-200 rounded-xl px-4 py-2 transition-all shadow-2xs w-full justify-center cursor-pointer"
            >
              <Plus size={14} strokeWidth={2.5} /> Add Size & Quantity
            </button>
          </div>

          {error && <p className="text-red-500 text-xs font-medium">{error}</p>}
        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 sm:p-5 border-t border-gray-100 bg-gray-50/80 flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-full border border-gray-200 bg-white text-gray-700 font-bold text-xs sm:text-sm hover:bg-gray-100 transition-colors shadow-2xs cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 py-2.5 rounded-full text-white font-bold text-xs sm:text-sm transition-all hover:shadow-lg cursor-pointer flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)' }}
          >
            Save Variant ({totalSizeQty} units)
          </button>
        </div>
      </div>
    </div>
  )
}
