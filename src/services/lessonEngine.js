/**
 * Adaptive Lesson Engine — BharatLingo
 *
 * Truly Adaptive Lesson Generator & Selector inspired by Duolingo / Bhasha.
 *
 * Core Architecture:
 * 1. 4-Part Adaptive Mix:
 *    - NEW (30%): New vocabulary and phrases for the topic
 *    - PRACTICE (30%): Varied active recall drills (MCQ, picture, translation, listening)
 *    - REVIEW (25%): Spaced repetition due items & recent mistake reinforcement
 *    - CHALLENGE (15%): Advanced sentence construction & speaking challenges
 * 2. Dynamic Difficulty Calibration (Levels 1 to 5)
 * 3. Pedagogical Rationale: Explicitly explains why this lesson was chosen for the learner
 * 4. Language-Independent: Serves all 8 Indian languages using rich seed data
 */

import { getLessonsForLanguage } from '../data/lessons/index.js'
import { getLanguageById } from '../data/languages.js'
import { getPromptText, getLocalizedTopicName } from '../data/translations.js'
import {
  getLearnerProfile,
  getWeakAreas,
  getStrongAreas,
  getReviewCandidates,
  TOPIC_CATEGORIES,
} from './learnerModel.js'
import {
  createPictureChoiceExercise,
  createWordToMeaningMCQ,
  createMeaningToWordMCQ,
  createListeningExercise,
  createSpeakingExercise,
  createTranslationExercise,
  createMatchingExercise,
  createFillBlankExercise,
  createSentenceOrderExercise,
  createChallengeExercise,
  pickRandom,
} from './exercisePool.js'


