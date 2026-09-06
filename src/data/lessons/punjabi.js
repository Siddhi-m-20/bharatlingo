export const punjabiLessons = [
  // UNIT 1: FUNDAMENTALS & ESSENTIALS
  {
    id: 'pa-greetings',
    name: 'Greetings & Salutations',
    nameNative: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ ਤੇ ਸ਼ੁਭਕਾਮਨਾਵਾਂ',
    unit: 'Unit 1: Fundamentals',
    order: 1,
    vocabulary: [
      { word: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ', translation: 'Hello / Greetings', pronunciation: 'sat sri akaal', example: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ ਜੀ, ਤੁਸੀਂ ਕਿਵੇਂ ਹੋ?' },
      { word: 'ਧੰਨਵਾਦ', translation: 'Thank you', pronunciation: 'dhannvaad', example: 'ਤੁਹਾਡਾ ਬਹੁਤ ਬਹੁਤ ਧੰਨਵਾਦ' },
      { word: 'ਕਿਰਪਾ ਕਰਕੇ', translation: 'Please', pronunciation: 'kripa karke', example: 'ਕਿਰਪਾ ਕਰਕੇ ਬੈਠੋ' },
      { word: 'ਸ਼ੁਭ ਸਵੇਰ', translation: 'Good morning', pronunciation: 'shubh saver', example: 'ਸਾਰਿਆਂ ਨੂੰ ਸ਼ੁਭ ਸਵੇਰ' },
      { word: 'ਅਲਵਿਦਾ', translation: 'Goodbye / See you', pronunciation: 'alvida', example: 'ਫਿਰ ਮਿਲਾਂਗੇ, ਅਲਵਿਦਾ' },
    ],
    exercises: [
      {
        type: 'multiple-choice',
        prompt: 'What does "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ" mean?',
        options: ['Hello', 'Thank you', 'Please', 'Goodbye'],
        correctAnswer: 'Hello',
        xp: 10,
      },
      {
        type: 'listening',
        prompt: 'Listen to the audio and select what you hear',
        audioText: 'ਧੰਨਵਾਦ',
        options: ['ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ', 'ਧੰਨਵਾਦ', 'ਕਿਰਪਾ ਕਰਕੇ', 'ਅਲਵਿਦਾ'],
        correctAnswer: 'ਧੰਨਵਾਦ',
        xp: 15,
      },
      {
        type: 'speaking',
        prompt: 'Say this word aloud: "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ"',
        targetWord: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ',
        pronunciation: 'sat sri akaal',
        correctAnswer: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ',
        xp: 15,
      },
      {
        type: 'translation',
        prompt: 'Translate "Thank you" to Punjabi',
        correctAnswer: 'ਧੰਨਵਾਦ',
        wordBank: ['ਧੰਨਵਾਦ', 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ', 'ਕਿਰਪਾ ਕਰਕੇ', 'ਹਾਂ'],
        xp: 15,
      },
      {
        type: 'matching',
        prompt: 'Match Punjabi greetings with meanings',
        pairs: [
          { word: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ', meaning: 'Hello' },
          { word: 'ਧੰਨਵਾਦ', meaning: 'Thank you' },
          { word: 'ਕਿਰਪਾ ਕਰਕੇ', meaning: 'Please' },
          { word: 'ਸ਼ੁਭ ਸਵੇਰ', meaning: 'Good morning' },
        ],
        xp: 20,
      },
    ],
  },
  {
    id: 'pa-everyday',
    name: 'Everyday Essentials',
    nameNative: 'ਰੋਜ਼ਾਨਾ ਵਰਤੋਂ ਦੇ ਸ਼ਬਦ',
    unit: 'Unit 1: Fundamentals',
    order: 2,
    vocabulary: [
      { word: 'ਪਾਣੀ', translation: 'Water', pronunciation: 'paani', example: 'ਮੈਨੂੰ ਪਾਣੀ ਚਾਹੀਦਾ ਹੈ' },
      { word: 'ਘਰ', translation: 'Home / House', pronunciation: 'ghar', example: 'ਇਹ ਮੇਰਾ ਘਰ ਹੈ' },
      { word: 'ਦੋਸਤ', translation: 'Friend', pronunciation: 'dost', example: 'ਉਹ ਮੇਰਾ ਪੱਕਾ ਦੋਸਤ ਹੈ' },
      { word: 'ਕਿਤਾਬ', translation: 'Book', pronunciation: 'kitaab', example: 'ਮੈਂ ਕਿਤਾਬ ਪੜ੍ਹਦਾ ਹਾਂ' },
      { word: 'ਹਾਂ', translation: 'Yes', pronunciation: 'haan', example: 'ਹਾਂ, ਮੈਂ ਤਿਆਰ ਹਾਂ' },
      { word: 'ਨਹੀਂ', translation: 'No', pronunciation: 'nahin', example: 'ਨਹੀਂ, ਧੰਨਵਾਦ' },
    ],
    exercises: [
      {
        type: 'multiple-choice',
        prompt: 'What does "ਪਾਣੀ" mean?',
        options: ['Water', 'Home', 'Friend', 'Book'],
        correctAnswer: 'Water',
        xp: 10,
      },
      {
        type: 'sentence-order',
        prompt: 'Arrange words: "This is my house"',
        sentence: 'ਇਹ ਮੇਰਾ ਘਰ ਹੈ',
        words: ['ਹੈ', 'ਇਹ', 'ਘਰ', 'ਮੇਰਾ'],
        correctAnswer: 'ਇਹ ਮੇਰਾ ਘਰ ਹੈ',
        xp: 15,
      },
      {
        type: 'matching',
        prompt: 'Match words with meanings',
        pairs: [
          { word: 'ਪਾਣੀ', meaning: 'Water' },
          { word: 'ਘਰ', meaning: 'Home' },
          { word: 'ਦੋਸਤ', meaning: 'Friend' },
          { word: 'ਕਿਤਾਬ', meaning: 'Book' },
        ],
        xp: 20,
      },
    ],
  },

  // UNIT 2: NUMBERS & DAILY LIFE
  {
    id: 'pa-numbers',
    name: 'Numbers 1 to 10',
    nameNative: 'ਗਿਣਤੀ ۱-۱۰',
    unit: 'Unit 2: Daily Life',
    order: 3,
    vocabulary: [
      { word: 'ਇੱਕ', translation: 'One', pronunciation: 'ikk', example: 'ਇੱਕ ਕੱਪ ਚਾਹ' },
      { word: 'ਦੋ', translation: 'Two', pronunciation: 'do', example: 'ਦੋ ਟਿਕਟਾਂ ਦਿਓ' },
      { word: 'ਤਿੰਨ', translation: 'Three', pronunciation: 'tinn', example: 'ਤਿੰਨ ਦੋਸਤ' },
      { word: 'ਚਾਰ', translation: 'Four', pronunciation: 'chaar', example: 'ਚਾਰ ਕਮਰੇ' },
      { word: 'ਪੰਜ', translation: 'Five', pronunciation: 'panj', example: 'ਪੰਜ ਮਿੰਟ' },
      { word: 'ਦਸ', translation: 'Ten', pronunciation: 'das', example: 'ਦਸ ਰੁਪਏ' },
    ],
    exercises: [
      {
        type: 'multiple-choice',
        prompt: 'What does "ਇੱਕ" mean?',
        options: ['One', 'Two', 'Three', 'Ten'],
        correctAnswer: 'One',
        xp: 10,
      },
      {
        type: 'fill-blank',
        prompt: 'Sequence: ਇੱਕ, ਦੋ, ___ , ਚਾਰ',
        options: ['ਤਿੰਨ', 'ਪੰਜ', 'ਦਸ', 'ਛੇ'],
        correctAnswer: 'ਤਿੰਨ',
        xp: 15,
      },
      {
        type: 'matching',
        prompt: 'Match Punjabi numbers',
        pairs: [
          { word: 'ਇੱਕ', meaning: 'One' },
          { word: 'ਦੋ', meaning: 'Two' },
          { word: 'ਤਿੰਨ', meaning: 'Three' },
          { word: 'ਦਸ', meaning: 'Ten' },
        ],
        xp: 20,
      },
    ],
  },

  // UNIT 3: FOOD & DINING
  {
    id: 'pa-food',
    name: 'Food & Dhaba Dining',
    nameNative: 'ਖਾਣਾ-ਪੀਣਾ ਤੇ ਢਾਬਾ',
    unit: 'Unit 3: Food & Dining',
    order: 4,
    vocabulary: [
      { word: 'ਖਾਣਾ', translation: 'Food / Meal', pronunciation: 'khaana', example: 'ਸੁਆਦੀ ਖਾਣਾ' },
      { word: 'ਚਾਹ', translation: 'Tea', pronunciation: 'chaah', example: 'ਗਰਮ ਚਾਹ ਪੀਓ' },
      { word: 'ਦੁੱਧ', translation: 'Milk', pronunciation: 'duddh', example: 'ਤਾਜ਼ਾ ਦੁੱਧ' },
      { word: 'ਪਰੌਂਠਾ', translation: 'Paratha', pronunciation: 'parontha', example: 'ਮੱਖਣ ਵਾਲਾ ਪਰੌਂਠਾ' },
      { word: 'ਲੱਸੀ', translation: 'Lassi', pronunciation: 'lassi', example: 'ਮਿੱਠੀ ਪੰਜਾਬੀ ਲੱਸੀ' },
    ],
    exercises: [
      {
        type: 'multiple-choice',
        prompt: 'What does "ਚਾਹ" mean?',
        options: ['Tea', 'Milk', 'Food', 'Water'],
        correctAnswer: 'Tea',
        xp: 10,
      },
      {
        type: 'speaking',
        prompt: 'Say: "ਇੱਕ ਗਲਾਸ ਲੱਸੀ ਦਿਓ" (Give one glass of lassi)',
        targetWord: 'ਇੱਕ ਗਲਾਸ ਲੱਸੀ ਦਿਓ',
        pronunciation: 'ikk glass lassi dio',
        correctAnswer: 'ਇੱਕ ਗਲਾਸ ਲੱਸੀ ਦਿਓ',
        xp: 15,
      },
      {
        type: 'matching',
        prompt: 'Match food vocabulary',
        pairs: [
          { word: 'ਖਾਣਾ', meaning: 'Food' },
          { word: 'ਚਾਹ', meaning: 'Tea' },
          { word: 'ਦੁੱਧ', meaning: 'Milk' },
          { word: 'ਲੱਸੀ', meaning: 'Lassi' },
        ],
        xp: 20,
      },
    ],
  },

  // UNIT 4: FAMILY & RELATIONS
  {
    id: 'pa-family',
    name: 'Family & Relations',
    nameNative: 'ਪਰਿਵਾਰ ਤੇ ਰਿਸ਼ਤੇਦਾਰੀ',
    unit: 'Unit 4: Family & Relations',
    order: 5,
    vocabulary: [
      { word: 'ਮਾਂ', translation: 'Mother', pronunciation: 'maan', example: 'ਮੇਰੀ ਪਿਆਰੀ ਮਾਂ' },
      { word: 'ਪਿਤਾ', translation: 'Father', pronunciation: 'pita', example: 'ਮੇਰੇ ਪਿਤਾ ਜੀ' },
      { word: 'ਵੀਰ', translation: 'Brother', pronunciation: 'veer', example: 'ਮੇਰਾ ਵੱਡਾ ਵੀਰ' },
      { word: 'ਭੈਣ', translation: 'Sister', pronunciation: 'bhein', example: 'ਮੇਰੀ ਛੋਟੀ ਭੈਣ' },
      { word: 'ਪਰਿਵਾਰ', translation: 'Family', pronunciation: 'parivaar', example: 'ਸਾਡਾ ਪਰਿਵਾਰ' },
    ],
    exercises: [
      {
        type: 'multiple-choice',
        prompt: 'What does "ਮਾਂ" mean?',
        options: ['Mother', 'Father', 'Sister', 'Brother'],
        correctAnswer: 'Mother',
        xp: 10,
      },
      {
        type: 'listening',
        prompt: 'Listen and select what you hear',
        audioText: 'ਵੀਰ',
        options: ['ਮਾਂ', 'ਪਿਤਾ', 'ਵੀਰ', 'ਭੈਣ'],
        correctAnswer: 'ਵੀਰ',
        xp: 15,
      },
      {
        type: 'matching',
        prompt: 'Match Punjabi family relations',
        pairs: [
          { word: 'ਮਾਂ', meaning: 'Mother' },
          { word: 'ਪਿਤਾ', meaning: 'Father' },
          { word: 'ਵੀਰ', meaning: 'Brother' },
          { word: 'ਭੈਣ', meaning: 'Sister' },
        ],
        xp: 20,
      },
    ],
  },

  // UNIT 5: TRAVEL & DIRECTIONS
  {
    id: 'pa-travel',
    name: 'Travel & Directions',
    nameNative: 'ਸਫ਼ਰ ਅਤੇ ਰਸਤੇ',
    unit: 'Unit 5: Travel & Places',
    order: 6,
    vocabulary: [
      { word: 'ਕਿੱਥੇ', translation: 'Where', pronunciation: 'kitthe', example: 'ਸਟੇਸ਼ਨ ਕਿੱਥੇ ਹੈ?' },
      { word: 'ਸੜਕ', translation: 'Road / Street', pronunciation: 'sadak', example: 'ਸਿੱਧੀ ਸੜਕ' },
      { word: 'ਬਜ਼ਾਰ', translation: 'Market', pronunciation: 'bazaar', example: 'ਬਜ਼ਾਰ ਨੇੜੇ ਹੈ' },
      { word: 'ਸ਼ਹਿਰ', translation: 'City', pronunciation: 'shahar', example: 'ਸੋਹਣਾ ਸ਼ਹਿਰ' },
      { word: 'ਸੱਜੇ', translation: 'Right side', pronunciation: 'sajje', example: 'ਸੱਜੇ ਮੁੜੋ' },
      { word: 'ਖੱਬੇ', translation: 'Left side', pronunciation: 'khabbe', example: 'ਖੱਬੇ ਮੁੜੋ' },
    ],
    exercises: [
      {
        type: 'multiple-choice',
        prompt: 'What does "ਕਿੱਥੇ" mean?',
        options: ['Where', 'When', 'Why', 'How'],
        correctAnswer: 'Where',
        xp: 10,
      },
      {
        type: 'sentence-order',
        prompt: 'Arrange: "Where is the station?"',
        sentence: 'ਸਟੇਸ਼ਨ ਕਿੱਥੇ ਹੈ',
        words: ['ਹੈ', 'ਸਟੇਸ਼ਨ', 'ਕਿੱਥੇ'],
        correctAnswer: 'ਸਟੇਸ਼ਨ ਕਿੱਥੇ ਹੈ',
        xp: 15,
      },
      {
        type: 'matching',
        prompt: 'Match travel terms',
        pairs: [
          { word: 'ਕਿੱਥੇ', meaning: 'Where' },
          { word: 'ਸੜਕ', meaning: 'Road' },
          { word: 'ਸੱਜੇ', meaning: 'Right side' },
          { word: 'ਖੱਬੇ', meaning: 'Left side' },
        ],
        xp: 20,
      },
    ],
  },

  // UNIT 6: SHOPPING & BAZAARS
  {
    id: 'pa-shopping',
    name: 'Shopping & Bargaining',
    nameNative: 'ਖਰੀਦਦਾਰੀ ਤੇ ਮੁੱਲ ਤੋਲ',
    unit: 'Unit 6: Shopping & Bazaars',
    order: 7,
    vocabulary: [
      { word: 'ਮੁੱਲ', translation: 'Price / Cost', pronunciation: 'mull', example: 'ਇਸਦਾ ਮੁੱਲ ਕਿੰਨਾ ਹੈ?' },
      { word: 'ਰੁਪਏ', translation: 'Rupees', pronunciation: 'rupaye', example: 'ਸੌ ਰੁਪਏ' },
      { word: 'ਮਹਿੰਗਾ', translation: 'Expensive', pronunciation: 'mehanga', example: 'ਇਹ ਬਹੁਤ ਮਹਿੰਗਾ ਹੈ' },
      { word: 'ਸਸਤਾ', translation: 'Cheap / Affordable', pronunciation: 'sasta', example: 'ਸਸਤਾ ਸਮਾਨ' },
      { word: 'ਦੁਕਾਨ', translation: 'Shop', pronunciation: 'dukaan', example: 'ਕੱਪੜਿਆਂ ਦੀ ਦੁਕਾਨ' },
    ],
    exercises: [
      {
        type: 'multiple-choice',
        prompt: 'What does "ਮੁੱਲ" mean?',
        options: ['Price', 'Shop', 'Money', 'Clothes'],
        correctAnswer: 'Price',
        xp: 10,
      },
      {
        type: 'speaking',
        prompt: 'Say: "ਮੁੱਲ ਕਿੰਨਾ ਹੈ" (What is the price?)',
        targetWord: 'ਮੁੱਲ ਕਿੰਨਾ ਹੈ',
        pronunciation: 'mull kinna hai',
        correctAnswer: 'ਮੁੱਲ ਕਿੰਨਾ ਹੈ',
        xp: 15,
      },
      {
        type: 'matching',
        prompt: 'Match shopping vocabulary',
        pairs: [
          { word: 'ਮੁੱਲ', meaning: 'Price' },
          { word: 'ਮਹਿੰਗਾ', meaning: 'Expensive' },
          { word: 'ਸਸਤਾ', meaning: 'Cheap' },
          { word: 'ਦੁਕਾਨ', meaning: 'Shop' },
        ],
        xp: 20,
      },
    ],
  },

  // UNIT 7: HEALTH & EMERGENCY
  {
    id: 'pa-health',
    name: 'Health & Medical Assistance',
    nameNative: 'ਸਿਹਤ ਅਤੇ ਇਲਾਜ',
    unit: 'Unit 7: Health & Wellness',
    order: 8,
    vocabulary: [
      { word: 'ਡਾਕਟਰ', translation: 'Doctor', pronunciation: 'doctor', example: 'ਡਾਕਟਰ ਨੂੰ ਬੁਲਾਓ' },
      { word: 'ਦਵਾਈ', translation: 'Medicine', pronunciation: 'dawaii', example: 'ਸਮੇਂ ਸਿਰ ਦਵਾਈ ਲਵੋ' },
      { word: 'ਹਸਪਤਾਲ', translation: 'Hospital', pronunciation: 'haspataal', example: 'ਵੱਡਾ ਹਸਪਤਾਲ' },
      { word: 'ਦਰਦ', translation: 'Pain', pronunciation: 'dard', example: 'ਸਿਰ ਵਿੱਚ ਦਰਦ ਹੈ' },
      { word: 'ਮਦਦ', translation: 'Help', pronunciation: 'madad', example: 'ਕਿਰਪਾ ਕਰਕੇ ਮਦਦ ਕਰੋ' },
    ],
    exercises: [
      {
        type: 'multiple-choice',
        prompt: 'What does "ਦਵਾਈ" mean?',
        options: ['Medicine', 'Doctor', 'Hospital', 'Help'],
        correctAnswer: 'Medicine',
        xp: 10,
      },
      {
        type: 'fill-blank',
        prompt: 'Complete: "ਕਿਰਪਾ ਕਰਕੇ ___ ਕਰੋ" (Please help)',
        options: ['ਮਦਦ', 'ਦਵਾਈ', 'ਡਾਕਟਰ', 'ਦਰਦ'],
        correctAnswer: 'ਮਦਦ',
        xp: 15,
      },
      {
        type: 'matching',
        prompt: 'Match health terms',
        pairs: [
          { word: 'ਡਾਕਟਰ', meaning: 'Doctor' },
          { word: 'ਦਵਾਈ', meaning: 'Medicine' },
          { word: 'ਹਸਪਤਾਲ', meaning: 'Hospital' },
          { word: 'ਮਦਦ', meaning: 'Help' },
        ],
        xp: 20,
      },
    ],
  },

  // UNIT 8: WORK & PROFESSIONAL LIFE
  {
    id: 'pa-work',
    name: 'Work & Professional Life',
    nameNative: 'ਕੰਮਕਾਜ ਅਤੇ ਦਫ਼ਤਰ',
    unit: 'Unit 8: Work & Professional',
    order: 9,
    vocabulary: [
      { word: 'ਕੰਮ', translation: 'Work / Job', pronunciation: 'kamm', example: 'ਅੱਜ ਬਹੁਤ ਕੰਮ ਹੈ' },
      { word: 'ਦਫ਼ਤਰ', translation: 'Office', pronunciation: 'daftar', example: 'ਦਫ਼ਤਰ ਦਾ ਸਮਾਂ' },
      { word: 'ਮੀਟਿੰਗ', translation: 'Meeting', pronunciation: 'meeting', example: 'ਜ਼ਰੂਰੀ ਮੀਟਿੰਗ' },
      { word: 'ਸਮਾਂ', translation: 'Time', pronunciation: 'samaan', example: 'ਸਹੀ ਸਮੇਂ ਤੇ ਪਹੁੰਚੋ' },
      { word: 'ਸੁਨੇਹਾ', translation: 'Message', pronunciation: 'suneha', example: 'ਸੁਨੇਹਾ ਭੇਜੋ' },
    ],
    exercises: [
      {
        type: 'multiple-choice',
        prompt: 'What does "ਦਫ਼ਤਰ" mean?',
        options: ['Office', 'Meeting', 'Time', 'Message'],
        correctAnswer: 'Office',
        xp: 10,
      },
      {
        type: 'matching',
        prompt: 'Match professional terms',
        pairs: [
          { word: 'ਕੰਮ', meaning: 'Work' },
          { word: 'ਦਫ਼ਤਰ', meaning: 'Office' },
          { word: 'ਮੀਟਿੰਗ', meaning: 'Meeting' },
          { word: 'ਸਮਾਂ', meaning: 'Time' },
        ],
        xp: 20,
      },
    ],
  },

  // UNIT 9: CULTURE & CELEBRATIONS
  {
    id: 'pa-festivals',
    name: 'Festivals & Punjabi Culture',
    nameNative: 'ਤਿਉਹਾਰ ਅਤੇ ਪੰਜਾਬੀ ਸੱਭਿਆਚਾਰ',
    unit: 'Unit 9: Culture & Celebrations',
    order: 10,
    vocabulary: [
      { word: 'ਤਿਉਹਾਰ', translation: 'Festival', pronunciation: 'tiuhaar', example: 'ਵਿਸਾਖੀ ਦਾ ਤਿਉਹਾਰ' },
      { word: 'ਵਧਾਈਆਂ', translation: 'Congratulations / Wishes', pronunciation: 'vadhaaiyaan', example: 'ਲੋਹੜੀ ਦੀਆਂ ਲੱਖ ਲੱਖ ਵਧਾਈਆਂ' },
      { word: 'ਖੁਸ਼ੀ', translation: 'Happiness / Joy', pronunciation: 'khushi', example: 'ਬਹੁਤ ਖੁਸ਼ੀ ਹੋਈ' },
      { word: 'ਭੰਗੜਾ', translation: 'Bhangra Dance', pronunciation: 'bhangra', example: 'ਪੰਜਾਬ ਦਾ ਪ੍ਰਸਿੱਧ ਭੰਗੜਾ' },
      { word: 'ਸੰਗੀਤ', translation: 'Music', pronunciation: 'sangeet', example: 'ਲੋਕ ਸੰਗੀਤ' },
    ],
    exercises: [
      {
        type: 'multiple-choice',
        prompt: 'What does "ਤਿਉਹਾਰ" mean?',
        options: ['Festival', 'Music', 'Dance', 'Congratulations'],
        correctAnswer: 'Festival',
        xp: 10,
      },
      {
        type: 'speaking',
        prompt: 'Say: "ਬਹੁਤ ਬਹੁਤ ਵਧਾਈਆਂ" (Hearty Congratulations)',
        targetWord: 'ਬਹੁਤ ਬਹੁਤ ਵਧਾਈਆਂ',
        pronunciation: 'bahut bahut vadhaaiyaan',
        correctAnswer: 'ਬਹੁਤ ਬਹੁਤ ਵਧਾਈਆਂ',
        xp: 15,
      },
      {
        type: 'matching',
        prompt: 'Match cultural vocabulary',
        pairs: [
          { word: 'ਤਿਉਹਾਰ', meaning: 'Festival' },
          { word: 'ਵਧਾਈਆਂ', meaning: 'Congratulations' },
          { word: 'ਖੁਸ਼ੀ', meaning: 'Happiness' },
          { word: 'ਭੰਗੜਾ', meaning: 'Bhangra Dance' },
        ],
        xp: 20,
      },
    ],
  },

  // UNIT 10: FLUENCY & IDIOMS
  {
    id: 'pa-mastery',
    name: 'Fluency & Punjabi Akhana (Muhavare)',
    nameNative: 'ਅਖਾਣ ਅਤੇ ਮੁਹਾਰਤ',
    unit: 'Unit 10: Fluency & Mastery',
    order: 11,
    vocabulary: [
      { word: 'ਆਪੇ ਫਾਥੜੀਏ ਤੈਨੂੰ ਕੌਣ ਛੁਡਾਵੇ', translation: 'You reap what you sow / Caught in your own trap', pronunciation: 'aape faathariye tainu kaun chhudaave', example: 'ਗਲਤੀ ਆਪਣੀ ਸੀ, ਆਪੇ ਫਾਥੜੀਏ ਤੈਨੂੰ ਕੌਣ ਛੁਡਾਵੇ' },
      { word: 'ਡੁੱਲ੍ਹੇ ਬੇਰਾਂ ਦਾ ਕੁਝ ਨਹੀਂ ਵਿਗੜਿਆ', translation: 'It is never too late to mend', pronunciation: 'dullhe beraan da kujh nahin vigreya', example: 'ਹਿੰਮਤ ਨਾ ਹਾਰੋ, ਡੁੱਲ੍ਹੇ ਬੇਰਾਂ ਦਾ ਕੁਝ ਨਹੀਂ ਵਿਗੜਿਆ' },
      { word: 'ਇੱਕ ਹੱਥ ਨਾਲ ਤਾੜੀ ਨਹੀਂ ਵੱਜਦੀ', translation: 'It takes two to make a quarrel', pronunciation: 'ikk hath naal taadi nahin vajjdi', example: 'ਦੋਵੇਂ ਪਾਸੇ ਸਮਝੌਤਾ ਚਾਹੀਦਾ ਹੈ, ਇੱਕ ਹੱਥ ਨਾਲ ਤਾੜੀ ਨਹੀਂ ਵੱਜਦੀ' },
    ],
    exercises: [
      {
        type: 'multiple-choice',
        prompt: 'What does the proverb "ਇੱਕ ਹੱਥ ਨਾਲ ਤਾੜੀ ਨਹੀਂ ਵੱਜਦੀ" mean?',
        options: ['It takes two to quarrel/clap', 'Hands are strong', 'Clap loudly', 'Work fast'],
        correctAnswer: 'It takes two to quarrel/clap',
        xp: 15,
      },
      {
        type: 'reading',
        prompt: 'Read this Punjabi passage and answer:',
        passage: 'ਗੁਰਪ੍ਰੀਤ ਅੰਮ੍ਰਿਤਸਰ ਵਿੱਚ ਸ੍ਰੀ ਹਰਿਮੰਦਰ ਸਾਹਿਬ ਦੇ ਦਰਸ਼ਨ ਕਰਨ ਗਿਆ। ਉੱਥੇ ਗੁਰਬਾਣੀ ਸੁਣ ਕੇ ਅਤੇ ਲੰਗਰ ਛਕ ਕੇ ਉਸਨੂੰ ਬੜਾ ਆਤਮਿਕ ਸੁੱਖ ਮਿਲਿਆ।',
        question: 'Which holy place did Gurpreet visit in Amritsar?',
        options: ['Sri Harmandir Sahib / Golden Temple (ਸ੍ਰੀ ਹਰਿਮੰਦਰ ਸਾਹਿਬ)', 'Jallianwala Bagh', 'Wagah Border', 'Qila Gobindgarh'],
        correctAnswer: 'Sri Harmandir Sahib / Golden Temple (ਸ੍ਰੀ ਹਰਿਮੰਦਰ ਸਾਹਿਬ)',
        xp: 20,
      },
      {
        type: 'matching',
        prompt: 'Match Punjabi proverbs with meanings',
        pairs: [
          { word: 'ਇੱਕ ਹੱਥ ਨਾਲ ਤਾੜੀ ਨਹੀਂ ਵੱਜਦੀ', meaning: 'It takes two to tango' },
          { word: 'ਡੁੱਲ੍ਹੇ ਬੇਰਾਂ ਦਾ ਕੁਝ ਨਹੀਂ ਵਿਗੜਿਆ', meaning: 'Never too late to mend' },
        ],
        xp: 25,
      },
    ],
  },
]
