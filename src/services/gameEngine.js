/**
 * Game Engine — BharatLingo
 *
 * Core engine powering all 10 educational language-learning games
 * across all 8 supported Indian languages:
 * Hindi (hi), Marathi (mr), Tamil (ta), Telugu (te), Bengali (bn),
 * Punjabi (pa), Gujarati (gu), and English (en).
 *
 * Strict Principles:
 * - Real curriculum vocabulary & alphabet data ONLY.
 * - Zero fallback to Hindi for non-Hindi languages.
 * - Dynamic localization of native meanings into user's preferredLanguage.
 * - Heart-free, continuous educational learning with XP & Gems rewards.
 */

import { rawLessonsByLanguage, translateMeaning } from '../data/lessons/index.js'
import { alphabetDataByLanguage } from '../data/alphabets.js'
import { getLanguageById } from '../data/languages.js'
import { getVisualEmoji, shuffle, pickRandom } from './exercisePool.js'

// ── Game Modes Metadata ──────────────────────────────────────────────────────
export const GAME_MODES = [
  {
    id: 'word_match',
    title: 'Word Match',
    description: 'Connect target-language words with their correct native meanings.',
    category: 'vocabulary',
    icon: '🧩',
    difficulty: 1,
    estimatedMinutes: 2,
    defaultRounds: 4,
    baseXP: 20,
    baseGems: 10,
  },
  {
    id: 'sentence_builder',
    title: 'Sentence Builder',
    description: 'Assemble scrambled words into grammatically coherent sentences.',
    category: 'grammar',
    icon: '🏗️',
    difficulty: 2,
    estimatedMinutes: 3,
    defaultRounds: 5,
    baseXP: 25,
    baseGems: 10,
  },
  {
    id: 'listening_challenge',
    title: 'Listening Challenge',
    description: 'Listen to native speech audio and identify the exact spoken phrase.',
    category: 'audio',
    icon: '🎧',
    difficulty: 2,
    estimatedMinutes: 2,
    defaultRounds: 5,
    baseXP: 20,
    baseGems: 10,
  },
  {
    id: 'quick_translation',
    title: 'Quick Translation',
    description: 'Translate essential everyday phrases under gentle time pressure.',
    category: 'speed',
    icon: '⚡',
    difficulty: 2,
    estimatedMinutes: 2,
    defaultRounds: 5,
    baseXP: 25,
    baseGems: 12,
  },
  {
    id: 'picture_match',
    title: 'Picture Match',
    description: 'Associate real vocabulary words with their visual representation.',
    category: 'vocabulary',
    icon: '🖼️',
    difficulty: 1,
    estimatedMinutes: 2,
    defaultRounds: 5,
    baseXP: 20,
    baseGems: 8,
  },
  {
    id: 'odd_one_out',
    title: 'Odd One Out',
    description: 'Spot the linguistic anomaly among words from common semantic groups.',
    category: 'vocabulary',
    icon: '🔍',
    difficulty: 2,
    estimatedMinutes: 2,
    defaultRounds: 5,
    baseXP: 25,
    baseGems: 10,
  },
  {
    id: 'memory_cards',
    title: 'Memory Cards',
    description: 'Flip cards and remember locations to match words with meanings.',
    category: 'speed',
    icon: '🃏',
    difficulty: 2,
    estimatedMinutes: 3,
    defaultRounds: 3,
    baseXP: 25,
    baseGems: 12,
  },
  {
    id: 'script_challenge',
    title: 'Script Challenge',
    description: 'Master authentic characters, vowels, consonants, and phonetic sounds.',
    category: 'reading',
    icon: '🔤',
    difficulty: 1,
    estimatedMinutes: 2,
    defaultRounds: 5,
    baseXP: 20,
    baseGems: 10,
  },
  {
    id: 'pronunciation_challenge',
    title: 'Pronunciation Challenge',
    description: 'Speak target vocabulary into the microphone with instant phonetic scoring.',
    category: 'audio',
    icon: '🎙️',
    difficulty: 3,
    estimatedMinutes: 3,
    defaultRounds: 5,
    baseXP: 30,
    baseGems: 15,
  },
  {
    id: 'speed_round',
    title: 'Speed Round',
    description: 'Fast-paced mixed sprint across multi-skill questions in 60 seconds.',
    category: 'speed',
    icon: '⏱️',
    difficulty: 3,
    estimatedMinutes: 2,
    defaultRounds: 10,
    baseXP: 35,
    baseGems: 15,
  },
]

