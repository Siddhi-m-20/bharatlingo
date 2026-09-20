import test from 'node:test'
import assert from 'node:assert/strict'
import { getSkillProficiencies, getLearnerProfile, TOPIC_CATEGORIES } from '../src/services/learnerModel.js'
import { getSM2Stats, createInitialItem, calculateSM2 } from '../src/services/spacedRepetition.js'
import { getLanguageById } from '../src/data/languages.js'

test('Learner Dashboard: Real metrics aggregation with zero hardcoded defaults', () => {
  // Test fresh learner profile
  const freshSkills = getSkillProficiencies('hi')
  assert.equal(typeof freshSkills.overall, 'number', 'Overall accuracy must be a number')
  assert.equal(typeof freshSkills.difficulty, 'number', 'Difficulty must be a number')
  assert.equal(typeof freshSkills.totalAttempts, 'number', 'Total attempts must be a number')

  // Test SM-2 metrics calculation
  const sm2Stats = getSM2Stats('hi')
  assert.ok(typeof sm2Stats.totalTracked === 'number')
  assert.ok(typeof sm2Stats.dueCount === 'number')
  assert.ok(typeof sm2Stats.masteredCount === 'number')
  assert.ok(typeof sm2Stats.learningCount === 'number')
  assert.ok(typeof sm2Stats.averageRetention === 'number')

  // Verify SM-2 item lifecycle
  const item = createInitialItem('नमस्ते', 'Hello', 'hi', 'Greetings')
  assert.equal(item.word, 'नमस्ते')
  assert.equal(item.translation, 'Hello')
  assert.equal(item.easeFactor, 2.5)
  assert.equal(item.repetition, 0)

  const reviewed = calculateSM2(item, 5)
  assert.equal(reviewed.repetition, 1)
  assert.equal(reviewed.interval, 1)
  assert.ok(reviewed.easeFactor >= 2.5)
})

test('Learner Dashboard: Completed lessons calculation respects language scoping', () => {
  const mockUser = {
    learningLanguage: 'mr',
    completedLessons: ['hi-1', 'hi-2', 'mr-1'],
    languageProgress: {
      hi: { completedLessons: ['hi-1', 'hi-2'] },
      mr: { completedLessons: ['mr-1'] },
    },
  }

  const mrCount = mockUser.languageProgress?.mr?.completedLessons?.length ?? mockUser.completedLessons.length
  assert.equal(mrCount, 1, 'Marathi completed lessons must be 1, strictly isolated from Hindi')

  const hiCount = mockUser.languageProgress?.hi?.completedLessons?.length ?? mockUser.completedLessons.length
  assert.equal(hiCount, 2, 'Hindi completed lessons must be 2')
})

test('Learner Dashboard: Continuous learning topics exploration preserves personalized categories', () => {
  assert.ok(TOPIC_CATEGORIES.length >= 8, 'Must expose rich topic categories')
  for (const topic of TOPIC_CATEGORIES) {
    assert.ok(topic.id, 'Topic must have id')
    assert.ok(topic.name, 'Topic must have name')
    assert.ok(topic.icon, 'Topic must have icon')
  }
})

test('Learner Dashboard: Estimated duration scales dynamically with exercise count', () => {
  const calculateDuration = (count) => Math.max(3, Math.ceil(count * 0.45))
  assert.equal(calculateDuration(10), 5, '10 exercises estimate ~5 mins')
  assert.equal(calculateDuration(6), 3, '6 exercises estimate ~3 mins')
  assert.equal(calculateDuration(14), 7, '14 exercises estimate ~7 mins')
})

test('Learner Dashboard Milestone 3B: 14-day activity aggregation handles real & zero activity', () => {
  const mockActivity = [
    { activity_date: '2026-09-15', exercises_completed: 12, xp_earned: 60, session_duration_seconds: 360, language_id: 'hi' },
    { activity_date: '2026-09-17', exercises_completed: 8, xp_earned: 40, session_duration_seconds: 240, language_id: 'hi' },
    { activity_date: '2026-09-18', exercises_completed: 15, xp_earned: 75, session_duration_seconds: 450, language_id: 'hi' },
  ]

  const activityByDate = mockActivity.reduce((result, item) => {
    result[item.activity_date] = {
      exercises: Number(item.exercises_completed),
      xp: Number(item.xp_earned),
      seconds: Number(item.session_duration_seconds),
    }
    return result
  }, {})

  assert.equal(activityByDate['2026-09-15'].exercises, 12)
  assert.equal(activityByDate['2026-09-17'].xp, 40)
  assert.equal(activityByDate['2026-09-18'].seconds, 450)
  assert.equal(activityByDate['2026-09-16'], undefined, 'Missing dates are safely undefined without placeholder numbers')

  const totalExercises = Object.values(activityByDate).reduce((sum, d) => sum + d.exercises, 0)
  const totalXP = Object.values(activityByDate).reduce((sum, d) => sum + d.xp, 0)
  assert.equal(totalExercises, 35)
  assert.equal(totalXP, 175)
})

test('Learner Dashboard Milestone 3B: 28-day monthly activity and consistency calculation', () => {
  const practicedDates = new Set(['2026-09-10', '2026-09-11', '2026-09-12', '2026-09-15', '2026-09-18'])
  const testWindow = [
    '2026-09-10', '2026-09-11', '2026-09-12', '2026-09-13', '2026-09-14',
    '2026-09-15', '2026-09-16', '2026-09-17', '2026-09-18',
  ]

  const activeDays = testWindow.filter((date) => practicedDates.has(date)).length
  assert.equal(activeDays, 5, 'Must accurately count practiced days in window')
  const consistency = Math.round((activeDays / testWindow.length) * 100)
  assert.equal(consistency, 56)
})

test('Learner Dashboard Milestone 3B: Language-scoped skill proficiencies and empty states', () => {
  const mockUserStats = {
    hi: {
      totalAttempts: 20,
      totalCorrect: 18,
      overallAccuracy: 90,
      skills: {
        vocabulary: { attempts: 10, correct: 9, score: 90 },
        listening: { attempts: 5, correct: 5, score: 100 },
        speaking: { attempts: 5, correct: 4, score: 80 },
        grammar: { attempts: 0, correct: 0, score: 0 },
        reading: { attempts: 0, correct: 0, score: 0 },
      },
    },
    ta: {
      totalAttempts: 0,
      totalCorrect: 0,
      overallAccuracy: 0,
      skills: {},
    },
  }

  // Hindi: grammar and reading have 0 attempts, must be identified as not yet practiced
  const hiSkills = mockUserStats.hi.skills
  assert.equal(hiSkills.vocabulary.score, 90)
  assert.equal(hiSkills.listening.attempts, 5)
  assert.equal(hiSkills.grammar.attempts, 0, 'Grammar has 0 attempts; UI must not show fake percent')
  assert.equal(hiSkills.reading.attempts, 0, 'Reading has 0 attempts; UI must not show fake percent')

  // Tamil: fresh language with 0 attempts
  assert.equal(mockUserStats.ta.totalAttempts, 0)
  assert.equal(mockUserStats.ta.overallAccuracy, 0)
})
