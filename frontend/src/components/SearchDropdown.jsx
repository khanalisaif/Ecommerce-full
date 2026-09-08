import { Search } from 'lucide-react'
import { useShop } from '../context/ShopContext'

export default function SearchDropdown({ query = '', onPick, onViewAll }) {
  const { popularSearches, categories } = useShop()
  const trimmedQuery = query.trim()

  // Use real DB categories (up to 5) for the "Top Categories" section
  const topCategories = categories.slice(0, 5)

  return (
    <div
      className="absolute left-0 right-0 top-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg p-4 z-50"
      onMouseDown={(e) => e.preventDefault()}
    >
      <div className="grid grid-cols-2 gap-6">
        {/* Popular Searches */}
        <div>
          <h3 className="font-bold text-gray-900 text-sm mb-3">Popular Searches</h3>
          <div className="space-y-2">
            {popularSearches.map((term) => (
              <button
                key={term}
                onClick={() => onPick(term)}
                className="flex items-center gap-2 text-gray-700 hover:text-purple-600 text-sm w-full text-left"
              >
                <Search size={14} className="text-gray-400 flex-shrink-0" />
                <span className="truncate">{term}</span>
              </button>
            ))}
          </div>
          {trimmedQuery && (
            <button
              onClick={onViewAll}
              className="text-purple-600 text-sm font-bold mt-3 hover:underline"
            >
              View all results for "{trimmedQuery}" →
            </button>
          )}
        </div>

        {/* Top Categories — real data from backend */}
        <div>
          <h3 className="font-bold text-gray-900 text-sm mb-3">Top Categories</h3>
          <div className="space-y-2">
            {topCategories.map((cat) => (
              <button
                key={cat._id || cat.id || cat.name}
                onClick={() => onPick(cat.name)}
                className="flex items-center gap-3 text-gray-700 hover:text-purple-600 text-sm w-full text-left"
              >
                {cat.image ? (
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0 bg-gray-100"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-purple-600 text-sm font-bold">{cat.name?.[0]?.toUpperCase()}</span>
                  </div>
                )}
                <span className="truncate">{cat.name}</span>
              </button>
            ))}
            {topCategories.length === 0 && (
              <p className="text-gray-400 text-xs">Loading categories...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
