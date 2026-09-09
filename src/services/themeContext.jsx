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
  writing_practice: {
    en: 'Writing Practice',
    hi: 'लेखन अभ्यास',
    mr: 'लेखन सराव',
    ta: 'எழுத்துப் பயிற்சி',
    te: 'రాత సాధన',
    bn: 'লেখার অনুশীলন',
    pa: 'ਲਿਖਣ ਅਭਿਆਸ',
    gu: 'લેખન અભ્યાસ',
  },
  writing_unavailable_msg: {
    en: 'Interactive writing practice is not yet available for this script.',
    hi: 'इस लिपि के लिए इंटरैक्टिव लेखन अभ्यास अभी उपलब्ध नहीं है।',
    mr: 'या लिपीसाठी परस्परसंवादी लेखन सराव अद्याप उपलब्ध नाही.',
    ta: 'இந்த எழுத்துமுறைக்கான ஊடாடும் எழுத்துப் பயிற்சி இன்னும் கிடைக்கவில்லை.',
    te: 'ఈ లిపి కోసం ఇంటరాక్టివ్ రాత సాధన ఇంకా అందుబాటులో లేదు.',
    bn: 'এই লিপির জন্য ইন্টারঅ্যাক্টিভ লেখার অনুশীলন এখনও উপলব্ধ নয়।',
    pa: 'ਇਸ ਲਿਪੀ ਲਈ ਇੰਟਰਐਕਟਿਵ ਲਿਖਣ ਅਭਿਆਸ ਅਜੇ ਉਪਲਬਧ ਨਹੀਂ ਹੈ।',
    gu: 'આ લિપિ માટે ઇન્ટરેક્ટિવ લેખન અભ્યાસ હજી ઉપલબ્ધ નથી.',
  },
  writing_practice_alt_msg: {
    en: 'Practice reading and speaking meanwhile.',
    hi: 'इस बीच पढ़ने और बोलने का अभ्यास करें।',
    mr: 'तोपर्यंत वाचन आणि बोलण्याचा सराव करा.',
    ta: 'இதற்கிடையில் வாசிப்பு மற்றும் பேசும் பயிற்சியைச் செய்யவும்.',
    te: 'ఈలోగా చదవడం మరియు మాట్లాడటం సాధన చేయండి.',
    bn: 'ইতিমধ্যে পড়া এবং বলার অনুশীলন করুন।',
    pa: 'ਇਸ ਦੌਰਾਨ ਪੜ੍ਹਨ ਅਤੇ ਬੋਲਣ ਦਾ ਅਭਿਆਸ ਕਰੋ।',
    gu: 'આ દરમિયાન વાંચન અને બોલવાનો અભ્યાસ કરો.',
  },
  back_to_dashboard: {
    en: 'Back to Dashboard',
    hi: 'डैशबोर्ड पर वापस जाएँ',
    mr: 'डॅशबोर्डवर परत जा',
    ta: 'முகப்புக்குத் திரும்பு',
    te: 'డ్యాష్‌బోర్డ్‌కు తిరిగి వెళ్ళండి',
    bn: 'ড্যাশবোর্ডে ফিরে যান',
    pa: "ਡੈਸ਼ਬੋਰਡ 'ਤੇ ਵਾਪਸ ਜਾਓ",
    gu: 'ડેશબોર્ડ પર પાછા જાઓ',
  },
  explore_alphabet: {
    en: 'Explore Alphabet',
    hi: 'वर्णमाला देखें',
    mr: 'मुळाक्षरे पहा',
    ta: 'எழுத்துக்களை ஆராயுங்கள்',
    te: 'అక్షరమాలను అన్వేషించండి',
    bn: 'বর্ণমালা অন্বেষণ করুন',
    pa: 'ਵਰਣਮਾਲਾ ਦੀ ਪੜਚੋਲ ਕਰੋ',
    gu: 'મૂળાક્ષરો જુઓ',
  },
  match_words_meanings: {
    en: 'Match every word with its meaning',
    hi: 'प्रत्येक शब्द को उसके अर्थ से मिलाएँ',
    mr: 'प्रत्येक शब्द त्याच्या अर्थाशी जुळवा',
    ta: 'ஒவ்வொரு சொல்லையும் அதன் பொருளுடன் பொருத்தவும்',
    te: 'ప్రతి పదాన్ని దాని అర్థంతో సరిపోల్చండి',
    bn: 'প্রতিটি শব্দকে তার অর্থের সাথে মেলান',
    pa: 'ਹਰੇਕ ਸ਼ਬਦ ਨੂੰ ਉਸਦੇ ਅਰਥ ਨਾਲ ਮਿਲਾਓ',
    gu: 'દરેક શબ્દને તેના અર્થ સાથે જોડો',
  },
  type_answer_placeholder: {
    en: 'Type your answer...',
    hi: 'अपना उत्तर टाइप करें...',
    mr: 'तुमचे उत्तर टाइप करा...',
    ta: 'உங்கள் பதிலை தட்டச்சு செய்யவும்...',
    te: 'మీ సమాధానాన్ని టైప్ చేయండి...',
    bn: 'আপনার উত্তর টাইপ করুন...',
    pa: 'ਆਪਣਾ ਜਵਾਬ ਟਾਈਪ ਕਰੋ...',
    gu: 'તમારો જવાબ લખો...',
  },
  unknown_exercise_type: {
    en: 'Unknown exercise type',
    hi: 'अज्ञात अभ्यास प्रकार',
    mr: 'अज्ञात सराव प्रकार',
    ta: 'தெரியாத பயிற்சி வகை',
    te: 'తెలియని అభ్యాస రకం',
    bn: 'অজানা অনুশীলনের ধরন',
    pa: 'ਅਣਜਾਣ ਅਭਿਆਸ ਕਿਸਮ',
    gu: 'અજ્ઞાત અભ્યાસ પ્રકાર',
  },
  legendary_challenge_mode: {
    en: 'LEGENDARY CHALLENGE MODE',
    hi: 'दिग्गज चुनौती मोड',
    mr: 'लेजेंडरी आव्हान मोड',
    ta: 'புகழ்பெற்ற சவால் முறை',
    te: 'లెజెండరీ ఛాలెంజ్ మోడ్',
    bn: 'কিংবদন্তি চ্যালেঞ্জ মোড',
    pa: 'ਮਹਾਨ ਚੁਣੌਤੀ ਮੋਡ',
    gu: 'દિગ્ગજ પડકાર મોડ',
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
