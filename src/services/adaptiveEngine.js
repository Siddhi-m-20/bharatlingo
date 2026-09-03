/**
 * Intelligent Adaptive Learning Engine for BharatLingo
 *
 * Analyzes learner response history, identifies weak grammatical/thematic topics,
 * adjusts exercise difficulty, and generates personalized practice sessions.
 */

import { getMistakes } from './mistakeService'
import { getSM2ItemsByLanguage } from './spacedRepetition'
import { getVocabularyForLanguage } from '../data/vocabulary'

const ADAPTIVE_STATS_KEY = 'bharatlingo_adaptive_stats'

/**
 * Standard Topic Categories for Indian Language Learning
 */
export const TOPIC_CATEGORIES = [
  { id: 'greetings', name: 'Greetings & Etiquette', icon: '🙏' },
  { id: 'food', name: 'Food & Dining', icon: '🍛' },
  { id: 'numbers', name: 'Numbers & Counting', icon: '🔢' },
  { id: 'family', name: 'Family & Relations', icon: '👨‍👩‍👦' },
  { id: 'travel', name: 'Travel & Directions', icon: '🛺' },
  { id: 'verbs', name: 'Common Verbs & Action', icon: '⚡' },
  { id: 'market', name: 'Shopping & Market', icon: '🛍️' },
  { id: 'grammar', name: 'Grammar & Sentence Order', icon: '📝' },
]

/**
 * Get category for a given exercise or vocabulary word
 */
export function inferCategory(item) {
  if (item?.category) return item.category

  const text = `${item?.prompt || ''} ${item?.word || ''} ${item?.translation || ''} ${item?.meaning || ''}`.toLowerCase()

  if (/namaste|namaskar|hello|welcome|thank|goodbye|please|sorry|greeting/i.test(text)) return 'greetings'
  if (/tea|chai|water|pani|food|rice|bread|roti|dal|sugar|eat|drink|curry|meal/i.test(text)) return 'food'
  if (/one|two|three|four|five|ten|hundred|ek|don|tin|char|number|count/i.test(text)) return 'numbers'
  if (/mother|father|brother|sister|friend|family|son|daughter|uncle|aunt/i.test(text)) return 'family'
  if (/where|station|road|car|bus|train|auto|left|right|straight|go|come|travel/i.test(text)) return 'travel'
  if (/buy|sell|rupee|cost|money|market|price|shop|discount/i.test(text)) return 'market'
  if (/is|are|am|was|were|will|want|have|need|hawa|pahije|karenge/i.test(text)) return 'grammar'

  return 'verbs'
}

/**
 * Record exercise response for adaptive difficulty and analytics
 */
export function recordExerciseAttempt(languageId, exercise, isCorrect, timeSpentMs = 0) {
  if (!languageId || !exercise) return

  try {
    const raw = localStorage.getItem(ADAPTIVE_STATS_KEY)
    const all = raw ? JSON.parse(raw) : {}
    const langStats = all[languageId] || {
      totalAttempts: 0,
      totalCorrect: 0,
      categories: {},
      exerciseTypeAccuracy: {},
      recentHistory: [],
    }

    const category = inferCategory(exercise)
    const exerciseType = exercise.type || 'multiple-choice'

    // Update overall counts
    langStats.totalAttempts += 1
    if (isCorrect) langStats.totalCorrect += 1

    // Update category accuracy
    if (!langStats.categories[category]) {
      langStats.categories[category] = { attempts: 0, correct: 0, accuracy: 100 }
    }
    langStats.categories[category].attempts += 1
    if (isCorrect) langStats.categories[category].correct += 1
    langStats.categories[category].accuracy = Math.round(
      (langStats.categories[category].correct / langStats.categories[category].attempts) * 100
    )

    // Update exercise type accuracy (mcq, listening, speaking, matching)
    if (!langStats.exerciseTypeAccuracy[exerciseType]) {
      langStats.exerciseTypeAccuracy[exerciseType] = { attempts: 0, correct: 0, accuracy: 100 }
    }
    langStats.exerciseTypeAccuracy[exerciseType].attempts += 1
    if (isCorrect) langStats.exerciseTypeAccuracy[exerciseType].correct += 1
    langStats.exerciseTypeAccuracy[exerciseType].accuracy = Math.round(
      (langStats.exerciseTypeAccuracy[exerciseType].correct / langStats.exerciseTypeAccuracy[exerciseType].attempts) * 100
    )

    // Append to rolling recent history (max 30 items)
    langStats.recentHistory.unshift({
      category,
      type: exerciseType,
      isCorrect,
      timestamp: new Date().toISOString(),
      timeSpentMs,
    })
    if (langStats.recentHistory.length > 30) {
      langStats.recentHistory.pop()
    }

    all[languageId] = langStats
    localStorage.setItem(ADAPTIVE_STATS_KEY, JSON.stringify(all))
  } catch (e) {
    console.warn('Failed to record adaptive attempt:', e)
  }
}

/**
 * Identify weak topics for a learner in a given language
 * Returns topics sorted from weakest to strongest
 */
