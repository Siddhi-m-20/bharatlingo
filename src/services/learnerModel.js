/**
 * Learner Model — BharatLingo
 *
 * Authoritative, multi-dimensional learner representation tracking:
 * 1. Skill Proficiencies (Vocabulary, Listening, Speaking, Grammar, Reading) [0–100%]
 * 2. Topic Masteries & Accuracies [Levels 1–5 per topic]
 * 3. Word-Level Mastery & Mistake Bank (Recency, Frequency, Error clustering)
 * 4. SuperMemo SM-2 Spaced Repetition (Intervals, Ease Factors, Retention Curves)
 * 5. Rolling Performance Window (Last 20 attempts for real-time difficulty calibration)
 * 6. Dynamic Difficulty Scaling (Levels 1 to 5)
 */

import { getMistakes, recordMistake as recordMistakeInBank, updateWordMastery, getMasteryMap } from './mistakeService.js'
import { getDueSM2Items, recordSM2Review, getSM2Stats, getSM2ItemsByLanguage } from './spacedRepetition.js'


const LEARNER_STATS_KEY = 'bharatlingo_learner_stats_v2'

export const SKILL_TYPES = {
  VOCABULARY: 'vocabulary',
  LISTENING:  'listening',
  SPEAKING:   'speaking',
  GRAMMAR:    'grammar',
  READING:    'reading',
}

export const TOPIC_CATEGORIES = [
  { id: 'greetings',  name: 'Greetings & Etiquette',  icon: '🙏' },
  { id: 'everyday',   name: 'Everyday Essentials',    icon: '🌅' },
  { id: 'food',       name: 'Food & Dining',          icon: '🍛' },
  { id: 'numbers',    name: 'Numbers & Counting',     icon: '🔢' },
  { id: 'family',     name: 'Family & Relations',     icon: '👨‍👩‍👦' },
  { id: 'travel',     name: 'Travel & Directions',    icon: '🛺' },
  { id: 'market',     name: 'Shopping & Market',      icon: '🛍️' },
  { id: 'grammar',    name: 'Grammar & Syntax',       icon: '📝' },
  { id: 'weather',    name: 'Weather & Seasons',      icon: '🌤️' },
  { id: 'emotions',   name: 'Emotions & Feelings',    icon: '😊' },
  { id: 'culture',    name: 'Culture & Traditions',   icon: '🎉' },
]

/**
 * Infer skill type from exercise metadata
 */
export function inferSkillType(exercise) {
  if (!exercise) return SKILL_TYPES.VOCABULARY
  const type = (exercise.type || '').toLowerCase()
  const cat = (exercise.category || '').toLowerCase()

  if (type === 'listening' || cat === 'listening') return SKILL_TYPES.LISTENING
  if (type === 'speaking' || cat === 'speaking') return SKILL_TYPES.SPEAKING
  if (type === 'sentence-order' || type === 'fill-blank' || cat === 'grammar') return SKILL_TYPES.GRAMMAR
  if (type === 'reading' || cat === 'reading' || type === 'story') return SKILL_TYPES.READING
  return SKILL_TYPES.VOCABULARY
}

/**
 * Infer topic category from exercise or text
 */
