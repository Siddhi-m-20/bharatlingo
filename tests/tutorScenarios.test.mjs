import test from 'node:test'
import assert from 'node:assert/strict'
import {
  CONVERSATION_SCENARIOS,
  SUPPORTED_TUTOR_LANGUAGES,
  isSupportedTutorLanguage,
  getScenariosForLanguage,
} from '../src/data/conversations.js'
import { evaluateTutorResponse } from '../src/services/tutorService.js'

// Expected 8 canonical Indian languages
const EXPECTED_LANGUAGES = ['hi', 'en', 'mr', 'ta', 'te', 'bn', 'pa', 'gu']

test('Language Validation: Supports exactly the 8 canonical languages', () => {
  assert.equal(SUPPORTED_TUTOR_LANGUAGES.length, 8)
  EXPECTED_LANGUAGES.forEach((lang) => {
    assert.ok(isSupportedTutorLanguage(lang), `Language ${lang} must be supported`)
  })

  // Unsupported languages must safely return false
  assert.equal(isSupportedTutorLanguage('fr'), false)
  assert.equal(isSupportedTutorLanguage('es'), false)
  assert.equal(isSupportedTutorLanguage('de'), false)
  assert.equal(isSupportedTutorLanguage(null), false)
  assert.equal(isSupportedTutorLanguage(''), false)
})

test('Scenario Coverage: Every scenario has complete localized content across all 8 languages', () => {
  assert.ok(CONVERSATION_SCENARIOS.length >= 2, 'Must have at least 2 conversation scenarios')

  CONVERSATION_SCENARIOS.forEach((scenario) => {
    assert.ok(scenario.id, 'Scenario must have an ID')
    assert.ok(scenario.title, 'Scenario must have a title')

    EXPECTED_LANGUAGES.forEach((lang) => {
      const turns = scenario.turns[lang]
      assert.ok(Array.isArray(turns), `Scenario "${scenario.id}" must have turns array for language "${lang}"`)
      assert.ok(turns.length >= 3, `Scenario "${scenario.id}" in "${lang}" must have at least 3 conversational turns (got ${turns.length})`)

      turns.forEach((turn, idx) => {
        assert.ok(turn.id, `Turn ${idx} in ${scenario.id}:${lang} must have an ID`)
        assert.ok(typeof turn.tutorMessage === 'string' && turn.tutorMessage.trim().length > 0, `Turn ${idx} in ${scenario.id}:${lang} must have tutorMessage`)
        assert.ok(typeof turn.pronunciation === 'string' && turn.pronunciation.trim().length > 0, `Turn ${idx} in ${scenario.id}:${lang} must have pronunciation`)
        assert.ok(typeof turn.englishMeaning === 'string' && turn.englishMeaning.trim().length > 0, `Turn ${idx} in ${scenario.id}:${lang} must have englishMeaning`)
        assert.ok(Array.isArray(turn.expectedKeywords) && turn.expectedKeywords.length > 0, `Turn ${idx} in ${scenario.id}:${lang} must have expectedKeywords`)
        assert.ok(Array.isArray(turn.suggestedReplies) && turn.suggestedReplies.length > 0, `Turn ${idx} in ${scenario.id}:${lang} must have suggestedReplies`)
        assert.ok(typeof turn.culturalTip === 'string' && turn.culturalTip.trim().length > 0, `Turn ${idx} in ${scenario.id}:${lang} must have culturalTip`)
        assert.ok(typeof turn.grammarNote === 'string' && turn.grammarNote.trim().length > 0, `Turn ${idx} in ${scenario.id}:${lang} must have grammarNote`)
      })
    })
  })
})

test('Zero Fallback Policy: autorickshaw_ride and all scenarios NEVER leak Hindi to other languages', () => {
  // Regex to detect Hindi/Devanagari letters and vowel signs (excluding shared Indic punctuation like Danda U+0964)
  const devanagariLettersRegex = /[\u0904-\u0939\u093E-\u094F\u0958-\u0963]/

  // Languages that DO NOT use Devanagari script: ta, te, bn, pa, gu, en
  const nonDevanagariLanguages = ['ta', 'te', 'bn', 'pa', 'gu', 'en']

  nonDevanagariLanguages.forEach((lang) => {
    const scenarios = getScenariosForLanguage(lang)
    assert.ok(scenarios.length > 0, `Must retrieve scenarios for ${lang}`)

    scenarios.forEach((sc) => {
      sc.turns.forEach((turn, idx) => {
        // The tutorMessage in non-Devanagari languages MUST NOT contain Devanagari characters
        const hasDevanagariInTutor = devanagariLettersRegex.test(turn.tutorMessage)
        assert.equal(
          hasDevanagariInTutor,
          false,
          `Hindi Devanagari leaked into language "${lang}" in scenario "${sc.id}" turn ${idx + 1}: "${turn.tutorMessage}"`
        )

        // Suggested replies in non-Devanagari languages MUST NOT contain Devanagari characters
        turn.suggestedReplies.forEach((reply) => {
          const hasDevanagariInReply = devanagariLettersRegex.test(reply)
          assert.equal(
            hasDevanagariInReply,
            false,
            `Hindi Devanagari leaked into reply for "${lang}" in scenario "${sc.id}": "${reply}"`
          )
        })
      })
    })
  })
})

