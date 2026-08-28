export function speak(text, language = 'en-US') {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = language
    utterance.rate = 0.9
    
    const voices = window.speechSynthesis.getVoices()
    const matchingVoice = voices.find(voice => voice.lang.startsWith(language.split('-')[0]))
    if (matchingVoice) {
      utterance.voice = matchingVoice
    }
    
    window.speechSynthesis.speak(utterance)
    return true
  }
  return false
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
