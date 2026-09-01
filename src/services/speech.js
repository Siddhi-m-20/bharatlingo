/**
 * speech.js — Thin wrapper for backward compatibility
 * All new code should use src/services/audio/AudioService directly.
 */

import { ttsService, voiceLocales } from './audio/AudioService'

export function speak(text, language = 'hi-IN') {
  // Determine langId from locale string
  const langId = Object.keys(voiceLocales).find((k) =>
    voiceLocales[k].some?.((l) => l === language || language.startsWith(k)) ||
    voiceLocales[k] === language ||
    language.startsWith(k)
  ) || 'hi'
  return ttsService.speak(text, langId)
}

export function getLanguageVoiceCode(langId) {
  const locales = voiceLocales[langId]
  if (Array.isArray(locales)) return locales[0]
  return locales || 'hi-IN'
}
