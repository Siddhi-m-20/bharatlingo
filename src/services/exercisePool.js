/**
 * Exercise Pool — BharatLingo
 *
 * Language-Independent Exercise Generator for all 8 supported languages:
 * Hindi (hi), Marathi (mr), Tamil (ta), Telugu (te), Bengali (bn),
 * Punjabi (pa), Gujarati (gu), and English (en).
 *
 * Provides combinatorial, template-driven exercise generators:
 *   1. picture_choice (visual / emoji recognition)
 *   2. multiple-choice (word -> meaning)
 *   3. multiple-choice (meaning -> target script)
 *   4. listening (audio prompt + target script choices)
 *   5. speaking (STT microphone practice + pronunciation guide)
 *   6. translation (word-bank tile constructor)
 *   7. matching (4-pair interactive matching tiles)
 *   8. fill-blank (contextual sentence cloze)
 *   9. sentence-order (shuffled token syntax builder)
 *  10. reading (short story / dialogue comprehension)
 *  11. challenge (advanced composite translation or syntax construction)
 */

import {
  getPromptText,
  digitToLanguageWord,
  sanitizeLanguageOptions,
  NUMBER_WORDS_MAP,
} from '../data/translations.js'
import { getLanguageById } from '../data/languages.js'
import { rawLessonsByLanguage, translateMeaning } from '../data/lessons/index.js'
import { alphabetDataByLanguage } from '../data/alphabets.js'

// Safe helper for legacy references (emojis removed per user requirement)
export function getVisualEmoji() {
  return ''
}

// ── Array Utility Functions ───────────────────────────────────────────────────
export function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function pickRandom(arr, n = 1) {
  return shuffle(arr).slice(0, n)
}

function buildDistractors(correctAnswer, vocabPool, key = 'translation', count = 3, langId = 'en') {
  const baseCorrect = (key === 'translation' && langId !== 'en')
    ? translateMeaning(correctAnswer, langId)
    : correctAnswer
  const cleanCorrect = digitToLanguageWord(baseCorrect, langId)
  const correctWords = cleanCorrect ? String(cleanCorrect).trim().split(/\s+/).length : 1

  const isInvalidCandidate = (val) => {
    if (!val) return true
    const s = String(val).trim()
    if (!s) return true
    if (/^\d+$/.test(s)) return true
    if (/^[\u0966-\u096F\u09E6-\u09EF\u0A66-\u0A6F\u0AE6-\u0AEF\u0BE6-\u0BEF\u0C66-\u0C6F]+$/.test(s)) return true
    if (/\d+\s*[-—–]\s*\d+/.test(s)) return true
    if (/^[\d\s\-—–]+$/.test(s)) return true
    // Reject full sentences, proverbs, and terminal punctuation
    if (/[.?!।]$/.test(s)) return true
    const wCount = s.split(/\s+/).length
    // If the question tests a single word or short term, NEVER allow full sentences/proverbs
    if (correctWords <= 2 && wCount > 3) return true
    if (correctWords >= 4 && wCount <= 1) return true
    return false
  }

  // Check if correctAnswer is a number word
  const isCorrectNum = Object.values(NUMBER_WORDS_MAP).some(
    (entry) => Object.values(entry).some((w) => String(w).toLowerCase() === String(cleanCorrect).toLowerCase())
  )

  const candidates = vocabPool
    .filter((v) => v[key])
    .map((v) => {
      const val = (key === 'translation' && langId !== 'en')
        ? translateMeaning(v[key], langId)
        : v[key]
      return digitToLanguageWord(val, langId)
    })
    .filter((val) => {
      if (isInvalidCandidate(val)) return false
      if (String(val).trim().toLowerCase() === String(cleanCorrect).trim().toLowerCase()) return false
      // If not a number question, prevent number words from diluting general vocabulary
      if (!isCorrectNum) {
        const isCandidateNum = Object.values(NUMBER_WORDS_MAP).some(
          (entry) => Object.values(entry).some((w) => String(w).toLowerCase() === String(val).toLowerCase())
        )
        if (isCandidateNum) return false
      }
      return true
    })

  const unique = [...new Set(candidates)]
  const picked = pickRandom(unique, count)

  return sanitizeLanguageOptions(picked, cleanCorrect, langId, count + 1)
}


