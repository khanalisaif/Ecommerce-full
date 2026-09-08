import { useState, useEffect } from 'react'
import { Plus, Trash2, Save, Tags, Palette, Ruler, CheckCircle, Percent, DollarSign } from 'lucide-react'
import { useShop } from '../../../context/ShopContext'

export default function CategoryFiltersTab() {
  const { categories, categoryConfigs, updateCategoryConfig, showToast } = useShop()
  const [activeSlug, setActiveSlug] = useState('')

  useEffect(() => {
    if (!activeSlug && categories.length > 0) {
      setActiveSlug(categories[0].slug)
    }
  }, [categories, activeSlug])

  // Local state for the form
  const [brands, setBrands] = useState([])
  const [colors, setColors] = useState([])
  const [sizes, setSizes] = useState([])
  const [discounts, setDiscounts] = useState([])
  const [ratings, setRatings] = useState([])
  const [priceRange, setPriceRange] = useState({ min: 0, max: 99999 })
  const [sidebarGroups, setSidebarGroups] = useState([])

  // Load config into local state when category changes
  useEffect(() => {
    if (!activeSlug) return
    const config = categoryConfigs[activeSlug] || {}
    setBrands([...(config.brands || [])])
    setColors([...(config.colors || [])])
    
    // sizes might be objects {label, count} or strings. Extract strings.
    const sizeArr = (config.sizes || []).map(s => typeof s === 'string' ? s : s.label)
    setSizes(sizeArr)
    
    setDiscounts([...(config.discounts || [])])
    setRatings([...(config.ratings || [])])
    setPriceRange({ min: config.priceRange?.min ?? 0, max: config.priceRange?.max ?? 99999 })
    
    // Deep clone sidebar categories
    const groups = (config.sidebarCategories || []).map(g => ({
      name: g.name,
      sub: (g.sub || []).map(s => ({ name: s.name })) // drop the count
    }))
    setSidebarGroups(groups)
  }, [activeSlug, categoryConfigs])

  const handleSave = () => {
    const cleanList = (list) => list.map(s => s.trim()).filter(Boolean)
    
    updateCategoryConfig(activeSlug, {
      brands: cleanList(brands),
      colors: cleanList(colors),
      sizes: cleanList(sizes),
      discounts: cleanList(discounts),
      ratings: cleanList(ratings),
      priceRange: { min: Number(priceRange.min), max: Number(priceRange.max) },
      sidebarCategories: sidebarGroups
    })
    showToast('Filters updated')
  }

  const addSidebarGroup = () => {
    setSidebarGroups([...sidebarGroups, { name: 'New Group', sub: [] }])
  }

  const updateGroupName = (idx, name) => {
    const newG = [...sidebarGroups]
    newG[idx].name = name
    setSidebarGroups(newG)
  }

  const removeGroup = (idx) => {
    setSidebarGroups(sidebarGroups.filter((_, i) => i !== idx))
  }

  const addSubItem = (gIdx) => {
    const newG = [...sidebarGroups]
    newG[gIdx].sub.push({ name: 'New Item' })
    setSidebarGroups(newG)
  }

  const updateSubItem = (gIdx, sIdx, name) => {
    const newG = [...sidebarGroups]
    newG[gIdx].sub[sIdx].name = name
    setSidebarGroups(newG)
  }

  const removeSubItem = (gIdx, sIdx) => {
    const newG = [...sidebarGroups]
    newG[gIdx].sub = newG[gIdx].sub.filter((_, i) => i !== sIdx)
    setSidebarGroups(newG)
  }

  if (!categories.length) {
    return <div className="p-8 text-center text-gray-500">Please create a category first.</div>
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-5 sm:px-6 py-4 border-b border-gray-100">
        <div>
          <h3 className="font-bold text-gray-900">Category Filters</h3>
          <p className="text-gray-500 text-sm mt-0.5">Manage filter options shown on the category page sidebar.</p>
        </div>
        
        <select 
          value={activeSlug}
          onChange={(e) => setActiveSlug(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 text-sm font-semibold text-gray-800 focus:outline-none focus:border-purple-500 min-w-[200px]"
        >
          {categories.map(c => (
            <option key={c.id} value={c.slug}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="p-6 space-y-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <ListEditor 
              title="Brands" items={brands} onChange={setBrands} 
              icon={Tags} iconColor="text-purple-500" placeholder="Apple, Samsung, Sony..." 
            />
            <ListEditor 
              title="Colors" items={colors} onChange={setColors} 
              icon={Palette} iconColor="text-pink-500" placeholder="Black, White, Red, Blue..." 
            />
            <ListEditor 
              title="Ratings" items={ratings} onChange={setRatings} 
              icon={CheckCircle} iconColor="text-yellow-500" placeholder="4 and above, 3 and above..." 
            />
          </div>

          <div className="space-y-6">
            <ListEditor 
              title="Sizes" items={sizes} onChange={setSizes} 
              icon={Ruler} iconColor="text-blue-500" placeholder="XS, S, M, L, XL..." 
            />
            <ListEditor 
              title="Discounts" items={discounts} onChange={setDiscounts} 
              icon={Percent} iconColor="text-green-500" placeholder="10% and above, 20% and above..." 
            />
            
            <div>
              <label className="flex items-center gap-2 text-gray-800 font-semibold text-sm mb-2">
                <DollarSign size={16} className="text-amber-500" /> Price Range Slider
              </label>
              <div className="flex items-center gap-3 p-4 bg-gray-50/50 border border-gray-100 rounded-xl">
                <div className="flex-1">
                  <label className="text-[11px] text-gray-500 font-bold uppercase block mb-1">Min Price (₹)</label>
                  <input 
                    type="number" value={priceRange.min} onChange={e => setPriceRange({...priceRange, min: e.target.value})}
                    className="w-full text-sm bg-white border border-gray-200 rounded-lg px-3 py-2 focus:border-purple-500 outline-none"
                    placeholder="0"
                  />
                </div>
                <div className="text-gray-400 font-bold mt-4">-</div>
                <div className="flex-1">
                  <label className="text-[11px] text-gray-500 font-bold uppercase block mb-1">Max Price (₹)</label>
                  <input 
                    type="number" value={priceRange.max} onChange={e => setPriceRange({...priceRange, max: e.target.value})}
                    className="w-full text-sm bg-white border border-gray-200 rounded-lg px-3 py-2 focus:border-purple-500 outline-none"
                    placeholder="99999"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <label className="text-gray-800 font-semibold text-sm">Subcategories (Left Sidebar tree)</label>
              <p className="text-xs text-gray-400">Organize subcategories into expandable groups.</p>
            </div>
            <button 
              onClick={addSidebarGroup}
              className="text-xs font-bold text-purple-600 bg-purple-50 px-3 py-1.5 rounded-lg hover:bg-purple-100 transition-colors flex items-center gap-1"
            >
              <Plus size={14} /> Add Group
            </button>
          </div>

          <div className="space-y-4">
            {sidebarGroups.length === 0 && (
              <div className="text-center py-6 text-sm text-gray-400 border-2 border-dashed border-gray-100 rounded-xl">
                No subcategories added.
              </div>
            )}
            {sidebarGroups.map((group, gIdx) => (
              <div key={gIdx} className="border border-gray-200 rounded-xl p-4 bg-gray-50/50">
                <div className="flex items-center gap-3 mb-3">
                  <input 
                    value={group.name}
                    onChange={(e) => updateGroupName(gIdx, e.target.value)}
                    className="flex-1 font-bold text-sm bg-white border border-gray-300 rounded px-3 py-1.5 focus:border-purple-500 outline-none"
                    placeholder="Group Name (e.g. Clothing)"
                  />
                  <button onClick={() => removeGroup(gIdx)} className="text-red-400 hover:text-red-600 p-1">
                    <Trash2 size={16} />
                  </button>
                </div>
                
                <div className="pl-6 border-l-2 border-purple-100 space-y-2">
                  {group.sub.map((sub, sIdx) => (
                    <div key={sIdx} className="flex items-center gap-2">
                      <input 
                        value={sub.name}
                        onChange={(e) => updateSubItem(gIdx, sIdx, e.target.value)}
                        className="flex-1 text-sm bg-white border border-gray-200 rounded px-3 py-1 focus:border-purple-500 outline-none"
                        placeholder="Sub item (e.g. T-Shirts)"
                      />
                      <button onClick={() => removeSubItem(gIdx, sIdx)} className="text-red-400 hover:text-red-600 p-1">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  <button 
                    onClick={() => addSubItem(gIdx)}
                    className="text-[11px] font-bold text-gray-500 hover:text-purple-600 uppercase flex items-center gap-1 mt-2"
                  >
                    <Plus size={12} /> Add Item
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
      
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:shadow-lg hover:-translate-y-0.5"
          style={{ background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)' }}
        >
          <Save size={16} /> Save Filters
        </button>
      </div>
    </div>
  )
}

function ListEditor({ items, onChange, placeholder, icon: Icon, title, iconColor }) {
  const addItem = () => onChange([...items, ''])
  const updateItem = (idx, val) => {
    const next = [...items]; next[idx] = val; onChange(next)
  }
  const removeItem = (idx) => onChange(items.filter((_, i) => i !== idx))

  return (
    <div>
      <label className="flex items-center gap-2 text-gray-800 font-semibold text-sm mb-2">
        {Icon && <Icon size={16} className={iconColor} />} {title}
      </label>
      <div className="space-y-2 border border-gray-100 rounded-xl p-3 bg-gray-50/50">
        {items.length === 0 && <p className="text-xs text-gray-400 text-center py-2">No items added.</p>}
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <input 
              value={item} onChange={e => updateItem(idx, e.target.value)}
              className="flex-1 text-sm bg-white border border-gray-300 rounded px-3 py-1.5 focus:border-purple-500 outline-none"
              placeholder={placeholder}
            />
            <button onClick={() => removeItem(idx)} className="text-red-400 hover:text-red-600 p-1">
              <X size={14} />
            </button>
          </div>
        ))}
        <button 
          onClick={addItem}
          className="text-[11px] font-bold text-purple-600 bg-purple-50 px-3 py-1.5 rounded-lg hover:bg-purple-100 transition-colors flex items-center gap-1 mt-2"
        >
          <Plus size={12} /> Add Item
        </button>
      </div>
    </div>
  )
}

function X({ size, className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  )
}
