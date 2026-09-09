/**
 * SuperMemo SM-2 Spaced Repetition Algorithm Implementation for BharatLingo
 *
 * Implements interval calculation, ease factor adjustment, forgetting curve tracking,
 * and review scheduling for vocabulary items.
 */

import { syncSpacedRepetitionItem, syncSpacedRepetitionBatch } from './dbService'

const LEGACY_STORAGE_KEY = 'bharatlingo_sm2_items'

/**
 * Helper: Resolve active logged-in user ID from local auth cache
 */
function getActiveUserId() {
  try {
    const raw = localStorage.getItem('bharatlingo_user')
    if (!raw) return null
    const user = JSON.parse(raw)
    return user?.id || null
  } catch {
    return null
  }
}

/**
 * Helper: Derive user-isolated storage key to prevent session data leakage
 */
export function getSM2StorageKey(userId = null) {
  const effectiveId = userId || getActiveUserId()
  return effectiveId ? `bharatlingo_sm2_items_${effectiveId}` : LEGACY_STORAGE_KEY
}

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
 * Get all SM-2 items from persistent storage (user-scoped)
 */
export function getAllSM2Items(userId = null) {
  try {
    const key = getSM2StorageKey(userId)
    const raw = localStorage.getItem(key)
    if (raw) return JSON.parse(raw)

    // Only fallback to legacy storage key for unauthenticated guest session
    if (key === LEGACY_STORAGE_KEY) {
      const legacyRaw = localStorage.getItem(LEGACY_STORAGE_KEY)
      if (legacyRaw) return JSON.parse(legacyRaw)
    }

    return {}
  } catch (e) {
    console.error('Failed to load SM-2 items:', e)
    return {}
  }
}

/**
 * Get SM-2 items for a specific language
 */
export function getSM2ItemsByLanguage(languageId, userId = null) {
  const all = getAllSM2Items(userId)
  return all[languageId] || []
}

/**
 * Calculate the next review state using SuperMemo SM-2 algorithm
 * (Mathematical core preserved 100% unchanged)
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
 * Safe two-way merge between cloud items and local items using Last-Write-Wins.
 * Resolves at the individual item level based on lastReviewedAt timestamp.
 *
 * @param {Object} remoteByLang - Cloud items grouped by languageId
 * @param {Object} localByLang - Local storage items grouped by languageId
 * @returns {{ merged: Object, dirtyLocalItems: Array }}
 */
export function mergeSM2Decks(remoteByLang = {}, localByLang = {}) {
  const merged = {}
  const dirtyLocalItems = []

  const allLangs = Array.from(
    new Set([...Object.keys(remoteByLang || {}), ...Object.keys(localByLang || {})])
  )

  for (const lang of allLangs) {
    merged[lang] = []
    const remoteItems = remoteByLang?.[lang] || []
    const localItems = localByLang?.[lang] || []

    const wordMap = new Map()

    // 1. Seed with remote items
    for (const rItem of remoteItems) {
      const key = (rItem.word || '').toLowerCase().trim()
      if (key) {
        wordMap.set(key, { item: rItem, isLocalOnly: false })
      }
    }

    // 2. Compare or insert local items
    for (const lItem of localItems) {
      const key = (lItem.word || '').toLowerCase().trim()
      if (!key) continue

      if (!wordMap.has(key)) {
        // Exists only locally -> preserve and mark dirty for cloud upload
        wordMap.set(key, { item: lItem, isLocalOnly: true })
        dirtyLocalItems.push(lItem)
      } else {
        const existingRemote = wordMap.get(key).item
        const localTime = lItem.lastReviewedAt ? new Date(lItem.lastReviewedAt).getTime() : 0
        const remoteTime = existingRemote.lastReviewedAt ? new Date(existingRemote.lastReviewedAt).getTime() : 0

        if (localTime > remoteTime) {
          // Local review is more recent -> local wins, upload to cloud
          wordMap.set(key, { item: lItem, isLocalOnly: false })
          dirtyLocalItems.push(lItem)
        } else if (remoteTime > localTime) {
          // Remote review is more recent -> remote wins
          wordMap.set(key, { item: existingRemote, isLocalOnly: false })
        } else {
          // Same timestamp or both null -> atomically choose the record with higher repetition (or remote if tied)
          const chosen = (Number(lItem.repetition) || 0) > (Number(existingRemote.repetition) || 0)
            ? lItem
            : existingRemote
          wordMap.set(key, { item: chosen, isLocalOnly: false })
        }
      }
    }

    merged[lang] = Array.from(wordMap.values()).map((v) => v.item)
  }

  return { merged, dirtyLocalItems }
}

