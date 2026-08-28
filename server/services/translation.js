const INDICTRANS_URL = process.env.INDICTRANS_URL

const fallbackTranslations = {
  'hi': {
    'hello': 'नमस्कार',
    'water': 'पानी',
    'food': 'खाना',
    'home': 'घर',
    'book': 'किताब',
    'good morning': 'सुप्रभात',
    'thank you': 'धन्यवाद',
    'how are you': 'आप कैसे हैं',
    'i love you': 'मैं तुमसे प्यार करता हूं',
  },
  'mr': {
    'hello': 'नमस्कार',
    'water': 'पाणी',
    'food': 'अन्न',
    'home': 'घर',
    'book': 'पुस्तक',
    'good morning': 'शुभ सकाळ',
    'thank you': 'धन्यवाद',
    'how are you': 'तुम्ही कसे आहात',
    'i love you': 'मी तुम्हाला प्रेम करतो',
  },
  'ta': {
    'hello': 'வணக்கம்',
    'water': 'தண்ணீர்',
    'food': 'உணவு',
    'home': 'வீடு',
    'book': 'புத்தகம்',
    'good morning': 'காலை வணக்கம்',
    'thank you': 'நன்றி',
    'how are you': 'நீங்கள் எப்படி இருக்கிறீர்கள்',
    'i love you': 'நான் உன்னை நேசிக்கிறேன்',
  },
  'te': {
    'hello': 'నమస్కారం',
    'water': 'నీరు',
    'food': 'ఆహారం',
    'home': 'ఇల్లు',
    'book': 'పుస్తకం',
    'good morning': 'శుభోదయం',
    'thank you': 'ధన్యవాదాలు',
    'how are you': 'మీరు ఎలా ఉన్నారు',
    'i love you': 'నేను నిన్ను ప్రేమిస్తున్నాను',
  },
  'bn': {
    'hello': 'নমস্কার',
    'water': 'জল',
    'food': 'খাবার',
    'home': 'বাড়ি',
    'book': 'বই',
    'good morning': 'শুভ সকাল',
    'thank you': 'ধন্যবাদ',
    'how are you': 'আপনি কেমন আছেন',
    'i love you': 'আমি তোমাকে ভালোবাসি',
  },
  'pa': {
    'hello': 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ',
    'water': 'ਪਾਣੀ',
    'food': 'ਖਾਣਾ',
    'home': 'ਘਰ',
    'book': 'ਕਿਤਾਬ',
    'good morning': 'ਸ਼ੁਭ ਸਵੇਰ',
    'thank you': 'ਧੰਨਵਾਦ',
    'how are you': 'ਤੁਸੀ ਕਿਵੇਂ ਹੋ',
    'i love you': 'ਮੈਂ ਤੁਹਾਨੂੰ ਪਿਆਰ ਕਰਦਾ ਹਾਂ',
  },
  'gu': {
    'hello': 'નમસ્તે',
    'water': 'પાણી',
    'food': 'ખોરાક',
    'home': 'ઘર',
    'book': 'પુસ્તક',
    'good morning': 'સુપ્રભાત',
    'thank you': 'આભાર',
    'how are you': 'તમે કેમ છો',
    'i love you': 'હું તમને પ્રેમ કરું છું',
  },
  'raj': {
    'hello': 'राम राम सा',
    'water': 'पानी',
    'food': 'खाना',
    'home': 'घर',
    'book': 'किताब',
    'good morning': 'सुप्रभात',
    'thank you': 'धन्यवाद',
    'how are you': 'तुसो कैसा है',
    'i love you': 'मैं तुन्हे प्यार करुं दसुं',
  },
}

export async function translateText(text, source, target) {
  const lowerText = text.toLowerCase().trim()
  
  if (INDICTRANS_URL) {
    try {
      const response = await fetch(`${INDICTRANS_URL}/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, source, target }),
      })
      
      if (response.ok) {
        const data = await response.json()
        return { translatedText: data.translatedText, source: 'ai' }
      }
    } catch (error) {
      console.error('AI translation failed, using fallback:', error.message)
    }
  }
  
  const fallback = fallbackTranslations[target]?.[lowerText]
  if (fallback) {
    return { translatedText: fallback, source: 'fallback' }
  }
  
  return { 
    translatedText: text, 
    source: 'none',
    note: 'Translation not available for this text'
  }
}
