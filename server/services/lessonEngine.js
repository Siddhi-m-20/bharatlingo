/**
 * Dynamic Lesson Engine — BharatLingo
 *
 * Generates personalized lessons, assessment questions, and learning plans
 * based on: target language, age range, goal, level, and performance history.
 *
 * NO AI provider names, model names, or endpoint URLs are ever returned to the client.
 * The client only sees: "Generating your personalized lesson..."
 */

import { getLessonsForLanguage } from '../../src/data/lessons/index.js'
import { getAssessmentQuestions as getStaticAssessmentQuestions } from '../../src/data/questions/index.js'

const PRODUCT_LANGUAGE_IDS = ['hi', 'en', 'mr', 'ta', 'te', 'bn', 'pa', 'gu']

// ── Vocabulary banks per language ────────────────────────────────────────────
const VOCABULARY_BANKS = {
  hi: {
    greetings: [
      { word: 'नमस्कार', translation: 'Hello / Greetings', pronunciation: 'namaskar', example: 'नमस्कार, आप कैसे हैं?' },
      { word: 'धन्यवाद', translation: 'Thank you', pronunciation: 'dhanyavaad', example: 'बहुत धन्यवाद' },
      { word: 'कृपया', translation: 'Please', pronunciation: 'kripya', example: 'कृपया बैठिए' },
      { word: 'अलविदा', translation: 'Goodbye', pronunciation: 'alvida', example: 'अलविदा, फिर मिलेंगे' },
      { word: 'शुभ प्रभात', translation: 'Good morning', pronunciation: 'shubh prabhat', example: 'शुभ प्रभात!' },
      { word: 'माफ़ करना', translation: 'Sorry / Excuse me', pronunciation: 'maaf karna', example: 'माफ़ करना, मुझे देर हो गई' },
    ],
    travel: [
      { word: 'रेलगाड़ी', translation: 'Train', pronunciation: 'relgadi', example: 'रेलगाड़ी कब आएगी?' },
      { word: 'बस', translation: 'Bus', pronunciation: 'bas', example: 'बस स्टेशन कहाँ है?' },
      { word: 'होटल', translation: 'Hotel', pronunciation: 'hotel', example: 'होटल में कमरा चाहिए' },
      { word: 'दाएं', translation: 'Right', pronunciation: 'dayen', example: 'दाएं मुड़ो' },
      { word: 'बाएं', translation: 'Left', pronunciation: 'bayen', example: 'बाएं मुड़ो' },
      { word: 'कितना', translation: 'How much', pronunciation: 'kitna', example: 'इसका दाम कितना है?' },
    ],
    food: [
      { word: 'पानी', translation: 'Water', pronunciation: 'paani', example: 'एक गिलास पानी दीजिए' },
      { word: 'खाना', translation: 'Food', pronunciation: 'khaana', example: 'खाना बहुत अच्छा है' },
      { word: 'चाय', translation: 'Tea', pronunciation: 'chaay', example: 'एक चाय लेना' },
      { word: 'रोटी', translation: 'Bread / Roti', pronunciation: 'roti', example: 'रोटी और दाल' },
      { word: 'मीठा', translation: 'Sweet', pronunciation: 'meetha', example: 'मुझे मीठा पसंद है' },
    ],
    conversation: [
      { word: 'आप', translation: 'You (formal)', pronunciation: 'aap', example: 'आप कैसे हैं?' },
      { word: 'मैं', translation: 'I / Me', pronunciation: 'main', example: 'मैं ठीक हूँ' },
      { word: 'हाँ', translation: 'Yes', pronunciation: 'haan', example: 'हाँ, बिल्कुल' },
      { word: 'नहीं', translation: 'No', pronunciation: 'nahin', example: 'नहीं, धन्यवाद' },
      { word: 'क्या', translation: 'What', pronunciation: 'kya', example: 'क्या आप ठीक हैं?' },
      { word: 'कहाँ', translation: 'Where', pronunciation: 'kahan', example: 'बाज़ार कहाँ है?' },
    ],
  },
  mr: {
    greetings: [
      { word: 'नमस्कार', translation: 'Hello / Greetings', pronunciation: 'namaskar', example: 'नमस्कार, तुम्ही कसे आहात?' },
      { word: 'धन्यवाद', translation: 'Thank you', pronunciation: 'dhanyavaad', example: 'खूप खूप धन्यवाद' },
      { word: 'कृपया', translation: 'Please', pronunciation: 'krupaya', example: 'कृपया येथे बसा' },
      { word: 'पुन्हा भेटू', translation: 'See you again', pronunciation: 'punha bhetu', example: 'पुन्हा भेटू!' },
      { word: 'शुभ सकाळ', translation: 'Good morning', pronunciation: 'shubh sakal', example: 'शुभ सकाळ!' },
      { word: 'माफ करा', translation: 'Sorry / Excuse me', pronunciation: 'maaf kara', example: 'माफ करा, उशीर झाला' },
    ],
    travel: [
      { word: 'रेल्वे', translation: 'Railway / Train', pronunciation: 'railway', example: 'रेल्वे स्थानक कुठे आहे?' },
      { word: 'बस', translation: 'Bus', pronunciation: 'bas', example: 'बस कधी येईल?' },
      { word: 'हॉटेल', translation: 'Hotel', pronunciation: 'hotel', example: 'हॉटेलमध्ये जागा आहे का?' },
      { word: 'उजवीकडे', translation: 'Right', pronunciation: 'ujvikade', example: 'उजवीकडे वळा' },
      { word: 'डावीकडे', translation: 'Left', pronunciation: 'davikade', example: 'डावीकडे वळा' },
      { word: 'किती', translation: 'How much', pronunciation: 'kiti', example: 'हे किती आहे?' },
    ],
    food: [
      { word: 'पाणी', translation: 'Water', pronunciation: 'paani', example: 'एक ग्लास पाणी द्या' },
      { word: 'जेवण', translation: 'Food / Meal', pronunciation: 'jevan', example: 'जेवण कधी होईल?' },
      { word: 'चहा', translation: 'Tea', pronunciation: 'chaha', example: 'एक चहा द्या' },
      { word: 'भाकरी', translation: 'Flatbread', pronunciation: 'bhakri', example: 'भाकरी आणि भाजी' },
      { word: 'गोड', translation: 'Sweet', pronunciation: 'god', example: 'मला गोड आवडते' },
    ],
    conversation: [
      { word: 'तुम्ही', translation: 'You (formal)', pronunciation: 'tumhi', example: 'तुम्ही कसे आहात?' },
      { word: 'मी', translation: 'I / Me', pronunciation: 'mi', example: 'मी ठीक आहे' },
      { word: 'हो', translation: 'Yes', pronunciation: 'ho', example: 'हो, नक्कीच' },
      { word: 'नाही', translation: 'No', pronunciation: 'nahi', example: 'नाही, धन्यवाद' },
      { word: 'काय', translation: 'What', pronunciation: 'kaay', example: 'काय हवे आहे?' },
      { word: 'कुठे', translation: 'Where', pronunciation: 'kuthe', example: 'बाजार कुठे आहे?' },
    ],
  },
}

