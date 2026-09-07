/**
 * Adaptive Lesson Engine — BharatLingo
 *
 * Truly Adaptive Lesson Generator & Selector inspired by Duolingo / Bhasha.
 *
 * Core Architecture:
 * 1. 4-Part Adaptive Mix:
 *    - NEW (30%): New vocabulary and phrases for the topic
 *    - PRACTICE (30%): Varied active recall drills (MCQ, picture, translation, listening)
 *    - REVIEW (25%): Spaced repetition due items & recent mistake reinforcement
 *    - CHALLENGE (15%): Advanced sentence construction & speaking challenges
 * 2. Dynamic Difficulty Calibration (Levels 1 to 5)
 * 3. Pedagogical Rationale: Explicitly explains why this lesson was chosen for the learner
 * 4. Language-Independent: Serves all 8 Indian languages using rich seed data
 */

import { getLessonsForLanguage } from '../data/lessons/index.js'
import { getLanguageById } from '../data/languages.js'
import { getReadingPassages } from '../data/readingPassages.js'
import {
  getLearnerProfile,
  getWeakAreas,
  getStrongAreas,
  getReviewCandidates,
  deriveWeakAreas,
  TOPIC_CATEGORIES,
} from './learnerModel.js'
import {
  createPictureChoiceExercise,
  createWordToMeaningMCQ,
  createMeaningToWordMCQ,
  createListeningExercise,
  createSpeakingExercise,
  createTranslationExercise,
  createMatchingExercise,
  createFillBlankExercise,
  createSentenceOrderExercise,
  createChallengeExercise,
  shuffle,
  pickRandom,
} from './exercisePool.js'


// ── Precompiled Topic Category Keywords ───────────────────────────────────────
const TOPIC_KEYWORDS = {
  greetings:  /hello|greeting|thank|please|goodbye|morning|night|namaste|namaskar|welcome|sorry|excuse/i,
  everyday:   /water|home|friend|book|yes|no|food|eat|drink|day|time|today|tomorrow/i,
  food:       /food|eat|drink|tea|chai|rice|bread|roti|meal|cook|hunger|sweet|fruit|vegetable/i,
  numbers:    /one|two|three|four|five|six|seven|eight|nine|ten|hundred|thousand|count/i,
  family:     /mother|father|brother|sister|son|daughter|family|uncle|aunt|grandparent|child/i,
  travel:     /train|bus|car|road|station|direction|left|right|where|go|come|travel|auto/i,
  market:     /buy|sell|money|rupee|cost|price|market|shop|cloth|vegetable/i,
  weather:    /rain|sun|wind|cold|hot|season|cloud|storm|snow|weather/i,
  emotions:   /happy|sad|angry|love|fear|surprise|joy|worry|calm|excited/i,
  culture:    /festival|tradition|dance|music|art|celebration|culture|religion/i,
  grammar:    /is|are|am|was|were|will|want|have|need/i,
}

// ── Extract Vocabulary matching a topic ──────────────────────────────────────
function extractVocabForTopic(seedLessons, topicId, count = 10) {
  const pattern = TOPIC_KEYWORDS[topicId] || TOPIC_KEYWORDS.everyday

  const matched = []
  const seen = new Set()

  for (const lesson of seedLessons) {
    if (!lesson.vocabulary) continue
    for (const v of lesson.vocabulary) {
      const text = `${v.word} ${v.translation} ${v.example || ''}`.toLowerCase()
      if (pattern.test(text) && !seen.has(v.word)) {
        seen.add(v.word)
        matched.push(v)
      }
    }
  }

  // If not enough matched, supplement with other seed vocab
  if (matched.length < 4) {
    for (const lesson of seedLessons) {
      if (!lesson.vocabulary) continue
      for (const v of lesson.vocabulary) {
        if (!seen.has(v.word) && matched.length < count) {
          seen.add(v.word)
          matched.push(v)
        }
      }
    }
  }

  return matched
}

/**
 * Intelligent Topic Selection based on Learner Model
 */
function selectAdaptiveTopic(profile, weakAreas, requestedTopicId = null) {
  if (requestedTopicId) {
    const found = TOPIC_CATEGORIES.find((t) => t.id === requestedTopicId)
    if (found) return found
  }

  // 1. Weak topic with accuracy < 75%
  if (weakAreas.topics.length > 0) {
    const weakest = weakAreas.topics[0]
    const matched = TOPIC_CATEGORIES.find((t) => t.id === weakest.id)
    if (matched) return matched
  }

  // 2. Least practiced topic
  const topicsByPracticed = Object.values(profile.topics).sort((a, b) => {
    if (!a.lastPracticedAt) return -1
    if (!b.lastPracticedAt) return 1
    return new Date(a.lastPracticedAt) - new Date(b.lastPracticedAt)
  })

  if (topicsByPracticed.length > 0) {
    const leastPracticed = topicsByPracticed[0]
    const matched = TOPIC_CATEGORIES.find((t) => t.id === leastPracticed.id)
    if (matched) return matched
  }

  return TOPIC_CATEGORIES[0]
}

