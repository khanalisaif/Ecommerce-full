import { useMemo } from 'react'
import { ChevronRight } from 'lucide-react'

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  const pageNumbers = useMemo(() => {
    const pages = []
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else if (currentPage <= 4) {
      pages.push(1, 2, 3, '...', totalPages)
    } else if (currentPage >= totalPages - 3) {
      pages.push(1, '...', totalPages - 2, totalPages - 1, totalPages)
    } else {
      pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages)
    }
    return pages
  }, [currentPage, totalPages])

  if (totalPages <= 1) return null

  const goPage = (p) => {
    if (p === '...') return
    onPageChange(p)
  }

  return (
    <div className="flex justify-center items-center gap-2 py-4">
      <button
        onClick={() => goPage(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="w-8 h-8 rounded-full bg-white border border-gray-200 text-gray-600 hover:text-purple-600 hover:border-purple-600 flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <ChevronRight size={16} className="rotate-180" />
      </button>

      {pageNumbers.map((p, idx) =>
        p === '...' ? (
          <span key={`dot-${idx}`} className="w-8 text-center text-gray-400 text-sm font-bold">...</span>
        ) : (
          <button
            key={p}
            onClick={() => goPage(p)}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold transition-colors ${
              currentPage === p
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'bg-white border border-gray-200 text-gray-700 hover:border-purple-500 hover:text-purple-600'
            }`}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => goPage(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="w-8 h-8 rounded-full bg-white border border-gray-200 text-gray-600 hover:text-purple-600 hover:border-purple-600 flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  )
}