// Fallback vocabulary for unsupported languages
const FALLBACK_VOCAB = {
  greetings: [
    { word: 'नमस्ते', translation: 'Hello', pronunciation: 'namaste', example: 'नमस्ते!' },
    { word: 'धन्यवाद', translation: 'Thank you', pronunciation: 'dhanyavaad', example: 'धन्यवाद!' },
    { word: 'अलविदा', translation: 'Goodbye', pronunciation: 'alvida', example: 'अलविदा!' },
  ],
  travel: [
    { word: 'बस', translation: 'Bus', pronunciation: 'bas', example: 'बस कहाँ है?' },
    { word: 'होटल', translation: 'Hotel', pronunciation: 'hotel', example: 'होटल है?' },
    { word: 'कितना', translation: 'How much', pronunciation: 'kitna', example: 'कितना है?' },
  ],
  food: [
    { word: 'पानी', translation: 'Water', pronunciation: 'paani', example: 'पानी दो' },
    { word: 'खाना', translation: 'Food', pronunciation: 'khaana', example: 'खाना है?' },
  ],
  conversation: [
    { word: 'हाँ', translation: 'Yes', pronunciation: 'haan', example: 'हाँ' },
    { word: 'नहीं', translation: 'No', pronunciation: 'nahin', example: 'नहीं' },
    { word: 'क्या', translation: 'What', pronunciation: 'kya', example: 'क्या?' },
  ],
}

// ── Topic map per goal ───────────────────────────────────────────────────────
const GOAL_TOPICS = {
  travel:       ['greetings', 'travel', 'food'],
  conversation: ['greetings', 'conversation', 'food'],
  work:         ['greetings', 'conversation', 'food'],
  study:        ['greetings', 'conversation', 'food'],
  family:       ['greetings', 'conversation', 'food'],
  culture:      ['greetings', 'conversation', 'food'],
  fun:          ['greetings', 'food', 'conversation'],
}