// ── Extract authentic language vocabulary safely ─────────────────────────────
function getLanguageVocabPool(langId, preferredLangId = 'en') {
  const lessons = rawLessonsByLanguage[langId] || []
  const pool = []
  const seen = new Set()

  for (const lesson of lessons) {
    for (const v of lesson.vocabulary || []) {
      if (v.word && !seen.has(v.word)) {
        seen.add(v.word)
        pool.push({
          ...v,
          nativeTranslation: translateMeaning(v.translation, preferredLangId),
          originalTranslation: v.translation,
          emoji: getVisualEmoji(v),
        })
      }
    }
  }

  // Safety fallback using authentic words for the target language (never Hindi for others)
  if (pool.length === 0) {
    const defaultWords = {
      hi: [{ word: 'नमस्ते', translation: 'Hello' }, { word: 'पानी', translation: 'Water' }, { word: 'किताब', translation: 'Book' }],
      mr: [{ word: 'नमस्कार', translation: 'Hello' }, { word: 'पाणी', translation: 'Water' }, { word: 'पुस्तक', translation: 'Book' }],
      ta: [{ word: 'வணக்கம்', translation: 'Hello' }, { word: 'தண்ணீர்', translation: 'Water' }, { word: 'புத்தகம்', translation: 'Book' }],
      te: [{ word: 'నమస్కారం', translation: 'Hello' }, { word: 'నీరు', translation: 'Water' }, { word: 'పుస్తకం', translation: 'Book' }],
      bn: [{ word: 'নমস্কার', translation: 'Hello' }, { word: 'জল', translation: 'Water' }, { word: 'বই', translation: 'Book' }],
      pa: [{ word: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ', translation: 'Hello' }, { word: 'ਪਾਣੀ', translation: 'Water' }, { word: 'ਕਿਤਾਬ', translation: 'Book' }],
      gu: [{ word: 'નમસ્તે', translation: 'Hello' }, { word: 'પાણી', translation: 'Water' }, { word: 'પુસ્તક', translation: 'Book' }],
      en: [{ word: 'Hello', translation: 'Hello' }, { word: 'Water', translation: 'Water' }, { word: 'Book', translation: 'Book' }],
    }[langId] || [{ word: 'Hello', translation: 'Hello' }, { word: 'Water', translation: 'Water' }]

    defaultWords.forEach((dw) => {
      pool.push({
        ...dw,
        nativeTranslation: translateMeaning(dw.translation, preferredLangId),
        originalTranslation: dw.translation,
        emoji: getVisualEmoji(dw),
      })
    })
  }

  return pool
}

// ── Extract authentic alphabet characters safely ─────────────────────────────
function getLanguageAlphabetPool(langId) {
  const data = alphabetDataByLanguage[langId]
  if (!data) return []

  const pool = []
  for (const group of ['vowels', 'consonants', 'matras', 'conjuncts']) {
    for (const char of data[group] || []) {
      pool.push({
        ...char,
        group,
        char: char.char || char.letter,
        pronunciation: char.pronunciation || char.sound || char.roman,
        name: char.name || char.char,
        exampleWord: char.exampleWord || char.example,
        exampleMeaning: char.exampleMeaning,
      })
    }
  }
  return pool
}

// ── Game Session Generators ──────────────────────────────────────────────────

/**
 * 1. Word Match Session (Pair Matching)
 */
function buildWordMatchSession(vocabPool, roundsCount = 4) {
  const shuffled = shuffle(vocabPool)
  const rounds = []
  const pairsPerRound = 4

  for (let i = 0; i < roundsCount; i++) {
    const slice = shuffled.slice(i * pairsPerRound, (i + 1) * pairsPerRound)
    const selected = slice.length >= 3 ? slice : pickRandom(vocabPool, pairsPerRound)
    const pairs = selected.map((v, idx) => ({
      id: `${i}-${idx}`,
      left: v.word,
      right: v.nativeTranslation || v.translation,
      pronunciation: v.pronunciation || v.roman,
    }))

    // Left and Right items MUST be shuffled independently to prevent 1-to-1 row alignment
    const leftItems = shuffle(pairs.map((p) => ({ id: p.id, text: p.left, pronunciation: p.pronunciation })))
    const rightItems = shuffle(pairs.map((p) => ({ id: p.id, text: p.right })))

    rounds.push({
      roundNumber: i + 1,
      type: 'word_match',
      pairs,
      leftItems,
      rightItems,
    })
  }
  return rounds
}

/**
 * 2. Sentence Builder Session
 */
function buildSentenceBuilderSession(vocabPool, langId, preferredLangId, roundsCount = 5) {
  const withExamples = vocabPool.filter((v) => v.example && v.example.trim().split(/\s+/).length >= 3)
  const candidates = withExamples.length >= roundsCount ? pickRandom(withExamples, roundsCount) : pickRandom(vocabPool, roundsCount)

  return candidates.map((v, idx) => {
    const rawSentence = (v.example && v.example.trim().split(/\s+/).length >= 3)
      ? v.example
      : `${v.word}`

    const rawTokens = rawSentence
      .replace(/[।\.?!,]/g, '')
      .trim()
      .split(/\s+/)
      .filter(Boolean)

    // Assign unique token IDs to handle duplicate words (e.g. "धीरे धीरे") cleanly
    const tokenObjects = rawTokens.map((tok, tIdx) => ({
      id: `tok-${idx}-${tIdx}-${tok}`,
      word: tok,
    }))

    // Pick 1 distractor token from other vocabulary
    const distractorCandidates = vocabPool.filter((item) => item.word && !rawTokens.includes(item.word))
    const distractor = distractorCandidates[0]?.word
    const distractorObj = distractor
      ? { id: `distractor-${idx}-${distractor}`, word: distractor }
      : null

    const allTokens = distractorObj ? [...tokenObjects, distractorObj] : tokenObjects
    const scrambled = shuffle(allTokens)

    return {
      roundNumber: idx + 1,
      type: 'sentence_builder',
      targetSentence: rawSentence,
      correctTokens: rawTokens,
      scrambledTokens: scrambled,
      prompt: v.exampleMeaning
        ? translateMeaning(v.exampleMeaning, preferredLangId)
        : `Build sentence with "${v.nativeTranslation || v.translation}"`,
      targetWord: v.word,
      meaning: v.nativeTranslation || v.translation,
    }
  })
}

/**
 * 3. Listening Challenge Session
 */
function buildListeningSession(vocabPool, roundsCount = 5) {
  const shuffled = shuffle(vocabPool)
  const rounds = []

  for (let i = 0; i < roundsCount; i++) {
    const correct = shuffled[i % shuffled.length]
    const otherCandidates = vocabPool.filter((v) => v.word !== correct.word).map((v) => v.word)
    const distractors = pickRandom([...new Set(otherCandidates)], 3)
    const options = shuffle([correct.word, ...distractors])

    rounds.push({
      roundNumber: i + 1,
      type: 'listening_challenge',
      audioText: correct.word,
      correctAnswer: correct.word,
      options,
      meaning: correct.nativeTranslation || correct.translation,
      pronunciation: correct.pronunciation || correct.roman,
    })
  }
  return rounds
}

/**
 * 4. Quick Translation Session (Timed)
 */
function buildQuickTranslationSession(vocabPool, roundsCount = 5) {
  const shuffled = shuffle(vocabPool)
  const rounds = []

  for (let i = 0; i < roundsCount; i++) {
    const correct = shuffled[i % shuffled.length]
    const isTargetToNative = i % 2 === 0

    if (isTargetToNative) {
      const otherMeanings = vocabPool
        .filter((v) => v.word !== correct.word)
        .map((v) => v.nativeTranslation || v.translation)
      const distractors = pickRandom([...new Set(otherMeanings)], 3)
      rounds.push({
        roundNumber: i + 1,
        type: 'quick_translation',
        prompt: correct.word,
        pronunciation: correct.pronunciation || correct.roman,
        correctAnswer: correct.nativeTranslation || correct.translation,
        options: shuffle([correct.nativeTranslation || correct.translation, ...distractors]),
        direction: 'target_to_native',
        timeLimitSeconds: 15,
      })
    } else {
      const otherWords = vocabPool.filter((v) => v.word !== correct.word).map((v) => v.word)
      const distractors = pickRandom([...new Set(otherWords)], 3)
      rounds.push({
        roundNumber: i + 1,
        type: 'quick_translation',
        prompt: correct.nativeTranslation || correct.translation,
        correctAnswer: correct.word,
        options: shuffle([correct.word, ...distractors]),
        direction: 'native_to_target',
        timeLimitSeconds: 15,
      })
    }
  }
  return rounds
}

/**
 * 5. Picture / Vocab Match Session
 */
function buildPictureMatchSession(vocabPool, roundsCount = 5) {
  const shuffled = shuffle(vocabPool)
  const rounds = []

  for (let i = 0; i < roundsCount; i++) {
    const correct = shuffled[i % shuffled.length]
    const otherWords = vocabPool.filter((v) => v.word !== correct.word).map((v) => v.word)
    const distractors = pickRandom([...new Set(otherWords)], 3)

    rounds.push({
      roundNumber: i + 1,
      type: 'picture_match',
      emoji: correct.emoji || '✨',
      correctAnswer: correct.word,
      options: shuffle([correct.word, ...distractors]),
      meaning: correct.nativeTranslation || correct.translation,
      pronunciation: correct.pronunciation || correct.roman,
    })
  }
  return rounds
}

/**
 * 6. Odd One Out Session
 */
function buildOddOneOutSession(vocabPool, preferredLangId, roundsCount = 5) {
  // Comprehensive semantic categories to guarantee authentic semantic contrast
  const semanticCategories = {
    food_drinks: ['water', 'tea', 'apple', 'mango', 'food', 'milk', 'bread', 'rice', 'fruit', 'drink', 'sweet'],
    nature: ['sun', 'moon', 'flower', 'tree', 'rain', 'water', 'sky', 'river', 'star', 'mountain'],
    animals: ['elephant', 'peacock', 'tiger', 'dog', 'cat', 'bird', 'cow', 'horse', 'lion', 'fish'],
    people_family: ['father', 'mother', 'brother', 'sister', 'friend', 'teacher', 'family', 'boy', 'girl'],
    greetings_civility: ['hello', 'yes', 'no', 'thank', 'welcome', 'please', 'goodbye'],
    learning_objects: ['book', 'pen', 'school', 'house', 'table', 'chair', 'paper'],
  }

  const rounds = []
  const categoryKeys = Object.keys(semanticCategories)

  // Map items to categories
  const categorized = {}
  categoryKeys.forEach((k) => { categorized[k] = [] })

  vocabPool.forEach((v) => {
    const text = `${v.originalTranslation || v.translation || ''} ${v.exampleMeaning || ''}`.toLowerCase()
    for (const catKey of categoryKeys) {
      if (semanticCategories[catKey].some((kw) => text.includes(kw))) {
        categorized[catKey].push(v)
        break
      }
    }
  })

  const validTargetCats = categoryKeys.filter((k) => categorized[k].length >= 3)

  for (let i = 0; i < roundsCount; i++) {
    const targetCatKey = validTargetCats.length > 0 ? validTargetCats[i % validTargetCats.length] : null
    const otherCats = targetCatKey
      ? categoryKeys.filter((k) => k !== targetCatKey && categorized[k].length >= 1)
      : []

    if (targetCatKey && otherCats.length > 0) {
      const intruderCatKey = otherCats[i % otherCats.length]
      const pickedMain = pickRandom(categorized[targetCatKey], 3)
      const intruder = pickRandom(categorized[intruderCatKey], 1)[0]
      const options = shuffle([
        ...pickedMain.map((item) => ({ word: item.word, meaning: item.nativeTranslation || item.translation, isIntruder: false })),
        { word: intruder.word, meaning: intruder.nativeTranslation || intruder.translation, isIntruder: true },
      ])

      const cleanCategoryName = targetCatKey.replace('_', ' & ').toUpperCase()
      rounds.push({
        roundNumber: i + 1,
        type: 'odd_one_out',
        targetCategory: cleanCategoryName,
        options,
        correctAnswer: intruder.word,
        intruderMeaning: intruder.nativeTranslation || intruder.translation,
      })
    } else {
      // Contrast by distinct semantic meaning using authentic item translations
      const sample = pickRandom(vocabPool, 4)
      const main3 = sample.slice(0, 3)
      const intruder = sample[3] || vocabPool[0]

      const options = shuffle([
        ...main3.map((item) => ({ word: item.word, meaning: item.nativeTranslation || item.translation, isIntruder: false })),
        { word: intruder.word, meaning: intruder.nativeTranslation || intruder.translation, isIntruder: true },
      ])

      rounds.push({
        roundNumber: i + 1,
        type: 'odd_one_out',
        targetCategory: 'DISTINCT THEME',
        options,
        correctAnswer: intruder.word,
        intruderMeaning: intruder.nativeTranslation || intruder.translation,
      })
    }
  }

  return rounds
}

/**
 * 7. Memory Cards Session
 */
function buildMemoryCardsSession(vocabPool, roundsCount = 3) {
  const rounds = []
  const pairsPerRound = 4

  for (let i = 0; i < roundsCount; i++) {
    const items = pickRandom(vocabPool, pairsPerRound)
    const cards = []

    items.forEach((item, idx) => {
      // Target word card
      cards.push({
        id: `card-${i}-${idx}-target`,
        pairId: `pair-${idx}`,
        type: 'target',
        content: item.word,
        pronunciation: item.pronunciation || item.roman,
      })
      // Meaning card
      cards.push({
        id: `card-${i}-${idx}-meaning`,
        pairId: `pair-${idx}`,
        type: 'meaning',
        content: item.nativeTranslation || item.translation,
        emoji: item.emoji,
      })
    })

    rounds.push({
      roundNumber: i + 1,
      type: 'memory_cards',
      cards: shuffle(cards),
      totalPairs: pairsPerRound,
    })
  }
  return rounds
}

/**
 * 8. Script Challenge Session
 */
function buildScriptChallengeSession(langId, vocabPool, roundsCount = 5) {
  const alphabetPool = getLanguageAlphabetPool(langId)
  const rounds = []

  if (alphabetPool.length >= 4) {
    const shuffledChars = shuffle(alphabetPool)
    for (let i = 0; i < roundsCount; i++) {
      const correct = shuffledChars[i % shuffledChars.length]
      const otherChars = alphabetPool.filter((c) => c.char !== correct.char).map((c) => c.char)
      const distractors = pickRandom([...new Set(otherChars)], 3)
      const options = shuffle([correct.char, ...distractors])

      rounds.push({
        roundNumber: i + 1,
        type: 'script_challenge',
        char: correct.char,
        sound: correct.pronunciation || correct.sound || correct.name,
        options,
        correctAnswer: correct.char,
        group: correct.group,
        exampleWord: correct.exampleWord,
      })
    }
  } else {
    // Alphabet not available, fallback to high-frequency core words script identification
    const shuffledVocab = shuffle(vocabPool)
    for (let i = 0; i < roundsCount; i++) {
      const correct = shuffledVocab[i % shuffledVocab.length]
      const otherWords = vocabPool.filter((v) => v.word !== correct.word).map((v) => v.word)
      const distractors = pickRandom([...new Set(otherWords)], 3)
      rounds.push({
        roundNumber: i + 1,
        type: 'script_challenge',
        char: correct.word.charAt(0),
        sound: correct.pronunciation || correct.roman,
        options: shuffle([correct.word, ...distractors]),
        correctAnswer: correct.word,
        meaning: correct.nativeTranslation || correct.translation,
      })
    }
  }
  return rounds
}

/**
 * 9. Pronunciation Challenge Session
 */
function buildPronunciationSession(vocabPool, roundsCount = 5) {
  const shuffled = shuffle(vocabPool)
  const rounds = []

  for (let i = 0; i < roundsCount; i++) {
    const item = shuffled[i % shuffled.length]
    rounds.push({
      roundNumber: i + 1,
      type: 'pronunciation_challenge',
      targetWord: item.word,
      pronunciation: item.pronunciation || item.roman,
      meaning: item.nativeTranslation || item.translation,
      targetScore: 70, // 70% passing threshold
    })
  }
  return rounds
}

/**
 * 10. Speed Round Session (Rapid-fire sequence)
 */
function buildSpeedRoundSession(vocabPool, roundsCount = 10) {
  const shuffled = shuffle(vocabPool)
  const rounds = []

  for (let i = 0; i < roundsCount; i++) {
    const item = shuffled[i % shuffled.length]
    const otherMeanings = vocabPool.filter((v) => v.word !== item.word).map((v) => v.nativeTranslation || v.translation)
    const distractors = pickRandom([...new Set(otherMeanings)], 3)

    rounds.push({
      roundNumber: i + 1,
      type: 'speed_round',
      prompt: item.word,
      pronunciation: item.pronunciation || item.roman,
      correctAnswer: item.nativeTranslation || item.translation,
      options: shuffle([item.nativeTranslation || item.translation, ...distractors]),
      timeLimitTotalSeconds: 60,
    })
  }
  return rounds
}

// ── Master Session Generator ────────────────────────────────────────────────
export function generateGameSession(gameId, targetLangId = 'hi', preferredLangId = 'en', options = {}) {
  const targetLang = getLanguageById(targetLangId) || { id: targetLangId, name: targetLangId }
  const vocabPool = getLanguageVocabPool(targetLang.id, preferredLangId)

  let rounds = []
  switch (gameId) {
    case 'word_match':
      rounds = buildWordMatchSession(vocabPool, options.rounds || 4)
      break
    case 'sentence_builder':
      rounds = buildSentenceBuilderSession(vocabPool, targetLang.id, preferredLangId, options.rounds || 5)
      break
    case 'listening_challenge':
      rounds = buildListeningSession(vocabPool, options.rounds || 5)
      break
    case 'quick_translation':
      rounds = buildQuickTranslationSession(vocabPool, options.rounds || 5)
      break
    case 'picture_match':
      rounds = buildPictureMatchSession(vocabPool, options.rounds || 5)
      break
    case 'odd_one_out':
      rounds = buildOddOneOutSession(vocabPool, preferredLangId, options.rounds || 5)
      break
    case 'memory_cards':
      rounds = buildMemoryCardsSession(vocabPool, options.rounds || 3)
      break
    case 'script_challenge':
      rounds = buildScriptChallengeSession(targetLang.id, vocabPool, options.rounds || 5)
      break
    case 'pronunciation_challenge':
      rounds = buildPronunciationSession(vocabPool, options.rounds || 5)
      break
    case 'speed_round':
      rounds = buildSpeedRoundSession(vocabPool, options.rounds || 10)
      break
    default:
      rounds = buildWordMatchSession(vocabPool, 4)
      break
  }

  const modeMeta = GAME_MODES.find((m) => m.id === gameId) || GAME_MODES[0]

  return {
    gameId,
    modeMeta,
    targetLanguage: targetLang.id,
    targetLanguageName: targetLang.nativeName || targetLang.name,
    preferredLanguage: preferredLangId,
    rounds,
    totalRounds: rounds.length,
    generatedAt: new Date().toISOString(),
  }
}

// ── Rewards Calculator ───────────────────────────────────────────────────────
export function calculateGameRewards(gameId, score, totalRounds) {
  const mode = GAME_MODES.find((m) => m.id === gameId) || GAME_MODES[0]
  const accuracy = totalRounds > 0 ? Math.round((score / totalRounds) * 100) : 0

  const xpBonus = Math.round((accuracy / 100) * (mode.baseXP || 20))
  const gemsBonus = accuracy >= 80 ? (mode.baseGems || 10) : Math.max(3, Math.round((accuracy / 100) * (mode.baseGems || 10)))

  return {
    xpEarned: Math.max(10, xpBonus),
    gemsEarned: gemsBonus,
    accuracy,
    isMastered: accuracy >= 80,
  }
}
