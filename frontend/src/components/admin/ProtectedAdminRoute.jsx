import { Navigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAdminAuth } from '../../context/AdminAuthContext'

export default function ProtectedAdminRoute({ children }) {
  const { isAdminAuthenticated, isAdminAuthLoading } = useAdminAuth()

  if (isAdminAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-purple-500" size={32} />
      </div>
    )
  }

  if (!isAdminAuthenticated) {
    return <Navigate to="/page/admin" replace />
  }

  return children
}
