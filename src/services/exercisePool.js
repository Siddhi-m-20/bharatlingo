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

import { getPromptText } from '../data/translations.js'
import { getLanguageById } from '../data/languages.js'
import { rawLessonsByLanguage, translateMeaning } from '../data/lessons/index.js'
import { alphabetDataByLanguage } from '../data/alphabets.js'


// ── Visual Emojis Dictionary for Picture Choice ──────────────────────────────
const VISUAL_EMOJIS = {
  water: '💧', pani: '💧', neer: '💧', jalam: '💧', tholi: '💧', jal: '💧',
  tea: '☕', chai: '☕', theneer: '☕', cha: '☕', chaha: '☕',
  apple: '🍎', seb: '🍎', aappil: '🍎', sebu: '🍎',
  mango: '🥭', aam: '🥭', maangaai: '🥭', maamidipandu: '🥭', amba: '🥭', keri: '🥭',
  food: '🍲', khana: '🍲', saappaadu: '🍲', bhojanam: '🍲', jevan: '🍲', khaaoya: '🍲',
  milk: '🥛', doodh: '🥛', paal: '🥛', paalu: '🥛', dudh: '🥛',
  bread: '🍞', roti: '🍞', appam: '🍞', chapati: '🍞',
  rice: '🍚', chawal: '🍚', saatham: '🍚', annam: '🍚', bhaat: '🍚', bhat: '🍚',
  house: '🏠', home: '🏠', ghar: '🏠', veedu: '🏠', illu: '🏠', baadi: '🏠',
  book: '📖', kitab: '📖', pusthakam: '📖', boi: '📖', pustak: '📖',
  car: '🚗', gaadi: '🚗', vaaganam: '🚗', vandi: '🚗', gadi: '🚗',
  sun: '☀️', suraj: '☀️', sooriyan: '☀️', sooryudu: '☀️', surya: '☀️',
  moon: '🌙', chand: '🌙', nilavu: '🌙', chandrudu: '🌙', chandra: '🌙',
  flower: '🪷', lotus: '🪷', phool: '🪷', poo: '🪷', puvvu: '🪷', phul: '🪷',
  tree: '🌳', ped: '🌳', maram: '🌳', chettu: '🌳', gaach: '🌳', jhaad: '🌳',
  elephant: '🐘', haathi: '🐘', yaanai: '🐘', eenugu: '🐘', haati: '🐘', hathi: '🐘',
  peacock: '🦚', mor: '🦚', mayil: '🦚', nemali: '🦚', mayur: '🦚',
  tiger: '🐅', baagh: '🐅', puli: '🐅', peddapuli: '🐅', bagh: '🐅',
  dog: '🐶', kutta: '🐶', naai: '🐶', kukka: '🐶', kukur: '🐶', kutra: '🐶',
  cat: '🐱', billi: '🐱', poonai: '🐱', pilli: '🐱', beral: '🐱', manjar: '🐱',
  bird: '🐦', pakshi: '🐦', paravai: '🐦', pitta: '🐦', pakhi: '🐦',
  money: '💰', paisa: '💰', panam: '💰', dabbulu: '💰', taka: '💰', paise: '💰',
  hello: '🙏', namaste: '🙏', vanakkam: '🙏', namaskaram: '🙏', nomoshkar: '🙏',
  school: '🏫', vidyalaya: '🏫', pallikkoodam: '🏫', shala: '🏫',
  friend: '🤝', dost: '🤝', nanban: '🤝', snehithudu: '🤝', bondhu: '🤝', mitra: '🤝',
  yes: '✅', haan: '✅', aam: '✅', avunu: '✅', hoy: '✅',
  no: '❌', nahi: '❌', illai: '❌', kaadhu: '❌', na: '❌',
}

export function getVisualEmoji(vocabItem) {
  if (!vocabItem) return '✨'
  const keys = [
    vocabItem.translation?.toLowerCase(),
    vocabItem.word?.toLowerCase(),
    vocabItem.roman?.toLowerCase(),
    vocabItem.pronunciation?.toLowerCase(),
  ].filter(Boolean)

  for (const k of keys) {
    for (const [key, emoji] of Object.entries(VISUAL_EMOJIS)) {
      if (k.includes(key) || key.includes(k)) {
        return emoji
      }
    }
  }

  const fallbackEmojis = ['🌟', '💎', '📚', '🎯', '🌿', '🎨', '🪷', '🛺', '☀️', '🌸']
  const hash = Math.abs((vocabItem.word || '').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0))
  return fallbackEmojis[hash % fallbackEmojis.length]
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