// ── Age-based pacing config ──────────────────────────────────────────────────
const AGE_CONFIG = {
  child:       { maxVocab: 3, exercisesPerLesson: 4, complexity: 'simple',    tone: 'playful' },
  teen:        { maxVocab: 5, exercisesPerLesson: 5, complexity: 'moderate',  tone: 'casual' },
  'young-adult': { maxVocab: 6, exercisesPerLesson: 6, complexity: 'standard', tone: 'friendly' },
  adult:       { maxVocab: 6, exercisesPerLesson: 6, complexity: 'standard',  tone: 'professional' },
  senior:      { maxVocab: 4, exercisesPerLesson: 4, complexity: 'simple',    tone: 'clear' },
}

// ── Get vocab bank for a language/goal combo ─────────────────────────────────
function getVocabForGoal(languageId, goal) {
  const bank = VOCABULARY_BANKS[languageId] || FALLBACK_VOCAB
  const topics = GOAL_TOPICS[goal] || ['greetings', 'conversation', 'food']
  const result = []
  for (const topic of topics) {
    const topicVocab = bank[topic] || FALLBACK_VOCAB[topic] || []
    result.push(...topicVocab)
  }
  // Deduplicate by word
  const seen = new Set()
  return result.filter((v) => {
    if (seen.has(v.word)) return false
    seen.add(v.word)
    return true
  })
}

// ── Generate exercises from vocab ────────────────────────────────────────────
function generateExercises(vocab, ageConfig, lessonIndex = 0) {
  const exercises = []
  const maxItems = Math.min(vocab.length, ageConfig.maxVocab)
  const selectedVocab = vocab.slice(0, maxItems)

  // 1. Multiple choice — what does X mean?
  if (selectedVocab.length >= 1) {
    const target = selectedVocab[0]
    const distractors = vocab
      .filter((v) => v.word !== target.word)
      .map((v) => v.translation)
      .slice(0, 3)
    const options = [...distractors, target.translation].sort(() => Math.random() - 0.5)
    exercises.push({
      id: `ex-mcq-${lessonIndex}-0`,
      type: 'multiple-choice',
      prompt: `What does "${target.word}" mean?`,
      options,
      correctAnswer: target.translation,
      xp: 10,
    })
  }

  // 2. Listening exercise — TTS audio + select word
  if (selectedVocab.length >= 2) {
    const target = selectedVocab[1]
    const distractors = selectedVocab
      .filter((v) => v.word !== target.word)
      .map((v) => v.word)
      .slice(0, 3)
    const options = [...distractors, target.word].sort(() => Math.random() - 0.5)
    exercises.push({
      id: `ex-listen-${lessonIndex}-1`,
      type: 'listening',
      prompt: 'Listen to the audio and select what you hear',
      audioText: target.word,
      options,
      correctAnswer: target.word,
      xp: 15,
    })
  }

  // 3. Speaking exercise — TTS model + STT
  if (selectedVocab.length >= 1) {
    const target = selectedVocab[lessonIndex % selectedVocab.length] || selectedVocab[0]
    exercises.push({
      id: `ex-speak-${lessonIndex}-2`,
      type: 'speaking',
      prompt: `Say this word aloud:`,
      targetWord: target.word,
      pronunciation: target.pronunciation,
      correctAnswer: target.word,
      xp: 15,
    })
  }

  // 4. Translation exercise
  if (selectedVocab.length >= 3 && ageConfig.complexity !== 'simple') {
    const target = selectedVocab[2]
    exercises.push({
      id: `ex-trans-${lessonIndex}-3`,
      type: 'translation',
      prompt: `Translate "${target.translation}" to the target language`,
      correctAnswer: target.word,
      wordBank: selectedVocab.map((v) => v.word).sort(() => Math.random() - 0.5),
      xp: 15,
    })
  }

  // 5. Matching (for older kids/adults with enough vocab)
  if (selectedVocab.length >= 4 && ageConfig.complexity !== 'simple') {
    const pairs = selectedVocab.slice(0, 4).map((v) => ({ word: v.word, meaning: v.translation }))
    exercises.push({
      id: `ex-match-${lessonIndex}-4`,
      type: 'matching',
      prompt: 'Match the words with their meanings',
      pairs,
      xp: 20,
    })
  }

  return exercises.slice(0, ageConfig.exercisesPerLesson)
}

