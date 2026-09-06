export const tamilLessons = [
  // UNIT 1: FUNDAMENTALS & ESSENTIALS
  {
    id: 'ta-greetings',
    name: 'Greetings & Salutations',
    nameNative: 'வணக்கம் மற்றும் முகமன்',
    unit: 'Unit 1: Fundamentals',
    order: 1,
    vocabulary: [
      { word: 'வணக்கம்', translation: 'Hello / Greetings', pronunciation: 'vanakkam', example: 'வணக்கம், நீங்கள் எப்படி இருக்கிறீர்கள்?' },
      { word: 'நன்றி', translation: 'Thank you', pronunciation: 'nandri', example: 'உங்கள் உதவிக்கு மிக்க நன்றி' },
      { word: 'தயவுசெய்து', translation: 'Please', pronunciation: 'thayavuseidhu', example: 'தயவுசெய்து அமருங்கள்' },
      { word: 'காலை வணக்கம்', translation: 'Good morning', pronunciation: 'kaalai vanakkam', example: 'இனிய காலை வணக்கம்' },
      { word: 'போய் வருகிறேன்', translation: 'Goodbye / See you', pronunciation: 'poi varugiren', example: 'மீண்டும் சந்திப்போம், போய் வருகிறேன்' },
    ],
    exercises: [
      {
        type: 'multiple-choice',
        prompt: 'What does "வணக்கம்" mean?',
        options: ['Hello', 'Thank you', 'Please', 'Goodbye'],
        correctAnswer: 'Hello',
        xp: 10,
      },
      {
        type: 'listening',
        prompt: 'Listen to the audio and select what you hear',
        audioText: 'நன்றி',
        options: ['வணக்கம்', 'நன்றி', 'தயவுசெய்து', 'போய் வருகிறேன்'],
        correctAnswer: 'நன்றி',
        xp: 15,
      },
      {
        type: 'speaking',
        prompt: 'Say this word aloud: "வணக்கம்"',
        targetWord: 'வணக்கம்',
        pronunciation: 'vanakkam',
        correctAnswer: 'வணக்கம்',
        xp: 15,
      },
      {
        type: 'translation',
        prompt: 'Translate "Thank you" to Tamil',
        correctAnswer: 'நன்றி',
        wordBank: ['நன்றி', 'வணக்கம்', 'தயவுசெய்து', 'ஆம்'],
        xp: 15,
      },
      {
        type: 'matching',
        prompt: 'Match Tamil greetings with meanings',
        pairs: [
          { word: 'வணக்கம்', meaning: 'Hello' },
          { word: 'நன்றி', meaning: 'Thank you' },
          { word: 'தயவுசெய்து', meaning: 'Please' },
          { word: 'காலை வணக்கம்', meaning: 'Good morning' },
        ],
        xp: 20,
      },
    ],
  },
  {
    id: 'ta-everyday',
    name: 'Everyday Essentials',
    nameNative: 'அன்றாடச் சொற்கள்',
    unit: 'Unit 1: Fundamentals',
    order: 2,
    vocabulary: [
      { word: 'தண்ணீர்', translation: 'Water', pronunciation: 'thanneer', example: 'எனக்கு தண்ணீர் வேண்டும்' },
      { word: 'வீடு', translation: 'Home / House', pronunciation: 'veedu', example: 'இது என் வீடு' },
      { word: 'நண்பன்', translation: 'Friend', pronunciation: 'nanban', example: 'அவன் என் நல்ல நண்பன்' },
      { word: 'புத்தகம்', translation: 'Book', pronunciation: 'puthagam', example: 'நான் புத்தகம் படிக்கிறேன்' },
      { word: 'ஆம்', translation: 'Yes', pronunciation: 'aam', example: 'ஆம், நான் தயார்' },
      { word: 'இல்லை', translation: 'No', pronunciation: 'illai', example: 'இல்லை, நன்றி' },
    ],
    exercises: [
      {
        type: 'multiple-choice',
        prompt: 'What does "தண்ணீர்" mean?',
        options: ['Water', 'Home', 'Friend', 'Book'],
        correctAnswer: 'Water',
        xp: 10,
      },
      {
        type: 'sentence-order',
        prompt: 'Arrange words: "This is my house"',
        sentence: 'இது என் வீடு',
        words: ['வீடு', 'இது', 'என்'],
        correctAnswer: 'இது என் வீடு',
        xp: 15,
      },
      {
        type: 'matching',
        prompt: 'Match words with meanings',
        pairs: [
          { word: 'தண்ணீர்', meaning: 'Water' },
          { word: 'வீடு', meaning: 'Home' },
          { word: 'நண்பன்', meaning: 'Friend' },
          { word: 'புத்தகம்', meaning: 'Book' },
        ],
        xp: 20,
      },
    ],
  },

  // UNIT 2: DAILY LIFE & NUMBERS
  {
    id: 'ta-numbers',
    name: 'Numbers 1 to 10',
    nameNative: 'எண்கள் ۱-۱۰',
    unit: 'Unit 2: Daily Life',
    order: 3,
    vocabulary: [
      { word: 'ஒன்று', translation: 'One', pronunciation: 'ondru', example: 'ஒரு கப் தேநீர்' },
      { word: 'இரண்டு', translation: 'Two', pronunciation: 'irandu', example: 'இரண்டு டிக்கெட்டுகள்' },
      { word: 'மூன்று', translation: 'Three', pronunciation: 'moondru', example: 'மூன்று நண்பர்கள்' },
      { word: 'நான்கு', translation: 'Four', pronunciation: 'naangu', example: 'நான்கு அறைகள்' },
      { word: 'ஐந்து', translation: 'Five', pronunciation: 'aindhu', example: 'ஐந்து நிமிடங்கள்' },
      { word: 'பத்து', translation: 'Ten', pronunciation: 'patthu', example: 'பத்து ரூபாய்' },
    ],
    exercises: [
      {
        type: 'multiple-choice',
        prompt: 'What does "ஒன்று" mean?',
        options: ['One', 'Two', 'Three', 'Ten'],
        correctAnswer: 'One',
        xp: 10,
      },
      {
        type: 'fill-blank',
        prompt: 'Sequence: ஒன்று, இரண்டு, ___ , நான்கு',
        options: ['மூன்று', 'ஐந்து', 'பத்து', 'ஆறு'],
        correctAnswer: 'மூன்று',
        xp: 15,
      },
      {
        type: 'matching',
        prompt: 'Match numbers in Tamil',
        pairs: [
          { word: 'ஒன்று', meaning: 'One' },
          { word: 'இரண்டு', meaning: 'Two' },
          { word: 'மூன்று', meaning: 'Three' },
          { word: 'பத்து', meaning: 'Ten' },
        ],
        xp: 20,
      },
    ],
  },

  // UNIT 3: FOOD & DINING
  {
    id: 'ta-food',
    name: 'Food & South Indian Dining',
    nameNative: 'உணவு மற்றும் விருந்து',
    unit: 'Unit 3: Food & Dining',
    order: 4,
    vocabulary: [
      { word: 'உணவு', translation: 'Food / Meal', pronunciation: 'unavu', example: 'சுவையான உணவு' },
      { word: 'தேநீர்', translation: 'Tea', pronunciation: 'the-neer', example: 'சூடான தேநீர்' },
      { word: 'பால்', translation: 'Milk', pronunciation: 'paal', example: 'பசுவின் பால்' },
      { word: 'சோறு', translation: 'Rice', pronunciation: 'sooru', example: 'சாம்பார் சோறு' },
      { word: 'தோசை', translation: 'Dosa', pronunciation: 'dhosai', example: 'மொறுமொறு தோசை' },
      { word: 'இனிப்பு', translation: 'Sweet', pronunciation: 'inippu', example: 'பாரம்பரிய இனிப்பு' },
    ],
    exercises: [
      {
        type: 'multiple-choice',
        prompt: 'What does "தேநீர்" mean?',
        options: ['Tea', 'Milk', 'Rice', 'Water'],
        correctAnswer: 'Tea',
        xp: 10,
      },
      {
        type: 'speaking',
        prompt: 'Say: "ஒரு தேநீர் தாருங்கள்" (Give one tea)',
        targetWord: 'ஒரு தேநீர் தாருங்கள்',
        pronunciation: 'oru the-neer thaarungal',
        correctAnswer: 'ஒரு தேநீர் தாருங்கள்',
        xp: 15,
      },
      {
        type: 'matching',
        prompt: 'Match dining vocabulary',
        pairs: [
          { word: 'உணவு', meaning: 'Food' },
          { word: 'தேநீர்', meaning: 'Tea' },
          { word: 'சோறு', meaning: 'Rice' },
          { word: 'தோசை', meaning: 'Dosa' },
        ],
        xp: 20,
      },
    ],
  },

  // UNIT 4: FAMILY & RELATIONS
  {
    id: 'ta-family',
    name: 'Family & Relations',
    nameNative: 'குடும்பம் மற்றும் உறவுகள்',
    unit: 'Unit 4: Family & Relations',
    order: 5,
    vocabulary: [
      { word: 'அம்மா', translation: 'Mother', pronunciation: 'amma', example: 'என் அன்பான அம்மா' },
      { word: 'அப்பா', translation: 'Father', pronunciation: 'appa', example: 'என் அப்பா' },
      { word: 'அண்ணன்', translation: 'Elder Brother', pronunciation: 'annan', example: 'என் மூத்த அண்ணன்' },
      { word: 'அக்கா', translation: 'Elder Sister', pronunciation: 'akka', example: 'என் அன்பான அக்கா' },
      { word: 'குடும்பம்', translation: 'Family', pronunciation: 'kudumbam', example: 'இனிய குடும்பம்' },
    ],
    exercises: [
      {
        type: 'multiple-choice',
        prompt: 'What does "அம்மா" mean?',
        options: ['Mother', 'Father', 'Sister', 'Brother'],
        correctAnswer: 'Mother',
        xp: 10,
      },
      {
        type: 'listening',
        prompt: 'Listen and select what you hear',
        audioText: 'குடும்பம்',
        options: ['அம்மா', 'அப்பா', 'அண்ணன்', 'குடும்பம்'],
        correctAnswer: 'குடும்பம்',
        xp: 15,
      },
      {
        type: 'matching',
        prompt: 'Match Tamil family relations',
        pairs: [
          { word: 'அம்மா', meaning: 'Mother' },
          { word: 'அப்பா', meaning: 'Father' },
          { word: 'அண்ணன்', meaning: 'Elder Brother' },
          { word: 'அக்கா', meaning: 'Elder Sister' },
        ],
        xp: 20,
      },
    ],
  },

  // UNIT 5: TRAVEL & PLACES
  {
    id: 'ta-travel',
    name: 'Travel & Directions',
    nameNative: 'பயணம் மற்றும் திசைகள்',
    unit: 'Unit 5: Travel & Places',
    order: 6,
    vocabulary: [
      { word: 'எங்கே', translation: 'Where', pronunciation: 'engae', example: 'நிலையம் எங்கே இருக்கிறது?' },
      { word: 'சாலை', translation: 'Road', pronunciation: 'saalai', example: 'நேரான சாலை' },
      { word: 'சந்தை', translation: 'Market', pronunciation: 'santhai', example: 'பூந்தமல்லி சந்தை' },
      { word: 'நகரம்', translation: 'City', pronunciation: 'nagaram', example: 'அழகான நகரம்' },
      { word: 'வலது', translation: 'Right side', pronunciation: 'valadhu', example: 'வலதுபுறம் திரும்புங்கள்' },
      { word: 'இடது', translation: 'Left side', pronunciation: 'idadhu', example: 'இடதுபுறம் செல்லுங்கள்' },
    ],
    exercises: [
      {
        type: 'multiple-choice',
        prompt: 'What does "எங்கே" mean?',
        options: ['Where', 'When', 'Why', 'How'],
        correctAnswer: 'Where',
        xp: 10,
      },
      {
        type: 'sentence-order',
        prompt: 'Arrange: "Where is the market?"',
        sentence: 'சந்தை எங்கே இருக்கிறது',
        words: ['இருக்கிறது', 'சந்தை', 'எங்கே'],
        correctAnswer: 'சந்தை எங்கே இருக்கிறது',
        xp: 15,
      },
      {
        type: 'matching',
        prompt: 'Match travel terms',
        pairs: [
          { word: 'எங்கே', meaning: 'Where' },
          { word: 'சாலை', meaning: 'Road' },
          { word: 'வலது', meaning: 'Right side' },
          { word: 'இடது', meaning: 'Left side' },
        ],
        xp: 20,
      },
    ],
  },

  // UNIT 6: SHOPPING & BAZAARS
  {
    id: 'ta-shopping',
    name: 'Shopping & Markets',
    nameNative: 'பொருட்கள் வாங்குதல்',
    unit: 'Unit 6: Shopping & Bazaars',
    order: 7,
    vocabulary: [
      { word: 'விலை', translation: 'Price / Cost', pronunciation: 'vilai', example: 'இதன் விலை என்ன?' },
      { word: 'ரூபாய்', translation: 'Rupees', pronunciation: 'roobai', example: 'நூறு ரூபாய்' },
      { word: 'அதிக விலை', translation: 'Expensive', pronunciation: 'adhiga vilai', example: 'இது அதிக விலை' },
      { word: 'மலிவு', translation: 'Cheap / Affordable', pronunciation: 'malivu', example: 'மலிவான விலை' },
      { word: 'கடை', translation: 'Shop', pronunciation: 'kadai', example: 'புத்தகக் கடை' },
    ],
    exercises: [
      {
        type: 'multiple-choice',
        prompt: 'What does "விலை" mean?',
        options: ['Price', 'Shop', 'Money', 'Clothes'],
        correctAnswer: 'Price',
        xp: 10,
      },
      {
        type: 'speaking',
        prompt: 'Say: "இதன் விலை என்ன" (What is its price?)',
        targetWord: 'இதன் விலை என்ன',
        pronunciation: 'ithan vilai enna',
        correctAnswer: 'இதன் விலை என்ன',
        xp: 15,
      },
      {
        type: 'matching',
        prompt: 'Match market vocabulary',
        pairs: [
          { word: 'விலை', meaning: 'Price' },
          { word: 'அதிக விலை', meaning: 'Expensive' },
          { word: 'மலிவு', meaning: 'Cheap' },
          { word: 'கடை', meaning: 'Shop' },
        ],
        xp: 20,
      },
    ],
  },

  // UNIT 7: HEALTH & EMERGENCY
  {
    id: 'ta-health',
    name: 'Health & Medical Assistance',
    nameNative: 'உடல்நலம் மற்றும் மருத்துவம்',
    unit: 'Unit 7: Health & Wellness',
    order: 8,
    vocabulary: [
      { word: 'மருத்துவர்', translation: 'Doctor', pronunciation: 'maruthuvar', example: 'மருத்துவரை அழைக்கவும்' },
      { word: 'மருந்து', translation: 'Medicine', pronunciation: 'marundhu', example: 'நேரத்திற்கு மருந்து உட்கொள்ளவும்' },
      { word: 'மருத்துவமனை', translation: 'Hospital', pronunciation: 'maruthuvamanai', example: 'பெரிய மருத்துவமனை' },
      { word: 'வலி', translation: 'Pain', pronunciation: 'vali', example: 'தலை வலி உள்ளது' },
      { word: 'உதவி', translation: 'Help', pronunciation: 'udhavi', example: 'தயவுசெய்து உதவி செய்யுங்கள்' },
    ],
    exercises: [
      {
        type: 'multiple-choice',
        prompt: 'What does "மருந்து" mean?',
        options: ['Medicine', 'Doctor', 'Hospital', 'Pain'],
        correctAnswer: 'Medicine',
        xp: 10,
      },
      {
        type: 'fill-blank',
        prompt: 'Complete: "தயவுசெய்து ___ செய்யுங்கள்" (Please help)',
        options: ['உதவி', 'மருந்து', 'மருத்துவர்', 'வலி'],
        correctAnswer: 'உதவி',
        xp: 15,
      },
      {
        type: 'matching',
        prompt: 'Match medical vocabulary',
        pairs: [
          { word: 'மருத்துவர்', meaning: 'Doctor' },
          { word: 'மருந்து', meaning: 'Medicine' },
          { word: 'மருத்துவமனை', meaning: 'Hospital' },
          { word: 'உதவி', meaning: 'Help' },
        ],
        xp: 20,
      },
    ],
  },

  // UNIT 8: WORK & PROFESSIONAL LIFE
  {
    id: 'ta-work',
    name: 'Work & Professional Life',
    nameNative: 'வேலை மற்றும் அலுவல்',
    unit: 'Unit 8: Work & Professional',
    order: 9,
    vocabulary: [
      { word: 'வேலை', translation: 'Work / Job', pronunciation: 'velai', example: 'இன்று நிறைய வேலை உள்ளது' },
      { word: 'அலுவலகம்', translation: 'Office', pronunciation: 'aluvalagam', example: 'அலுவலக நேரம்' },
      { word: 'கூட்டம்', translation: 'Meeting', pronunciation: 'koottam', example: 'முக்கியமான கூட்டம்' },
      { word: 'நேரம்', translation: 'Time', pronunciation: 'neram', example: 'சரியான நேரம்' },
      { word: 'செய்தி', translation: 'Message', pronunciation: 'seidhy', example: 'செய்தி அனுப்புங்கள்' },
    ],
    exercises: [
      {
        type: 'multiple-choice',
        prompt: 'What does "அலுவலகம்" mean?',
        options: ['Office', 'Meeting', 'Time', 'Message'],
        correctAnswer: 'Office',
        xp: 10,
      },
      {
        type: 'matching',
        prompt: 'Match work terms',
        pairs: [
          { word: 'வேலை', meaning: 'Work' },
          { word: 'அலுவலகம்', meaning: 'Office' },
          { word: 'கூட்டம்', meaning: 'Meeting' },
          { word: 'நேரம்', meaning: 'Time' },
        ],
        xp: 20,
      },
    ],
  },

  // UNIT 9: CULTURE & CELEBRATIONS
  {
    id: 'ta-festivals',
    name: 'Festivals & Tamil Culture',
    nameNative: 'திருவிழா மற்றும் பண்பாடு',
    unit: 'Unit 9: Culture & Celebrations',
    order: 10,
    vocabulary: [
      { word: 'திருவிழா', translation: 'Festival', pronunciation: 'thiruvizha', example: 'பொங்கல் திருவிழா' },
      { word: 'வாழ்த்துகள்', translation: 'Congratulations / Wishes', pronunciation: 'vaazhthukkal', example: 'பொங்கல் நல்வாழ்த்துகள்' },
      { word: 'மகிழ்ச்சி', translation: 'Happiness / Joy', pronunciation: 'magizhchi', example: 'மிகுந்த மகிழ்ச்சி' },
      { word: 'இசை', translation: 'Music', pronunciation: 'isai', example: 'கர்நாடக சங்கீதம்' },
      { word: 'பரதநாட்டியம்', translation: 'Bharatanatyam Dance', pronunciation: 'bharatanaattiyam', example: 'பாரம்பரிய நடனம்' },
    ],
    exercises: [
      {
        type: 'multiple-choice',
        prompt: 'What does "திருவிழா" mean?',
        options: ['Festival', 'Music', 'Dance', 'Congratulations'],
        correctAnswer: 'Festival',
        xp: 10,
      },
      {
        type: 'speaking',
        prompt: 'Say: "நல்வாழ்த்துகள்" (Best Wishes)',
        targetWord: 'நல்வாழ்த்துகள்',
        pronunciation: 'nalvaazhthukkal',
        correctAnswer: 'நல்வாழ்த்துகள்',
        xp: 15,
      },
      {
        type: 'matching',
        prompt: 'Match cultural terms',
        pairs: [
          { word: 'திருவிழா', meaning: 'Festival' },
          { word: 'வாழ்த்துகள்', meaning: 'Wishes' },
          { word: 'மகிழ்ச்சி', meaning: 'Happiness' },
          { word: 'இசை', meaning: 'Music' },
        ],
        xp: 20,
      },
    ],
  },

  // UNIT 10: FLUENCY & IDIOMS
  {
    id: 'ta-mastery',
    name: 'Fluency & Tamil Proverbs (Pazhamozhi)',
    nameNative: 'பழமொழிகள் மற்றும் புலமை',
    unit: 'Unit 10: Fluency & Mastery',
    order: 11,
    vocabulary: [
      { word: 'சிறு துளி பெரு வெள்ளம்', translation: 'Every little drop makes a mighty ocean', pronunciation: 'siru thuli peru vellam', example: 'சேமிப்பு முக்கியம், சிறு துளி பெரு வெள்ளம்' },
      { word: 'சுவர் இருந்தால் தான் சித்திரம்', translation: 'Health is wealth / Basics needed for art', pronunciation: 'suvar irundhaal thaan chithiram', example: 'உடலை கவனி, சுவர் இருந்தால் தான் சித்திரம்' },
      { word: 'பொறுத்தார் பூமி ஆள்வார்', translation: 'Patience will conquer the earth', pronunciation: 'poruthar boomi aalvaar', example: 'அமைதியாக இரு, பொறுத்தார் பூமி ஆள்வார்' },
    ],
    exercises: [
      {
        type: 'multiple-choice',
        prompt: 'What does "சிறு துளி பெரு வெள்ளம்" mean?',
        options: ['Little drops make a mighty ocean', 'Floods are dangerous', 'Rain is heavy', 'Save trees'],
        correctAnswer: 'Little drops make a mighty ocean',
        xp: 15,
      },
      {
        type: 'reading',
        prompt: 'Read this Tamil passage and answer:',
        passage: 'கவியரசு மதுரையில் உள்ள மீனாட்சி அம்மன் கோவிலுக்கு சென்றார். அக்கோவிலின் சிற்பக்கலை அவரை மிகவும் கவர்ந்தது.',
        question: 'Which famous temple in Madurai did Kaviarasu visit?',
        options: ['Meenakshi Amman Temple (மீனாட்சி அம்மன் கோவில்)', 'Brihadeeswarar Temple', 'Shore Temple', 'Ranganathaswamy Temple'],
        correctAnswer: 'Meenakshi Amman Temple (மீனாட்சி அம்மன் கோவில்)',
        xp: 20,
      },
      {
        type: 'matching',
        prompt: 'Match Tamil proverbs with meanings',
        pairs: [
          { word: 'சிறு துளி பெரு வெள்ளம்', meaning: 'Little drops make a mighty ocean' },
          { word: 'பொறுத்தார் பூமி ஆள்வார்', meaning: 'Patience will conquer the earth' },
        ],
        xp: 25,
      },
    ],
  },
]
