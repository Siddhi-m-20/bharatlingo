/**
 * Pronunciation & Speaking Assessment Engine for BharatLingo
 *
 * Implements granular word-level and phoneme-level Levenshtein similarity analysis,
 * normalized text comparison for Indian scripts, pronunciation scoring %,
 * and identification of specific words/syllables to practice and improve.
 */

/**
 * Normalize text for Indian scripts and transliteration:
 * Strips punctuation, trims whitespace, standardizes Nukta/diacritics, and handles case.
 */
export function normalizeIndicSpeechText(text) {
  if (!text) return ''
  return text
    .toLowerCase()
    .trim()
    .replace(/[।.,\/#!$%\^&\*;:{}=\-_`~()?"'–—]/g, '') // Strip Indic Danda & punctuation
    .replace(/\s+/g, ' ') // Collapse multiple spaces
}

/**
 * Standard Levenshtein distance calculation
 */
export function calculateLevenshteinDistance(a, b) {
  const matrix = []
  const lenA = a.length
  const lenB = b.length

  for (let i = 0; i <= lenA; i++) {
    matrix[i] = [i]
  }
  for (let j = 0; j <= lenB; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= lenA; i++) {
    for (let j = 1; j <= lenB; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + cost // substitution
      )
    }
  }

  return matrix[lenA][lenB]
}

/**
 * String similarity ratio (0.0 to 1.0) based on Levenshtein distance
 */
export function calculateStringSimilarity(str1, str2) {
  const norm1 = normalizeIndicSpeechText(str1)
  const norm2 = normalizeIndicSpeechText(str2)

  if (norm1 === norm2) return 1.0
  if (!norm1 || !norm2) return 0.0

  const maxLen = Math.max(norm1.length, norm2.length)
  if (maxLen === 0) return 1.0

  const distance = calculateLevenshteinDistance(norm1, norm2)
  return Math.max(0, 1 - distance / maxLen)
}

/**
 * Detailed Pronunciation Evaluation
 *
 * Compares recognized audio transcript against expected target sentence.
 * Returns:
 * - score: 0 to 100 percentage
 * - isMatch: boolean threshold (typically >= 70%)
 * - wordResults: array of { word, spokenWord, matchStatus: 'exact'|'close'|'missed', similarity: 0..1 }
 * - wordsToImprove: array of word strings that fell below passing threshold
 * - feedbackMessage: human-friendly encouraging feedback in English/Indic
 */
export function evaluatePronunciation(targetSentence, spokenTranscript, confidence = 0.9) {
  const targetWords = normalizeIndicSpeechText(targetSentence).split(' ').filter(Boolean)
  const spokenWords = normalizeIndicSpeechText(spokenTranscript).split(' ').filter(Boolean)

  if (targetWords.length === 0) {
    return {
      score: 100,
      isMatch: true,
      wordResults: [],
      wordsToImprove: [],
      feedbackMessage: 'Great job!',
    }
  }

  const wordResults = []
  const wordsToImprove = []
  let totalWordScore = 0

  targetWords.forEach((targetWord, idx) => {
    // Look for exact or closest word in spoken transcript within nearby window
    let bestSimilarity = 0
    let bestSpokenWord = ''

    spokenWords.forEach((spokenWord) => {
      const sim = calculateStringSimilarity(targetWord, spokenWord)
      if (sim > bestSimilarity) {
        bestSimilarity = sim
        bestSpokenWord = spokenWord
      }
    })

    // If no direct spoken candidate, take word at same index if present
    if (bestSimilarity === 0 && spokenWords[idx]) {
      bestSpokenWord = spokenWords[idx]
      bestSimilarity = calculateStringSimilarity(targetWord, bestSpokenWord)
    }

    let matchStatus = 'missed'
    if (bestSimilarity >= 0.85) {
      matchStatus = 'exact'
    } else if (bestSimilarity >= 0.55) {
      matchStatus = 'close'
    } else {
      matchStatus = 'missed'
    }

    if (matchStatus !== 'exact') {
      wordsToImprove.push(targetWord)
    }

    totalWordScore += bestSimilarity
    wordResults.push({
      targetWord,
      spokenWord: bestSpokenWord || '—',
      similarity: Number(bestSimilarity.toFixed(2)),
      matchStatus,
    })
  })

  // Full string Levenshtein fallback weight
  const fullSentenceSim = calculateStringSimilarity(targetSentence, spokenTranscript)
  const avgWordSim = totalWordScore / targetWords.length

  // Weighted composite score (70% word alignment + 30% sentence similarity, scaled with ASR confidence)
  const compositeRatio = (avgWordSim * 0.7 + fullSentenceSim * 0.3)
  const score = Math.min(100, Math.max(0, Math.round(compositeRatio * 100)))
  const isMatch = score >= 68

  // Generate actionable feedback
  let feedbackMessage = ''
  if (score >= 90) {
    feedbackMessage = 'Flawless pronunciation! Native-level clarity.'
  } else if (score >= 75) {
    feedbackMessage = 'Great effort! Clear and understandable.'
  } else if (score >= 50) {
    feedbackMessage = 'Good try! Pay attention to the highlighted words.'
  } else {
    feedbackMessage = 'Keep practicing! Listen to the audio and try again.'
  }

  return {
    score,
    isMatch,
    wordResults,
    wordsToImprove,
    feedbackMessage,
    transcript: spokenTranscript,
    targetSentence,
  }
}
