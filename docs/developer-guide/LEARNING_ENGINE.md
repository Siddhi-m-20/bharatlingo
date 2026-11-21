# BharatLingo — Learning Engine

> **For the learner-developer:** This document explains how BharatLingo generates lessons, assesses learners, and adapts to individual progress. It covers the assessment engine, the adaptive lesson generator, the spaced repetition system, and the learner model.

---

## Overview: three learning systems working together

```
Assessment Engine          → determines starting level + learning plan
    ↓
Adaptive Lesson Engine     → generates 15-exercise lessons based on learner state
    ↓
Spaced Repetition (SM-2)  → schedules vocabulary review at optimal intervals
    ↑
Learner Model              → tracks skill levels and weak areas (feeds back into lessons)
```

---

## 1. Assessment Engine

**Files:** `src/services/dynamicLessonService.js`, `src/services/exercisePool.js`, `src/data/questions/[lang].js`

**Entry point:** `fetchAssessmentQuestions({ languageId, preferredLanguage, ageRange, goal, count: 15 })` in `Assessment.jsx`

### How questions are loaded
```
fetchAssessmentQuestions()
  ├── Try: generateAssessmentSuite() in exercisePool.js
  │         ← Uses static question pool + exercise factories
  └── Fallback: getStaticAssessmentQuestions() from data/questions/[lang].js
                ← Pre-written questions per language
```

**Static question files** exist for all 8 languages:
- `src/data/questions/hindi.js`
- `src/data/questions/marathi.js`
- `src/data/questions/tamil.js`
- `src/data/questions/telugu.js`
- `src/data/questions/bengali.js`
- `src/data/questions/punjabi.js`
- `src/data/questions/gujarati.js`
- `src/data/questions/english.js`

### How scoring works
After 15 questions, `calculateAssessmentResults()` runs:
```js
// Accuracy = (correct / total) * 100
const score = Math.round((correctCount / questions.length) * 100)

// Level mapping:
// 0–30%  → Beginner
// 31–60% → Elementary
// 61–80% → Intermediate
// 81–100% → Advanced
```

### Personalized plan generation
`generatePersonalizedPlan({ score, languageId, goal, ageRange })` creates:
```js
{
  startingLevel: 'Beginner' | 'Elementary' | 'Intermediate' | 'Advanced',
  focusAreas: ['Greetings & Etiquette', 'Everyday Essentials', ...],
  recommendedFirstLesson: 'Greetings & Introductions',
  dailyPractice: '10 min',
  goal: user.goal,
}
```
This is stored in `user.learningPlan` and displayed on the `PersonalizedPlanScreen`.

---

## 2. Adaptive Lesson Engine

**Files:** `src/services/lessonEngine.js`, `src/services/exercisePool.js`

**Entry point:** `generateAdaptiveLesson({ langId, preferredLang, topicId, level, goal })` in `lessonEngine.js`

### The 4-part lesson mix

Every adaptive lesson contains exactly 15 exercises composed from 4 buckets:

| Bucket | % | Exercise types | Purpose |
|---|---|---|---|
| **NEW** | 30% (4–5 exercises) | MCQ, picture choice, meaning selection | Introduce new vocabulary |
| **PRACTICE** | 30% (4–5 exercises) | Translation, fill-blank, listening | Active recall drill |
| **REVIEW** | 25% (3–4 exercises) | Based on SM-2 due items + mistakes | Reinforce at-risk words |
| **CHALLENGE** | 15% (2 exercises) | Sentence order, speaking, challenge | Productive use of language |
| **READING** | 1 exercise (injected at ~position 8) | Reading passage + comprehension | Extended context |

### Topic selection logic

`selectAdaptiveTopic(profile, weakAreas, requestedTopicId)`:
1. If a topic was explicitly requested → use it
2. If learner has a weak topic (accuracy < 75%) → use the weakest
3. If no weak topic → use the least recently practiced topic
4. Default → first topic in the list (Greetings)

### 11 Topic categories

Defined in `src/services/learnerModel.js` as `TOPIC_CATEGORIES`:

