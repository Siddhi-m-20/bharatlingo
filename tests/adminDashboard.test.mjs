import test from 'node:test'
import assert from 'node:assert/strict'
import {
  checkIsAdmin,
  aggregateAdminMetrics,
  auditContentHealth,
} from '../src/services/adminService.js'
import { languages } from '../src/data/languages.js'

test('Admin Authorization: Enforces strict admin security checks without bypass', () => {
  // Unauthenticated / null user
  assert.equal(checkIsAdmin(null), false)
  assert.equal(checkIsAdmin({}), false)
  assert.equal(checkIsAdmin({ email: 'random.learner@example.com' }), false)
  assert.equal(checkIsAdmin({ email: 'learner@gmail.com', role: 'learner' }), false)

  // Designated admin emails
  assert.equal(checkIsAdmin({ email: 'admin@bharatlingo.com' }), true)
  assert.equal(checkIsAdmin({ email: 'ADMIN@BHARATLINGO.COM' }), true)
  assert.equal(checkIsAdmin({ email: 'admin@bharatlingo.org' }), true)

  // Role-based admin flag
  assert.equal(checkIsAdmin({ email: 'custom@org.in', role: 'admin' }), true)
  assert.equal(checkIsAdmin({ email: 'custom2@org.in', is_admin: true }), true)
})

test('Admin Metrics Aggregation: Handles completely empty database state without mocking', () => {
  const emptyResult = aggregateAdminMetrics([])

  assert.equal(emptyResult.totalUsers, 0, 'Total users must be 0 for empty database')
  assert.equal(emptyResult.activeLearners, 0, 'Active learners must be 0 for empty database')
  assert.equal(emptyResult.newUsers, 0, 'New users must be 0 for empty database')
  assert.equal(emptyResult.totalXP, 0, 'Total XP must be 0')
  assert.equal(emptyResult.totalLessonsCompleted, 0, 'Total lessons completed must be 0')
  assert.equal(emptyResult.totalExercisesCompleted, 0, 'Total exercises completed must be 0')
  assert.equal(emptyResult.avgStreak, 0, 'Average streak must be 0')
  assert.deepEqual(emptyResult.users, [], 'User list must be empty')
  assert.equal(emptyResult.supportedLanguages, languages.length, 'Supported languages matches catalogue')
})

test('Admin Metrics Aggregation: Aggregates real learner metrics and language scoping accurately', () => {
  const sampleProfiles = [
    {
      id: 'usr-1',
      name: 'Aarav Patel',
      email: 'aarav@example.com',
      preferred_language: 'en',
      learning_language: 'hi',
      level: 'intermediate',
      xp: 250,
      streak: 5,
      completed_lessons: ['hi-1', 'hi-2', 'hi-3'],
      learner_stats: {
        hi: { totalExercises: 24, accuracy: 92 },
      },
      created_at: new Date().toISOString(),
      last_active_date: new Date().toISOString(),
    },
    {
      id: 'usr-2',
      name: 'Priya Sharma',
      email: 'priya@example.com',
      preferred_language: 'hi',
      learning_language: 'mr',
      level: 'beginner',
      xp: 120,
      streak: 2,
      completed_lessons: ['mr-1'],
      learner_stats: {
        mr: { totalExercises: 10, accuracy: 85 },
      },
      created_at: new Date().toISOString(),
      last_active_date: new Date().toISOString(),
    },
    {
      id: 'usr-3',
      name: 'Karthik Raja',
      email: 'karthik@example.com',
      preferred_language: 'ta',
      learning_language: 'te',
      level: 'beginner',
      xp: 0,
      streak: 0,
      completed_lessons: [],
      learner_stats: {},
      created_at: '2025-01-01T00:00:00Z', // Old user, inactive
      last_active_date: null,
    },
  ]

  const result = aggregateAdminMetrics(sampleProfiles)

  assert.equal(result.totalUsers, 3)
  assert.equal(result.activeLearners, 2, 'Only users with streak/xp/recent activity counted as active')
  assert.equal(result.newUsers, 2, 'Only users registered in the last 30 days counted as new')
  assert.equal(result.totalXP, 370, 'Total XP sum (250 + 120 + 0)')
  assert.equal(result.totalLessonsCompleted, 4, 'Total lessons completed sum (3 + 1 + 0)')
  assert.equal(result.totalExercisesCompleted, 34, 'Total exercises sum (24 + 10 + 0)')
  assert.equal(result.avgStreak, 2.3, 'Average streak ((5 + 2 + 0) / 3 = 2.33 -> 2.3)')

  // Language scoping distributions
  assert.equal(result.targetLanguageDistribution.hi, 1)
  assert.equal(result.targetLanguageDistribution.mr, 1)
  assert.equal(result.targetLanguageDistribution.te, 1)

  assert.equal(result.interfaceLanguageDistribution.en, 1)
  assert.equal(result.interfaceLanguageDistribution.hi, 1)
  assert.equal(result.interfaceLanguageDistribution.ta, 1)
})

test('Content Health Audit: Accurately audits curriculum, alphabets, and authentic strokes', () => {
  const healthReports = auditContentHealth()

  assert.equal(healthReports.length, 8, 'Audits all 8 Indian languages')

  const hindiReport = healthReports.find((r) => r.languageId === 'hi')
  assert.ok(hindiReport, 'Hindi report must exist')
  assert.ok(hindiReport.lessonCount > 0, 'Hindi has curriculum lessons')
  assert.ok(hindiReport.totalChars > 0, 'Hindi has alphabet characters')
  assert.equal(hindiReport.hasAuthenticStrokes, true, 'Hindi has authentic stroke data')
  assert.equal(hindiReport.strokeStatus, 'Authentic')

  const marathiReport = healthReports.find((r) => r.languageId === 'mr')
  assert.ok(marathiReport, 'Marathi report must exist')
  assert.equal(marathiReport.hasAuthenticStrokes, true, 'Marathi has authentic stroke data')

  const englishReport = healthReports.find((r) => r.languageId === 'en')
  assert.ok(englishReport, 'English report must exist')
  assert.equal(englishReport.hasAuthenticStrokes, true, 'English has authentic stroke data')

  // Languages pending authentic strokes
  const pendingLanguages = ['gu', 'bn', 'pa', 'ta', 'te']
  pendingLanguages.forEach((langId) => {
    const report = healthReports.find((r) => r.languageId === langId)
    assert.ok(report, `Report must exist for ${langId}`)
    assert.equal(report.hasAuthenticStrokes, false, `${langId} authentic strokes must not be claimed`)
    assert.equal(report.strokeStatus, 'Pending Verification')
    assert.ok(
      report.gaps.includes('Pending authentic stroke tracing data'),
      `${langId} must flag pending stroke data gap`
    )
  })
})
