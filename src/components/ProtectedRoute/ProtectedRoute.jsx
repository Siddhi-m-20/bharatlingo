import { Navigate } from 'react-router-dom'
import { useAuth } from '../../services/auth'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F5EF] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#0B8F62] border-t-transparent"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}
