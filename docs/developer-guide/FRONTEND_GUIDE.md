# BharatLingo — Frontend Guide

> **For the learner-developer:** This document describes how the React frontend is organised, what each page does, how components are structured, and how state is managed. Read [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md) first.

---

## React fundamentals used in this project

Before diving in, here are the core React concepts BharatLingo uses:

| Concept | What it means | Where used |
|---|---|---|
| **Component** | A function that returns UI (JSX) | Every file in `src/pages/` and `src/components/` |
| **State** (`useState`) | A value that, when changed, re-renders the component | Exercise answer state, modal open/close |
| **Effect** (`useEffect`) | Code that runs after render (e.g., fetch data, sync storage) | Profile loading, language sync |
| **Context** | Global state shared across the entire tree | `AuthContext`, `ThemeContext`, `ProgressContext` |
| **Custom Hook** | A function that re-uses stateful logic | `useAuth()`, `useTheme()`, `useProgress()` |
| **Lazy loading** | Loading a component only when it is needed | All feature pages in `App.jsx` |
| **Ref** (`useRef`) | A mutable value that does NOT cause re-renders | `userRef` in `auth.jsx` for race-condition safety |

---

## Pages directory (`src/pages/`)

Each subdirectory is one screen of the application.

| Page | Route | Purpose |
|---|---|---|
| `Welcome/` | `/` | Landing page shown to unauthenticated visitors |
| `Login/` | `/login` | Email/password login form |
| `Signup/` | `/signup` | Account creation form |
| `Onboarding/` | `/onboarding` | 4-step profile setup (Age, Language, Target, Goal) |
| `Assessment/` | `/assessment` | "Find Your Starting Level" — 10 placement questions |
| `Dashboard/` | `/dashboard` | Main hub: course map, XP stats, quick actions |
| `Lesson/` | `/lesson/:lessonId` | Interactive lesson with exercise sequence |
| `Practice/` | `/practice` | Spaced repetition review of past vocabulary |
| `Review/` | `/review` | Mistake review and reinforcement |
| `Stories/` | `/stories` and `/story/:id` | Short reading passages in the target language |
| `Tutor/` | `/tutor` | AI conversation tutor |
| `Alphabet/` | `/letters` | Script and alphabet explorer |
| `Writing/` | `/writing` | Stroke-by-stroke character writing practice |
| `Games/` | `/games` and `/games/:gameId` | Language mini-games hub |
| `Speaking/` | `/speaking` | Pronunciation and speaking practice |
| `Leaderboard/` | `/leaderboard` | XP rankings among users |
| `Profile/` | `/profile` | View and edit user profile |
| `Settings/` | `/settings` | App preferences |
| `Admin/` | `/admin` | Admin dashboard (admin role required) |

---

## Components directory (`src/components/`)

Reusable UI pieces shared across multiple pages.

| Component | What it does |
|---|---|
| `Navigation/` | The left sidebar navigation (desktop) and bottom bar (mobile) |
| `RightSidebar/` | Translator widget, daily quests, leaderboard preview |
| `ProtectedRoute/` | Route guard: redirects unauthenticated or incomplete users |
| `AdminRoute/` | Route guard: also checks for admin role |
| `ErrorBoundary/` | Catches React render errors and shows a fallback UI |
| `PWAInstallPrompt/` | "Add to Home Screen" banner |
| `QuestionCard/` | Base card wrapper for exercises |
| `WordBank/` | Drag/tap word tiles for sentence construction exercises |
| `ProgressBar/` | Animated XP/lesson progress indicator |
| `CelebrationModal/` | Animated modal shown on lesson completion |
| `StreakBadge/` | Displays current streak count with flame icon |
| `XPBadge/` | Displays current XP with lightning bolt icon |
| `Mascot/` | The BharatLingo mascot character used for feedback |
| `AudioButton/` | Play TTS audio for a given word or phrase |
| `SpeakingExercise/` | Microphone-based speaking exercise UI |
| `ListeningExercise/` | Audio playback + answer selection exercise |
| `MatchingExercise/` | Tap-to-match word pairs exercise |
| `SentenceOrderExercise/` | Arrange word tiles into correct sentence order |
| `PictureChoiceExercise/` | Select the image that matches the word |
| `ReadingExercise/` | Passage + comprehension question |
| `WritingPad/` | Canvas-based stroke drawing pad |
| `LanguageCard/` | Card displaying a language option (flag, name) |
| `LanguageDropdown/` | Dropdown to switch site language or learning language |
| `LanguageFlag/` | Renders a language's emoji flag |
| `SiteSettingsBar/` | Quick-access bar for theme and language switching |
| `ActivityChart/` | Weekly learning activity bar chart |
| `Logo/` | BharatLingo logo lockup |
| `Button/` | Shared styled button component |

