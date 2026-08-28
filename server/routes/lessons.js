import express from 'express'

const router = express.Router()

router.get('/languages', (req, res) => {
  const languages = [
    { id: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
    { id: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
    { id: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' },
    { id: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
    { id: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
    { id: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇮🇳' },
    { id: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
    { id: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳' },
    { id: 'raj', name: 'Rajasthani', nativeName: 'राजस्थानी', flag: '🇮🇳' },
  ]
  res.json(languages)
})

export default router
