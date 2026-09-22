import { useState, useEffect, useMemo } from 'react'
import { X, Save, Plus, Trash2, Boxes, Copy, Layers } from 'lucide-react'

const QUICK_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size']

// Helper: Extract valid parent size names from product, filtering out any color names
function getProductParentSizes(product) {
  const colorNamesLower = new Set(
    (Array.isArray(product?.colors) ? product.colors : [])
      .map((c) => (typeof c === 'object' ? c.name : String(c)))
      .filter(Boolean)
      .map((n) => n.trim().toLowerCase())
  )

  const names = []
  const add = (rawSize) => {
    const s = String(rawSize || '').trim()
    if (!s) return
    // Ignore any size name that matches a color name
    if (colorNamesLower.has(s.toLowerCase())) return
    if (!names.some((n) => n.toLowerCase() === s.toLowerCase())) {
      names.push(s)
    }
  }

  if (Array.isArray(product?.sizesWithQty)) {
    product.sizesWithQty.forEach((item) => add(item.size))
  }
  if (Array.isArray(product?.sizes)) {
    product.sizes.forEach((item) => {
      if (typeof item === 'object' && item !== null) add(item.size)
      else add(item)
    })
  } else if (typeof product?.sizes === 'string') {
    product.sizes.split(',').forEach(add)
  }

  return names
}

