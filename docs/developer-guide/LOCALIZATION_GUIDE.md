# BharatLingo — Localization Guide

> **For the learner-developer:** This document explains how BharatLingo displays its UI in 8 different languages, how to add new translated text, and how to verify that all languages are covered.

---

## Two kinds of language in BharatLingo

There are two completely independent language settings:

| Setting | Purpose | Where stored |
|---|---|---|
| **Site language** (`siteLanguage`) | The language in which the app's UI text is shown — buttons, labels, messages | `localStorage.bharatlingo_site_lang` + `user.preferredLanguage` |
| **Learning language** (`learningLanguage`) | The language the user is learning — Hindi, Marathi, etc. | `user.learningLanguage` |

A user can set their site language to Tamil and their learning language to Hindi. The UI shows in Tamil; the lesson content is in Hindi.

**They must NEVER be conflated.** The AGENTS.md project rule requires these to stay in 100% sync with each other but independent in function.

---

## Supported languages

| ISO Code | Language | Native Name | Script |
|---|---|---|---|
| `en` | English | English | Latin |
| `hi` | Hindi | हिन्दी | Devanagari |
| `mr` | Marathi | मराठी | Devanagari |
| `ta` | Tamil | தமிழ் | Tamil |
| `te` | Telugu | తెలుగు | Telugu |
| `bn` | Bengali | বাংলা | Bengali |
| `pa` | Punjabi | ਪੰਜਾਬੀ | Gurmukhi |
| `gu` | Gujarati | ગુજરાતી | Gujarati |

---

## Translation dictionary (`src/services/uiTranslations.js`)

This file contains **~200+ translation keys**, each with values for all 8 languages:

```js
export const uiTranslations = {
  continue: {
    en: 'Continue',
    hi: 'आगे बढ़ें',
    mr: 'पुढे जा',
    ta: 'தொடரவும்',
    te: 'కొనసాగించు',
    bn: 'চালিয়ে যান',
    pa: 'ਜਾਰੀ ਰੱਖੋ',
    gu: 'ચાલુ રાખો',
  },
  // ...
}
```

**What is covered:**
- Navigation labels (dashboard, learn, stories, tutor, letters, practice)
- Exercise UI (check_answer, continue, skip, exit, correct_answer_is, excellent, not_quite)
- Speaking exercises (tap_to_speak, checking, recording_captured, allow_microphone)
- Writing practice (trace_character, nicely_traced, next_letter, previous_letter)
- Lesson results (complete_lesson, accuracy, legendary_challenge_mode)
- Quests and rewards (claim_reward, claimed, daily_goal, quests)
- Dashboard UI (explore_topics, explore_topics_subtitle, learner_stats)
- Settings and profile labels (site_language, theme, streak, gems)
- Onboarding and assessment labels (through translation keys used in those pages)

---

## The translation function

**File:** `src/services/themeContext.jsx`

```js
const t = (key, fallbackOrParams = null, params = null) => {
  return resolveTranslation(key, fallbackOrParams, params, siteLanguage)
}
```

**How to use it in any component:**
```js
import { useTheme } from '../../services/themeContext'

function MyComponent() {
  const { t } = useTheme()

  return <button>{t('continue')}</button>  // Shows in current site language
}
```

**Three call patterns:**

```js
// Simple key lookup:
t('check_answer')
// → 'Check Answer' (en) or 'उत्तर जांचें' (hi)

// Key with fallback string (used when key might not exist):
t('some_key', 'Default Text')

// Key with interpolation parameters:
t('step_x_of_y', { current: 2, total: 4 })
// → 'Step 2 of 4'
```

**What happens when a key is missing?**
`resolveTranslation()` tries in order:
1. `uiTranslations[key][siteLanguage]`
2. `uiTranslations[key]['en']` (English fallback)
3. The provided fallback string
4. Auto-formats the key: `'check_answer'` → `'Check Answer'`
5. Returns the key itself as a last resort

This means missing translations **silently fall back to English** without breaking the UI. This is by design but means gaps can go unnoticed.

---

## The `tEn()` function

```js
const { tEn } = useTheme()
```