| ID | Name | Icon |
|---|---|---|
| `greetings` | Greetings & Etiquette | 🙏 |
| `everyday` | Everyday Essentials | 🌅 |
| `food` | Food & Dining | 🍛 |
| `numbers` | Numbers & Counting | 🔢 |
| `family` | Family & Relations | 👨‍👩‍👦 |
| `travel` | Travel & Directions | 🛺 |
| `market` | Shopping & Market | 🛍️ |
| `grammar` | Grammar & Syntax | 📝 |
| `weather` | Weather & Seasons | 🌤️ |
| `emotions` | Emotions & Feelings | 😊 |
| `culture` | Culture & Traditions | 🎉 |

### How vocabulary is selected for a topic

`extractVocabForTopic(seedLessons, topicId, count)`:
- Applies `TOPIC_KEYWORDS` regex patterns against `{word} {translation} {example}`
- Collects matched vocabulary across all seed lessons for the language
- If fewer than 4 items match, supplements with general vocabulary

### Exercise factory functions (`src/services/exercisePool.js`)

Each function takes vocabulary items and produces an exercise object:

| Factory | Exercise type | What it creates |
|---|---|---|
| `createWordToMeaningMCQ()` | `multiple-choice` | "What does [word] mean?" + 4 options |
| `createMeaningToWordMCQ()` | `multiple-choice` | "How do you say [meaning] in [lang]?" + 4 options |
| `createPictureChoiceExercise()` | `picture-choice` | Match word to image (uses emoji categories) |
| `createTranslationExercise()` | `translation` | "Translate [word]" with text input |
| `createFillBlankExercise()` | `fill-blank` | Complete the sentence with the missing word |
| `createListeningExercise()` | `listening` | Listen to audio, select correct meaning |
| `createSpeakingExercise()` | `speaking` | Speak the word aloud |
| `createMatchingExercise()` | `matching` | Match 4 word-meaning pairs |
| `createSentenceOrderExercise()` | `sentence-order` | Arrange word tiles in correct order |
| `createChallengeExercise()` | `challenge` | Advanced sentence production |

### Reading passages

Defined directly in `lessonEngine.js` as `READING_PASSAGES` — one or two passages per language (all 8 languages), each with:
- A short paragraph in the target language
- A comprehension question
- 4 answer options
- English translation for reference

---

## 3. Lesson progression

**How a lesson runs** (`src/pages/Lesson/Lesson.jsx`):

```
Load lesson (adaptive or static)
  ↓
Show exercises one by one
  → User submits answer
  → recordExerciseAttempt() updates learner model
  → If correct: audioFX.correct() chime, increment correctCount
  → If wrong: audioFX.incorrect() chime, record mistake
  → showResult = true: show feedback + "Continue"
  → Advance to next exercise
  ↓
All exercises done → lessonComplete = true
  → updateStreak()        — extend daily streak
  → addXP(xpEarned)      — add experience points
  → completeLesson(id)   — record completion, award gems
  → persistLearnerStats() — sync skill data to Supabase
  → triggerConfetti()    — celebration animation
  → Show CelebrationModal with results
```

### Legendary mode
Accessed via URL `?mode=legendary`. Same exercises but harder scoring. On completion: `completeLegendaryLesson()` awards 40 XP + 20 gems.

### Gem rewards
- First time completing a lesson: +5 gems
- Repeating a lesson: +2 gems
- Perfect lesson (100% correct): +5 bonus gems
- Legendary mode completion: +20 gems

---

## 4. Spaced Repetition System (SM-2)

**File:** `src/services/spacedRepetition.js`

**What is spaced repetition?** A memorization technique where you review a word at increasing intervals. If you remember it well, the next review is scheduled further in the future. If you forget it, you review it again soon.

**What is SM-2?** The SuperMemo 2 algorithm — the most widely used spaced repetition algorithm, also used by Anki.

### Core data structure (one vocabulary item)

```js
{
  id: 'hi_पानी',           // languageId_word
  word: 'पानी',
  translation: 'Water',
  languageId: 'hi',
  category: 'everyday',
  repetition: 2,            // how many consecutive correct reviews
  interval: 6,              // days until next review
  easeFactor: 2.5,          // how easy this item is (1.3–2.5+)
  quality: 4,               // last rating (0–5)
  lastReviewedAt: '...',
  nextReviewAt: '...',
  retentionScore: 85,       // estimated memory retention %
  history: [...]            // last 14 review events
}
```

### The algorithm (`calculateSM2(item, quality)`)