---

## How a page and its components communicate

A page component (e.g., `Dashboard`) is the **owner** of data for that screen. It reads from contexts and passes data down to smaller components via **props**.

```
Dashboard (page)
  ├── reads user from useAuth()
  ├── reads t() from useTheme()
  ├── renders <Navigation /> — receives no special props
  ├── renders <ActivityChart data={learnerStats} />
  └── renders <RightSidebar />
        └── renders <DailyQuests quests={quests} />
```

A **prop** is a value passed from a parent component to a child. The child displays it but cannot change the parent's state directly — it must call a function passed down as a prop.

---

## Lazy loading explained

In `src/App.jsx`:
```js
const Dashboard = lazy(() => import('./pages/Dashboard'))
```

This tells React: "Don't download the Dashboard code until the user actually navigates to `/dashboard`." This keeps the initial page load fast. The `Suspense` wrapper around all routes shows the `PageLoader` spinner while a lazy page loads.

**Welcome, Login, and Signup are NOT lazy-loaded** because they are the first pages a user sees. Lazy-loading them would cause a visible spinner on the very first visit.

---

## Tailwind CSS — utility-first styling

Instead of writing CSS files, BharatLingo applies CSS classes directly in JSX:

```jsx
<button className="bg-[#0B8F62] text-white font-bold px-6 py-3 rounded-xl hover:bg-green-700">
  Continue
</button>
```

Each class name is a single CSS property:
- `bg-[#0B8F62]` → `background-color: #0B8F62`
- `text-white` → `color: white`
- `font-bold` → `font-weight: bold`
- `px-6` → `padding-left: 1.5rem; padding-right: 1.5rem`
- `rounded-xl` → `border-radius: 0.75rem`

Dark mode: classes prefixed with `dark:` apply only when the `dark` class is on `<html>`:
```jsx
<div className="bg-white dark:bg-slate-900">
```

Custom brand colors (`#0B8F62`, `#F7F5EF`, `#77736B`) are used directly with Tailwind's arbitrary value syntax `bg-[#hex]`.

---

## Framer Motion — animations

BharatLingo uses Framer Motion for smooth transitions on exercise cards, modals, and feedback UI:

```jsx
import { motion } from 'framer-motion'

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0 }}
>
  ...
</motion.div>
```

- `initial` — the starting state before the animation
- `animate` — the target state
- `exit` — the state when the component unmounts (requires `AnimatePresence`)

---

## How to add a new page

1. Create `src/pages/MyNewPage/index.jsx`
2. Import and add a lazy route in `src/App.jsx`:
   ```js
   const MyNewPage = lazy(() => import('./pages/MyNewPage'))
   // ...
   <Route path="/my-page" element={<ProtectedRoute><MyNewPage /></ProtectedRoute>} />
   ```
3. Add navigation link to `src/components/Navigation/`
4. Add any new translation keys to `src/services/uiTranslations.js` (all 8 languages)

---

## Common patterns you will see

### Reading context in any component
```js
const { user } = useAuth()       // from src/services/auth.jsx
const { t, siteLanguage } = useTheme()  // from src/services/themeContext.jsx
const { gems, addGems } = useProgress() // from src/services/progress.jsx
```

### Conditional rendering
```jsx
{user ? <Dashboard /> : <Login />}
{isLoading && <Spinner />}
```

### List rendering
```jsx
{lessons.map(lesson => (
  <LessonCard key={lesson.id} lesson={lesson} />
))}
```

Always provide a `key` prop when rendering lists — React uses it to track which items changed.
