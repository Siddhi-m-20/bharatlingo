import test from 'node:test'
import assert from 'node:assert/strict'

import {
  normalizeIndicSpeechText,
  calculateLevenshteinDistance,
  calculateStringSimilarity,
  evaluatePronunciation,
} from '../src/services/audio/PronunciationScorer.js'

import {
  strictVoiceLocales,
  AUDIO_STATE,
  ClientAudioCache,
  CentralAudioService,
} from '../src/services/audio/AudioService.js'

import {
  REC_STATE,
  normalizeText,
  calculateSpeakingScore,
  SpeechRecognitionService,
} from '../src/services/audio/SpeechRecognitionService.js'

import {
  SUPPORTED_LANGUAGES as BACKEND_TTS_LANGUAGES,
  ServerAudioCache,
  synthesizeSpeech,
} from '../server/services/tts.js'

import { speechToText } from '../server/services/speech.js'

// ==============================================================================
// 1. PRONUNCIATION SCORER SUITE
// ==============================================================================
test('PronunciationScorer: Indic text normalization strips punctuation & danda while preserving scripts', () => {
  // Hindi with Danda and punctuation
  const hiNorm = normalizeIndicSpeechText('नमस्ते! आप कैसे हैं? सब ठीक।')
  assert.equal(hiNorm, 'नमस्ते आप कैसे हैं सब ठीक')

  // Bengali with Danda
  const bnNorm = normalizeIndicSpeechText('নমস্কার! কেমন আছেন?')
  assert.equal(bnNorm, 'নমস্কার কেমন আছেন')

  // Tamil script
  const taNorm = normalizeIndicSpeechText('வணக்கம்! எப்படி இருக்கிறீர்கள்?')
  assert.equal(taNorm, 'வணக்கம் எப்படி இருக்கிறீர்கள்')

  // Telugu script
  const teNorm = normalizeIndicSpeechText('నమస్కారం! బాగున్నారా?')
  assert.equal(teNorm, 'నమస్కారం బాగున్నారా')

  // Punjabi (Gurmukhi) script
  const paNorm = normalizeIndicSpeechText('ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਕੀ ਹਾਲ ਹੈ?')
  assert.equal(paNorm, 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ ਕੀ ਹਾਲ ਹੈ')

  // Gujarati script
  const guNorm = normalizeIndicSpeechText('નમસ્તે! તમે કેમ છો?')
  assert.equal(guNorm, 'નમસ્તે તમે કેમ છો')

  // English
  const enNorm = normalizeIndicSpeechText('Hello, world! How are you doing today?')
  assert.equal(enNorm, 'hello world how are you doing today')

  // Empty / null
  assert.equal(normalizeIndicSpeechText(''), '')
  assert.equal(normalizeIndicSpeechText(null), '')
  assert.equal(normalizeIndicSpeechText(undefined), '')
})

test('PronunciationScorer: Exact match evaluations score >= 90 across all 8 supported languages', () => {
  const languagePairs = [
    { lang: 'hi', target: 'मुझे एक कप चाय चाहिए', spoken: 'मुझे एक कप चाय चाहिए' },
    { lang: 'mr', target: 'मला एक कप चहा हवा आहे', spoken: 'मला एक कप चहा हवा आहे' },
    { lang: 'ta', target: 'எனக்கு ஒரு கப் டீ வேண்டும்', spoken: 'எனக்கு ஒரு கப் டீ வேண்டும்' },
    { lang: 'te', target: 'నాకు ఒక కప్పు టీ కావాలి', spoken: 'నాకు ఒక కప్పు టీ కావాలి' },
    { lang: 'bn', target: 'আমাকে এক কাপ চা দিন', spoken: 'আমাকে এক কাপ চা দিন' },
    { lang: 'pa', target: 'ਮੈਨੂੰ ਇੱਕ ਕੱਪ ਚਾਹ ਚਾਹੀਦੀ ਹੈ', spoken: 'ਮੈਨੂੰ ਇੱਕ ਕੱਪ ਚਾਹ ਚਾਹੀਦੀ ਹੈ' },
    { lang: 'gu', target: 'મને એક કપ ચા જોઈએ છે', spoken: 'મને એક કપ ચા જોઈએ છે' },
    { lang: 'en', target: 'I would like a cup of tea please', spoken: 'I would like a cup of tea please' },
  ]

  languagePairs.forEach(({ lang, target, spoken }) => {
    const result = evaluatePronunciation(target, spoken)
    assert.equal(result.isMatch, true, `Language ${lang} should be a match`)
    assert.ok(result.score >= 90, `Language ${lang} exact score should be >= 90, got ${result.score}`)
    assert.equal(result.wordsToImprove.length, 0, `Language ${lang} should have 0 words to improve`)
    assert.equal(result.wordResults.every((w) => w.matchStatus === 'exact'), true)
  })
})

test('PronunciationScorer: Word-level alignment, close matches, and words-to-improve diagnostics', () => {
  // Target: "मला रेल्वे स्टेशनला जायचं आहे"
  // Spoken with one slight typo/mispronunciation: "मला बस स्टेशनला जायचं आहे" (swapped railway for bus)
  const target = 'मला रेल्वे स्टेशनला जायचं आहे'
  const spoken = 'मला बस स्टेशनला जायचं आहे'

  const evalResult = evaluatePronunciation(target, spoken)

  assert.ok(evalResult.score > 0 && evalResult.score <= 100, `Score ${evalResult.score} within bounds`)
  assert.ok(evalResult.wordResults.length === 5, 'Must evaluate all 5 target words')

  // "रेल्वे" was replaced by "बस", so it should be flagged in wordsToImprove
  assert.ok(
    evalResult.wordsToImprove.includes('रेल्वे'),
    'Should flag the missing/incorrect word "रेल्वे"'
  )

  // Words that were spoken correctly should have matchStatus === 'exact'
  const malaMatch = evalResult.wordResults.find((w) => w.targetWord === 'मला')
  assert.equal(malaMatch.matchStatus, 'exact')

  const stationMatch = evalResult.wordResults.find((w) => w.targetWord === 'स्टेशनला')
  assert.equal(stationMatch.matchStatus, 'exact')
})

test('PronunciationScorer: Completely missed and irrelevant speech yields isMatch: false', () => {
  const result = evaluatePronunciation('नमस्ते आप कैसे हैं', 'aeroplane rocket astronomy')
  assert.equal(result.isMatch, false)
  assert.ok(result.score < 50, `Score should be low, got ${result.score}`)
  assert.ok(result.wordsToImprove.length > 0)
})

test('PronunciationScorer: Empty and null inputs safely return score: 0 without throwing', () => {
  const emptyTarget = evaluatePronunciation('', 'नमस्ते')
  assert.equal(emptyTarget.score, 0)
  assert.equal(emptyTarget.isMatch, false)

  const nullTarget = evaluatePronunciation(null, 'hello')
  assert.equal(nullTarget.score, 0)
  assert.equal(nullTarget.isMatch, false)

  const emptySpoken = evaluatePronunciation('नमस्ते', '')
  assert.equal(emptySpoken.score, 0)
  assert.equal(emptySpoken.isMatch, false)
  assert.ok(emptySpoken.wordsToImprove.includes('नमस्ते'))

  const nullSpoken = evaluatePronunciation('hello', null)
  assert.equal(nullSpoken.score, 0)
  assert.equal(nullSpoken.isMatch, false)
})

test('PronunciationScorer: Score bounds are strictly invariant [0, 100]', () => {
  const testCases = [
    ['', ''],
    ['a', 'z'],
    ['नमस्ते', 'नमस्ते'],
    ['long sentence with many words in Hindi or Marathi', 'short'],
    ['एक दो तीन चार पाँच', 'एक दो'],
  ]

  testCases.forEach(([target, spoken]) => {
    const res = evaluatePronunciation(target, spoken)
    assert.ok(res.score >= 0, `Score ${res.score} must be >= 0`)
    assert.ok(res.score <= 100, `Score ${res.score} must be <= 100`)
  })
})

// ==============================================================================
// 2. AUDIO SERVICE SUITE
// ==============================================================================
test('AudioService: Client LRU cache stores, retrieves, and enforces capacity eviction', () => {
  const cache = new ClientAudioCache(3) // small max size of 3

  // Test set & get
  cache.set('hi', 'नमस्ते', 1.0, 'blob:http://localhost/hi-1')
  cache.set('mr', 'नमस्कार', 1.0, 'blob:http://localhost/mr-1')
  cache.set('ta', 'வணக்கம்', 1.0, 'blob:http://localhost/ta-1')

  assert.equal(cache.has('hi', 'नमस्ते', 1.0), true)
  assert.equal(cache.get('hi', 'नमस्ते', 1.0), 'blob:http://localhost/hi-1')
  assert.equal(cache.get('mr', 'नमस्कार', 1.0), 'blob:http://localhost/mr-1')

  // Access 'hi' so 'mr' becomes oldest
  cache.get('hi', 'नमस्ते', 1.0)

  // Insert 4th item -> should evict 'ta' or oldest untouched item
  cache.set('te', 'నమస్కారం', 1.0, 'blob:http://localhost/te-1')

  // Max capacity 3 must be strictly respected
  assert.ok(cache._urls.size <= 3, `Cache size must not exceed 3, got ${cache._urls.size}`)
  assert.equal(cache.has('te', 'నమస్కారం', 1.0), true)

  // Clear cache
  cache.clear()
  assert.equal(cache._urls.size, 0)
})

test('AudioService: Strict locale configuration maps all 8 languages with zero cross-language bleeding', () => {
  const supported = ['hi', 'en', 'mr', 'ta', 'te', 'bn', 'pa', 'gu']

  supported.forEach((lang) => {
    const locales = strictVoiceLocales[lang]
    assert.ok(Array.isArray(locales) && locales.length > 0, `Locales must exist for ${lang}`)

    // No non-Hindi language should include 'hi-in' or 'hi'
    if (lang !== 'hi') {
      assert.equal(locales.includes('hi-in'), false, `${lang} must not include Hindi`)
      assert.equal(locales.includes('hi'), false, `${lang} must not include Hindi`)
    }

    // No non-English language should include 'en-us' or 'en-in'
    if (lang !== 'en') {
      assert.equal(locales.includes('en-us'), false, `${lang} must not include English`)
      assert.equal(locales.includes('en-in'), false, `${lang} must not include English`)
    }
  })
})

test('AudioService: getStrictVoice strictly matches target language and rejects foreign voices', () => {
  const service = new CentralAudioService()

  const dummyVoices = [
    { name: 'Google Hindi', lang: 'hi-IN' },
    { name: 'Google English UK', lang: 'en-GB' },
    { name: 'Google Marathi', lang: 'mr-IN' },
    { name: 'Google Tamil', lang: 'ta-IN' },
    { name: 'Google Telugu', lang: 'te-IN' },
  ]

  // Tamil request must resolve to Tamil voice
  const taVoice = service.getStrictVoice('ta', dummyVoices)
  assert.ok(taVoice)
  assert.equal(taVoice.name, 'Google Tamil')

  // Marathi request must resolve to Marathi voice
  const mrVoice = service.getStrictVoice('mr', dummyVoices)
  assert.ok(mrVoice)
  assert.equal(mrVoice.name, 'Google Marathi')

  // Bengali request has no voice in dummyVoices -> must return null, NEVER fallback to Hindi or English!
  const bnVoice = service.getStrictVoice('bn', dummyVoices)
  assert.equal(bnVoice, null, 'Unmatched language must return null rather than foreign voice')
})

test('AudioService: State machine manages transitions and listeners properly', () => {
  const service = new CentralAudioService()
  assert.equal(service.getState(), AUDIO_STATE.IDLE)

  const states = []
  const unsubscribe = service.subscribe((state) => {
    states.push(state)
  })

  service._setState(AUDIO_STATE.LOADING, 'test-id')
  assert.equal(service.getState(), AUDIO_STATE.LOADING)

  service._setState(AUDIO_STATE.PLAYING, 'test-id')
  assert.equal(service.getState(), AUDIO_STATE.PLAYING)

  service._setState(AUDIO_STATE.COMPLETED, 'test-id')
  assert.equal(service.getState(), AUDIO_STATE.COMPLETED)

  service.stop()
  assert.equal(service.getState(), AUDIO_STATE.IDLE)

  unsubscribe()
})

test('AudioService: Unified speak rejects empty text with no_text reason', async () => {
  const service = new CentralAudioService()
  const result = await service.speak('   ', 'hi')
  assert.equal(result.success, false)
  assert.equal(result.reason, 'no_text')
})

// ==============================================================================
// 3. SPEECH RECOGNITION SERVICE SUITE
// ==============================================================================
test('SpeechRecognitionService: Locale mapping maps all 8 languages to Indian speech locales', () => {
  const service = new SpeechRecognitionService()
  const expectedMap = {
    hi: 'hi-in',
    en: 'en-in',
    mr: 'mr-in',
    ta: 'ta-in',
    te: 'te-in',
    bn: 'bn-in',
    pa: 'pa-in',
    gu: 'gu-in',
  }

  Object.entries(expectedMap).forEach(([lang, expectedLocale]) => {
    const locale = service._getLocale(lang).toLowerCase()
    assert.equal(locale, expectedLocale, `Locale for ${lang} must match ${expectedLocale}`)
  })
})

test('SpeechRecognitionService: Gracefully handles unsupported browser environments', (t, done) => {
  // Instantiate service without window.SpeechRecognition
  const service = new SpeechRecognitionService()
  assert.equal(service.isSupported(), false)

  service.start('hi', 'नमस्ते', {
    onError: (err) => {
      assert.equal(err.type, 'unsupported')
      assert.ok(err.message.includes('not available'))
      assert.equal(service.getState(), REC_STATE.UNSUPPORTED)
      done()
    },
  })
})

test('SpeechRecognitionService: calculateSpeakingScore integrates token & char Levenshtein', () => {
  // Test matching sentence
  const res = calculateSpeakingScore('नमस्ते आप कैसे हैं', 'नमस्ते! आप कैसे हैं?')
  assert.equal(res.isMatch, true)
  assert.ok(res.score >= 85)
  assert.ok(['Excellent', 'Great'].includes(res.grade))

  // Test partial match
  const partial = calculateSpeakingScore('नमस्ते आप', 'नमस्ते आप कैसे हैं')
  assert.ok(partial.score > 0 && partial.score < 90)

  // Test completely mismatched words
  const mismatch = calculateSpeakingScore('कलम दवात किताब', 'पानी खाना पीना')
  assert.equal(mismatch.isMatch, false)
})

// ==============================================================================
// 4. BACKEND TTS & SPEECH SERVICES SUITE
// ==============================================================================
test('Backend TTS: ServerAudioCache enforces bounded in-memory cache and LRU eviction', () => {
  const cache = new ServerAudioCache(3)
  cache.set('k1', { buffer: Buffer.from('a'), contentType: 'audio/mpeg' })
  cache.set('k2', { buffer: Buffer.from('b'), contentType: 'audio/mpeg' })
  cache.set('k3', { buffer: Buffer.from('c'), contentType: 'audio/mpeg' })

  assert.ok(cache.get('k1'))
  assert.ok(cache.get('k2'))

  // Add 4th -> k3 is oldest unaccessed
  cache.set('k4', { buffer: Buffer.from('d'), contentType: 'audio/mpeg' })
  assert.equal(cache.get('k3'), null, 'k3 must be evicted under LRU')
  assert.ok(cache.get('k4'))
})

test('Backend TTS: Supported languages list contains all 8 languages plus Kannada & Malayalam', () => {
  const required = ['hi', 'en', 'mr', 'ta', 'te', 'bn', 'pa', 'gu', 'kn', 'ml']
  required.forEach((lang) => {
    assert.ok(BACKEND_TTS_LANGUAGES[lang], `Backend TTS must configure ${lang}`)
    assert.ok(BACKEND_TTS_LANGUAGES[lang].code)
    assert.ok(BACKEND_TTS_LANGUAGES[lang].googleCode)
  })
})

test('Backend TTS: synthesizeSpeech rejects empty or missing text', async () => {
  await assert.rejects(
    async () => {
      await synthesizeSpeech('', 'hi')
    },
    { message: 'Missing text for speech synthesis' }
  )

  await assert.rejects(
    async () => {
      await synthesizeSpeech('   ', 'mr')
    },
    { message: 'Missing text for speech synthesis' }
  )
})

test('Backend STT: speechToText handles absence of external AI server gracefully', async () => {
  // Without INDICCONFORMER_URL set
  const result = await speechToText('mock-audio-base64', 'hi')
  assert.equal(result.source, 'none')
  assert.equal(result.text, '')
  assert.ok(result.note.includes('browser speech recognition'))
})

// ==============================================================================
// 5. SECURITY & ZERO SECRETS CLIENT-SIDE AUDIT
// ==============================================================================
test('Security Audit: Client-side audio services expose zero private tokens or credentials', () => {
  const clientAudioSources = [
    normalizeIndicSpeechText.toString(),
    evaluatePronunciation.toString(),
    CentralAudioService.toString(),
    SpeechRecognitionService.toString(),
  ].join('\n')

  // Must not contain service-role keys or passwords
  assert.equal(/service_role/i.test(clientAudioSources), false)
  assert.equal(/supabase_secret/i.test(clientAudioSources), false)
  assert.equal(/bearer [a-z0-9_\-\.]{30,}/i.test(clientAudioSources), false)
})
