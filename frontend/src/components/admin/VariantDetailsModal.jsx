import { useState, useRef } from 'react'
import { X, UploadCloud, Trash2 } from 'lucide-react'
import { compressImage } from '../../utils/imageCompression'

const MAX_IMAGE_MB = 2
const MAX_IMAGES = 5

export default function VariantDetailsModal({ color, onSave, onClose }) {
  const [images, setImages] = useState(color.images || [])
  const [stock, setStock] = useState(String(color.stock || '50'))
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)

  const handleFiles = async (files) => {
    const remaining = MAX_IMAGES - images.length
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
      setImages((prev) => [...prev, ...validImages])
    }
  }

  const removeImage = (idx) => {
    setImages((prev) => prev.filter((_, i) => i !== idx))
  }

  const handleSave = () => {
    onSave({ ...color, images, stock: Number(stock) || 0 })
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900 text-lg">Details for {color.name}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-gray-800 font-semibold text-sm mb-2">Variant Images</label>
            <div className="flex flex-wrap gap-3">
              {images.map((img, idx) => (
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
              {images.length < MAX_IMAGES && (
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
          </div>

          <div>
            <label className="block text-gray-800 font-semibold text-sm mb-1.5">Variant Stock</label>
            <input
              type="number"
              min="0"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              placeholder="e.g. 20"
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-500"
            />
          </div>

          {error && <p className="text-red-500 text-xs font-medium">{error}</p>}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-full border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex-1 py-3 rounded-full text-white font-bold text-sm transition-all hover:shadow-lg"
              style={{ background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)' }}
            >
              Save Variant
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
