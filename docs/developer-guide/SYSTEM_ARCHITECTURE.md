# BharatLingo — System Architecture

> **For the learner-developer:** This document explains how the different layers of the application connect to each other. After reading this, you should be able to trace a user action (e.g., completing a lesson) all the way from the button click to the database.

---

## Big picture: three-tier architecture

```
┌─────────────────────────────────────────────────┐
│               Browser (React SPA)                │
│  Pages → Components → Context Providers          │
│  Services (business logic + local state)         │
└─────────────┬───────────────────────┬────────────┘
              │ HTTP (fetch)           │ Supabase JS client
              ▼                       ▼
┌─────────────────────┐   ┌──────────────────────────┐
│  Express API Server │   │   Supabase (PostgreSQL)   │
│  port 5000 (local)  │   │   Auth + Database + RLS   │
│  Vercel functions   │   │   18 tables               │
│  (deployed)         │   │                           │
└─────────────────────┘   └──────────────────────────┘
```

**Three separate concerns:**
1. **React frontend** — renders the UI, manages state, calls the API and Supabase
2. **Express server** — handles TTS audio, translation proxy, Indic NLP, push notifications
3. **Supabase** — stores all persistent user data; enforces security rules at the database level

---

## Context providers (global React state)

React uses a pattern called **Context** to share data across many components without passing it down through props. BharatLingo has three providers stacked in `src/App.jsx`:

```jsx
<ThemeProvider>          ← outermost: theme + site language
  <AuthProvider>         ← middle: user identity + profile
    <ProgressProvider>   ← innermost: XP, gems, streaks, quests
```

**Why this order matters:** `ProgressProvider` calls `useAuth()` internally to read the current user. It must be nested *inside* `AuthProvider`, or `useAuth()` would return null.

### ThemeProvider (`src/services/themeContext.jsx`)
- Stores: `theme` (`light` | `dark` | `saffron` | `emerald`) and `siteLanguage` (ISO code like `'hi'`, `'en'`)
- Provides: `t(key)` translation function and `setSiteLanguage()`
- Persists to: `localStorage` key `bharatlingo_theme` and `bharatlingo_site_lang`
- Broadcasts: custom DOM event `bharatlingo_site_lang_changed` so all components update instantly

### AuthProvider (`src/services/auth.jsx`)
- Stores: `user` object (the logged-in user's full profile)
- Provides: `login()`, `logout()`, `updateUser()`, `signUp()`
- Persists to: `localStorage` key `bharatlingo_user` + Supabase `profiles` table
- Syncs: spaced repetition deck from Supabase on login

### ProgressProvider (`src/services/progress.jsx`)
- Stores: `gems`, `quests`, `currentLesson`, `lessonProgress`
- Provides: `addGems()`, `spendGems()`, `completeLesson()`, `updateQuestProgress()`
- Calls `updateUser()` from `AuthProvider` to persist XP/gem changes

---

## Data flow: completing a lesson

Here is what happens when a user finishes a lesson (a concrete example to follow):

```
1. User clicks "Continue" on the final exercise screen
   └── LessonPage component calls progress.completeLesson(lessonId, xp, accuracy)

2. ProgressProvider.completeLesson() runs:
   a. Calls updateUser({ xp: newXP, completedLessons: [...] })       → updates AuthContext
   b. Calls recordLessonCompletion(...)                               → calls dbService
   c. Calls updateQuestProgress('lessons', 1)                        → updates quest state
   d. Returns { xpEarned, gemsEarned, streakUpdated } to the page

3. AuthProvider.updateUser() runs:
   a. Merges new values into the user object (monotonic: XP never decreases)
   b. Writes updated user to localStorage (bharatlingo_user)
   c. Calls syncProfileToSupabase(updatedUser)                       → async, non-blocking

4. dbService.recordLessonCompletion() runs (src/services/dbService.js):
   a. Inserts row into lesson_attempts
   b. Upserts row in user_progress
   c. Inserts row in xp_transactions
   d. Calls recordLearningActivity()                                 → inserts in learning_activity

5. Supabase persists all rows; RLS policies verify user identity
```

---

## Data flow: changing the UI language

```
User picks "Hindi" in the site language dropdown
  → LanguageDropdown calls setSiteLanguage('hi')    (from ThemeContext)
  → ThemeProvider saves 'hi' to localStorage
  → ThemeProvider dispatches custom event: bharatlingo_site_lang_changed
  → All mounted components that call useTheme().t(key) re-render with Hindi text
  → AuthProvider also listens and calls updateUser({ preferredLanguage: 'hi' })
  → Supabase profiles.preferred_language is updated
```

The key insight: **the custom DOM event bridges React's component tree** — any mounted component can respond to a language change without being directly connected through props.

---

## Express API server

The Express server (`server/index.js`) runs at port 5000 during development. In production on Vercel, the same logic is deployed as serverless functions in the `api/` directory.

| Route file | Path prefix | Responsibility |
|---|---|---|
| `routes/tts.js` | `/api/tts` | Text-to-speech audio generation |
| `routes/translation.js` | `/api/translate` | Translation proxy |
| `routes/speech.js` | `/api/speech` | Speech recognition helpers |
| `routes/indicNlp.js` | `/api/indic-nlp` | Indic NLP processing |
| `routes/lessons.js` | `/api/lessons` | Server-side lesson fetching |
| `routes/push.js` | `/api/push` | Web Push notification subscriptions |

The frontend calls these endpoints using plain `fetch()`. They are not called through Supabase.

---

## Supabase integration

Supabase is accessed from the frontend via the official JavaScript client, initialized in `src/services/supabase.js`:

```js
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, { auth: { autoRefreshToken: true } })
  : null
```

**`isSupabaseConfigured()`** checks that the environment variables `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are present and not placeholder values. If Supabase is not configured, `supabase` is `null` and every database call in `dbService.js` falls back to `localStorage`.

This is a deliberate offline-first design. See [DATABASE_GUIDE.md](./DATABASE_GUIDE.md) for the full table schema.

---

## Routing and route guards

React Router v6 defines all routes in `src/App.jsx`. Every authenticated route is wrapped in `ProtectedRoute`:

```jsx
<Route path="/dashboard" element={
  <ProtectedRoute>
    <Dashboard />
  </ProtectedRoute>
} />
```

`ProtectedRoute` (`src/components/ProtectedRoute/ProtectedRoute.jsx`) checks:
1. Is the user logged in? If not → `/login`
2. Has the user completed onboarding? If not → `/onboarding`
3. Has the user completed the assessment? If not → `/assessment`
4. Otherwise → renders the child page

This is called a **route guard** — it blocks access to pages that require a certain state.

---

## PWA (Progressive Web App)

BharatLingo registers a service worker (`public/sw.js`) that enables:
- Installation on mobile home screens
- Offline caching of static assets
- Background push notification delivery

The `PWAInstallPrompt` component (`src/components/PWAInstallPrompt/`) shows an install banner when the browser's `beforeinstallprompt` event fires.

---

## Diagram: file dependency graph

```
App.jsx
├── ThemeProvider      ← themeContext.jsx ← uiTranslations.js
├── AuthProvider       ← auth.jsx ← authUtils.js, supabase.js, dbService.js
├── ProgressProvider   ← progress.jsx ← dbService.js
└── Pages
    ├── Dashboard      ← lessonEngine.js, adaptiveEngine.js, learnerModel.js
    ├── Lesson         ← lessonEngine.js, exercisePool.js, spacedRepetition.js
    ├── Practice       ← spacedRepetition.js
    └── Tutor          ← tutorService.js, aiService.js
```
