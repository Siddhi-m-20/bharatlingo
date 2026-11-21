# BharatLingo — Glossary

> Every technical term used in BharatLingo's codebase, explained in plain language.

---

## A

**Adaptive lesson** — A lesson whose content is generated dynamically based on what the learner needs. BharatLingo generates a 15-exercise lesson using the learner's weak areas, spaced repetition due items, and mistakes. See `src/services/lessonEngine.js`.

**Anon key** — The Supabase "anonymous" API key. It is designed to be public — safe to include in frontend code. Its permissions are limited by RLS policies. Distinct from the service role key.

**Assessment** — The placement test shown to new users after onboarding. 15 questions generate a score (0–100) and a personalized learning plan. Located in `src/pages/Assessment/Assessment.jsx`.

**AuthContext** — The React Context provided by `AuthProvider` in `src/services/auth.jsx`. Gives any component access to `user`, `login`, `signup`, `logout`, and `updateUser`.

**AuthProvider** — The React component that manages all authentication state. Wraps the entire app. See `src/services/auth.jsx`.

---

## B

**bcryptjs** — A library for hashing passwords. Used in the local (offline) auth fallback. A "hash" is a one-way transformation — you can verify a password against its hash but cannot reverse a hash to get the original password.

**Bearer token** — An authentication credential passed in an HTTP `Authorization` header as `Authorization: Bearer <token>`. Used for push notification API authentication.

---

## C

**Context** — A React feature for sharing data across many components without passing props down through every level. BharatLingo uses three: `ThemeContext`, `AuthContext`, `ProgressContext`.

**CORS** — Cross-Origin Resource Sharing. A browser security rule that restricts which websites can call your API. The Express server in `server/index.js` configures CORS to only allow requests from approved origins.

**Custom event** — A browser event you create yourself using `new CustomEvent('name', { detail })`. BharatLingo uses `bharatlingo_site_lang_changed` to broadcast language changes across all mounted components.

---

## D

**Devanagari** — The script used for Hindi and Marathi. Characters like अ, क, ग are Devanagari. BharatLingo has stroke data (`src/data/strokeData.js`) for Hindi's Devanagari characters.

**dbService** — `src/services/dbService.js`. The single file responsible for all Supabase table reads and writes. All database operations in the app go through this file.

**Daily goal** — The user's target daily XP (default: 10 minutes / 10 XP). Stored in `user.dailyGoal`.

---

## E

**Ease factor** — In the SM-2 spaced repetition algorithm, a number (minimum 1.3) representing how easy a vocabulary item is to remember. Higher ease factors lead to longer review intervals. Default: 2.5.

**E2E test** — End-to-end test. A test that simulates a real user's journey through the actual browser. BharatLingo uses Playwright for E2E tests.

**Exercise pool** — `src/services/exercisePool.js`. The collection of factory functions that build individual exercises (MCQ, translation, listening, etc.) from vocabulary items.

---

## F

**Fallback** — When the primary system is unavailable, the fallback activates. BharatLingo has two main fallbacks: (1) localStorage auth when Supabase is not configured; (2) client-side lesson generation when the API server is unreachable.

**Forgetting curve** — A concept from memory science: without review, humans forget information at a predictable rate. Spaced repetition counters this by scheduling reviews just before you would forget.

**Free API** — An external service used at zero cost. BharatLingo's AI tutor (`src/services/aiService.js`) calls a free inference endpoint. Free endpoints can be rate-limited, slow, or discontinued without notice.

---

## G

**Gems** — The in-app currency in BharatLingo. Earned by completing lessons, can be spent on hints. Stored in `user.gems` and protected from manipulation by the database trigger.

**Gurmukhi** — The script used for Punjabi. Characters like ਅ, ਕ, ਗ are Gurmukhi.

---

## H

**Hash** — See bcryptjs. A hash function transforms a password into a fixed-length string. The same password always produces the same hash, but you cannot reverse a hash to get the password.

**Hearts** — An old mechanic removed from BharatLingo (migration `20260907000002_remove_hearts_system.sql`). Users previously lost hearts on wrong answers. Now removed in favour of a no-penalty learning approach.

---

## I

**Interval** — In SM-2 spaced repetition, the number of days until an item is reviewed again. Starts at 1 day for a new item and grows with correct answers.

**ISO code** — A standardized language identifier. `'hi'` = Hindi, `'mr'` = Marathi, `'ta'` = Tamil, `'te'` = Telugu, `'bn'` = Bengali, `'pa'` = Punjabi, `'gu'` = Gujarati, `'en'` = English.

---

## J

**JSONB** — A PostgreSQL column type that stores JSON data in a binary format. Faster to query than plain JSON. BharatLingo stores `completed_lessons`, `language_progress`, `learner_stats`, and other arrays/objects as JSONB in the `profiles` table.

---

## L

**Lazy loading** — Loading code only when it is needed, rather than upfront. BharatLingo lazy-loads all feature pages with `React.lazy()`. Reduces initial page load time.

**Learner model** — `src/services/learnerModel.js`. Tracks the learner's skill proficiencies (vocabulary, listening, speaking, grammar, reading) and topic masteries. Stored locally in `localStorage`.

**Learner stats** — The learner model data. Stored in `localStorage.bharatlingo_learner_stats_v2` and synced to `profiles.learner_stats` in Supabase.

