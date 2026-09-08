import { useState, useEffect } from 'react'
import { X, Save } from 'lucide-react'

export default function VariantStockModal({ product, onSave, onClose }) {
  const [colors, setColors] = useState([])

  useEffect(() => {
    if (product?.colors) {
      const initialColors = JSON.parse(JSON.stringify(product.colors))
      initialColors.forEach((c, idx) => {
        if (c.stock === undefined) {
          c.stock = idx === 0 ? (product.stock || 0) : 0
        }
      })
      setColors(initialColors)
    }
  }, [product])

  const handleStockChange = (idx, value) => {
    const newColors = [...colors]
    newColors[idx].stock = Number(value) || 0
    setColors(newColors)
  }

  const handleSave = () => {
    const newTotalStock = colors.reduce((acc, c) => acc + (c.stock || 0), 0)
    onSave(product.id, { colors, stock: newTotalStock })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900 text-lg">Manage Variant Stock</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-600 mb-2 font-semibold">Stock for {product.name}</p>
          <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
            {colors.map((c, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full border border-gray-200" style={{ backgroundColor: c.hex || c.name }} />
                  <span className="text-sm font-semibold text-gray-700">{c.name}</span>
                </div>
                <input
                  type="number"
                  min="0"
                  value={c.stock}
                  onChange={(e) => handleStockChange(idx, e.target.value)}
                  className="w-20 px-2 py-1 text-center border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-500"
                />
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-full border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 py-2.5 rounded-full text-white font-bold text-sm transition-all hover:shadow-lg flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)' }}
            >
              <Save size={16} /> Save
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
