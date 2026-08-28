import { hindiAssessmentQuestions } from './hindi.js'
import { marathiAssessmentQuestions } from './marathi.js'
import { tamilAssessmentQuestions } from './tamil.js'
import { teluguAssessmentQuestions } from './telugu.js'
import { bengaliAssessmentQuestions } from './bengali.js'
import { punjabiAssessmentQuestions } from './punjabi.js'
import { gujaratiAssessmentQuestions } from './gujarati.js'
import { englishAssessmentQuestions } from './english.js'
import { rajasthaniAssessmentQuestions } from './rajasthani.js'

export const assessmentQuestionsByLanguage = {
  hi: hindiAssessmentQuestions,
  mr: marathiAssessmentQuestions,
  ta: tamilAssessmentQuestions,
  te: teluguAssessmentQuestions,
  bn: bengaliAssessmentQuestions,
  pa: punjabiAssessmentQuestions,
  gu: gujaratiAssessmentQuestions,
  en: englishAssessmentQuestions,
  raj: rajasthaniAssessmentQuestions,
}

export const getAssessmentQuestions = (languageId) => {
  return assessmentQuestionsByLanguage[languageId] || []
}