test('Target / Interface Language Separation: Dialogue in target script, pedagogical notes in interface language', () => {
  EXPECTED_LANGUAGES.forEach((lang) => {
    const scenarios = getScenariosForLanguage(lang)

    scenarios.forEach((sc) => {
      sc.turns.forEach((turn) => {
        // Target dialogue is populated
        assert.ok(turn.tutorMessage.length > 0)
        assert.ok(turn.suggestedReplies.length > 0)

        // English meaning is in Latin script (interface language)
        assert.ok(/[a-zA-Z]/.test(turn.englishMeaning), `English meaning must contain Latin characters: "${turn.englishMeaning}"`)

        // Cultural tip and grammar note are in English (interface language)
        assert.ok(/[a-zA-Z]/.test(turn.culturalTip), `Cultural tip must contain explanatory interface text: "${turn.culturalTip}"`)
        assert.ok(/[a-zA-Z]/.test(turn.grammarNote), `Grammar note must contain explanatory interface text: "${turn.grammarNote}"`)
      })
    })
  })
})

test('Safety: Unsupported languages are safely rejected without fallback', () => {
  assert.deepEqual(getScenariosForLanguage('french'), [])
  assert.deepEqual(getScenariosForLanguage('es'), [])
  assert.deepEqual(getScenariosForLanguage(null), [])
  assert.deepEqual(getScenariosForLanguage(undefined), [])
  assert.deepEqual(getScenariosForLanguage(''), [])
})

test('Tutor Evaluation: Accurately evaluates turns across multiple Indian languages', () => {
  // Test 1: Hindi perfect match
  const hiTurn = CONVERSATION_SCENARIOS[0].turns.hi[0]
  const hiEvalPerfect = evaluateTutorResponse('मुझे एक कप मसाला चाय चाहिए।', hiTurn, 'hi', 'en')
  assert.equal(hiEvalPerfect.isAcceptable, true)
  assert.ok(hiEvalPerfect.score >= 80, `Expected score >= 80, got ${hiEvalPerfect.score}`)

  // Test 2: Marathi keyword match
  const mrTurn = CONVERSATION_SCENARIOS[1].turns.mr[0]
  const mrEval = evaluateTutorResponse('मला रेल्वे स्टेशनला जायचं आहे', mrTurn, 'mr', 'en')
  assert.equal(mrEval.isAcceptable, true)
  assert.ok(mrEval.matchedKeywords >= 1)

  // Test 3: Tamil turn evaluation
  const taTurn = CONVERSATION_SCENARIOS[1].turns.ta[0]
  const taEval = evaluateTutorResponse('எனக்கு ரயில்வே ஸ்டேஷன் போகணும்.', taTurn, 'ta', 'en')
  assert.equal(taEval.isAcceptable, true)

  // Test 4: Gujarati turn evaluation
  const guTurn = CONVERSATION_SCENARIOS[1].turns.gu[0]
  const guEval = evaluateTutorResponse('મને રેલવે સ્ટેશન જવું છે.', guTurn, 'gu', 'en')
  assert.equal(guEval.isAcceptable, true)

  // Test 5: Telugu turn evaluation
  const teTurn = CONVERSATION_SCENARIOS[1].turns.te[0]
  const teEval = evaluateTutorResponse('నాకు రైల్వే స్టేషన్‌కు వెళ్ళాలి.', teTurn, 'te', 'en')
  assert.equal(teEval.isAcceptable, true)

  // Test 6: Bengali turn evaluation
  const bnTurn = CONVERSATION_SCENARIOS[1].turns.bn[0]
  const bnEval = evaluateTutorResponse('আমাকে রেলওয়ে স্টেশন যেতে হবে।', bnTurn, 'bn', 'en')
  assert.equal(bnEval.isAcceptable, true)

  // Test 7: Punjabi turn evaluation
  const paTurn = CONVERSATION_SCENARIOS[1].turns.pa[0]
  const paEval = evaluateTutorResponse('ਮੈਂ ਰੇਲਵੇ ਸਟੇਸ਼ਨ ਜਾਣਾ ਏ।', paTurn, 'pa', 'en')
  assert.equal(paEval.isAcceptable, true)

  // Test 8: English turn evaluation
  const enTurn = CONVERSATION_SCENARIOS[1].turns.en[0]
  const enEval = evaluateTutorResponse('I want to go to the railway station.', enTurn, 'en', 'en')
  assert.equal(enEval.isAcceptable, true)

  // Test 9: Completely irrelevant reply gets rejected gracefully
  const irrelevantEval = evaluateTutorResponse('Astronomy and rocket science', hiTurn, 'hi', 'en')
  assert.equal(irrelevantEval.isAcceptable, false)
  assert.ok(irrelevantEval.score < 40)

  // Test 10: Empty input gets rejected
  const emptyEval = evaluateTutorResponse('', hiTurn, 'hi', 'en')
  assert.equal(emptyEval.isAcceptable, false)
  assert.equal(emptyEval.score, 0)

  // Test 11: Interface language localization for praise
  const hiPraiseEval = evaluateTutorResponse('मुझे एक कप मसाला चाय चाहिए।', hiTurn, 'hi', 'hi')
  assert.equal(hiPraiseEval.praise, 'शानदार उत्तर!')
})
