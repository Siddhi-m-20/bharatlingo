const SUPPORTED_LANGUAGES = new Set(['hi', 'mr', 'ta', 'te', 'bn', 'pa', 'gu', 'en'])

function getProviderConfig() {
  return {
    provider: String(process.env.AI_PROVIDER || 'gemini').toLowerCase(),
    apiKey: process.env.AI_API_KEY || '',
    model: process.env.AI_MODEL || 'gemini-3.5-flash-lite',
    maxTokens: Math.min(800, Math.max(100, Number(process.env.AI_MAX_OUTPUT_TOKENS) || 300)),
  }
}

function buildTutorPrompt({ chatHistory, learnerResponse, learningLanguage, preferredLanguage, level }) {
  const history = (chatHistory || [])
    .slice(-8)
    .map((message) => `${message.sender === 'user' ? 'Learner' : 'Tutor'}: ${String(message.text || '').slice(0, 500)}`)
    .join('\n')

  return `You are a language tutor for BharatLingo.
Learning language: ${learningLanguage}
Interface language: ${preferredLanguage}
Learner level: ${level || 'beginner'}
Recent chat:
${history}

Learner response: ${learnerResponse}

Have a normal, natural conversation with the learner in the learning language.
Adapt to the learner's level and keep replies short enough to practice.
Ask a relevant follow-up question after the learner responds.
Politely notice grammar or vocabulary mistakes, but do not dominate the conversation.
Do not use a script, scenario, or fixed next turn.
Praise and feedback should be in the interface language.
The tutorReply, naturalAlternative, and correctedReply should be in the learning language.
Respond only with valid JSON matching this schema:
{"isAcceptable":boolean,"score":number,"praise":string,"feedback":string,"naturalAlternative":string,"correctedReply":string,"tutorReply":string}`
}

function extractJson(text) {
  if (!text) throw new Error('Provider returned an empty response')
  const cleaned = String(text).trim().replace(/^```(?:json)?\s*/i, '').replace(/```$/, '').trim()
  const start = cleaned.indexOf('{')
  const end = cleaned.lastIndexOf('}')
  if (start === -1 || end === -1) throw new Error('Provider response was not JSON')
  return JSON.parse(cleaned.slice(start, end + 1))
}

function normalizeEvaluation(value) {
  const score = Number.isFinite(Number(value?.score))
    ? Math.min(100, Math.max(0, Math.round(Number(value.score))))
    : 0

  return {
    isAcceptable: Boolean(value?.isAcceptable),
    score,
    praise: String(value?.praise || '').slice(0, 300),
    feedback: String(value?.feedback || '').slice(0, 1000),
    naturalAlternative: String(value?.naturalAlternative || '').slice(0, 500),
    correctedReply: String(value?.correctedReply || '').slice(0, 500),
    tutorReply: String(value?.tutorReply || '').slice(0, 800),
  }
}

async function requestGemini(prompt, config) {
  const preferred = String(config.model || 'gemini-3.5-flash-lite')
  const models = [...new Set([
    preferred,
    'gemini-3.5-flash-lite',
    'gemini-3.6-flash',
    'gemini-3.5-flash',
  ])]

  let lastError = null
  for (const model of models) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(config.apiKey)}`
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: config.maxTokens,
            responseMimeType: 'application/json',
          },
        }),
      })

      if (!response.ok) {
        const detail = await response.text().catch(() => '')
        lastError = new Error(`Gemini ${model} failed (${response.status})${detail ? `: ${detail.slice(0, 300)}` : ''}`)
        continue
      }

      const data = await response.json()
      const text = data?.candidates?.[0]?.content?.parts
        ?.map((part) => part?.text || '')
        .join('')
      if (text) return extractJson(text)
      lastError = new Error(`Gemini ${model} returned no text`)
    } catch (error) {
      lastError = error
    }
  }

  throw lastError || new Error('No Gemini model was available')
}

async function requestOpenAI(prompt, config) {
  const baseUrl = (process.env.AI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '')
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model || 'gpt-4o-mini',
      temperature: 0.4,
      max_tokens: config.maxTokens,
      response_format: { type: 'json_object' },
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!response.ok) {
    const detail = await response.text().catch(() => '')
    throw new Error(`OpenAI-compatible request failed (${response.status})${detail ? `: ${detail.slice(0, 300)}` : ''}`)
  }

  const data = await response.json()
  return extractJson(data?.choices?.[0]?.message?.content)
}

export async function evaluateTutorWithGenerativeAI(input) {
  const learningLanguage = SUPPORTED_LANGUAGES.has(input?.learningLanguage) ? input.learningLanguage : 'en'
  const preferredLanguage = SUPPORTED_LANGUAGES.has(input?.preferredLanguage) ? input.preferredLanguage : 'en'
  const learnerResponse = String(input?.learnerResponse || '').trim().slice(0, 1200)

  if (!learnerResponse) throw new Error('Learner response is required')

  const config = getProviderConfig()
  if (!config.apiKey) {
    return {
      isAcceptable: true,
      score: 70,
      praise: 'Good conversation!',
      feedback: 'Keep practising naturally.',
      naturalAlternative: learnerResponse,
      correctedReply: learnerResponse,
      tutorReply: learningLanguage === 'en'
        ? 'That is nice. What would you like to talk about next?'
        : 'बहुत अच्छा। आप आगे क्या कहना चाहते हैं?',
    }
  }

  const prompt = buildTutorPrompt({
    chatHistory: input.chatHistory,
    learnerResponse,
    learningLanguage,
    preferredLanguage,
    level: String(input.level || 'beginner').slice(0, 30),
  })

  try {
    const raw = config.provider === 'openai'
      ? await requestOpenAI(prompt, config)
      : await requestGemini(prompt, config)
    return normalizeEvaluation(raw)
  } catch (error) {
    console.warn('[GenerativeTutor] Provider unavailable, using chat fallback:', error.message)
    return {
      isAcceptable: true,
      score: 70,
      praise: 'Good conversation!',
      feedback: 'Keep practising naturally.',
      naturalAlternative: learnerResponse,
      correctedReply: learnerResponse,
      tutorReply: learningLanguage === 'en'
        ? 'That is nice. What would you like to talk about next?'
        : 'बहुत अच्छा। आप आगे क्या कहना चाहते हैं?',
    }
  }
}
