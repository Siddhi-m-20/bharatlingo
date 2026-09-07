/**
 * Lesson Engine (API) — BharatLingo
 *
 * Thin, stateless wrapper around the shared adaptive lesson engine
 * (`src/services/lessonEngine.js`) so the API and the browser generate lessons
 * from exactly the same language-independent architecture and the same seed
 * corpora for all supported languages.
 *
 * The learner model lives in the browser, so callers pass a learner snapshot
 * (`{ stats, reviewCandidates }`) with the request; without one the engine
 * generates a cold-start lesson.
 *
 * NO AI provider names, model names, or endpoint URLs are ever returned to the client.
 */

import {
  generateAdaptiveLesson,
  generateLessonSequence,
} from '../../src/services/lessonEngine.js'
import { getLessonsForLanguage } from '../../src/data/lessons/index.js'
import { getLanguageById, languages } from '../../src/data/languages.js'
import { TOPIC_CATEGORIES } from '../../src/services/learnerModel.js'
import {
  createWordToMeaningMCQ,
  createMeaningToWordMCQ,
  createListeningExercise,
  createSpeakingExercise,
  createTranslationExercise,
} from '../../src/services/exercisePool.js'

export class UnsupportedLanguageError extends Error {
  constructor(languageId) {
    super(`Unsupported language: ${languageId}. Supported languages: ${languages.map((l) => l.id).join(', ')}`)
    this.name = 'UnsupportedLanguageError'
    this.languageId = languageId
  }
}

// ── Language guard: never substitute another language's content ──────────────
function requireLanguage(languageId) {
  const meta = getLanguageById(languageId)
  if (!meta) throw new UnsupportedLanguageError(languageId)
  return meta
}

// ── Age-based pacing config ──────────────────────────────────────────────────
const AGE_CONFIG = {
  child:         { exercisesPerLesson: 10, complexity: 'simple',   tone: 'playful' },
  teen:          { exercisesPerLesson: 11, complexity: 'moderate', tone: 'casual' },
  'young-adult': { exercisesPerLesson: 12, complexity: 'standard', tone: 'friendly' },
  adult:         { exercisesPerLesson: 12, complexity: 'standard', tone: 'professional' },
  senior:        { exercisesPerLesson: 10, complexity: 'simple',   tone: 'clear' },
}

function getAgeConfig(ageRange) {
  return AGE_CONFIG[ageRange] || AGE_CONFIG.adult
}

// Adaptive lessons are 10–12 exercises; age only shifts the upper bound.
function clampExercises(lesson, ageRange) {
  const { exercisesPerLesson } = getAgeConfig(ageRange)
  if (lesson.exercises.length <= exercisesPerLesson) return lesson
  return { ...lesson, exercises: lesson.exercises.slice(0, exercisesPerLesson) }
}

// ── Adaptive lesson ──────────────────────────────────────────────────────────
export function getAdaptiveLesson({
  languageId = 'hi',
  goal = 'conversation',
  ageRange = 'adult',
  level = 'beginner',
  topicId = null,
  preferredLang = 'en',
  learnerState = null,
}) {
  requireLanguage(languageId)
  const lesson = generateAdaptiveLesson({
    langId: languageId,
    preferredLang,
    topicId,
    level,
    goal,
    learnerState: learnerState || { stats: {}, reviewCandidates: [] },
  })
  return clampExercises(lesson, ageRange)
}

// ── A stream of adaptive lessons across topics ───────────────────────────────
export function getDynamicLessons({
  languageId = 'hi',
  goal = 'conversation',
  ageRange = 'adult',
  level = 'beginner',
  preferredLang = 'en',
  learnerState = null,
  count = 10,
}) {
  requireLanguage(languageId)
  return generateLessonSequence({
    langId: languageId,
    preferredLang,
    level,
    goal,
    count,
    learnerState: learnerState || { stats: {}, reviewCandidates: [] },
  }).map((lesson) => clampExercises(lesson, ageRange))
}