// ── Build a lesson object ─────────────────────────────────────────────────────
function buildLesson(languageId, goal, ageRange, lessonIndex, level) {
  const ageConfig = AGE_CONFIG[ageRange] || AGE_CONFIG['adult']
  const allVocab = getVocabForGoal(languageId, goal)

  // Rotate vocab windows per lesson (different words each lesson)
  const windowSize = ageConfig.maxVocab
  const offset = (lessonIndex * windowSize) % Math.max(allVocab.length, 1)
  const window = [
    ...allVocab.slice(offset),
    ...allVocab.slice(0, offset),
  ].slice(0, windowSize)

  const topicLabels = {
    0: 'Greetings & Introductions',
    1: 'Common Phrases',
    2: 'Essential Vocabulary',
    3: 'Practical Expressions',
    4: 'Everyday Conversations',
    5: 'Real-world Situations',
    6: 'Advanced Practice',
  }
  const lessonName = topicLabels[lessonIndex] || `Lesson ${lessonIndex + 1}`

  const exercises = generateExercises(window, ageConfig, lessonIndex)

  return {
    id: `${languageId}-dynamic-${lessonIndex}`,
    name: lessonName,
    nameNative: lessonName,
    unit: lessonIndex < 3 ? 'Unit 1: Foundations' : lessonIndex < 6 ? 'Unit 2: Building Skills' : 'Unit 3: Fluency',
    order: lessonIndex + 1,
    isDynamic: true,
    vocabulary: window,
    exercises,
  }
}

// ── Generate a personalized learning plan ────────────────────────────────────
export function generateLearningPlan({ languageId, ageRange, goal, level, assessmentScore, dailyGoal }) {
  const ageConfig = AGE_CONFIG[ageRange] || AGE_CONFIG['adult']
  const topics = GOAL_TOPICS[goal] || ['greetings', 'conversation', 'food']

  const focusAreas = {
    travel:       ['Travel phrases', 'Directions', 'Restaurants', 'Transport', 'Practical vocabulary'],
    conversation: ['Everyday conversation', 'Essential vocabulary', 'Listening', 'Speaking'],
    work:         ['Professional vocabulary', 'Formal greetings', 'Numbers', 'Business phrases'],
    study:        ['Grammar', 'Reading', 'Writing', 'Academic vocabulary'],
    family:       ['Family terms', 'Everyday conversation', 'Emotions', 'Celebrations'],
    culture:      ['Cultural phrases', 'Traditions', 'Food & festivals', 'Poetry & proverbs'],
    fun:          ['Popular phrases', 'Entertainment', 'Games', 'Stories'],
  }[goal] || ['Everyday conversation', 'Essential vocabulary', 'Listening', 'Speaking']

  const startingLevel = assessmentScore !== null && assessmentScore !== undefined
    ? (assessmentScore <= 30 ? 'Beginner' : assessmentScore <= 60 ? 'Elementary' : assessmentScore <= 80 ? 'Intermediate' : 'Advanced')
    : 'Beginner'

  const totalLessons = dailyGoal <= 5 ? 20 : dailyGoal <= 10 ? 30 : dailyGoal <= 15 ? 40 : 50

  return {
    startingLevel,
    goal: goal.charAt(0).toUpperCase() + goal.slice(1),
    dailyPractice: `${dailyGoal} min`,
    focusAreas,
    agePersonalization: {
      tone: ageConfig.tone,
      complexity: ageConfig.complexity,
      lessonsPerDay: Math.max(1, Math.floor(dailyGoal / 10)),
    },
    totalLessons,
    recommendedFirstLesson: 'Greetings & Introductions',
    generatedAt: new Date().toISOString(),
  }
}

// ── Get dynamic lessons for a user ───────────────────────────────────────────
export function getDynamicLessons({ languageId, goal, ageRange, level, count = 10 }) {
  const lessons = []
  for (let i = 0; i < count; i++) {
    lessons.push(buildLesson(languageId, goal, ageRange, i, level))
  }
  return lessons
}

// ── Get a single dynamic lesson by index ─────────────────────────────────────
export function getDynamicLesson({ languageId, goal, ageRange, level, lessonIndex }) {
  return buildLesson(languageId, goal, ageRange, lessonIndex, level)
}

