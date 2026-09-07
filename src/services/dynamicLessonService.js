/**
 * Dynamic Lesson Service — BharatLingo Frontend
 *
 * Fetches personalized adaptive lessons, learning plans, and assessment questions.
 * Directs to the unified Adaptive Lesson Engine.
 */

import { getLessonsForLanguage, getLessonById as getStaticLessonById } from '../data/lessons/index.js'
import { getAssessmentQuestions as getStaticAssessmentQuestions } from '../data/questions/index.js'
import {
  generateAdaptiveLesson,
  generateNextLesson,
  generateLessonSequence,
} from './lessonEngine.js'
import { getLearnerProfile, getSkillProficiencies, getLearnerSnapshot } from './learnerModel.js'


const API_BASE = '/api'

async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `Request failed: ${res.status}`)
  }
  return res.json()
}

/**
 * Fetch the learner's next personalized adaptive lesson
 */
export async function fetchNextAdaptiveLesson({
  languageId,
  topicId = null,
  preferredLang = 'en',
  level = 'beginner',
  goal = 'conversation',
}) {
  // 1. Try server, sending the learner model so it adapts like the client does
  try {
    const data = await apiFetch('/lessons/adaptive', {
      method: 'POST',
      body: JSON.stringify({
        languageId,
        goal,
        level,
        preferredLang,
        topicId,
        learnerState: getLearnerSnapshot(languageId),
      }),
    })
    if (data && data.exercises && data.exercises.length > 0) return data
  } catch {
    // fall through
  }

  // 2. Client-side Adaptive Engine (Authoritative offline/local)
  return generateAdaptiveLesson({
    langId: languageId,
    preferredLang,
    topicId,
    level,
    goal,
  })
}

/**
 * Fetch dynamic lessons for continuous stream
 */
export async function fetchDynamicLessons({
  languageId,
  goal = 'conversation',
  level = 'beginner',
  count = 6,
  preferredLang = 'en',
}) {
  try {
    return generateLessonSequence({
      langId: languageId,
      preferredLang,
      level,
      goal,
      count,
    })
  } catch {
    return getLessonsForLanguage(languageId, preferredLang)
  }
}

/**
 * Fetch a lesson by ID (handles adaptive sessions, topic IDs, and legacy IDs)
 */
export async function fetchLessonById({
  languageId,
  lessonId,
  preferredLangId = 'en',
  level = 'beginner',
  goal = 'conversation',
}) {
  if (!lessonId) {
    return fetchNextAdaptiveLesson({ languageId, preferredLang: preferredLangId, level, goal })
  }

  // Match adaptive session pattern: {lang}-adaptive-{topic}-{timestamp}
  const adaptiveMatch = lessonId.match(/^(\w+)-adaptive-(\w+)-(.+)$/)
  if (adaptiveMatch) {
    const topicId = adaptiveMatch[2]
    return generateAdaptiveLesson({
      langId: languageId,
      preferredLang: preferredLangId,
      topicId,
      level,
      goal,
    })
  }

  // Match topic-based dynamic pattern: {lang}-gen-{topic}-{index}
  const genMatch = lessonId.match(/^(\w+)-gen-(\w+)-(\d+)$/)
  if (genMatch) {
    const topicId = genMatch[2]
    return generateAdaptiveLesson({
      langId: languageId,
      preferredLang: preferredLangId,
      topicId,
      level,
      goal,
    })
  }

  // Check static lesson fallback
  const staticLesson = getStaticLessonById(languageId, lessonId, preferredLangId)
  if (staticLesson && staticLesson.exercises) return staticLesson

  // Fallback: Generate adaptive lesson for this topic
  return generateAdaptiveLesson({
    langId: languageId,
    preferredLang: preferredLangId,
    topicId: lessonId.replace(`${languageId}-`, ''),
    level,
    goal,
  })
}

/**
 * Generate a personalized learning plan
 */
export async function generatePersonalizedPlan({
  languageId,
  ageRange,
  goal,
  level,
  assessmentScore,
  dailyGoal,
}) {
  try {
    const data = await apiFetch('/learning-plan', {
      method: 'POST',
      body: JSON.stringify({ languageId, ageRange, goal, level, assessmentScore, dailyGoal }),
    })
    if (data && data.focusAreas) return data
  } catch {}

  return generateLocalPlan({ goal, assessmentScore, dailyGoal })
}

/**
 * Fetch assessment questions for initial placement
 */
export async function fetchAssessmentQuestions({
  languageId,
  ageRange = 'adult',
  goal = 'conversation',
  count = 6,
}) {
  try {
    const params = new URLSearchParams({ languageId, ageRange, goal, count, preferredLang: 'en' })
    const data = await apiFetch(`/assessment/questions?${params}`)
    if (data.questions && data.questions.length > 0) return data.questions
  } catch {}

  return getStaticAssessmentQuestions(languageId, 'en')
}

// ── Local plan fallback ────────────────────────────────────────────────────────
function generateLocalPlan({ goal, assessmentScore, dailyGoal }) {
  const focusMap = {
    travel:       ['Travel phrases', 'Directions & Transport', 'Restaurants', 'Accommodation'],
    conversation: ['Everyday conversation', 'Essential vocabulary', 'Listening & Speaking'],
    work:         ['Professional vocabulary', 'Formal greetings', 'Numbers & Finance'],
    study:        ['Grammar fundamentals', 'Reading & Writing', 'Vocabulary building'],
    family:       ['Family terms & relations', 'Everyday conversation', 'Expressing emotions'],
    culture:      ['Cultural phrases', 'Festivals & traditions', 'Food & music'],
    fun:          ['Popular expressions', 'Entertainment & media', 'Games & sports'],
  }

  const startingLevel =
    assessmentScore == null
      ? 'Beginner'
      : assessmentScore <= 30
      ? 'Beginner'
      : assessmentScore <= 60
      ? 'Elementary'
      : assessmentScore <= 80
      ? 'Intermediate'
      : 'Advanced'

  return {
    startingLevel,
    goal: goal ? goal.charAt(0).toUpperCase() + goal.slice(1) : 'Conversation',
    dailyPractice: `${dailyGoal || 10} min`,
    focusAreas: focusMap[goal] || focusMap.conversation,
    recommendedFirstLesson: 'Greetings & Introductions',
    generatedAt: new Date().toISOString(),
  }
}