/**
 * Generate an explicit, pedagogical explanation for the learner
 */
function generatePedagogicalRationale({ topic, weakAreas, reviewCandidates, profile, accuracy }) {
  if (reviewCandidates.length >= 2) {
    return `Spaced Review: Reinforcing ${reviewCandidates.length} words due today from previous sessions.`
  }

  if (weakAreas.topics.length > 0 && weakAreas.topics[0].id === topic.id) {
    return `Targeted Practice: Strengthening "${topic.name}" where your recent accuracy was ${weakAreas.topics[0].accuracy}%.`
  }

  if (weakAreas.skills.length > 0) {
    const weakSkill = weakAreas.skills[0]
    return `Skill Focus: Boosting ${weakSkill.skill} practice with interactive audio & feedback.`
  }

  if (profile.totalAttempts === 0) {
    return `Starting your journey with foundational ${topic.name} & interactive listening.`
  }

  if (profile.overallAccuracy >= 85) {
    return `Mastery Path: Advancing to ${topic.name} with increased speaking & sentence challenge.`
  }

  return `Personalized Practice: Building active fluency in ${topic.name}.`
}

/**
 * CORE: Generate a single 10–12 exercise Adaptive Lesson
 */
export function generateAdaptiveLesson({
  langId = 'hi',
  preferredLang = 'en',
  topicId = null,
  level = 'beginner',
  goal = 'conversation',
  learnerState = null,
}) {
  const targetLangMeta = getLanguageById(langId)
  if (!targetLangMeta) {
    throw new Error(`Unsupported language: ${langId}`)
  }
  const targetLangName = `${targetLangMeta.name} (${targetLangMeta.nativeName})`

  // 1. Learner profile & weak areas — injected (stateless callers such as the
  //    API server) or read from local storage (browser).
  const profile = learnerState
    ? getLearnerProfile(langId, learnerState.stats || {})
    : getLearnerProfile(langId)
  const weakAreas = learnerState ? deriveWeakAreas(profile) : getWeakAreas(langId)
  const reviewCandidates = learnerState
    ? (learnerState.reviewCandidates || []).slice(0, 3)
    : getReviewCandidates(langId, 3)

  // 2. Select topic intelligently
  const topic = selectAdaptiveTopic(profile, weakAreas, topicId)

  // 3. Extract vocab for topic & global pool
  const seedLessons = getLessonsForLanguage(langId, preferredLang) || []
  const allSeedVocab = seedLessons.flatMap((l) => l.vocabulary || [])
  const topicVocab = extractVocabForTopic(seedLessons, topic.id, 10)

  // 4. Generate pedagogical rationale
  const rationale = generatePedagogicalRationale({
    topic,
    weakAreas,
    reviewCandidates,
    profile,
    accuracy: profile.overallAccuracy,
  })

  // ── 5. Build 4-Part Adaptive Mix (NEW + PRACTICE + REVIEW + CHALLENGE) ────────
  const reviewExercises = []
  const newExercises = []
  const practiceExercises = []
  const challengeExercises = []

  // --- PART A: REVIEW (25% ~ 2-3 items from mistakes & SM-2) ---
  for (const candidate of reviewCandidates.slice(0, 3)) {
    const vocabMatch = allSeedVocab.find((v) => v.word === candidate.word) || {
      word: candidate.word,
      translation: candidate.translation,
    }
    if (Math.random() > 0.5) {
      reviewExercises.push({
        ...createWordToMeaningMCQ(vocabMatch, allSeedVocab, langId, preferredLang, targetLangName),
        isReview: true,
        reviewReason: candidate.reason,
      })
    } else {
      reviewExercises.push({
        ...createListeningExercise(vocabMatch, allSeedVocab, langId, preferredLang, targetLangName),
        isReview: true,
        reviewReason: candidate.reason,
      })
    }
  }

  // --- PART B: NEW CONCEPTS (30% ~ 3-4 items) ---
  const newVocabItems = topicVocab.slice(0, Math.min(3, topicVocab.length))
  for (const item of newVocabItems) {
    newExercises.push(createPictureChoiceExercise(item, allSeedVocab, langId, preferredLang, targetLangName))
    newExercises.push(createMeaningToWordMCQ(item, allSeedVocab, langId, preferredLang, targetLangName))
  }

  // --- PART C: ACTIVE PRACTICE (30% ~ 3-4 items) ---
  for (const item of topicVocab.slice(1, 4)) {
    practiceExercises.push(createTranslationExercise(item, allSeedVocab, langId, preferredLang, targetLangName))
    practiceExercises.push(createSpeakingExercise(item, allSeedVocab, langId, preferredLang, targetLangName))
    if (item.example) {
      practiceExercises.push(createFillBlankExercise(item, allSeedVocab, langId, preferredLang, targetLangName))
    }
  }
  if (topicVocab.length >= 3) {
    practiceExercises.push(createMatchingExercise(topicVocab.slice(0, 4), langId, preferredLang, targetLangName))
  }

  // --- PART D: CHALLENGE & READING (15% ~ 1-2 items) ---
  const sentenceItem = topicVocab.find((v) => v.example && v.example.split(' ').length >= 3)
  if (sentenceItem) {
    const ch = createChallengeExercise(sentenceItem, allSeedVocab, langId, preferredLang, targetLangName)
    if (ch) challengeExercises.push(ch)
  }

  const passages = getReadingPassages(langId)
  if (passages.length > 0) {
    const p = passages[Math.floor(Math.random() * passages.length)]
    challengeExercises.push({
      id: `ex_read_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      type: 'reading',
      prompt: 'Read the short passage and answer the question',
      passage: p.passage,
      passageTranslation: p.translation,
      question: p.question,
      options: p.options,
      correctAnswer: p.correctAnswer,
      xp: 20,
      category: 'reading',
      skill: 'reading',
      difficulty: 3,
    })
  }

  // ── 6. Assemble Balanced 10–12 Exercise Set with Scaffolding Ordering ────────
  // Quotas: Review (up to 2), New (3), Practice (4), Challenge/Reading (1-2)
  const selectedReview = pickRandom(reviewExercises, Math.min(2, reviewExercises.length))
  const selectedNew = pickRandom(newExercises, Math.min(3, newExercises.length))
  const selectedChallenge = pickRandom(challengeExercises, Math.min(2, Math.max(1, challengeExercises.length)))
  
  // Remaining slots for practice
  const slotsRemaining = 11 - (selectedReview.length + selectedNew.length + selectedChallenge.length)
  const selectedPractice = pickRandom(practiceExercises, Math.max(2, slotsRemaining))

  // Scaffolding progression: New Scaffolding -> Active Practice -> Spaced Review -> Challenge/Reading
  const finalExercises = [
    ...shuffle(selectedNew),
    ...shuffle(selectedPractice),
    ...shuffle(selectedReview),
    ...shuffle(selectedChallenge),
  ]


  // Fallback pad if pool was small
  while (finalExercises.length < 10 && topicVocab.length > 0) {
    const v = topicVocab[finalExercises.length % topicVocab.length]
    finalExercises.push(createWordToMeaningMCQ(v, allSeedVocab, langId, preferredLang, targetLangName))
  }

  const sessionId = `${langId}-adaptive-${topic.id}-${Date.now()}`

  return {
    id: sessionId,
    name: `${topic.name}`,
    nameNative: targetLangMeta.nativeName,
    topicId: topic.id,
    topicIcon: topic.icon,
    description: rationale,
    rationale,
    langId,
    level,
    difficultyLevel: profile.currentDifficultyLevel || 1,
    vocabulary: topicVocab.slice(0, 8),
    exercises: finalExercises,
    generatedAt: new Date().toISOString(),
    _isAdaptive: true,
  }
}

/**
 * Backward compatibility shims
 */
export function generateLesson({ langId, preferredLang = 'en', topicId, level = 'beginner', goal = 'conversation', learnerState = null }) {
  return generateAdaptiveLesson({ langId, preferredLang, topicId, level, goal, learnerState })
}

export function generateNextLesson({ langId, preferredLang = 'en', level = 'beginner', goal = 'conversation', learnerState = null }) {
  return generateAdaptiveLesson({ langId, preferredLang, level, goal, learnerState })
}

export function generateLessonSequence({ langId, preferredLang = 'en', count = 5, level = 'beginner', goal = 'conversation', learnerState = null }) {
  const list = []
  for (let i = 0; i < count; i++) {
    const topic = TOPIC_CATEGORIES[i % TOPIC_CATEGORIES.length]
    list.push(generateAdaptiveLesson({ langId, preferredLang, topicId: topic.id, level, goal, learnerState }))
  }
  return list
}

export { TOPIC_CATEGORIES as TOPIC_THEMES }