// ── Get adaptive lesson ──────────────────────────────────────────────────────
export function getAdaptiveLesson({ languageId = 'hi', goal = 'conversation', ageRange = 'adult', level = 'beginner', topicId = null }) {
  if (!PRODUCT_LANGUAGE_IDS.includes(languageId)) {
    throw new Error(`Unsupported product language: ${languageId}`)
  }

  const sourceLessons = getLessonsForLanguage(languageId, 'en')
  const topicLessons = topicId
    ? sourceLessons.filter((lesson) => lesson.id.includes(topicId) || lesson.category?.toLowerCase().includes(topicId.toLowerCase()))
    : sourceLessons
  const selectedLessons = topicLessons.length > 0 ? topicLessons : sourceLessons
  const sourceExercises = selectedLessons.flatMap((lesson) => lesson.exercises || [])
  const exercises = sourceExercises.slice(0, 12)

  if (exercises.length < 10) {
    throw new Error(`Insufficient exercises for supported language: ${languageId}`)
  }

  const sourceVocabulary = selectedLessons.flatMap((lesson) => lesson.vocabulary || [])
  return {
    id: `${languageId}-adaptive-${topicId || 'personalized'}-${Date.now()}`,
    name: selectedLessons[0]?.name || 'Personalized Practice',
    nameNative: selectedLessons[0]?.nameNative || selectedLessons[0]?.name || 'Personalized Practice',
    topicId: topicId || selectedLessons[0]?.category || 'personalized',
    unit: selectedLessons[0]?.unit || 'Personalized Practice',
    order: selectedLessons[0]?.order || 1,
    isDynamic: true,
    langId: languageId,
    level,
    goal,
    ageRange,
    vocabulary: sourceVocabulary.slice(0, 12),
    exercises,
    description: `Personalized ${goal} practice in ${languageId}.`,
    rationale: `Selected for your ${level} ${goal} practice in the target language.`,
    generatedAt: new Date().toISOString(),
  }
}


// ── Generate dynamic assessment questions ────────────────────────────────────
export function generateAssessmentQuestions({ languageId, ageRange, goal, count = 6 }) {
  if (!PRODUCT_LANGUAGE_IDS.includes(languageId)) {
    throw new Error(`Unsupported product language: ${languageId}`)
  }

  const staticQuestions = getStaticAssessmentQuestions(languageId, 'en')
  if (staticQuestions.length >= count) {
    return staticQuestions.slice(0, count)
  }

  const ageConfig = AGE_CONFIG[ageRange] || AGE_CONFIG['adult']
  const allVocab = getVocabForGoal(languageId, goal || 'conversation')
  const shuffled = allVocab.sort(() => Math.random() - 0.5)
  const questions = []

  // Q1: Multiple choice vocabulary
  if (shuffled.length >= 1) {
    const target = shuffled[0]
    const distractors = shuffled.filter((v) => v.word !== target.word).map((v) => v.translation).slice(0, 3)
    questions.push({
      type: 'multiple-choice',
      prompt: `What does "${target.word}" mean?`,
      options: [...distractors, target.translation].sort(() => Math.random() - 0.5),
      correctAnswer: target.translation,
      xp: 10,
    })
  }

  // Q2: Listening (TTS) question
  if (shuffled.length >= 2) {
    const target = shuffled[1]
    const distractors = shuffled.filter((v) => v.word !== target.word).map((v) => v.word).slice(0, 3)
    questions.push({
      type: 'listening',
      prompt: 'Listen to the audio and select what you hear',
      audioText: target.word,
      options: [...distractors, target.word].sort(() => Math.random() - 0.5),
      correctAnswer: target.word,
      xp: 15,
    })
  }

  // Q3: Speaking (STT) question
  if (shuffled.length >= 3) {
    const target = shuffled[2]
    questions.push({
      type: 'speaking',
      prompt: `Say this word aloud:`,
      targetWord: target.word,
      pronunciation: target.pronunciation,
      correctAnswer: target.word,
      xp: 15,
    })
  }

  // Q4–Q6: More multiple choice
  for (let i = 3; i < Math.min(shuffled.length, count); i++) {
    const target = shuffled[i]
    const distractors = shuffled.filter((v) => v.word !== target.word).map((v) => v.translation).slice(0, 3)
    questions.push({
      type: 'multiple-choice',
      prompt: `What does "${target.word}" mean?`,
      options: [...distractors, target.translation].sort(() => Math.random() - 0.5),
      correctAnswer: target.translation,
      xp: 10,
    })
    if (questions.length >= count) break
  }

  return questions
}
