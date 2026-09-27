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
- **Full UI Localization Engine**: Implemented `themeContext.jsx` covering all 8 supported languages: English (`en`), Hindi (`hi`), Marathi (`mr`), Tamil (`ta`), Telugu (`te`), Bengali (`bn`), Punjabi (`pa`), and Gujarati (`gu`).
- **Unified Two-Way Synchronization**: UI interface language and user preference are unified in 100% two-way sync across `localStorage`, Supabase, and internal event buses (`bharatlingo_site_lang_changed`).

### 5. Streamlined Onboarding & Welcoming Assessment
- **Friendly Terminology**: Standardized on **"Find Your Starting Level"** and **`Find My Level →`**.
- **Frictionless Signup**: Streamlined onboarding to 4 core steps (Age, Preferred Language, Target Language, Goal), applying an optimal 10-minute daily practice default.

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
- **Backend API**: Express server (`server/index.js`) providing adaptive lesson dispatch, learning plan generation, transliteration, and Indic NLP routing.
- **Database & Auth**: Supabase (PostgreSQL, Row Level Security, Auth, Real-time).
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
node --test tests/*.test.mjs   # Run automated test suite
```

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

# Optional Indic NLP Microservice Endpoints
INDICTRANS_URL=http://127.0.0.1:8000
INDICCONFORMER_URL=http://127.0.0.1:8001
# INDICXLIT_URL=http://127.0.0.1:8003
```

---

## 🔌 API Endpoints

| Route | Method | Purpose |
| --- | --- | --- |
| `/api/health` | GET | API status & Indic NLP capability report |
| `/api/lessons/adaptive` | GET | Dynamically selected next lesson based on learner stats |
| `/api/lessons/dynamic` | GET | Bounded adaptive lesson set |
| `/api/assessment/questions` | GET | Starting level check questions |
| `/api/learning-plan` | POST | Generates personalized learning plan |
| `/api/translate` | POST | IndicTrans2 translation with curated offline fallbacks |
| `/api/speech-to-text` | POST | IndicConformer ASR with browser Web Speech guidance |
| `/api/tts` | GET/POST | High-fidelity Indic text-to-speech audio stream |
| `/api/transliterate` | POST | IndicXlit roman-to-native script transliteration |
| `/api/language-identify` | POST | Rule-based Indian script detection |

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
│   │   ├── Games/        # Games Hub & Game Arena (10 game modes)
│   │   ├── Dashboard/    # Learner Dashboard & adaptive recommendations
│   │   ├── Lesson/       # Gamified exercise player
│   │   ├── Assessment/   # Starting level placement assessment
│   │   ├── Stories/      # Conversational stories & reader
│   │   ├── Tutor/        # Scenario-based AI dialogue tutor
│   │   ├── Writing/      # Canvas character stroke tracing
│   │   └── Alphabet/     # Interactive alphabet catalogue
│   ├── services/         # Auth, Admin, DB, SM-2 Spaced Repetition, Game Engine, Audio, Theme
│   └── utils/            # Confetti, Canvas tracing algorithms, Web Audio effects
├── server/
│   ├── routes/           # Express endpoint routers (Indic NLP, lessons, health)
│   └── services/         # Lesson engine, Indic NLP client adapters
├── supabase/
│   ├── schema.sql        # Core DB schema with RLS policies
│   └── migrations/       # Incremental database migrations
├── tests/                # Automated verification suites (Admin, Games, Assessment, State, NLP)
└── AGENTS.md             # Persistent project rules & AI memory
```

---

## 📜 License

This project is created for educational and language preservation purposes. Respect attribution, dataset, and model licenses when using external resources.
