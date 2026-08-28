import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './services/auth'
import { ProgressProvider } from './services/progress'
import Welcome from './pages/Welcome'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Onboarding from './pages/Onboarding'
import Assessment from './pages/Assessment'
import Dashboard from './pages/Dashboard'
import Lesson from './pages/Lesson'
import Practice from './pages/Practice'
import Leaderboard from './pages/Leaderboard'
import Profile from './pages/Profile'
import Settings from './pages/Settings'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ProgressProvider>
          <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/assessment" element={<Assessment />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/lesson/:lessonId" element={<Lesson />} />
            <Route path="/practice" element={<Practice />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ProgressProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
