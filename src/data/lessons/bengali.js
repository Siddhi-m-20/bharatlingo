export const bengaliLessons = [
  // UNIT 1: FUNDAMENTALS & ESSENTIALS
  {
    id: 'bn-greetings',
    name: 'Greetings & Salutations',
    nameNative: 'নমস্কার ও সম্ভাষণ',
    unit: 'Unit 1: Fundamentals',
    order: 1,
    vocabulary: [
      { word: 'নমস্কার', translation: 'Hello / Greetings', pronunciation: 'nomoshkar', example: 'নমস্কার, আপনি কেমন আছেন?' },
      { word: 'ধন্যবাদ', translation: 'Thank you', pronunciation: 'dhonnobad', example: 'আপনাকে অনেক ধন্যবাদ' },
      { word: 'দয়া করে', translation: 'Please', pronunciation: 'doya kore', example: 'দয়া করে বসুন' },
      { word: 'সুপ্রভাত', translation: 'Good morning', pronunciation: 'suprobhat', example: 'সুপ্রভাত বন্ধু' },
      { word: 'আবার দেখা হবে', translation: 'See you again / Goodbye', pronunciation: 'aabar dekha hobe', example: 'আজ আসি, আবার দেখা হবে!' },
    ],
    exercises: [
      {
        type: 'multiple-choice',
        prompt: 'What does "নমস্কার" mean?',
        options: ['Hello', 'Thank you', 'Please', 'Goodbye'],
        correctAnswer: 'Hello',
        xp: 10,
      },
      {
        type: 'listening',
        prompt: 'Listen to the audio and select what you hear',
        audioText: 'ধন্যবাদ',
        options: ['নমস্কার', 'ধন্যবাদ', 'দয়া করে', 'আবার দেখা হবে'],
        correctAnswer: 'ধন্যবাদ',
        xp: 15,
      },
      {
        type: 'speaking',
        prompt: 'Say this word aloud: "নমস্কার"',
        targetWord: 'নমস্কার',
        pronunciation: 'nomoshkar',
        correctAnswer: 'নমস্কার',
        xp: 15,
      },
      {
        type: 'translation',
        prompt: 'Translate "Thank you" to Bengali',
        correctAnswer: 'ধন্যবাদ',
        wordBank: ['ধন্যবাদ', 'নমস্কার', 'দয়া করে', 'হ্যাঁ'],
        xp: 15,
      },
      {
        type: 'matching',
        prompt: 'Match Bengali greetings with meanings',
        pairs: [
          { word: 'নমস্কার', meaning: 'Hello' },
          { word: 'ধন্যবাদ', meaning: 'Thank you' },
          { word: 'দয়া করে', meaning: 'Please' },
          { word: 'আবার দেখা হবে', meaning: 'See you again' },
        ],
        xp: 20,
      },
    ],
  },
  {
    id: 'bn-everyday',
    name: 'Everyday Essentials',
    nameNative: 'নিত্যদিনের শব্দ',
    unit: 'Unit 1: Fundamentals',
    order: 2,
    vocabulary: [
      { word: 'জল', translation: 'Water', pronunciation: 'jol', example: 'আমাকে জল দিন' },
      { word: 'বাড়ি', translation: 'Home / House', pronunciation: 'bari', example: 'এটা আমার বাড়ি' },
      { word: 'বন্ধু', translation: 'Friend', pronunciation: 'bondhu', example: 'সে আমার প্রিয় বন্ধু' },
      { word: 'বই', translation: 'Book', pronunciation: 'boi', example: 'আমি বই পড়ছি' },
      { word: 'হ্যাঁ', translation: 'Yes', pronunciation: 'hyaan', example: 'হ্যাঁ, আমি প্রস্তুত' },
      { word: 'না', translation: 'No', pronunciation: 'naa', example: 'না, ধন্যবাদ' },
    ],
    exercises: [
      {
        type: 'multiple-choice',
        prompt: 'What does "জল" mean?',
        options: ['Water', 'Home', 'Friend', 'Book'],
        correctAnswer: 'Water',
        xp: 10,
      },
      {
        type: 'sentence-order',
        prompt: 'Arrange words: "This is my house"',
        sentence: 'এটা আমার বাড়ি',
        words: ['বাড়ি', 'এটা', 'আমার'],
        correctAnswer: 'এটা আমার বাড়ি',
        xp: 15,
      },
      {
        type: 'matching',
        prompt: 'Match words with meanings',
        pairs: [
          { word: 'জল', meaning: 'Water' },
          { word: 'বাড়ি', meaning: 'Home' },
          { word: 'বন্ধু', meaning: 'Friend' },
          { word: 'বই', meaning: 'Book' },
        ],
        xp: 20,
      },
    ],
  },

  // UNIT 2: DAILY LIFE & NUMBERS
  {
    id: 'bn-numbers',
    name: 'Numbers 1 to 10',
    nameNative: 'সংখ্যা ১-১০',
    unit: 'Unit 2: Daily Life',
    order: 3,
    vocabulary: [
      { word: 'এক', translation: 'One', pronunciation: 'ek', example: 'এক কাপ চা' },
      { word: 'দুই', translation: 'Two', pronunciation: 'dui', example: 'দুটো টিকিট দিন' },
      { word: 'তিন', translation: 'Three', pronunciation: 'tin', example: 'তিন বন্ধু' },
      { word: 'চার', translation: 'Four', pronunciation: 'chaar', example: 'চারটি ঘর' },
      { word: 'পাঁচ', translation: 'Five', pronunciation: 'paanch', example: 'পাঁচ মিনিট' },
      { word: 'দশ', translation: 'Ten', pronunciation: 'dosh', example: 'দশ টাকা' },
    ],
    exercises: [
      {
        type: 'multiple-choice',
        prompt: 'What does "এক" mean?',
        options: ['One', 'Two', 'Three', 'Ten'],
        correctAnswer: 'One',
        xp: 10,
      },
      {
        type: 'fill-blank',
        prompt: 'Sequence: এক, দুই, ___ , চার',
        options: ['তিন', 'পাঁচ', 'দশ', 'ছয়'],
        correctAnswer: 'তিন',
        xp: 15,
      },
      {
        type: 'matching',
        prompt: 'Match Bengali numbers',
        pairs: [
          { word: 'এক', meaning: 'One' },
          { word: 'দুই', meaning: 'Two' },
          { word: 'তিন', meaning: 'Three' },
          { word: 'দশ', meaning: 'Ten' },
        ],
        xp: 20,
      },
    ],
  },

  // UNIT 3: FOOD & DINING
  {
    id: 'bn-food',
    name: 'Food & Bengali Cuisine',
    nameNative: 'খাবার ও রসনা বিলাস',
    unit: 'Unit 3: Food & Dining',
    order: 4,
    vocabulary: [
      { word: 'খাবার', translation: 'Food / Meal', pronunciation: 'khabar', example: 'খাবার খুব সুস্বাদু' },
      { word: 'চা', translation: 'Tea', pronunciation: 'chaa', example: 'গরম চা খান' },
      { word: 'দুধ', translation: 'Milk', pronunciation: 'doodh', example: 'খাঁটি দুধ' },
      { word: 'ভাত', translation: 'Rice', pronunciation: 'bhaat', example: 'মাছ ভাত' },
      { word: 'রসগোল্লা', translation: 'Rasgulla (Sweet)', pronunciation: 'roshogolla', example: 'কলকাতার মিষ্টি রসগোল্লা' },
    ],
    exercises: [
      {
        type: 'multiple-choice',
        prompt: 'What does "চা" mean?',
        options: ['Tea', 'Milk', 'Rice', 'Water'],
        correctAnswer: 'Tea',
        xp: 10,
      },
      {
        type: 'speaking',
        prompt: 'Say: "এক কাপ চা দিন" (Give one cup of tea)',
        targetWord: 'এক কাপ চা দিন',
        pronunciation: 'ek kap chaa din',
        correctAnswer: 'এক কাপ চা দিন',
        xp: 15,
      },
      {
        type: 'matching',
        prompt: 'Match food terms',
        pairs: [
          { word: 'খাবার', meaning: 'Food' },
          { word: 'চা', meaning: 'Tea' },
          { word: 'ভাত', meaning: 'Rice' },
          { word: 'রসগোল্লা', meaning: 'Rasgulla' },
        ],
        xp: 20,
      },
    ],
  },

  // UNIT 4: FAMILY & RELATIONS
  {
    id: 'bn-family',
    name: 'Family & Relations',
    nameNative: 'পরিবার ও আত্মীয়',
    unit: 'Unit 4: Family & Relations',
    order: 5,
    vocabulary: [
      { word: 'মা', translation: 'Mother', pronunciation: 'maa', example: 'আমার মা' },
      { word: 'বাবা', translation: 'Father', pronunciation: 'baba', example: 'আমার বাবা' },
      { word: 'দাদা', translation: 'Elder Brother', pronunciation: 'dada', example: 'আমার বড় দাদা' },
      { word: 'দিদি', translation: 'Elder Sister', pronunciation: 'didi', example: 'আমার মিষ্টি দিদি' },
      { word: 'পরিবার', translation: 'Family', pronunciation: 'poribaar', example: 'আমাদের সুখী পরিবার' },
    ],
    exercises: [
      {
        type: 'multiple-choice',
        prompt: 'What does "মা" mean?',
        options: ['Mother', 'Father', 'Sister', 'Brother'],
        correctAnswer: 'Mother',
        xp: 10,
      },
      {
        type: 'listening',
        prompt: 'Listen and select what you hear',
        audioText: 'পরিবার',
        options: ['মা', 'বাবা', 'দাদা', 'পরিবার'],
        correctAnswer: 'পরিবার',
        xp: 15,
      },
      {
        type: 'matching',
        prompt: 'Match family relations',
        pairs: [
          { word: 'মা', meaning: 'Mother' },
          { word: 'বাবা', meaning: 'Father' },
          { word: 'দাদা', meaning: 'Elder Brother' },
          { word: 'দিদি', meaning: 'Elder Sister' },
        ],
        xp: 20,
      },
    ],
  },

  // UNIT 5: TRAVEL & DIRECTIONS
  {
    id: 'bn-travel',
    name: 'Travel & Places',
    nameNative: 'ভ্রমণ ও পথঘাট',
    unit: 'Unit 5: Travel & Places',
    order: 6,
    vocabulary: [
      { word: 'কোথায়', translation: 'Where', pronunciation: 'kothay', example: 'স্টেশন কোথায়?' },
      { word: 'রাস্তা', translation: 'Road / Street', pronunciation: 'raasta', example: 'সোজা রাস্তা' },
      { word: 'বাজার', translation: 'Market', pronunciation: 'bazaar', example: 'নিউ মার্কেট' },
      { word: 'শহর', translation: 'City', pronunciation: 'shohor', example: 'আনন্দ নগরী কলকাতা' },
      { word: 'ডানদিকে', translation: 'Right side', pronunciation: 'daandike', example: 'ডানদিকে যান' },
      { word: 'বাঁদিকে', translation: 'Left side', pronunciation: 'baandike', example: 'বাঁদিকে ঘুরুন' },
    ],
    exercises: [
      {
        type: 'multiple-choice',
        prompt: 'What does "কোথায়" mean?',
        options: ['Where', 'When', 'Why', 'How'],
        correctAnswer: 'Where',
        xp: 10,
      },
      {
        type: 'sentence-order',
        prompt: 'Arrange: "Where is the station?"',
        sentence: 'স্টেশন কোথায়',
        words: ['কোথায়', 'স্টেশন'],
        correctAnswer: 'স্টেশন কোথায়',
        xp: 15,
      },
      {
        type: 'matching',
        prompt: 'Match travel terms',
        pairs: [
          { word: 'কোথায়', meaning: 'Where' },
          { word: 'রাস্তা', meaning: 'Road' },
          { word: 'ডানদিকে', meaning: 'Right side' },
          { word: 'বাঁদিকে', meaning: 'Left side' },
        ],
        xp: 20,
      },
    ],
  },

  // UNIT 6: SHOPPING & BAZAARS
  {
    id: 'bn-shopping',
    name: 'Shopping & Bargaining',
    nameNative: 'কেনাকাটা ও দরদাম',
    unit: 'Unit 6: Shopping & Bazaars',
    order: 7,
    vocabulary: [
      { word: 'দাম', translation: 'Price / Cost', pronunciation: 'daam', example: 'এটার দাম কত?' },
      { word: 'টাকা', translation: 'Money / Rupees', pronunciation: 'taka', example: 'একশত টাকা' },
      { word: 'দামি', translation: 'Expensive', pronunciation: 'daami', example: 'খুব দামি জিনিস' },
      { word: 'সস্তা', translation: 'Cheap / Affordable', pronunciation: 'sosta', example: 'সস্তা সুন্দর' },
      { word: 'দোকান', translation: 'Shop', pronunciation: 'dokan', example: 'মিষ্টির দোকান' },
    ],
    exercises: [
      {
        type: 'multiple-choice',
        prompt: 'What does "দাম" mean?',
        options: ['Price', 'Shop', 'Money', 'Clothes'],
        correctAnswer: 'Price',
        xp: 10,
      },
      {
        type: 'speaking',
        prompt: 'Say: "এটার দাম কত" (How much is its price?)',
        targetWord: 'এটার দাম কত',
        pronunciation: 'etaar daam koto',
        correctAnswer: 'এটার দাম কত',
        xp: 15,
      },
      {
        type: 'matching',
        prompt: 'Match market vocabulary',
        pairs: [
          { word: 'দাম', meaning: 'Price' },
          { word: 'দামি', meaning: 'Expensive' },
          { word: 'সস্তা', meaning: 'Cheap' },
          { word: 'দোকান', meaning: 'Shop' },
        ],
        xp: 20,
      },
    ],
  },

  // UNIT 7: HEALTH & EMERGENCY
  {
    id: 'bn-health',
    name: 'Health & Medical Assistance',
    nameNative: 'স্বাস্থ্য ও চিকিৎসা',
    unit: 'Unit 7: Health & Wellness',
    order: 8,
    vocabulary: [
      { word: 'ডাক্তার', translation: 'Doctor', pronunciation: 'daktar', example: 'ডাক্তার ডাকুন' },
      { word: 'ওষুধ', translation: 'Medicine', pronunciation: 'ooshudh', example: 'সময়মতো ওষুধ খান' },
      { word: 'হাসপাতাল', translation: 'Hospital', pronunciation: 'haaspaataal', example: 'কাছের হাসপাতাল' },
      { word: 'ব্যথা', translation: 'Pain', pronunciation: 'byatha', example: 'মাথায় ব্যথা' },
      { word: 'সাহায্য', translation: 'Help', pronunciation: 'saahaajjo', example: 'দয়া করে সাহায্য করুন' },
    ],
    exercises: [
      {
        type: 'multiple-choice',
        prompt: 'What does "ওষুধ" mean?',
        options: ['Medicine', 'Doctor', 'Hospital', 'Help'],
        correctAnswer: 'Medicine',
        xp: 10,
      },
      {
        type: 'fill-blank',
        prompt: 'Complete: "দয়া করে ___ করুন" (Please help)',
        options: ['সাহায্য', 'ওষুধ', 'ডাক্তার', 'ব্যথা'],
        correctAnswer: 'সাহায্য',
        xp: 15,
      },
      {
        type: 'matching',
        prompt: 'Match health terms',
        pairs: [
          { word: 'ডাক্তার', meaning: 'Doctor' },
          { word: 'ওষুধ', meaning: 'Medicine' },
          { word: 'হাসপাতাল', meaning: 'Hospital' },
          { word: 'সাহায্য', meaning: 'Help' },
        ],
        xp: 20,
      },
    ],
  },

  // UNIT 8: WORK & PROFESSIONAL LIFE
  {
    id: 'bn-work',
    name: 'Work & Professional Life',
    nameNative: 'কাজকর্ম ও অফিস',
    unit: 'Unit 8: Work & Professional',
    order: 9,
    vocabulary: [
      { word: 'কাজ', translation: 'Work / Job', pronunciation: 'kaaj', example: 'আজ অনেক কাজ' },
      { word: 'অফিস', translation: 'Office', pronunciation: 'office', example: 'অফিসের সময়' },
      { word: 'সভা', translation: 'Meeting', pronunciation: 'shobha', example: 'গুরুত্বপূর্ণ সভা' },
      { word: 'সময়', translation: 'Time', pronunciation: 'shomoy', example: 'সঠিক সময়' },
      { word: 'খবর', translation: 'Message / News', pronunciation: 'khobor', example: 'খবর পাঠান' },
    ],
    exercises: [
      {
        type: 'multiple-choice',
        prompt: 'What does "অফিস" mean?',
        options: ['Office', 'Meeting', 'Time', 'Message'],
        correctAnswer: 'Office',
        xp: 10,
      },
      {
        type: 'matching',
        prompt: 'Match professional terms',
        pairs: [
          { word: 'কাজ', meaning: 'Work' },
          { word: 'অফিস', meaning: 'Office' },
          { word: 'সভা', meaning: 'Meeting' },
          { word: 'সময়', meaning: 'Time' },
        ],
        xp: 20,
      },
    ],
  },

  // UNIT 9: CULTURE & CELEBRATIONS
  {
    id: 'bn-festivals',
    name: 'Festivals & Bengali Culture',
    nameNative: 'উৎসব ও বাঙালি সংস্কৃতি',
    unit: 'Unit 9: Culture & Celebrations',
    order: 10,
    vocabulary: [
      { word: 'উৎসব', translation: 'Festival', pronunciation: 'utshob', example: 'দুর্গাপূজার উৎসব' },
      { word: 'অভিনন্দন', translation: 'Congratulations / Greetings', pronunciation: 'obhinondon', example: 'শুভ নববর্ষের অভিনন্দন' },
      { word: 'আনন্দ', translation: 'Happiness / Joy', pronunciation: 'aanondo', example: 'খুব আনন্দ হচ্ছে' },
      { word: 'রবীন্দ্রসঙ্গীত', translation: 'Rabindrasangeet (Tagore Songs)', pronunciation: 'rabindrasangeet', example: 'রবীন্দ্রনাথের গান' },
      { word: 'নাচ', translation: 'Dance', pronunciation: 'naach', example: 'লোকনৃত্য' },
    ],
    exercises: [
      {
        type: 'multiple-choice',
        prompt: 'What does "উৎসব" mean?',
        options: ['Festival', 'Music', 'Dance', 'Congratulations'],
        correctAnswer: 'Festival',
        xp: 10,
      },
      {
        type: 'speaking',
        prompt: 'Say: "শুভ নববর্ষ" (Happy New Year)',
        targetWord: 'শুভ নববর্ষ',
        pronunciation: 'shubho noboborsho',
        correctAnswer: 'শুভ নববর্ষ',
        xp: 15,
      },
      {
        type: 'matching',
        prompt: 'Match cultural terms',
        pairs: [
          { word: 'উৎসব', meaning: 'Festival' },
          { word: 'অভিনন্দন', meaning: 'Congratulations' },
          { word: 'আনন্দ', meaning: 'Happiness' },
          { word: 'নাচ', meaning: 'Dance' },
        ],
        xp: 20,
      },
    ],
  },

  // UNIT 10: FLUENCY & IDIOMS
  {
    id: 'bn-mastery',
    name: 'Fluency & Bengali Proverbs (Probad)',
    nameNative: 'প্রবাদ ও দক্ষতা',
    unit: 'Unit 10: Fluency & Mastery',
    order: 11,
    vocabulary: [
      { word: 'যত গর্জে তত বর্ষে না', translation: 'Barking dogs seldom bite', pronunciation: 'joto gorje toto borshe naa', example: 'ভয় পেও না, যত গর্জে তত বর্ষে না' },
      { word: 'অধিক সন্ন্যাসীতে গাজন নষ্ট', translation: 'Too many cooks spoil the broth', pronunciation: 'odhik shonnyashite gaajon noshto', example: 'বেশি লোক নিও না, অধিক সন্ন্যাসীতে গাজন নষ্ট হয়' },
      { word: 'এক হাতে তালি বাজে না', translation: 'It takes two to tango', pronunciation: 'ek haate taali baaje naa', example: 'দোষ দুজনেরই, এক হাতে তালি বাজে না' },
    ],
    exercises: [
      {
        type: 'multiple-choice',
        prompt: 'What does "যত গর্জে তত বর্ষে না" signify?',
        options: ['Barking dogs seldom bite', 'Heavy rain is good', 'Thunderstorm', 'Dance in the rain'],
        correctAnswer: 'Barking dogs seldom bite',
        xp: 15,
      },
      {
        type: 'reading',
        prompt: 'Read this Bengali passage and answer:',
        passage: 'অনির্বাণ কলকাতায় ভিক্টোরিয়া মেমোরিয়াল দেখতে গিয়েছিলেন। সাদা মার্বেলের তৈরি স্মৃতিসৌধটি দেখে তিনি মুগ্ধ হলেন।',
        question: 'Which monument in Kolkata did Anirban visit?',
        options: ['Victoria Memorial (ভিক্টোরিয়া মেমোরিয়াল)', 'Howrah Bridge', 'Dakshineswar Temple', 'Indian Museum'],
        correctAnswer: 'Victoria Memorial (ভিক্টোরিয়া মেমোরিয়াল)',
        xp: 20,
      },
      {
        type: 'matching',
        prompt: 'Match Bengali proverbs',
        pairs: [
          { word: 'যত গর্জে তত বর্ষে না', meaning: 'Barking dogs seldom bite' },
          { word: 'এক হাতে তালি বাজে না', meaning: 'It takes two to tango' },
        ],
        xp: 25,
      },
    ],
  },
]
