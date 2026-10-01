import { createContext, useContext, useEffect, useState } from 'react'
import adminAuthService from '../services/admin/adminAuthService'

const AdminAuthContext = createContext(null)

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null)
  const [isAdminAuthLoading, setIsAdminAuthLoading] = useState(true)

  useEffect(() => {
    const adminToken = localStorage.getItem('admin_token')
    const isAdminRoute = window.location.pathname.startsWith('/page/admin')

    // Don't call admin auth if there's no admin_token and user is not on admin routes
    if (!adminToken && !isAdminRoute) {
      setAdmin(null)
      setIsAdminAuthLoading(false)
      return
    }

    adminAuthService
      .getMe()
      .then((res) => setAdmin(res.data.admin))
      .catch(() => {
        localStorage.removeItem('admin_token')
        setAdmin(null)
      })
      .finally(() => setIsAdminAuthLoading(false))
  }, [])

  const login = async ({ email, password }) => {
    const res = await adminAuthService.login({ email, password })
    if (res.data.token) localStorage.setItem('admin_token', res.data.token)
    setAdmin(res.data.admin)
    return res.data.admin
  }

  const register = async ({ name, email, password }) => {
    const res = await adminAuthService.register({ name, email, password })
    if (res.data.token) localStorage.setItem('admin_token', res.data.token)
    setAdmin(res.data.admin)
    return res.data.admin
  }

  const requestOtpLogin = async ({ email }) => {
    const res = await adminAuthService.requestOtpLogin({ email })
    return res.data
  }

  const verifyOtpLogin = async ({ email, otp }) => {
    const res = await adminAuthService.verifyOtpLogin({ email, otp })
    if (res.data.token) localStorage.setItem('admin_token', res.data.token)
    setAdmin(res.data.admin)
    return res.data.admin
  }

  const logout = async () => {
    try {
      await adminAuthService.logout()
    } finally {
      localStorage.removeItem('admin_token')
      setAdmin(null)
    }
  }

  const value = {
    admin,
    isAdminAuthenticated: !!admin,
    isAdminAuthLoading,
    login,
    requestOtpLogin,
    verifyOtpLogin,
    register,
    logout,
  }

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext)
  if (!ctx) throw new Error('useAdminAuth must be used within an AdminAuthProvider')
  return ctx
}

export default AdminAuthContext
