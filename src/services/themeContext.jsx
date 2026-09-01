import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext(null)

// UI Translations for Common Site Labels across 9 Languages
export const uiTranslations = {
  learn: {
    en: 'Learn',
    hi: 'सीखें',
    mr: 'शिका',
    ta: 'கற்க',
    te: 'నేర్చుకోండి',
    bn: 'শিখুন',
    pa: 'ਸਿੱਖੋ',
    gu: 'શીખો',
    raj: 'सीखो',
  },
  dashboard: {
    en: 'Dashboard',
    hi: 'डैशबोर्ड',
    mr: 'डॅशबोर्ड',
    ta: 'முகப்பு',
    te: 'డ్యాష్‌బోర్డ్',
    bn: 'ড্যাশবোর্ড',
    pa: 'ਡੈਸ਼ਬੋਰਡ',
    gu: 'ડેશબોર્ડ',
    raj: 'डैशबोर्ड',
  },
  letters: {
    en: 'Letters / Script',
    hi: 'वर्णमाला / अक्षर',
    mr: 'मुळाक्षरे / लिपी',
    ta: 'எழுத்துக்கள்',
    te: 'అక్షరమాల',
    bn: 'বর্ণমালা',
    pa: 'ਵਰਣਮਾਲਾ',
    gu: 'મૂળાક્ષરો',
    raj: 'वर्णमाला',
  },
  practice: {
    en: 'Practice',
    hi: 'अभ्यास',
    mr: 'सराव',
    ta: 'பயிற்சி',
    te: 'సాధన',
    bn: 'অনুশীলন',
    pa: 'ਅਭਿਆਸ',
    gu: 'અભ્યાસ',
    raj: 'अभ्यास',
  },
  leaderboard: {
    en: 'Leaderboard',
    hi: 'लीडरबोर्ड',
    mr: 'लीडरबोर्ड',
    ta: 'முன்னிலை பலகை',
    te: 'లీడర్‌బోర్డ్',
    bn: 'লিডারবোর্ড',
    pa: 'ਲੀਡਰਬੋਰਡ',
    gu: 'ਲੀਡਰਬੋਰਡ',
    raj: 'लीडरबोर्ड',
  },
  profile: {
    en: 'Profile',
    hi: 'प्रोफ़ाइल',
    mr: 'प्रोफाइल',
    ta: 'சுயவிவரம்',
    te: 'ప్రొఫైల్',
    bn: 'প্রোফাইল',
    pa: 'ਪ੍ਰੋਫਾਈਲ',
    gu: 'ਪ્રોਫાઇલ',
    raj: 'प्रोफाइल',
  },
  settings: {
    en: 'Settings',
    hi: 'सेटिंग्स',
    mr: 'सेटिंग्ज',
    ta: 'அமைப்புகள்',
    te: 'సెట్టింగ్‌లు',
    bn: 'সেটিংস',
    pa: 'ਸੈਟਿੰਗਾਂ',
    gu: 'સેટિંગ્સ',
    raj: 'सेटिंग्स',
  },
  streak: {
    en: 'Streak',
    hi: 'लगातार दिन',
    mr: 'सलग दिवस',
    ta: 'தொடர் நாட்கள்',
    te: 'వరుస రోజులు',
    bn: 'ধারাবাহিকতা',
    pa: 'ਲੜੀਵਾਰ ਦਿਨ',
    gu: 'ਸੜંગ દિવસો',
    raj: 'लगातार दिन',
  },
  hearts: {
    en: 'Hearts',
    hi: 'ऊर्जा',
    mr: 'ऊर्जा',
    ta: 'ஆற்றல்',
    te: 'శక్తి',
    bn: 'শক্তি',
    pa: 'ਊਰਜਾ',
    gu: 'ઉર્જા',
    raj: 'ऊर्जा',
  },
  daily_goal: {
    en: 'Daily Goal',
    hi: 'दैनिक लक्ष्य',
    mr: 'दैनिक ध्येय',
    ta: 'தினசரி இலக்கு',
    te: 'రోజువారీ లక్ష్యం',
    bn: 'দৈনিক লক্ষ্য',
    pa: 'ਰੋਜ਼ਾਨਾ ਟੀਚਾ',
    gu: 'દૈનિક લક્ષ્ય',
    raj: 'दैनिक लक्ष्य',
  },
  theme: {
    en: 'Theme',
    hi: 'थीम',
    mr: 'थीम',
    ta: 'தீம்',
    te: 'థీమ్',
    bn: 'থিম',
    pa: 'ਥੀਮ',
    gu: 'થીમ',
    raj: 'थीम',
  },
  site_language: {
    en: 'Site Language',
    hi: 'वेबसाइट भाषा',
    mr: 'वेबसाइट भाषा',
    ta: 'தள மொழி',
    te: 'సైట్ భాష',
    bn: 'সাইট ভাষা',
    pa: 'ਸਾਈਟ ਭਾਸ਼ਾ',
    gu: 'સાઇટ ભાષા',
    raj: 'वेबसाइट भाषा',
  },
}

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
      return localStorage.getItem('bharatlingo_site_language') || 'en'
    } catch (e) {
      return 'en'
    }
  })

  // Apply theme to document root and sync .dark class
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }

    try {
      localStorage.setItem('bharatlingo_theme', theme)
    } catch (e) {}
  }, [theme])

  // Save site language
  useEffect(() => {
    try {
      localStorage.setItem('bharatlingo_site_language', siteLanguage)
    } catch (e) {}
  }, [siteLanguage])

  const setTheme = (newTheme) => {
    setThemeState(newTheme)
  }

  const setSiteLanguage = (newLang) => {
    setSiteLanguageState(newLang)
  }

  // Translation helper
  const t = (key) => {
    const entry = uiTranslations[key]
    if (!entry) return key
    return entry[siteLanguage] || entry['en'] || key
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        siteLanguage,
        setSiteLanguage,
        t,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
