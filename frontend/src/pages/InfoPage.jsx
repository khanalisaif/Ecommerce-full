import { useParams, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { FileText } from 'lucide-react'
import { useShop } from '../context/ShopContext'

export default function InfoPage() {
  const { slug } = useParams()
  const { getPageBySlug } = useShop()
  const page = getPageBySlug(slug)

  return (
    <div className="min-h-screen bg-gray-50/30 flex flex-col">
      <Navbar />

      <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 md:px-8 py-10 md:py-14">
        {page ? (
          <>
            <div className="text-center mb-10">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)' }}
              >
                <FileText size={24} className="text-white" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{page.title}</h1>
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 md:p-8 space-y-5">
              {page.content.split('\n').filter(Boolean).map((para, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-900 mt-2 shrink-0" />
                  <p className="text-gray-600 text-sm md:text-[15px] leading-relaxed whitespace-pre-line">
                    {para}
                  </p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <h1 className="text-xl font-bold text-gray-900 mb-2">Page not found</h1>
            <p className="text-gray-500 text-sm mb-6">This page may have been removed or doesn't exist.</p>
            <Link to="/" className="text-purple-600 font-semibold text-sm hover:underline">← Back to Home</Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
