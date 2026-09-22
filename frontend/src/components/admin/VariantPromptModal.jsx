import { X, Layers } from 'lucide-react'

export default function VariantPromptModal({ colorName, onYes, onNo, onClose }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 text-center animate-in fade-in zoom-in-95 duration-150" onClick={(e) => e.stopPropagation()}>
        <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-purple-600 shadow-xs">
          <Layers size={26} />
        </div>
        <h3 className="text-lg font-black text-gray-900 mb-2">Configure {colorName}?</h3>
        <p className="text-gray-500 text-xs sm:text-sm mb-6 leading-relaxed">
          Do you want to upload photos and set size-wise stock specifically for the <strong>{colorName}</strong> color variant?
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onNo}
            className="flex-1 py-2.5 rounded-full border border-gray-200 text-gray-600 font-bold text-xs sm:text-sm hover:bg-gray-50 transition-colors cursor-pointer"
          >
            No, skip
          </button>
          <button
            type="button"
            onClick={onYes}
            className="flex-1 py-2.5 rounded-full text-white font-bold text-xs sm:text-sm hover:shadow-lg transition-all cursor-pointer"
            style={{ background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)' }}
          >
            Yes, configure
          </button>
        </div>
      </div>
    </div>
  )
}
