import assert from 'node:assert/strict'
import test from 'node:test'
import { alphabetDataByLanguage } from '../src/data/alphabets.js'
import { getStrokesForCharacter } from '../src/data/strokeData.js'

const supportedLanguages = ['hi', 'en', 'mr', 'ta', 'te', 'bn', 'pa', 'gu']

function exposedRecords(languageId) {
  const data = alphabetDataByLanguage[languageId]
  return [...(data.vowels || []), ...(data.consonants || [])]
}

function isValidStroke(stroke) {
  return stroke
    && typeof stroke.id === 'string'
    && typeof stroke.path === 'string'
    && stroke.path.trim().length > 0
    && stroke.start
    && stroke.end
    && typeof stroke.start.x === 'number'
    && typeof stroke.start.y === 'number'
    && typeof stroke.end.x === 'number'
    && typeof stroke.end.y === 'number'
}

test('Trace Character exposes an explicit stroke record for every language record', () => {
  const missing = []

  for (const languageId of supportedLanguages) {
    for (const record of exposedRecords(languageId)) {
      const strokes = getStrokesForCharacter(record.char, languageId)
      if (!strokes.length || !strokes.every(isValidStroke)) {
        missing.push(`${languageId}:${record.char}`)
      }
    }
  }

  assert.deepEqual(missing, [], `Missing authentic stroke data: ${missing.join(', ')}`)
})

test('Trace Character lookup is language-aware', () => {
  for (const languageId of supportedLanguages) {
    for (const record of exposedRecords(languageId)) {
      const strokes = getStrokesForCharacter(record.char, languageId)
      assert.ok(Array.isArray(strokes), `${languageId}:${record.char} must resolve to an array`)
    }
  }
})
