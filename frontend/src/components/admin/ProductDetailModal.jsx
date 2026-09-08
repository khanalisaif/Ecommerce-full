import { useState, useEffect } from 'react'
import { X, Package, Tag, Box, Star, FileText, Image as ImageIcon } from 'lucide-react'
import { normalizeColorList, getSwatchStyle } from '../../data/colorUtils'

function stockBadge(stock) {
  if (stock === 0) return 'bg-red-100 text-red-600'
  if (stock < 15) return 'bg-amber-100 text-amber-700'
  return 'bg-green-100 text-green-700'
}

export default function ProductDetailModal({ product, onClose }) {
  if (!product) return null

  const colors = normalizeColorList(product.colors)
  const sizes = Array.isArray(product.sizes) ? product.sizes.join(', ') : (product.sizes || 'N/A')

  const [selectedIndex, setSelectedIndex] = useState(0)

  useEffect(() => {
    setSelectedIndex(0)
  }, [product])

  const currentColorVariant = colors[selectedIndex]

  const displayImages = (currentColorVariant && currentColorVariant.images && currentColorVariant.images.length > 0)
    ? currentColorVariant.images
    : (product.images && product.images.length > 0 ? product.images : [product.image].filter(Boolean))

  const displayStock = currentColorVariant?.stock !== undefined ? currentColorVariant.stock : (product.stock || 0)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h3 className="font-bold text-gray-900 text-lg">Product Details</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition"><X size={20} /></button>
        </div>

        <div className="p-6 space-y-5">
          {/* Images */}
          <div>
            <h4 className="font-bold text-gray-900 text-sm mb-2 flex items-center gap-1.5"><ImageIcon size={16} className="text-gray-400"/> Product Images</h4>
            <div className="flex flex-wrap gap-3">
              {displayImages.map((img, idx) => (
                <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-gray-200">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  {idx === 0 && <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[8px] font-bold text-center py-0.5">MAIN</span>}
                </div>
              ))}
              {!displayImages.length && <p className="text-gray-500 text-sm">No images available</p>}
            </div>
          </div>

          <div className="border-t border-gray-100 pt-5">
            <div className="flex items-start justify-between gap-2">
              <p className="font-bold text-gray-900 text-xl leading-tight">{product.name}</p>
            </div>
            <div className="flex items-baseline gap-3 mt-2">
              <p className="font-bold text-purple-600 text-2xl">₹{product.price?.toLocaleString('en-IN')}</p>
              {product.originalPrice && product.originalPrice > product.price && (
                <p className="font-semibold text-gray-400 text-sm line-through">MRP ₹{product.originalPrice?.toLocaleString('en-IN')}</p>
              )}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${stockBadge(displayStock)}`}>
                {displayStock === 0 ? 'Out of stock' : `${displayStock} in stock`}
              </span>
              {product.isBestSeller && (
                <span className="flex items-center gap-1 bg-amber-50 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-amber-200">
                  <Star size={12} className="fill-amber-500 text-amber-500"/> Best Seller
                </span>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2.5 text-sm">
              <Tag size={15} className="text-gray-400 shrink-0" />
              <span className="text-gray-500 font-medium w-20">Brand:</span>
              <span className="text-gray-900 font-semibold">{product.brand_name || product.brand || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm">
              <Box size={15} className="text-gray-400 shrink-0" />
              <span className="text-gray-500 font-medium w-20">Category:</span>
              <span className="text-gray-900 font-semibold">{product.category?.replace(/-/g, ' ') || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm">
              <Package size={15} className="text-gray-400 shrink-0" />
              <span className="text-gray-500 font-medium w-20">SKU:</span>
              <span className="text-gray-900 font-semibold">{product.sku}</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm">
               <span className="text-gray-500 font-medium w-20 pl-6">Sizes:</span>
               <span className="text-gray-900 font-semibold">{sizes}</span>
            </div>
          </div>

          {/* Colors */}
          {colors.length > 0 && (
            <div>
              <h4 className="font-bold text-gray-900 text-sm mb-2">Colors</h4>
              <div className="flex flex-wrap gap-2">
                {colors.map((c, idx) => (
                  <button 
                    type="button"
                    key={idx} 
                    onClick={() => setSelectedIndex(idx)}
                    className={`flex items-center gap-2 border rounded-full px-2.5 py-1 transition-all ${selectedIndex === idx ? 'border-purple-600 bg-purple-50' : 'bg-gray-50 border-gray-200 hover:border-purple-300'}`}
                  >
                    <div className="w-4 h-4 rounded-full border border-gray-200 shrink-0" style={getSwatchStyle(c, idx)} />
                    <span className={`text-xs font-semibold ${selectedIndex === idx ? 'text-purple-700' : 'text-gray-700'}`}>
                      {c.name} {c.stock !== undefined ? `(${c.stock})` : ''}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {product.description && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText size={16} className="text-gray-400" />
                <h4 className="font-bold text-gray-900 text-sm">Description</h4>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed bg-gray-50 p-4 rounded-xl whitespace-pre-wrap">
                {product.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
