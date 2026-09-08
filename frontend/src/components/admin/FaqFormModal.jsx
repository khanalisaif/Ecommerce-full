import { useEffect, useState } from 'react'
import { X, Loader2 } from 'lucide-react'

export default function FaqFormModal({ faq, onClose, onSave }) {
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setQuestion(faq?.question || '')
    setAnswer(faq?.answer || '')
    setError('')
  }, [faq])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!question.trim() || !answer.trim()) {
      setError('Both question and answer are required')
      return
    }
    setSaving(true)
    setTimeout(() => {
      onSave({ question: question.trim(), answer: answer.trim() })
      setSaving(false)
    }, 200)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900 text-lg">{faq ? 'Edit FAQ' : 'Add FAQ'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-gray-800 font-semibold text-sm mb-1.5">Question</label>
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. How long does delivery take?"
              autoFocus
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-500"
            />
          </div>
          <div>
            <label className="block text-gray-800 font-semibold text-sm mb-1.5">Answer</label>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              rows={4}
              placeholder="Write the answer shown to customers"
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-500 resize-none"
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
              {saving ? <Loader2 size={16} className="animate-spin" /> : faq ? 'Save Changes' : 'Add FAQ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
