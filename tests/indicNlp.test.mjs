import assert from 'node:assert/strict'
import test from 'node:test'
import { identifyLanguage, transliterateText } from '../server/services/indicNlp.js'

test('script detector identifies every BharatLingo script without overclaiming Devanagari language', () => {
  assert.deepEqual(identifyLanguage('नमस्ते'), { script: 'Devanagari', candidates: ['hi', 'mr'], confidence: 'script-only', source: 'rule-based' })
  assert.equal(identifyLanguage('வணக்கம்').candidates[0], 'ta')
  assert.equal(identifyLanguage('నమస్కారం').candidates[0], 'te')
  assert.equal(identifyLanguage('নমস্কার').candidates[0], 'bn')
  assert.equal(identifyLanguage('ਸਤ ਸ੍ਰੀ ਅਕਾਲ').candidates[0], 'pa')
  assert.equal(identifyLanguage('નમસ્તે').candidates[0], 'gu')
  assert.equal(identifyLanguage('hello').candidates[0], 'en')
})

test('transliteration safely falls back when no external provider is configured', async () => {
  const result = await transliterateText({ text: 'namaste', source: 'en', target: 'hi' })
  assert.equal(result.transliteratedText, 'namaste')
  assert.ok(['unavailable', 'indicxlit'].includes(result.source))
})