// ── Exercise Generators (Combinatorial Templates) ────────────────────────────

/**
 * 1. Picture Choice Replacement: Clean Authentic Language Vocabulary MCQ
 * Images and emojis removed per user requirement to avoid broken/blank cards and render confusion.
 */
export function createPictureChoiceExercise(item, vocabPool, langId, preferredLang = 'en', targetLangName = '') {
  return createWordToMeaningMCQ(item, vocabPool, langId, preferredLang, targetLangName)
}

/**
 * 2. Multiple Choice (Target Word -> Translation)
 */
export function createWordToMeaningMCQ(item, vocabPool, langId, preferredLang = 'en', targetLangName = '') {
  const targetMeaning = preferredLang !== 'en' ? translateMeaning(item.translation, preferredLang) : item.translation
  const options = buildDistractors(targetMeaning, vocabPool, 'translation', 3, preferredLang)
  return {
    id: `ex_mcq_wm_${item.word}_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    type: 'multiple-choice',
    prompt: getPromptText('meaning', preferredLang, targetLangName, item.word),
    word: item.word,
    targetWord: item.word,
    translation: targetMeaning,
    options,
    correctAnswer: targetMeaning,
    audioText: item.word,
    xp: 10,
    category: 'vocabulary',
    skill: 'vocabulary',
    difficulty: 1,
  }
}

/**
 * 3. Multiple Choice (Translation -> Target Script)
 */
export function createMeaningToWordMCQ(item, vocabPool, langId, preferredLang = 'en', targetLangName = '') {
  const sourceMeaning = preferredLang !== 'en' ? translateMeaning(item.translation, preferredLang) : item.translation
  const options = buildDistractors(item.word, vocabPool, 'word', 3, langId)
  return {
    id: `ex_mcq_mw_${item.word}_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    type: 'multiple-choice',
    prompt: getPromptText('translate_to_target', preferredLang, targetLangName, sourceMeaning),
    word: item.word,
    targetWord: item.word,
    translation: sourceMeaning,
    options,
    correctAnswer: item.word,
    audioText: item.word,
    xp: 12,
    category: 'vocabulary',
    skill: 'vocabulary',
    difficulty: 1,
  }
}

/**
 * 4. Listening Exercise (Hear audio -> Pick matching word)
 */
export function createListeningExercise(item, vocabPool, langId, preferredLang = 'en', targetLangName = '') {
  const options = buildDistractors(item.word, vocabPool, 'word', 3, langId)
  return {
    id: `ex_listen_${item.word}_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    type: 'listening',
    prompt: getPromptText('listening', preferredLang, targetLangName),
    audioText: item.word,
    word: item.word,
    targetWord: item.word,
    translation: item.translation,
    options,
    correctAnswer: item.word,
    xp: 15,
    category: 'listening',
    skill: 'listening',
    difficulty: 2,
  }
}

/**
 * 5. Speaking Exercise (Pronounce word via mic)
 */
export function createSpeakingExercise(item, vocabPool, langId, preferredLang = 'en', targetLangName = '') {
  return {
    id: `ex_speak_${item.word}_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    type: 'speaking',
    prompt: getPromptText('speaking', preferredLang, targetLangName, item.word),
    targetWord: item.word,
    word: item.word,
    translation: item.translation,
    pronunciation: item.pronunciation || item.roman || '',
    correctAnswer: item.word,
    audioText: item.word,
    xp: 15,
    category: 'speaking',
    skill: 'speaking',
    difficulty: 2,
  }
}

/**
 * 6. Translation with Word Bank Tiles
 */
