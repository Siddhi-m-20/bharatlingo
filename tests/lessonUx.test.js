import { generateAdaptiveLesson } from '../src/services/lessonEngine.js'
import { fetchLessonById, getLessonLibrary } from '../src/services/dynamicLessonService.js'
import { TOPIC_CATEGORIES } from '../src/services/learnerModel.js'
import { uiTranslations } from '../src/services/uiTranslations.js'

const memory = {}
globalThis.localStorage = {
  getItem: (key) => memory[key] || null,
  setItem: (key, value) => { memory[key] = String(value) },
  removeItem: (key) => { delete memory[key] },
}

const languages = ['en', 'hi', 'mr', 'ta', 'te', 'bn', 'pa', 'gu']
const newUiKeys = [
  'lessons_library_subtitle',
  'lesson_id_label',
  'lesson_difficulty_hard',
  'lesson_status_complete',
  'lesson_status_not_started',
  'open_lesson',
]

for (const key of newUiKeys) {
  if (languages.some((language) => !uiTranslations[key]?.[language])) {
    throw new Error(`Missing ${key} translation`)
  }
}

for (const languageId of languages) {
  for (const topic of TOPIC_CATEGORIES) {
    const lesson = generateAdaptiveLesson({ languageId, preferredLang: 'en', topicId: topic.id })
    const difficulties = lesson.exercises.map((exercise) => exercise.difficulty)
    const signatures = lesson.exercises.map((exercise) =>
      [exercise.type, exercise.targetWord || exercise.word || '', exercise.sentence || exercise.question || exercise.passage || ''].join('|')
    )

    if (lesson.exercises.length < 15) throw new Error(`${languageId}/${topic.id}: expected 15+ questions`)
    if (difficulties.join(',') !== '1,1,1,1,1,2,2,2,2,2,3,3,3,3,3') throw new Error(`${languageId}/${topic.id}: invalid difficulty order`)
    if (new Set(signatures).size !== signatures.length) throw new Error(`${languageId}/${topic.id}: duplicate question`)
    const hardTypes = new Set(lesson.exercises.slice(10).map((exercise) => exercise.type))
    if (!hardTypes.has('sentence-order') || !hardTypes.has('fill-blank') || !hardTypes.has('reading')) {
      throw new Error(`${languageId}/${topic.id}: hard tier lacks advanced exercise patterns`)
    }
  }
}

const library = getLessonLibrary({ languageId: 'hi', siteLanguage: 'hi' })
if (!library.length || library.some((lesson) => !lesson.id || lesson.questionCount < 15 || lesson.difficulty !== 3)) {
  throw new Error('Lesson Library contains invalid entries')
}

const opened = await fetchLessonById({ languageId: 'hi', lessonId: library[0].id, preferredLangId: 'en' })
if (opened.exercises.length < 15) throw new Error('Lesson Library Open action cannot load a full lesson')
const replayed = await fetchLessonById({ languageId: 'hi', lessonId: library[0].id, preferredLangId: 'en' })
if (replayed.exercises.length < 15 || replayed.topicId !== opened.topicId) throw new Error('Lesson Library Replay action cannot reload the same lesson topic')

memory.bharatlingo_sm2_items = JSON.stringify({
  hi: [{
    id: 'hi_नमस्कार',
    word: 'नमस्कार',
    translation: 'Hello / Greetings',
    languageId: 'hi',
    nextReviewAt: '2000-01-01T00:00:00.000Z',
    retentionScore: 10,
  }],
})
const reviewLesson = generateAdaptiveLesson({ languageId: 'hi', preferredLang: 'en', topicId: 'greetings' })
const selectedReviews = reviewLesson.exercises.filter((exercise) => exercise.isReview)
if (!selectedReviews.length || selectedReviews.some((exercise) => exercise.reviewReason !== 'Spaced Review Due')) {
  throw new Error('Due SM-2 candidates were not selected with their original review metadata')
}
if (selectedReviews.some((exercise) => exercise.difficulty !== 2) || reviewLesson.exercises.map((exercise) => exercise.difficulty).join(',') !== '1,1,1,1,1,2,2,2,2,2,3,3,3,3,3') {
  throw new Error('Review integration broke the fixed difficulty progression')
}
console.log(`PASS: ${languages.length} languages × ${TOPIC_CATEGORIES.length} topics, ${library.length} stable library lessons, translations, replayable Open route, and due SM-2 review integration verified.`)
