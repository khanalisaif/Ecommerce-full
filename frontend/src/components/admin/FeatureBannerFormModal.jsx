import { useEffect, useRef, useState } from 'react'
import { X, Loader2, UploadCloud } from 'lucide-react'
import { useShop } from '../../context/ShopContext'
import { compressImageFile } from '../../utils/imageUtils'

const MAX_MB = 2

export default function FeatureBannerFormModal({ banner, onClose, onSave }) {
  const { categories } = useShop()
  const [form, setForm] = useState({ title: '', subtitle: '', buttonText: 'Shop Now', badge1: '', badge2: '', image: '', slug: '' })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const fileRef = useRef(null)

  useEffect(() => {
    setForm({
      title: banner?.title || '',
      subtitle: banner?.subtitle || '',
      buttonText: banner?.buttonText || 'Shop Now',
      badge1: banner?.badge1 || '',
      badge2: banner?.badge2 || '',
      image: banner?.image || '',
      slug: banner?.slug || categories[0]?.slug || '',
    })
    setError('')
  }, [banner])

  const field = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleFile = async (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) return setError('Please select an image file')
    if (file.size > MAX_MB * 1024 * 1024) return setError(`Image must be under ${MAX_MB}MB`)
    try {
      const compressed = await compressImageFile(file)
      setForm((f) => ({ ...f, image: compressed }))
    } catch {
      setError('Failed to process image')
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.title.trim()) return setError('Title is required')
    if (!form.image) return setError('Please add a background image')
    setSaving(true)
    setTimeout(() => { onSave(form); setSaving(false) }, 200)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
          <h3 className="font-bold text-gray-900 text-lg">{banner ? 'Edit Feature Banner' : 'Add Feature Banner'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-gray-800 font-semibold text-sm mb-2">Background Image</label>
            <div className="flex items-center gap-3">
              {form.image ? (
                <img src={form.image} alt="" className="w-20 h-14 rounded-lg object-cover border border-gray-200" />
              ) : (
                <div className="w-20 h-14 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-300"><UploadCloud size={18} /></div>
              )}
              <button type="button" onClick={() => fileRef.current?.click()} className="text-sm font-semibold text-purple-600 hover:underline">
                {form.image ? 'Change image' : 'Upload image'}
              </button>
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
          </div>

          <div>
            <label className="block text-gray-800 font-semibold text-sm mb-1.5">Title</label>
            <input value={form.title} onChange={field('title')} placeholder="e.g. Category" className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-500" />
          </div>

          <div>
            <label className="block text-gray-800 font-semibold text-sm mb-1.5">Subtitle</label>
            <textarea
              value={form.subtitle}
              onChange={field('subtitle')}
              rows={2}
              placeholder={'Unleash Your Fantasy,\nOver the horizon.'}
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-500 resize-none"
            />
            <p className="text-gray-400 text-[10px] mt-1">Use a new line for a line break</p>
          </div>

          <div>
            <label className="block text-gray-800 font-semibold text-sm mb-1.5">Button Text</label>
            <input value={form.buttonText} onChange={field('buttonText')} placeholder="Shop Now" className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-500" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-800 font-semibold text-sm mb-1.5">Badge 1</label>
              <input value={form.badge1} onChange={field('badge1')} placeholder="e.g. 50+ Themes" className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-500" />
            </div>
            <div>
              <label className="block text-gray-800 font-semibold text-sm mb-1.5">Badge 2</label>
              <input value={form.badge2} onChange={field('badge2')} placeholder="e.g. Premium Quality" className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-500" />
            </div>
          </div>

          <div>
            <label className="block text-gray-800 font-semibold text-sm mb-1.5">Links to Category</label>
            <select value={form.slug} onChange={field('slug')} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-500 bg-white">
              {categories.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
            </select>
          </div>

          {error && <p className="text-red-500 text-xs font-medium">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-full border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 py-3 rounded-full text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-70" style={{ background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)' }}>
              {saving ? <Loader2 size={16} className="animate-spin" /> : banner ? 'Save Changes' : 'Add Banner'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
