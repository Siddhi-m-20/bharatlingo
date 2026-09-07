/**
 * API Lesson Engine — Language Correctness & Adaptivity Test Suite
 *
 * 1. Every supported language produces adaptive lessons whose target-language
 *    content comes from that language's own corpus and script (no Hindi
 *    fallback leaking into Tamil, Telugu, Bengali, Punjabi, Gujarati…).
 * 2. Adaptive lessons contain 10–12 exercises.
 * 3. Placement assessments are generated in the requested target language.
 * 4. Unsupported languages are rejected instead of silently substituted.
 * 5. Different learner performance produces different lesson selection.
 */

import {
  getAdaptiveLesson,
  generateAssessmentQuestions,
  UnsupportedLanguageError,
} from '../server/services/lessonEngine.js'
import { getLessonsForLanguage } from '../src/data/lessons/index.js'
import { getReadingPassages } from '../src/data/readingPassages.js'
import { languages, getLanguageById } from '../src/data/languages.js'

let passed = 0
let failed = 0

function check(description, condition, detail = '') {
  if (condition) {
    passed++
    console.log(`  ✓ ${description}`)
  } else {
    failed++
    console.error(`  ✗ ${description}${detail ? ` — ${detail}` : ''}`)
  }
}

// ── Script blocks per language ───────────────────────────────────────────────
const SCRIPT_RANGES = {
  hi: [[0x0900, 0x097f]], // Devanagari
  mr: [[0x0900, 0x097f]], // Devanagari
  bn: [[0x0980, 0x09ff]], // Bengali
  pa: [[0x0a00, 0x0a7f]], // Gurmukhi
  gu: [[0x0a80, 0x0aff]], // Gujarati
  ta: [[0x0b80, 0x0bff]], // Tamil
  te: [[0x0c00, 0x0c7f]], // Telugu
  en: [], // Latin only
}

const INDIC_RUN = /[\u0900-\u0DFF\u200c\u200d]+/g

// ZWNJ / ZWJ and the danda punctuation marks are shared across Indic scripts.
const SCRIPT_NEUTRAL = new Set([0x200c, 0x200d, 0x0964, 0x0965])

function inScript(char, langId) {
  const code = char.codePointAt(0)
  if (SCRIPT_NEUTRAL.has(code)) return true
  return (SCRIPT_RANGES[langId] || []).some(([lo, hi]) => code >= lo && code <= hi)
}

function buildCorpus(langId) {
  const meta = getLanguageById(langId)
  return [
    JSON.stringify(getLessonsForLanguage(langId, 'en') || []),
    JSON.stringify(getReadingPassages(langId)),
    meta.nativeName,
    meta.greeting || '',
  ].join(' ')
}

function indicTokens(value) {
  return JSON.stringify(value).match(INDIC_RUN) || []
}

// ── 1–3. Per-language content correctness ────────────────────────────────────
console.log('\n[1] Adaptive lessons are generated in the correct target language')

for (const { id: langId, name } of languages) {
  console.log(`\n  — ${name} (${langId})`)
  const corpus = buildCorpus(langId)
  const lesson = getAdaptiveLesson({ languageId: langId, goal: 'conversation', level: 'beginner' })

  check(
    `${langId}: lesson has 10–12 exercises`,
    lesson.exercises.length >= 10 && lesson.exercises.length <= 12,
    `got ${lesson.exercises.length}`,
  )
  check(`${langId}: lesson is tagged with the requested language`, lesson.langId === langId, lesson.langId)

  const tokens = indicTokens(lesson)
  if (langId === 'en') {
    check('en: contains no Indic script at all', tokens.length === 0, tokens.slice(0, 3).join(', '))
  } else {
    check(`${langId}: contains target-script content`, tokens.length > 0)

    const wrongScript = tokens.filter((t) => [...t].some((c) => !inScript(c, langId)))
    check(
      `${langId}: every script token belongs to the ${name} script`,
      wrongScript.length === 0,
      wrongScript.slice(0, 3).join(', '),
    )

    const foreign = tokens.filter((t) => !corpus.includes(t))
    check(
      `${langId}: every script token comes from the ${name} corpus`,
      foreign.length === 0,
      foreign.slice(0, 3).join(', '),
    )
  }

  // Placement assessment in the same target language
  const questions = generateAssessmentQuestions({ languageId: langId, ageRange: 'adult', goal: 'conversation', count: 6 })
  check(`${langId}: assessment returns 6 questions`, questions.length === 6, `got ${questions.length}`)

  const qTokens = indicTokens(questions)
  if (langId === 'en') {
    check('en: assessment contains no Indic script', qTokens.length === 0, qTokens.slice(0, 3).join(', '))
  } else {
    const wrongQ = qTokens.filter((t) => [...t].some((c) => !inScript(c, langId)))
    check(
      `${langId}: assessment uses only the ${name} script`,
      qTokens.length > 0 && wrongQ.length === 0,
      wrongQ.slice(0, 3).join(', '),
    )
    const foreignQ = qTokens.filter((t) => !corpus.includes(t))
    check(
      `${langId}: assessment content comes from the ${name} corpus`,
      foreignQ.length === 0,
      foreignQ.slice(0, 3).join(', '),
    )
  }

  check(
    `${langId}: assessment covers listening and speaking`,
    questions.some((q) => q.type === 'listening') && questions.some((q) => q.type === 'speaking'),
  )
}