export default function VariantStockModal({ product, onSave, onClose }) {
  const [colors, setColors] = useState([])
  const [sizes, setSizes] = useState([])
  const [selectedColorIdx, setSelectedColorIdx] = useState(0)

  const hasColors = Array.isArray(product?.colors) && product.colors.length > 0
  const parentSizes = useMemo(() => getProductParentSizes(product), [product])

  // Initialize colors & sizes from product prop
  useEffect(() => {
    const colorNamesLower = new Set(
      (Array.isArray(product?.colors) ? product.colors : [])
        .map((c) => (typeof c === 'object' ? c.name : String(c)))
        .filter(Boolean)
        .map((n) => n.trim().toLowerCase())
    )

    if (hasColors) {
      const initialColors = JSON.parse(JSON.stringify(product.colors))

      initialColors.forEach((c, idx) => {
        // Filter out any sizes that accidentally match a color name (e.g. size: 'a')
        const existingColorSizes = (Array.isArray(c.sizes) ? c.sizes : []).filter((s) => {
          const sName = typeof s === 'object' ? s.size : String(s)
          return sName && !colorNamesLower.has(String(sName).trim().toLowerCase())
        })

        const sizeMap = new Map()
        existingColorSizes.forEach((s) => {
          const sName = typeof s === 'object' ? s.size : String(s)
          const sQty = typeof s === 'object' ? Math.max(0, Number(s.qty) || 0) : 0
          if (sName && sName.trim()) {
            sizeMap.set(sName.trim().toUpperCase(), { size: sName.trim(), qty: sQty })
          }
        })

        // Ensure all parent sizes from the product are present in this color
        if (parentSizes.length > 0) {
          parentSizes.forEach((pSize) => {
            const key = pSize.toUpperCase()
            if (!sizeMap.has(key)) {
              let defaultQty = 0
              // For first color, if color had no sizes, adopt matching qty from product.sizesWithQty
              if (existingColorSizes.length === 0 && idx === 0) {
                const match = (product?.sizesWithQty || []).find(
                  (item) => item.size?.trim().toUpperCase() === key
                )
                if (match) defaultQty = Math.max(0, Number(match.qty) || 0)
              }
              sizeMap.set(key, { size: pSize, qty: defaultQty })
            }
          })
        }

        c.sizes = Array.from(sizeMap.values())
        if (c.sizes.length > 0) {
          c.stock = c.sizes.reduce((acc, s) => acc + (s.qty || 0), 0)
        } else {
          c.stock = Math.max(0, Number(c.stock) || 0)
        }
      })

      setColors(initialColors)
      setSelectedColorIdx(0)
    }

    if (!hasColors) {
      let initialSizes = []
      if (Array.isArray(product?.sizesWithQty) && product.sizesWithQty.length > 0) {
        initialSizes = product.sizesWithQty
          .filter((s) => s.size && !colorNamesLower.has(s.size.trim().toLowerCase()))
          .map((s) => ({
            size: s.size.trim(),
            qty: Math.max(0, Number(s.qty) || 0),
          }))
      } else if (Array.isArray(product?.sizes) && product.sizes.length > 0) {
        initialSizes = product.sizes
          .map((s) => {
            if (typeof s === 'object' && s !== null) {
              return { size: (s.size || '').trim(), qty: Math.max(0, Number(s.qty) || 0) }
            }
            return { size: String(s).trim(), qty: 0 }
          })
          .filter((s) => s.size && !colorNamesLower.has(s.size.toLowerCase()))
      } else if (parentSizes.length > 0) {
        initialSizes = parentSizes.map((s) => ({ size: s, qty: 0 }))
      }

      setSizes(initialSizes)
    }
  }, [product, hasColors, parentSizes])

  // Active color reference
  const activeColor = colors[selectedColorIdx] || null
  const activeColorSizes = activeColor?.sizes || []

  // Active color stock: sum of its sizes if defined, else direct color stock
  const activeColorStock = useMemo(() => {
    if (!activeColor) return 0
    if (activeColorSizes.length > 0) {
      return activeColorSizes.reduce((acc, s) => acc + (Number(s.qty) || 0), 0)
    }
    return Number(activeColor.stock) || 0
  }, [activeColor, activeColorSizes])

  // Active Color Direct Stock (when no sizes defined)
  const handleActiveColorDirectStock = (val) => {
    const next = [...colors]
    const num = Math.max(0, Number(val) || 0)
    next[selectedColorIdx] = { ...next[selectedColorIdx], stock: num }
    setColors(next)
  }

  // Active Color Sizes: update quantity
  const updateActiveColorSizeQty = (sizeIdx, val) => {
    const next = [...colors]
    const cur = { ...next[selectedColorIdx] }
    const curSizes = [...(cur.sizes || [])]
    const qty = Math.max(0, Number(val) || 0)
    curSizes[sizeIdx] = { ...curSizes[sizeIdx], qty }
    cur.sizes = curSizes
    cur.stock = curSizes.reduce((sum, s) => sum + (s.qty || 0), 0)
    next[selectedColorIdx] = cur
    setColors(next)
  }

  // Active Color Sizes: update size name
  const updateActiveColorSizeName = (sizeIdx, name) => {
    const next = [...colors]
    const cur = { ...next[selectedColorIdx] }
    const curSizes = [...(cur.sizes || [])]
    curSizes[sizeIdx] = { ...curSizes[sizeIdx], size: name }
    cur.sizes = curSizes
    next[selectedColorIdx] = cur
    setColors(next)
  }

  // Active Color Sizes: add row
  const addSizeRowToActiveColor = (sizeName = '', defaultQty = 0) => {
    const next = [...colors]
    const cur = { ...next[selectedColorIdx] }
    const curSizes = [...(cur.sizes || [])]
    curSizes.push({ size: sizeName, qty: defaultQty })
    cur.sizes = curSizes
    cur.stock = curSizes.reduce((sum, s) => sum + (s.qty || 0), 0)
    next[selectedColorIdx] = cur
    setColors(next)
  }

  // Active Color Sizes: quick add chip
  const addQuickSizeToActiveColor = (quickSize) => {
    const exists = activeColorSizes.some((s) => s.size.trim().toUpperCase() === quickSize.toUpperCase())
    if (exists) return
    addSizeRowToActiveColor(quickSize, 0)
  }

  // Active Color Sizes: remove row
  const removeActiveColorSize = (sizeIdx) => {
    const next = [...colors]
    const cur = { ...next[selectedColorIdx] }
    const curSizes = (cur.sizes || []).filter((_, i) => i !== sizeIdx)
    cur.sizes = curSizes
    cur.stock = curSizes.length > 0
      ? curSizes.reduce((sum, s) => sum + (s.qty || 0), 0)
      : (cur.stock || 0)
    next[selectedColorIdx] = cur
    setColors(next)
  }

  // Copy parent sizes to active color
  const populateParentSizesToActiveColor = () => {
    if (!parentSizes.length) return
    const next = [...colors]
    const cur = { ...next[selectedColorIdx] }
    cur.sizes = parentSizes.map((s) => ({ size: s, qty: 0 }))
    cur.stock = 0
    next[selectedColorIdx] = cur
    setColors(next)
  }

  // Product-level sizes handlers (when product has NO colors)
  const handleSizeQtyChange = (idx, value) => {
    const next = [...sizes]
    next[idx] = { ...next[idx], qty: Math.max(0, Number(value) || 0) }
    setSizes(next)
  }

  const handleSizeNameChange = (idx, value) => {
    const next = [...sizes]
    next[idx] = { ...next[idx], size: value }
    setSizes(next)
  }

  const addProductSizeRow = (sizeName = '', qty = 0) => {
    setSizes((prev) => [...prev, { size: sizeName, qty }])
  }

  const addProductQuickSize = (quickSize) => {
    const exists = sizes.some((s) => s.size.trim().toUpperCase() === quickSize.toUpperCase())
    if (exists) return
    addProductSizeRow(quickSize, 0)
  }

  const removeProductSizeRow = (idx) => {
    setSizes((prev) => prev.filter((_, i) => i !== idx))
  }

  // Total calculated product stock across all colors / sizes
  const totalCalculatedStock = useMemo(() => {
    if (hasColors && colors.length > 0) {
      return colors.reduce((sum, c) => {
        if (Array.isArray(c.sizes) && c.sizes.length > 0) {
          return sum + c.sizes.reduce((acc, s) => acc + (Number(s.qty) || 0), 0)
        }
        return sum + (Number(c.stock) || 0)
      }, 0)
    }
    if (sizes.length > 0) {
      return sizes.reduce((sum, s) => sum + (Number(s.qty) || 0), 0)
    }
    return Math.max(0, Number(product?.stock) || 0)
  }, [hasColors, colors, sizes, product])

  // Save handler: formats payload cleanly
  const handleSave = () => {
    if (hasColors) {
      const cleanedColors = colors.map((c) => {
        const cleanSizes = (c.sizes || [])
          .filter((s) => s.size && s.size.trim())
          .map((s) => ({
            size: s.size.trim(),
            qty: Math.max(0, Number(s.qty) || 0),
          }))
        const cStock = cleanSizes.length > 0
          ? cleanSizes.reduce((acc, s) => acc + s.qty, 0)
          : Math.max(0, Number(c.stock) || 0)
        return {
          ...c,
          sizes: cleanSizes,
          stock: cStock,
        }
      })

      // Aggregate sizes across all colors for global filtering & backward compatibility
      const aggMap = new Map()
      cleanedColors.forEach((c) => {
        c.sizes.forEach((s) => {
          if (s.size) {
            aggMap.set(s.size, (aggMap.get(s.size) || 0) + (s.qty || 0))
          }
        })
      })
      const aggregatedSizes = Array.from(aggMap.entries()).map(([size, qty]) => ({ size, qty }))
      const finalTotalStock = cleanedColors.reduce((sum, c) => sum + (c.stock || 0), 0)

      onSave(product.id, {
        colors: cleanedColors,
        sizes: aggregatedSizes,
        stock: finalTotalStock,
      })
    } else {
      const cleanSizes = sizes
        .filter((s) => s.size && s.size.trim())
        .map((s) => ({
          size: s.size.trim(),
          qty: Math.max(0, Number(s.qty) || 0),
        }))
      const finalTotalStock = cleanSizes.length > 0
        ? cleanSizes.reduce((sum, s) => sum + s.qty, 0)
        : Math.max(0, Number(product?.stock) || 0)

      onSave(product.id, {
        sizes: cleanSizes,
        stock: finalTotalStock,
      })
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs" onClick={onClose}>
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white sticky top-0 z-10">
          <div>
            <h3 className="font-extrabold text-gray-900 text-lg tracking-tight">
              {hasColors ? 'Manage Variants & Stock' : 'Manage Sizes & Stock'}
            </h3>
            <p className="text-xs text-gray-500 font-medium truncate max-w-[320px]">{product?.name}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* TOTAL STOCK BANNER */}
          <div className="bg-gradient-to-r from-purple-50 via-pink-50 to-purple-50 p-3.5 rounded-2xl border border-purple-100/80 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
                  <Boxes size={18} />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-purple-900/80">Total Product Stock</span>
                  <div className="text-xs text-purple-700 font-medium">All variants & sizes combined</div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xl font-black text-purple-900 tracking-tight">{totalCalculatedStock}</span>
                <span className="text-xs font-bold text-purple-700 ml-1">units</span>
              </div>
            </div>

            {/* Colors mini-breakdown pills */}
            {hasColors && colors.length > 0 && (
              <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-purple-100/60 overflow-x-auto scrollbar-none">
                <span className="text-[10px] font-bold text-purple-800 shrink-0">Summary:</span>
                {colors.map((c, idx) => {
                  const cStock = Array.isArray(c.sizes) && c.sizes.length > 0
                    ? c.sizes.reduce((sum, s) => sum + (Number(s.qty) || 0), 0)
                    : (Number(c.stock) || 0)
                  return (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/80 border border-purple-200/60 text-purple-900 shrink-0"
                    >
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.hex || c.name || '#9333ea' }} />
                      <span className="font-bold">{c.name}:</span> {cStock}
                    </span>
                  )
                })}
              </div>
            )}
          </div>

          {/* IF PRODUCT HAS COLORS */}
          {hasColors && (
            <div className="space-y-4">
              {/* COLOR SELECTOR TABS */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-gray-700">
                    1. Select Color ({colors.length} colors)
                  </label>
                  <span className="text-[11px] text-purple-600 font-semibold">
                    Tap a color to view its sizes
                  </span>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
                  {colors.map((c, idx) => {
                    const isSelected = selectedColorIdx === idx
                    const cStock = Array.isArray(c.sizes) && c.sizes.length > 0
                      ? c.sizes.reduce((sum, s) => sum + (Number(s.qty) || 0), 0)
                      : (Number(c.stock) || 0)
                    const isOut = cStock === 0
                    const isLow = cStock > 0 && cStock <= 3

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedColorIdx(idx)}
                        className={`flex items-center gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-bold border transition-all shrink-0 cursor-pointer ${
                          isSelected
                            ? 'bg-purple-50 border-purple-600 text-purple-950 ring-2 ring-purple-300 shadow-sm'
                            : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <span
                          className="w-4 h-4 rounded-full border border-gray-300 shrink-0 shadow-2xs"
                          style={{ backgroundColor: c.hex || c.name || '#6b7280' }}
                        />
                        <span className="truncate max-w-[110px]">{c.name || `Color ${idx + 1}`}</span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            isOut
                              ? 'bg-red-100 text-red-700 border border-red-200'
                              : isLow
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : isSelected
                              ? 'bg-purple-200 text-purple-900'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {cStock} units
                        </span>
                        {isSelected && (
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-pulse" />
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* ACTIVE COLOR EDITING CARD */}
              {activeColor && (
                <div className="bg-gradient-to-b from-purple-50/50 via-white to-white border-2 border-purple-200 rounded-2xl p-4 sm:p-5 space-y-4 shadow-sm">
                  {/* Active Color Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-purple-100">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-7 h-7 rounded-full border border-gray-300 shadow-sm shrink-0"
                        style={{ backgroundColor: activeColor.hex || activeColor.name || '#9333ea' }}
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-purple-700 font-bold uppercase tracking-wider">Active Color:</span>
                          <span className="text-base font-extrabold text-gray-900">{activeColor.name}</span>
                        </div>
                        <p className="text-[11px] text-gray-500 font-medium">
                          {activeColorSizes.length > 0
                            ? `Showing ${activeColorSizes.length} sizes for this color`
                            : 'No sizes configured yet'}
                        </p>
                      </div>
                    </div>

                    {/* Stock indicator / Direct input */}
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                        Color Stock
                      </span>
                      {activeColorSizes.length > 0 ? (
                        <div className="text-base font-black text-purple-700">
                          {activeColorStock} <span className="text-xs font-semibold text-gray-500">units</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <input
                            type="number"
                            min="0"
                            value={activeColor.stock ?? 0}
                            onChange={(e) => handleActiveColorDirectStock(e.target.value)}
                            className="w-20 px-2 py-1 text-center font-bold text-sm border-2 border-purple-300 rounded-lg bg-white focus:outline-none focus:border-purple-600"
                          />
                          <span className="text-xs font-bold text-gray-500">units</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* QUICK ADD SIZES BAR */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="text-[11px] font-extrabold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                        <Layers size={13} className="text-purple-600" />
                        Sizes for "{activeColor.name}"
                      </span>
                      <div className="flex items-center gap-2">
                        {parentSizes.length > 0 && activeColorSizes.length === 0 && (
                          <button
                            type="button"
                            onClick={populateParentSizesToActiveColor}
                            className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1 bg-purple-100 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                          >
                            <Copy size={11} /> Load Product Sizes ({parentSizes.join(', ')})
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => addSizeRowToActiveColor('', 0)}
                          className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1 bg-purple-100/80 hover:bg-purple-200/80 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                        >
                          <Plus size={13} /> Add Custom Size
                        </button>
                      </div>
                    </div>

                    {/* Quick Add Chips */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] text-gray-400 font-semibold shrink-0">Quick Add:</span>
                      {QUICK_SIZES.map((qSize) => {
                        const alreadyAdded = activeColorSizes.some(
                          (s) => s.size.trim().toUpperCase() === qSize.toUpperCase()
                        )
                        return (
                          <button
                            key={qSize}
                            type="button"
                            onClick={() => addQuickSizeToActiveColor(qSize)}
                            disabled={alreadyAdded}
                            className={`px-2 py-0.5 text-xs rounded-md font-bold transition-all ${
                              alreadyAdded
                                ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed line-through'
                                : 'bg-white border border-purple-200 text-purple-700 hover:bg-purple-600 hover:text-white hover:border-purple-600 shadow-2xs cursor-pointer'
                            }`}
                            title={alreadyAdded ? `${qSize} already exists in this color` : `Add size ${qSize}`}
                          >
                            +{qSize}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* SIZES TABLE FOR ACTIVE COLOR */}
                  {activeColorSizes.length > 0 ? (
                    <div className="space-y-2">
                      <div className="grid grid-cols-12 gap-2 text-[11px] font-bold text-gray-500 uppercase px-2">
                        <span className="col-span-5">Size Name</span>
                        <span className="col-span-5 text-center">Stock Quantity</span>
                        <span className="col-span-2 text-center">Remove</span>
                      </div>

                      <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                        {activeColorSizes.map((s, sIdx) => {
                          const isOut = s.qty === 0
                          const isLow = s.qty > 0 && s.qty <= 3

                          return (
                            <div
                              key={sIdx}
                              className="grid grid-cols-12 gap-2 items-center bg-white p-2 rounded-xl border border-gray-200 shadow-2xs hover:border-purple-300 transition-colors"
                            >
                              <div className="col-span-5">
                                <input
                                  type="text"
                                  placeholder="e.g. S, M, L"
                                  value={s.size}
                                  onChange={(e) => updateActiveColorSizeName(sIdx, e.target.value)}
                                  className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs font-bold text-gray-900 bg-gray-50/60 focus:bg-white focus:outline-none focus:border-purple-500"
                                />
                              </div>

                              <div className="col-span-5">
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => updateActiveColorSizeQty(sIdx, Math.max(0, (Number(s.qty) || 0) - 1))}
                                    className="w-7 h-7 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 flex items-center justify-center font-bold text-gray-600 text-xs transition-colors shrink-0 cursor-pointer"
                                  >
                                    -
                                  </button>
                                  <input
                                    type="number"
                                    min="0"
                                    value={s.qty}
                                    onChange={(e) => updateActiveColorSizeQty(sIdx, e.target.value)}
                                    className={`w-full px-1 py-1 text-xs text-center border rounded-lg font-extrabold focus:outline-none ${
                                      isOut
                                        ? 'border-red-300 bg-red-50 text-red-700'
                                        : isLow
                                        ? 'border-amber-300 bg-amber-50 text-amber-800'
                                        : 'border-gray-200 bg-white text-gray-900 focus:border-purple-500'
                                    }`}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => updateActiveColorSizeQty(sIdx, (Number(s.qty) || 0) + 1)}
                                    className="w-7 h-7 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 flex items-center justify-center font-bold text-gray-600 text-xs transition-colors shrink-0 cursor-pointer"
                                  >
                                    +
                                  </button>
                                </div>
                                {isOut ? (
                                  <span className="text-[9px] text-red-600 block text-center font-bold mt-0.5">
                                    Out of stock
                                  </span>
                                ) : isLow ? (
                                  <span className="text-[9px] text-amber-600 block text-center font-bold mt-0.5">
                                    Low stock ({s.qty})
                                  </span>
                                ) : null}
                              </div>

                              <div className="col-span-2 flex justify-center">
                                <button
                                  type="button"
                                  onClick={() => removeActiveColorSize(sIdx)}
                                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                  title="Delete size"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white/90 border border-dashed border-purple-200 rounded-xl p-4 text-center space-y-3">
                      <div className="text-xs text-gray-600 font-medium">
                        No sizes configured for Color <strong>"{activeColor.name}"</strong> yet.
                      </div>
                      <p className="text-[11px] text-gray-400">
                        Current direct color stock is <strong>{activeColor.stock || 0} units</strong>. Tap a quick size above (+S, +M, +L...) or click below to populate sizes!
                      </p>
                      {parentSizes.length > 0 && (
                        <button
                          type="button"
                          onClick={populateParentSizesToActiveColor}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-xs font-bold transition-colors border border-purple-200 cursor-pointer shadow-2xs"
                        >
                          <Copy size={12} /> Load Product Sizes ({parentSizes.join(', ')})
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* IF PRODUCT HAS NO COLORS (SIZES ONLY) */}
          {!hasColors && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700">
                    Product Sizes & Stock Breakdown
                  </label>
                  <p className="text-[11px] text-gray-500">Manage stock quantities for each size</p>
                </div>
                <button
                  type="button"
                  onClick={() => addProductSizeRow('', 0)}
                  className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1 bg-purple-100/80 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                >
                  <Plus size={13} /> Add Size
                </button>
              </div>

              {/* Quick Add Chips */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] text-gray-400 font-semibold shrink-0">Quick Add:</span>
                {QUICK_SIZES.map((qSize) => {
                  const alreadyAdded = sizes.some((s) => s.size.trim().toUpperCase() === qSize.toUpperCase())
                  return (
                    <button
                      key={qSize}
                      type="button"
                      onClick={() => addProductQuickSize(qSize)}
                      disabled={alreadyAdded}
                      className={`px-2 py-0.5 text-xs rounded-md font-bold transition-all ${
                        alreadyAdded
                          ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed line-through'
                          : 'bg-white border border-purple-200 text-purple-700 hover:bg-purple-600 hover:text-white hover:border-purple-600 shadow-2xs cursor-pointer'
                      }`}
                    >
                      +{qSize}
                    </button>
                  )
                })}
              </div>

              {/* Sizes Rows */}
              <div className="space-y-2">
                <div className="grid grid-cols-12 gap-2 text-[11px] font-bold text-gray-500 uppercase px-2">
                  <span className="col-span-5">Size Name</span>
                  <span className="col-span-5 text-center">Stock Quantity</span>
                  <span className="col-span-2 text-center">Remove</span>
                </div>

                <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                  {sizes.map((s, idx) => {
                    const isOut = s.qty === 0
                    const isLow = s.qty > 0 && s.qty <= 3

                    return (
                      <div
                        key={idx}
                        className="grid grid-cols-12 gap-2 items-center bg-white p-2 rounded-xl border border-gray-200 shadow-2xs hover:border-purple-300 transition-colors"
                      >
                        <div className="col-span-5">
                          <input
                            type="text"
                            placeholder="e.g. S, M, L"
                            value={s.size}
                            onChange={(e) => handleSizeNameChange(idx, e.target.value)}
                            className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs font-bold text-gray-900 bg-gray-50/60 focus:bg-white focus:outline-none focus:border-purple-500"
                          />
                        </div>

                        <div className="col-span-5">
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleSizeQtyChange(idx, Math.max(0, (Number(s.qty) || 0) - 1))}
                              className="w-7 h-7 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 flex items-center justify-center font-bold text-gray-600 text-xs transition-colors shrink-0 cursor-pointer"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min="0"
                              value={s.qty}
                              onChange={(e) => handleSizeQtyChange(idx, e.target.value)}
                              className={`w-full px-1 py-1 text-xs text-center border rounded-lg font-extrabold focus:outline-none ${
                                isOut
                                  ? 'border-red-300 bg-red-50 text-red-700'
                                  : isLow
                                  ? 'border-amber-300 bg-amber-50 text-amber-800'
                                  : 'border-gray-200 bg-white text-gray-900 focus:border-purple-500'
                              }`}
                            />
                            <button
                              type="button"
                              onClick={() => handleSizeQtyChange(idx, (Number(s.qty) || 0) + 1)}
                              className="w-7 h-7 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 flex items-center justify-center font-bold text-gray-600 text-xs transition-colors shrink-0 cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                          {isOut ? (
                            <span className="text-[9px] text-red-600 block text-center font-bold mt-0.5">
                              Out of stock
                            </span>
                          ) : isLow ? (
                            <span className="text-[9px] text-amber-600 block text-center font-bold mt-0.5">
                              Low stock ({s.qty})
                            </span>
                          ) : null}
                        </div>

                        <div className="col-span-2 flex justify-center">
                          <button
                            type="button"
                            onClick={() => removeProductSizeRow(idx)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete size"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                  {sizes.length === 0 && (
                    <div className="text-center py-6 text-gray-400 text-xs bg-gray-50 rounded-xl border border-dashed border-gray-200">
                      No sizes configured. Tap "+ S", "+ M", or "+ Add Size" above to define sizes.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 sm:p-5 border-t border-gray-100 bg-gray-50/80 flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-full border border-gray-200 bg-white text-gray-700 font-bold text-xs sm:text-sm hover:bg-gray-100 transition-colors shadow-2xs cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 py-2.5 rounded-full text-white font-bold text-xs sm:text-sm transition-all hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            style={{ background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)' }}
          >
            <Save size={16} /> Save Stock ({totalCalculatedStock} units)
          </button>
        </div>
      </div>
    </div>
  )
}
