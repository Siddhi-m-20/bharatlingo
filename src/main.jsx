import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// Capture beforeinstallprompt event early on window for Android Chrome
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    window.__BHARATLINGO_DEFERRED_PROMPT__ = e
    window.dispatchEvent(new CustomEvent('bharatlingo_beforeinstallprompt'))
  })
}

// Register production Service Worker for PWA offline shell & Push notifications
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  const registerServiceWorker = () => {
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((reg) => {
        // SW registered successfully
      })
      .catch((err) => {
        console.warn('[SW] Registration failed:', err)
      })
  }

  if (document.readyState === 'complete') {
    registerServiceWorker()
  } else {
    window.addEventListener('load', registerServiceWorker)
  }
}