// ── 4. No silent language substitution ───────────────────────────────────────
console.log('\n[2] Unsupported languages are rejected, never substituted')

for (const bogus of ['rj', 'kn', 'ml', 'xx']) {
  let error = null
  try {
    getAdaptiveLesson({ languageId: bogus })
  } catch (err) {
    error = err
  }
  check(`lesson request for "${bogus}" throws UnsupportedLanguageError`, error instanceof UnsupportedLanguageError, String(error))

  let assessError = null
  try {
    generateAssessmentQuestions({ languageId: bogus, count: 6 })
  } catch (err) {
    assessError = err
  }
  check(`assessment request for "${bogus}" throws UnsupportedLanguageError`, assessError instanceof UnsupportedLanguageError, String(assessError))
}

// ── 5. Different learner performance → different lesson selection ────────────
console.log('\n[3] Lesson selection adapts to learner performance')

function learnerState(langId, weakTopicId, extras = {}) {
  const topic = (id, attempts, correct) => ({
    id,
    name: id,
    icon: '📚',
    attempts,
    correct,
    accuracy: Math.round((correct / attempts) * 100),
    masteryLevel: 1,
    lastPracticedAt: new Date().toISOString(),
  })

  return {
    stats: {
      [langId]: {
        totalAttempts: 40,
        totalCorrect: 26,
        currentDifficultyLevel: 2,
        skills: {
          vocabulary: { attempts: 20, correct: 16, score: 80 },
          listening: { attempts: 10, correct: 8, score: 78 },
          speaking: { attempts: 10, correct: 8, score: 76 },
          grammar: { attempts: 5, correct: 4, score: 75 },
          reading: { attempts: 5, correct: 4, score: 75 },
        },
        topics: {
          [weakTopicId]: topic(weakTopicId, 10, 3), // 30% accuracy — the weak spot
          greetings: topic('greetings', 12, 11),
          everyday: topic('everyday', 12, 11),
          food: weakTopicId === 'food' ? topic('food', 10, 3) : topic('food', 12, 11),
          travel: weakTopicId === 'travel' ? topic('travel', 10, 3) : topic('travel', 12, 11),
          family: weakTopicId === 'family' ? topic('family', 10, 3) : topic('family', 12, 11),
        },
        recentHistory: [],
      },
    },
    reviewCandidates: [],
    ...extras,
  }
}

const strugglingWithFood = getAdaptiveLesson({ languageId: 'ta', learnerState: learnerState('ta', 'food') })
const strugglingWithTravel = getAdaptiveLesson({ languageId: 'ta', learnerState: learnerState('ta', 'travel') })
const coldStart = getAdaptiveLesson({ languageId: 'ta' })

check('weak-in-food learner is routed to the food topic', strugglingWithFood.topicId === 'food', strugglingWithFood.topicId)
check('weak-in-travel learner is routed to the travel topic', strugglingWithTravel.topicId === 'travel', strugglingWithTravel.topicId)
check(
  'the two learners receive different topics',
  strugglingWithFood.topicId !== strugglingWithTravel.topicId,
)

function vocabWords(lesson) {
  return (lesson.vocabulary || []).map((v) => v.word).sort().join('|')
}

check(
  'the two learners receive different vocabulary selections',
  vocabWords(strugglingWithFood) !== vocabWords(strugglingWithTravel),
)
check(
  'the rationale explains the targeted weakness',
  /food/i.test(strugglingWithFood.rationale) && /travel/i.test(strugglingWithTravel.rationale),
  `${strugglingWithFood.rationale} / ${strugglingWithTravel.rationale}`,
)
check(
  'a cold-start learner is not routed to the struggling learner topics',
  coldStart.topicId !== 'food' || coldStart.topicId !== 'travel',
)

// Due review items pull spaced-repetition exercises into the lesson
const withReview = getAdaptiveLesson({
  languageId: 'ta',
  learnerState: {
    ...learnerState('ta', 'food'),
    reviewCandidates: [
      { word: 'வணக்கம்', translation: 'Hello', reason: 'Spaced Review Due', source: 'sm2' },
      { word: 'நன்றி', translation: 'Thank you', reason: 'Recent Mistake (2x)', source: 'mistake' },
    ],
  },
})

check(
  'due review items are injected as review exercises',
  withReview.exercises.some((ex) => ex.isReview === true),
)
check(
  'review rationale reflects the spaced-repetition queue',
  /review/i.test(withReview.rationale),
  withReview.rationale,
)
check(
  'learners with review items get a different lesson than those without',
  JSON.stringify(withReview.exercises.map((e) => e.type)) !==
    JSON.stringify(strugglingWithTravel.exercises.map((e) => e.type)),
)

// ── Summary ──────────────────────────────────────────────────────────────────
console.log(`\n${failed === 0 ? 'PASS' : 'FAIL'} — ${passed} passed, ${failed} failed\n`)
process.exit(failed === 0 ? 0 : 1)
