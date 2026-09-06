# BharatLingo

**Learn India. One word at a time.**

BharatLingo is a complete Indian language-learning application inspired by modern language-learning platforms. Learn Hindi, Marathi, Tamil, Telugu, Bengali, Punjabi, Gujarati, and English through interactive lessons, gamification, and personalized learning paths.

## Features

- **8 Indian Languages**: Hindi, Marathi, Tamil, Telugu, Bengali, Punjabi, Gujarati, and English
- **Interactive Lessons**: Multiple exercise types including multiple-choice, translation, listening, fill-in-the-blank, and matching
- **Gamification**: XP system, streaks, hearts, achievements, and leaderboards
- **Personalized Learning**: Placement assessment, adaptive learning paths, and daily goals
- **Audio Support**: Browser-based text-to-speech for pronunciation
- **Offline-First**: Core functionality works without internet connection
- **Responsive Design**: Works on desktop and mobile devices
- **Accessibility**: ARIA labels, keyboard navigation, and reduced motion support

## Requirements

- Node.js 18 or higher
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd bharatlingo
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` to configure Supabase and optional AI services:
```env
# Supabase Authentication & Database
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Optional AI Services
PORT=5000
INDICTRANS_URL=http://127.0.0.1:8000
INDICCONFORMER_URL=http://127.0.0.1:8001
TTS_URL=http://127.0.0.1:8002
```

### Supabase Database Setup
1. Create a project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in your Supabase dashboard.
3. Paste and run the contents of [`supabase/schema.sql`](supabase/schema.sql).
4. Copy your project URL and anon public key into `.env`.
*(If Supabase keys are not set, BharatLingo automatically operates in local offline mode using browser storage).*

## Running the Application

Start both the frontend and backend servers:

```bash
npm run dev
```

This will launch:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## Architecture

### Frontend
- **React** with Vite for fast development
- **React Router** for navigation
- **Framer Motion** for animations
- **Lucide React** for icons
- **localStorage** for data persistence

### Backend
- **Express** server with REST API
- **CORS** enabled for development
- **Environment-based configuration**

### Data Structure
```
src/
├── components/      # Reusable UI components
├── pages/          # Route components
├── data/           # Language content and lessons
├── services/       # Business logic (auth, progress, speech)
├── hooks/          # Custom React hooks
├── utils/          # Utility functions
└── styles/         # Global styles
```

## Supported Languages

| Language | Native Name | Script |
|----------|-------------|--------|
| Hindi | हिन्दी | Devanagari |
| Marathi | मराठी | Devanagari |
| Tamil | தமிழ் | Tamil |
| Telugu | తెలుగు | Telugu |
| Bengali | বাংলা | Bengali |
| Punjabi | ਪੰਜਾਬੀ | Gurmukhi |
| Gujarati | ગુજરાતી | Gujarati |
| English | English | Latin |

## Learning Path

1. **Welcome** - Landing page with app introduction
2. **Signup/Login** - Create account or sign in
3. **Onboarding** - Select languages, goals, and daily targets
4. **Assessment** - Placement test to determine starting level
5. **Dashboard** - Main hub with stats and learning path
6. **Lessons** - Interactive exercises with XP rewards
7. **Practice** - Vocabulary review and mastery tracking
8. **Achievements** - Unlock badges for milestones

## Exercise Types

- **Multiple Choice**: Select the correct answer from options
- **Translation**: Type or select the translation
- **Listening**: Identify words from audio
- **Fill in the Blank**: Complete sentences
- **Matching**: Pair words with meanings

## Gamification

### XP System
- Correct answer: +10 XP
- Perfect lesson: +25 XP bonus
- Daily goal completion: +20 XP
- Speaking challenges: +15 XP
- Review practice: +5 XP

### Streaks
- Daily activity maintains streak
- Weekly streak calendar visualization
- Streak achievements at 7, 30 days

### Hearts
- Start with 5 hearts
- Lose 1 heart per incorrect answer
- Restore through practice review
- Game over when hearts reach zero

### Achievements
- First Step: Complete first lesson
- Word Collector: Learn 50 words
- 7 Day Flame: 7-day streak
- Speaking Star: 10 speaking exercises
- Perfect Lesson: Finish without mistakes
- Polyglot: Study three languages

## Optional AI Services

### IndicTrans2 (Translation)
Provides AI-powered translation between Indian languages.

**Setup:**
1. Install IndicTrans2 following their documentation
2. Set `INDICTRANS_URL` in `.env`
3. The app will use AI translation when available, falling back to curated content

### IndicConformer (Speech Recognition)
Provides speech-to-text for Indian languages.

**Setup:**
1. Install IndicConformer following their documentation
2. Set `INDICCONFORMER_URL` in `.env`
3. The app will use AI speech recognition when available, falling back to browser SpeechRecognition

### Local TTS (Text-to-Speech)
Provides higher quality text-to-speech.

**Setup:**
1. Install a local TTS server
2. Set `TTS_URL` in `.env`
3. The app will use local TTS when available, falling back to browser SpeechSynthesis

**Note**: All core functionality works without these services using browser-native capabilities and curated content.

## Accessibility

- Semantic HTML structure
- Keyboard navigation support
- ARIA labels for dynamic content
- Focus indicators
- Screen reader compatible
- Reduced motion support
- Sufficient color contrast
- Text alternatives for audio

## Browser Support

- Chrome/Edge (recommended)
- Firefox
- Safari
- Mobile browsers

## Development

### Project Structure
```
bharatlingo/
├── public/              # Static assets
├── src/
│   ├── components/     # Reusable components
│   ├── pages/          # Page components
│   ├── data/           # Content data
│   ├── services/       # Business logic
│   ├── hooks/          # Custom hooks
│   ├── utils/          # Utilities
│   └── styles/         # CSS
├── server/             # Backend API
│   ├── routes/        # API endpoints
│   └── services/      # Backend services
├── .env.example        # Environment template
├── package.json        # Dependencies
├── vite.config.js      # Vite configuration
└── README.md          # This file
```

### Adding New Languages

1. Add language to `src/data/languages.js`
2. Create lesson data in `src/data/lessons/[language].js`
3. Create assessment questions in `src/data/questions/[language].js`
4. Update imports in index files

### Adding New Lesson Types

1. Add exercise type to lesson data structure
2. Implement rendering logic in `src/pages/Lesson/Lesson.jsx`
3. Add validation/scoring logic

## Data Persistence

User data is stored in localStorage:
- User profile and preferences
- Learning progress
- Vocabulary mastery
- Achievements
- Streak data

Future versions may support PostgreSQL, Supabase, or Firebase migration.

## Security

- No API keys in frontend code
- `.env` file in `.gitignore`
- Password hashing for production auth
- Input validation
- XSS prevention

## Performance

- Lazy loading for large components
- Optimized animations with Framer Motion
- Efficient state management
- Minimal bundle size

## Testing

Test the following flows:
1. Authentication (signup, login, validation)
2. Onboarding (language selection, goals)
3. Assessment (all question types, scoring)
4. Lessons (all exercise types, XP, hearts)
5. Dashboard (stats, navigation)
6. Practice (vocabulary review)
7. Settings (all controls work)
8. Mobile responsiveness (320px, 375px, 768px)

## Troubleshooting

**Frontend not loading:**
- Ensure Node.js 18+ is installed
- Run `npm install` to install dependencies
- Check that port 5173 is available

**Backend not starting:**
- Check that port 5000 is available
- Verify `.env` file exists
- Check Node.js version

**Audio not working:**
- Ensure browser supports Web Speech API
- Check browser permissions for microphone/speakers
- Try different browser (Chrome recommended)

**Progress not saving:**
- Check browser localStorage is enabled
- Clear browser cache and try again
- Check browser console for errors

## Contributing

Contributions are welcome! Please follow these guidelines:
- Maintain existing code style
- Add tests for new features
- Update documentation
- Ensure accessibility standards

## License

This project is for educational purposes. Please respect language data and cultural content.

## Support

For issues or questions:
- Check the troubleshooting section
- Review code comments
- Check browser console for errors

## Roadmap

Future enhancements:
- Real user authentication (Supabase)
- PostgreSQL database integration
- Cloud storage for audio
- Real-time multiplayer features
- Mobile app (React Native)
- More Indian languages
- Advanced AI tutor integration
- PWA support

## Acknowledgments

- Inspired by modern language-learning platforms
- Indian language data from linguistic sources
- AI4Bharat for open-source Indic NLP models
- Open-source community contributions

---

**Made with ❤️ for Indian language learners**

© 2026 BharatLingo. Learn Indian languages with confidence.
