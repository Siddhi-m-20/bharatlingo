import test from 'node:test'
import assert from 'node:assert/strict'
import { generateAssessmentSuite } from '../src/services/exercisePool.js'
import { generateAssessmentQuestions } from '../server/services/lessonEngine.js'

const SUPPORTED_LANGUAGES = ['hi', 'mr', 'ta', 'te', 'bn', 'pa', 'gu', 'en']

test('Assessment Suite: generates exactly 15 progressive questions for all 8 languages', () => {
  for (const lang of SUPPORTED_LANGUAGES) {
    const questions = generateAssessmentSuite(lang, 'en')
    assert.equal(questions.length, 15, `Expected 15 questions for ${lang}, got ${questions.length}`)

    // Validate progressive difficulty distribution
    const tier1 = questions.slice(0, 5)
    const tier2 = questions.slice(5, 10)
    const tier3 = questions.slice(10, 15)

    tier1.forEach((q, i) => {
      assert.equal(q.stage, 1, `Q${i + 1} (${lang}) should be stage 1`)
      assert.equal(q.tier, 'beginner', `Q${i + 1} (${lang}) should be beginner tier`)
      assert.equal(q.difficulty, 1, `Q${i + 1} (${lang}) should be difficulty 1`)
      assert.ok(q.xp >= 10, `Q${i + 1} (${lang}) should award >= 10 XP`)
    })

    tier2.forEach((q, i) => {
      assert.equal(q.stage, 2, `Q${i + 6} (${lang}) should be stage 2`)
      assert.equal(q.tier, 'intermediate', `Q${i + 6} (${lang}) should be intermediate tier`)
      assert.ok(q.difficulty >= 2, `Q${i + 6} (${lang}) difficulty >= 2`)
      assert.ok(q.xp >= 15, `Q${i + 6} (${lang}) should award >= 15 XP`)
    })

    tier3.forEach((q, i) => {
      assert.equal(q.stage, 3, `Q${i + 11} (${lang}) should be stage 3`)
      assert.equal(q.tier, 'advanced', `Q${i + 11} (${lang}) should be advanced tier`)
      assert.ok(q.difficulty >= 3, `Q${i + 11} (${lang}) difficulty >= 3`)
      assert.ok(q.xp >= 20, `Q${i + 11} (${lang}) should award >= 20 XP`)
    })
  }
})

test('Assessment Suite: covers multiple diverse exercise skills', () => {
  const questions = generateAssessmentSuite('ta', 'en')
  const exerciseTypes = new Set(questions.map((q) => q.type))

  assert.ok(exerciseTypes.has('picture_choice') || exerciseTypes.has('picture-choice'), 'Missing picture choice')
  assert.ok(exerciseTypes.has('multiple-choice'), 'Missing multiple choice')
  assert.ok(exerciseTypes.has('listening'), 'Missing listening')
  assert.ok(exerciseTypes.has('matching'), 'Missing matching')
  assert.ok(exerciseTypes.has('fill-blank'), 'Missing fill blank')
  assert.ok(exerciseTypes.has('sentence-order') || exerciseTypes.has('sentence_order'), 'Missing sentence order')
  assert.ok(exerciseTypes.has('translation'), 'Missing translation')
  assert.ok(exerciseTypes.has('speaking'), 'Missing speaking')
})

test('Assessment Suite: strictly prevents Hindi leaks for non-Hindi languages', () => {
  const nonHindiLanguages = ['ta', 'te', 'bn', 'pa', 'gu', 'en']
  const devanagariRegex = /[\u0900-\u097F]/

  for (const lang of nonHindiLanguages) {
    const questions = generateAssessmentSuite(lang, 'en')
    questions.forEach((q, idx) => {
      const qJson = JSON.stringify(q)
      assert.equal(
        devanagariRegex.test(qJson),
        false,
        `Hindi script leaked into ${lang} question #${idx + 1}: ${qJson}`
      )
    })
  }
})

test('Assessment Suite: handles interface language (preferredLanguage) decoupling', () => {
  // Learning Tamil with Marathi interface
  const tamilWithMarathi = generateAssessmentSuite('ta', 'mr')
  assert.equal(tamilWithMarathi.length, 15)
  assert.equal(tamilWithMarathi[0].preferredLanguage, 'mr')
  assert.equal(tamilWithMarathi[0].languageId, 'ta')

  // Learning Bengali with English interface
  const bengaliWithEnglish = generateAssessmentSuite('bn', 'en')
  assert.equal(bengaliWithEnglish.length, 15)
  assert.equal(bengaliWithEnglish[0].preferredLanguage, 'en')
  assert.equal(bengaliWithEnglish[0].languageId, 'bn')
})

test('Server lessonEngine: generateAssessmentQuestions returns 15 questions', () => {
  for (const lang of SUPPORTED_LANGUAGES) {
    const questions = generateAssessmentQuestions({ languageId: lang, preferredLanguage: 'en', count: 15 })
    assert.equal(questions.length, 15, `Server lessonEngine returned ${questions.length} questions for ${lang}`)
  }
})

test('Assessment Placement Scoring logic', () => {
  const computePlacementLevel = (scorePercent) => {
    if (scorePercent <= 30) return 'beginner'
    if (scorePercent <= 60) return 'elementary'
    if (scorePercent <= 80) return 'intermediate'
    return 'advanced'
  }

  assert.equal(computePlacementLevel(0), 'beginner')
  assert.equal(computePlacementLevel(20), 'beginner')
  assert.equal(computePlacementLevel(30), 'beginner')
  assert.equal(computePlacementLevel(33), 'elementary')
  assert.equal(computePlacementLevel(50), 'elementary')
  assert.equal(computePlacementLevel(60), 'elementary')
  assert.equal(computePlacementLevel(67), 'intermediate')
  assert.equal(computePlacementLevel(80), 'intermediate')
  assert.equal(computePlacementLevel(87), 'advanced')
  assert.equal(computePlacementLevel(100), 'advanced')
})
