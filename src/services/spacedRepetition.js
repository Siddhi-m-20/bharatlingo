/**
 * SuperMemo SM-2 Spaced Repetition Algorithm Implementation for BharatLingo
 *
 * Implements interval calculation, ease factor adjustment, forgetting curve tracking,
 * and review scheduling for vocabulary items.
 */

const SM2_STORAGE_KEY = 'bharatlingo_sm2_items'

/**
 * Default initial item state
 */
export function createInitialItem(word, translation, languageId, category = 'General') {
  return {
    id: `${languageId}_${word.toLowerCase().trim()}`,
    word: word.trim(),
    translation: translation.trim(),
    languageId,
    category,
    repetition: 0, // Number of consecutive correct reviews
    interval: 0, // Interval in days until next review
    easeFactor: 2.5, // Standard SM-2 starting ease factor (min: 1.3)
    quality: 0, // Last rating (0-5)
    lastReviewedAt: null,
    nextReviewAt: new Date().toISOString(), // Due immediately
    history: [],
    retentionScore: 100, // Estimated memory retention %
  }
}

/**
 * Get all SM-2 items from persistent storage
 */
export function getAllSM2Items() {
  try {
    const raw = localStorage.getItem(SM2_STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch (e) {
    console.error('Failed to load SM-2 items:', e)
    return {}
  }
}

/**
 * Get SM-2 items for a specific language
 */
export function getSM2ItemsByLanguage(languageId) {
  const all = getAllSM2Items()
  return all[languageId] || []
}

/**
 * Calculate the next review state using SuperMemo SM-2 algorithm
 *
 * @param {Object} item - The current SM-2 item state
 * @param {number} quality - Rating from 0 to 5:
 *   5 - Perfect response without hesitation
 *   4 - Correct response after a hesitation
 *   3 - Correct response recalled with serious difficulty
 *   2 - Incorrect response; where the correct one seemed easy to recall
 *   1 - Incorrect response; the correct one remembered
 *   0 - Complete blackout
 */
export function calculateSM2(item, quality) {
  // Constrain quality to 0-5
  const q = Math.max(0, Math.min(5, Math.round(quality)))
  
  let { repetition = 0, interval = 0, easeFactor = 2.5 } = item
  
  // Calculate new Ease Factor:
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  const newEF = Math.max(
    1.3,
    easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  )
  
  let newRepetition = 0
  let newInterval = 0
  
  if (q >= 3) {
    // Successful recall
    if (repetition === 0) {
      newInterval = 1 // 1 day
      newRepetition = 1
    } else if (repetition === 1) {
      newInterval = 6 // 6 days
      newRepetition = 2
    } else {
      newInterval = Math.round(interval * newEF)
      newRepetition = repetition + 1
    }
  } else {
    // Failed recall: reset repetition count, review tomorrow
    newRepetition = 0
    newInterval = 1
  }

  const now = new Date()
  const nextDate = new Date(now.getTime() + newInterval * 24 * 60 * 60 * 1000)

  // Estimated retention calculation using Ebbinghaus forgetting curve approximation
  // R = e^(-t/S) where S is stability based on interval and ease factor
  const stability = Math.max(1, newInterval * (newEF / 2.5))
  const retentionScore = Math.min(100, Math.round((q / 5) * 50 + (newEF / 2.5) * 50))

  return {
    ...item,
    repetition: newRepetition,
    interval: newInterval,
    easeFactor: Number(newEF.toFixed(2)),
    quality: q,
    lastReviewedAt: now.toISOString(),
    nextReviewAt: nextDate.toISOString(),
    retentionScore,
    history: [
      ...(item.history || []).slice(-14),
      {
        reviewedAt: now.toISOString(),
        quality: q,
        interval: newInterval,
        easeFactor: Number(newEF.toFixed(2)),
      },
    ],
  }
}

/**
 * Record a review rating for a vocabulary word
 */
export function recordSM2Review(word, translation, languageId, quality, category = 'General') {
  if (!word || !languageId) return null

  const all = getAllSM2Items()
  const langList = all[languageId] || []
  const wordKey = word.toLowerCase().trim()

  let item = langList.find((i) => i.word.toLowerCase().trim() === wordKey)
  if (!item) {
    item = createInitialItem(word, translation, languageId, category)
  }

  const updatedItem = calculateSM2(item, quality)

  const updatedList = langList.filter((i) => i.word.toLowerCase().trim() !== wordKey)
  updatedList.push(updatedItem)

  all[languageId] = updatedList
  localStorage.setItem(SM2_STORAGE_KEY, JSON.stringify(all))

  return updatedItem
}

/**
 * Get items due for review today for a language
 */
export function getDueSM2Items(languageId) {
  const items = getSM2ItemsByLanguage(languageId)
  const now = new Date().toISOString()
  
  // Return items where nextReviewAt <= now, sorted by urgency (lowest retention / oldest due date)
  return items
    .filter((item) => !item.nextReviewAt || item.nextReviewAt <= now)
    .sort((a, b) => (a.retentionScore || 0) - (b.retentionScore || 0))
}

/**
 * Get overall Spaced Repetition metrics for a language
 */
export function getSM2Stats(languageId) {
  const items = getSM2ItemsByLanguage(languageId)
  const now = new Date().toISOString()
  
  const dueItems = items.filter((i) => !i.nextReviewAt || i.nextReviewAt <= now)
  const masteredItems = items.filter((i) => i.repetition >= 3 && i.easeFactor >= 2.0)
  const learningItems = items.filter((i) => i.repetition < 3)

  const avgRetention = items.length > 0
    ? Math.round(items.reduce((acc, i) => acc + (i.retentionScore || 50), 0) / items.length)
    : 0

  return {
    totalTracked: items.length,
    dueCount: dueItems.length,
    masteredCount: masteredItems.length,
    learningCount: learningItems.length,
    averageRetention: avgRetention,
  }
}
