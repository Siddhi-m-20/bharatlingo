import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, Share2, X, Smartphone } from 'lucide-react'
import { useTheme } from '../../services/themeContext'

export default function PWAInstallPrompt() {
  const { t } = useTheme()
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [isDismissed, setIsDismissed] = useState(() => {
    try {
      return localStorage.getItem('bharatlingo_pwa_dismissed') === 'true'
    } catch {
      return false
    }
  })

  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    // 1. Detect if app is launched in standalone PWA mode
    const standaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true ||
      document.referrer.includes('android-app://')

    setIsStandalone(standaloneMode)
    if (standaloneMode) return

    // 2. Check for early captured beforeinstallprompt event on window
    if (window.__BHARATLINGO_DEFERRED_PROMPT__) {
      setDeferredPrompt(window.__BHARATLINGO_DEFERRED_PROMPT__)
    }

    // 3. Detect mobile devices (iOS / Android)
    const ua = window.navigator.userAgent.toLowerCase()
    const isIosDevice = /iphone|ipad|ipod/.test(ua) && !window.MSStream
    const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua)
    setIsIOS(isIosDevice)
    setIsMobile(isMobileDevice)

    // 4. Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault()
      window.__BHARATLINGO_DEFERRED_PROMPT__ = e
      setDeferredPrompt(e)
    }

    const handleCustomPromptEvent = () => {
      if (window.__BHARATLINGO_DEFERRED_PROMPT__) {
        setDeferredPrompt(window.__BHARATLINGO_DEFERRED_PROMPT__)
      }
    }

    const handleAppInstalled = () => {
      setDeferredPrompt(null)
      window.__BHARATLINGO_DEFERRED_PROMPT__ = null
      setIsStandalone(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('bharatlingo_beforeinstallprompt', handleCustomPromptEvent)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('bharatlingo_beforeinstallprompt', handleCustomPromptEvent)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstallClick = async () => {
    const promptEvent = deferredPrompt || window.__BHARATLINGO_DEFERRED_PROMPT__
    if (!promptEvent) return

    setDeferredPrompt(null)
    window.__BHARATLINGO_DEFERRED_PROMPT__ = null

    try {
      promptEvent.prompt()
      const choiceResult = await promptEvent.userChoice
      if (choiceResult?.outcome === 'accepted') {
        setIsStandalone(true)
      }
    } catch (err) {
      console.warn('[PWA] Prompt outcome error:', err)
    }
  }

  const handleDismiss = () => {
    setIsDismissed(true)
    try {
      localStorage.setItem('bharatlingo_pwa_dismissed', 'true')
    } catch (e) {
      console.error(e)
    }
  }

  // Do not render if app is running as standalone PWA or user dismissed banner
  if (isStandalone || isDismissed) {
    return null
  }

  // Show banner when beforeinstallprompt is ready OR on mobile devices
  const shouldShow = Boolean(deferredPrompt || isMobile || isIOS)
  if (!shouldShow) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className="fixed bottom-20 md:bottom-6 right-4 left-4 md:left-auto md:w-96 z-50 bg-white dark:bg-slate-900 border-2 border-[#0B8F62] dark:border-emerald-500 rounded-2xl shadow-xl p-4 flex flex-col gap-3"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0B8F62]/10 dark:bg-emerald-950/60 border border-[#0B8F62]/30 text-[#0B8F62] dark:text-emerald-400 flex items-center justify-center shrink-0">
              {isIOS ? <Share2 size={20} /> : <Smartphone size={20} />}
            </div>
            <div>
              <h4 className="text-sm font-black text-[#25231F] dark:text-white leading-tight">
                {t('install_bharatlingo') || 'Install BharatLingo'}
              </h4>
              <p className="text-xs text-[#77736B] dark:text-slate-400 mt-0.5 leading-snug">
                {isIOS
                  ? t('ios_install_instructions') || 'Tap the share button and select Add to Home Screen.'
                  : t('pwa_install_desc') || 'Install BharatLingo on your device for fast access and offline practice.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Close"
            className="p-1 rounded-lg text-[#77736B] dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {deferredPrompt ? (
          <button
            type="button"
            onClick={handleInstallClick}
            className="w-full py-2.5 px-4 bg-[#0B8F62] hover:bg-[#097550] active:scale-[0.98] text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download size={16} />
            <span>{t('install_app') || 'Install App'}</span>
          </button>
        ) : (
          <div className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-[11px] font-bold text-[#0B8F62] dark:text-emerald-300 flex items-center gap-2">
            <Share2 size={14} className="shrink-0" />
            <span>{t('add_to_home_screen') || 'Add to Home Screen'}</span>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
