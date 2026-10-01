# BharatLingo

**Learn Indian languages through interactive gamified lessons, voice speech practice, authentic script tracing, conversational stories, AI tutoring, interactive arcade games, and adaptive spaced review.**

BharatLingo is a full-featured, culturally immersive language-learning platform built with React and Vite for 8 languages: **Hindi, Marathi, Tamil, Telugu, Bengali, Punjabi, Gujarati, and English**. It functions locally with zero external dependencies by default, with Supabase and Indic NLP microservices available for full cloud synchronization, real-time analytics, and advanced neural AI features.

---

## 🚀 Recent Progress & Completed Milestones

### 1. Pedagogical Games Hub & Game Arena (10 Interactive Modes)
- **Unified Game Runner (`/games` & `/games/:gameId`)**: Built a high-performance arcade engine featuring round progression, countdown timers, sound FX integration, instant educational feedback, and heart-free persistence of XP & Gems.
- **10 Core Pedagogical Game Modes**:
  1. **Word Match**: Interactive multi-choice vocabulary mapping.
  2. **Word Scramble / Sentence Builder**: Token bank reconstruction with unique slot IDs.
  3. **Listening Challenge**: Real-time Indic audio playback with multiple-choice comprehension.
  4. **Quick Translation**: Rapid target-to-preferred and preferred-to-target language drilling.
  5. **Picture Match**: Visual concept matching featuring authentic SVG illustrations and prominent localized concept clues.
  6. **Odd One Out**: Semantic category contrast drills (food, nature, animals, family, civic).
  7. **Memory Cards**: Interactive grid card flip matching words to meanings.
  8. **Script Challenge**: Native character identification and phoneme recognition across 6 distinct Indian scripts.
  9. **Pronunciation Challenge**: Voice recording with speech recognition and syllable accuracy scoring.
  10. **Speed Round**: 45-second rapid-fire fluency drill with combo multipliers.
- **Visual Clarity & Concept Badges**: Replaced ambiguous default emblems with dedicated SVG illustrations (`no.svg`, `yes.svg`, `family.svg`, `city.svg`, `road.svg`, etc.) and added localized concept meaning badges (`Meaning: नाही / No`) so learners are never left guessing.

### 2. Admin Dashboard & Live Telemetry Console (`/admin`)
- **Strict Role-Based Authorization**: Protected by `AdminRoute`, verifying authenticated administrative claims (`role === 'admin'`, `is_admin === true`, or designated `VITE_ADMIN_EMAIL`) with a graceful 403 Forbidden fallback screen.
- **5 Comprehensive Management Tabs**:
  1. **System Overview**: Live KPI cards for registered users, active learners (7-day), new signups (30-day), total lessons completed, total XP distributed, and gems in circulation.
  2. **Learner Directory**: Full user table with live search (by name, email, or user ID), language filters, and a slide-out profile inspection drawer detailing user achievements, quests, and language progress.
  3. **Language Analytics**: Enrollment and interface preference distribution charts across all 8 Indian languages with percentage breakdowns.
  4. **Learning Activity & Streaks**: Retention metrics, streak milestones, learner level distributions, and exercise accuracy telemetry.
  5. **Curriculum & Script Health Audit**: Real-time inventory auditing lessons, exercise pools, alphabet character counts, and authentic stroke-tracing data availability per language.

### 3. Strict User Identity Isolation & ACID Guarantees
- **Zero Cross-Account Leakage**: Implemented strict user isolation guards in profile merging (`mergeUserProfiles`). User B logging into a browser where User A previously practiced will never inherit User A's XP, gems, streak, or completed lessons.
- **Safe Boolean Mapping**: Fixed JavaScript nullish coalescing handling for Supabase's `has_completed_assessment BOOLEAN DEFAULT false` column. Active learners are recognized durably and never routed back into placement assessments upon login.
- **Decoupled Language State**: Interface language (`preferredLanguage`) and target learning language (`learningLanguage`) operate independently—e.g., learners can learn Gujarati through a Marathi or Hindi interface with zero English leakage or Hindi fallback.

