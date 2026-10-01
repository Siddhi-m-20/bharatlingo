import { createContext, useContext, useState, useEffect } from 'react'
import { uiTranslations } from './uiTranslations.js'

const defaultThemeContext = {
  theme: 'light',
  setTheme: () => {},
  toggleTheme: () => {},
  siteLanguage: 'en',
  setSiteLanguage: () => {},
  t: (key, fallback = null) => {
    if (!key) return fallback || ''
    const entry = uiTranslations[key]
    if (entry) {
      const val = entry['en']
      if (val) return val
    }
    if (fallback) return fallback
    if (typeof key === 'string' && key.includes('_')) {
      return key.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    }
    return key
  },
  tEn: (key, fallback = null) => {
    if (!key) return fallback || ''
    const entry = uiTranslations[key]
    if (entry) {
      const val = entry['en']
      if (val) return val
    }
    if (fallback) return fallback
    if (typeof key === 'string' && key.includes('_')) {
      return key.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    }
    return key
  },
}

// Singleton ThemeContext instance across Vite HMR Fast Refresh reloads
const ThemeContext =
  globalThis.__BHARATLINGO_THEME_CONTEXT__ ||
  (globalThis.__BHARATLINGO_THEME_CONTEXT__ = createContext(defaultThemeContext))

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    try {
      return localStorage.getItem('bharatlingo_theme') || 'light'
    } catch (e) {
      return 'light'
    }
  })

  const [siteLanguage, setSiteLanguageState] = useState(() => {
    try {
      return localStorage.getItem('bharatlingo_site_lang') || 'en'
    } catch (e) {
      return 'en'
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem('bharatlingo_theme', theme)
      // Apply Tailwind dark class for dark-mode utilities
      if (theme === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
      // Apply data-theme attribute so CSS variable themes (saffron, emerald, dark) work
      document.documentElement.setAttribute('data-theme', theme)
    } catch (e) {
      console.error(e)
    }
  }, [theme])

  useEffect(() => {
    try {
      localStorage.setItem('bharatlingo_site_lang', siteLanguage)
    } catch (e) {
      console.error(e)
    }
  }, [siteLanguage])

  useEffect(() => {
    const handleLanguageChanged = (event) => {
      const langId = event.detail?.langId
      if (langId && langId !== siteLanguage) setSiteLanguageState(langId)
    }

    window.addEventListener('bharatlingo_site_lang_changed', handleLanguageChanged)
    return () => window.removeEventListener('bharatlingo_site_lang_changed', handleLanguageChanged)
  }, [siteLanguage])

  const VALID_THEMES = ['light', 'dark', 'saffron', 'emerald']
  const setTheme = (newTheme) => {
    if (VALID_THEMES.includes(newTheme)) {
      setThemeState(newTheme)
    }
  }

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'))
  }

  const setSiteLanguage = (langId) => {
    if (langId) {
      setSiteLanguageState(langId)
      try {
        localStorage.setItem('bharatlingo_site_lang', langId)
        window.dispatchEvent(new CustomEvent('bharatlingo_site_lang_changed', { detail: { langId } }))
      } catch (e) {
        console.error(e)
      }
    }
  }

  // Translation helper for UI labels
  const t = (key, fallback = null) => {
    if (!key) return fallback || ''
    const entry = uiTranslations[key]
    if (entry) {
      const val = entry[siteLanguage] || entry['en']
      if (val) return val
    }
    if (fallback) return fallback
    if (typeof key === 'string' && key.includes('_')) {
      return key.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    }
    return key
  }

  // Strictly English translation helper (used for pre-login & onboarding pages)
  const tEn = (key, fallback = null) => {
    if (!key) return fallback || ''
    const entry = uiTranslations[key]
    if (entry) {
      const val = entry['en']
      if (val) return val
    }
    if (fallback) return fallback
    if (typeof key === 'string' && key.includes('_')) {
      return key.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    }
    return key
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        siteLanguage,
        setSiteLanguage,
        t,
        tEn,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  return context || defaultThemeContext
}