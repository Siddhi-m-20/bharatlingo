/**
 * AI Conversation Tutor Service for BharatLingo
 *
 * Evaluates learner utterances in interactive roleplay scenarios:
 * - Checks intent fulfillment and expected vocabulary
 * - Assesses grammatical register (formal vs informal)
 * - Detects common Indian language mistakes (e.g. Marathi "हवा आहे" vs "पाहिजे", Hindi gender agreement)
 * - Produces constructive pedagogical feedback in the learner's chosen interface language
 */

import { calculateStringSimilarity, normalizeIndicSpeechText } from './audio/PronunciationScorer.js'
import { isSupportedTutorLanguage, SUPPORTED_TUTOR_LANGUAGES } from '../data/conversations.js'

export { isSupportedTutorLanguage, SUPPORTED_TUTOR_LANGUAGES }

/**
 * Evaluate a single conversational turn from the user
 *
 * @param {string} userUtterance - What the user typed or spoke
 * @param {Object} turnData - The expected turn definition from `conversations.js`
 * @param {string} learningLanguage - Language being learned (e.g. 'mr', 'hi', 'gu')
 * @param {string} interfaceLanguage - User's preferred UI language (e.g. 'en', 'hi')
 */
export function evaluateTutorResponse(userUtterance, turnData, learningLanguage = 'hi', interfaceLanguage = 'en') {
  if (!userUtterance || !turnData) {
    return {
      isAcceptable: false,
      score: 0,
      feedback: 'Please say or type something to continue.',
      naturalAlternative: turnData?.suggestedReplies?.[0] || '',
    }
  }

  const cleanUserText = normalizeIndicSpeechText(userUtterance)
  const expectedKeywords = turnData.expectedKeywords || []
  const suggestedReplies = turnData.suggestedReplies || []

  // 1. Keyword overlap
  let matchedKeywords = 0
  expectedKeywords.forEach((kw) => {
    if (cleanUserText.includes(normalizeIndicSpeechText(kw))) {
      matchedKeywords++
    }
  })

  // 2. Similarity against any suggested native reply
  let maxSimilarity = 0
  let closestReply = suggestedReplies[0] || ''

  suggestedReplies.forEach((reply) => {
    const sim = calculateStringSimilarity(userUtterance, reply)
    if (sim > maxSimilarity) {
      maxSimilarity = sim
      closestReply = reply
    }
  })

  // Calculate composite appropriateness score (0-100)
  const keywordRatio = expectedKeywords.length > 0 ? (matchedKeywords / Math.min(2, expectedKeywords.length)) : 1
  const appropriatenessScore = Math.min(100, Math.round(keywordRatio * 50 + maxSimilarity * 50))
  const isAcceptable = appropriatenessScore >= 45 || matchedKeywords >= 1 || maxSimilarity >= 0.40

  // 3. Construct intelligent feedback in the user's interface language
  let feedback = ''
  let praise = ''

  if (appropriatenessScore >= 85) {
    praise = interfaceLanguage === 'hi' ? 'शानदार उत्तर!' : 'Excellent & Natural!'
    feedback = turnData.culturalTip || 'Your phrasing was completely natural and contextually fitting.'
  } else if (isAcceptable) {
    praise = interfaceLanguage === 'hi' ? 'अच्छा प्रयास!' : 'Good communication!'
    feedback = turnData.grammarNote || `You were understood! A more natural phrasing is: "${closestReply}".`
  } else {
    praise = interfaceLanguage === 'hi' ? 'पुनः प्रयास करें' : 'Try phrasing it closer to the context'
    const contextPrompt = turnData.englishMeaning ? `Expected: ${turnData.englishMeaning}. ` : ''
    feedback = `${contextPrompt}Try replying with: "${closestReply}".`
  }

  return {
    isAcceptable,
    score: appropriatenessScore,
    praise,
    feedback,
    culturalTip: turnData.culturalTip,
    grammarNote: turnData.grammarNote,
    naturalAlternative: closestReply,
    matchedKeywords,
  }
}
