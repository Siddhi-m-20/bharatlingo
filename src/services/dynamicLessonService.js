/**
 * Dynamic Lesson Service — BharatLingo Frontend
 *
 * Fetches personalized lessons, learning plans, and assessment questions
 * from the backend API. No AI provider names or endpoints are exposed to UI.
 *
 * Fallback: If the server is unavailable, uses local lesson data.
 */

import { getLessonsForLanguage, getLessonById as getStaticLessonById } from '../data/lessons'
import { getAssessmentQuestions as getStaticAssessmentQuestions } from '../data/questions'

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
 * Fetch dynamic lessons from the server.
 * Falls back to static local lessons if server is unreachable.
 */
export async function fetchDynamicLessons({ languageId, goal, ageRange = 'adult', level = 'beginner', count = 10 }) {
  try {
    const params = new URLSearchParams({ languageId, goal, ageRange, level, count })
    const data = await apiFetch(`/lessons/dynamic?${params}`)
    return data.lessons || []
  } catch (err) {
    console.warn('[DynamicLessons] Server unavailable, using static lessons:', err.message)
    return getLessonsForLanguage(languageId, 'en')
  }
}

/**
 * Fetch a single dynamic lesson by its sequential index.
 * Falls back to static lesson if server unavailable.
 */
export async function fetchDynamicLesson({ languageId, goal, ageRange = 'adult', level = 'beginner', lessonIndex = 0 }) {
  try {
    const params = new URLSearchParams({ languageId, goal, ageRange, level })
    const data = await apiFetch(`/lessons/dynamic/${lessonIndex}?${params}`)
    return data
  } catch (err) {
    console.warn('[DynamicLesson] Server unavailable, using static lesson:', err.message)
    const lessons = getLessonsForLanguage(languageId, 'en')
    return lessons[lessonIndex] || lessons[0] || null
  }
}

/**
 * Fetch a lesson by ID — dynamic lessons have IDs like "hi-dynamic-0".
 * Static lessons use their original IDs.
 */
export async function fetchLessonById({ languageId, lessonId, goal, ageRange = 'adult', level = 'beginner', preferredLangId = 'en' }) {
  // Dynamic lesson ID pattern: {lang}-dynamic-{index}
  const dynamicMatch = lessonId?.match(/^(\w+)-dynamic-(\d+)$/)
  if (dynamicMatch) {
    const lessonIndex = parseInt(dynamicMatch[2], 10)
    return fetchDynamicLesson({ languageId, goal, ageRange, level, lessonIndex })
  }
  // Static lesson
  return getStaticLessonById(languageId, lessonId, preferredLangId)
}

/**
 * Generate a personalized learning plan.
 * Returns a plan object with focusAreas, startingLevel, etc.
 * Never exposes AI provider names.
 */
export async function generatePersonalizedPlan({ languageId, ageRange, goal, level, assessmentScore, dailyGoal }) {
  try {
    const data = await apiFetch('/learning-plan', {
      method: 'POST',
      body: JSON.stringify({ languageId, ageRange, goal, level, assessmentScore, dailyGoal }),
    })
    return data
  } catch (err) {
    console.warn('[LearningPlan] Server unavailable, generating local plan:', err.message)
    return generateLocalPlan({ goal, assessmentScore, dailyGoal })
  }
}

/**
 * Fetch dynamic assessment questions for initial placement.
 * Falls back to static questions if server unavailable.
 */
export async function fetchAssessmentQuestions({ languageId, ageRange = 'adult', goal = 'conversation', count = 6 }) {
  try {
    const params = new URLSearchParams({ languageId, ageRange, goal, count })
    const data = await apiFetch(`/assessment/questions?${params}`)
    return data.questions || []
  } catch (err) {
    console.warn('[Assessment] Server unavailable, using static questions:', err.message)
    return getStaticAssessmentQuestions(languageId, 'en')
  }
}

// ── Local plan fallback (no server needed) ───────────────────────────────────
function generateLocalPlan({ goal, assessmentScore, dailyGoal }) {
  const focusMap = {
    travel:       ['Travel phrases', 'Directions', 'Restaurants', 'Transport'],
    conversation: ['Everyday conversation', 'Essential vocabulary', 'Listening', 'Speaking'],
    work:         ['Professional vocabulary', 'Formal greetings', 'Numbers'],
    study:        ['Grammar', 'Reading', 'Writing'],
    family:       ['Family terms', 'Everyday conversation', 'Emotions'],
    culture:      ['Cultural phrases', 'Traditions', 'Food & festivals'],
    fun:          ['Popular phrases', 'Entertainment', 'Games'],
  }

  const startingLevel = assessmentScore !== null && assessmentScore !== undefined
    ? (assessmentScore <= 30 ? 'Beginner' : assessmentScore <= 60 ? 'Elementary' : assessmentScore <= 80 ? 'Intermediate' : 'Advanced')
    : 'Beginner'

  return {
    startingLevel,
    goal: goal ? goal.charAt(0).toUpperCase() + goal.slice(1) : 'Conversation',
    dailyPractice: `${dailyGoal || 10} min`,
    focusAreas: focusMap[goal] || focusMap.conversation,
    recommendedFirstLesson: 'Greetings & Introductions',
    generatedAt: new Date().toISOString(),
  }
}