**Legendary mode** — A harder variant of a lesson. Accessed via URL `?mode=legendary`. Awards more XP and gems.

---

## M

**Migration** — A SQL file that modifies the database schema. Applied in order. Never modified after being applied. BharatLingo's migrations live in `supabase/migrations/`.

**Monotonic** — A value that can only increase, never decrease. BharatLingo's `mergeUserProfiles()` applies monotonic merge for XP, gems, and streak — `Math.max(remote, local)` — so progress is never lost on sync.

**Mascot** — The BharatLingo character shown for feedback during lessons. Component: `src/components/Mascot/BharatMascot.jsx`.

---

## O

**Onboarding** — The 4-step setup flow for new users: Age → Preferred Language → Target Language → Goal. Located in `src/pages/Onboarding/Onboarding.jsx`.

**Offline-first** — An architecture where the app works without internet connectivity. BharatLingo stores all critical data in localStorage so users can continue learning offline.

---

## P

**Persistence queue** — A mechanism in `dbService.js` that serializes database writes per user using a `Map` of Promises. Prevents race conditions when two database writes happen simultaneously.

**PostgreSQL** — A powerful open-source relational database. BharatLingo uses it via Supabase.

**ProgressContext** — The React Context from `src/services/progress.jsx`. Provides `addXP`, `addGems`, `updateStreak`, `completeLesson`, `quests`, and related functions.

**ProtectedRoute** — `src/components/ProtectedRoute/ProtectedRoute.jsx`. A route guard component that redirects users based on their auth and onboarding state.

**Provider** — A React component that makes Context data available to all its children. Example: `AuthProvider` makes the user object available everywhere inside it.

**PWA** — Progressive Web App. A web application that can be installed on a device's home screen and work offline. BharatLingo is a PWA via `public/sw.js` (service worker) and `public/manifest.json`.

---

## Q

**Quality** — In SM-2, the rating (0–5) a learner gives themselves after reviewing a vocabulary item. Determines how the interval and ease factor are updated.

**Quests** — Daily objectives with XP and gem rewards. Three quests per day: earn 30 XP, complete 2 lessons, review 5 words. Managed in `src/services/progress.jsx`.

---

## R

**React Router** — The library that handles navigation in BharatLingo. Routes are defined in `src/App.jsx`. Handles URL changes without page reloads.

**Repetition** — In SM-2, the count of consecutive correct reviews for a vocabulary item. Used to calculate the next interval.

**Retention score** — An estimated percentage (0–100) of how well a vocabulary item is remembered. Calculated from ease factor and quality in `calculateSM2()`.

**RLS** — Row Level Security. See [SECURITY_GUIDE.md](./SECURITY_GUIDE.md).

---

## S

**Service role key** — A Supabase key that bypasses all RLS policies. Must never be used in frontend code. Used only in server-side code for administrative operations.

**Service worker** — A script (`public/sw.js`) that runs in the background in the browser. Enables PWA features: offline caching, push notification delivery.

**Site language** — The language in which BharatLingo's UI is displayed. Stored in `localStorage.bharatlingo_site_lang`. Always kept in sync with `user.preferredLanguage`.

**SM-2** — SuperMemo 2. The spaced repetition algorithm used by BharatLingo. The same algorithm used by Anki. See [LEARNING_ENGINE.md](./LEARNING_ENGINE.md).

**Spaced repetition** — A learning technique that schedules review of vocabulary at increasing intervals. Items you know well are reviewed less often; items you struggle with are reviewed more often.

**Streak** — The number of consecutive days a user has completed at least one learning activity. Stored in `user.streak` and protected by the reward field trigger.

**Supabase** — The hosted PostgreSQL + Auth platform BharatLingo uses as its backend database and authentication provider.

---

## T

**Tailwind CSS** — A utility-first CSS framework. Instead of writing CSS files, you apply utility class names directly to HTML elements: `className="bg-green-700 text-white font-bold"`.

**ThemeContext** — The React Context from `src/services/themeContext.jsx`. Provides `theme`, `setTheme`, `siteLanguage`, `setSiteLanguage`, `t()`, and `tEn()`.

**ThemeProvider** — The outermost context provider in BharatLingo's component tree. All other providers and components are nested inside it.

**TTS** — Text-to-Speech. The API (`/api/tts`) that converts written words into audio. Used to pronounce vocabulary words during exercises.

---

## U

**`updateUser()`** — The function in `AuthProvider` for updating the user's profile. Writes to Supabase, `localStorage`, and React state atomically. See `src/services/auth.jsx`.

**Upsert** — A database operation that INSERTs a new row if it doesn't exist, or UPDATEs the existing row if it does. Used in BharatLingo for `user_progress` (one row per lesson per user).

---

## V

**VAPID** — Voluntary Application Server Identification. The cryptographic protocol for Web Push notifications. Requires a public/private key pair. The private key must never be in frontend code.

**Vite** — The build tool and development server for BharatLingo's React frontend. Provides fast hot module replacement during development and optimized bundling for production.

---

## X

**XP** — Experience points. Earned by completing lessons, exercises, and quests. Stored in `user.xp`. Protected from manipulation by the database trigger.

---

## Z

**Zero-cost** — BharatLingo is built on zero-budget principles: free Supabase tier, free Vercel hosting, free npm packages. No paid APIs are used as dependencies.
