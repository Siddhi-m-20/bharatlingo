# BharatLingo

**Learn Indian languages through interactive lessons, audio, speech practice, script tracing, conversational stories, and adaptive spaced review.**

BharatLingo is a full-featured, culturally immersive language-learning platform built with React and Vite for 8 languages: **Hindi, Marathi, Tamil, Telugu, Bengali, Punjabi, Gujarati, and English**. It works locally with zero cloud dependencies by default, with Supabase and Indic NLP microservices available for full cloud synchronization and advanced AI features.

---

## 🚀 Recent Progress & Completed Milestones

### 1. Dynamic UI Localization Across 8 Indian Languages
- **Full UI Localization Engine**: Implemented `themeContext.jsx` covering 8 languages: English (`en`), Hindi (`hi`), Marathi (`mr`), Tamil (`ta`), Telugu (`te`), Bengali (`bn`), Punjabi (`pa`), and Gujarati (`gu`).
- **Dashboard Dynamic Adaptation**: Course titles, personalized path banners, adaptive recommendations, quick hub shortcuts (Stories, AI Tutor, Writing, Script), spaced review retention drills, and streak milestones adapt dynamically.
- **Lesson & Exercise Controls**: Action buttons (`Check Answer`, `Continue`, `Complete Lesson`, `✕ Exit`), hints, and real-time exercise feedback alerts (`✓ Excellent!`, `✗ Not quite right`, `Speaking skipped`, `Correct answer:`) respond instantly to site language changes.
- **Persistent Right Sidebar & Quests**: Live AI Translator, Daily Quests (`Claim Reward` / `Claimed`), and Leaderboard League previews fully localized.

### 2. Unified Two-Way Language Synchronization
- **Real-Time Sync**: *"Site Language"* (UI interface text) and *"I Speak (Questions In)"* (`preferredLanguage`) are unified in 100% two-way sync.
- **Permanent Persistence**: Language preferences persist simultaneously across:
  1. `localStorage` (`bharatlingo_site_lang` & `bharatlingo_user`)
  2. Supabase database table `profiles.preferred_language`
  3. Window event bus (`bharatlingo_site_lang_changed`) for instantaneous zero-reload updates across all mounted components.

### 3. Streamlined Onboarding & Level Check
- **Welcoming Experience**: Replaced clinical "Placement Assessment" phrasing with friendly, motivating terminology: **"Find Your Starting Level"**.
- **Action Button**: Standardized onboarding CTA to **`Find My Level →`**.
- **Frictionless Signup**: Streamlined onboarding to 4 core steps (Age, Preferred Language, Target Language, Goal), removing the daily time question and automatically applying an optimal 10-minute daily practice default.

### 4. ACID Compliance & Robust State Persistence
- **Atomicity & Consistency**: Multi-state operations (XP transactions, Diamond economy, Streaks, Lesson completions, and Profile updates) persist reliably or fail gracefully without desynchronized states.
- **Isolation & Concurrency**: Input locking and debouncing prevent duplicate submissions during rapid exercise interactions.
- **Durability**: All learning records and metrics are committed durably to both local client storage and Supabase (`learning_activity`, `profiles`, `user_progress`).

---

## ✨ Features

- **Comprehensive Multi-Language Foundation**: Curated lessons, vocabulary, alphabets, conversation scenarios, and stroke reference data across 8 languages.
- **Rich Exercise Varieties**:
  - Multiple choice & vocabulary recognition
  - Word Bank sentence building
  - Sentence reordering exercises
  - Matching pairs drills
  - Listening comprehension with audio playback
  - Speaking exercises with browser speech recognition & zero-XP skip fallback
  - Reading comprehension & picture choice
- **Adaptive Learning & Spaced Repetition**:
  - Dynamic lesson engine tailored to user proficiency, goals, and age range.
  - SM-2 spaced repetition algorithm for reviewing weak words and retention candidates.
  - Granular skill radar tracking: Vocabulary, Grammar, Listening, and Speaking proficiencies.
- **Gamification & Habit Building**:
  - Daily Quests with XP rewards
  - Streak tracking with milestone celebrations and detailed week heatmaps
  - Gem/Diamond economy
  - League Leaderboards (Bronze through Diamond leagues)
  - Achievement badges
- **Cultural & Interactive Hubs**:
  - **Conversational Stories**: Interactive stories with branching comprehension checkpoints.
  - **AI Conversation Tutor**: Scenario-based dialogue practice with real-time feedback.
  - **Script & Alphabet Tracing**: Interactive stroke-by-stroke character writing canvas with accuracy scoring.
  - **Live AI Translator**: Fast translation and pronunciation lookup widget.

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

### Available Scripts

```bash
npm run dev           # Concurrently runs client and server
npm run dev:client    # Vite frontend only
npm run dev:server    # Express API server only
npm run build         # Production client build
npm run preview       # Preview production build locally
node --test tests/*.test.mjs  # Run test suite
```

---

## ⚙️ Environment Configuration

Copy `.env.example` to `.env`. The core client functions fully with local storage without requiring external credentials.

```env
PORT=5000

# Optional Supabase Cloud Sync
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

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
├── src/
│   ├── components/       # Reusable UI widgets (AudioButton, WordBank, Navigation, etc.)
│   ├── data/             # Curated lesson sets, alphabets, stories, questions
│   ├── pages/            # Page views (Dashboard, Lesson, Assessment, Stories, Tutor, etc.)
│   ├── services/         # Auth, DB, SM-2 Spaced Repetition, Speech, Themes & Audio
│   └── utils/            # Confetti, Canvas tracing, Web Audio effects
├── server/
│   ├── routes/           # Express endpoint routers (Indic NLP, lessons, health)
│   └── services/         # Lesson engine, Indic NLP client adapters
├── supabase/
│   ├── schema.sql        # Core DB schema with RLS policies
│   └── migrations/       # Incremental database migrations
├── tests/                # Verification tests for state, NLP, and stroke data
└── AGENTS.md             # Persistent project rules & AI memory
```

---

## 📜 License

This project is created for educational and language preservation purposes. Respect attribution, dataset, and model licenses when using external resources.
