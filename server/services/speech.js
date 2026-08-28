const INDICCONFORMER_URL = process.env.INDICCONFORMER_URL

export async function speechToText(audio, language) {
  if (INDICCONFORMER_URL) {
    try {
      const response = await fetch(`${INDICCONFORMER_URL}/recognize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audio, language }),
      })
      
      if (response.ok) {
        const data = await response.json()
        return { text: data.text, source: 'ai' }
      }
    } catch (error) {
      console.error('AI speech recognition failed:', error.message)
    }
  }
  
  return { 
    text: '', 
    source: 'none',
    note: 'Speech recognition service unavailable. Please use browser speech recognition.'
  }
}
