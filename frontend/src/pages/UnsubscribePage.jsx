import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle2, XCircle, Loader2, ArrowRight, Mail } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { unsubscribeNewsletter, subscribeNewsletter } from '../services/subscribeService'
import { useShop } from '../context/ShopContext'

export default function UnsubscribePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const statusParam = searchParams.get('status')
  const { showToast } = useShop()

  const [status, setStatus] = useState(() => {
    if (statusParam === 'success') return 'success'
    if (statusParam === 'invalid') return 'error'
    if (token) return 'loading'
    return 'idle'
  })

  const [resubscribeEmail, setResubscribeEmail] = useState('')
  const [resubscribing, setResubscribing] = useState(false)
  const [resubscribed, setResubscribed] = useState(false)

  useEffect(() => {
    if (statusParam === 'success') {
      setStatus('success')
      return
    }
    if (statusParam === 'invalid') {
      setStatus('error')
      return
    }

    if (token) {
      setStatus('loading')
      unsubscribeNewsletter(token)
        .then(() => {
          setStatus('success')
        })
        .catch(() => {
          setStatus('error')
        })
    } else if (!statusParam) {
      setStatus('idle')
    }
  }, [token, statusParam])

  const handleResubscribe = async (e) => {
    e.preventDefault()
    if (!resubscribeEmail.trim()) return
    setResubscribing(true)
    try {
      await subscribeNewsletter(resubscribeEmail.trim(), 'unsubscribe_page')
      setResubscribed(true)
      showToast('Successfully re-subscribed to updates!', 'success')
    } catch (err) {
      showToast(err.message || 'Failed to re-subscribe', 'error')
    } finally {
      setResubscribing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="bg-white max-w-md w-full rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
          {/* Logo badge */}
          <div className="inline-block bg-gradient-to-r from-purple-600 to-pink-500 text-white font-black text-lg px-5 py-2 rounded-xl mb-6 shadow-md tracking-wider">
            HASHTELICOM
          </div>

          {status === 'loading' && (
            <div className="py-8">
              <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Unsubscribing...</h2>
              <p className="text-gray-500 text-sm">Please wait while we update your email preferences.</p>
            </div>
          )}

          {status === 'success' && (
            <div>
              <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={38} strokeWidth={2.5} />
              </div>
              <h2 className="text-2xl font-extrabold text-gray-900 mb-2">You're Unsubscribed</h2>
              <p className="text-gray-600 text-sm leading-relaxed mb-6">
                You have been successfully removed from our promotional email list. You won't receive marketing emails or newsletter offers from us anymore.
              </p>

              <button
                onClick={() => navigate('/')}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-bold py-3 px-6 rounded-full transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                Return to Shop <ArrowRight size={18} />
              </button>

              {/* Resubscribe box */}
              <div className="mt-8 pt-6 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-3 font-medium">Changed your mind or unsubscribed by accident?</p>
                {resubscribed ? (
                  <p className="text-sm font-semibold text-green-600">🎉 Thanks! You are subscribed again.</p>
                ) : (
                  <form onSubmit={handleResubscribe} className="flex gap-2">
                    <input
                      type="email"
                      required
                      value={resubscribeEmail}
                      onChange={(e) => setResubscribeEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="flex-1 px-3.5 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-purple-400"
                    />
                    <button
                      type="submit"
                      disabled={resubscribing}
                      className="bg-purple-50 text-purple-700 hover:bg-purple-100 font-semibold px-4 py-2 rounded-xl text-sm transition-colors flex items-center gap-1.5"
                    >
                      {resubscribing ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
                      Re-join
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}

          {status === 'error' && (
            <div>
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle size={38} strokeWidth={2.5} />
              </div>
              <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Invalid Link</h2>
              <p className="text-gray-600 text-sm leading-relaxed mb-6">
                This unsubscribe link is invalid or has already been used. If you still receive unwanted emails, please contact support.
              </p>
              <button
                onClick={() => navigate('/')}
                className="w-full bg-gray-900 hover:bg-black text-white font-bold py-3 px-6 rounded-full transition-colors flex items-center justify-center gap-2"
              >
                Return to Store <ArrowRight size={18} />
              </button>
            </div>
          )}

          {status === 'idle' && (
            <div>
              <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail size={32} />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Email Preferences</h2>
              <p className="text-gray-500 text-sm mb-6">
                To unsubscribe, please use the direct link provided in the footer of any promotional email you received from us.
              </p>
              <button
                onClick={() => navigate('/')}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-full transition-colors"
              >
                Go to Homepage
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
