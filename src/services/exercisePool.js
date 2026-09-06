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
      : ['नमस्ते', 'धन्यवाद', 'पानी', 'मित्र', 'घर', 'किताब', 'हाँ']
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