### 4. Dynamic UI Localization Across 8 Indian Languages
- **Full UI Localization Engine**: All 584 UI translation keys are maintained in `src/services/uiTranslations.js` (~348 KB), covering all 8 supported languages: English (`en`), Hindi (`hi`), Marathi (`mr`), Tamil (`ta`), Telugu (`te`), Bengali (`bn`), Punjabi (`pa`), and Gujarati (`gu`). `themeContext.jsx` is the theme/language **context layer** that resolves the active language and exposes `t(key)` — it is not the translation store itself.
- **Zero Leaks (Audit-Verified)**: `tests/localizationAudit.test.mjs` confirms all 584 keys are populated across all 8 site languages with no English fallback leakage.
- **Unified Two-Way Synchronization**: UI interface language and user preference are unified in 100% two-way sync across `localStorage`, Supabase, and internal event buses (`bharatlingo_site_lang_changed`).

### 5. Streamlined Onboarding & Welcoming Assessment
- **Friendly Terminology**: Learner-facing copy is standardized on **"Find Your Starting Level"** with the onboarding button **`Find My Level →`**. The phrase "Placement Assessment" is never shown to learners.
- **Source Directory Preserved**: The page component and its route still live in `src/pages/Assessment/`. This is a source-level name only — it does not change the welcoming learner-facing framing.
- **Frictionless Signup**: Streamlined onboarding to 4 core steps (Age, Preferred Language, Target Language, Goal), applying an optimal 10-minute daily practice default. There is no "How much time do you want to practice?" step; the 10-minute default is saved to the user profile automatically.

---

## ✨ Features

- **Comprehensive Multi-Language Foundation**: Curated lessons, vocabulary, alphabets, conversation scenarios, and stroke reference data across 8 languages.
- **Rich Exercise Varieties**:
  - Multiple choice & vocabulary recognition
  - Word Bank sentence building & reordering
  - Matching pairs & flashcard drills
  - Listening comprehension with Indic voice audio
  - Speaking exercises with browser speech recognition & zero-penalty skip fallback
  - Reading comprehension & visual concept matching
- **Adaptive Learning & Spaced Repetition**:
  - Dynamic lesson engine tailored to user proficiency, goals, and age range.
  - SM-2 spaced repetition algorithm for reviewing weak vocabulary and long-term retention.
  - Granular skill radar: Vocabulary, Grammar, Listening, and Speaking proficiencies.
- **Gamification & Habit Building**:
  - Daily Quests with XP rewards
  - Streak tracking with milestone celebrations and weekly activity heatmaps
  - Gem economy
  - League Leaderboards (Bronze through Diamond leagues)
  - Achievement badges
- **Cultural & Interactive Hubs**:
  - **Games Hub & Arena**: 10 pedagogical game modes for bite-sized fun.
  - **Conversational Stories**: Interactive stories with branching comprehension checkpoints.
  - **AI Conversation Tutor**: Scenario-based dialogue practice with real-time feedback.
  - **Script & Alphabet Tracing**: Interactive stroke-by-stroke character writing canvas with accuracy scoring.
  - **Live AI Translator**: Instant translation and pronunciation lookup widget.
  - **Admin Console**: Live telemetry, user directory, and curriculum auditing.

---

## 🇮🇳 Supported Languages

| Code | Language | Native Name | Script |
| --- | --- | --- | --- |
| `hi` | Hindi | हिन्दी | Devanagari |
| `mr` | Marathi | मराठी | Devanagari |
| `ta` | Tamil | தமிழ் | Tamil |
| `te` | Telugu | తెలుగు | Telugu |
| `bn` | Bengali | বাংলা | Bengali |
| `pa` | Punjabi | ਪੰਜਾਬੀ | Gurmukhi |
| `gu` | Gujarati | ગુજરાતી | Gujarati |
| `en` | English | English | Latin |

---

## 🛠️ Technology Stack

