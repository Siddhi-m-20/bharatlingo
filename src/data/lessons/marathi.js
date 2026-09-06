export const marathiLessons = [
  // UNIT 1: FUNDAMENTALS & ESSENTIALS
  {
    id: 'mr-greetings',
    name: 'Greetings & Salutations',
    nameNative: 'अभिवादन',
    unit: 'Unit 1: Fundamentals',
    order: 1,
    vocabulary: [
      { word: 'नमस्कार', translation: 'Hello / Greetings', pronunciation: 'namaskar', example: 'नमस्कार, तुम्ही कसे आहात?' },
      { word: 'धन्यवाद', translation: 'Thank you', pronunciation: 'dhanyavaad', example: 'खूप खूप धन्यवाद' },
      { word: 'कृपया', translation: 'Please', pronunciation: 'krupaya', example: 'कृपया येथे बसा' },
      { word: 'शुभ सकाळ', translation: 'Good morning', pronunciation: 'shubh sakaal', example: 'शुभ सकाळ मित्रा' },
      { word: 'पुन्हा भेटू', translation: 'See you again / Goodbye', pronunciation: 'punha bhetu', example: 'पुन्हा भेटू!' },
    ],
    exercises: [
      {
        type: 'multiple-choice',
        prompt: 'What does "नमस्कार" mean?',
        options: ['Hello', 'Thank you', 'Please', 'Goodbye'],
        correctAnswer: 'Hello',
        xp: 10,
      },
      {
        type: 'listening',
        prompt: 'Listen to the audio and select what you hear',
        audioText: 'धन्यवाद',
        options: ['नमस्कार', 'धन्यवाद', 'कृपया', 'पुन्हा भेटू'],
        correctAnswer: 'धन्यवाद',
        xp: 15,
      },
      {
        type: 'speaking',
        prompt: 'Say this word aloud: "नमस्कार"',
        targetWord: 'नमस्कार',
        pronunciation: 'namaskar',
        correctAnswer: 'नमस्कार',
        xp: 15,
      },
      {
        type: 'translation',
        prompt: 'Translate "Thank you" to Marathi',
        correctAnswer: 'धन्यवाद',
        wordBank: ['धन्यवाद', 'नमस्कार', 'कृपया', 'हो'],
        xp: 15,
      },
      {
        type: 'matching',
        prompt: 'Match the words with their correct meanings',
        pairs: [
          { word: 'नमस्कार', meaning: 'Hello' },
          { word: 'धन्यवाद', meaning: 'Thank you' },
          { word: 'कृपया', meaning: 'Please' },
          { word: 'पुन्हा भेटू', meaning: 'See you again' },
        ],
        xp: 20,
      },
    ],
  },
  {
    id: 'mr-everyday',
    name: 'Everyday Essentials',
    nameNative: 'दैनंदिन शब्द',
    unit: 'Unit 1: Fundamentals',
    order: 2,
    vocabulary: [
      { word: 'पाणी', translation: 'Water', pronunciation: 'paani', example: 'मला पाणी हवे आहे' },
      { word: 'घर', translation: 'Home / House', pronunciation: 'ghar', example: 'हे माझे घर आहे' },
      { word: 'मित्र', translation: 'Friend', pronunciation: 'mitra', example: 'तो माझा चांगला मित्र आहे' },
      { word: 'पुस्तक', translation: 'Book', pronunciation: 'pustak', example: 'मी पुस्तक वाचतो' },
      { word: 'हो', translation: 'Yes', pronunciation: 'ho', example: 'हो, मी तयार आहे' },
      { word: 'नाही', translation: 'No', pronunciation: 'naahi', example: 'नाही, धन्यवाद' },
    ],
    exercises: [
      {
        type: 'multiple-choice',
        prompt: 'What does "पाणी" mean?',
        options: ['Water', 'Home', 'Friend', 'Book'],
        correctAnswer: 'Water',
        xp: 10,
      },
      {
        type: 'listening',
        prompt: 'Listen to the audio and select what you hear',
        audioText: 'घर',
        options: ['घर', 'पाणी', 'मित्र', 'पुस्तक'],
        correctAnswer: 'घर',
        xp: 15,
      },
      {
        type: 'sentence-order',
        prompt: 'Arrange words: "This is my house"',
        sentence: 'हे माझे घर आहे',
        words: ['आहे', 'हे', 'घर', 'माझे'],
        correctAnswer: 'हे माझे घर आहे',
        xp: 15,
      },
      {
        type: 'matching',
        prompt: 'Match words with meanings',
        pairs: [
          { word: 'पाणी', meaning: 'Water' },
          { word: 'घर', meaning: 'Home' },
          { word: 'मित्र', meaning: 'Friend' },
          { word: 'पुस्तक', meaning: 'Book' },
        ],
        xp: 20,
      },
    ],
  },

  // UNIT 2: NUMBERS & DAILY LIFE
  {
    id: 'mr-numbers',
    name: 'Numbers 1 to 10',
    nameNative: 'संख्या १-१०',
    unit: 'Unit 2: Daily Life',
    order: 3,
    vocabulary: [
      { word: 'एक', translation: 'One', pronunciation: 'ek', example: 'एक कप चहा' },
      { word: 'दोन', translation: 'Two', pronunciation: 'don', example: 'दोन तिकिटे द्या' },
      { word: 'तीन', translation: 'Three', pronunciation: 'teen', example: 'तीन मित्र' },
      { word: 'चार', translation: 'Four', pronunciation: 'chaar', example: 'चार खोल्या' },
      { word: 'पाच', translation: 'Five', pronunciation: 'paach', example: 'पाच मिनिटे' },
      { word: 'दहा', translation: 'Ten', pronunciation: 'daha', example: 'दहा रुपये' },
    ],
    exercises: [
      {
        type: 'multiple-choice',
        prompt: 'What does "एक" mean?',
        options: ['One', 'Two', 'Three', 'Ten'],
        correctAnswer: 'One',
        xp: 10,
      },
      {
        type: 'fill-blank',
        prompt: 'Sequence: एक, दोन, ___ , चार',
        options: ['तीन', 'पाच', 'दहा', 'सहा'],
        correctAnswer: 'तीन',
        xp: 15,
      },
      {
        type: 'matching',
        prompt: 'Match numbers',
        pairs: [
          { word: 'एक', meaning: 'One' },
          { word: 'दोन', meaning: 'Two' },
          { word: 'तीन', meaning: 'Three' },
          { word: 'दहा', meaning: 'Ten' },
        ],
        xp: 20,
      },
    ],
  },

  // UNIT 3: FOOD & DINING
  {
    id: 'mr-food',
    name: 'Food & Maharashtrian Cuisine',
    nameNative: 'खान-पान आणि जेवण',
    unit: 'Unit 3: Food & Dining',
    order: 4,
    vocabulary: [
      { word: 'जेवण', translation: 'Meal / Food', pronunciation: 'jevan', example: 'जेवण खूप छान आहे' },
      { word: 'चहा', translation: 'Tea', pronunciation: 'chaha', example: 'गरम चहा प्या' },
      { word: 'दूध', translation: 'Milk', pronunciation: 'doodh', example: 'ताजे दूध' },
      { word: 'भाकरी', translation: 'Bhakri (Flatbread)', pronunciation: 'bhakri', example: 'गरमागरम भाकरी आणि पिठलं' },
      { word: 'भात', translation: 'Rice', pronunciation: 'bhaat', example: 'वरण भात' },
      { word: 'गोड', translation: 'Sweet', pronunciation: 'god', example: 'गोड पदार्थ' },
    ],
    exercises: [
      {
        type: 'multiple-choice',
        prompt: 'What does "चहा" mean?',
        options: ['Tea', 'Milk', 'Rice', 'Water'],
        correctAnswer: 'Tea',
        xp: 10,
      },
      {
        type: 'speaking',
        prompt: 'Say: "एक चहा द्या" (Give one tea)',
        targetWord: 'एक चहा द्या',
        pronunciation: 'ek chaha dya',
        correctAnswer: 'एक चहा द्या',
        xp: 15,
      },
      {
        type: 'matching',
        prompt: 'Match food vocabulary',
        pairs: [
          { word: 'जेवण', meaning: 'Meal' },
          { word: 'चहा', meaning: 'Tea' },
          { word: 'भात', meaning: 'Rice' },
          { word: 'गोड', meaning: 'Sweet' },
        ],
        xp: 20,
      },
    ],
  },

  // UNIT 4: FAMILY & RELATIONS
  {
    id: 'mr-family',
    name: 'Family & Relations',
    nameNative: 'कुटुंब आणि नातीगोती',
    unit: 'Unit 4: Family & Relations',
    order: 5,
    vocabulary: [
      { word: 'आई', translation: 'Mother', pronunciation: 'aai', example: 'माझी आई' },
      { word: 'बाबा', translation: 'Father', pronunciation: 'baaba', example: 'माझे बाबा' },
      { word: 'भाऊ', translation: 'Brother', pronunciation: 'bhaau', example: 'माझा मोठा भाऊ' },
      { word: 'बहीण', translation: 'Sister', pronunciation: 'baheen', example: 'माझी लहान बहीण' },
      { word: 'कुटुंब', translation: 'Family', pronunciation: 'kutumb', example: 'सुखी कुटुंब' },
    ],
    exercises: [
      {
        type: 'multiple-choice',
        prompt: 'What does "आई" mean?',
        options: ['Mother', 'Father', 'Sister', 'Brother'],
        correctAnswer: 'Mother',
        xp: 10,
      },
      {
        type: 'listening',
        audioText: 'भाऊ',
        prompt: 'Listen and select what you hear',
        options: ['आई', 'बाबा', 'भाऊ', 'बहीण'],
        correctAnswer: 'भाऊ',
        xp: 15,
      },
      {
        type: 'matching',
        prompt: 'Match family relations',
        pairs: [
          { word: 'आई', meaning: 'Mother' },
          { word: 'बाबा', meaning: 'Father' },
          { word: 'भाऊ', meaning: 'Brother' },
          { word: 'बहीण', meaning: 'Sister' },
        ],
        xp: 20,
      },
    ],
  },

  // UNIT 5: TRAVEL & DIRECTIONS
  {
    id: 'mr-travel',
    name: 'Travel & Directions',
    nameNative: 'प्रवास आणि दिशा',
    unit: 'Unit 5: Travel & Places',
    order: 6,
    vocabulary: [
      { word: 'कुठे', translation: 'Where', pronunciation: 'kuthe', example: 'स्थानक कुठे आहे?' },
      { word: 'रस्ता', translation: 'Road / Street', pronunciation: 'rasta', example: 'सरळ रस्ता' },
      { word: 'बाजार', translation: 'Market', pronunciation: 'bazaar', example: 'बाजार जवळ आहे' },
      { word: 'शहर', translation: 'City', pronunciation: 'shahar', example: 'सुंदर शहर' },
      { word: 'उजवीकडे', translation: 'Right side', pronunciation: 'ujvikade', example: 'उजवीकडे वळा' },
      { word: 'डावीकडे', translation: 'Left side', pronunciation: 'daavikade', example: 'डावीकडे वळा' },
    ],
    exercises: [
      {
        type: 'multiple-choice',
        prompt: 'What does "कुठे" mean?',
        options: ['Where', 'When', 'Why', 'How'],
        correctAnswer: 'Where',
        xp: 10,
      },
      {
        type: 'sentence-order',
        prompt: 'Arrange: "Where is the market?"',
        sentence: 'बाजार कुठे आहे',
        words: ['आहे', 'बाजार', 'कुठे'],
        correctAnswer: 'बाजार कुठे आहे',
        xp: 15,
      },
      {
        type: 'matching',
        prompt: 'Match travel terms',
        pairs: [
          { word: 'कुठे', meaning: 'Where' },
          { word: 'रस्ता', meaning: 'Road' },
          { word: 'उजवीकडे', meaning: 'Right side' },
          { word: 'डावीकडे', meaning: 'Left side' },
        ],
        xp: 20,
      },
    ],
  },

  // UNIT 6: SHOPPING & BAZAARS
  {
    id: 'mr-shopping',
    name: 'Shopping & Bargaining',
    nameNative: 'खरेदी आणि भाव करणे',
    unit: 'Unit 6: Shopping & Bazaars',
    order: 7,
    vocabulary: [
      { word: 'किंमत', translation: 'Price / Cost', pronunciation: 'kimmat', example: 'याची किंमत किती आहे?' },
      { word: 'रुपये', translation: 'Rupees', pronunciation: 'rupaye', example: 'शंभर रुपये' },
      { word: 'महाग', translation: 'Expensive', pronunciation: 'mahaag', example: 'हे खूप महाग आहे' },
      { word: 'स्वस्त', translation: 'Cheap / Affordable', pronunciation: 'swasta', example: 'स्वस्त वस्तू' },
      { word: 'दुकान', translation: 'Shop', pronunciation: 'dukaan', example: 'कपड्यांचे दुकान' },
    ],
    exercises: [
      {
        type: 'multiple-choice',
        prompt: 'What does "किंमत" mean?',
        options: ['Price', 'Shop', 'Money', 'Clothes'],
        correctAnswer: 'Price',
        xp: 10,
      },
      {
        type: 'speaking',
        prompt: 'Say: "किंमत किती आहे" (How much is the price?)',
        targetWord: 'किंमत किती आहे',
        pronunciation: 'kimmat kiti aahe',
        correctAnswer: 'किंमत किती आहे',
        xp: 15,
      },
      {
        type: 'matching',
        prompt: 'Match shopping terms',
        pairs: [
          { word: 'किंमत', meaning: 'Price' },
          { word: 'महाग', meaning: 'Expensive' },
          { word: 'स्वस्त', meaning: 'Cheap' },
          { word: 'दुकान', meaning: 'Shop' },
        ],
        xp: 20,
      },
    ],
  },

  // UNIT 7: HEALTH & EMERGENCY
  {
    id: 'mr-health',
    name: 'Health & Emergency',
    nameNative: 'आरोग्य आणि वैद्यकीय मदत',
    unit: 'Unit 7: Health & Wellness',
    order: 8,
    vocabulary: [
      { word: 'डॉक्टर', translation: 'Doctor', pronunciation: 'doctor', example: 'डॉक्टरांना बोलवा' },
      { word: 'औषध', translation: 'Medicine', pronunciation: 'aushadh', example: 'वेळेवर औषध घ्या' },
      { word: 'रुग्णालय', translation: 'Hospital', pronunciation: 'rugnaalay', example: 'मोठे रुग्णालय' },
      { word: 'त्रास', translation: 'Pain / Trouble', pronunciation: 'traas', example: 'काय त्रास होतोय?' },
      { word: 'मदत', translation: 'Help', pronunciation: 'madat', example: 'कृपया मदत करा' },
    ],
    exercises: [
      {
        type: 'multiple-choice',
        prompt: 'What does "औषध" mean?',
        options: ['Medicine', 'Doctor', 'Hospital', 'Help'],
        correctAnswer: 'Medicine',
        xp: 10,
      },
      {
        type: 'fill-blank',
        prompt: 'Complete: "कृपया ___ करा" (Please help)',
        options: ['मदत', 'औषध', 'डॉक्टर', 'त्रास'],
        correctAnswer: 'मदत',
        xp: 15,
      },
      {
        type: 'matching',
        prompt: 'Match health terms',
        pairs: [
          { word: 'डॉक्टर', meaning: 'Doctor' },
          { word: 'औषध', meaning: 'Medicine' },
          { word: 'रुग्णालय', meaning: 'Hospital' },
          { word: 'मदत', meaning: 'Help' },
        ],
        xp: 20,
      },
    ],
  },

  // UNIT 8: WORK & PROFESSIONAL LIFE
  {
    id: 'mr-work',
    name: 'Work & Professional Life',
    nameNative: 'कामकाज आणि व्यवसाय',
    unit: 'Unit 8: Work & Professional',
    order: 9,
    vocabulary: [
      { word: 'काम', translation: 'Work / Job', pronunciation: 'kaam', example: 'आज खूप काम आहे' },
      { word: 'कार्यालय', translation: 'Office', pronunciation: 'kaaryaalay', example: 'कार्यालयाची वेळ' },
      { word: 'बैठक', translation: 'Meeting', pronunciation: 'baithak', example: 'महत्त्वाची बैठक' },
      { word: 'वेळ', translation: 'Time', pronunciation: 'vel', example: 'वेळेवर या' },
      { word: 'निरोप', translation: 'Message', pronunciation: 'nirop', example: 'निरोप पाठवा' },
    ],
    exercises: [
      {
        type: 'multiple-choice',
        prompt: 'What does "कार्यालय" mean?',
        options: ['Office', 'Meeting', 'Time', 'Work'],
        correctAnswer: 'Office',
        xp: 10,
      },
      {
        type: 'matching',
        prompt: 'Match workplace vocabulary',
        pairs: [
          { word: 'काम', meaning: 'Work' },
          { word: 'कार्यालय', meaning: 'Office' },
          { word: 'बैठक', meaning: 'Meeting' },
          { word: 'वेळ', meaning: 'Time' },
        ],
        xp: 20,
      },
    ],
  },

  // UNIT 9: CULTURE & CELEBRATIONS
  {
    id: 'mr-festivals',
    name: 'Festivals & Maharashtrian Culture',
    nameNative: 'सण आणि संस्कृती',
    unit: 'Unit 9: Culture & Celebrations',
    order: 10,
    vocabulary: [
      { word: 'सण', translation: 'Festival', pronunciation: 'san', example: 'गणेशोत्सवाचा सण' },
      { word: 'अभिनंदन', translation: 'Congratulations / Greetings', pronunciation: 'abhinandan', example: 'हार्दिक अभिनंदन' },
      { word: 'आनंद', translation: 'Happiness / Joy', pronunciation: 'aanand', example: 'खूप आनंद झाला' },
      { word: 'संगीत', translation: 'Music', pronunciation: 'sangeet', example: 'नाट्यसंगीत' },
      { word: 'लावणी', translation: 'Lavani Dance', pronunciation: 'laavani', example: 'महाराष्ट्राची प्रसिद्ध लावणी' },
    ],
    exercises: [
      {
        type: 'multiple-choice',
        prompt: 'What does "सण" mean?',
        options: ['Festival', 'Music', 'Dance', 'Congratulations'],
        correctAnswer: 'Festival',
        xp: 10,
      },
      {
        type: 'speaking',
        prompt: 'Say: "हार्दिक अभिनंदन" (Warm Congratulations)',
        targetWord: 'हार्दिक अभिनंदन',
        pronunciation: 'hardik abhinandan',
        correctAnswer: 'हार्दिक अभिनंदन',
        xp: 15,
      },
      {
        type: 'matching',
        prompt: 'Match culture terms',
        pairs: [
          { word: 'सण', meaning: 'Festival' },
          { word: 'अभिनंदन', meaning: 'Congratulations' },
          { word: 'आनंद', meaning: 'Happiness' },
          { word: 'संगीत', meaning: 'Music' },
        ],
        xp: 20,
      },
    ],
  },

  // UNIT 10: FLUENCY & IDIOMS
  {
    id: 'mr-mastery',
    name: 'Fluency & Marathi Mhani',
    nameNative: 'म्हणी आणि प्रावीण्य',
    unit: 'Unit 10: Fluency & Mastery',
    order: 11,
    vocabulary: [
      { word: 'अति तिथे माती', translation: 'Excess of everything is bad', pronunciation: 'ati tithe maati', example: 'कोणतीही गोष्ट मर्यादेत हवी, अति तिथे माती होते' },
      { word: 'हातचे सोडून पळत्याच्या पाठी', translation: 'Giving up certainty for uncertainty', pronunciation: 'haatche sodun paltyachya paathi', example: 'हातचे सोडून पळत्याच्या पाठी लागू नये' },
      { word: 'नाचता येईना अंगण वाकडे', translation: 'A bad workman blames his tools', pronunciation: 'naachta yeeina angan vaakde', example: 'स्वतः चूक करायची आणि नाचता येईना अंगण वाकडे म्हणायचे' },
    ],
    exercises: [
      {
        type: 'multiple-choice',
        prompt: 'What does the proverb "अति तिथे माती" teach?',
        options: ['Excess of anything is bad', 'Soil is fertile', 'Work hard', 'Dance well'],
        correctAnswer: 'Excess of anything is bad',
        xp: 15,
      },
      {
        type: 'reading',
        prompt: 'Read this Marathi passage and answer:',
        passage: 'समीरने पुण्यात शनिवार वाडा पाहिला. त्याला वाड्याचा भव्य इतिहास जाणून खूप आनंद झाला.',
        question: 'What historical place did Samir visit in Pune?',
        options: ['Shaniwar Wada (शनिवार वाडा)', 'Gateway of India', 'Ajanta Caves', 'Raigad Fort'],
        correctAnswer: 'Shaniwar Wada (शनिवार वाडा)',
        xp: 20,
      },
      {
        type: 'matching',
        prompt: 'Match Marathi proverbs',
        pairs: [
          { word: 'अति तिथे माती', meaning: 'Excess of everything is bad' },
          { word: 'नाचता येईना अंगण वाकडे', meaning: 'Blaming tools for failure' },
        ],
        xp: 25,
      },
    ],
  },
]