export function createTranslationExercise(item, vocabPool, langId, preferredLang = 'en', targetLangName = '') {
  const distractors = pickRandom(vocabPool.filter((v) => v.word !== item.word), 3).map((v) => v.word)
  const wordBank = shuffle([item.word, ...distractors])
  const sourceMeaning = preferredLang !== 'en' ? translateMeaning(item.translation, preferredLang) : item.translation

  return {
    id: `ex_trans_${item.word}_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    type: 'translation',
    prompt: getPromptText('translate_to_target', preferredLang, targetLangName, sourceMeaning),
    correctAnswer: item.word,
    word: item.word,
    targetWord: item.word,
    translation: sourceMeaning,
    wordBank,
    audioText: item.word,
    xp: 15,
    category: 'translation',
    skill: 'grammar',
    difficulty: 2,
  }
}

/**
 * 7. Matching Pairs (4 bidirectional items)
 */
export function createMatchingExercise(items, langId, preferredLang = 'en', targetLangName = '') {
  const selected = pickRandom(items, Math.min(4, Math.max(2, items.length)))
  return {
    id: `ex_match_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    type: 'matching',
    prompt: getPromptText('matching', preferredLang, targetLangName),
    pairs: selected.map((v) => ({
      word: v.word,
      meaning: preferredLang !== 'en' ? translateMeaning(v.translation, preferredLang) : v.translation,
    })),
    correctAnswer: 'matched_all',
    xp: 20,
    category: 'matching',
    skill: 'vocabulary',
    difficulty: 2,
  }
}

/**
 * 8. Fill-in-the-blank / Cloze Exercise
 */
export function createFillBlankExercise(item, vocabPool, langId, preferredLang = 'en', targetLangName = '') {
  if (!item.example || !item.example.includes(item.word)) {
    return createWordToMeaningMCQ(item, vocabPool, langId, preferredLang, targetLangName)
  }

  const blanked = item.example.replace(item.word, '___')
  const options = buildDistractors(item.word, vocabPool, 'word', 3, langId)

  return {
    id: `ex_fill_${item.word}_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    type: 'fill-blank',
    prompt: getPromptText('fill_blank', preferredLang, targetLangName),
    instruction: getPromptText('fill_blank', preferredLang, targetLangName),
    sentence: blanked,
    blankedSentence: blanked,
    sentenceContext: item.example,
    options,
    correctAnswer: item.word,
    word: item.word,
    targetWord: item.word,
    translation: item.translation,
    audioText: item.example,
    xp: 15,
    category: 'grammar',
    skill: 'grammar',
    difficulty: 3,
  }
}

/**
 * 9. Sentence Order Construction
 */
export function createSentenceOrderExercise(item, langId, preferredLang = 'en', targetLangName = '') {
  if (!item.example || item.example.split(' ').length < 3) return null

  const tokens = item.example.split(' ').filter(Boolean)
  return {
    id: `ex_order_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    type: 'sentence-order',
    prompt: getPromptText('sentence_order', preferredLang, targetLangName, item.translation || 'sentence'),
    sentence: item.example,
    words: shuffle([...tokens]),
    correctAnswer: item.example,
    audioText: item.example,
    xp: 20,
    category: 'grammar',
    skill: 'grammar',
    difficulty: 3,
  }
}

/**
 * 10. Challenge Exercise (Advanced composite translation or syntax drill)
 */
export function createChallengeExercise(item, vocabPool, langId, preferredLang = 'en', targetLangName = '') {
  // If item has a rich example sentence, make a sentence ordering or speaking challenge
  if (item.example && item.example.split(' ').length >= 3) {
    const orderEx = createSentenceOrderExercise(item, langId, preferredLang, targetLangName)
    if (orderEx) {
      return {
        ...orderEx,
        isChallenge: true,
        xp: 25,
        difficulty: 4,
      }
    }
  }

  // Fallback: Speaking challenge with longer target
  return {
    ...createSpeakingExercise(item, vocabPool, langId, preferredLang, targetLangName),
    isChallenge: true,
    prompt: `⭐ Challenge Speaking: Say "${item.word}" accurately`,
    xp: 25,
    difficulty: 4,
  }
}

/**
 * Future AI Integration Extension Points
 * Plug in LLM generation hooks seamlessly without breaking local deterministic generation
 */
export const AIExtensionHooks = {
  /**
   * Generates contextual sentence variation using AI when available
   */
  async generateContextualSentence(word, languageId, topic) {
    // Integration-ready hook: returns null for local fallback
    return null
  },

  /**
   * Generates pedagogical explanation for why a mistake occurred
   */
  async generateMistakeExplanation(userUtterance, expectedAnswer, languageId) {
    return null
  },
}

