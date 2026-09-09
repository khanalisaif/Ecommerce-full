import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, Check, Loader2, AlertCircle, ArrowLeft } from 'lucide-react'
import AuthTopBar from '../components/AuthTopBar'
import Footer from '../components/Footer'
import AuthFeaturesBar from '../components/AuthFeaturesBar'
import { useShop } from '../context/ShopContext'
import { useAuth } from '../context/AuthContext'
import { useGoogleAuth } from '../hooks/useGoogleAuth'
import { useFacebookAuth } from '../hooks/useFacebookAuth'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const redirectPath = location.state?.from?.pathname || '/'
  const { showToast, siteAssets } = useShop()
  const { login, requestOtpLogin, verifyOtpLogin, forgotPassword, googleLogin, facebookLogin } = useAuth()
  const { signIn: googleSignIn } = useGoogleAuth()
  const { signIn: facebookSignIn } = useFacebookAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [socialLoading, setSocialLoading] = useState(null)
  const [loginMode, setLoginMode] = useState('password') // 'password' | 'otp_request' | 'otp_verify' | 'forgot_password'
  const [otp, setOtp] = useState('')
  const [otpUserId, setOtpUserId] = useState(null)
  const [sentContactInfo, setSentContactInfo] = useState({ email: '', mobileNumber: '' })
  const [showResetModal, setShowResetModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)

  // Resend OTP countdown timer
  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [resendCooldown])

  const clearErrors = () => setErrorMessage('')

  const handleLogin = async (e) => {
    e.preventDefault()
    clearErrors()

    if (loginMode === 'password') {
      if (!email.trim() || !password) {
        setErrorMessage('Please enter both email/phone and password')
        showToast('Please enter both email/phone and password', 'error')
        return
      }
      setIsLoading(true)
      try {
        await login({ emailOrMobile: email.trim(), password })
        showToast('Logged in successfully!', 'success')
        navigate(redirectPath, { replace: true })
      } catch (err) {
        const msg = err.message || 'Invalid credentials'
        setErrorMessage(msg)
        showToast(msg, 'error')
      } finally {
        setIsLoading(false)
      }
    } else if (loginMode === 'otp_request') {
      if (!email.trim()) {
        setErrorMessage('Please enter your email or phone number')
        showToast('Please enter your email or phone number', 'error')
        return
      }
      setIsLoading(true)
      try {
        const data = await requestOtpLogin({ emailOrMobile: email.trim() })
        setOtpUserId(data.userId)
        setSentContactInfo({ email: data.email || email.trim(), mobileNumber: data.mobileNumber || '' })
        setResendCooldown(30)
        showToast('OTP sent to your registered email and mobile!', 'success')
        setLoginMode('otp_verify')
      } catch (err) {
        const msg = err.message || 'Failed to request OTP'
        setErrorMessage(msg)
        showToast(msg, 'error')
      } finally {
        setIsLoading(false)
      }
    } else if (loginMode === 'otp_verify') {
      if (!otp || otp.length !== 6) {
        setErrorMessage('Please enter the complete 6-digit OTP')
        showToast('Please enter the complete 6-digit OTP', 'error')
        return
      }
      setIsLoading(true)
      try {
        await verifyOtpLogin({ userId: otpUserId, otp: otp.trim() })
        showToast('Logged in successfully with OTP!', 'success')
        navigate(redirectPath, { replace: true })
      } catch (err) {
        const msg = err.message || 'Invalid OTP'
        setErrorMessage(msg)
        showToast(msg, 'error')
      } finally {
        setIsLoading(false)
      }
    } else if (loginMode === 'forgot_password') {
      if (!email.trim()) {
        setErrorMessage('Please enter your registered email address')
        showToast('Please enter your registered email address', 'error')
        return
      }
      setIsLoading(true)
      try {
        await forgotPassword({ email: email.trim() })
        setShowResetModal(true)
      } catch (err) {
        const msg = err.message || 'Failed to send reset link'
        setErrorMessage(msg)
        showToast(msg, 'error')
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || isLoading) return
    clearErrors()
    setIsLoading(true)
    try {
      const data = await requestOtpLogin({ emailOrMobile: email.trim() })
      if (data?.userId) setOtpUserId(data.userId)
      setResendCooldown(30)
      showToast('A new OTP has been sent!', 'success')
    } catch (err) {
      const msg = err.message || 'Failed to resend OTP'
      setErrorMessage(msg)
      showToast(msg, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialLogin = async (provider) => {
    setSocialLoading(provider)
    clearErrors()
    try {
      if (provider === 'Google') {
        const accessToken = await googleSignIn()
        await googleLogin({ accessToken })
      } else if (provider === 'Facebook') {
        const accessToken = await facebookSignIn()
        await facebookLogin(accessToken)
      } else {
        throw new Error(`Sign in with ${provider} isn't set up yet.`)
      }
      showToast(`Successfully logged in with ${provider}!`, 'success')
      navigate(redirectPath, { replace: true })
    } catch (err) {
      const msg = err.message || `Failed to log in with ${provider}`
      setErrorMessage(msg)
      showToast(msg, 'error')
    } finally {
      setSocialLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <AuthTopBar />

      {/* Main content */}
      <div className="flex flex-1">
        {/* Left side - image */}
        <div className="hidden lg:block w-1/2 relative">
          <img
            src={siteAssets.loginImageUrl}
            alt="Welcome to Hashtelicom Mobile"
            className="absolute inset-0 w-full h-full object-cover object-top"
          />
        </div>

        {/* Right side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 px-4 py-6">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 w-full max-w-[480px] px-5 sm:px-7 py-6 min-h-[480px] flex flex-col justify-between transition-all duration-300">
            <div>
              {/* Back button for sub-modes */}
              {loginMode !== 'password' && (
                <button
                  type="button"
                  onClick={() => {
                    setLoginMode('password')
                    clearErrors()
                    setOtp('')
                  }}
                  className="flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-purple-600 mb-3 transition-colors cursor-pointer"
                >
                  <ArrowLeft size={13} /> Back to password login
                </button>
              )}

              {/* Heading */}
              <div className="text-center mb-4">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-0.5">
                  {loginMode === 'password' && 'Login to your account'}
                  {loginMode === 'otp_request' && 'Login with OTP'}
                  {loginMode === 'otp_verify' && 'Verify OTP code'}
                  {loginMode === 'forgot_password' && 'Forgot Password?'}
                </h1>
                <p className="text-gray-500 text-xs sm:text-sm">
                  {loginMode === 'password' && 'Welcome back! Please enter your details.'}
                  {loginMode === 'otp_request' && 'We will send a 6-digit OTP to your email or phone.'}
                  {loginMode === 'otp_verify' && (
                    <span>
                      OTP sent to{' '}
                      <span className="font-semibold text-gray-800">
                        {sentContactInfo.email}
                        {sentContactInfo.mobileNumber ? ` & +91 ${sentContactInfo.mobileNumber}` : ''}
                      </span>
                      .{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setLoginMode('otp_request')
                          clearErrors()
                          setOtp('')
                        }}
                        className="text-purple-600 underline font-medium hover:text-purple-700 ml-1 cursor-pointer"
                      >
                        Change
                      </button>
                    </span>
                  )}
                  {loginMode === 'forgot_password' && 'Enter your email to receive a password reset link.'}
                </p>
              </div>

              {/* Inline Error Alert Banner */}
              {errorMessage && (
                <div className="mb-3.5 flex items-start gap-2 p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs animate-fade-in">
                  <AlertCircle size={15} className="flex-shrink-0 mt-0.5 text-rose-500" />
                  <span className="flex-1 font-medium leading-snug">{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-3">
                {/* Email or Phone Input */}
                {loginMode !== 'otp_verify' && (
                  <div>
                    <label className="block text-gray-700 font-semibold text-xs mb-1">
                      {loginMode === 'forgot_password' ? 'Registered Email Address' : 'Email Address / Phone Number'}
                    </label>
                    <div className="relative">
                      <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type={loginMode === 'forgot_password' ? 'email' : 'text'}
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value)
                          clearErrors()
                        }}
                        placeholder={loginMode === 'forgot_password' ? 'name@example.com' : 'Enter email or phone number'}
                        className="w-full pl-9 pr-3.5 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:border-purple-500 transition-colors placeholder-gray-400"
                        required
                      />
                    </div>
                  </div>
                )}

                {/* Password */}
                {loginMode === 'password' && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-gray-700 font-semibold text-xs">Password</label>
                      <button
                        type="button"
                        onClick={() => {
                          setLoginMode('forgot_password')
                          clearErrors()
                        }}
                        className="text-purple-600 text-xs font-semibold hover:underline cursor-pointer"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value)
                          clearErrors()
                        }}
                        placeholder="Enter your password"
                        className="w-full pl-9 pr-9 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:border-purple-500 transition-colors placeholder-gray-400"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                      >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>
                )}

                {/* OTP Input */}
                {loginMode === 'otp_verify' && (
                  <div>
                    <label className="block text-gray-700 font-semibold text-xs mb-1">
                      Enter 6-digit OTP Code
                    </label>
                    <div className="relative">
                      <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => {
                          setOtp(e.target.value.replace(/\D/g, ''))
                          clearErrors()
                        }}
                        placeholder="000000"
                        className="w-full pl-9 pr-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-purple-500 transition-colors placeholder-gray-400 text-center tracking-[0.4em] font-bold"
                        autoFocus
                        required
                      />
                    </div>
                    <div className="flex items-center justify-between mt-1.5 text-xs">
                      <span className="text-gray-500">Didn't get the code?</span>
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={resendCooldown > 0 || isLoading}
                        className="text-purple-600 font-semibold hover:underline disabled:text-gray-400 disabled:no-underline cursor-pointer"
                      >
                        {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : 'Resend OTP'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Remember me + Switch to OTP Login */}
                {loginMode === 'password' && (
                  <div className="flex items-center justify-between pt-0.5">
                    <label className="flex items-center gap-1.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="hidden"
                      />
                      <div
                        className={`w-3.5 h-3.5 rounded flex items-center justify-center border transition-colors cursor-pointer ${
                          rememberMe ? 'bg-purple-600 border-purple-600' : 'border-gray-300 bg-white'
                        }`}
                      >
                        {rememberMe && <Check size={9} className="text-white" strokeWidth={3} />}
                      </div>
                      <span className="text-gray-600 text-xs">Remember me</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => {
                        setLoginMode('otp_request')
                        clearErrors()
                      }}
                      className="text-purple-600 text-xs font-semibold hover:underline cursor-pointer"
                    >
                      Login with OTP
                    </button>
                  </div>
                )}

                {/* Information helper badges for non-password modes */}
                {loginMode === 'otp_request' && (
                  <div className="bg-purple-50/70 border border-purple-100 rounded-xl p-3 text-xs text-purple-800 flex items-start gap-2 mt-2">
                    <span className="text-sm">🔒</span>
                    <span className="leading-relaxed">
                      Instant passwordless access. We'll send a 6-digit verification code to your registered contact.
                    </span>
                  </div>
                )}

                {loginMode === 'forgot_password' && (
                  <div className="bg-purple-50/70 border border-purple-100 rounded-xl p-3 text-xs text-purple-800 flex items-start gap-2 mt-2">
                    <span className="text-sm">✉️</span>
                    <span className="leading-relaxed">
                      We'll email you a secure link to reset your password. Please verify your email inbox.
                    </span>
                  </div>
                )}

                {loginMode === 'otp_verify' && (
                  <div className="bg-purple-50/70 border border-purple-100 rounded-xl p-3 text-xs text-purple-800 flex items-start gap-2 mt-2">
                    <span className="text-sm">⏱️</span>
                    <span className="leading-relaxed">
                      OTP is valid for 10 minutes. Please enter the code promptly to securely access your account.
                    </span>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 rounded-full text-white font-bold text-xs sm:text-sm transition-all duration-300 hover:shadow-md mt-1 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                  style={{ background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)' }}
                >
                  {isLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : loginMode === 'otp_request' ? (
                    'Send OTP'
                  ) : loginMode === 'otp_verify' ? (
                    'Verify & Login'
                  ) : loginMode === 'forgot_password' ? (
                    'Send Reset Link'
                  ) : (
                    'Login'
                  )}
                </button>
              </form>

              {/* Social Logins only on main password mode */}
              {loginMode === 'password' && (
                <>
                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center text-[10px]">
                      <span className="px-2.5 bg-white text-gray-400 tracking-wider font-semibold">OR CONTINUE WITH</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => handleSocialLogin('Google')}
                      disabled={!!socialLoading}
                      className="flex items-center justify-center gap-1.5 py-2 border border-gray-200 rounded-lg hover:border-purple-400 transition-colors text-xs font-medium text-gray-700 disabled:opacity-50 cursor-pointer"
                    >
                      {socialLoading === 'Google' ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <svg width="14" height="14" viewBox="0 0 48 48">
                          <path
                            fill="#FFC107"
                            d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z"
                          />
                          <path
                            fill="#FF3D00"
                            d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6 29.3 4 24 4c-7.5 0-14 4.1-17.7 10.7z"
                          />
                          <path
                            fill="#4CAF50"
                            d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.4 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.6 5.1C9.9 39.8 16.4 44 24 44z"
                          />
                          <path
                            fill="#1976D2"
                            d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4.1 5.6l6.2 5.2C40.5 36.4 44 30.9 44 24c0-1.3-.1-2.3-.4-3.5z"
                          />
                        </svg>
                      )}
                      Google
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSocialLogin('Apple')}
                      disabled={!!socialLoading}
                      className="flex items-center justify-center gap-1.5 py-2 border border-gray-200 rounded-lg hover:border-purple-400 transition-colors text-xs font-medium text-gray-700 disabled:opacity-50 cursor-pointer"
                    >
                      {socialLoading === 'Apple' ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <svg width="12" height="14" viewBox="0 0 384 512" fill="currentColor">
                          <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141 0 189.8 0 289.1c0 29.2 5.4 59.4 16.1 90.6 14.3 41.7 66 143.9 120 142.2 28.3-.7 48.3-20.1 85.1-20.1 35.7 0 54.3 20.1 85.8 20.1 54.4-.8 101.2-93.9 114.9-135.7-73.1-34.5-103.2-101.7-103.2-117.5zM256.4 89.4c30.2-35.9 27.5-68.6 26.6-80.4-26.7 1.5-57.6 18.3-75.4 39.3-19.6 22.5-31 50.2-28.6 79.6 27.9 2.2 53.5-12.4 77.4-38.5z" />
                        </svg>
                      )}
                      Apple
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSocialLogin('Facebook')}
                      disabled={!!socialLoading}
                      className="flex items-center justify-center gap-1.5 py-2 border border-gray-200 rounded-lg hover:border-purple-400 transition-colors text-xs font-medium text-gray-700 disabled:opacity-50 cursor-pointer"
                    >
                      {socialLoading === 'Facebook' ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="#1877F2">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                      )}
                      Facebook
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Bottom link: Signup or Back to Login depending on mode */}
            <div className="pt-3">
              {loginMode === 'password' ? (
                <p className="text-center text-gray-500 text-xs sm:text-sm">
                  New to Hashtelicom?{' '}
                  <button
                    type="button"
                    onClick={() => navigate('/signup')}
                    className="text-purple-600 font-bold hover:underline cursor-pointer"
                  >
                    Create an account
                  </button>
                </p>
              ) : (
                <p className="text-center text-gray-500 text-xs sm:text-sm">
                  Want to use password instead?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setLoginMode('password')
                      clearErrors()
                      setOtp('')
                    }}
                    className="text-purple-600 font-bold hover:underline cursor-pointer"
                  >
                    Login with Password
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <AuthFeaturesBar />
      <Footer showFeatures={false} />

      {/* Password Reset Email Sent Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center transform transition-all animate-fade-in">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail size={28} className="text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Check your email</h3>
            <p className="text-gray-600 text-sm mb-6 leading-relaxed">
              If an account exists for <span className="font-semibold text-gray-900">{email}</span>, a password
              reset link has been sent. Click the link in your email to choose a new password.
            </p>
            <button
              type="button"
              onClick={() => {
                setShowResetModal(false)
                setLoginMode('password')
                setEmail('')
              }}
              className="w-full py-3 rounded-full text-white font-bold text-sm transition-all hover:shadow-lg cursor-pointer"
              style={{ background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)' }}
            >
              Back to Login
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
