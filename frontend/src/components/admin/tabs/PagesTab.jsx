import { useState } from 'react'
import { Plus, Pencil, Trash2, ChevronUp, ChevronDown, HelpCircle, FileText } from 'lucide-react'
import { useShop } from '../../../context/ShopContext'
import FaqFormModal from '../FaqFormModal'
import PageFormModal from '../PageFormModal'

export default function PagesTab() {
  const {
    faqs, addFaq, updateFaq, deleteFaq, reorderFaq,
    pages, addPage, updatePage, deletePage,
    showToast,
  } = useShop()

  const [faqModalOpen, setFaqModalOpen] = useState(false)
  const [editingFaq, setEditingFaq] = useState(null)
  const [faqDeleteTarget, setFaqDeleteTarget] = useState(null)

  const [pageModalOpen, setPageModalOpen] = useState(false)
  const [editingPage, setEditingPage] = useState(null)
  const [pageDeleteTarget, setPageDeleteTarget] = useState(null)

  const handleSaveFaq = (data) => {
    if (editingFaq) {
      updateFaq(editingFaq.id, data)
      showToast('FAQ updated')
    } else {
      addFaq(data)
      showToast('FAQ added')
    }
    setFaqModalOpen(false)
    setEditingFaq(null)
  }

  const handleSavePage = (data) => {
    if (editingPage) {
      updatePage(editingPage.id, data)
      showToast('Page updated')
    } else {
      addPage(data)
      showToast('Page added')
    }
    setPageModalOpen(false)
    setEditingPage(null)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start w-full">
      {/* FAQs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between gap-3 px-5 sm:px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)' }}>
              <HelpCircle size={18} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">FAQs</h3>
              <p className="text-gray-500 text-sm">Shown on the public /faq page</p>
            </div>
          </div>
          <button
            onClick={() => { setEditingFaq(null); setFaqModalOpen(true) }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold text-white whitespace-nowrap transition-all hover:shadow-lg"
            style={{ background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)' }}
          >
            <Plus size={15} /> Add
          </button>
        </div>

        <div className="divide-y divide-gray-50">
          {faqs.map((faq, idx) => (
            <div key={faq.id} className="flex items-start gap-3 px-5 sm:px-6 py-3.5">
              <div className="flex flex-col pt-0.5">
                <button disabled={idx === 0} onClick={() => reorderFaq(faq.id, 'up')} className="text-gray-300 hover:text-purple-600 disabled:opacity-30"><ChevronUp size={13} /></button>
                <button disabled={idx === faqs.length - 1} onClick={() => reorderFaq(faq.id, 'down')} className="text-gray-300 hover:text-purple-600 disabled:opacity-30"><ChevronDown size={13} /></button>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800">{faq.question}</p>
                <p className="text-gray-500 text-sm mt-0.5 line-clamp-2">{faq.answer}</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button onClick={() => { setEditingFaq(faq); setFaqModalOpen(true) }} className="p-1.5 rounded-lg text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-colors"><Pencil size={14} /></button>
                <button onClick={() => setFaqDeleteTarget(faq)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
          {!faqs.length && <div className="px-6 py-8 text-center text-gray-400 text-sm">No FAQs yet</div>}
        </div>
      </div>

      {/* Info pages */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between gap-3 px-5 sm:px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)' }}>
              <FileText size={18} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Info & Policy Pages</h3>
              <p className="text-gray-500 text-sm">Terms, Privacy, Shipping, Returns, Contact, etc.</p>
            </div>
          </div>
          <button
            onClick={() => { setEditingPage(null); setPageModalOpen(true) }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold text-white whitespace-nowrap transition-all hover:shadow-lg"
            style={{ background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)' }}
          >
            <Plus size={15} /> Add
          </button>
        </div>

        <div className="divide-y divide-gray-50">
          {pages.map((page) => (
            <div key={page.id} className="flex items-center gap-3 px-5 sm:px-6 py-3.5">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800">{page.title}</p>
                <p className="text-gray-500 text-sm font-mono">/info/{page.slug}</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button onClick={() => { setEditingPage(page); setPageModalOpen(true) }} className="p-1.5 rounded-lg text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-colors"><Pencil size={14} /></button>
                <button onClick={() => setPageDeleteTarget(page)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
          {!pages.length && <div className="px-6 py-8 text-center text-gray-400 text-sm">No pages yet</div>}
        </div>
      </div>

      {faqModalOpen && (
        <FaqFormModal faq={editingFaq} onClose={() => { setFaqModalOpen(false); setEditingFaq(null) }} onSave={handleSaveFaq} />
      )}
      {pageModalOpen && (
        <PageFormModal page={editingPage} onClose={() => { setPageModalOpen(false); setEditingPage(null) }} onSave={handleSavePage} />
      )}

      {faqDeleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setFaqDeleteTarget(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center" onClick={(e) => e.stopPropagation()}>
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 size={24} className="text-red-500" /></div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Delete this FAQ?</h3>
            <p className="text-gray-500 text-sm mb-6">"{faqDeleteTarget.question}" will be removed.</p>
            <div className="flex gap-3">
              <button onClick={() => setFaqDeleteTarget(null)} className="flex-1 py-2.5 rounded-full border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={() => { deleteFaq(faqDeleteTarget.id); showToast('FAQ deleted'); setFaqDeleteTarget(null) }} className="flex-1 py-2.5 rounded-full bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}

      {pageDeleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setPageDeleteTarget(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center" onClick={(e) => e.stopPropagation()}>
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 size={24} className="text-red-500" /></div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Delete this page?</h3>
            <p className="text-gray-500 text-sm mb-6">"{pageDeleteTarget.title}" will be permanently removed and its footer link will disappear.</p>
            <div className="flex gap-3">
              <button onClick={() => setPageDeleteTarget(null)} className="flex-1 py-2.5 rounded-full border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={() => { deletePage(pageDeleteTarget.id); showToast('Page deleted'); setPageDeleteTarget(null) }} className="flex-1 py-2.5 rounded-full bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
