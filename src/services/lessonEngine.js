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
  shuffle,
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
 * CORE: Generate a single 10–12 exercise Adaptive Lesson
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

  // ── 5. Build 4-Part Adaptive Mix (NEW + PRACTICE + REVIEW + CHALLENGE) ────────
  const reviewExercises = []
  const newExercises = []
  const practiceExercises = []
  const challengeExercises = []

  // --- PART A: REVIEW (25% ~ 2-3 items from mistakes & SM-2) ---
  for (const candidate of reviewCandidates.slice(0, 3)) {
    const vocabMatch = allSeedVocab.find((v) => v.word === candidate.word) || {
      word: candidate.word,
      translation: candidate.translation,
    }
    if (Math.random() > 0.5) {
      reviewExercises.push({
        ...createWordToMeaningMCQ(vocabMatch, allSeedVocab, langId, preferredLang, targetLangName),
        isReview: true,
        reviewReason: candidate.reason,
        difficulty: 2,
      })
    } else {
      reviewExercises.push({
        ...createListeningExercise(vocabMatch, allSeedVocab, langId, preferredLang, targetLangName),
        isReview: true,
        reviewReason: candidate.reason,
        difficulty: 2,
      })
    }
  }

  // --- PART B: NEW CONCEPTS (30% ~ 3-4 items) ---
  const newVocabItems = topicVocab.slice(0, Math.min(3, topicVocab.length))
  for (const item of newVocabItems) {
    newExercises.push({
        ...createWordToMeaningMCQ(item, allSeedVocab, langId, preferredLang, targetLangName),
        difficulty: 1,
      })
    newExercises.push({
        ...createMeaningToWordMCQ(item, allSeedVocab, langId, preferredLang, targetLangName),
        difficulty: 1,
      })
  }

  // --- PART C: ACTIVE PRACTICE (30% ~ 3-4 items) ---
  for (const item of topicVocab.slice(1, 4)) {
    practiceExercises.push({
        ...createTranslationExercise(item, allSeedVocab, langId, preferredLang, targetLangName),
        difficulty: 2,
      })
    practiceExercises.push({
        ...createSpeakingExercise(item, allSeedVocab, langId, preferredLang, targetLangName),
        difficulty: 2,
      })
    if (item.example) {
      practiceExercises.push({
        ...createFillBlankExercise(item, allSeedVocab, langId, preferredLang, targetLangName),
        difficulty: 2,
      })
    }
  }
  if (topicVocab.length >= 3) {
    practiceExercises.push({
        ...createMatchingExercise(topicVocab.slice(0, 4), langId, preferredLang, targetLangName),
        difficulty: 2,
      })
  }

  // --- PART D: CHALLENGE & READING (15% ~ 1-2 items) ---
  const sentenceItem = topicVocab.find((v) => v.example && v.example.split(' ').length >= 3)
  if (sentenceItem) {
    const ch = createChallengeExercise(sentenceItem, allSeedVocab, langId, preferredLang, targetLangName)
    if (ch) challengeExercises.push(ch)
  }

  const passages = READING_PASSAGES[langId] || READING_PASSAGES['hi']
  if (passages && passages.length > 0) {
    const p = passages[Math.floor(Math.random() * passages.length)]
    challengeExercises.push({
      id: `ex_read_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      type: 'reading',
      prompt: getPromptText('reading', preferredLang, targetLangName),
      passage: p.passage,
      passageTranslation: p.translation,
      question: p.question,
      options: p.options,
      correctAnswer: p.correctAnswer,
      xp: 20,
      category: 'reading',
      skill: 'reading',
      difficulty: 3,
    })
  }

  // ── 6. Assemble Balanced 10–12 Exercise Set with Scaffolding Ordering ────────
  // Quotas: Review (up to 2), New (3), Practice (4), Challenge/Reading (1-2)
  const selectedReview = pickRandom(reviewExercises, Math.min(2, reviewExercises.length))
  const selectedNew = pickRandom(newExercises, Math.min(3, newExercises.length))
  const selectedChallenge = pickRandom(challengeExercises, Math.min(2, Math.max(1, challengeExercises.length)))
  
  // Remaining slots for practice
  let slotsRemaining = 15 - (selectedReview.length + selectedNew.length + selectedChallenge.length)
      if (slotsRemaining < 2) slotsRemaining = 2
  const selectedPractice = pickRandom(practiceExercises, Math.max(2, slotsRemaining))

  // Scaffolding progression: New Scaffolding -> Active Practice -> Spaced Review -> Challenge/Reading
  const finalExercises = [
    ...shuffle(selectedNew),
    ...shuffle(selectedPractice),
    ...shuffle(selectedReview),
    ...shuffle(selectedChallenge),
  ]


  // Fallback pad if pool was small
  while (finalExercises.length < 15 && topicVocab.length > 0) {
        const v = topicVocab[finalExercises.length % topicVocab.length]
        finalExercises.push({
          ...createWordToMeaningMCQ(v, allSeedVocab, langId, preferredLang, targetLangName),
          difficulty: 1,
        })
      }

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
