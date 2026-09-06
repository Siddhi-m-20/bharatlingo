export const englishLessons = [
  // UNIT 1: FUNDAMENTALS & ESSENTIALS
  {
    id: 'en-greetings',
    name: 'Greetings & Salutations',
    nameNative: 'Greetings & Salutations',
    unit: 'Unit 1: Fundamentals',
    order: 1,
    vocabulary: [
      { word: 'Hello', translation: 'Hello / Greetings', pronunciation: 'hello', example: 'Hello, how are you today?' },
      { word: 'Thank you', translation: 'Thank you', pronunciation: 'thank you', example: 'Thank you very much for your kind help.' },
      { word: 'Please', translation: 'Please', pronunciation: 'please', example: 'Please take a seat.' },
      { word: 'Good morning', translation: 'Good morning', pronunciation: 'good morning', example: 'Good morning, have a wonderful day.' },
      { word: 'Goodbye', translation: 'Goodbye', pronunciation: 'goodbye', example: 'Goodbye, see you again tomorrow!' },
    ],
    exercises: [
      {
        type: 'multiple-choice',
        prompt: 'What does "Hello" mean?',
        options: ['Greeting / Salutation', 'Goodbye', 'Thank you', 'Please'],
        correctAnswer: 'Greeting / Salutation',
        xp: 10,
      },
      {
        type: 'listening',
        prompt: 'Listen to the audio and select what you hear',
        audioText: 'Thank you',
        options: ['Hello', 'Thank you', 'Please', 'Goodbye'],
        correctAnswer: 'Thank you',
        xp: 15,
      },
      {
        type: 'speaking',
        prompt: 'Say this polite phrase aloud: "Thank you"',
        targetWord: 'Thank you',
        pronunciation: 'thank you',
        correctAnswer: 'Thank you',
        xp: 15,
      },
      {
        type: 'translation',
        prompt: 'Translate "Hello" to English',
        correctAnswer: 'Hello',
        wordBank: ['Hello', 'Please', 'Thank you', 'Yes'],
        xp: 15,
      },
      {
        type: 'matching',
        prompt: 'Match English greetings with meanings',
        pairs: [
          { word: 'Hello', meaning: 'Greeting' },
          { word: 'Thank you', meaning: 'Expression of gratitude' },
          { word: 'Please', meaning: 'Polite request' },
          { word: 'Goodbye', meaning: 'Parting phrase' },
        ],
        xp: 20,
      },
    ],
  },
  {
    id: 'en-everyday',
    name: 'Everyday Essentials',
    nameNative: 'Everyday Essentials',
    unit: 'Unit 1: Fundamentals',
    order: 2,
    vocabulary: [
      { word: 'Water', translation: 'Water', pronunciation: 'water', example: 'I would like a glass of water.' },
      { word: 'Home', translation: 'Home / House', pronunciation: 'home', example: 'This is my home.' },
      { word: 'Friend', translation: 'Friend', pronunciation: 'friend', example: 'He is my best friend.' },
      { word: 'Book', translation: 'Book', pronunciation: 'book', example: 'I love reading books.' },
      { word: 'Yes', translation: 'Yes', pronunciation: 'yes', example: 'Yes, I am ready.' },
      { word: 'No', translation: 'No', pronunciation: 'no', example: 'No, thank you.' },
    ],
    exercises: [
      {
        type: 'multiple-choice',
        prompt: 'What does "Water" mean?',
        options: ['Water', 'Home', 'Friend', 'Book'],
        correctAnswer: 'Water',
        xp: 10,
      },
      {
        type: 'sentence-order',
        prompt: 'Arrange words: "This is my home"',
        sentence: 'This is my home',
        words: ['home', 'This', 'my', 'is'],
        correctAnswer: 'This is my home',
        xp: 15,
      },
      {
        type: 'matching',
        prompt: 'Match basic vocabulary',
        pairs: [
          { word: 'Water', meaning: 'Drinkable liquid' },
          { word: 'Home', meaning: 'Place of living' },
          { word: 'Friend', meaning: 'Companion' },
          { word: 'Book', meaning: 'Reading material' },
        ],
        xp: 20,
      },
    ],
  },

  // UNIT 2: NUMBERS & DAILY LIFE
  {
    id: 'en-numbers',
    name: 'Numbers 1 to 10',
    nameNative: 'Numbers 1 to 10',
    unit: 'Unit 2: Daily Life',
    order: 3,
    vocabulary: [
      { word: 'One', translation: 'One (1)', pronunciation: 'one', example: 'One cup of tea.' },
      { word: 'Two', translation: 'Two (2)', pronunciation: 'two', example: 'Two train tickets.' },
      { word: 'Three', translation: 'Three (3)', pronunciation: 'three', example: 'Three friends.' },
      { word: 'Four', translation: 'Four (4)', pronunciation: 'four', example: 'Four rooms.' },
      { word: 'Five', translation: 'Five (5)', pronunciation: 'five', example: 'Five minutes.' },
      { word: 'Ten', translation: 'Ten (10)', pronunciation: 'ten', example: 'Ten rupees.' },
    ],
    exercises: [
      {
        type: 'multiple-choice',
        prompt: 'What is the number "Five"?',
        options: ['5', '2', '3', '10'],
        correctAnswer: '5',
        xp: 10,
      },
      {
        type: 'fill-blank',
        prompt: 'Sequence: One, Two, ___ , Four',
        options: ['Three', 'Five', 'Ten', 'Six'],
        correctAnswer: 'Three',
        xp: 15,
      },
      {
        type: 'matching',
        prompt: 'Match words with digits',
        pairs: [
          { word: 'One', meaning: '1' },
          { word: 'Two', meaning: '2' },
          { word: 'Three', meaning: '3' },
          { word: 'Ten', meaning: '10' },
        ],
        xp: 20,
      },
    ],
  },

  // UNIT 3: FOOD & DINING
  {
    id: 'en-food',
    name: 'Food & Dining Out',
    nameNative: 'Food & Dining Out',
    unit: 'Unit 3: Food & Dining',
    order: 4,
    vocabulary: [
      { word: 'Food', translation: 'Food / Meal', pronunciation: 'food', example: 'The food is very delicious.' },
      { word: 'Tea', translation: 'Tea', pronunciation: 'tea', example: 'Hot masala tea.' },
      { word: 'Milk', translation: 'Milk', pronunciation: 'milk', example: 'Fresh milk.' },
      { word: 'Bread', translation: 'Bread / Roti', pronunciation: 'bread', example: 'Toasted bread.' },
      { word: 'Rice', translation: 'Rice', pronunciation: 'rice', example: 'Steamed rice with curry.' },
      { word: 'Dessert', translation: 'Dessert / Sweet', pronunciation: 'dessert', example: 'Sweet dessert after dinner.' },
    ],
    exercises: [
      {
        type: 'multiple-choice',
        prompt: 'What does "Tea" mean?',
        options: ['Tea', 'Milk', 'Rice', 'Water'],
        correctAnswer: 'Tea',
        xp: 10,
      },
      {
        type: 'speaking',
        prompt: 'Say: "One cup of tea, please"',
        targetWord: 'One cup of tea, please',
        pronunciation: 'one cup of tea please',
        correctAnswer: 'One cup of tea, please',
        xp: 15,
      },
      {
        type: 'matching',
        prompt: 'Match dining vocabulary',
        pairs: [
          { word: 'Food', meaning: 'Meal' },
          { word: 'Tea', meaning: 'Hot beverage' },
          { word: 'Rice', meaning: 'Grain staple' },
          { word: 'Dessert', meaning: 'Sweet dish' },
        ],
        xp: 20,
      },
    ],
  },

  // UNIT 4: FAMILY & RELATIONS
  {
    id: 'en-family',
    name: 'Family & Relationships',
    nameNative: 'Family & Relationships',
    unit: 'Unit 4: Family & Relations',
    order: 5,
    vocabulary: [
      { word: 'Mother', translation: 'Mother', pronunciation: 'mother', example: 'My caring mother.' },
      { word: 'Father', translation: 'Father', pronunciation: 'father', example: 'My respectful father.' },
      { word: 'Brother', translation: 'Brother', pronunciation: 'brother', example: 'My elder brother.' },
      { word: 'Sister', translation: 'Sister', pronunciation: 'sister', example: 'My younger sister.' },
      { word: 'Family', translation: 'Family', pronunciation: 'family', example: 'Our happy family.' },
    ],
    exercises: [
      {
        type: 'multiple-choice',
        prompt: 'What does "Mother" mean?',
        options: ['Mother', 'Father', 'Sister', 'Brother'],
        correctAnswer: 'Mother',
        xp: 10,
      },
      {
        type: 'listening',
        prompt: 'Listen and select what you hear',
        audioText: 'Family',
        options: ['Mother', 'Father', 'Brother', 'Family'],
        correctAnswer: 'Family',
        xp: 15,
      },
      {
        type: 'matching',
        prompt: 'Match family relations',
        pairs: [
          { word: 'Mother', meaning: 'Female parent' },
          { word: 'Father', meaning: 'Male parent' },
          { word: 'Brother', meaning: 'Male sibling' },
          { word: 'Sister', meaning: 'Female sibling' },
        ],
        xp: 20,
      },
    ],
  },

  // UNIT 5: TRAVEL & DIRECTIONS
  {
    id: 'en-travel',
    name: 'Travel & Directions',
    nameNative: 'Travel & Directions',
    unit: 'Unit 5: Travel & Places',
    order: 6,
    vocabulary: [
      { word: 'Where', translation: 'Where', pronunciation: 'where', example: 'Where is the railway station?' },
      { word: 'Street', translation: 'Street / Road', pronunciation: 'street', example: 'Straight down the street.' },
      { word: 'Market', translation: 'Market', pronunciation: 'market', example: 'The local market is nearby.' },
      { word: 'City', translation: 'City', pronunciation: 'city', example: 'A bustling metropolitan city.' },
      { word: 'Right', translation: 'Right side', pronunciation: 'right', example: 'Turn right at the junction.' },
      { word: 'Left', translation: 'Left side', pronunciation: 'left', example: 'Turn left after the bridge.' },
    ],
    exercises: [
      {
        type: 'multiple-choice',
        prompt: 'What does "Where" mean?',
        options: ['Asking for location', 'Asking for time', 'Asking for reason', 'Greeting'],
        correctAnswer: 'Asking for location',
        xp: 10,
      },
      {
        type: 'sentence-order',
        prompt: 'Arrange: "Where is the station?"',
        sentence: 'Where is the station',
        words: ['station', 'Where', 'the', 'is'],
        correctAnswer: 'Where is the station',
        xp: 15,
      },
      {
        type: 'matching',
        prompt: 'Match directions and travel terms',
        pairs: [
          { word: 'Where', meaning: 'Location question' },
          { word: 'Street', meaning: 'Roadway' },
          { word: 'Right', meaning: 'Right direction' },
          { word: 'Left', meaning: 'Left direction' },
        ],
        xp: 20,
      },
    ],
  },

  // UNIT 6: SHOPPING & BAZAARS
  {
    id: 'en-shopping',
    name: 'Shopping & Transactions',
    nameNative: 'Shopping & Transactions',
    unit: 'Unit 6: Shopping & Bazaars',
    order: 7,
    vocabulary: [
      { word: 'Price', translation: 'Price / Cost', pronunciation: 'price', example: 'What is the price of this?' },
      { word: 'Rupees', translation: 'Rupees / Currency', pronunciation: 'rupees', example: 'One hundred rupees.' },
      { word: 'Expensive', translation: 'Expensive', pronunciation: 'expensive', example: 'This watch is very expensive.' },
      { word: 'Affordable', translation: 'Affordable / Cheap', pronunciation: 'affordable', example: 'An affordable quality item.' },
      { word: 'Store', translation: 'Store / Shop', pronunciation: 'store', example: 'Book store.' },
    ],
    exercises: [
      {
        type: 'multiple-choice',
        prompt: 'What does "Expensive" mean?',
        options: ['High in cost', 'Low in cost', 'Free', 'Broken'],
        correctAnswer: 'High in cost',
        xp: 10,
      },
      {
        type: 'speaking',
        prompt: 'Say: "How much does this cost?"',
        targetWord: 'How much does this cost',
        pronunciation: 'how much does this cost',
        correctAnswer: 'How much does this cost',
        xp: 15,
      },
      {
        type: 'matching',
        prompt: 'Match commerce terms',
        pairs: [
          { word: 'Price', meaning: 'Cost of item' },
          { word: 'Expensive', meaning: 'High cost' },
          { word: 'Affordable', meaning: 'Reasonable cost' },
          { word: 'Store', meaning: 'Shop' },
        ],
        xp: 20,
      },
    ],
  },

  // UNIT 7: HEALTH & EMERGENCY
  {
    id: 'en-health',
    name: 'Health & Medical Assistance',
    nameNative: 'Health & Medical Assistance',
    unit: 'Unit 7: Health & Wellness',
    order: 8,
    vocabulary: [
      { word: 'Doctor', translation: 'Doctor', pronunciation: 'doctor', example: 'Please consult a doctor.' },
      { word: 'Medicine', translation: 'Medicine', pronunciation: 'medicine', example: 'Take your medicine on time.' },
      { word: 'Hospital', translation: 'Hospital', pronunciation: 'hospital', example: 'The nearest hospital.' },
      { word: 'Pain', translation: 'Pain', pronunciation: 'pain', example: 'I have a headache.' },
      { word: 'Help', translation: 'Help', pronunciation: 'help', example: 'Please help me.' },
    ],
    exercises: [
      {
        type: 'multiple-choice',
        prompt: 'What does "Doctor" mean?',
        options: ['Medical physician', 'Hospital', 'Medicine', 'Nurse'],
        correctAnswer: 'Medical physician',
        xp: 10,
      },
      {
        type: 'fill-blank',
        prompt: 'Complete: "Please ___ me" (Asking for assistance)',
        options: ['help', 'call', 'doctor', 'pain'],
        correctAnswer: 'help',
        xp: 15,
      },
      {
        type: 'matching',
        prompt: 'Match medical terms',
        pairs: [
          { word: 'Doctor', meaning: 'Physician' },
          { word: 'Medicine', meaning: 'Pharmaceutical remedy' },
          { word: 'Hospital', meaning: 'Medical facility' },
          { word: 'Help', meaning: 'Assistance' },
        ],
        xp: 20,
      },
    ],
  },

  // UNIT 8: WORK & PROFESSIONAL LIFE
  {
    id: 'en-work',
    name: 'Work & Professional Life',
    nameNative: 'Work & Professional Life',
    unit: 'Unit 8: Work & Professional',
    order: 9,
    vocabulary: [
      { word: 'Work', translation: 'Work / Job', pronunciation: 'work', example: 'Productive work today.' },
      { word: 'Office', translation: 'Office', pronunciation: 'office', example: 'Office work hours.' },
      { word: 'Meeting', translation: 'Meeting', pronunciation: 'meeting', example: 'An important client meeting.' },
      { word: 'Time', translation: 'Time', pronunciation: 'time', example: 'Punctuality on time.' },
      { word: 'Email', translation: 'Email / Message', pronunciation: 'email', example: 'Send an email update.' },
    ],
    exercises: [
      {
        type: 'multiple-choice',
        prompt: 'What does "Meeting" mean?',
        options: ['Gathering for discussion', 'Holiday', 'Lunch', 'Phone call'],
        correctAnswer: 'Gathering for discussion',
        xp: 10,
      },
      {
        type: 'matching',
        prompt: 'Match workplace vocabulary',
        pairs: [
          { word: 'Work', meaning: 'Job / Task' },
          { word: 'Office', meaning: 'Workplace' },
          { word: 'Meeting', meaning: 'Discussion session' },
          { word: 'Time', meaning: 'Schedule' },
        ],
        xp: 20,
      },
    ],
  },

  // UNIT 9: CULTURE & CELEBRATIONS
  {
    id: 'en-festivals',
    name: 'Festivals & Celebrations',
    nameNative: 'Festivals & Celebrations',
    unit: 'Unit 9: Culture & Celebrations',
    order: 10,
    vocabulary: [
      { word: 'Festival', translation: 'Festival', pronunciation: 'festival', example: 'A vibrant cultural festival.' },
      { word: 'Congratulations', translation: 'Congratulations', pronunciation: 'congratulations', example: 'Heartiest congratulations on your achievement!' },
      { word: 'Celebration', translation: 'Celebration', pronunciation: 'celebration', example: 'Joyous celebration.' },
      { word: 'Music', translation: 'Music', pronunciation: 'music', example: 'Melodious classical music.' },
      { word: 'Tradition', translation: 'Tradition', pronunciation: 'tradition', example: 'Rich historical traditions.' },
    ],
    exercises: [
      {
        type: 'multiple-choice',
        prompt: 'What does "Festival" mean?',
        options: ['Celebration / Cultural event', 'Office meeting', 'Exam', 'Travel route'],
        correctAnswer: 'Celebration / Cultural event',
        xp: 10,
      },
      {
        type: 'speaking',
        prompt: 'Say: "Heartiest congratulations"',
        targetWord: 'Heartiest congratulations',
        pronunciation: 'heartiest congratulations',
        correctAnswer: 'Heartiest congratulations',
        xp: 15,
      },
      {
        type: 'matching',
        prompt: 'Match culture terms',
        pairs: [
          { word: 'Festival', meaning: 'Celebration event' },
          { word: 'Congratulations', meaning: 'Praise for success' },
          { word: 'Music', meaning: 'Harmonic melody' },
          { word: 'Tradition', meaning: 'Customary heritage' },
        ],
        xp: 20,
      },
    ],
  },

  // UNIT 10: FLUENCY & IDIOMS
  {
    id: 'en-mastery',
    name: 'Fluency & English Idioms',
    nameNative: 'Fluency & English Idioms',
    unit: 'Unit 10: Fluency & Mastery',
    order: 11,
    vocabulary: [
      { word: 'Piece of cake', translation: 'Very easy task', pronunciation: 'piece of cake', example: 'This exam was a piece of cake!' },
      { word: 'Once in a blue moon', translation: 'Rarely / Infrequently', pronunciation: 'once in a blue moon', example: 'I only eat junk food once in a blue moon.' },
      { word: 'Actions speak louder than words', translation: 'What you do matters more than what you say', pronunciation: 'actions speak louder than words', example: 'Do not just promise, actions speak louder than words.' },
    ],
    exercises: [
      {
        type: 'multiple-choice',
        prompt: 'What does the idiom "Piece of cake" mean?',
        options: ['Very easy task', 'Delicious dessert', 'Difficult problem', 'Birthday party'],
        correctAnswer: 'Very easy task',
        xp: 15,
      },
      {
        type: 'reading',
        prompt: 'Read this short passage and answer:',
        passage: 'Maya prepared for the regional debate championship for three months. Her dedication paid off when she was awarded the first prize.',
        question: 'Why did Maya win the first prize?',
        options: ['Her dedication and preparation for three months', 'She was lucky', 'She didn’t attend', 'She baked a cake'],
        correctAnswer: 'Her dedication and preparation for three months',
        xp: 20,
      },
      {
        type: 'matching',
        prompt: 'Match English idioms with meanings',
        pairs: [
          { word: 'Piece of cake', meaning: 'Very easy' },
          { word: 'Once in a blue moon', meaning: 'Very rarely' },
        ],
        xp: 25,
      },
    ],
  },
]
