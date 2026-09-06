import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext(null)

// UI Translations for Common Site Labels across 8 Languages
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
  },
  stories: {
    en: 'Stories',
    hi: 'कहानियाँ',
    mr: 'गोष्टी',
    ta: 'கதைகள்',
    te: 'కథలు',
    bn: 'গল্প',
    pa: 'ਕਹਾਣੀਆਂ',
    gu: 'વાર્તાઓ',
  },
  tutor: {
    en: 'AI Tutor',
    hi: 'एआई शिक्षक',
    mr: 'एआय शिक्षक',
    ta: 'AI ஆசிரியர்',
    te: 'AI ట్యూటర్',
    bn: 'এআই শিক্ষক',
    pa: 'AI ਅਧਿਆਪਕ',
    gu: 'AI ટ્યુટર',
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
  },
  leaderboard: {
    en: 'Leaderboard',
    hi: 'लीडरबोर्ड',
    mr: 'लीडरबोर्ड',
    ta: 'முன்னிலை பலகை',
    te: 'లీడర్‌బోర్డ్',
    bn: 'লিডারবোর্ড',
    pa: 'ਲੀਡਰਬੋਰਡ',
    gu: 'લીડરબોર્ડ',
  },
  curriculum: {
    en: 'Curriculum CMS',
    hi: 'पाठ्यक्रम',
    mr: 'अभ्यासक्रम',
    ta: 'பாடத்திட்டம்',
    te: 'పాఠ్య ప్రణాళిక',
    bn: 'পাঠ্যক্রম',
    pa: 'ਪਾਠਕ੍ਰਮ',
    gu: 'અભ્યાસક્રમ',
  },
  profile: {
    en: 'Profile',
    hi: 'प्रोफ़ाइल',
    mr: 'प्रोफाइल',
    ta: 'சுயவிவரம்',
    te: 'ప్రొఫైల్',
    bn: 'প্রোফাইল',
    pa: 'ਪ੍ਰੋਫਾਈਲ',
    gu: 'પ્રોફાઇલ',
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
  },
  streak: {
    en: 'Streak',
    hi: 'लगातार दिन',
    mr: 'सलग दिवस',
    ta: 'தொடர் நாட்கள்',
    te: 'వరుస రోజులు',
    bn: 'ধারাবাহিকতা',
    pa: 'ਲੜੀਵਾਰ ਦਿਨ',
    gu: 'સળંગ દિવસો',
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
  },
  gems: {
    en: 'Gems',
    hi: 'रत्न / सिक्के',
    mr: 'रत्ने / नाणी',
    ta: 'மணிகள்',
    te: 'మణులు',
    bn: 'রত্ন',
    pa: 'ਹੀਰੇ',
    gu: 'રત્નો',
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
  },
  quests: {
    en: 'Daily Quests',
    hi: 'दैनिक लक्ष्य',
    mr: 'दैनिक आव्हाने',
    ta: 'தினசரி பணிகள்',
    te: 'రోజువారీ టాస్క్‌లు',
    bn: 'দৈনিক মিশন',
    pa: 'ਰੋਜ਼ਾਨਾ ਚੁਣੌਤੀਆਂ',
    gu: 'દૈનિક મિશન',
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
  },
  continue: {
    en: 'Continue',
    hi: 'आगे बढ़ें',
    mr: 'पुढे जा',
    ta: 'தொடரவும்',
    te: 'కొనసాగించు',
    bn: 'চালিয়ে যান',
    pa: 'ਜਾਰੀ ਰੱਖੋ',
    gu: 'આગળ વધો',
  },
  check_answer: {
    en: 'Check Answer',
    hi: 'उत्तर जांचें',
    mr: 'उत्तर तपासा',
    ta: 'பதிலைச் சரிபார்க்கவும்',
    te: 'సమాధానం సరిచూడండి',
    bn: 'উত্তর পরীক্ষা করুন',
    pa: 'ਜਵਾਬ ਚੈੱਕ ਕਰੋ',
    gu: 'જવાબ ચકાસો',
  },
  excellent: {
    en: '✓ Excellent!',
    hi: '✓ बहुत बढ़िया!',
    mr: '✓ उत्तम!',
    ta: '✓ அற்புதம்!',
    te: '✓ అద్భుతం!',
    bn: '✓ চমৎকার!',
    pa: '✓ ਬਹੁਤ ਵਧੀਆ!',
    gu: '✓ ઉત્તમ!',
  },
  not_quite: {
    en: '✗ Not quite right',
    hi: '✗ सही नहीं है',
    mr: '✗ थोडे चुकले',
    ta: '✗ தவறு',
    te: '✗ సరికాదు',
    bn: '✗ সঠিক নয়',
    pa: '✗ ਗ਼ਲਤ ਹੈ',
    gu: '✗ ખોટું છે',
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
      return localStorage.getItem('bharatlingo_site_lang') || 'en'
    } catch (e) {
      return 'en'
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem('bharatlingo_theme', theme)
      if (theme === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
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

  const setTheme = (newTheme) => {
    if (newTheme === 'dark' || newTheme === 'light') {
      setThemeState(newTheme)
    }
  }

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'))
  }

  const setSiteLanguage = (langId) => {
    if (langId) {
      setSiteLanguageState(langId)
    }
  }

  // Translation helper for UI labels
  const t = (key) => {
    if (!key) return ''
    const entry = uiTranslations[key]
    if (!entry) return key
    return entry[siteLanguage] || entry['en'] || key
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
