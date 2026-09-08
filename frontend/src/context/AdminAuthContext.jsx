import { createContext, useContext, useEffect, useState } from 'react'
import adminAuthService from '../services/admin/adminAuthService'

const AdminAuthContext = createContext(null)

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null)
  const [isAdminAuthLoading, setIsAdminAuthLoading] = useState(true)

  useEffect(() => {
    adminAuthService
      .getMe()
      .then((res) => setAdmin(res.data.admin))
      .catch(() => setAdmin(null))
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
