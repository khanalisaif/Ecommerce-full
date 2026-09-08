import { useState } from 'react'
import { Megaphone, Search, X, Plus } from 'lucide-react'
import { useShop } from '../../../context/ShopContext'
import ColorPickerModal from '../ColorPickerModal'

export default function TopbarTab() {
  const { topbarSettings, updateTopbarSettings, popularSearches, addPopularSearch, removePopularSearch, showToast } = useShop()
  const [newTerm, setNewTerm] = useState('')
  const [pickerContext, setPickerContext] = useState(null)

  const handleAddTerm = (e) => {
    e.preventDefault()
    if (!newTerm.trim()) return
    addPopularSearch(newTerm)
    setNewTerm('')
    showToast('Search term added')
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start w-full">
      {/* Announcement bar */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-1">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)' }}
          >
            <Megaphone size={18} className="text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Announcement Bar</h3>
            <p className="text-gray-500 text-sm">Thin strip shown above the navbar on every page</p>
          </div>
        </div>

        <div className="flex items-center justify-between py-3 border-t border-gray-100 mt-3">
          <span className="text-sm text-gray-600 font-medium">Show announcement bar</span>
          <button
            type="button"
            onClick={() => updateTopbarSettings({ announcementEnabled: !topbarSettings.announcementEnabled })}
            className="w-11 h-6 rounded-full p-0.5 transition-colors"
            style={{ background: topbarSettings.announcementEnabled ? 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)' : '#e5e7eb' }}
          >
            <div
              className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${topbarSettings.announcementEnabled ? 'translate-x-5' : 'translate-x-0'}`}
            />
          </button>
        </div>

        <div className="pt-3 border-t border-gray-100">
          <label className="block text-gray-800 font-semibold text-sm mb-1.5">Message</label>
          <input
            value={topbarSettings.announcementText}
            onChange={(e) => updateTopbarSettings({ announcementText: e.target.value })}
            placeholder="e.g. Free shipping on orders above ₹999"
            className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-500"
          />
          {topbarSettings.announcementEnabled && topbarSettings.announcementText && (
              <div
                className="mt-3 text-white text-center text-xs font-semibold py-2 rounded-lg"
                style={{
                  background: topbarSettings.announcementBgType === 'gradient'
                    ? `linear-gradient(135deg, ${topbarSettings.announcementBgColor1} 0%, ${topbarSettings.announcementBgColor2} 100%)`
                    : topbarSettings.announcementBgColor1
                }}
              >
              {topbarSettings.announcementText}
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-gray-100 mt-3 flex items-center gap-4">
          <div>
            <label className="block text-gray-800 font-semibold text-sm mb-1.5">Background Style</label>
            <div className="flex bg-gray-100 rounded-lg p-0.5">
              <button 
                onClick={() => updateTopbarSettings({ announcementBgType: 'solid' })} 
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${topbarSettings.announcementBgType === 'solid' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500'}`}
              >
                Solid
              </button>
              <button 
                onClick={() => updateTopbarSettings({ announcementBgType: 'gradient' })} 
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${topbarSettings.announcementBgType === 'gradient' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500'}`}
              >
                2 Colors
              </button>
              <button 
                onClick={() => updateTopbarSettings({ announcementBgType: 'gradient3' })} 
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${topbarSettings.announcementBgType === 'gradient3' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500'}`}
              >
                3 Colors
              </button>
            </div>
          </div>
          
          <div className="flex-1 flex gap-2 pt-5">
            <div 
               onClick={() => setPickerContext('color1')}
               className="w-10 h-10 rounded-lg border-2 border-gray-200 cursor-pointer shadow-sm hover:border-purple-400 transition-colors flex shrink-0"
               style={{ backgroundColor: topbarSettings.announcementBgColor1 }}
            />
            {(topbarSettings.announcementBgType === 'gradient' || topbarSettings.announcementBgType === 'gradient3') && (
              <div 
                 onClick={() => setPickerContext('color2')}
                 className="w-10 h-10 rounded-lg border-2 border-gray-200 cursor-pointer shadow-sm hover:border-purple-400 transition-colors flex shrink-0"
                 style={{ backgroundColor: topbarSettings.announcementBgColor2 }}
              />
            )}
            {topbarSettings.announcementBgType === 'gradient3' && (
              <div 
                 onClick={() => setPickerContext('color3')}
                 className="w-10 h-10 rounded-lg border-2 border-gray-200 cursor-pointer shadow-sm hover:border-purple-400 transition-colors flex shrink-0"
                 style={{ backgroundColor: topbarSettings.announcementBgColor3 }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Popular searches */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-1">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)' }}
          >
            <Search size={18} className="text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Popular Searches</h3>
            <p className="text-gray-500 text-sm">Suggested terms shown when someone taps the search bar</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          {popularSearches.map((term) => (
            <span
              key={term}
              className="flex items-center gap-1.5 bg-purple-50 text-purple-700 text-xs font-semibold px-3 py-1.5 rounded-full"
            >
              {term}
              <button onClick={() => removePopularSearch(term)} className="text-purple-400 hover:text-purple-700">
                <X size={13} />
              </button>
            </span>
          ))}
          {!popularSearches.length && <p className="text-gray-400 text-sm">No search terms added yet</p>}
        </div>

        <form onSubmit={handleAddTerm} className="flex gap-2 mt-4">
          <input
            value={newTerm}
            onChange={(e) => setNewTerm(e.target.value)}
            placeholder="Add a search term..."
            className="flex-1 px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-500"
          />
          <button
            type="submit"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold text-white whitespace-nowrap transition-all hover:shadow-lg"
            style={{ background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)' }}
          >
            <Plus size={16} /> Add
          </button>
        </form>
      </div>

      {pickerContext && (
        <ColorPickerModal 
           requireName={false}
           onClose={() => setPickerContext(null)}
           onAdd={({ hex }) => {
             if (hex) {
               if (pickerContext === 'color1') updateTopbarSettings({ announcementBgColor1: hex })
               else if (pickerContext === 'color2') updateTopbarSettings({ announcementBgColor2: hex })
               else updateTopbarSettings({ announcementBgColor3: hex })
             }
             setPickerContext(null)
           }}
        />
      )}
    </div>
  )
}
