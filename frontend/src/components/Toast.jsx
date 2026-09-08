import { useShop } from '../context/ShopContext'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'

export default function Toast() {
  const { toast, showToast } = useShop()
  if (!toast) return null

  const message = typeof toast === 'string' ? toast : toast?.message
  const type = typeof toast === 'string' ? 'success' : (toast?.type || 'success')

  if (!message) return null

  const styles = {
    success: 'bg-emerald-600 text-white shadow-emerald-700/30 border-emerald-500',
    error: 'bg-rose-600 text-white shadow-rose-700/30 border-rose-500',
    info: 'bg-slate-900 text-white shadow-slate-900/30 border-slate-700',
  }

  const icons = {
    success: <CheckCircle2 size={18} className="flex-shrink-0 text-white" />,
    error: <AlertCircle size={18} className="flex-shrink-0 text-white" />,
    info: <Info size={18} className="flex-shrink-0 text-white" />,
  }

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] max-w-md w-[90%] sm:w-auto">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium shadow-xl border text-sm transition-all animate-fade-in ${
          styles[type] || styles.info
        }`}
      >
        {icons[type] || icons.info}
        <span className="flex-1 leading-snug">{message}</span>
        <button
          onClick={() => showToast(null)}
          className="ml-2 text-white/80 hover:text-white transition-opacity p-0.5 rounded"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  )
}
