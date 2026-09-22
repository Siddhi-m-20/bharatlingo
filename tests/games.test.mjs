import test from 'node:test'
import assert from 'node:assert/strict'
import { GAME_MODES, generateGameSession, calculateGameRewards } from '../src/services/gameEngine.js'

const SUPPORTED_LANGUAGES = ['hi', 'mr', 'ta', 'te', 'bn', 'pa', 'gu', 'en']
const NON_HINDI_LANGUAGES = ['ta', 'te', 'bn', 'pa', 'gu', 'en']

test('Game Engine: Exposes all 10 canonical pedagogical game modes with metadata', () => {
  assert.equal(GAME_MODES.length, 10, 'Must expose exactly 10 game modes')

  const expectedIds = [
    'word_match',
    'sentence_builder',
    'listening_challenge',
    'quick_translation',
    'picture_match',
    'odd_one_out',
    'memory_cards',
    'script_challenge',
    'pronunciation_challenge',
    'speed_round',
  ]

  expectedIds.forEach((id) => {
    const mode = GAME_MODES.find((m) => m.id === id)
    assert.ok(mode, `Missing game mode ${id}`)
    assert.ok(mode.title, `Mode ${id} missing title`)
    assert.ok(mode.description, `Mode ${id} missing description`)
    assert.ok(mode.category, `Mode ${id} missing category`)
    assert.ok(mode.icon, `Mode ${id} missing icon`)
    assert.ok(mode.difficulty >= 1 && mode.difficulty <= 3, `Mode ${id} invalid difficulty`)
    assert.ok(mode.baseXP >= 20, `Mode ${id} baseXP must be >= 20`)
    assert.ok(mode.baseGems >= 8, `Mode ${id} baseGems must be >= 8`)
  })
})

test('Game Engine: Generates authentic sessions for all 10 modes across all 8 languages', () => {
  for (const lang of SUPPORTED_LANGUAGES) {
    for (const mode of GAME_MODES) {
      const session = generateGameSession(mode.id, lang, 'en')

      assert.equal(session.gameId, mode.id)
      assert.equal(session.targetLanguage, lang)
      assert.ok(session.rounds && session.rounds.length > 0, `Session ${mode.id} for ${lang} has no rounds`)
      assert.equal(session.totalRounds, session.rounds.length)

      // Validate mode-specific structure
      const round = session.rounds[0]
      if (mode.id === 'word_match') {
        assert.ok(Array.isArray(round.pairs) && round.pairs.length >= 3, 'Word match requires pairs array')
      } else if (mode.id === 'sentence_builder') {
        assert.ok(round.targetSentence && round.correctTokens && round.scrambledTokens, 'Sentence builder tokens missing')
      } else if (mode.id === 'listening_challenge') {
        assert.ok(round.audioText && round.correctAnswer && round.options, 'Listening challenge fields missing')
      } else if (mode.id === 'quick_translation') {
        assert.ok(round.prompt && round.correctAnswer && round.options && round.timeLimitSeconds, 'Quick translation fields missing')
      } else if (mode.id === 'picture_match') {
        assert.ok(round.emoji && round.correctAnswer && round.options, 'Picture match fields missing')
      } else if (mode.id === 'odd_one_out') {
        assert.ok(round.options && round.options.length === 4, 'Odd one out requires 4 options')
        assert.ok(round.options.some((o) => o.isIntruder), 'Odd one out requires 1 intruder')
      } else if (mode.id === 'memory_cards') {
        assert.ok(round.cards && round.cards.length >= 6, 'Memory cards requires at least 6 cards')
      } else if (mode.id === 'script_challenge') {
        assert.ok(round.char && round.options && round.correctAnswer, 'Script challenge fields missing')
      } else if (mode.id === 'pronunciation_challenge') {
        assert.ok(round.targetWord && round.pronunciation && round.targetScore, 'Pronunciation challenge fields missing')
      } else if (mode.id === 'speed_round') {
        assert.ok(round.prompt && round.options && round.correctAnswer, 'Speed round fields missing')
      }
    }
  }
})

test('Game Engine: Strictly prevents Devanagari script leaks for non-Hindi target languages', () => {
  const devanagariRegex = /[\u0900-\u097F]/

  for (const lang of NON_HINDI_LANGUAGES) {
    for (const mode of GAME_MODES) {
      const session = generateGameSession(mode.id, lang, 'en')
      const serialized = JSON.stringify(session)
      assert.equal(
        devanagariRegex.test(serialized),
        false,
        `Hindi script leaked into ${lang} game mode ${mode.id}`
      )
    }
  }
})

