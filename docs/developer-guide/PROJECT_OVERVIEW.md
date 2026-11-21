# BharatLingo — Project Overview

> **For the learner-developer:** This document is your starting point. Read it before anything else. It answers the question: "What is this project, and how does it fit together at a high level?"

---

## What is BharatLingo?

BharatLingo is a web-based language learning application focused on Indian languages. It is modelled after the experience of apps like Duolingo, but designed specifically for learners of Hindi, Marathi, Tamil, Telugu, Bengali, Punjabi, Gujarati, and English.

A user can:

- Create an account and complete a short onboarding flow
- Take a placement-style assessment to find their starting level
- Complete adaptive lessons broken into short exercises
- Track XP (experience points), gems, and daily streaks
- Use spaced repetition to review vocabulary they have learned
- Read short stories in their target language
- Practice with an AI conversation tutor
- Play language games
- Change the language of the app UI itself across all 8 supported languages

---

## Who built it?

BharatLingo was developed as a Springboard capstone project. The main branch of the repository (`bharatlingo/main`) is the active development branch. A submission snapshot lives in `Springboard-BharatLingo-Submission/`.

---

## Technology stack

| Layer         | Technology                     | Why it was chosen                                                               |
| ------------- | ------------------------------ | ------------------------------------------------------------------------------- |
| Frontend UI   | React 18 (Vite)                | Component-based, fast hot reload for development                                |
| Routing       | React Router v6                | Standard SPA routing; supports lazy-loaded pages                                |
| Styling       | Tailwind CSS                   | Utility-first; no separate CSS files needed                                     |
| Animation     | Framer Motion                  | Smooth transitions for exercises and modals                                     |
| Backend API   | Express.js (Node)              | Lightweight server for TTS, translation, push notifications                     |
| Database      | Supabase (PostgreSQL)          | Hosted Postgres with built-in auth, real-time, and RLS policies                 |
| Auth          | Supabase Auth + local fallback | Handles sign-up/login; falls back to localStorage if Supabase is not configured |
| Deployment    | Vercel                         | Frontend; serverless API functions in `api/` folder                           |
| Notifications | Web Push (web-push library)    | Browser push notifications for streak reminders                                 |

---

## Directory structure at a glance

```
bharatlingo/
├── src/                        # All React frontend code
│   ├── App.jsx                 # Root component: routing, context providers
│   ├── pages/                  # One folder per screen (Dashboard, Lesson, etc.)
│   ├── components/             # Reusable UI pieces (Navigation, ExerciseCards, etc.)
│   ├── services/               # Business logic, state management, API calls
│   ├── data/                   # Static content (lessons, vocabulary, languages)
│   ├── hooks/                  # Custom React hooks
│   └── styles/                 # Global CSS (Tailwind base + theme variables)
├── server/                     # Express backend (runs locally alongside Vite)
│   ├── index.js                # Entry point; registers all routes
│   └── routes/                 # One file per API endpoint group
├── api/                        # Vercel serverless functions (deployed)
├── supabase/                   # Database migrations
├── docs/                       # Developer documentation (you are here)
├── tests/                      # End-to-end and integration tests
├── public/                     # Static assets (icons, manifest.json for PWA)
└── package.json                # Node dependencies and npm scripts
```

---

## User journey (the happy path)

```
/ (Welcome)
  → /login or /signup
      → /onboarding   (4-step: Age → UI Language → Target Language → Goal)
          → /assessment  ("Find Your Starting Level")
              → /dashboard   (main app hub)
                  ├── /lesson/:id    (interactive lesson)
                  ├── /practice      (spaced repetition review)
                  ├── /stories       (reading comprehension)
                  ├── /tutor         (AI conversation)
                  ├── /games         (language games hub)
                  ├── /letters       (alphabet / script learning)
                  ├── /writing       (stroke-based writing practice)
                  ├── /leaderboard
                  ├── /profile
                  └── /settings
```

Every route inside the main app is wrapped in a `ProtectedRoute` component that redirects unauthenticated users back to `/login`. The `/admin` route additionally requires admin-role verification.

---

## Key design decisions

### 1. Offline-first with Supabase sync

The app works without Supabase configured. User data is stored in `localStorage` first, then synced to the database. This means the app can run in demo mode without credentials.

### 2. Lazy loading for performance

Feature pages are loaded on demand using React's `lazy()` and `Suspense`. Only the Welcome, Login, and Signup pages load eagerly (they are the first pages a user sees).

### 3. Context providers for global state

Three context providers wrap the entire app:

- `ThemeProvider` — theme (light/dark/saffron/emerald) and UI language
- `AuthProvider` — user identity, login/logout, profile sync
- `ProgressProvider` — XP, gems, streaks, quests (depends on `AuthProvider`)

### 4. UI fully localized

All UI text is looked up through a `t(key)` translation function. The translation dictionary lives in `src/services/uiTranslations.js` and covers all 8 languages. No English strings are hardcoded in the main UI.

---

## Running the project locally

```bash
# Install all dependencies
npm install

# Start both the Express API server (port 5000) and the Vite frontend (port 5173)
npm run dev
```

Copy `.env.example` to `.env` and fill in your Supabase project URL and anon key. The app will work in local-only mode without these values.

---

## Next documents to read

- [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md) — how the layers connect
- [AUTHENTICATION_FLOW.md](./AUTHENTICATION_FLOW.md) — how login and profile loading works
- [LEARNING_ENGINE.md](./LEARNING_ENGINE.md) — how lessons and exercises are generated
- [LOCALIZATION_GUIDE.md](./LOCALIZATION_GUIDE.md) — how the multi-language UI works
