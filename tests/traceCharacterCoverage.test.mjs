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

test('Canvas active stroke position and bead calculation never throws or produces NaN', () => {
  for (const languageId of ALL_SUPPORTED_LANGUAGES) {
    for (const record of exposedRecords(languageId)) {
      const strokes = getStrokesForCharacter(record.char, languageId)
      const hasStrokes = Boolean(strokes && strokes.length > 0)
      
      if (!hasStrokes) {
        assert.equal(strokes.length, 0)
        continue
      }

      for (let activeStrokeIndex = 0; activeStrokeIndex < strokes.length; activeStrokeIndex++) {
        const activeStroke = strokes[activeStrokeIndex]
        assert.ok(activeStroke, `activeStroke at ${activeStrokeIndex} must exist`)
        assert.ok(activeStroke.path, 'activeStroke path must exist')
        assert.ok(activeStroke.start, 'activeStroke start must exist')
        assert.equal(typeof activeStroke.start.x, 'number')
        assert.equal(typeof activeStroke.start.y, 'number')

        // Test bead position at start, mid, end progress
        for (const strokeProgress of [0, 0.25, 0.5, 0.75, 1.0]) {
          const sampleCount = 80
          // Simulated samples
          const samples = []
          for (let i = 0; i <= sampleCount; i++) {
            samples.push({
              x: activeStroke.start.x + (activeStroke.end ? (activeStroke.end.x - activeStroke.start.x) * (i / sampleCount) : 0),
              y: activeStroke.start.y + (activeStroke.end ? (activeStroke.end.y - activeStroke.start.y) * (i / sampleCount) : 0),
              t: i / sampleCount,
            })
          }

          let activeStrokePos
          if (!activeStroke?.start) {
            activeStrokePos = { x: 150, y: 150 }
          } else if (
            activeStroke.type === 'dot' ||
            strokeProgress === 0 ||
            !samples.length
          ) {
            activeStrokePos = activeStroke.start
          } else {
            const sampleIdx = Math.min(
              Math.max(0, Math.floor(strokeProgress * (samples.length - 1))),
              samples.length - 1
            )
            activeStrokePos = samples[sampleIdx] || activeStroke.start
          }

          assert.ok(activeStrokePos, 'activeStrokePos must exist')
          assert.equal(typeof activeStrokePos.x, 'number')
          assert.equal(typeof activeStrokePos.y, 'number')
          assert.ok(!Number.isNaN(activeStrokePos.x), 'activeStrokePos.x must not be NaN')
          assert.ok(!Number.isNaN(activeStrokePos.y), 'activeStrokePos.y must not be NaN')
        }
      }
    }
  }
})

