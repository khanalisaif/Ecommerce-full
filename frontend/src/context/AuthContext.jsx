import { createContext, useContext, useEffect, useState } from 'react'
import authService from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isAuthLoading, setIsAuthLoading] = useState(true)

  // On first load, check if a valid user_token cookie already exists
  useEffect(() => {
    authService
      .getMe()
      .then((res) => setUser(res.data.user))
      .catch(() => setUser(null))
      .finally(() => setIsAuthLoading(false))
  }, [])

  // ---- Signup (returns userId so the caller can show the OTP screen) ----
  const signup = async ({ fullName, gender, email, mobileNumber, password }) => {
    const res = await authService.signup({ fullName, gender, email, mobileNumber, password })
    return res.data // { userId, email, mobileNumber }
  }

  const verifySignupOtp = async ({ userId, otp }) => {
    const res = await authService.verifySignupOtp({ userId, otp })
    if (res.data.token) localStorage.setItem('user_token', res.data.token)
    setUser(res.data.user)
    return res.data.user
  }

  const resendSignupOtp = async ({ userId }) => {
    const res = await authService.resendSignupOtp({ userId })
    return res.data
  }

  // ---- Password login ----
  const login = async ({ emailOrMobile, password }) => {
    const res = await authService.login({ emailOrMobile, password })
    if (res.data.token) localStorage.setItem('user_token', res.data.token)
    setUser(res.data.user)
    return res.data.user
  }

  // ---- OTP login ----
  const requestOtpLogin = async ({ emailOrMobile }) => {
    const res = await authService.requestOtpLogin({ emailOrMobile })
    return res.data // { userId }
  }

  const verifyOtpLogin = async ({ userId, otp }) => {
    const res = await authService.verifyOtpLogin({ userId, otp })
    if (res.data.token) localStorage.setItem('user_token', res.data.token)
    setUser(res.data.user)
    return res.data.user
  }

  // ---- Forgot / reset password (email link based) ----
  const forgotPassword = async ({ email }) => {
    const res = await authService.forgotPassword({ email })
    return res.data
  }

  const checkResetToken = async (token) => {
    const res = await authService.checkResetToken(token)
    return res.data.valid
  }

  const resetPassword = async ({ token, newPassword }) => {
    return authService.resetPassword(token, newPassword)
  }

  // ---- Social login ----
  const googleLogin = async (payload) => {
    const res = await authService.googleLogin(payload)
    if (res.data.token) localStorage.setItem('user_token', res.data.token)
    setUser(res.data.user)
    return res.data.user
  }

  const facebookLogin = async (accessToken) => {
    const res = await authService.facebookLogin(accessToken)
    if (res.data.token) localStorage.setItem('user_token', res.data.token)
    setUser(res.data.user)
    return res.data.user
  }

  const logout = async () => {
    try {
      await authService.logout()
    } finally {
      localStorage.removeItem('user_token')
      setUser(null)
    }
  }

  const value = {
    user,
    isAuthenticated: !!user,
    isAuthLoading,
    signup,
    verifySignupOtp,
    resendSignupOtp,
    login,
    requestOtpLogin,
    verifyOtpLogin,
    forgotPassword,
    checkResetToken,
    resetPassword,
    googleLogin,
    facebookLogin,
    logout,
    setUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}

export default AuthContext
