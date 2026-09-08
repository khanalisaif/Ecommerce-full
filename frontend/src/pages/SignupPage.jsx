import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Mail, Lock, Eye, EyeOff, Phone, Loader2, AlertCircle, X, ArrowLeft } from 'lucide-react'
import AuthTopBar from '../components/AuthTopBar'
import Footer from '../components/Footer'
import AuthFeaturesBar from '../components/AuthFeaturesBar'
import { useShop } from '../context/ShopContext'
import { useAuth } from '../context/AuthContext'

export default function SignupPage() {
  const navigate = useNavigate()
  const { showToast, siteAssets } = useShop()
  const { signup, verifySignupOtp, resendSignupOtp } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    gender: 'male',
    email: '',
    mobileNumber: '',
    password: '',
    agreeTerms: false,
  })
  const [showOtpModal, setShowOtpModal] = useState(false)
  const [signupUserId, setSignupUserId] = useState(null)
  const [otp, setOtp] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [otpError, setOtpError] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)

  // Resend OTP countdown
  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [resendCooldown])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setErrorMessage('')
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    setErrorMessage('')

    if (!formData.agreeTerms) {
      const msg = 'Please agree to the Terms & Conditions and Privacy Policy'
      setErrorMessage(msg)
      showToast(msg, 'error')
      return
    }
    if (!formData.fullName.trim() || !formData.email.trim() || !formData.password || !formData.mobileNumber.trim()) {
      const msg = 'Please fill in all required fields'
      setErrorMessage(msg)
      showToast(msg, 'error')
      return
    }

    // Basic client validation
    if (formData.password.length < 6) {
      const msg = 'Password must be at least 6 characters long'
      setErrorMessage(msg)
      showToast(msg, 'error')
      return
    }

    setIsLoading(true)
    try {
      const res = await signup({
        fullName: formData.fullName.trim(),
        gender: formData.gender,
        email: formData.email.trim(),
        mobileNumber: formData.mobileNumber.trim(),
        password: formData.password,
      })
      setSignupUserId(res.userId)
      setResendCooldown(30)
      setShowOtpModal(true)
      setOtpError('')
      showToast('OTP sent to your email and mobile number!', 'success')
    } catch (err) {
      const msg = err.message || 'Signup failed'
      setErrorMessage(msg)
      showToast(msg, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    setOtpError('')

    if (!otp || otp.length !== 6) {
      const msg = 'Please enter the complete 6-digit OTP'
      setOtpError(msg)
      showToast(msg, 'error')
      return
    }

    setIsLoading(true)
    try {
      await verifySignupOtp({ userId: signupUserId, otp: otp.trim() })
      showToast('Account created and verified successfully!', 'success')
      navigate('/')
    } catch (err) {
      const msg = err.message || 'Invalid OTP'
      setOtpError(msg)
      showToast(msg, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || isResending) return
    setIsResending(true)
    setOtpError('')
    try {
      await resendSignupOtp({ userId: signupUserId })
      setResendCooldown(30)
      showToast('A new OTP has been sent to your email & mobile!', 'success')
    } catch (err) {
      const msg = err.message || 'Failed to resend OTP'
      setOtpError(msg)
      showToast(msg, 'error')
    } finally {
      setIsResending(false)
    }
  }

  const genders = [
    { value: 'male', label: 'Male', icon: '♂' },
    { value: 'female', label: 'Female', icon: '♀' },
    { value: 'other', label: 'Other', icon: '○' },
  ]

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <AuthTopBar />

      {/* Main content */}
      <div className="flex flex-1">
        {/* Left side - image */}
        <div className="hidden lg:block w-1/2 relative">
          <img
            src={siteAssets.signupImageUrl}
            alt="Create your Hashtelicom account"
            className="absolute inset-0 w-full h-full object-cover object-top"
          />
        </div>

        {/* Right side - Signup Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 px-4 py-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 w-full max-w-[560px] px-5 sm:px-8 py-8">
            {/* Heading */}
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Create an Account</h1>
              <p className="text-gray-500 text-sm">Join Hashtelicom to access exclusive offers and fast checkout</p>
            </div>

            {/* Inline Error Alert */}
            {errorMessage && (
              <div className="mb-5 flex items-start gap-2.5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm animate-fade-in">
                <AlertCircle size={18} className="flex-shrink-0 mt-0.5 text-rose-500" />
                <span className="flex-1 font-medium leading-snug">{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSignup} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-gray-800 font-semibold text-sm mb-1.5">Full Name</label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-purple-500 transition-colors placeholder-gray-400"
                    required
                  />
                </div>
              </div>

              {/* Gender */}
              <div>
                <label className="block text-gray-800 font-semibold text-sm mb-1.5">Gender</label>
                <div className="grid grid-cols-3 gap-3">
                  {genders.map((g) => (
                    <label
                      key={g.value}
                      className={`flex items-center justify-center gap-1.5 py-2 rounded-lg border-2 cursor-pointer transition-all text-sm font-medium select-none ${
                        formData.gender === g.value
                          ? 'border-purple-500 bg-purple-50 text-purple-700 font-semibold'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="gender"
                        value={g.value}
                        checked={formData.gender === g.value}
                        onChange={handleChange}
                        className="hidden"
                      />
                      <span className="text-base">{g.icon}</span>
                      <span>{g.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-gray-800 font-semibold text-sm mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email address"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-purple-500 transition-colors placeholder-gray-400"
                    required
                  />
                </div>
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-gray-800 font-semibold text-sm mb-1.5">Mobile Number</label>
                <div className="flex gap-2">
                  <div className="flex items-center gap-1.5 border border-gray-300 rounded-lg px-3 py-2.5 bg-white">
                    <Phone size={14} className="text-gray-400" />
                    <span className="text-sm text-gray-700 font-medium select-none">🇮🇳 +91</span>
                  </div>
                  <input
                    type="tel"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    placeholder="10-digit mobile number"
                    maxLength={10}
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-purple-500 transition-colors placeholder-gray-400"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-gray-800 font-semibold text-sm mb-1.5">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="At least 6 characters"
                    className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-purple-500 transition-colors placeholder-gray-400"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Terms & Conditions */}
              <label className="flex items-start gap-2.5 cursor-pointer pt-1">
                <div className="relative mt-0.5 flex-shrink-0">
                  <input
                    type="checkbox"
                    name="agreeTerms"
                    checked={formData.agreeTerms}
                    onChange={handleChange}
                    className="hidden"
                    required
                  />
                  <div
                    className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors cursor-pointer ${
                      formData.agreeTerms ? 'bg-purple-600 border-purple-600' : 'border-gray-300 bg-white'
                    }`}
                  >
                    {formData.agreeTerms && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-gray-600 text-sm leading-relaxed select-none">
                  I agree to the{' '}
                  <span className="text-purple-600 font-semibold hover:underline">Terms &amp; Conditions</span> and{' '}
                  <span className="text-purple-600 font-semibold hover:underline">Privacy Policy</span>
                </span>
              </label>

              {/* Create Account Button */}
              <button
                type="submit"
                disabled={isLoading || !formData.agreeTerms}
                className={`w-full py-3 rounded-full text-white font-bold text-sm transition-all duration-300 mt-2 flex items-center justify-center gap-2 ${
                  !formData.agreeTerms || isLoading
                    ? 'opacity-50 cursor-not-allowed shadow-none'
                    : 'hover:shadow-lg cursor-pointer'
                }`}
                style={
                  formData.agreeTerms && !isLoading
                    ? { background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)' }
                    : { background: '#9ca3af' }
                }
              >
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Create Account'}
              </button>
            </form>

            {/* Login Link */}
            <p className="text-center mt-5 text-gray-500 text-sm">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-purple-600 font-bold hover:underline cursor-pointer"
              >
                Login
              </button>
            </p>
          </div>
        </div>
      </div>

      <AuthFeaturesBar />
      <Footer showFeatures={false} />

      {/* OTP Verification Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 relative animate-fade-in">
            <button
              type="button"
              onClick={() => {
                setShowOtpModal(false)
                setOtp('')
                setOtpError('')
              }}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors p-1"
            >
              <X size={18} />
            </button>

            <h3 className="text-xl font-bold text-gray-900 mb-1 text-center">Verify your account</h3>
            <p className="text-gray-500 text-xs mb-5 text-center leading-relaxed">
              We sent a 6-digit OTP code to <br />
              <span className="font-semibold text-gray-800">{formData.email}</span> &amp;{' '}
              <span className="font-semibold text-gray-800">+91 {formData.mobileNumber}</span>
            </p>

            {/* OTP Modal Error */}
            {otpError && (
              <div className="mb-4 flex items-start gap-2 p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs">
                <AlertCircle size={15} className="flex-shrink-0 mt-0.5 text-rose-500" />
                <span className="flex-1 font-medium">{otpError}</span>
              </div>
            )}

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value.replace(/\D/g, ''))
                    setOtpError('')
                  }}
                  placeholder="000000"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-base focus:outline-none focus:border-purple-500 transition-colors text-center tracking-[0.4em] font-bold"
                  autoFocus
                  required
                />
              </div>

              <div className="flex items-center justify-between text-xs pt-0.5">
                <span className="text-gray-500">Didn't receive code?</span>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0 || isResending}
                  className="text-purple-600 font-semibold hover:underline disabled:text-gray-400 disabled:no-underline cursor-pointer"
                >
                  {isResending ? (
                    'Sending...'
                  ) : resendCooldown > 0 ? (
                    `Resend in ${resendCooldown}s`
                  ) : (
                    'Resend OTP'
                  )}
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-full text-white font-bold text-sm transition-all duration-300 hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                style={{ background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)' }}
              >
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Verify & Continue'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowOtpModal(false)
                  setOtp('')
                  setOtpError('')
                }}
                className="w-full text-center text-xs font-semibold text-gray-500 hover:text-purple-600 transition-colors flex items-center justify-center gap-1 cursor-pointer pt-1"
              >
                <ArrowLeft size={13} /> Change details / Go back
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
