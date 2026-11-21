/**
 * Translation coverage test — verifies every key in uiTranslations.js
 * has a non-empty value for all 8 supported languages.
 *
 * Missing translations fall back silently to English in the UI.
 * This test ensures regressions are caught immediately.
 *
 * Run with: node --test tests/translationCoverage.test.mjs
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import { uiTranslations } from '../src/services/uiTranslations.js'

const REQUIRED_LANGS = ['en', 'hi', 'mr', 'ta', 'te', 'bn', 'pa', 'gu']

test('all 8 languages are covered for every translation key', () => {
  const missing = []

  for (const [key, translations] of Object.entries(uiTranslations)) {
    for (const lang of REQUIRED_LANGS) {
      if (!translations[lang] || String(translations[lang]).trim() === '') {
        missing.push(`  ${key}.${lang}`)
      }
    }
  }

  assert.deepEqual(
    missing,
    [],
    `\nMissing or empty translations (${missing.length}):\n${missing.join('\n')}`
  )
})

test('uiTranslations exports at least 100 keys', () => {
  const count = Object.keys(uiTranslations).length
  assert.ok(count >= 100, `Expected >= 100 translation keys, found ${count}`)
})

test('every key value is a string (no undefined, null, or object)', () => {
  const invalid = []
  for (const [key, translations] of Object.entries(uiTranslations)) {
    for (const lang of REQUIRED_LANGS) {
      const val = translations[lang]
      if (typeof val !== 'string') {
        invalid.push(`${key}.${lang}: ${typeof val}`)
      }
    }
  }
  assert.deepEqual(
    invalid,
    [],
    `\nNon-string values found:\n${invalid.join('\n')}`
  )
})
