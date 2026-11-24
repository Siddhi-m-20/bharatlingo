import test from 'node:test'
import assert from 'node:assert/strict'
import { evaluateTutorWithGenerativeAI } from '../server/services/generativeTutor.js'

test('generative tutor uses a safe chat fallback without a server API key', async () => {
  const previousKey = process.env.AI_API_KEY
  delete process.env.AI_API_KEY

  try {
    const evaluation = await evaluateTutorWithGenerativeAI({
      learnerResponse: 'मुझे चाय चाहिए',
      learningLanguage: 'hi',
      preferredLanguage: 'en',
      level: 'beginner',
      chatHistory: [
        { sender: 'tutor', text: 'नमस्ते! आज किस बारे में बात करें?' },
        { sender: 'user', text: 'मुझे चाय चाहिए' },
      ],
    })
    assert.equal(evaluation.isAcceptable, true)
    assert.equal(typeof evaluation.tutorReply, 'string')
  } finally {
    if (previousKey !== undefined) process.env.AI_API_KEY = previousKey
  }
})
