# BharatLingo Permanent Project Rules & Memory

This file serves as persistent memory and behavioral guidelines for AI assistants working on BharatLingo.

---

## 1. Onboarding & Assessment Terminology
- **Never use "Placement Assessment"**: The assessment must always be presented with friendly, welcoming phrasing. The canonical title is **"Find Your Starting Level"** (or *"Let's check how much you know"*).
- **Onboarding Button**: The button leading into the level check must say **`Find My Level →`** (never *"Start Assessment"*).
- **No Daily Practice Time Question**: Onboarding has 4 streamlined steps:
  1. Age
  2. Preferred language ("What's your preferred language?")
  3. Target language ("What do you want to learn?")
  4. Learning goal ("What's your goal?")
  - Do NOT re-add the "How much time do you want to practice?" step or options during onboarding. A 10-minute default is saved automatically to user profile.

---

## 2. Permanent Synchronization: Site Language & Preferred Language
- **Unified Sync**: "Site Language" (UI interface text) and "I Speak (Questions In)" (`preferredLanguage`) must **always remain in 100% two-way sync**.
- **Persistence Rules**:
  - Whenever `siteLanguage` or `preferredLanguage` changes, persist to:
    1. `localStorage` key `bharatlingo_site_lang`
    2. `localStorage` key `bharatlingo_user`
    3. Supabase database table `profiles.preferred_language`
    4. Custom event `bharatlingo_site_lang_changed` so all mounted components update dynamically without page reloads.

---

## 3. Dynamic UI Localization across 8 Indian Languages
- **No Hardcoded English in Core UI**:
  - **Dashboard**: Course headers, adaptive recommendations, quick hub buttons, spaced review drills, streak modal, and learner statistics must use `useTheme().t(key)`.
  - **Lesson & Exercise Components**: Action buttons (`check_answer`, `continue`, `complete_lesson`, `exit`, hints, exercise counters) and result alerts (`excellent`, `not_quite`, `speaking_skipped`, `correct_answer_is`) must use `t(key)`.
  - **Right Sidebar & Quests**: Translator header, placeholder, translate/pronounce labels, daily quest titles, claim reward buttons, and leaderboard previews must use `t(key)`.
- **Translations Dictionary**:
  - All keys must be maintained across all 8 supported languages in `src/services/themeContext.jsx`:
    - `en` (English)
    - `hi` (Hindi)
    - `mr` (Marathi)
    - `ta` (Tamil)
    - `te` (Telugu)
    - `bn` (Bengali)
    - `pa` (Punjabi)
    - `gu` (Gujarati)


- **Localization Strategy**:
  - Always check for existing keys in `uiTranslations` before creating new ones.
  - When introducing new UI text, provide genuine, accurate translations across all 8 Indian languages simultaneously.
  - Never leave UI strings partially translated or defaulting to hardcoded English.

---

## 4. Strict ACID Principles & Engineering Rigor (Zero Slacking Off)
- **Atomicity**:
  - Multi-state operations (XP, Gems, Streaks, Lesson completion, Profile sync) must succeed completely or fail gracefully without corrupted half-states. Never leave local storage and database in mismatched states.
- **Consistency**:
  - Strict schema adherence at all times (`profiles`, `learning_activity`, `user_progress`).
  - Core invariants (e.g., non-negative gems/XP, valid language ISO codes, 100% two-way sync between `siteLanguage` and `preferredLanguage`) must be preserved across all writes.
- **Isolation**:
  - Handle race conditions, fast repeated clicks, and asynchronous API calls gracefully (e.g., rapid question submit clicks, concurrent translator queries) using proper state guards, cancellation tokens, or debounce.
- **Durability**:
  - User progress, achievements, answers, and settings must be committed durably to persistent storage (`localStorage` + Supabase database tables) immediately upon action. Never rely purely on transient component state for critical user data.
- **Zero Slacking Off**:
  - No shortcuts, no stubbed placeholders, no `TODO` comments in place of working code, and no half-implemented features.
  - Every feature must be production-ready, fully wired end-to-end, thoroughly verified, and designed with high aesthetic standards.