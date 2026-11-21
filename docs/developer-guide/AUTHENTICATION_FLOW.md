# BharatLingo — Authentication Flow

> **For the learner-developer:** This document traces every authentication path in BharatLingo — login, signup, Google OAuth, page load, and logout — through actual code. This is one of the most important documents to understand because authentication determines what every user can see and do.

---

## What authentication means here

**Authentication** = "proving you are who you say you are"
**Authorization** = "determining what you are allowed to do"

In BharatLingo:
- Authentication is handled by **Supabase Auth** (or locally by `bcryptjs` in demo mode)
- Authorization is handled by **React route guards** (`ProtectedRoute`) and **Supabase RLS policies**

---

## Files involved

| File | Responsibility |
|---|---|
| `src/services/auth.jsx` | `AuthProvider` — the central auth engine |
| `src/services/authUtils.js` | Pure helper functions (profile mapping, routing logic) |
| `src/services/supabase.js` | Supabase client initialization |
| `src/components/ProtectedRoute/ProtectedRoute.jsx` | Route guard — redirects based on auth state |
| `src/pages/Login/Login.jsx` | Login form UI |
| `src/pages/Signup/Signup.jsx` | Signup form UI |

---

## The two operating modes

BharatLingo always tries Supabase first, then falls back to localStorage:

```
isSupabaseConfigured()
  ├── true  → Uses Supabase Auth + PostgreSQL database
  └── false → Uses localStorage only (demo / offline mode)
```

`isSupabaseConfigured()` checks that `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set and not placeholder values. If running locally without a `.env` file, the app always runs in local mode.

---

## Signup flow

**Entry point:** `src/pages/Signup/Signup.jsx` calls `signup(name, email, password)` from `useAuth()`

```
signup(name, email, password)
│
├── [Supabase mode]
│   supabase.auth.signUp({ email, password, options: { data: { name } } })
│   │
│   ├── Success with session (email confirmation disabled in Supabase):
│   │   fetchSupabaseProfile(user) → mapProfileToUser(profile, authUser)
│   │   mergeUserProfiles(remote, local)
│   │   localStorage.setItem('bharatlingo_user', ...)
│   │   syncSiteLanguage(preferredLanguage)
│   │   return { user, session, requiresConfirmation: false }
│   │
│   └── Success without session (email confirmation required):
│       return { requiresConfirmation: true }
│       ← UI shows "Check your email" message, no session stored
│
├── [Local mode]
│   bcryptjs.hash(password, 10) → hashed password
│   Push new user to localStorage 'bharatlingo_users' array
│   localStorage.setItem('bharatlingo_user', newUser)
│   return { user, session: { local: true } }
│
└── [Error handling]
    "Database error saving new user" → Supabase trigger failed
    → Shows specific fix instruction (run fix SQL in Supabase Editor)
```

**What happens in Supabase on signup:**
1. `auth.users` row is created by Supabase
2. The `on_auth_user_created` trigger fires → creates `profiles` row and `streaks` row automatically
3. The app then fetches the new profile with `fetchSupabaseProfile()`

---

## Login flow

**Entry point:** `src/pages/Login/Login.jsx` calls `login(email, password)` from `useAuth()`

```
login(email, password)
│
├── [Supabase mode]
│   supabase.auth.signInWithPassword({ email, password })
│   │
│   ├── Success:
│   │   fetchSupabaseProfile(user) → remote profile from 'profiles' table
│   │   mergeUserProfiles(remoteProfile, localCache)  ← CRITICAL: monotonic merge
│   │   localStorage.setItem('bharatlingo_user', merged)
│   │   syncUserSpacedRepetition(userId)  ← loads SM-2 deck from cloud
│   │   syncSiteLanguage(preferredLanguage)
│   │   return mergedProfile
│   │
│   ├── Error "email not confirmed":
│   │   Bypass auth — query profiles table directly by email
│   │   Build fallback user from profile
│   │   return fallbackUser  ← user is "logged in" without confirmed email
│   │
│   └── Other error: throw Error(message) → UI shows error
│
├── [Local mode — registered user found]
│   Find user in localStorage 'bharatlingo_users'
│   bcryptjs.compare(password, stored hash)
│   If match → merge with current state → return resolvedUser
│   If no match → throw "Incorrect password"
│
└── [Local mode — unrecognized email]  ⚠️ RISK
    Creates a NEW mock user for the email
    Hashes the password and saves to 'bharatlingo_users'
    Returns the new mock user
    ← Any email + any password silently creates an account in local mode
```

**⚠️ The local fallback "create account for unknown email" is a development shortcut that must be removed before production deployment.**

---

## Google OAuth flow

**Entry point:** "Continue with Google" button calls `loginWithGoogle()` from `useAuth()`

```
loginWithGoogle()
│
├── [Supabase mode]
│   supabase.auth.signInWithOAuth({ provider: 'google', redirectTo: origin + '/onboarding' })
│   │
│   ├── Success: Supabase redirects browser to Google → Google redirects back to /onboarding
│   │   onAuthStateChange fires with SIGNED_IN event → profile loaded automatically
│   │
│   └── Error (OAuth not enabled): fall through to local fallback
│
└── [Local mode — Google fallback]
    Creates a mock Google profile with id prefixed 'google_'
    Preserves existing google_ session data if one exists
    Stores in localStorage
