import { Navigate, useLocation } from 'react-router-dom'
import { useAuth, hasUserCompletedOnboarding, hasUserCompletedAssessment } from '../../services/auth'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F5EF] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#0B8F62] border-t-transparent"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  const isOnboarded = hasUserCompletedOnboarding(user)
  const isAssessed = hasUserCompletedAssessment(user)
  const currentPath = location.pathname

  // 1. Incomplete onboarding: only /onboarding is accessible
  if (!isOnboarded) {
    if (currentPath !== '/onboarding') {
      return <Navigate to="/onboarding" replace />
    }
    return children
  }

  // 2. Onboarded, but assessment not completed: only /assessment is accessible
  if (!isAssessed) {
    if (currentPath !== '/assessment') {
      return <Navigate to="/assessment" replace />
    }
    return children
  }

  // 3. Fully onboarded and assessed: visiting /onboarding or /assessment redirects to /dashboard
  if (currentPath === '/onboarding' || currentPath === '/assessment') {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
