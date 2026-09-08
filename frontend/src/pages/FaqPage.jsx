import { useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { ChevronDown, HelpCircle } from 'lucide-react'
import { useShop } from '../context/ShopContext'

export default function FaqPage() {
  const { faqs } = useShop()
  const [openId, setOpenId] = useState(faqs[0]?.id || null)

  return (
    <div className="min-h-screen bg-gray-50/30 flex flex-col">
      <Navbar />

      <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 md:px-8 py-10 md:py-14">
        <div className="text-center mb-10">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)' }}
          >
            <HelpCircle size={26} className="text-white" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Frequently Asked Questions</h1>
          <p className="text-gray-500 text-sm mt-2">Everything you need to know before you shop with us</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq) => (
            <div key={faq.id} className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
              <button
                onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
              >
                <span className="font-semibold text-gray-900 text-sm md:text-base">{faq.question}</span>
                <ChevronDown
                  size={18}
                  className={`text-purple-600 shrink-0 transition-transform ${openId === faq.id ? 'rotate-180' : ''}`}
                />
              </button>
              {openId === faq.id && (
                <div className="px-5 pb-4 text-gray-500 text-sm leading-relaxed">{faq.answer}</div>
              )}
            </div>
          ))}
          {!faqs.length && (
            <p className="text-center text-gray-400 text-sm py-10">No FAQs added yet.</p>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
