export const teluguLessons = [
  // UNIT 1: FUNDAMENTALS & ESSENTIALS
  {
    id: 'te-greetings',
    name: 'Greetings & Salutations',
    nameNative: 'నమస్కారం మరియు మర్యాదలు',
    unit: 'Unit 1: Fundamentals',
    order: 1,
    vocabulary: [
      { word: 'నమస్కారం', translation: 'Hello / Greetings', pronunciation: 'namaskaram', example: 'నమస్కారం, మీరు ఎలా ఉన్నారు?' },
      { word: 'ధన్యవాదాలు', translation: 'Thank you', pronunciation: 'dhanyavaadaalu', example: 'మీ సహాయానికి ధన్యవాదాలు' },
      { word: 'దయచేసి', translation: 'Please', pronunciation: 'dayachesi', example: 'దయచేసి కూర్చోండి' },
      { word: 'శుభోదయం', translation: 'Good morning', pronunciation: 'shubhodhayam', example: 'మిత్రమా శుభోదయం' },
      { word: 'మళ్ళీ కలుద్దాం', translation: 'See you again / Goodbye', pronunciation: 'malli kaluddam', example: 'మళ్ళీ కలుద్దాం!' },
    ],
    exercises: [
      {
        type: 'multiple-choice',
        prompt: 'What does "నమస్కారం" mean?',
        options: ['Hello', 'Thank you', 'Please', 'Goodbye'],
        correctAnswer: 'Hello',
        xp: 10,
      },
      {
        type: 'listening',
        prompt: 'Listen to the audio and select what you hear',
        audioText: 'ధన్యవాదాలు',
        options: ['నమస్కారం', 'ధన్యవాదాలు', 'దయచేసి', 'మళ్ళీ కలుద్దాం'],
        correctAnswer: 'ధన్యవాదాలు',
        xp: 15,
      },
      {
        type: 'speaking',
        prompt: 'Say this word aloud: "నమస్కారం"',
        targetWord: 'నమస్కారం',
        pronunciation: 'namaskaram',
        correctAnswer: 'నమస్కారం',
        xp: 15,
      },
      {
        type: 'translation',
        prompt: 'Translate "Thank you" to Telugu',
        correctAnswer: 'ధన్యవాదాలు',
        wordBank: ['ధన్యవాదాలు', 'నమస్కారం', 'దయచేసి', 'అవును'],
        xp: 15,
      },
      {
        type: 'matching',
        prompt: 'Match Telugu greetings with meanings',
        pairs: [
          { word: 'నమస్కారం', meaning: 'Hello' },
          { word: 'ధన్యవాదాలు', meaning: 'Thank you' },
          { word: 'దయచేసి', meaning: 'Please' },
          { word: 'మళ్ళీ కలుద్దాం', meaning: 'See you again' },
        ],
        xp: 20,
      },
    ],
  },
  {
    id: 'te-everyday',
    name: 'Everyday Essentials',
    nameNative: 'రోజువారీ పదాలు',
    unit: 'Unit 1: Fundamentals',
    order: 2,
    vocabulary: [
      { word: 'నీరు', translation: 'Water', pronunciation: 'neeru', example: 'నాకు నీరు కావాలి' },
      { word: 'ఇల్లు', translation: 'Home / House', pronunciation: 'illu', example: 'ఇది మా ఇల్లు' },
      { word: 'స్నేహితుడు', translation: 'Friend', pronunciation: 'snehithudu', example: 'అతను నా మంచి స్నేహితుడు' },
      { word: 'పుస్తకం', translation: 'Book', pronunciation: 'pusthakam', example: 'నేను పుస్తకం చదువుతున్నాను' },
      { word: 'అవును', translation: 'Yes', pronunciation: 'avunu', example: 'అవును, నేను సిద్ధంగా ఉన్నాను' },
      { word: 'కాదు', translation: 'No', pronunciation: 'kaadu', example: 'కాదు, ధన్యవాదాలు' },
    ],
    exercises: [
      {
        type: 'multiple-choice',
        prompt: 'What does "నీరు" mean?',
        options: ['Water', 'Home', 'Friend', 'Book'],
        correctAnswer: 'Water',
        xp: 10,
      },
      {
        type: 'sentence-order',
        prompt: 'Arrange words: "This is my house"',
        sentence: 'ఇది మా ఇల్లు',
        words: ['ఇల్లు', 'ఇది', 'మా'],
        correctAnswer: 'ఇది మా ఇల్లు',
        xp: 15,
      },
      {
        type: 'matching',
        prompt: 'Match words with meanings',
        pairs: [
          { word: 'నీరు', meaning: 'Water' },
          { word: 'ఇల్లు', meaning: 'Home' },
          { word: 'స్నేహితుడు', meaning: 'Friend' },
          { word: 'పుస్తకం', meaning: 'Book' },
        ],
        xp: 20,
      },
    ],
  },

  // UNIT 2: NUMBERS & DAILY LIFE
  {
    id: 'te-numbers',
    name: 'Numbers 1 to 10',
    nameNative: 'సంఖ్యలు ۱-۱۰',
    unit: 'Unit 2: Daily Life',
    order: 3,
    vocabulary: [
      { word: 'ఒకటి', translation: 'One', pronunciation: 'okati', example: 'ఒక కప్పు టీ' },
      { word: 'రెండు', translation: 'Two', pronunciation: 'rendu', example: 'రెండు టిక్కెట్లు ఇవ్వండి' },
      { word: 'మూడు', translation: 'Three', pronunciation: 'moodu', example: 'ముగ్గురు మిత్రులు' },
      { word: 'నాలుగు', translation: 'Four', pronunciation: 'naalugu', example: 'నాలుగు గదులు' },
      { word: 'ఐదు', translation: 'Five', pronunciation: 'aidu', example: 'ఐదు నిమిషాలు' },
      { word: 'పది', translation: 'Ten', pronunciation: 'padi', example: 'పది రూపాయలు' },
    ],
    exercises: [
      {
        type: 'multiple-choice',
        prompt: 'What does "ఒకటి" mean?',
        options: ['One', 'Two', 'Three', 'Ten'],
        correctAnswer: 'One',
        xp: 10,
      },
      {
        type: 'fill-blank',
        prompt: 'Sequence: ఒకటి, రెండు, ___ , నాలుగు',
        options: ['మూడు', 'ఐదు', 'పది', 'ఆరు'],
        correctAnswer: 'మూడు',
        xp: 15,
      },
      {
        type: 'matching',
        prompt: 'Match Telugu numbers',
        pairs: [
          { word: 'ఒకటి', meaning: 'One' },
          { word: 'రెండు', meaning: 'Two' },
          { word: 'మూడు', meaning: 'Three' },
          { word: 'పది', meaning: 'Ten' },
        ],
        xp: 20,
      },
    ],
  },

  // UNIT 3: FOOD & DINING
  {
    id: 'te-food',
    name: 'Food & Andhra Dining',
    nameNative: 'ఆహారం మరియు భోజనం',
    unit: 'Unit 3: Food & Dining',
    order: 4,
    vocabulary: [
      { word: 'ఆహారం', translation: 'Food / Meal', pronunciation: 'aahaaram', example: 'రుచికరమైన ఆహారం' },
      { word: 'టీ', translation: 'Tea', pronunciation: 'tee', example: 'వేడి టీ త్రాగండి' },
      { word: 'పాలు', translation: 'Milk', pronunciation: 'paalu', example: 'తాజా పాలు' },
      { word: 'అన్నం', translation: 'Rice', pronunciation: 'annam', example: 'పప్పు అన్నం' },
      { word: 'మిఠాయి', translation: 'Sweets', pronunciation: 'mithaayi', example: 'తెలుగు మిఠాయిలు' },
    ],
    exercises: [
      {
        type: 'multiple-choice',
        prompt: 'What does "టీ" mean?',
        options: ['Tea', 'Milk', 'Rice', 'Water'],
        correctAnswer: 'Tea',
        xp: 10,
      },
      {
        type: 'speaking',
        prompt: 'Say: "ఒక టీ ఇవ్వండి" (Give one tea)',
        targetWord: 'ఒక టీ ఇవ్వండి',
        pronunciation: 'oka tee ivvandi',
        correctAnswer: 'ఒక టీ ఇవ్వండి',
        xp: 15,
      },
      {
        type: 'matching',
        prompt: 'Match Telugu dining terms',
        pairs: [
          { word: 'ఆహారం', meaning: 'Food' },
          { word: 'టీ', meaning: 'Tea' },
          { word: 'అన్నం', meaning: 'Rice' },
          { word: 'మిఠాయి', meaning: 'Sweets' },
        ],
        xp: 20,
      },
    ],
  },

  // UNIT 4: FAMILY & RELATIONS
  {
    id: 'te-family',
    name: 'Family & Relations',
    nameNative: 'కుటుంబం మరియు బంధుత్వాలు',
    unit: 'Unit 4: Family & Relations',
    order: 5,
    vocabulary: [
      { word: 'అమ్మ', translation: 'Mother', pronunciation: 'amma', example: 'మా అమ్మ' },
      { word: 'నాన్న', translation: 'Father', pronunciation: 'naanna', example: 'మా నాన్న గారు' },
      { word: 'అన్నయ్య', translation: 'Elder Brother', pronunciation: 'annayya', example: 'మా పెద్దన్నయ్య' },
      { word: 'అక్క', translation: 'Elder Sister', pronunciation: 'akka', example: 'మా అక్క' },
      { word: 'కుటుంబం', translation: 'Family', pronunciation: 'kutumbam', example: 'ఆనందకరమైన కుటుంబం' },
    ],
    exercises: [
      {
        type: 'multiple-choice',
        prompt: 'What does "అమ్మ" mean?',
        options: ['Mother', 'Father', 'Sister', 'Brother'],
        correctAnswer: 'Mother',
        xp: 10,
      },
      {
        type: 'listening',
        audioText: 'కుటుంబం',
        prompt: 'Listen and select what you hear',
        options: ['అమ్మ', 'నాన్న', 'అన్నయ్య', 'కుటుంబం'],
        correctAnswer: 'కుటుంబం',
        xp: 15,
      },
      {
        type: 'matching',
        prompt: 'Match Telugu family relations',
        pairs: [
          { word: 'అమ్మ', meaning: 'Mother' },
          { word: 'నాన్న', meaning: 'Father' },
          { word: 'అన్నయ్య', meaning: 'Elder Brother' },
          { word: 'అక్క', meaning: 'Elder Sister' },
        ],
        xp: 20,
      },
    ],
  },

  // UNIT 5: TRAVEL & DIRECTIONS
  {
    id: 'te-travel',
    name: 'Travel & Directions',
    nameNative: 'ప్రయాణం మరియు దారులు',
    unit: 'Unit 5: Travel & Places',
    order: 6,
    vocabulary: [
      { word: 'ఎక్కడ', translation: 'Where', pronunciation: 'ekkada', example: 'స్టేషన్ ఎక్కడ ఉంది?' },
      { word: 'రోడ్డు', translation: 'Road / Street', pronunciation: 'roaddu', example: 'నేరుగా వెళ్ళే రోడ్డు' },
      { word: 'బజారు', translation: 'Market', pronunciation: 'bajaaru', example: 'బజారు దగ్గరలో ఉంది' },
      { word: 'నగరం', translation: 'City', pronunciation: 'nagaram', example: 'అందమైన నగరం' },
      { word: 'కుడివైపు', translation: 'Right side', pronunciation: 'kudivaipu', example: 'కుడివైపు తిరగండి' },
      { word: 'ఎడమవైపు', translation: 'Left side', pronunciation: 'edamavaipu', example: 'ఎడమవైపు వెళ్ళండి' },
    ],
    exercises: [
      {
        type: 'multiple-choice',
        prompt: 'What does "ఎక్కడ" mean?',
        options: ['Where', 'When', 'Why', 'How'],
        correctAnswer: 'Where',
        xp: 10,
      },
      {
        type: 'sentence-order',
        prompt: 'Arrange: "Where is the station?"',
        sentence: 'స్టేషన్ ఎక్కడ ఉంది',
        words: ['ఉంది', 'స్టేషన్', 'ఎక్కడ'],
        correctAnswer: 'స్టేషన్ ఎక్కడ ఉంది',
        xp: 15,
      },
      {
        type: 'matching',
        prompt: 'Match travel terms',
        pairs: [
          { word: 'ఎక్కడ', meaning: 'Where' },
          { word: 'రోడ్డు', meaning: 'Road' },
          { word: 'కుడివైపు', meaning: 'Right side' },
          { word: 'ఎడమవైపు', meaning: 'Left side' },
        ],
        xp: 20,
      },
    ],
  },

  // UNIT 6: SHOPPING & BAZAARS
  {
    id: 'te-shopping',
    name: 'Shopping & Bargaining',
    nameNative: 'షాపింగ్ మరియు బేరసారాలు',
    unit: 'Unit 6: Shopping & Bazaars',
    order: 7,
    vocabulary: [
      { word: 'ధర', translation: 'Price / Cost', pronunciation: 'dhara', example: 'దీని ధర ఎంత?' },
      { word: 'రూపాయలు', translation: 'Rupees', pronunciation: 'roopaayalu', example: 'వంద రూపాయలు' },
      { word: 'ఖరీదైనది', translation: 'Expensive', pronunciation: 'khareedainadi', example: 'ఇది చాలా ఖరీదైనది' },
      { word: 'చవకైనది', translation: 'Cheap / Affordable', pronunciation: 'chavakainadi', example: 'చవకైన వస్తువులు' },
      { word: 'దుకాణం', translation: 'Shop', pronunciation: 'dukaanam', example: 'బట్టల దుకాణం' },
    ],
    exercises: [
      {
        type: 'multiple-choice',
        prompt: 'What does "ధర" mean?',
        options: ['Price', 'Shop', 'Money', 'Clothes'],
        correctAnswer: 'Price',
        xp: 10,
      },
      {
        type: 'speaking',
        prompt: 'Say: "దీని ధర ఎంత" (What is its price?)',
        targetWord: 'దీని ధర ఎంత',
        pronunciation: 'deeni dhara entha',
        correctAnswer: 'దీని ధర ఎంత',
        xp: 15,
      },
      {
        type: 'matching',
        prompt: 'Match market vocabulary',
        pairs: [
          { word: 'ధర', meaning: 'Price' },
          { word: 'ఖరీదైనది', meaning: 'Expensive' },
          { word: 'చవకైనది', meaning: 'Cheap' },
          { word: 'దుకాణం', meaning: 'Shop' },
        ],
        xp: 20,
      },
    ],
  },

  // UNIT 7: HEALTH & EMERGENCY
  {
    id: 'te-health',
    name: 'Health & Medical Assistance',
    nameNative: 'ఆరోగ్యం మరియు వైద్యం',
    unit: 'Unit 7: Health & Wellness',
    order: 8,
    vocabulary: [
      { word: 'వైద్యుడు', translation: 'Doctor', pronunciation: 'vaidyudu', example: 'డాక్టర్‌ని పిలవండి' },
      { word: 'మందు', translation: 'Medicine', pronunciation: 'mandu', example: 'సమయానికి మందు వేసుకోండి' },
      { word: 'ఆసుపత్రి', translation: 'Hospital', pronunciation: 'aasupathri', example: 'పెద్ద ఆసుపత్రి' },
      { word: 'నొప్పి', translation: 'Pain', pronunciation: 'noppi', example: 'తల నొప్పి ఉంది' },
      { word: 'సహాయం', translation: 'Help', pronunciation: 'sahaayam', example: 'దయచేసి సహాయం చేయండి' },
    ],
    exercises: [
      {
        type: 'multiple-choice',
        prompt: 'What does "మందు" mean?',
        options: ['Medicine', 'Doctor', 'Hospital', 'Pain'],
        correctAnswer: 'Medicine',
        xp: 10,
      },
      {
        type: 'fill-blank',
        prompt: 'Complete: "దయచేసి ___ చేయండి" (Please help)',
        options: ['సహాయం', 'మందు', 'వైద్యుడు', 'నొప్పి'],
        correctAnswer: 'సహాయం',
        xp: 15,
      },
      {
        type: 'matching',
        prompt: 'Match health terms',
        pairs: [
          { word: 'వైద్యుడు', meaning: 'Doctor' },
          { word: 'మందు', meaning: 'Medicine' },
          { word: 'ఆసుపత్రి', meaning: 'Hospital' },
          { word: 'సహాయం', meaning: 'Help' },
        ],
        xp: 20,
      },
    ],
  },

  // UNIT 8: WORK & PROFESSIONAL LIFE
  {
    id: 'te-work',
    name: 'Work & Professional Life',
    nameNative: 'పని మరియు కార్యాలయం',
    unit: 'Unit 8: Work & Professional',
    order: 9,
    vocabulary: [
      { word: 'పని', translation: 'Work / Job', pronunciation: 'pani', example: 'ఈరోజు చాలా పని ఉంది' },
      { word: 'కార్యాలయం', translation: 'Office', pronunciation: 'kaaryaalayam', example: 'కార్యాలయ సమయం' },
      { word: 'సమావేశం', translation: 'Meeting', pronunciation: 'samaavesham', example: 'ముఖ్యమైన సమావేశం' },
      { word: 'సమయం', translation: 'Time', pronunciation: 'samayam', example: 'సరైన సమయం' },
      { word: 'సందేశం', translation: 'Message', pronunciation: 'sandesham', example: 'సందేశం పంపండి' },
    ],
    exercises: [
      {
        type: 'multiple-choice',
        prompt: 'What does "కార్యాలయం" mean?',
        options: ['Office', 'Meeting', 'Time', 'Message'],
        correctAnswer: 'Office',
        xp: 10,
      },
      {
        type: 'matching',
        prompt: 'Match workplace terms',
        pairs: [
          { word: 'పని', meaning: 'Work' },
          { word: 'కార్యాలయం', meaning: 'Office' },
          { word: 'సమావేశం', meaning: 'Meeting' },
          { word: 'సమయం', meaning: 'Time' },
        ],
        xp: 20,
      },
    ],
  },

  // UNIT 9: CULTURE & CELEBRATIONS
  {
    id: 'te-festivals',
    name: 'Festivals & Telugu Traditions',
    nameNative: 'పండుగలు మరియు సంస్కృతి',
    unit: 'Unit 9: Culture & Celebrations',
    order: 10,
    vocabulary: [
      { word: 'పండుగ', translation: 'Festival', pronunciation: 'panduga', example: 'సంక్రాంతి పండుగ' },
      { word: 'శుభాకాంక్షలు', translation: 'Congratulations / Wishes', pronunciation: 'shubhaakaankshalu', example: 'ఉగాది శుభాకాంక్షలు' },
      { word: 'సంతోషం', translation: 'Happiness / Joy', pronunciation: 'santhosham', example: 'చాలా సంతోషంగా ఉంది' },
      { word: 'సంగీతం', translation: 'Music', pronunciation: 'sangeetham', example: 'కర్ణాటక సంగీతం' },
      { word: 'కూచిపూడి', translation: 'Kuchipudi Dance', pronunciation: 'kuchipudi', example: 'ఆంధ్రప్రదేశ్ శాస్త్రీయ నృత్యం' },
    ],
    exercises: [
      {
        type: 'multiple-choice',
        prompt: 'What does "పండుగ" mean?',
        options: ['Festival', 'Music', 'Dance', 'Congratulations'],
        correctAnswer: 'Festival',
        xp: 10,
      },
      {
        type: 'speaking',
        prompt: 'Say: "శుభాకాంక్షలు" (Best Wishes)',
        targetWord: 'శుభాకాంక్షలు',
        pronunciation: 'shubhaakaankshalu',
        correctAnswer: 'శుభాకాంక్షలు',
        xp: 15,
      },
      {
        type: 'matching',
        prompt: 'Match Telugu cultural terms',
        pairs: [
          { word: 'పండుగ', meaning: 'Festival' },
          { word: 'శుభాకాంక్షలు', meaning: 'Wishes' },
          { word: 'సంతోషం', meaning: 'Happiness' },
          { word: 'సంగీతం', meaning: 'Music' },
        ],
        xp: 20,
      },
    ],
  },

  // UNIT 10: FLUENCY & IDIOMS
  {
    id: 'te-mastery',
    name: 'Fluency & Telugu Samethalu',
    nameNative: 'సామెతలు మరియు ప్రావీణ్యం',
    unit: 'Unit 10: Fluency & Mastery',
    order: 11,
    vocabulary: [
      { word: 'అడగందే అమ్మైనా అన్నం పెట్టదు', translation: 'Unless you ask, you will not receive', pronunciation: 'adagande ammainaa annam pettadu', example: 'నీకు ఏమైనా కావాలంటే చెప్పు, అడగందే అమ్మైనా అన్నం పెట్టదు' },
      { word: 'కష్టే ఫలి', translation: 'Hard work brings rewards', pronunciation: 'kashte phali', example: 'నిరంతరం శ్రమించు, కష్టే ఫలి' },
      { word: 'చేతులు కాలాక ఆకులు పట్టుకున్నట్లు', translation: 'Locking the stable after the horse has bolted', pronunciation: 'chetulu kaalaaka aakulu pattukunnattu', example: 'ముందే జాగ్రత్త పడాలి, చేతులు కాలాక ఆకులు పట్టుకుని లాభం లేదు' },
    ],
    exercises: [
      {
        type: 'multiple-choice',
        prompt: 'What does the proverb "కష్టే ఫలి" mean?',
        options: ['Hard work brings rewards', 'Fruit is sweet', 'Patience is good', 'Study well'],
        correctAnswer: 'Hard work brings rewards',
        xp: 15,
      },
      {
        type: 'reading',
        prompt: 'Read this Telugu passage and answer:',
        passage: 'రమేష్ తిరుపతిలోని శ్రీ వేంకటేశ్వర స్వామి దేవాలయాన్ని దర్శించుకున్నారు. అక్కడ లడ్డూ ప్రసాదం స్వీకరించి ఆనందించారు.',
        question: 'Which famous temple did Ramesh visit in Tirupati?',
        options: ['Sri Venkateswara Temple (శ్రీ వేంకటేశ్వర స్వామి దేవాలయం)', 'Simhachalam Temple', 'Srisailam Temple', 'Kanaka Durga Temple'],
        correctAnswer: 'Sri Venkateswara Temple (శ్రీ వేంకటేశ్వర స్వామి దేవాలయం)',
        xp: 20,
      },
      {
        type: 'matching',
        prompt: 'Match Telugu proverbs with meanings',
        pairs: [
          { word: 'కష్టే ఫలి', meaning: 'Hard work brings rewards' },
          { word: 'అడగందే అమ్మైనా అన్నం పెట్టదు', meaning: 'Ask to receive' },
        ],
        xp: 25,
      },
    ],
  },
]
