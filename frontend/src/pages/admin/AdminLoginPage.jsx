import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, ShieldCheck, Loader2, Eye, EyeOff, KeyRound, ArrowLeft, RotateCcw } from 'lucide-react'
import { useShop } from '../../context/ShopContext'
import { useAdminAuth } from '../../context/AdminAuthContext'

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const { siteAssets } = useShop()
  const { login, requestOtpLogin, verifyOtpLogin, isAdminAuthenticated, isAdminAuthLoading } = useAdminAuth()

  const [authMode, setAuthMode] = useState('password') // 'password' | 'otp'
  const [otpStep, setOtpStep] = useState('request') // 'request' | 'verify'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)

  useEffect(() => {
    if (!isAdminAuthLoading && isAdminAuthenticated) {
      navigate('/page/admin/dashboard', { replace: true })
    }
  }, [isAdminAuthenticated, isAdminAuthLoading, navigate])

  // Countdown timer for OTP resend
  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [resendCooldown])

  const clearAlerts = () => {
    setError('')
    setSuccessMessage('')
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    clearAlerts()
    if (!email || !password) {
      setError('Please enter both email and password')
      return
    }
    setIsLoading(true)
    try {
      await login({ email: email.trim(), password })
      navigate('/page/admin/dashboard', { replace: true })
    } catch (err) {
      setError(err.message || 'Invalid credentials')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRequestOtp = async (e) => {
    e.preventDefault()
    clearAlerts()
    if (!email.trim()) {
      setError('Please enter your registered admin email address')
      return
    }
    setIsLoading(true)
    try {
      await requestOtpLogin({ email: email.trim() })
      setOtpStep('verify')
      setResendCooldown(30)
      setSuccessMessage('A 6-digit verification code has been sent to your email.')
    } catch (err) {
      setError(err.message || 'Failed to send OTP')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    clearAlerts()
    if (!otp || otp.trim().length !== 6) {
      setError('Please enter the 6-digit OTP code')
      return
    }
    setIsLoading(true)
    try {
      await verifyOtpLogin({ email: email.trim(), otp: otp.trim() })
      navigate('/page/admin/dashboard', { replace: true })
    } catch (err) {
      setError(err.message || 'Invalid or expired OTP')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || isLoading) return
    clearAlerts()
    setIsLoading(true)
    try {
      await requestOtpLogin({ email: email.trim() })
      setResendCooldown(30)
      setSuccessMessage('A fresh OTP has been sent to your email.')
    } catch (err) {
      setError(err.message || 'Failed to resend OTP')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-8"
      style={{ background: 'linear-gradient(135deg, #581c87 0%, #7e22ce 45%, #ec4899 100%)' }}
    >
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="bg-white/10 backdrop-blur-sm p-3.5 sm:p-4 rounded-2xl mb-3 border border-white/20 shadow-lg">
            <img src={siteAssets.logoUrl} alt="Logo" className="h-9 sm:h-10 w-auto object-contain max-w-[180px]" />
          </div>
          <p className="text-white/75 text-xs tracking-[0.3em] font-semibold uppercase">Admin Panel</p>
        </div>

        {/* Card Container */}
        <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8">
          <div className="text-center mb-6">
            <div
              className="w-13 h-13 sm:w-14 sm:h-14 rounded-full flex items-center justify-center mx-auto mb-3"
              style={{ background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)' }}
            >
              <ShieldCheck size={26} className="text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Admin Sign In</h1>
            <p className="text-gray-500 text-xs sm:text-sm mt-1">
              Secure administrative access for HASHTELICOM
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => {
                setAuthMode('password')
                clearAlerts()
              }}
              className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                authMode === 'password'
                  ? 'bg-white text-purple-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Lock size={14} />
              Password
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('otp')
                setOtpStep('request')
                clearAlerts()
              }}
              className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                authMode === 'otp'
                  ? 'bg-white text-purple-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <KeyRound size={14} />
              Login with OTP
            </button>
          </div>

          {/* Alert Messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs font-medium">
              {error}
            </div>
          )}
          {successMessage && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-xs font-medium">
              {successMessage}
            </div>
          )}

          {/* ── Mode 1: Password Login ───────────────────── */}
          {authMode === 'password' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-800 font-semibold text-xs mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@hashtelicom.com"
                    autoFocus
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors placeholder-gray-400"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-800 font-semibold text-xs mb-1.5">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors placeholder-gray-400"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 rounded-xl text-white font-bold text-sm transition-all duration-300 hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                style={{ background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)' }}
              >
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Login'}
              </button>
            </form>
          )}

          {/* ── Mode 2: OTP Login ────────────────────────── */}
          {authMode === 'otp' && (
            <div>
              {otpStep === 'request' ? (
                <form onSubmit={handleRequestOtp} className="space-y-4">
                  <div>
                    <label className="block text-gray-800 font-semibold text-xs mb-1.5">Registered Admin Email</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="admin@hashtelicom.com"
                        autoFocus
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors placeholder-gray-400"
                        required
                      />
                    </div>
                    <p className="text-[11px] text-gray-500 mt-1.5">
                      We will send a 6-digit one-time password to this email address.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full mt-2 py-3 rounded-xl text-white font-bold text-sm transition-all duration-300 hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                    style={{ background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)' }}
                  >
                    {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Send Login OTP'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="bg-purple-50/60 border border-purple-100 rounded-xl p-3 flex items-center justify-between">
                    <div className="min-w-0 pr-2">
                      <p className="text-[10px] uppercase font-bold text-purple-600 tracking-wider">Sending OTP to</p>
                      <p className="text-xs font-semibold text-gray-800 truncate">{email}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setOtpStep('request')
                        setOtp('')
                        clearAlerts()
                      }}
                      className="text-xs font-bold text-purple-700 hover:underline shrink-0"
                    >
                      Change
                    </button>
                  </div>

                  <div>
                    <label className="block text-gray-800 font-semibold text-xs mb-1.5">Enter 6-Digit OTP</label>
                    <div className="relative">
                      <KeyRound size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        maxLength={6}
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="123456"
                        autoFocus
                        className="w-full pl-10 pr-4 py-2.5 tracking-[0.4em] font-mono text-center text-lg font-bold border border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setOtpStep('request')
                        setOtp('')
                        clearAlerts()
                      }}
                      className="flex items-center gap-1 text-gray-500 hover:text-gray-800 font-semibold"
                    >
                      <ArrowLeft size={13} /> Back
                    </button>

                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={resendCooldown > 0 || isLoading}
                      className="flex items-center gap-1 text-purple-700 font-bold hover:underline disabled:text-gray-400 disabled:no-underline disabled:cursor-not-allowed"
                    >
                      <RotateCcw size={12} className={isLoading ? 'animate-spin' : ''} />
                      {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || otp.trim().length !== 6}
                    className="w-full mt-2 py-3 rounded-xl text-white font-bold text-sm transition-all duration-300 hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                    style={{ background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)' }}
                  >
                    {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Verify & Sign In'}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        <p className="text-center text-white/55 text-xs mt-6">Restricted area — authorized personnel only</p>
      </div>
    </div>
  )
}