```

---

## Page load — session restoration

This runs **once when the app first loads**, inside `AuthProvider`'s `useEffect`.

```
initAuth()
│
├── Step 1: Immediate localStorage hydration
│   Read 'bharatlingo_user' from localStorage
│   If found → setUser(localUser) immediately
│   ← This prevents a flash of unauthenticated state
│
├── Step 2: Supabase session check (async)
│   supabase.auth.getSession()
│   If valid session found:
│     fetchSupabaseProfile(session.user)
│     mergeUserProfiles(remote, local)  ← always takes the MAXIMUM of XP/gems/streak
│     setUser(merged)
│     localStorage updated with merged state
│     syncUserSpacedRepetition()  ← SM-2 deck loaded from cloud
│
└── Step 3: Set loading = false
    ← ProtectedRoute stops showing spinner and renders the page
```

**Also running continuously:** `supabase.auth.onAuthStateChange()` listener
- `SIGNED_IN` event → runs the same fetchProfile + merge flow
- `SIGNED_OUT` event → clears all state including SM-2 data

---

## Logout flow

```
logout()
│
├── supabase.auth.signOut()  ← invalidates the Supabase session
├── setUser(null)
├── localStorage.removeItem('bharatlingo_user')
├── localStorage.removeItem('bharatlingo_learner_stats_v2')
├── sessionStorage.removeItem('bharatlingo_assessment_required')
├── sessionStorage.removeItem('bharatlingo_just_assessed')
├── clearSM2Data(userId)  ← removes user-scoped SM-2 localStorage key
└── syncSiteLanguage('en')  ← resets UI language to English
```

---

## The profile mapping functions (from `authUtils.js`)

These are pure functions — they transform data without any side effects.

### `mapProfileToUser(profile, authUser)`
Converts a Supabase `profiles` database row (snake_case) into the app's user object (camelCase).
```
profiles.preferred_language  →  user.preferredLanguage
profiles.learning_language   →  user.learningLanguage
profiles.has_completed_assessment → user.hasCompletedAssessment
profiles.assessment_score    →  user.assessmentScore
...etc
```

### `mapUserUpdatesToProfile(updates)`
The reverse — converts app-side user updates back to database column names for `UPDATE` queries.

### `mergeUserProfiles(remoteProfile, localProfile)`
The most critical function in auth. Called on every login and page load.

**What it does:**
- Takes MAXIMUM of XP, gems, streak (never decreases on sync)
- Takes UNION of completedLessons, achievements, legendaryCompleted (never loses items)
- Merges language-specific progress dictionaries
- Prefers `localProfile` for most settings (most recent user action)
- Guards against cross-user data: if IDs don't match, returns `remoteProfile` only

```js
// XP can only go up:
const mergedXP = Math.max(remoteXP, localXP)

// Completed lessons are unioned (never removed):
const mergedCompleted = Array.from(new Set([
  ...remoteProfile.completedLessons,
  ...localProfile.completedLessons,
]))
```

---

## Route guarding (`ProtectedRoute`)

Every page inside the main app is wrapped in `ProtectedRoute`. It enforces the user journey.

```
ProtectedRoute
│
├── loading = true  →  Show spinner
├── user = null     →  Navigate to /login
├── !hasUserCompletedOnboarding(user)
│     and currentPath !== '/onboarding'  →  Navigate to /onboarding
├── !hasUserCompletedAssessment(user)
│     and currentPath !== '/assessment'  →  Navigate to /assessment
├── currentPath is /onboarding or /assessment
│     but user is fully set up           →  Navigate to /dashboard
└── Otherwise                            →  Render the page
```

**`hasUserCompletedOnboarding(user)`** returns true if:
- `user.learningLanguage` is set, OR
- `user.languageProgress` has any keys (recovery for pre-existing learners)

**`hasUserCompletedAssessment(user)`** returns true if:
- `user.hasCompletedAssessment` is true, OR
- `user.assessmentScore` is not null, OR
- `user.learningPlan` exists, OR
- `user.completedLessons` has any items

---

## `updateUser()` — the profile update function

This is how every part of the app writes to the user profile.

```js
updateUser(updates)
// OR: updateUser(currentUser => ({ xp: currentUser.xp + 25 }))
```

```
updateUser(updates)
│
├── Resolves updates (supports both object and function forms)
├── If Supabase active:
│   mapUserUpdatesToProfile(updates)  ← convert to DB column names
│   supabase.from('profiles').update(...).eq('id', userId)
│   │
│   ├── If error "cannot update xp, gems, or streak directly" (trigger):
│   │   Strip xp/gems/streak from updates → retry with remaining fields
│   │
│   └── If critical fields (hasCompletedAssessment, learningLanguage) fail:
│       throw error  ← do NOT save locally if DB rejected it
│
├── userRef.current = updatedUser  (for immediate access without re-render)
├── setUser(updatedUser)           (triggers re-render)
├── localStorage.setItem(...)      (persists offline)
└── If preferredLanguage changed: syncSiteLanguage()
```

---

## localStorage keys reference

| Key | Contents |
|---|---|
| `bharatlingo_user` | Current user profile object (JSON) |
| `bharatlingo_users` | Array of locally registered users (local mode only) |
| `bharatlingo_site_lang` | Current UI language ISO code |
| `bharatlingo_theme` | Current theme ('light', 'dark', 'saffron', 'emerald') |
| `bharatlingo_learner_stats_v2` | Skill proficiency data for learner model |
| `bharatlingo_sm2_items_{userId}` | Spaced repetition deck for specific user |
| `bharatlingo_mistakes_{lang}` | Mistake bank per language |

---

## 🧪 Practical exercise

Open `src/services/authUtils.js` and read `hasUserCompletedOnboarding()`.

1. What three conditions can make it return `true`?
2. Why does it check `languageProgress` and `completedLessons` even though those are only set after assessment?
3. What would happen if a user somehow cleared `learningLanguage` from their profile but still had completed lessons?

*(These edge cases were specifically handled to prevent users who had already made progress from being redirected back to onboarding after updates.)*