test('Game Engine: Interface language decoupling in game sessions', () => {
  // Session for Tamil with Hindi interface
  const tamilSessionWithHindi = generateGameSession('word_match', 'ta', 'hi')
  assert.equal(tamilSessionWithHindi.targetLanguage, 'ta')
  assert.equal(tamilSessionWithHindi.preferredLanguage, 'hi')

  // Session for Bengali with English interface
  const bengaliSessionWithEnglish = generateGameSession('picture_match', 'bn', 'en')
  assert.equal(bengaliSessionWithEnglish.targetLanguage, 'bn')
  assert.equal(bengaliSessionWithEnglish.preferredLanguage, 'en')
})

test('Game Engine: Rewards and scoring calculations', () => {
  // Perfect score
  const perfect = calculateGameRewards('word_match', 4, 4)
  assert.equal(perfect.accuracy, 100)
  assert.equal(perfect.isMastered, true)
  assert.ok(perfect.xpEarned >= 20)
  assert.ok(perfect.gemsEarned >= 10)

  // Half score
  const half = calculateGameRewards('speed_round', 5, 10)
  assert.equal(half.accuracy, 50)
  assert.equal(half.isMastered, false)
  assert.ok(half.xpEarned >= 10)
  assert.ok(half.gemsEarned >= 3)

  // Zero score
  const zero = calculateGameRewards('odd_one_out', 0, 5)
  assert.equal(zero.accuracy, 0)
  assert.equal(zero.isMastered, false)
  assert.ok(zero.xpEarned >= 10, 'Base consolation XP awarded')
  assert.ok(zero.gemsEarned >= 3, 'Base consolation Gems awarded')
})

test('Game Engine: Word Match columns are independently shuffled and structured', () => {
  const session = generateGameSession('word_match', 'hi', 'en')
  for (const round of session.rounds) {
    assert.ok(Array.isArray(round.leftItems), 'leftItems must be an array')
    assert.ok(Array.isArray(round.rightItems), 'rightItems must be an array')
    assert.equal(round.leftItems.length, round.pairs.length)
    assert.equal(round.rightItems.length, round.pairs.length)

    // Every item in leftItems has id and text
    round.leftItems.forEach((item) => {
      assert.ok(item.id, 'Left item must have an id')
      assert.ok(item.text, 'Left item must have text')
    })
    // Every item in rightItems has id and text
    round.rightItems.forEach((item) => {
      assert.ok(item.id, 'Right item must have an id')
      assert.ok(item.text, 'Right item must have text')
    })

    // Both columns reference the exact same pair IDs
    const leftIds = round.leftItems.map((item) => item.id).sort()
    const rightIds = round.rightItems.map((item) => item.id).sort()
    assert.deepEqual(leftIds, rightIds, 'Left and right columns must contain the same pair IDs')
  }
})

test('Game Engine: Sentence Builder tokens have unique IDs supporting duplicate words', () => {
  const session = generateGameSession('sentence_builder', 'hi', 'en')
  for (const round of session.rounds) {
    assert.ok(Array.isArray(round.correctTokens), 'correctTokens must be an array')
    assert.ok(Array.isArray(round.scrambledTokens), 'scrambledTokens must be an array')

    const tokenIds = new Set()
    for (const tok of round.scrambledTokens) {
      assert.ok(tok.id, 'Every scrambled token must have a unique ID')
      assert.ok(tok.word, 'Every scrambled token must have a word property')
      assert.equal(tokenIds.has(tok.id), false, `Duplicate token ID detected: ${tok.id}`)
      tokenIds.add(tok.id)
    }
  }
})

test('Game Engine: Memory cards have unique IDs and balanced pairs', () => {
  const session = generateGameSession('memory_cards', 'ta', 'en')
  for (const round of session.rounds) {
    const cardIds = new Set()
    const pairCounts = {}

    for (const card of round.cards) {
      assert.ok(card.id, 'Card must have unique ID')
      assert.ok(card.pairId, 'Card must have pairId')
      assert.equal(cardIds.has(card.id), false, `Card ID duplicated: ${card.id}`)
      cardIds.add(card.id)

      pairCounts[card.pairId] = (pairCounts[card.pairId] || 0) + 1
    }

    // Every pairId must appear exactly twice (target word + translation)
    Object.entries(pairCounts).forEach(([pairId, count]) => {
      assert.equal(count, 2, `Pair ${pairId} must have exactly 2 cards, got ${count}`)
    })
  }
})
