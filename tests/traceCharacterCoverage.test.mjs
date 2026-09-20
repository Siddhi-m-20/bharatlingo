import assert from 'node:assert/strict'
import test from 'node:test'
import { alphabetDataByLanguage } from '../src/data/alphabets.js'
import { getStrokesForCharacter } from '../src/data/strokeData.js'

const AUTHENTIC_LANGUAGES = ['hi', 'mr', 'en']
const PENDING_LANGUAGES = ['gu', 'bn', 'pa', 'ta', 'te']
const ALL_SUPPORTED_LANGUAGES = [...AUTHENTIC_LANGUAGES, ...PENDING_LANGUAGES]

function exposedRecords(languageId) {
  const data = alphabetDataByLanguage[languageId]
  return [...(data?.vowels || []), ...(data?.consonants || [])]
}

function isValidStroke(stroke) {
  return (
    stroke &&
    typeof stroke.id === 'string' &&
    typeof stroke.path === 'string' &&
    stroke.path.trim().length > 0 &&
    stroke.start &&
    stroke.end &&
    typeof stroke.start.x === 'number' &&
    typeof stroke.start.y === 'number' &&
    typeof stroke.end.x === 'number' &&
    typeof stroke.end.y === 'number' &&
    // NEVER count generated procedural/fallback stroke IDs as valid
    !stroke.id.startsWith('stroke-main-') &&
    !stroke.id.startsWith('stroke-head-') &&
    !stroke.id.startsWith('stroke-tick-') &&
    !stroke.id.startsWith('stroke-body-') &&
    !stroke.id.startsWith('stroke-flourish-')
  )
}

test('Authentic stroke data: 100% complete for hi, mr, and en', () => {
  const coverage = {}

  for (const languageId of AUTHENTIC_LANGUAGES) {
    const records = exposedRecords(languageId)
    const authenticChars = []
    const missingChars = []

    for (const record of records) {
      const strokes = getStrokesForCharacter(record.char, languageId)
      if (strokes.length > 0 && strokes.every(isValidStroke)) {
        authenticChars.push(record.char)
      } else {
        missingChars.push(record.char)
      }
    }

    coverage[languageId] = {
      total: records.length,
      authentic: authenticChars.length,
      missing: missingChars.length,
      missingChars,
    }

    assert.equal(
      missingChars.length,
      0,
      `Expected 0 missing authentic characters for ${languageId}, but found missing: ${missingChars.join(', ')}`
    )
  }

  // Exact counts
  assert.equal(coverage.hi.authentic, 43, 'Hindi must have exactly 43 authentic characters')
  assert.equal(coverage.mr.authentic, 47, 'Marathi must have exactly 47 authentic characters')
  assert.equal(coverage.en.authentic, 19, 'English must have exactly 19 authentic characters')
})

test('Pending languages: safely return empty array with NO fake or procedural data', () => {
  const coverage = {}

  for (const languageId of PENDING_LANGUAGES) {
    const records = exposedRecords(languageId)
    let fakeOrProceduralCount = 0
    let emptyCount = 0

    for (const record of records) {
      const strokes = getStrokesForCharacter(record.char, languageId)
      assert.ok(Array.isArray(strokes), `Expected array for ${languageId}:${record.char}`)
      if (strokes.length === 0) {
        emptyCount++
      } else {
        fakeOrProceduralCount++
      }
    }

    coverage[languageId] = {
      total: records.length,
      authentic: 0,
      missing: emptyCount,
      fakeOrProcedural: fakeOrProceduralCount,
    }

    assert.equal(
      fakeOrProceduralCount,
      0,
      `Language ${languageId} must return 0 fake/procedural strokes, found ${fakeOrProceduralCount}`
    )
    assert.equal(
      emptyCount,
      records.length,
      `Language ${languageId} must safely return empty strokes for all ${records.length} characters`
    )
  }

  assert.equal(coverage.gu.missing, 31, 'Gujarati must have 31 missing pending characters')
  assert.equal(coverage.bn.missing, 28, 'Bengali must have 28 missing pending characters')
  assert.equal(coverage.pa.missing, 23, 'Gurmukhi must have 23 missing pending characters')
  assert.equal(coverage.ta.missing, 30, 'Tamil must have 30 missing pending characters')
  assert.equal(coverage.te.missing, 32, 'Telugu must have 32 missing pending characters')
})

test('Trace Character lookup is language-aware and always returns safe arrays', () => {
  for (const languageId of ALL_SUPPORTED_LANGUAGES) {
    for (const record of exposedRecords(languageId)) {
      const strokes = getStrokesForCharacter(record.char, languageId)
      assert.ok(Array.isArray(strokes), `${languageId}:${record.char} must resolve to an array`)
    }
  }
})