Quality is 0–5 based on how well the user recalled the word:
- 5: Perfect, no hesitation
- 4: Correct after hesitation
- 3: Correct with difficulty
- 2: Wrong, but answer seemed easy
- 1: Wrong, remembered after seeing answer
- 0: Complete blackout

```
If quality >= 3 (success):
  - repetition 0: next review in 1 day
  - repetition 1: next review in 6 days
  - repetition 2+: next review in interval × easeFactor days

If quality < 3 (failure):
  - reset repetition to 0, review in 1 day

easeFactor update:
  newEF = max(1.3, EF + 0.1 - (5-q) × (0.08 + (5-q) × 0.02))
```

This formula means: correct answers slightly increase how easy the item is marked; wrong answers decrease it. The minimum ease factor is 1.3 (very hard items are still reviewed, just not as far apart).

### Storage

SM-2 items are stored in user-scoped localStorage:
```
key: 'bharatlingo_sm2_items_{userId}'
value: { hi: [item, item, ...], mr: [item, ...], ... }
```

On login, `hydrateSM2FromCloud()` loads items from Supabase `user_spaced_repetition` table into localStorage. Changes sync back to Supabase via `syncSpacedRepetitionItem()` after each review.

### How due items get into lessons

`getDueSM2Items(languageId)` returns all items where `nextReviewAt <= now`. These become the REVIEW bucket in adaptive lessons.

---

## 5. Learner Model

**File:** `src/services/learnerModel.js`

Tracks the learner's skill across 5 dimensions and 11 topics. Stored in `localStorage` key `bharatlingo_learner_stats_v2`.

### Skill proficiencies (0–100%)

| Skill | When it increases |
|---|---|
| `vocabulary` | Correct answers on MCQ, translation, picture exercises |
| `listening` | Correct answers on listening exercises |
| `speaking` | Completed speaking exercises |
| `grammar` | Correct answers on fill-blank, sentence-order exercises |
| `reading` | Correct answers on reading comprehension exercises |

### Topic masteries

Each of the 11 topics tracks:
```js
{
  id: 'food',
  level: 2,           // 1–5
  accuracy: 68,       // recent accuracy %
  attempts: 24,
  correctCount: 16,
  lastPracticedAt: '...',
}
```

### `recordExerciseAttempt(exercise, isCorrect, languageId)`

Called after every exercise in a lesson. Updates:
1. Topic accuracy for the inferred topic
2. Skill proficiency for the inferred skill type
3. If wrong: records to mistake bank (`mistakeService.js`)
4. If SM-2 item exists: updates its review state

### `getWeakAreas(languageId)`

Returns topics and skills where performance is below threshold:
```js
{
  topics: [{ id: 'grammar', accuracy: 45 }, ...],
  skills: [{ skill: 'speaking', proficiency: 30 }, ...],
}
```

This output is used by `generateAdaptiveLesson()` to select what to practice.

---

## 6. Mistake service

**File:** `src/services/mistakeService.js`

Tracks words the user gets wrong, with recency and frequency weighting.

- `recordMistake(word, translation, languageId, exerciseType)` — saves to `localStorage` key `bharatlingo_mistakes_{lang}`
- `getMistakes(languageId)` — returns mistakes sorted by recency × frequency
- Mistakes feed into the REVIEW bucket of adaptive lessons alongside SM-2 due items

---

## Content: lesson seed data

**Files:** `src/data/lessons/[lang].js` (one file per language)

Each file exports an array of lesson objects:
```js
{
  id: 'hi-greetings',
  name: 'Greetings',
  category: 'greetings',
  vocabulary: [
    { word: 'नमस्ते', translation: 'Hello', example: 'नमस्ते, आप कैसे हैं?' },
    ...
  ],
  questions: [ ... ]  // optional pre-built questions
}
```

The `lessonEngine.js` imports all seed lessons via `getLessonsForLanguage(langId)` and uses the vocabulary as raw material for exercise generation.

---

## 🧪 Practical exercise

Open `src/services/lessonEngine.js` and find `generateAdaptiveLesson()`.

1. At what line does it call `selectAdaptiveTopic()`?
2. What is the REVIEW bucket filled with? (Hint: look for `getDueSM2Items` and `getMistakes`)
3. If a user has never practiced before, what topic will be selected? Why?

This function is the most complex in the codebase. Understanding it means understanding how the adaptive system works.
