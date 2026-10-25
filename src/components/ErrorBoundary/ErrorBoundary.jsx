import React from 'react'

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.warn('[BharatLingo Auto-Recovery] Silently healing view issue:', error?.message || error)

    // Auto-heal: navigate smoothly without blocking the user
    try {
      const attempts = Number(sessionStorage.getItem('bharatlingo_recovery_attempts') || 0)
      if (attempts < 2) {
        sessionStorage.setItem('bharatlingo_recovery_attempts', String(attempts + 1))
        setTimeout(() => {
          const userStr = localStorage.getItem('bharatlingo_user')
          const destination = userStr ? '/dashboard' : '/'
          if (window.location.pathname !== destination) {
            window.location.replace(destination)
          } else {
            this.setState({ hasError: false, error: null })
          }
        }, 300)
      } else {
        sessionStorage.removeItem('bharatlingo_recovery_attempts')
        window.location.replace('/dashboard')
      }
    } catch {
      window.location.replace('/')
    }
  }

  render() {
    if (this.state.hasError) {
      // Seamless branded loader during silent auto-recovery (no error banners or popups)
      return (
        <div className="min-h-screen bg-[#F7F5EF] dark:bg-slate-950 flex items-center justify-center p-6">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-[#0B8F62] border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-bold text-[#25231F] dark:text-slate-200">
              Loading BharatLingo...
            </span>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