// ── Reading passages per language ─────────────────────────────────────────────
const READING_PASSAGES = {
  hi: [
    { passage: 'राम और सीता अच्छे दोस्त हैं। वे रोज़ साथ खाना खाते हैं। उन्हें चाय बहुत पसंद है।', question: 'राम और सीता क्या हैं?', options: ['अच्छे दोस्त', 'भाई-बहन', 'पड़ोसी', 'शिक्षक-छात्र'], correctAnswer: 'अच्छे दोस्त', translation: 'Ram and Sita are good friends. They eat together every day.' },
    { passage: 'मुंबई एक बड़ा शहर है। यहाँ बहुत लोग रहते हैं। समुद्र किनारे पर चलना अच्छा लगता है।', question: 'मुंबई कैसा शहर है?', options: ['बड़ा शहर', 'छोटा गाँव', 'पहाड़ी इलाका', 'रेगिस्तान'], correctAnswer: 'बड़ा शहर', translation: 'Mumbai is a big city. Many people live here.' },
    { passage: 'सुबह उठकर योग करना स्वास्थ्य के लिए अच्छा है। रोज़ व्यायाम करने से शरीर मज़बूत होता है।', question: 'योग कब करना चाहिए?', options: ['सुबह', 'दोपहर', 'रात', 'शाम'], correctAnswer: 'सुबह', translation: 'Doing yoga after waking up in the morning is good for health.' },
  ],
  mr: [
    { passage: 'पुणे एक सुंदर शहर आहे. येथे अनेक ऐतिहासिक किल्ले आहेत. पावसाळ्यात हे शहर हिरवेगार दिसते.', question: 'पुणे कसे शहर आहे?', options: ['सुंदर', 'जुने', 'गरम', 'लहान'], correctAnswer: 'सुंदर', translation: 'Pune is a beautiful city with historical forts.' },
    { passage: 'आई रोज सकाळी स्वयंपाक करते. ती वरण-भात आणि भाजी बनवते. आमचे कुटुंब एकत्र जेवण करते.', question: 'आई रोज काय करते?', options: ['स्वयंपाक', 'खेळ', 'वाचन', 'बागकाम'], correctAnswer: 'स्वयंपाक', translation: 'Mother cooks every morning. Our family eats together.' },
  ],
  ta: [
    { passage: 'சென்னை தமிழ்நாட்டின் தலைநகரம். இங்கு கோயில்கள் மிகவும் அழகாக இருக்கின்றன. கடற்கரை மிகவும் பிரசித்தி பெற்றது.', question: 'சென்னை எதற்கு பிரசித்தி?', options: ['கடற்கரை', 'மலை', 'ஆறு', 'காடு'], correctAnswer: 'கடற்கரை', translation: 'Chennai is the capital of Tamil Nadu.' },
    { passage: 'அம்மா தினமும் இட்லி சாம்பார் செய்கிறாள். குடும்பம் சேர்ந்து சாப்பிடுகிறது.', question: 'அம்மா தினமும் என்ன செய்கிறாள்?', options: ['சாப்பிட செய்கிறாள்', 'பள்ளி செல்கிறாள்', 'கடை செல்கிறாள்', 'தூங்குகிறாள்'], correctAnswer: 'சாப்பிட செய்கிறாள்', translation: 'Mother makes idli sambar every day.' },
  ],
  te: [
    { passage: 'హైదరాబాద్ ఒక గొప్ప నగరం. ఇక్కడ చార్మिनార్ చాలా ప్రసిద్ధి. బిర్యానీ ఇక్కడ చాలా రుచిగా ఉంటుంది.', question: 'హైదరాబాద్‌లో ఏది ప్రసిద్ధి?', options: ['చార్మినార్', 'తాజ్ మహల్', 'గోల్కొండ', 'కుతుబ్ మినార్'], correctAnswer: 'చార్మినార్', translation: 'Hyderabad is a great city. Charminar is very famous here.' },
  ],
  bn: [
    { passage: 'কলকাতা পশ্চিমবঙ্গের রাজধানী। এখানে দুর্গাপূজা খুব ধুমধাম করে পালित হয়। রসগোল্লা এখানের বিখ্যাত মিষ্টি।', question: 'কলকাতায় কোন মিষ্টি বিখ্যাত?', options: ['রসগোল্লা', 'জিলেপি', 'লাড্ডু', 'বরফি'], correctAnswer: 'রসগোল্লা', translation: 'Kolkata is the capital of West Bengal. Rosogolla is famous here.' },
  ],
  pa: [
    { passage: 'ਅੰਮ੍ਰਿਤਸਰ ਪੰਜਾਬ ਦਾ ਮਹੱਤਵਪੂਰਨ ਸ਼ਹਿਰ ਹੈ। ਇੱਥੇ ਸ੍ਰੀ ਹਰਿਮੰਦਰ ਸਾਹਿਬ ਹੈ। ਲੋਕ ਦੂਰੋਂ ਇੱਥੇ ਆਉਂਦੇ ਹਨ।', question: 'ਅੰਮ੍ਰਿਤਸਰ ਵਿੱਚ ਕੀ ਖਾਸ ਹੈ?', options: ['ਸ੍ਰੀ ਹਰਿਮੰਦਰ ਸਾਹਿਬ', 'ਤਾਜ ਮਹਲ', 'ਕੁਤਬ ਮੀਨਾਰ', 'ਲਾਲ ਕਿਲਾ'], correctAnswer: 'ਸ੍ਰੀ ਹਰਿਮੰਦਰ ਸਾਹਿਬ', translation: 'Amritsar is an important city in Punjab.' },
  ],
  gu: [
    { passage: 'ગુજરાત ભારતનું ઔદ્યોગિક રાજ્ય છે. અહીં નવરાત્રી ઉત્સવ ખૂબ ધામ-ધૂમ સાથે ઊજવાય છે. ઢોકળા ગુજરાતની ખ્યાતનામ વાનગી છે.', question: 'ઢોકળા ક્યાંની ખ્યાતનામ વાનગી છે?', options: ['ગુજરાત', 'પંજાબ', 'ઉત્તર પ્રદેશ', 'ઓડિશા'], correctAnswer: 'ગુજરાત', translation: 'Gujarat is known for Navratri and Dhokla.' },
  ],
  en: [
    { passage: 'India is a land of many languages and cultures. People from different states speak different languages but share a common bond.', question: 'What do people share across India?', options: ['A common bond', 'The same language', 'The same food', 'The same dress'], correctAnswer: 'A common bond', translation: 'India is a land of many cultures.' },
  ],
}

// ── Precompiled Topic Category Keywords ───────────────────────────────────────
const TOPIC_KEYWORDS = {
  greetings:  /hello|greeting|thank|please|goodbye|morning|night|namaste|namaskar|welcome|sorry|excuse/i,
  everyday:   /water|home|friend|book|yes|no|food|eat|drink|day|time|today|tomorrow/i,
  food:       /food|eat|drink|tea|chai|rice|bread|roti|meal|cook|hunger|sweet|fruit|vegetable/i,
  numbers:    /one|two|three|four|five|six|seven|eight|nine|ten|hundred|thousand|count/i,
  family:     /mother|father|brother|sister|son|daughter|family|uncle|aunt|grandparent|child/i,
  travel:     /train|bus|car|road|station|direction|left|right|where|go|come|travel|auto/i,
  market:     /buy|sell|money|rupee|cost|price|market|shop|cloth|vegetable/i,
  weather:    /rain|sun|wind|cold|hot|season|cloud|storm|snow|weather/i,
  emotions:   /happy|sad|angry|love|fear|surprise|joy|worry|calm|excited/i,
  culture:    /festival|tradition|dance|music|art|celebration|culture|religion/i,
  grammar:    /verb|sentence|grammar|is|are|am|was|were|will|want|have|need|eat|drink|go|come|speak|read|write|do|make|can|see|i\b|you\b|he\b|she\b|we\b|they\b|this\b|that\b/i,
}

