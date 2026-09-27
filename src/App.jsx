import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './services/auth'
import { ProgressProvider } from './services/progress'
import { ThemeProvider } from './services/themeContext'
import ProtectedRoute from './components/ProtectedRoute'
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary'
import PWAInstallPrompt from './components/PWAInstallPrompt/PWAInstallPrompt'

// Eagerly loaded entry pages
import Welcome from './pages/Welcome'
import Login from './pages/Login'
import Signup from './pages/Signup'

// Lazy-loaded feature routes
const Onboarding = lazy(() => import('./pages/Onboarding'))
const Assessment = lazy(() => import('./pages/Assessment'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Lesson = lazy(() => import('./pages/Lesson'))
const Practice = lazy(() => import('./pages/Practice'))
const Leaderboard = lazy(() => import('./pages/Leaderboard'))
const Profile = lazy(() => import('./pages/Profile'))
const Settings = lazy(() => import('./pages/Settings'))
const Stories = lazy(() => import('./pages/Stories/Stories'))
const StoryReader = lazy(() => import('./pages/Stories/StoryReader'))
const ConversationTutor = lazy(() => import('./pages/Tutor/ConversationTutor'))
const Alphabet = lazy(() => import('./pages/Alphabet/Alphabet'))
const WritingPractice = lazy(() => import('./pages/Writing/WritingPractice'))
const AdminRoute = lazy(() => import('./components/AdminRoute'))
const AdminDashboard = lazy(() => import('./pages/Admin'))
const GamesHub = lazy(() => import('./pages/Games/GamesHub'))
const GameArena = lazy(() => import('./pages/Games/GameArena'))
const Speaking = lazy(() => import('./pages/Speaking/Speaking'))
const Review = lazy(() => import('./pages/Review/Review'))

function PageLoader() {
  return (
    <div className="min-h-screen bg-[#F7F5EF] dark:bg-slate-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-3 border-[#0B8F62] border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-black text-[#77736B] dark:text-slate-400">BharatLingo</span>
      </div>
    </div>
  )
}

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider>
          <ProgressProvider>
            <ErrorBoundary>
              <Suspense fallback={<PageLoader />}>
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
                path="/speaking"
                element={
                  <ProtectedRoute>
                    <Speaking />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/review"
                element={
                  <ProtectedRoute>
                    <Review />
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
          </Suspense>
          <PWAInstallPrompt />
        </ErrorBoundary>
          </ProgressProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
