import { useEffect, useRef, useState } from 'react'
import {
  X, Loader2, Home, User, PersonStanding, Heart, List, Flower2, Droplet,
  Camera, Music, Gift, Sparkles, Flame, Laptop, Tablet, Smartphone,
  Headphones, Package, ShoppingBag, Watch, Shirt, UploadCloud, Trash2,
} from 'lucide-react'
import { CATEGORY_ICON_OPTIONS, slugify } from '../../data/categoryStore'

const iconComponents = {
  Home, User, PersonStanding, Heart, List, Flower2, Droplet, Camera, Music,
  Gift, Sparkles, Flame, Laptop, Tablet, Smartphone, Headphones, Package,
  ShoppingBag, Watch, Shirt,
}

const MAX_MB = 2

export default function CategoryFormModal({ category, onClose, onSave }) {
  const [name, setName] = useState('')
  const [icon, setIcon] = useState(CATEGORY_ICON_OPTIONS[0])
  const [image, setImage] = useState('')
  const [mode, setMode] = useState('icon') // 'icon' | 'image'
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const fileRef = useRef(null)

  useEffect(() => {
    if (category) {
      setName(category.name)
      setIcon(category.icon || CATEGORY_ICON_OPTIONS[0])
      setImage(category.image || '')
      setMode(category.image ? 'image' : 'icon')
    } else {
      setName('')
      setIcon(CATEGORY_ICON_OPTIONS[0])
      setImage('')
      setMode('icon')
    }
    setError('')
  }, [category])

  const handleFile = (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) return setError('Please select an image file')
    if (file.size > MAX_MB * 1024 * 1024) return setError(`Image must be under ${MAX_MB}MB`)
    const reader = new FileReader()
    reader.onload = () => setImage(reader.result)
    reader.readAsDataURL(file)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Category name is required')
      return
    }
    if (mode === 'image' && !image) {
      setError('Please upload an image, or switch to Icon')
      return
    }
    setSaving(true)
    setError('')
    Promise.resolve(onSave({ name: name.trim(), icon, image: mode === 'image' ? image : '' }))
      .then(() => setSaving(false))
      .catch((err) => {
        setSaving(false)
        setError(err.message || 'Failed to save category')
      })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
          <h3 className="font-bold text-gray-900 text-lg">{category ? 'Edit Category' : 'Add Category'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-gray-800 font-semibold text-sm mb-1.5">Category Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. For Her"
              autoFocus
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-500"
            />
            {name.trim() && (
              <p className="text-gray-400 text-[11px] mt-1.5">
                Will appear at <span className="font-mono">/category/{slugify(name)}</span>
              </p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-gray-800 font-semibold text-sm">Display As</label>
              <div className="flex bg-gray-100 rounded-full p-0.5">
                <button
                  type="button"
                  onClick={() => setMode('icon')}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${mode === 'icon' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500'}`}
                >
                  Icon
                </button>
                <button
                  type="button"
                  onClick={() => setMode('image')}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${mode === 'image' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500'}`}
                >
                  Image
                </button>
              </div>
            </div>

            {mode === 'icon' ? (
              <div className="grid grid-cols-6 gap-2">
                {CATEGORY_ICON_OPTIONS.map((iconName) => {
                  const IconComp = iconComponents[iconName]
                  return (
                    <button
                      key={iconName}
                      type="button"
                      onClick={() => setIcon(iconName)}
                      className={`aspect-square rounded-xl flex items-center justify-center border-2 transition-all ${
                        icon === iconName ? 'border-purple-600 bg-purple-50 text-purple-600' : 'border-gray-100 text-gray-400 hover:border-gray-200'
                      }`}
                    >
                      {IconComp && <IconComp size={18} />}
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                {image ? (
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-gray-200 group shrink-0">
                    <img src={image} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setImage('')}
                      className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center text-white"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-300 shrink-0">
                    <UploadCloud size={18} />
                  </div>
                )}
                <button type="button" onClick={() => fileRef.current?.click()} className="text-sm font-semibold text-purple-600 hover:underline">
                  {image ? 'Change image' : 'Upload image'}
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
              </div>
            )}
          </div>

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
              {saving ? <Loader2 size={16} className="animate-spin" /> : category ? 'Save Changes' : 'Add Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