// ── Extract Vocabulary matching a topic ──────────────────────────────────────
function extractVocabForTopic(seedLessons, topicId, count = 10) {
  const pattern = TOPIC_KEYWORDS[topicId] || TOPIC_KEYWORDS.everyday

  const matched = []
  const seen = new Set()

  for (const lesson of seedLessons) {
    if (!lesson.vocabulary) continue
    for (const v of lesson.vocabulary) {
      const text = `${v.word} ${v.translation} ${v.example || ''}`.toLowerCase()
      if (pattern.test(text) && !seen.has(v.word)) {
        seen.add(v.word)
        matched.push(v)
      }
    }
  }

  // If not enough matched, supplement with other seed vocab
  if (matched.length < 4) {
    for (const lesson of seedLessons) {
      if (!lesson.vocabulary) continue
      for (const v of lesson.vocabulary) {
        if (!seen.has(v.word) && matched.length < count) {
          seen.add(v.word)
          matched.push(v)
        }
      }
    }
  }

  return matched
}

/**
 * Intelligent Topic Selection based on Learner Model
 */
function selectAdaptiveTopic(profile, weakAreas, requestedTopicId = null) {
  if (requestedTopicId) {
    const found = TOPIC_CATEGORIES.find((t) => t.id === requestedTopicId)
    if (found) return found
  }

  // 1. Weak topic with accuracy < 75%
  if (weakAreas.topics.length > 0) {
    const weakest = weakAreas.topics[0]
    const matched = TOPIC_CATEGORIES.find((t) => t.id === weakest.id)
    if (matched) return matched
  }

  // 2. Least practiced topic
  const topicsByPracticed = Object.values(profile.topics).sort((a, b) => {
    if (!a.lastPracticedAt) return -1
    if (!b.lastPracticedAt) return 1
    return new Date(a.lastPracticedAt) - new Date(b.lastPracticedAt)
  })

  if (topicsByPracticed.length > 0) {
    const leastPracticed = topicsByPracticed[0]
    const matched = TOPIC_CATEGORIES.find((t) => t.id === leastPracticed.id)
    if (matched) return matched
  }

  return TOPIC_CATEGORIES[0]
}

/**
 * Generate an explicit, pedagogical explanation for the learner
 */
function generatePedagogicalRationale({ topic, weakAreas, reviewCandidates, profile, accuracy }) {
  if (reviewCandidates.length >= 2) {
    return `Spaced Review: Reinforcing ${reviewCandidates.length} words due today from previous sessions.`
  }

  if (weakAreas.topics.length > 0 && weakAreas.topics[0].id === topic.id) {
    return `Targeted Practice: Strengthening "${topic.name}" where your recent accuracy was ${weakAreas.topics[0].accuracy}%.`
  }

  if (weakAreas.skills.length > 0) {
    const weakSkill = weakAreas.skills[0]
    return `Skill Focus: Boosting ${weakSkill.skill} practice with interactive audio & feedback.`
  }

  if (profile.totalAttempts === 0) {
    return `Starting your journey with foundational ${topic.name} & interactive listening.`
  }

  if (profile.overallAccuracy >= 85) {
    return `Mastery Path: Advancing to ${topic.name} with increased speaking & sentence challenge.`
  }

  return `Personalized Practice: Building active fluency in ${topic.name}.`
}

/**
 * CORE: Generate a single 15-question adaptive lesson
 */
