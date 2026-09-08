import { useState } from 'react'
import { Truck, ShieldCheck, Headphones, MessageCircle, Instagram, Facebook, Twitter, Linkedin, Lock, RotateCcw, Box, Gift, Sparkles } from 'lucide-react'
import Logo from './Logo'
import { useShop } from '../context/ShopContext'
import { useNavigate } from 'react-router-dom'

const trustIconComponents = { ShieldCheck, Truck, Headphones, Lock, RotateCcw, Box, Gift, Sparkles }

const socialIconMap = {
  instagram: { icon: Instagram, label: 'in' },
  facebook: { icon: Facebook, label: 'f' },
  twitter: { icon: Twitter, label: 'x' },
  linkedin: { icon: Linkedin, label: 'p' },
}

export default function Footer({ showFeatures = true }) {
  const {
    showToast, isChatOpen, setIsChatOpen,
    footerSettings, footerShopLinks, footerCategoryLinks, pages, faqs, trustBadges,
  } = useShop()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleSubscribe = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email.trim()) return showToast('Please enter your email address')
    if (!emailRegex.test(email)) return showToast('Please enter a valid email address')
    setSubscribed(true)
    setEmail('')
    showToast('🎉 You are now subscribed to our newsletter!')
  }

  const activeSocialLinks = Object.entries(footerSettings.social || {}).filter(([, url]) => url)

  return (
    <>
      {/* ── Features Bar (all pages except Login/Signup) ── */}
      {showFeatures && (
        <section className="bg-white border-t border-b border-gray-100 py-6">
          <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-gray-200">
              {trustBadges.map(({ id, icon, title, desc }) => {
                const Icon = trustIconComponents[icon] || ShieldCheck
                return (
                  <div key={id} className="flex items-center gap-4 py-5 md:py-0 px-4 md:px-8">
                    <Icon size={30} strokeWidth={1.5} className="text-gray-700 flex-shrink-0" />
                    <div>
                      <h3 className="font-bold text-gray-900 text-[15px] leading-tight">{title}</h3>
                      <p className="text-gray-600 text-[12.5px] leading-tight mt-0.5">{desc}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className="bg-white border-t border-gray-200 py-8 md:py-12">
        <div className="w-full px-4 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-8 mb-8">
            {/* Brand */}
            <div>
              <Logo size="sm" />
              <p className="text-gray-600 text-xs md:text-sm mt-4">{footerSettings.tagline}</p>
              <p className="text-gray-400 text-xs mt-3">{footerSettings.description}</p>
            </div>

            {/* Shop Links */}
            <div>
              <h4 className="font-bold text-gray-900 mb-4 text-sm md:text-base">Shop</h4>
              <ul className="space-y-2 text-xs md:text-sm text-gray-600">
                {footerShopLinks.map((item) => (
                  <li key={item.id}>
                    <button 
                      onClick={() => navigate('/category/' + item.slug)} 
                      className="hover:text-primary-600 transition-colors text-left"
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Categories */}
            <div>
              <h4 className="font-bold text-gray-900 mb-4 text-sm md:text-base">Categories</h4>
              <ul className="space-y-2 text-xs md:text-sm text-gray-600">
                {footerCategoryLinks.map((cat) => (
                  <li key={cat.id}>
                    <button 
                      onClick={() => navigate('/category/' + cat.slug)} 
                      className="hover:text-primary-600 transition-colors text-left"
                    >
                      {cat.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-bold text-gray-900 mb-4 text-sm md:text-base">Help & Support</h4>
              <ul className="space-y-2 text-xs md:text-sm text-gray-600">
                {faqs.length > 0 && (
                  <li>
                    <button
                      onClick={() => { window.scrollTo({ top: 0, behavior: 'instant' }); navigate('/faq') }}
                      className="hover:text-primary-600 transition-colors text-left"
                    >
                      FAQs
                    </button>
                  </li>
                )}
                {pages.map((page) => (
                  <li key={page.id}>
                    <button
                      onClick={() => { window.scrollTo({ top: 0, behavior: 'instant' }); navigate('/info/' + page.slug) }}
                      className="hover:text-primary-600 transition-colors text-left"
                    >
                      {page.title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h4 className="font-bold text-gray-900 mb-4 text-sm md:text-base">Stay Updated</h4>
              <p className="text-gray-500 text-xs mb-3">Subscribe to get special offers, free tips & exclusive wellness updates.</p>
              {subscribed ? (
                <p className="text-green-600 font-bold text-sm py-2">✅ You're subscribed! Thank you.</p>
              ) : (
                <div className="flex gap-2 mb-4">
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSubscribe()}
                    placeholder="Enter your email address"
                    className="flex-1 px-3 py-2 border-2 border-gray-300 rounded text-xs md:text-sm focus:outline-none focus:border-purple-600"
                  />
                  <button onClick={handleSubscribe} className="bg-purple-600 text-white px-3 md:px-4 py-2 rounded hover:bg-purple-700 transition-all font-bold text-sm">→</button>
                </div>
              )}
              <p className="text-gray-500 text-xs">🔒 We respect your privacy. Unsubscribe anytime.</p>
            </div>
          </div>

          {/* Bottom */}
          <div className="border-t border-gray-200 pt-6 md:pt-8">
            {activeSocialLinks.length > 0 && (
              <div className="flex gap-4 mb-4 md:mb-6 text-gray-400 text-sm md:text-base">
                {activeSocialLinks.map(([key, url]) => {
                  const social = socialIconMap[key]
                  if (!social) return null
                  const Icon = social.icon
                  return (
                    <a key={key} href={url} target="_blank" rel="noopener noreferrer" className="hover:text-primary-600 transition-colors">
                      <Icon size={18} />
                    </a>
                  )
                })}
              </div>
            )}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-500 text-xs md:text-sm">{footerSettings.copyrightText}</p>
              <div className="flex gap-2 text-xs font-bold">
                <span className="border border-gray-300 rounded px-2 py-1 text-blue-700">VISA</span>
                <span className="border border-gray-300 rounded px-2 py-1 text-orange-600">Mastercard</span>
                <span className="border border-gray-300 rounded px-2 py-1 text-blue-600">RuPay</span>
                <span className="border border-gray-300 rounded px-2 py-1 text-indigo-600">PayPal</span>
                <span className="border border-gray-300 rounded px-2 py-1 text-gray-800">Pay</span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* ── Floating Chat Button (all pages except Login/Signup) ── */}
      {showFeatures && !isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-6 right-6 bg-purple-600 hover:bg-purple-700 text-white px-5 py-3 rounded-full shadow-[0_4px_20px_rgba(91,50,209,0.4)] flex items-center gap-2 font-bold text-[14px] transition-all hover:scale-105 z-40"
        >
          <MessageCircle size={18} /> Chat with us
        </button>
      )}
    </>
  )
}