export function inferTopicCategory(item) {
  if (item?.topicId) return item.topicId
  if (item?.category && TOPIC_CATEGORIES.some((c) => c.id === item.category)) {
    return item.category
  }

  const text = `${item?.prompt || ''} ${item?.word || ''} ${item?.targetWord || ''} ${item?.translation || ''} ${item?.meaning || ''} ${item?.correctAnswer || ''}`.toLowerCase()

  if (/namaste|namaskar|hello|welcome|thank|goodbye|please|sorry|greeting|dhanyavaad|vanakkam|namaskaram|nomoshkar/i.test(text)) return 'greetings'
  if (/tea|chai|water|pani|food|rice|bread|roti|dal|sugar|eat|drink|curry|meal|sweet|breakfast|dinner|lunch|khana|jevan|bhojanam/i.test(text)) return 'food'
  if (/one|two|three|four|five|six|seven|eight|nine|ten|hundred|thousand|ek|don|tin|char|panch|number|count/i.test(text)) return 'numbers'
  if (/mother|father|brother|sister|friend|family|son|daughter|uncle|aunt|dost|mitra|aai|baba|amma|appa/i.test(text)) return 'family'
  if (/where|station|road|car|bus|train|auto|left|right|straight|go|come|travel|ticket|airport|rasta/i.test(text)) return 'travel'
  if (/buy|sell|rupee|cost|money|market|price|shop|discount|kharid|paisa|panam|dabbulu|bazaar/i.test(text)) return 'market'
  if (/rain|sun|wind|cold|hot|season|cloud|storm|weather|barish|dhoop|havaman/i.test(text)) return 'weather'
  if (/happy|sad|angry|love|fear|joy|worry|calm|excited|khush|aanand/i.test(text)) return 'emotions'
  if (/festival|tradition|temple|puja|celebration|culture|diwali|holi|pongal/i.test(text)) return 'culture'
  if (/is|are|am|was|were|will|want|have|need|hawa|pahije|karenge|chahiye|grammar|verb/i.test(text)) return 'grammar'

  return 'everyday'
}

/**
 * Load raw learner stats from storage
 */