export function generateAdaptiveLesson({
  langId: propLangId,
  languageId: propLanguageId,
  preferredLang: propPreferredLang,
  preferredLanguage: propPreferredLanguage,
  topicId = null,
  level = 'beginner',
  goal = 'conversation',
}) {
  const langId = propLangId || propLanguageId || 'hi'
  const preferredLang = propPreferredLang || propPreferredLanguage || 'en'
  const targetLangMeta = getLanguageById(langId) || { name: 'Hindi', nativeName: 'हिन्दी' }
  const targetLangName = `${targetLangMeta.name} (${targetLangMeta.nativeName})`

  // 1. Fetch learner profile & weak areas
  const profile = getLearnerProfile(langId)
  const weakAreas = getWeakAreas(langId)
  const reviewCandidates = getReviewCandidates(langId, 3)

  // 2. Select topic intelligently
  const topic = selectAdaptiveTopic(profile, weakAreas, topicId)

  // 3. Extract vocab for topic & global pool
  const seedLessons = getLessonsForLanguage(langId, preferredLang) || []
  const allSeedVocab = seedLessons.flatMap((l) => l.vocabulary || [])
  const topicVocab = extractVocabForTopic(seedLessons, topic.id, 10)

  // 4. Generate pedagogical rationale
  const rationale = generatePedagogicalRationale({
    topic,
    weakAreas,
    reviewCandidates,
    profile,
    accuracy: profile.overallAccuracy,
  })

  // ── 5. Build a fixed, pedagogical 15-question progression ─────────────────
  // The order is intentional and invariant: Q1–5 Easy, Q6–10 Medium, Q11–15
  // Hard.  Hard questions use contextual syntax, cloze, reading and challenge
  // patterns; they are never medium questions with a different label.
  const uniqueVocab = []
  const seenWords = new Set()
  for (const item of [...topicVocab, ...allSeedVocab]) {
    if (item?.word && item?.translation && !seenWords.has(item.word)) {
      seenWords.add(item.word)
      uniqueVocab.push(item)
    }
  }
  if (uniqueVocab.length < 15) {
    throw new Error(`Not enough unique vocabulary to build a lesson for ${langId}`)
  }

  const withTier = (exercise, difficulty, tier) => ({ ...exercise, difficulty, tier })
  const questionSignature = (exercise) => [
    exercise.type,
    exercise.targetWord || exercise.word || '',
    exercise.sentence || exercise.question || exercise.passage || '',
  ].join('|')

  // Keep the existing review-candidate source, priority, and metadata intact:
  // due SM-2 items are returned first by getReviewCandidates, followed by mistakes.
  // Review exercises occupy Medium slots so the fixed progression remains intact.
  const reviewExercises = []
  const reviewAlternates = new Map()
  for (const candidate of reviewCandidates.slice(0, 3)) {
    const vocabMatch = allSeedVocab.find((v) => v.word === candidate.word) || {
      word: candidate.word,
      translation: candidate.translation,
    }
    const makeReviewExercise = (useListening) => ({
      ...(useListening
        ? createListeningExercise(vocabMatch, allSeedVocab, langId, preferredLang, targetLangName)
        : createWordToMeaningMCQ(vocabMatch, allSeedVocab, langId, preferredLang, targetLangName)),
      isReview: true,
      reviewReason: candidate.reason,
      difficulty: 2,
      tier: 'medium',
    })
    const useListening = Math.random() <= 0.5
    const reviewExercise = makeReviewExercise(useListening)
    reviewExercises.push(reviewExercise)
    reviewAlternates.set(reviewExercise.id, makeReviewExercise(!useListening))
  }
  const easy = [
    withTier(createWordToMeaningMCQ(uniqueVocab[0], uniqueVocab, langId, preferredLang, targetLangName), 1, 'easy'),
    withTier(createMeaningToWordMCQ(uniqueVocab[1], uniqueVocab, langId, preferredLang, targetLangName), 1, 'easy'),
    withTier(createWordToMeaningMCQ(uniqueVocab[2], uniqueVocab, langId, preferredLang, targetLangName), 1, 'easy'),
    withTier(createListeningExercise(uniqueVocab[3], uniqueVocab, langId, preferredLang, targetLangName), 1, 'easy'),
    withTier(createMeaningToWordMCQ(uniqueVocab[4], uniqueVocab, langId, preferredLang, targetLangName), 1, 'easy'),
  ]

  const medium = [
    withTier(createTranslationExercise(uniqueVocab[5], uniqueVocab, langId, preferredLang, targetLangName), 2, 'medium'),
    withTier(createSpeakingExercise(uniqueVocab[6], uniqueVocab, langId, preferredLang, targetLangName), 2, 'medium'),
    withTier(createFillBlankExercise(uniqueVocab[7], uniqueVocab, langId, preferredLang, targetLangName), 2, 'medium'),
    withTier(createMatchingExercise(uniqueVocab.slice(8, 12), langId, preferredLang, targetLangName), 2, 'medium'),
    withTier(createListeningExercise(uniqueVocab[12], uniqueVocab, langId, preferredLang, targetLangName), 2, 'medium'),
  ]

  const sentenceCandidates = []
  const seenSentences = new Set()
  const scaffoldWords = new Set(uniqueVocab.slice(0, 13).map((item) => item.word))
  for (const item of uniqueVocab) {
    const sentence = item.example?.trim()
    if (!scaffoldWords.has(item.word) && sentence && sentence.split(/\s+/).length >= 3 && !seenSentences.has(sentence)) {
      seenSentences.add(sentence)
      sentenceCandidates.push(item)
    }
  }
  const clozeCandidate = sentenceCandidates.find((item) =>
    item.example.includes(item.word)
      && ![sentenceCandidates[0]?.word, sentenceCandidates[1]?.word].includes(item.word)
  )
  const challengeCandidate = sentenceCandidates.find((item) =>
    ![sentenceCandidates[0]?.word, sentenceCandidates[1]?.word, clozeCandidate?.word].includes(item.word)
  )
  if (!clozeCandidate || !challengeCandidate) {
    throw new Error(`Not enough sentence content to build hard exercises for ${langId}`)
  }
  const passages = READING_PASSAGES[langId] || READING_PASSAGES.hi
  const reading = passages[0]
  const hard = [
    withTier(createSentenceOrderExercise(sentenceCandidates[0], langId, preferredLang, targetLangName), 3, 'hard'),
    withTier(createSentenceOrderExercise(sentenceCandidates[1], langId, preferredLang, targetLangName), 3, 'hard'),
    withTier(createFillBlankExercise(clozeCandidate, uniqueVocab, langId, preferredLang, targetLangName), 3, 'hard'),
    withTier(createChallengeExercise(challengeCandidate, uniqueVocab, langId, preferredLang, targetLangName), 3, 'hard'),
    {
      id: `ex_read_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      type: 'reading',
      prompt: getPromptText('reading', preferredLang, targetLangName),
      passage: reading.passage,
      passageTranslation: reading.translation,
      question: reading.question,
      options: reading.options,
      correctAnswer: reading.correctAnswer,
      xp: 25,
      category: 'reading',
      skill: 'reading',
      difficulty: 3,
      tier: 'hard',
      isChallenge: true,
    },
  ]

  // This is the original review selection cap (two of the top three candidates),
  // placed in the last Medium positions rather than appended after the hard tier.
  const selectedReview = pickRandom(reviewExercises, Math.min(2, reviewExercises.length))
  const retainedMedium = medium.slice(0, medium.length - selectedReview.length)
  const occupiedSignatures = new Set([...easy, ...retainedMedium, ...hard].map(questionSignature))
  const integratedReviews = selectedReview.map((reviewExercise) => {
    const alternate = reviewAlternates.get(reviewExercise.id)
    const chosen = occupiedSignatures.has(questionSignature(reviewExercise)) ? alternate : reviewExercise
    if (!chosen || occupiedSignatures.has(questionSignature(chosen))) {
      throw new Error('Adaptive review selection produced a duplicate question')
    }
    occupiedSignatures.add(questionSignature(chosen))
    return chosen
  })

  const finalExercises = [...easy, ...retainedMedium, ...integratedReviews, ...hard]
  const questionSignatures = finalExercises.map(questionSignature)
  if (new Set(questionSignatures).size !== finalExercises.length) {
    throw new Error('Adaptive lesson generation produced duplicate questions')
  }

  const sessionId = `${langId}-adaptive-${topic.id}-${Date.now()}`
  const localizedTopicTitle = getLocalizedTopicName(topic.id, preferredLang) || topic.name

return {
    id: sessionId,
    name: localizedTopicTitle,
    title: localizedTopicTitle,
    nameNative: targetLangMeta.nativeName,
    topicId: topic.id,
    topic: topic.id,
    topicIcon: topic.icon,
    description: rationale,
    rationale,
    langId,
    level,
    difficultyLevel: profile.currentDifficultyLevel || 1,
    vocabulary: topicVocab.slice(0, 8),
    exercises: finalExercises,
    generatedAt: new Date().toISOString(),
    _isAdaptive: true,
  }
}


/**
 * Backward compatibility shims
 */
export function generateLesson({ langId, preferredLang = 'en', topicId, level = 'beginner', goal = 'conversation' }) {
  return generateAdaptiveLesson({ langId, preferredLang, topicId, level, goal })
}

export function generateNextLesson({ langId, preferredLang = 'en', level = 'beginner', goal = 'conversation' }) {
  return generateAdaptiveLesson({ langId, preferredLang, level, goal })
}

export function generateLessonSequence({ langId, preferredLang = 'en', count = 5, level = 'beginner', goal = 'conversation' }) {
  const list = []
  for (let i = 0; i < count; i++) {
    const topic = TOPIC_CATEGORIES[i % TOPIC_CATEGORIES.length]
    list.push(generateAdaptiveLesson({ langId, preferredLang, topicId: topic.id, level, goal }))
  }
  return list
}

export { TOPIC_CATEGORIES as TOPIC_THEMES }
