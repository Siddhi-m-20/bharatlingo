let voicesPromise = null

function loadVoices() {
  if (!voicesPromise) {
    voicesPromise = new Promise((resolve) => {
      const voices = window.speechSynthesis.getVoices()
      if (voices.length > 0) {
        resolve(voices)
        return
      }
      const onVoicesChanged = () => {
        window.speechSynthesis.removeEventListener('voiceschanged', onVoicesChanged)
        resolve(window.speechSynthesis.getVoices())
      }
      window.speechSynthesis.addEventListener('voiceschanged', onVoicesChanged)
      setTimeout(() => {
        window.speechSynthesis.removeEventListener('voiceschanged', onVoicesChanged)
        resolve(window.speechSynthesis.getVoices())
      }, 2000)
    })
  }
  return voicesPromise
}

function findVoice(voices, language) {
  const base = language.split('-')[0]
  return (
    voices.find(voice => voice.lang === language) ||
    voices.find(voice => voice.lang.replace('_', '-') === language) ||
    voices.find(voice => voice.lang.startsWith(base))
  )
}

export async function speak(text, language = 'en-US') {
  if (!('speechSynthesis' in window)) {
    return false
  }

  const voices = await loadVoices()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = language
  utterance.rate = 0.9

  const matchingVoice = findVoice(voices, language)
  if (matchingVoice) {
    utterance.voice = matchingVoice
  } else {
    console.warn(
      `No "${language}" text-to-speech voice is installed in this browser/OS; ` +
      'audio may be silent or mispronounced. Try Microsoft Edge or install the language pack.'
    )
  }

  window.speechSynthesis.cancel()
  window.speechSynthesis.resume()
  window.speechSynthesis.speak(utterance)
  return Boolean(matchingVoice)
}

export async function hasVoiceFor(language) {
  if (!('speechSynthesis' in window)) {
    return false
  }
  const voices = await loadVoices()
  return Boolean(findVoice(voices, language))
}

export function getLanguageVoiceCode(langId) {
  const voiceMap = {
    'hi': 'hi-IN',
    'mr': 'mr-IN',
    'ta': 'ta-IN',
    'te': 'te-IN',
    'bn': 'bn-IN',
    'pa': 'pa-IN',
    'gu': 'gu-IN',
    'raj': 'hi-IN',
    'en': 'en-US',
  }
  return voiceMap[langId] || 'en-US'
}
