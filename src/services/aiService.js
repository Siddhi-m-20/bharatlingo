/**
 * aiService.js — Backward-compatibility shim
 *
 * All new code should import from '../../services/audio' directly.
 * This file maintains backward compatibility for existing imports.
 */

export { voiceLocales as languageLocales } from './audio/AudioService'
export { speakText } from './audio/AudioService'
export { calculateSpeakingScore } from './audio/SpeechRecognitionService'

// Legacy SpeechRecognizer class shim — wraps the new service
import { speechRecognitionService, REC_STATE } from './audio/SpeechRecognitionService'

export class SpeechRecognizer {
  constructor(languageId = 'hi') {
    this.languageId = languageId
  }

  start(targetWord, onResult, onError) {
    speechRecognitionService.start(this.languageId, targetWord, {
      onResult: (res) => {
        if (onResult) onResult({
          transcript: res.transcript,
          confidence: res.confidence,
          similarity: res.score,
          isMatch: res.isMatch,
        })
      },
      onError: ({ message }) => {
        if (onError) onError(message)
      },
    })
  }

  stop() {
    speechRecognitionService.stop()
  }
}
