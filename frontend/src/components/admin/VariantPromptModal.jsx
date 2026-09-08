import { X } from 'lucide-react'

export default function VariantPromptModal({ colorName, onYes, onNo, onClose }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center" onClick={(e) => e.stopPropagation()}>
        <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-purple-600 font-bold text-xl">?</span>
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">Add Images & Stock for {colorName}?</h3>
        <p className="text-gray-500 text-sm mb-6">
          Do you want to add specific images and stock quantity for this color variant?
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onNo}
            className="flex-1 py-2.5 rounded-full border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-colors"
          >
            No, skip
          </button>
          <button
            type="button"
            onClick={onYes}
            className="flex-1 py-2.5 rounded-full text-white font-bold text-sm hover:shadow-lg transition-all"
            style={{ background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)' }}
          >
            Yes, add details
          </button>
        </div>
      </div>
    </div>
  )
}