/**
 * Record a review rating for a vocabulary word (Local-First + Cloud Sync)
 */
export function recordSM2Review(word, translation, languageId, quality, category = 'General', userId = null) {
  if (!word || !languageId) return null

  const effectiveUserId = userId || getActiveUserId()
  const storageKey = getSM2StorageKey(effectiveUserId)

  const all = getAllSM2Items(effectiveUserId)
  const langList = all[languageId] || []
  const wordKey = word.toLowerCase().trim()

  let item = langList.find((i) => i.word.toLowerCase().trim() === wordKey)
  if (!item) {
    item = createInitialItem(word, translation, languageId, category)
  }

  // 1. Calculate updated SM-2 item state (Algorithm unchanged)
  const updatedItem = calculateSM2(item, quality)

  // 2. Commit synchronously to local storage (Local-first / offline-ready)
  const updatedList = langList.filter((i) => i.word.toLowerCase().trim() !== wordKey)
  updatedList.push(updatedItem)

  all[languageId] = updatedList
  try {
    localStorage.setItem(storageKey, JSON.stringify(all))
  } catch (e) {
    console.warn('Failed to save SM-2 item locally:', e)
  }

  // 3. Fire-and-forget background sync to Supabase if authenticated
  if (effectiveUserId) {
    syncSpacedRepetitionItem(effectiveUserId, updatedItem).catch((err) => {
      console.warn('Background SM-2 cloud sync failed (will retry on next sync):', err)
    })
  }

  return updatedItem
}

/**
 * Hydrate local SM-2 storage from Supabase data with Last-Write-Wins merge.
 * Uploads any newer local offline reviews back to Supabase.
 */
export async function hydrateSM2FromCloud(userId, remoteItemsByLanguage = {}) {
  if (!userId) return null

  const storageKey = getSM2StorageKey(userId)
  const localItems = getAllSM2Items(userId)

  const { merged, dirtyLocalItems } = mergeSM2Decks(remoteItemsByLanguage, localItems)

  try {
    localStorage.setItem(storageKey, JSON.stringify(merged))
  } catch (e) {
    console.warn('Failed to save merged SM-2 to localStorage:', e)
  }

  // Sync back any newer local reviews that Supabase is missing
  if (dirtyLocalItems.length > 0) {
    syncSpacedRepetitionBatch(userId, dirtyLocalItems).catch((err) => {
      console.warn('Background sync of dirty local SM-2 items failed:', err)
    })
  }

  return merged
}

/**
 * Clear SM-2 data from localStorage upon user logout to prevent session cross-contamination
 */
export function clearSM2Data(userId = null) {
  try {
    if (userId) {
      localStorage.removeItem(`bharatlingo_sm2_items_${userId}`)
    }
    localStorage.removeItem(LEGACY_STORAGE_KEY)
  } catch (e) {
    console.warn('Failed to clear SM-2 data:', e)
  }
}

/**
 * Get items due for review today for a language
 */
export function getDueSM2Items(languageId, userId = null) {
  const items = getSM2ItemsByLanguage(languageId, userId)
  const now = new Date().toISOString()
  
  // Return items where nextReviewAt <= now, sorted by urgency (lowest retention / oldest due date)
  return items
    .filter((item) => !item.nextReviewAt || item.nextReviewAt <= now)
    .sort((a, b) => (a.retentionScore || 0) - (b.retentionScore || 0))
}

/**
 * Get overall Spaced Repetition metrics for a language
 */
export function getSM2Stats(languageId, userId = null) {
  const items = getSM2ItemsByLanguage(languageId, userId)
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

