import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Lock, Eye, EyeOff, Check, Loader2, XCircle, AlertCircle } from 'lucide-react'
import AuthTopBar from '../components/AuthTopBar'
import Footer from '../components/Footer'
import AuthFeaturesBar from '../components/AuthFeaturesBar'
import { useShop } from '../context/ShopContext'
import { useAuth } from '../context/AuthContext'

export default function ResetPasswordPage() {
  const { token } = useParams()
  const navigate = useNavigate()
  const { showToast, siteAssets } = useShop()
  const { checkResetToken, resetPassword } = useAuth()

  const [status, setStatus] = useState('checking') // 'checking' | 'valid' | 'invalid' | 'done'
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    checkResetToken(token)
      .then((valid) => setStatus(valid ? 'valid' : 'invalid'))
      .catch(() => setStatus('invalid'))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')

    if (!newPassword || newPassword.length < 6) {
      const msg = 'Password must be at least 6 characters long'
      setErrorMessage(msg)
      showToast(msg, 'error')
      return
    }
    if (newPassword !== confirmPassword) {
      const msg = 'Passwords do not match'
      setErrorMessage(msg)
      showToast(msg, 'error')
      return
    }
    setIsSubmitting(true)
    try {
      await resetPassword({ token, newPassword })
      setStatus('done')
      showToast('Password reset successfully! Please login.', 'success')
    } catch (err) {
      const msg = err.message || 'Password reset failed'
      setErrorMessage(msg)
      showToast(msg, 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <AuthTopBar />

      <div className="flex flex-1">
        <div className="hidden lg:block w-1/2 relative">
          <img src={siteAssets.loginImageUrl} alt="Reset Password" className="w-full h-full object-cover" />
        </div>

        <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-sm">
            {status === 'checking' && (
              <div className="text-center py-16">
                <Loader2 size={32} className="animate-spin text-purple-500 mx-auto mb-4" />
                <p className="text-gray-500 text-sm">Verifying your reset link...</p>
              </div>
            )}

            {status === 'invalid' && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <XCircle size={28} className="text-red-500" />
                </div>
                <h1 className="text-xl font-bold text-gray-900 mb-2">Link expired or invalid</h1>
                <p className="text-gray-500 text-sm mb-6">
                  This password reset link is no longer valid. Please request a new one.
                </p>
                <button
                  onClick={() => navigate('/login')}
                  className="w-full py-3 bg-purple-600 text-white rounded-full font-bold text-sm hover:bg-purple-700 transition-colors"
                >
                  Back to Login
                </button>
              </div>
            )}

            {status === 'valid' && (
              <>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Set a new password</h1>
                <p className="text-gray-500 text-sm mb-8">Choose a strong password for your account.</p>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {errorMessage && (
                    <div className="flex items-start gap-2.5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm animate-fade-in">
                      <AlertCircle size={18} className="flex-shrink-0 mt-0.5 text-rose-500" />
                      <span className="flex-1 font-medium leading-snug">{errorMessage}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-gray-700 text-sm font-semibold mb-2">New Password</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-purple-500 transition-colors placeholder-gray-400"
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

                  <div>
                    <label className="block text-gray-700 text-sm font-semibold mb-2">Confirm Password</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-purple-500 transition-colors placeholder-gray-400"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 rounded-full text-white font-bold text-sm transition-all duration-300 hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    style={{ background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)' }}
                  >
                    {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : 'Reset Password'}
                  </button>
                </form>
              </>
            )}

            {status === 'done' && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check size={32} className="text-green-500" />
                </div>
                <h1 className="text-xl font-bold text-gray-900 mb-2">Password Reset!</h1>
                <p className="text-gray-500 text-sm mb-6">
                  Your password has been changed successfully. Please login with your new password.
                </p>
                <button
                  onClick={() => navigate('/login')}
                  className="w-full py-3 bg-purple-600 text-white rounded-full font-bold text-sm hover:bg-purple-700 transition-colors"
                >
                  Go to Login
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <AuthFeaturesBar />
      <Footer showFeatures={false} />
    </div>
  )
}