// ── A single lesson from the stream ──────────────────────────────────────────
export function getDynamicLesson({
  languageId = 'hi',
  goal = 'conversation',
  ageRange = 'adult',
  level = 'beginner',
  preferredLang = 'en',
  learnerState = null,
  lessonIndex = 0,
}) {
  requireLanguage(languageId)
  const topic = TOPIC_CATEGORIES[Math.max(0, lessonIndex) % TOPIC_CATEGORIES.length]
  return getAdaptiveLesson({
    languageId,
    goal,
    ageRange,
    level,
    preferredLang,
    learnerState,
    topicId: topic.id,
  })
}

// ── Personalized learning plan ───────────────────────────────────────────────
export function generateLearningPlan({ languageId, ageRange, goal, level, assessmentScore, dailyGoal }) {
  requireLanguage(languageId)
  const ageConfig = getAgeConfig(ageRange)

  const focusAreas = {
    travel:       ['Travel phrases', 'Directions', 'Restaurants', 'Transport', 'Practical vocabulary'],
    conversation: ['Everyday conversation', 'Essential vocabulary', 'Listening', 'Speaking'],
    work:         ['Professional vocabulary', 'Formal greetings', 'Numbers', 'Business phrases'],
    study:        ['Grammar', 'Reading', 'Writing', 'Academic vocabulary'],
    family:       ['Family terms', 'Everyday conversation', 'Emotions', 'Celebrations'],
    culture:      ['Cultural phrases', 'Traditions', 'Food & festivals', 'Poetry & proverbs'],
    fun:          ['Popular phrases', 'Entertainment', 'Games', 'Stories'],
  }[goal] || ['Everyday conversation', 'Essential vocabulary', 'Listening', 'Speaking']

  const startingLevel = assessmentScore !== null && assessmentScore !== undefined
    ? (assessmentScore <= 30 ? 'Beginner' : assessmentScore <= 60 ? 'Elementary' : assessmentScore <= 80 ? 'Intermediate' : 'Advanced')
    : 'Beginner'

  const totalLessons = dailyGoal <= 5 ? 20 : dailyGoal <= 10 ? 30 : dailyGoal <= 15 ? 40 : 50

  return {
    startingLevel,
    goal: goal ? goal.charAt(0).toUpperCase() + goal.slice(1) : 'Conversation',
    dailyPractice: `${dailyGoal} min`,
    focusAreas,
    agePersonalization: {
      tone: ageConfig.tone,
      complexity: ageConfig.complexity,
      lessonsPerDay: Math.max(1, Math.floor(dailyGoal / 10)),
    },
    totalLessons,
    recommendedFirstLesson: 'Greetings & Introductions',
    generatedAt: new Date().toISOString(),
  }
}

// ── Placement assessment in the requested target language ────────────────────
export function generateAssessmentQuestions({ languageId, ageRange = 'adult', goal = 'conversation', preferredLang = 'en', count = 6 }) {
  const meta = requireLanguage(languageId)
  const targetLangName = `${meta.name} (${meta.nativeName})`

  const seedLessons = getLessonsForLanguage(languageId, preferredLang) || []
  const vocabPool = seedLessons.flatMap((l) => l.vocabulary || [])
  if (vocabPool.length === 0) throw new UnsupportedLanguageError(languageId)

  // Spread the placement across the curriculum so it probes more than lesson 1,
  // and across skills so listening and speaking are placed too.
  const spread = []
  const stride = Math.max(1, Math.floor(vocabPool.length / Math.max(count, 1)))
  for (let i = 0; i < vocabPool.length && spread.length < count; i += stride) {
    spread.push(vocabPool[i])
  }

  const builders = [
    createWordToMeaningMCQ,
    createListeningExercise,
    createSpeakingExercise,
    createMeaningToWordMCQ,
    createTranslationExercise,
  ]

  return spread.map((item, idx) => ({
    ...builders[idx % builders.length](item, vocabPool, languageId, preferredLang, targetLangName),
    difficulty: Math.min(5, 1 + Math.floor((idx / Math.max(spread.length - 1, 1)) * 4)),
  }))
}