function loadAllStats() {
  try {
    const raw = localStorage.getItem(LEARNER_STATS_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch (e) {
    return {}
  }
}

/**
 * Save raw learner stats to storage
 */
function saveAllStats(stats) {
  try {
    localStorage.setItem(LEARNER_STATS_KEY, JSON.stringify(stats))
  } catch (e) {
    console.warn('[LearnerModel] Save failed:', e)
  }
}

/**
 * Get or initialize learner profile for a specific language
 */
export function getLearnerProfile(languageId = 'hi', existingStats = null) {
  const all = existingStats || loadAllStats()
  const rawLang = all[languageId] || {}


  const defaultSkills = {
    [SKILL_TYPES.VOCABULARY]: { attempts: 0, correct: 0, score: 0 },
    [SKILL_TYPES.LISTENING]:  { attempts: 0, correct: 0, score: 0 },
    [SKILL_TYPES.SPEAKING]:   { attempts: 0, correct: 0, score: 0 },
    [SKILL_TYPES.GRAMMAR]:    { attempts: 0, correct: 0, score: 0 },
    [SKILL_TYPES.READING]:    { attempts: 0, correct: 0, score: 0 },
  }

  const defaultTopics = {}
  TOPIC_CATEGORIES.forEach((t) => {
    defaultTopics[t.id] = {
      id: t.id,
      name: t.name,
      icon: t.icon,
      attempts: 0,
      correct: 0,
      accuracy: 0,
      masteryLevel: 1, // 1 to 5
      lastPracticedAt: null,
    }
  })

  const profile = {
    languageId,
    totalAttempts: rawLang.totalAttempts || 0,
    totalCorrect: rawLang.totalCorrect || 0,
    overallAccuracy: rawLang.totalAttempts > 0
      ? Math.round((rawLang.totalCorrect / rawLang.totalAttempts) * 100)
      : 0,
    currentDifficultyLevel: rawLang.currentDifficultyLevel || 1, // 1: Beginner, 2: Elementary, 3: Intermediate, 4: Advanced, 5: Mastery
    skills: {
      ...defaultSkills,
      ...(rawLang.skills || {}),
    },
    topics: {
      ...defaultTopics,
      ...(rawLang.topics || {}),
    },
    recentHistory: Array.isArray(rawLang.recentHistory) ? rawLang.recentHistory : [],
    lastUpdated: rawLang.lastUpdated || new Date().toISOString(),
  }

  return profile
}

/**
 * Record a single exercise attempt into the Learner Model
 * Updates skills, topic masteries, recent rolling window, SM-2, and mistake bank
 */
export function recordExerciseAttempt(languageId, exercise, isCorrect, options = {}) {
  if (!languageId || !exercise) return

  const { timeSpentMs = 0, speechScore = null } = options
  const all = loadAllStats()
  const profile = getLearnerProfile(languageId, all)


  const skill = inferSkillType(exercise)
  const topicId = inferTopicCategory(exercise)
  const word = exercise.targetWord || exercise.word || exercise.correctAnswer

  // 1. Update overall counts
  profile.totalAttempts += 1
  if (isCorrect) profile.totalCorrect += 1
  profile.overallAccuracy = Math.round((profile.totalCorrect / profile.totalAttempts) * 100)

  // 2. Update skill metrics
  if (!profile.skills[skill]) {
    profile.skills[skill] = { attempts: 0, correct: 0, score: 0 }
  }
  const s = profile.skills[skill]
  s.attempts += 1
  if (isCorrect) s.correct += 1
  // Calculate dynamic skill score
  if (s.attempts === 1) {
    s.score = isCorrect ? 100 : 35
  } else {
    s.score = Math.round(s.score * 0.65 + (isCorrect ? 100 : 30) * 0.35)
  }

  // 3. Update topic metrics
  if (!profile.topics[topicId]) {
    const meta = TOPIC_CATEGORIES.find((c) => c.id === topicId) || { name: topicId, icon: '📚' }
    profile.topics[topicId] = {
      id: topicId,
      name: meta.name,
      icon: meta.icon,
      attempts: 0,
      correct: 0,
      accuracy: 100,
      masteryLevel: 1,
      lastPracticedAt: null,
    }
  }
  const t = profile.topics[topicId]
  t.attempts += 1
  if (isCorrect) t.correct += 1
  t.accuracy = Math.round((t.correct / t.attempts) * 100)
  t.lastPracticedAt = new Date().toISOString()

  // Dynamic topic mastery levels (1: Novice, 2: Apprentice, 3: Competent, 4: Proficient, 5: Mastered)
  if (t.attempts >= 15 && t.accuracy >= 90) t.masteryLevel = 5
  else if (t.attempts >= 10 && t.accuracy >= 80) t.masteryLevel = 4
  else if (t.attempts >= 6 && t.accuracy >= 70) t.masteryLevel = 3
  else if (t.attempts >= 3 && t.accuracy >= 60) t.masteryLevel = 2
  else t.masteryLevel = 1

  // 4. Rolling recent history (last 20 items)
  profile.recentHistory.unshift({
    topicId,
    skill,
    exerciseType: exercise.type,
    word: typeof word === 'string' ? word : '',
    isCorrect,
    timeSpentMs,
    speechScore,
    timestamp: new Date().toISOString(),
  })
  if (profile.recentHistory.length > 20) {
    profile.recentHistory.pop()
  }

  // 5. Dynamic Difficulty Calibration (1 to 5)
  // Calculate recent accuracy from last 10 attempts
  const recentWindow = profile.recentHistory.slice(0, 10)
  if (recentWindow.length >= 5) {
    const recentCorrect = recentWindow.filter((w) => w.isCorrect).length
    const recentAccuracy = Math.round((recentCorrect / recentWindow.length) * 100)

    if (recentAccuracy >= 90 && profile.totalAttempts >= 12) {
      profile.currentDifficultyLevel = Math.min(5, (profile.currentDifficultyLevel || 1) + 1)
    } else if (recentAccuracy < 60) {
      profile.currentDifficultyLevel = Math.max(1, (profile.currentDifficultyLevel || 1) - 1)
    }
  }

  // 6. Update Word Mastery & Mistakes & SM-2
  if (word && typeof word === 'string' && word.trim()) {
    updateWordMastery(word.trim(), languageId, isCorrect)

    if (!isCorrect) {
      recordMistakeInBank({
        word: word.trim(),
        translation: exercise.translation || exercise.meaning || '',
        pronunciation: exercise.pronunciation || exercise.roman || '',
      }, languageId)
    }

    // Record SM-2 rating: 5 = fast correct, 4 = correct, 2 = incorrect, 1 = mistake
    const quality = isCorrect ? (timeSpentMs > 0 && timeSpentMs < 4000 ? 5 : 4) : 1
    recordSM2Review(
      word.trim(),
      exercise.translation || exercise.meaning || word.trim(),
      languageId,
      quality,
      topicId
    )
  }

  profile.lastUpdated = new Date().toISOString()
  all[languageId] = profile
  saveAllStats(all)

  return profile
}

/**
 * Identify weak areas from an already-loaded profile (pure)
 */
export function deriveWeakAreas(profile) {
  const weakTopics = []

  Object.values(profile.topics).forEach((t) => {
    if (t.attempts >= 2 && t.accuracy < 75) {
      weakTopics.push({
        ...t,
        reason: `Accuracy is ${t.accuracy}% (${t.attempts} attempts)`,
      })
    }
  })

  // Weak skills (e.g. listening or speaking below 70)
  const weakSkills = []
  Object.entries(profile.skills).forEach(([skillName, data]) => {
    if (data.attempts >= 3 && data.score < 70) {
      weakSkills.push({
        skill: skillName,
        score: data.score,
        attempts: data.attempts,
      })
    }
  })

  return {
    topics: weakTopics.sort((a, b) => a.accuracy - b.accuracy),
    skills: weakSkills.sort((a, b) => a.score - b.score),
    hasWeaknesses: weakTopics.length > 0 || weakSkills.length > 0,
  }
}

/**
 * Identify weak areas for adaptive targeting
 */
export function getWeakAreas(languageId = 'hi') {
  return deriveWeakAreas(getLearnerProfile(languageId))
}

/**
 * Portable snapshot of the learner model for stateless consumers (the API
 * server) so they can generate the same adaptive lesson the client would.
 */
export function getLearnerSnapshot(languageId = 'hi', reviewLimit = 3) {
  return {
    stats: { [languageId]: getLearnerProfile(languageId) },
    reviewCandidates: getReviewCandidates(languageId, reviewLimit),
  }
}

/**
 * Get strong / mastered areas
 */
export function getStrongAreas(languageId = 'hi') {
  const profile = getLearnerProfile(languageId)
  return Object.values(profile.topics)
    .filter((t) => t.attempts >= 4 && t.accuracy >= 85)
    .sort((a, b) => b.accuracy - a.accuracy)
}

/**
 * Get items due for spaced review + frequent mistakes
 */
export function getReviewCandidates(languageId = 'hi', limit = 5) {
  const mistakes = getMistakes(languageId) || []
  const sm2Due = getDueSM2Items(languageId) || []

  const candidates = []
  const seenWords = new Set()

  // 1. Due SM-2 items first
  for (const item of sm2Due) {
    if (candidates.length >= limit) break
    const k = (item.word || '').toLowerCase()
    if (!seenWords.has(k)) {
      seenWords.add(k)
      candidates.push({
        word: item.word,
        translation: item.translation,
        reason: 'Spaced Review Due',
        source: 'sm2',
        retentionScore: item.retentionScore || 50,
      })
    }
  }

  // 2. High-frequency mistakes
  for (const m of mistakes) {
    if (candidates.length >= limit) break
    const k = (m.word || '').toLowerCase()
    if (!seenWords.has(k)) {
      seenWords.add(k)
      candidates.push({
        word: m.word,
        translation: m.translation,
        reason: `Recent Mistake (${m.count || 1}x)`,
        source: 'mistake',
        retentionScore: 30,
      })
    }
  }

  return candidates
}

/**
 * Get formatted skill proficiencies for UI widgets
 */
export function getSkillProficiencies(languageId = 'hi') {
  const profile = getLearnerProfile(languageId)
  const getSkillScore = (type) => {
    const s = profile.skills[type]
    if (!s || s.attempts === 0) return 0
    return Math.min(100, Math.max(0, s.score))
  }

  return {
    vocabulary: getSkillScore(SKILL_TYPES.VOCABULARY),
    listening:  getSkillScore(SKILL_TYPES.LISTENING),
    speaking:   getSkillScore(SKILL_TYPES.SPEAKING),
    grammar:    getSkillScore(SKILL_TYPES.GRAMMAR),
    reading:    getSkillScore(SKILL_TYPES.READING),
    overall:    profile.totalAttempts > 0 ? profile.overallAccuracy : 0,
    difficulty: profile.currentDifficultyLevel || 1,
  }
}