/**
 * Generates an authentic, language-independent 15-question placement assessment
 * with progressive difficulty distribution (5 beginner, 5 intermediate, 5 advanced)
 * covering multiple skills: vocabulary, listening, grammar, sentence construction,
 * script recognition, translation, and speaking.
 *
 * @param {string} languageId - Target learning language ('hi','mr','ta','te','bn','pa','gu','en')
 * @param {string} preferredLangId - Interface language ('en','hi','mr','ta','te','bn','pa','gu')
 * @param {object} options - Optional configuration (count, ageRange, goal)
 * @returns {Array} 15 progressive assessment questions
 */
export function generateAssessmentSuite(languageId, preferredLangId = 'en', options = {}) {
  const langId = rawLessonsByLanguage[languageId] ? languageId : 'hi'
  const targetLang = getLanguageById(langId) || { name: langId, nativeName: langId, id: langId }
  const targetLangName = targetLang.nativeName || targetLang.name
  const lessons = rawLessonsByLanguage[langId] || []

  // Extract and pool all available vocabulary for this language
  const vocabPool = []
  const seenWords = new Set()
  for (const lesson of lessons) {
    for (const v of lesson.vocabulary || []) {
      if (!v.word || !v.translation) continue
      const wordStr = String(v.word).trim()
      const transStr = String(v.translation).trim()
      // Exclude bare digits, synthetic number strings (e.g. 99 — 99)
      if (/^\d+$/.test(wordStr) || /^\d+$/.test(transStr)) continue
      if (/\d+\s*[-—–]\s*\d+/.test(transStr) || /\d+\s*[-—–]\s*\d+/.test(wordStr)) continue
      if (/^[\u0966-\u096F\u09E6-\u09EF\u0A66-\u0A6F\u0AE6-\u0AEF\u0BE6-\u0BEF\u0C66-\u0C6F]+$/.test(wordStr)) continue

      if (!seenWords.has(v.word)) {
        seenWords.add(v.word)
        vocabPool.push(v)
      }
    }
  }

  // Filter candidates for sentence ordering and fill-blank (requiring rich examples)
  const orderCandidates = vocabPool.filter((v) => v.example && v.example.trim().split(/\s+/).length >= 3)
  const fillCandidates = vocabPool.filter((v) => v.example && v.example.includes(v.word))

  const questions = []

  const defaultLangVocab = {
    hi: { word: 'नमस्ते', translation: 'Hello' },
    mr: { word: 'नमस्कार', translation: 'Hello' },
    ta: { word: 'வணக்கம்', translation: 'Hello' },
    te: { word: 'నమస్కారం', translation: 'Hello' },
    bn: { word: 'নমস্কার', translation: 'Hello' },
    pa: { word: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ', translation: 'Hello' },
    gu: { word: 'નમસ્તે', translation: 'Hello' },
    en: { word: 'Hello', translation: 'Hello' },
  }[langId] || { word: 'Hello', translation: 'Hello' }

  // Helper to ensure question has required metadata
  const wrap = (q, meta) => {
    if (!q) {
      // Fallback to robust multiple-choice if generator returned null
      const fallbackItem = vocabPool[questions.length % vocabPool.length] || defaultLangVocab
      q = createWordToMeaningMCQ(fallbackItem, vocabPool, langId, preferredLangId, targetLangName)
    }

    let cleanPrompt = q.prompt || ''
    if (/select\s+(the\s+)?(correct\s+)?image\s+for\s+["']?(.*?)["']?/i.test(cleanPrompt)) {
      const match = cleanPrompt.match(/select\s+(the\s+)?(correct\s+)?image\s+for\s+["']?(.*?)["']?/i)
      const target = match ? match[3] : ''
      cleanPrompt = `What is "${target}" in ${targetLangName || 'target language'}?`
    }

    const isTargetOptions = q.type === 'listening' || q.type === 'fill-blank' || (q.word && q.correctAnswer === q.word)
    const optionLang = isTargetOptions ? langId : preferredLangId
    const cleanCorrect = digitToLanguageWord(q.correctAnswer, optionLang)
    const cleanOptions = Array.isArray(q.options) && q.options.length > 0
      ? sanitizeLanguageOptions(q.options, cleanCorrect, optionLang)
      : q.options

    return {
      ...q,
      ...meta,
      type: (q.type === 'picture_choice' || q.type === 'picture-choice') ? 'multiple-choice' : q.type,
      prompt: cleanPrompt,
      options: cleanOptions,
      correctAnswer: cleanCorrect,
      languageId: langId,
      preferredLanguage: preferredLangId,
    }
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // TIER 1: BEGINNER (Questions 1–5 | Difficulty 1 | XP: 10)
  // Skills: Core vocabulary, high-frequency word meaning, script identification,
  //         basic listening, essential greetings.
  // ══════════════════════════════════════════════════════════════════════════════

  // Q1: Core Vocabulary Recognition (Word Meaning MCQ)
  const q1Item = vocabPool[0] || defaultLangVocab
  questions.push(
    wrap(createWordToMeaningMCQ(q1Item, vocabPool, langId, preferredLangId, targetLangName), {
      tier: 'beginner',
      difficulty: 1,
      skill: 'vocabulary',
      stage: 1,
      stageTitle: 'Stage 1: Fundamentals',
      xp: 10,
    })
  )

  // Q2: Core Vocabulary Meaning (Target Script -> Interface Language MCQ)
  const q2Item = vocabPool[1] || vocabPool[0]
  questions.push(
    wrap(createWordToMeaningMCQ(q2Item, vocabPool, langId, preferredLangId, targetLangName), {
      tier: 'beginner',
      difficulty: 1,
      skill: 'vocabulary',
      stage: 1,
      stageTitle: 'Stage 1: Fundamentals',
      xp: 10,
    })
  )

  // Q3: Script Identification (Meaning -> Target Script MCQ)
  const q3Item = vocabPool[2] || vocabPool[0]
  questions.push(
    wrap(createMeaningToWordMCQ(q3Item, vocabPool, langId, preferredLangId, targetLangName), {
      tier: 'beginner',
      difficulty: 1,
      skill: 'reading',
      stage: 1,
      stageTitle: 'Stage 1: Fundamentals',
      xp: 10,
    })
  )

  // Q4: Fundamental Audio Listening (Hear sound -> Identify word)
  const q4Item = vocabPool[3] || vocabPool[0]
  questions.push(
    wrap(createListeningExercise(q4Item, vocabPool, langId, preferredLangId, targetLangName), {
      tier: 'beginner',
      difficulty: 1,
      skill: 'listening',
      stage: 1,
      stageTitle: 'Stage 1: Fundamentals',
      xp: 10,
    })
  )

  // Q5: Basic Translation / Word Bank
  const q5Item = vocabPool[4] || vocabPool[0]
  questions.push(
    wrap(createTranslationExercise(q5Item, vocabPool, langId, preferredLangId, targetLangName), {
      tier: 'beginner',
      difficulty: 1,
      skill: 'translation',
      stage: 1,
      stageTitle: 'Stage 1: Fundamentals',
      xp: 10,
    })
  )

  // ══════════════════════════════════════════════════════════════════════════════
  // TIER 2: INTERMEDIATE (Questions 6–10 | Difficulty 2–3 | XP: 15)
  // Skills: Contextual vocabulary, grammar particle cloze, listening comprehension,
  //         multi-pair matching, sentence order syntax.
  // ══════════════════════════════════════════════════════════════════════════════

  // Q6: Contextual Daily Vocabulary MCQ
  const q6Item = vocabPool[5] || vocabPool[1]
  questions.push(
    wrap(createWordToMeaningMCQ(q6Item, vocabPool, langId, preferredLangId, targetLangName), {
      tier: 'intermediate',
      difficulty: 2,
      skill: 'vocabulary',
      stage: 2,
      stageTitle: 'Stage 2: Applied Language',
      xp: 15,
    })
  )

  // Q7: Grammar Particle & Syntax Cloze (Fill-in-the-blank)
  const q7Item = fillCandidates[0] || vocabPool[6] || vocabPool[0]
  questions.push(
    wrap(createFillBlankExercise(q7Item, vocabPool, langId, preferredLangId, targetLangName), {
      tier: 'intermediate',
      difficulty: 2,
      skill: 'grammar',
      stage: 2,
      stageTitle: 'Stage 2: Applied Language',
      xp: 15,
    })
  )

  // Q8: Listening Comprehension
  const q8Item = vocabPool[7] || vocabPool[2]
  questions.push(
    wrap(createListeningExercise(q8Item, vocabPool, langId, preferredLangId, targetLangName), {
      tier: 'intermediate',
      difficulty: 2,
      skill: 'listening',
      stage: 2,
      stageTitle: 'Stage 2: Applied Language',
      xp: 15,
    })
  )

  // Q9: 4-Pair Interactive Matching
  const matchCandidates = vocabPool.slice(8, 14)
  questions.push(
    wrap(createMatchingExercise(matchCandidates, langId, preferredLangId, targetLangName), {
      tier: 'intermediate',
      difficulty: 3,
      skill: 'matching',
      stage: 2,
      stageTitle: 'Stage 2: Applied Language',
      xp: 15,
    })
  )

  // Q10: Sentence Order Construction (Syntax Assembly)
  const q10Item = orderCandidates[0] || fillCandidates[0] || vocabPool[0]
  questions.push(
    wrap(createSentenceOrderExercise(q10Item, langId, preferredLangId, targetLangName), {
      tier: 'intermediate',
      difficulty: 3,
      skill: 'sentence_order',
      stage: 2,
      stageTitle: 'Stage 2: Applied Language',
      xp: 15,
    })
  )

  // ══════════════════════════════════════════════════════════════════════════════
  // TIER 3: ADVANCED (Questions 11–15 | Difficulty 3–4 | XP: 20–25)
  // Skills: Complex sentence ordering, advanced cloze, nuanced translation,
  //         speaking & pronunciation, mastery challenge.
  // ══════════════════════════════════════════════════════════════════════════════

  // Q11: Complex Sentence Order
  const q11Item = orderCandidates[1] || orderCandidates[0] || vocabPool[1]
  questions.push(
    wrap(createSentenceOrderExercise(q11Item, langId, preferredLangId, targetLangName), {
      tier: 'advanced',
      difficulty: 4,
      skill: 'sentence_order',
      stage: 3,
      stageTitle: 'Stage 3: Fluency & Syntax',
      xp: 20,
    })
  )

  // Q12: Advanced Contextual Cloze
  const q12Item = fillCandidates[1] || fillCandidates[0] || vocabPool[8] || vocabPool[0]
  questions.push(
    wrap(createFillBlankExercise(q12Item, vocabPool, langId, preferredLangId, targetLangName), {
      tier: 'advanced',
      difficulty: 4,
      skill: 'grammar',
      stage: 3,
      stageTitle: 'Stage 3: Fluency & Syntax',
      xp: 20,
    })
  )

  // Q13: Advanced Translation with Word Bank Tiles
  const q13Item = vocabPool[14] || vocabPool[9] || vocabPool[3]
  questions.push(
    wrap(createTranslationExercise(q13Item, vocabPool, langId, preferredLangId, targetLangName), {
      tier: 'advanced',
      difficulty: 4,
      skill: 'translation',
      stage: 3,
      stageTitle: 'Stage 3: Fluency & Syntax',
      xp: 20,
    })
  )

  // Q14: Speaking & Pronunciation Evaluation
  const q14Item = vocabPool[15] || vocabPool[10] || vocabPool[4]
  questions.push(
    wrap(createSpeakingExercise(q14Item, vocabPool, langId, preferredLangId, targetLangName), {
      tier: 'advanced',
      difficulty: 4,
      skill: 'speaking',
      stage: 3,
      stageTitle: 'Stage 3: Fluency & Syntax',
      xp: 20,
    })
  )

  // Q15: Fluency & Mastery Challenge
  const q15Item = orderCandidates[2] || orderCandidates[0] || vocabPool[16] || vocabPool[0]
  questions.push(
    wrap(createChallengeExercise(q15Item, vocabPool, langId, preferredLangId, targetLangName), {
      tier: 'advanced',
      difficulty: 4,
      skill: 'challenge',
      stage: 3,
      stageTitle: 'Stage 3: Fluency & Syntax',
      xp: 25,
    })
  )

  return questions
}