This always returns the English translation regardless of `siteLanguage`. It is used in:
- `Onboarding.jsx` — The onboarding flow uses English for setup questions (before the user has picked their preferred language)
- Pre-login pages (`Welcome.jsx`, `Login.jsx`, `Signup.jsx`)

---

## Syncing site language and preferred language

Per AGENTS.md project rule, `siteLanguage` and `user.preferredLanguage` must stay in sync at all times.

**`syncSiteLanguage(langId)` in `src/services/authUtils.js`:**

```js
export function syncSiteLanguage(langId) {
  localStorage.setItem('bharatlingo_site_lang', langId)
  window.dispatchEvent(new CustomEvent('bharatlingo_site_lang_changed', {
    detail: { langId }
  }))
}
```

This function is called from:
- `AuthProvider` — after login, signup, page load, logout
- `ThemeProvider.setSiteLanguage()` — when user picks language in a dropdown
- `AuthProvider.updateUser()` — when `preferredLanguage` changes in profile

**ThemeProvider listens** for the event:
```js
window.addEventListener('bharatlingo_site_lang_changed', (event) => {
  const langId = event.detail?.langId
  setSiteLanguageState(langId)
})
```

This is a **publish-subscribe pattern** using browser custom events. Any component can call `syncSiteLanguage()` and all mounted components that use `useTheme()` will re-render with the new language.

---

## Persistence: where site language is stored

The site language is stored in **three places** to ensure it survives page reloads and device switches:

1. `localStorage.bharatlingo_site_lang` — survives browser close
2. `localStorage.bharatlingo_user` → `preferredLanguage` field — in the user profile
3. `Supabase profiles.preferred_language` — synced to database

---

## How lesson content is localized

UI text is handled by `uiTranslations.js`. Lesson content (vocabulary, exercise prompts, question text) is handled separately through language-specific data files.

**Exercise prompts** are looked up via `getPromptText(key, languageId, preferredLanguage)` in `src/data/translations.js`:
```js
// 'translate_word' prompt in Hindi:
getPromptText('translate_word', 'hi', 'en')
// → 'What does this Hindi word mean in English?'
```

**Topic names** are localized via `getLocalizedTopicName(topicId, siteLanguage)` in `src/data/translations.js`.

---

## How to add a new translation key

**Step 1:** Add the key with all 8 language values to `src/services/uiTranslations.js`:

```js
my_new_key: {
  en: 'My New Text',
  hi: 'मेरा नया पाठ',
  mr: 'माझा नवीन मजकूर',
  ta: 'என் புதிய உரை',
  te: 'నా కొత్త వచనం',
  bn: 'আমার নতুন টেক্সট',
  pa: 'ਮੇਰਾ ਨਵਾਂ ਟੈਕਸਟ',
  gu: 'મારો નવો ટેક્સ્ટ',
},
```

**Step 2:** Use it in your component:
```js
const { t } = useTheme()
<p>{t('my_new_key')}</p>
```

**Rules:**
- Always provide all 8 languages. Never add a key with only English.
- Use genuine translations — do not use Google Translate blindly for Indian scripts; verify with a native speaker if possible.
- Never hardcode English strings in the main UI. Use `t('key')` always.
- Pre-login pages (`Welcome`, `Login`, `Signup`) may use English-only strings where appropriate because the user has not yet chosen a language.

---

## How to add a new supported language

This would be a significant undertaking. It requires:

1. Add language definition to `src/data/languages.js`
2. Create `src/data/lessons/[langcode].js` with vocabulary and seed lessons
3. Create `src/data/questions/[langcode].js` with assessment questions
4. Add all 200+ keys to `src/services/uiTranslations.js`
5. Add to `src/data/alphabets.js` for the alphabet explorer
6. Add to `src/data/translations.js` for prompt text
7. Add voice code and test TTS support
8. Test all exercise types with the new script

---

## 🧪 Practical exercise

Open `src/services/uiTranslations.js`.

1. Search for the key `daily_goal`. Do all 8 languages have a value?
2. Search for the key `quests`. Is the Hindi translation accurate? (It says `दैनिक लक्ष्य` — "Daily Goal". Is that correct for "Daily Quests"?)
3. Write a simple node script that checks if any key is missing a language value. This would be a useful addition to the test suite.

*(This kind of audit is exactly what the testing improvement in the top 10 priority list refers to.)*
