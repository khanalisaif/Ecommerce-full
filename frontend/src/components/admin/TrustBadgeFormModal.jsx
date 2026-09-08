import { useEffect, useState } from 'react'
import { X, Loader2, ShieldCheck, Truck, Headphones, Lock, RotateCcw, Box, Gift, Sparkles } from 'lucide-react'
import { TRUST_BADGE_ICON_OPTIONS } from '../../data/homepageStore'

const iconComponents = { ShieldCheck, Truck, Headphones, Lock, RotateCcw, Box, Gift, Sparkles }

export default function TrustBadgeFormModal({ badge, onClose, onSave }) {
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [icon, setIcon] = useState(TRUST_BADGE_ICON_OPTIONS[0])
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setTitle(badge?.title || '')
    setDesc(badge?.desc || '')
    setIcon(badge?.icon || TRUST_BADGE_ICON_OPTIONS[0])
    setError('')
  }, [badge])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim() || !desc.trim()) return setError('Both title and description are required')
    setSaving(true)
    setTimeout(() => { onSave({ title, desc, icon }); setSaving(false) }, 200)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900 text-lg">{badge ? 'Edit Trust Badge' : 'Add Trust Badge'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-gray-800 font-semibold text-sm mb-2">Icon</label>
            <div className="grid grid-cols-8 gap-2">
              {TRUST_BADGE_ICON_OPTIONS.map((iconName) => {
                const IconComp = iconComponents[iconName]
                return (
                  <button key={iconName} type="button" onClick={() => setIcon(iconName)}
                    className={`aspect-square rounded-xl flex items-center justify-center border-2 transition-all ${icon === iconName ? 'border-purple-600 bg-purple-50 text-purple-600' : 'border-gray-100 text-gray-400 hover:border-gray-200'}`}>
                    {IconComp && <IconComp size={16} />}
                  </button>
                )
              })}
            </div>
          </div>
          <div>
            <label className="block text-gray-800 font-semibold text-sm mb-1.5">Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Fast & Free Delivery" className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-500" />
          </div>
          <div>
            <label className="block text-gray-800 font-semibold text-sm mb-1.5">Description</label>
            <input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="e.g. Free shipping on orders above ₹999" className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-500" />
          </div>
          {error && <p className="text-red-500 text-xs font-medium">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-full border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 py-3 rounded-full text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-70" style={{ background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)' }}>
              {saving ? <Loader2 size={16} className="animate-spin" /> : badge ? 'Save Changes' : 'Add Badge'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
