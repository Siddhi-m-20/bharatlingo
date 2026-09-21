import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './services/auth'
import { ProgressProvider } from './services/progress'
import { ThemeProvider } from './services/themeContext'
import ProtectedRoute from './components/ProtectedRoute'
import SiteSettingsBar from './components/SiteSettingsBar/SiteSettingsBar'
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
import Stories from './pages/Stories/Stories'
import StoryReader from './pages/Stories/StoryReader'
import ConversationTutor from './pages/Tutor/ConversationTutor'
import Alphabet from './pages/Alphabet/Alphabet'
import WritingPractice from './pages/Writing/WritingPractice'
import AdminRoute from './components/AdminRoute'
import AdminDashboard from './pages/Admin'
import GamesHub from './pages/Games/GamesHub'
import GameArena from './pages/Games/GameArena'

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider>
          <ProgressProvider>
            <Routes>
              <Route path="/" element={<Welcome />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route
                path="/onboarding"
                element={
                  <ProtectedRoute>
                    <Onboarding />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/assessment"
                element={
                  <ProtectedRoute>
                    <Assessment />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/lesson/:lessonId"
                element={
                  <ProtectedRoute>
                    <Lesson />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/stories"
                element={
                  <ProtectedRoute>
                    <Stories />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/story/:storyId"
                element={
                  <ProtectedRoute>
                    <StoryReader />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tutor"
                element={
                  <ProtectedRoute>
                    <ConversationTutor />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/letters"
                element={
                  <ProtectedRoute>
                    <Alphabet />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/writing"
                element={
                  <ProtectedRoute>
                    <WritingPractice />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/practice"
                element={
                  <ProtectedRoute>
                    <Practice />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/games"
                element={
                  <ProtectedRoute>
                    <GamesHub />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/games/:gameId"
                element={
                  <ProtectedRoute>
                    <GameArena />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/leaderboard"
                element={
                  <ProtectedRoute>
                    <Leaderboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>

            {/* Persistent Global Site Language & Theme Control Bar */}
            <SiteSettingsBar />
          </ProgressProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