- **Frontend**: React 18, React Router v6, Vite, Tailwind CSS, Framer Motion, Lucide Icons.
- **Audio & Speech**: Browser Web Speech API (Synthesis & Recognition) with AudioFX synth sounds.
- **Backend API**: Express server (`server/index.js`) providing adaptive lesson dispatch, learning plan generation, transliteration, and Indic NLP routing. A parallel set of Vercel serverless handlers lives in `api/`.
- **Database & Auth**: Supabase (PostgreSQL, Row Level Security, Auth, Real-time).
- **Localization**: `src/services/uiTranslations.js` — 584 keys × 8 Indian languages (~348 KB), consumed through the `themeContext.jsx` context layer.
- **Notifications**: Web Push via VAPID (`notificationService.js` + `server/services/pushService.js`).
- **Rules & Memory**: `AGENTS.md` persistent instructions for autonomous development and architectural adherence.

---

## 🏁 Getting Started

### Prerequisites
- Node.js 18+
- npm

### Installation & Local Run

```bash
# 1. Install dependencies
npm install

# 2. Configure environment variables
Copy-Item .env.example .env    # PowerShell
# or: cp .env.example .env     # Bash

# 3. Launch Vite client and API server concurrently
npm run dev
```

- **Client App**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000`
- **Admin Console**: `http://localhost:5173/admin` *(requires admin role or `VITE_ADMIN_EMAIL`)*

### Available Scripts

```bash
npm run dev                    # Concurrently runs client and server
npm run dev:client             # Vite frontend only
npm run dev:server             # Express API server only
npm run build                  # Production client build
npm run preview                # Preview production build locally
node scripts/runAllTests.mjs   # Unified runner: imports and runs all 12 suites in a single Node process
node --test tests/*.test.mjs   # Node test runner across the .test.mjs suites
```

### Verification Status

| Check | Result |
| --- | --- |
| `node --test tests/*.test.mjs` | **68 / 68 tests passing**, 0 failures |
| `node scripts/runAllTests.mjs` | **12 suites**, single process, exits successfully (exit code 0) |
| Localization audit | **584 / 584 keys** populated across all 8 site languages — zero leaks |
| Supabase schema | Verified against `supabase/schema.sql` and `supabase/migrations/` |
| Server route mounting | Verified — all 6 routers (`translation`, `speech`, `lessons`, `tts`, `indicNlp`, `push`) mount under `/api` |

---

## ⚙️ Environment Configuration

Copy `.env.example` to `.env`. The core client functions fully with local storage without requiring external credentials.

```env
PORT=5000

# Optional Supabase Cloud Sync
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Optional Designated Administrator Email (grants /admin access locally & in production)
VITE_ADMIN_EMAIL=admin@bharatlingo.com

# Web Push / VAPID Configuration
VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
VAPID_SUBJECT=mailto:support@bharatlingo.in
VITE_VAPID_PUBLIC_KEY=your-vapid-public-key

# Optional Indic NLP Microservice Endpoints
INDICTRANS_URL=http://127.0.0.1:8000
INDICCONFORMER_URL=http://127.0.0.1:8001
# INDICXLIT_URL=http://127.0.0.1:8003

# SM-2 Live Verification (tests/verify_supabase_sm2.mjs)
# These are NEVER committed -- set in .env (gitignored) or CI secrets only.
# Without them the test skips cleanly with exit code 0.
# SUPABASE_URL=https://your-project-id.supabase.co      # or use VITE_SUPABASE_URL
# SUPABASE_ANON_KEY=your-anon-key-here                  # or use VITE_SUPABASE_ANON_KEY
# SUPABASE_TEST_JWT=<valid-user-jwt-from-supabase-session>
# SUPABASE_TEST_USER_ID=<uuid-of-test-user>
# SUPABASE_TEST_OTHER_USER_ID=<uuid-of-second-user-for-isolation-check>
```

---

## 🔌 API Endpoints

| Route | Method | Purpose |
| --- | --- | --- |
| `/api/health` | GET | API status & Indic NLP capability report |
| `/api/languages` | GET | Supported language and script inventory |
| `/api/lessons/adaptive` | GET | Dynamically selected next lesson based on learner stats |
| `/api/lessons/dynamic` | GET | Bounded adaptive lesson set |
| `/api/lessons/dynamic/:index` | GET | Single lesson by index from the dynamic set |
| `/api/assessment/questions` | GET | Starting level check questions ("Find Your Starting Level") |
| `/api/learning-plan` | POST | Generates personalized learning plan |
| `/api/translate` | POST | IndicTrans2 translation with curated offline fallbacks |
| `/api/speech-to-text` | POST | IndicConformer ASR with browser Web Speech guidance |
| `/api/tts` | GET/POST | High-fidelity Indic text-to-speech audio stream |
| `/api/transliterate` | POST | IndicXlit roman-to-native script transliteration |
| `/api/language-identify` | POST | Rule-based Indian script detection |
| `/api/push/public-key` | GET | VAPID public key for Web Push subscription |
| `/api/push/send-test` | POST | Sends a test Web Push notification |