function buildDistractors(correctAnswer, vocabPool, key = 'translation', count = 3) {
  const candidates = vocabPool
    .filter((v) => v[key] && String(v[key]).trim().toLowerCase() !== String(correctAnswer).trim().toLowerCase())
    .map((v) => v[key])
  const unique = [...new Set(candidates)]
  const picked = pickRandom(unique, count)

  // Fallback distractors if pool has fewer than 3 alternatives
  if (picked.length < count) {
    const genericFallbacks = key === 'translation'
      ? ['Hello', 'Thank you', 'Water', 'Friend', 'Good morning', 'House', 'Book', 'Yes']
      : vocabPool.map((v) => v[key] || v.word || v.translation).filter(Boolean)
    for (const fb of genericFallbacks) {
      if (picked.length >= count) break
      if (String(fb).toLowerCase() !== String(correctAnswer).toLowerCase() && !picked.includes(fb)) {
        picked.push(fb)
      }
    }
  }

  return shuffle([...picked, correctAnswer])
}


// ── Exercise Generators (Combinatorial Templates) ────────────────────────────

/**
 * 1. Picture Choice / Visual Match
 */
export function createPictureChoiceExercise(item, vocabPool, langId, preferredLang = 'en', targetLangName = '') {
  const distractors = pickRandom(vocabPool.filter((v) => v.word !== item.word), 3)
  const cardOptions = shuffle([item, ...distractors]).map((opt) => ({
    text: opt.word,
    word: opt.word,
    meaning: opt.translation,
    translation: opt.translation,
    roman: opt.pronunciation || opt.roman || '',
    emoji: getVisualEmoji(opt),
  }))

  return {
    id: `ex_pic_${item.word}_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    type: 'picture_choice',
    prompt: `Select the correct image for "${item.translation}"`,
    questionText: `Select the correct image for "${item.translation}"`,
    targetWord: item.word,
    word: item.word,
    translation: item.translation,
    roman: item.pronunciation || item.roman || '',
    audioText: item.word,
    options: cardOptions,
    correctAnswer: item.word,
    xp: 15,
    category: 'visual_recognition',
    skill: 'vocabulary',
    difficulty: 1,
  }
}

/**
 * 2. Multiple Choice (Target Word -> Translation)
 */
export function createWordToMeaningMCQ(item, vocabPool, langId, preferredLang = 'en', targetLangName = '') {
  const options = buildDistractors(item.translation, vocabPool, 'translation', 3)
  return {
    id: `ex_mcq_wm_${item.word}_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    type: 'multiple-choice',
    prompt: getPromptText('meaning', preferredLang, targetLangName, item.word),
    word: item.word,
    targetWord: item.word,
    translation: item.translation,
    options,
    correctAnswer: item.translation,
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
  const options = buildDistractors(item.word, vocabPool, 'word', 3)
  return {
    id: `ex_mcq_mw_${item.word}_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    type: 'multiple-choice',
    prompt: `What is "${item.translation}" in ${targetLangName || 'target language'}?`,
    word: item.word,
    targetWord: item.word,
    translation: item.translation,
    options,
    correctAnswer: item.word,
    audioText: item.word,
    xp: 12,
    category: 'vocabulary',
    skill: 'vocabulary',
    difficulty: 2,
  }
}

/**
 * 4. Listening Exercise (Hear audio -> Pick matching word)
 */
export function createListeningExercise(item, vocabPool, langId, preferredLang = 'en', targetLangName = '') {
  const options = buildDistractors(item.word, vocabPool, 'word', 3)
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

  return {
    id: `ex_trans_${item.word}_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    type: 'translation',
    prompt: getPromptText('translate_to_target', preferredLang, targetLangName, item.translation),
    correctAnswer: item.word,
    word: item.word,
    targetWord: item.word,
    translation: item.translation,
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
    pairs: selected.map((v) => ({ word: v.word, meaning: v.translation })),
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
  const options = buildDistractors(item.word, vocabPool, 'word', 3)

  return {
    id: `ex_fill_${item.word}_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    type: 'fill-blank',
    prompt: `${getPromptText('fill_blank', preferredLang, targetLangName)}: ${blanked}`,
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
      if (v.word && !seenWords.has(v.word)) {
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
    return {
      ...q,
      ...meta,
      languageId: langId,
      preferredLanguage: preferredLangId,
    }
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // TIER 1: BEGINNER (Questions 1–5 | Difficulty 1 | XP: 10)
  // Skills: Visual recognition, high-frequency word meaning, script identification,
  //         basic listening, essential greetings.
  // ══════════════════════════════════════════════════════════════════════════════

  // Q1: Visual / Picture Choice Recognition
  const q1Item = vocabPool[0] || defaultLangVocab
  questions.push(
    wrap(createPictureChoiceExercise(q1Item, vocabPool, langId, preferredLangId, targetLangName), {
      tier: 'beginner',
      difficulty: 1,
      skill: 'visual_recognition',
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
