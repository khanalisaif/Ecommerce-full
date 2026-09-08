import { useEffect, useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import { slugifyTitle } from '../../data/footerStore'

export default function PageFormModal({ page, onClose, onSave }) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setTitle(page?.title || '')
    setContent(page?.content || '')
    setError('')
  }, [page])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) {
      setError('Both title and content are required')
      return
    }
    setSaving(true)
    setTimeout(() => {
      onSave({ title: title.trim(), content: content.trim() })
      setSaving(false)
    }, 200)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
          <h3 className="font-bold text-gray-900 text-lg">{page ? 'Edit Page' : 'Add Page'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-gray-800 font-semibold text-sm mb-1.5">Page Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Shipping & Delivery"
              autoFocus
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-500"
            />
            {title.trim() && (
              <p className="text-gray-400 text-[11px] mt-1.5">Will appear at <span className="font-mono">/info/{slugifyTitle(title)}</span></p>
            )}
          </div>
          <div>
            <label className="block text-gray-800 font-semibold text-sm mb-1.5">Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={10}
              placeholder="Write the page content. Start a new line for a new paragraph."
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-500 resize-none font-mono"
            />
          </div>
          {error && <p className="text-red-500 text-xs font-medium">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-full border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-colors">Cancel</button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 rounded-full text-white font-bold text-sm transition-all hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-70"
              style={{ background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)' }}
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : page ? 'Save Changes' : 'Add Page'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