---

## 📁 Repository Layout

```text
├── public/
│   ├── images/vocab/     # Visual SVG illustrations (apple, water, no, yes, city, road, etc.)
│   └── sounds/           # Audio effects (correct, wrong, completion, click)
├── src/
│   ├── components/       # Reusable UI widgets (AudioButton, WordBank, Navigation, AdminRoute, etc.)
│   ├── data/             # Curated lesson sets, alphabets, stroke data, stories, questions
│   ├── pages/            # Page views:
│   │   ├── Admin/        # Admin Telemetry & Content Health Console
│   │   ├── Alphabet/     # Interactive alphabet catalogue
│   │   ├── Assessment/   # Starting level check (learner-facing: "Find Your Starting Level")
│   │   ├── Dashboard/    # Learner Dashboard & adaptive recommendations
│   │   ├── Games/        # Games Hub & Game Arena (10 game modes)
│   │   ├── Leaderboard/  # League standings (Bronze → Diamond)
│   │   ├── Lesson/       # Gamified exercise player
│   │   ├── Login/        # Sign-in
│   │   ├── Onboarding/   # 4-step onboarding (Age, Preferred Language, Target Language, Goal)
│   │   ├── Practice/     # Free practice hub
│   │   ├── Profile/      # Learner profile & achievements
│   │   ├── Review/       # SM-2 spaced review session
│   │   ├── Settings/     # Language, audio & notification preferences
│   │   ├── Signup/       # Account registration
│   │   ├── Speaking/     # Pronunciation practice with speech recognition
│   │   ├── Stories/      # Conversational stories & reader
│   │   ├── Tutor/        # Scenario-based AI dialogue tutor
│   │   ├── Welcome/      # Welcome / entry screen
│   │   └── Writing/      # Canvas character stroke tracing
│   ├── services/         # Auth, Admin, DB, SM-2 Spaced Repetition, Game Engine, Audio,
│   │                     # Adaptive + Dynamic Lesson engines, Exercise Pool, AI/Tutor,
│   │                     # Mistake, Notification, Learner Model, Theme Context,
│   │                     # uiTranslations.js (584 keys × 8 languages)
│   └── utils/            # Confetti, Canvas tracing algorithms, Web Audio effects
├── api/                  # Vercel serverless handlers (lessons, translate, tts,
│                         # speech-to-text, learning-plan, assessment-questions, push)
├── server/
│   ├── routes/           # Express endpoint routers (translation, speech, lessons, tts,
│   │                     # indicNlp, push) — all mounted under /api
│   └── services/         # Lesson engine, Indic NLP client adapters, TTS, speech, push
├── scripts/              # Build, deploy & verification utilities
│   ├── runAllTests.mjs   # Unified test runner (12 suites, single Node process)
│   ├── buildProduction.mjs
│   ├── deployVercelAPI.mjs
│   ├── inspectLiveDomain.mjs
│   └── smokeTest.mjs
├── docs/                 # Architecture & foundation documentation (INDIC_NLP_FOUNDATION.md)
├── scratch/              # Local diagnostics, benchmarks & measurement harnesses
├── supabase/
│   ├── schema.sql        # Core DB schema with RLS policies
│   └── migrations/       # Incremental database migrations
├── tests/                # Automated verification suites (Admin, Games, Assessment, State,
│                         # NLP, Localization, PWA, Speaking Audio, Tutor, SM-2, Lesson UX)
├── AGENTS.md             # Persistent project rules & AI memory
└── README.md             # This document
```

---

## 📜 License

This project is created for educational and language preservation purposes. Respect attribution, dataset, and model licenses when using external resources.