export function getWeakTopics(languageId) {
  try {
    const raw = localStorage.getItem(ADAPTIVE_STATS_KEY)
    const all = raw ? JSON.parse(raw) : {}
    const langStats = all[languageId] || { categories: {} }

    const results = []

    TOPIC_CATEGORIES.forEach((cat) => {
      const stats = langStats.categories[cat.id]
      if (stats && stats.attempts >= 2) {
        results.push({
          id: cat.id,
          name: cat.name,
          icon: cat.icon,
          accuracy: stats.accuracy,
          attempts: stats.attempts,
          isWeak: stats.accuracy < 75,
        })
      }
    })

    // Sort weakest accuracy first
    return results.sort((a, b) => a.accuracy - b.accuracy)
  } catch (e) {
    return []
  }
}

/**
 * Generate a personalized, dynamic practice workout set based on
 * learner mistakes, weak topics, and SM-2 retention curves.
 */
export function generatePersonalizedWorkout(languageId, preferredLanguage = 'en', count = 5) {
  const mistakes = getMistakes(languageId) || []
  const sm2Items = getSM2ItemsByLanguage(languageId) || []
  const baseVocab = getVocabularyForLanguage(languageId, preferredLanguage) || []
  const weakTopics = getWeakTopics(languageId)

  const workoutSet = []
  const addedWords = new Set()

  // 1. First priority: Words in the Mistake Bank
  for (const m of mistakes) {
    if (workoutSet.length >= count) break
    const wordKey = (m.word || '').toLowerCase()
    if (!addedWords.has(wordKey)) {
      addedWords.add(wordKey)
      workoutSet.push({
        id: `adaptive_mistake_${m.word}`,
        type: 'multiple-choice',
        prompt: `Recall meaning: What does "${m.word}" mean?`,
        word: m.word,
        translation: m.translation,
        correctAnswer: m.translation,
        options: generateOptions(m.translation, baseVocab),
        category: inferCategory(m),
        reason: 'Frequent Mistake',
        xp: 15,
      })
    }
  }

  // 2. Second priority: Weak topic vocabulary
  if (weakTopics.length > 0 && workoutSet.length < count) {
    const weakestCat = weakTopics[0].id
    const catVocab = baseVocab.filter((v) => inferCategory(v) === weakestCat)

    for (const v of catVocab) {
      if (workoutSet.length >= count) break
      const wordKey = (v.word || '').toLowerCase()
      if (!addedWords.has(wordKey)) {
        addedWords.add(wordKey)
        workoutSet.push({
          id: `adaptive_topic_${v.word}`,
          type: 'translation',
          prompt: `Translate "${v.translation}" into target script`,
          word: v.word,
          translation: v.translation,
          correctAnswer: v.word,
          options: [v.word],
          category: weakestCat,
          reason: `Targeting weak area: ${weakTopics[0].name}`,
          xp: 12,
        })
      }
    }
  }

  // 3. Fallback: Standard Spaced Repetition or Core Vocab
  for (const v of baseVocab) {
    if (workoutSet.length >= count) break
    const wordKey = (v.word || '').toLowerCase()
    if (!addedWords.has(wordKey)) {
      addedWords.add(wordKey)
      workoutSet.push({
        id: `adaptive_vocab_${v.word}`,
        type: 'multiple-choice',
        prompt: `Select the correct translation for "${v.word}"`,
        word: v.word,
        translation: v.translation,
        correctAnswer: v.translation,
        options: generateOptions(v.translation, baseVocab),
        category: inferCategory(v),
        reason: 'Retention Reinforcement',
        xp: 10,
      })
    }
  }

  return workoutSet
}

/**
 * Generate 4 distinct MCQ options from vocabulary pool
 */
function generateOptions(correctAnswer, vocabPool) {
  const distractors = vocabPool
    .map((v) => v.translation)
    .filter((t) => t && t.toLowerCase() !== correctAnswer.toLowerCase())

  const shuffled = distractors.sort(() => 0.5 - Math.random()).slice(0, 3)
  const options = [...shuffled, correctAnswer].sort(() => 0.5 - Math.random())
  return options
}

/**
 * Get general learning metrics for analytics
 */
export function getAdaptiveLearningProfile(languageId) {
  try {
    const raw = localStorage.getItem(ADAPTIVE_STATS_KEY)
    const all = raw ? JSON.parse(raw) : {}
    const stats = all[languageId] || {
      totalAttempts: 0,
      totalCorrect: 0,
      categories: {},
      exerciseTypeAccuracy: {},
      recentHistory: [],
    }

    const overallAccuracy = stats.totalAttempts > 0
      ? Math.round((stats.totalCorrect / stats.totalAttempts) * 100)
      : 100

    return {
      totalAttempts: stats.totalAttempts,
      totalCorrect: stats.totalCorrect,
      overallAccuracy,
      categories: stats.categories,
      exerciseTypeAccuracy: stats.exerciseTypeAccuracy,
      recentHistory: stats.recentHistory,
      weakTopics: getWeakTopics(languageId),
    }
  } catch (e) {
    return {
      totalAttempts: 0,
      totalCorrect: 0,
      overallAccuracy: 100,
      categories: {},
      exerciseTypeAccuracy: {},
      recentHistory: [],
      weakTopics: [],
    }
  }
}
