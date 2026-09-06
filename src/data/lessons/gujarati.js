export const gujaratiLessons = [
  // UNIT 1: FUNDAMENTALS & ESSENTIALS
  {
    id: 'gu-greetings',
    name: 'Greetings & Salutations',
    nameNative: 'નમસ્તે અને અભિવાદન',
    unit: 'Unit 1: Fundamentals',
    order: 1,
    vocabulary: [
      { word: 'નમસ્તે', translation: 'Hello / Greetings', pronunciation: 'namaste', example: 'નમસ્તે, તમે કેમ છો?' },
      { word: 'આભાર', translation: 'Thank you', pronunciation: 'aabhar', example: 'તમારો ખૂબ ખૂબ આભાર' },
      { word: 'કૃપા કરીને', translation: 'Please', pronunciation: 'krupa kareene', example: 'કૃપા કરીને બેસો' },
      { word: 'સુપ્રભાત', translation: 'Good morning', pronunciation: 'suprabhat', example: 'સૌને સુપ્રભાત' },
      { word: 'આવજો', translation: 'Goodbye / See you', pronunciation: 'aavjo', example: 'ફરી મળીશું, આવજો' },
    ],
    exercises: [
      {
        type: 'multiple-choice',
        prompt: 'What does "નમસ્તે" mean?',
        options: ['Hello', 'Thank you', 'Please', 'Goodbye'],
        correctAnswer: 'Hello',
        xp: 10,
      },
      {
        type: 'listening',
        prompt: 'Listen to the audio and select what you hear',
        audioText: 'આભાર',
        options: ['નમસ્તે', 'આભાર', 'કૃપા કરીને', 'આવજો'],
        correctAnswer: 'આભાર',
        xp: 15,
      },
      {
        type: 'speaking',
        prompt: 'Say this word aloud: "નમસ્તે"',
        targetWord: 'નમસ્તે',
        pronunciation: 'namaste',
        correctAnswer: 'નમસ્તે',
        xp: 15,
      },
      {
        type: 'translation',
        prompt: 'Translate "Thank you" to Gujarati',
        correctAnswer: 'આભાર',
        wordBank: ['આભાર', 'નમસ્તે', 'કૃપા કરીને', 'હા'],
        xp: 15,
      },
      {
        type: 'matching',
        prompt: 'Match Gujarati greetings with meanings',
        pairs: [
          { word: 'નમસ્તે', meaning: 'Hello' },
          { word: 'આભાર', meaning: 'Thank you' },
          { word: 'કૃપા કરીને', meaning: 'Please' },
          { word: 'આવજો', meaning: 'Goodbye' },
        ],
        xp: 20,
      },
    ],
  },
  {
    id: 'gu-everyday',
    name: 'Everyday Essentials',
    nameNative: 'રોજિંદા શબ્દો',
    unit: 'Unit 1: Fundamentals',
    order: 2,
    vocabulary: [
      { word: 'પાણી', translation: 'Water', pronunciation: 'paani', example: 'મને પાણી આપો' },
      { word: 'ઘર', translation: 'Home / House', pronunciation: 'ghar', example: 'આ મારું ઘર છે' },
      { word: 'મિત્ર', translation: 'Friend', pronunciation: 'mitra', example: 'તે મારો ખાસ મિત્ર છે' },
      { word: 'પુસ્તક', translation: 'Book', pronunciation: 'pustak', example: 'હું પુસ્તક વાંચું છું' },
      { word: 'હા', translation: 'Yes', pronunciation: 'haa', example: 'હા, હું તૈયાર છું' },
      { word: 'ના', translation: 'No', pronunciation: 'naa', example: 'ના, આભાર' },
    ],
    exercises: [
      {
        type: 'multiple-choice',
        prompt: 'What does "પાણી" mean?',
        options: ['Water', 'Home', 'Friend', 'Book'],
        correctAnswer: 'Water',
        xp: 10,
      },
      {
        type: 'sentence-order',
        prompt: 'Arrange words: "This is my house"',
        sentence: 'આ મારું ઘર છે',
        words: ['છે', 'આ', 'ઘર', 'મારું'],
        correctAnswer: 'આ મારું ઘર છે',
        xp: 15,
      },
      {
        type: 'matching',
        prompt: 'Match words with meanings',
        pairs: [
          { word: 'પાણી', meaning: 'Water' },
          { word: 'ઘર', meaning: 'Home' },
          { word: 'મિત્ર', meaning: 'Friend' },
          { word: 'પુસ્તક', meaning: 'Book' },
        ],
        xp: 20,
      },
    ],
  },

  // UNIT 2: NUMBERS & DAILY LIFE
  {
    id: 'gu-numbers',
    name: 'Numbers 1 to 10',
    nameNative: 'સંખ્યાઓ ૧-૧૦',
    unit: 'Unit 2: Daily Life',
    order: 3,
    vocabulary: [
      { word: 'એક', translation: 'One', pronunciation: 'ek', example: 'એક કપ ચા' },
      { word: 'બે', translation: 'Two', pronunciation: 'be', example: 'બે ટિકિટ આપો' },
      { word: 'ત્રણ', translation: 'Three', pronunciation: 'tran', example: 'ત્રણ મિત્રો' },
      { word: 'ચાર', translation: 'Four', pronunciation: 'chaar', example: 'ચાર રૂમ' },
      { word: 'પાંચ', translation: 'Five', pronunciation: 'paanch', example: 'પાંચ મિનિટ' },
      { word: 'દસ', translation: 'Ten', pronunciation: 'das', example: 'દસ રૂપિયા' },
    ],
    exercises: [
      {
        type: 'multiple-choice',
        prompt: 'What does "એક" mean?',
        options: ['One', 'Two', 'Three', 'Ten'],
        correctAnswer: 'One',
        xp: 10,
      },
      {
        type: 'fill-blank',
        prompt: 'Sequence: એક, બે, ___ , ચાર',
        options: ['ત્રણ', 'પાંચ', 'દસ', 'છ'],
        correctAnswer: 'ત્રણ',
        xp: 15,
      },
      {
        type: 'matching',
        prompt: 'Match Gujarati numbers',
        pairs: [
          { word: 'એક', meaning: 'One' },
          { word: 'બે', meaning: 'Two' },
          { word: 'ત્રણ', meaning: 'Three' },
          { word: 'દસ', meaning: 'Ten' },
        ],
        xp: 20,
      },
    ],
  },

  // UNIT 3: FOOD & DINING
  {
    id: 'gu-food',
    name: 'Food & Gujarati Thali',
    nameNative: 'ખાણી-પીણી અને જમણવાર',
    unit: 'Unit 3: Food & Dining',
    order: 4,
    vocabulary: [
      { word: 'જમવાનું', translation: 'Food / Meal', pronunciation: 'jamvaanu', example: 'જમવાનું ખૂબ સ્વાદિષ્ટ છે' },
      { word: 'ચા', translation: 'Tea', pronunciation: 'chaa', example: 'ગરમાગરમ ચા' },
      { word: 'દૂધ', translation: 'Milk', pronunciation: 'doodh', example: 'તાજું દૂધ' },
      { word: 'રોટલી', translation: 'Roti (Flatbread)', pronunciation: 'rotli', example: 'ગરમ રોટલી' },
      { word: 'ઢોકળા', translation: 'Dhokla', pronunciation: 'dhokla', example: 'ગુજરાતી ખમણ ઢોકળા' },
      { word: 'મીઠાઈ', translation: 'Sweets', pronunciation: 'mithaai', example: 'સ્વાદિષ્ટ મીઠાઈ' },
    ],
    exercises: [
      {
        type: 'multiple-choice',
        prompt: 'What does "ચા" mean?',
        options: ['Tea', 'Milk', 'Rice', 'Water'],
        correctAnswer: 'Tea',
        xp: 10,
      },
      {
        type: 'speaking',
        prompt: 'Say: "એક કપ ચા આપો" (Give one cup of tea)',
        targetWord: 'એક કપ ચા આપો',
        pronunciation: 'ek kap chaa aapo',
        correctAnswer: 'એક કપ ચા આપો',
        xp: 15,
      },
      {
        type: 'matching',
        prompt: 'Match food vocabulary',
        pairs: [
          { word: 'જમવાનું', meaning: 'Meal' },
          { word: 'ચા', meaning: 'Tea' },
          { word: 'રોટલી', meaning: 'Roti' },
          { word: 'ઢોકળા', meaning: 'Dhokla' },
        ],
        xp: 20,
      },
    ],
  },

  // UNIT 4: FAMILY & RELATIONS
  {
    id: 'gu-family',
    name: 'Family & Relations',
    nameNative: 'પરિવાર અને સંબંધો',
    unit: 'Unit 4: Family & Relations',
    order: 5,
    vocabulary: [
      { word: 'માતા', translation: 'Mother', pronunciation: 'maata', example: 'મારી વહાલી માતા' },
      { word: 'પિતા', translation: 'Father', pronunciation: 'pita', example: 'મારા પિતાજી' },
      { word: 'ભાઈ', translation: 'Brother', pronunciation: 'bhaai', example: 'મારો મોટો ભાઈ' },
      { word: 'બહેન', translation: 'Sister', pronunciation: 'bahen', example: 'મારી નાની બહેન' },
      { word: 'પરિવાર', translation: 'Family', pronunciation: 'parivaar', example: 'આપણો પરિવાર' },
    ],
    exercises: [
      {
        type: 'multiple-choice',
        prompt: 'What does "માતા" mean?',
        options: ['Mother', 'Father', 'Sister', 'Brother'],
        correctAnswer: 'Mother',
        xp: 10,
      },
      {
        type: 'listening',
        prompt: 'Listen and select what you hear',
        audioText: 'પરિવાર',
        options: ['માતા', 'પિતા', 'ભાઈ', 'પરિવાર'],
        correctAnswer: 'પરિવાર',
        xp: 15,
      },
      {
        type: 'matching',
        prompt: 'Match Gujarati family terms',
        pairs: [
          { word: 'માતા', meaning: 'Mother' },
          { word: 'પિતા', meaning: 'Father' },
          { word: 'ભાઈ', meaning: 'Brother' },
          { word: 'બહેન', meaning: 'Sister' },
        ],
        xp: 20,
      },
    ],
  },

  // UNIT 5: TRAVEL & DIRECTIONS
  {
    id: 'gu-travel',
    name: 'Travel & Directions',
    nameNative: 'પ્રવાસ અને દિશાઓ',
    unit: 'Unit 5: Travel & Places',
    order: 6,
    vocabulary: [
      { word: 'ક્યાં', translation: 'Where', pronunciation: 'kyaan', example: 'સ્ટેશન ક્યાં છે?' },
      { word: 'રસ્તો', translation: 'Road / Street', pronunciation: 'rasto', example: 'સીધો રસ્તો' },
      { word: 'બજાર', translation: 'Market', pronunciation: 'bazaar', example: 'બજાર નજીક છે' },
      { word: 'શહેર', translation: 'City', pronunciation: 'shahar', example: 'સુંદર શહેર' },
      { word: 'જમણી બાજુ', translation: 'Right side', pronunciation: 'jamni baaju', example: 'જમણી બાજુ વળો' },
      { word: 'ડાબી બાજુ', translation: 'Left side', pronunciation: 'daabi baaju', example: 'ડાબી બાજુ જાઓ' },
    ],
    exercises: [
      {
        type: 'multiple-choice',
        prompt: 'What does "ક્યાં" mean?',
        options: ['Where', 'When', 'Why', 'How'],
        correctAnswer: 'Where',
        xp: 10,
      },
      {
        type: 'sentence-order',
        prompt: 'Arrange: "Where is the station?"',
        sentence: 'સ્ટેશન ક્યાં છે',
        words: ['છે', 'સ્ટેશન', 'ક્યાં'],
        correctAnswer: 'સ્ટેશન ક્યાં છે',
        xp: 15,
      },
      {
        type: 'matching',
        prompt: 'Match travel terms',
        pairs: [
          { word: 'ક્યાં', meaning: 'Where' },
          { word: 'રસ્તો', meaning: 'Road' },
          { word: 'જમણી બાજુ', meaning: 'Right side' },
          { word: 'ડાબી બાજુ', meaning: 'Left side' },
        ],
        xp: 20,
      },
    ],
  },

  // UNIT 6: SHOPPING & BAZAARS
  {
    id: 'gu-shopping',
    name: 'Shopping & Bargaining',
    nameNative: 'ખરીદી અને ભાવતાલ',
    unit: 'Unit 6: Shopping & Bazaars',
    order: 7,
    vocabulary: [
      { word: 'કિંમત', translation: 'Price / Cost', pronunciation: 'kimmat', example: 'આની કિંમત કેટલી છે?' },
      { word: 'રૂપિયા', translation: 'Rupees', pronunciation: 'rupiya', example: 'સો રૂપિયા' },
      { word: 'મોંઘું', translation: 'Expensive', pronunciation: 'monghu', example: 'આ બહુ મોંઘું છે' },
      { word: 'સસ્તું', translation: 'Cheap / Affordable', pronunciation: 'sastu', example: 'સસ્તું અને સારું' },
      { word: 'દુકાન', translation: 'Shop', pronunciation: 'dukaan', example: 'કપડાંની દુકાન' },
    ],
    exercises: [
      {
        type: 'multiple-choice',
        prompt: 'What does "કિંમત" mean?',
        options: ['Price', 'Shop', 'Money', 'Clothes'],
        correctAnswer: 'Price',
        xp: 10,
      },
      {
        type: 'speaking',
        prompt: 'Say: "કિંમત કેટલી છે" (What is the price?)',
        targetWord: 'કિંમત કેટલી છે',
        pronunciation: 'kimmat ketli chhe',
        correctAnswer: 'કિંમત કેટલી છે',
        xp: 15,
      },
      {
        type: 'matching',
        prompt: 'Match shopping vocabulary',
        pairs: [
          { word: 'કિંમત', meaning: 'Price' },
          { word: 'મોંઘું', meaning: 'Expensive' },
          { word: 'સસ્તું', meaning: 'Cheap' },
          { word: 'દુકાન', meaning: 'Shop' },
        ],
        xp: 20,
      },
    ],
  },

  // UNIT 7: HEALTH & EMERGENCY
  {
    id: 'gu-health',
    name: 'Health & Medical Assistance',
    nameNative: 'આરોગ્ય અને સારવાર',
    unit: 'Unit 7: Health & Wellness',
    order: 8,
    vocabulary: [
      { word: 'ડૉક્ટર', translation: 'Doctor', pronunciation: 'doctor', example: 'ડૉક્ટરને બોલાવો' },
      { word: 'દવા', translation: 'Medicine', pronunciation: 'dawa', example: 'સમયસર દવા લો' },
      { word: 'હોસ્પિટલ', translation: 'Hospital', pronunciation: 'hospital', example: 'નજીકની હોસ્પિટલ' },
      { word: 'દુખાવો', translation: 'Pain', pronunciation: 'dukhaavo', example: 'માથાનો દુખાવો છે' },
      { word: 'મદદ', translation: 'Help', pronunciation: 'madad', example: 'કૃપા કરીને મદદ કરો' },
    ],
    exercises: [
      {
        type: 'multiple-choice',
        prompt: 'What does "દવા" mean?',
        options: ['Medicine', 'Doctor', 'Hospital', 'Pain'],
        correctAnswer: 'Medicine',
        xp: 10,
      },
      {
        type: 'fill-blank',
        prompt: 'Complete: "કૃપા કરીને ___ કરો" (Please help)',
        options: ['મદદ', 'દવા', 'ડૉક્ટર', 'દુખાવો'],
        correctAnswer: 'મદદ',
        xp: 15,
      },
      {
        type: 'matching',
        prompt: 'Match health terms',
        pairs: [
          { word: 'ડૉક્ટર', meaning: 'Doctor' },
          { word: 'દવા', meaning: 'Medicine' },
          { word: 'હોસ્પિટલ', meaning: 'Hospital' },
          { word: 'મદદ', meaning: 'Help' },
        ],
        xp: 20,
      },
    ],
  },

  // UNIT 8: WORK & PROFESSIONAL LIFE
  {
    id: 'gu-work',
    name: 'Work & Professional Life',
    nameNative: 'કામકાજ અને વ્યવસાય',
    unit: 'Unit 8: Work & Professional',
    order: 9,
    vocabulary: [
      { word: 'કામ', translation: 'Work / Job', pronunciation: 'kaam', example: 'આજે ઘણું કામ છે' },
      { word: 'ઓફિસ', translation: 'Office', pronunciation: 'office', example: 'ઓફિસનો સમય' },
      { word: 'મીટિંગ', translation: 'Meeting', pronunciation: 'meeting', example: 'મહત્વની મીટિંગ' },
      { word: 'સમય', translation: 'Time', pronunciation: 'samay', example: 'સમયસર પહોંચો' },
      { word: 'સંદેશો', translation: 'Message', pronunciation: 'sandesho', example: 'સંદેશો મોકલો' },
    ],
    exercises: [
      {
        type: 'multiple-choice',
        prompt: 'What does "ઓફિસ" mean?',
        options: ['Office', 'Meeting', 'Time', 'Message'],
        correctAnswer: 'Office',
        xp: 10,
      },
      {
        type: 'matching',
        prompt: 'Match professional terms',
        pairs: [
          { word: 'કામ', meaning: 'Work' },
          { word: 'ઓફિસ', meaning: 'Office' },
          { word: 'મીટિંગ', meaning: 'Meeting' },
          { word: 'સમય', meaning: 'Time' },
        ],
        xp: 20,
      },
    ],
  },

  // UNIT 9: CULTURE & CELEBRATIONS
  {
    id: 'gu-festivals',
    name: 'Festivals & Garba Culture',
    nameNative: 'તહેવારો અને ગરબા સંસ્કૃતિ',
    unit: 'Unit 9: Culture & Celebrations',
    order: 10,
    vocabulary: [
      { word: 'તહેવાર', translation: 'Festival', pronunciation: 'tahevaar', example: 'નવરાત્રિનો તહેવાર' },
      { word: 'અભિનંદન', translation: 'Congratulations / Wishes', pronunciation: 'abhinandan', example: 'ખૂબ ખૂબ અભિનંદન' },
      { word: 'આનંદ', translation: 'Happiness / Joy', pronunciation: 'aanand', example: 'ઘણો આનંદ થયો' },
      { word: 'ગરબા', translation: 'Garba Dance', pronunciation: 'garba', example: 'ગુજરાતનો વિશ્વપ્રસિદ્ધ ગરબા' },
      { word: 'સંગીત', translation: 'Music', pronunciation: 'sangeet', example: 'લોકસંગીત' },
    ],
    exercises: [
      {
        type: 'multiple-choice',
        prompt: 'What does "તહેવાર" mean?',
        options: ['Festival', 'Music', 'Dance', 'Congratulations'],
        correctAnswer: 'Festival',
        xp: 10,
      },
      {
        type: 'speaking',
        prompt: 'Say: "ખૂબ ખૂબ અભિનંદન" (Hearty Congratulations)',
        targetWord: 'ખૂબ ખૂબ અભિનંદન',
        pronunciation: 'khoob khoob abhinandan',
        correctAnswer: 'ખૂબ ખૂબ અભિનંદન',
        xp: 15,
      },
      {
        type: 'matching',
        prompt: 'Match cultural terms',
        pairs: [
          { word: 'તહેવાર', meaning: 'Festival' },
          { word: 'અભિનંદન', meaning: 'Congratulations' },
          { word: 'ગરબા', meaning: 'Garba Dance' },
          { word: 'સંગીત', meaning: 'Music' },
        ],
        xp: 20,
      },
    ],
  },

  // UNIT 10: FLUENCY & IDIOMS
  {
    id: 'gu-mastery',
    name: 'Fluency & Gujarati Kahevato',
    nameNative: 'કહેવતો અને પ્રાવીણ્ય',
    unit: 'Unit 10: Fluency & Mastery',
    order: 11,
    vocabulary: [
      { word: 'ઉતાવળે આંબા ન પાકે', translation: 'Haste makes waste / Patience brings fruit', pronunciation: 'utaavle aamba na paake', example: 'ધીરજ રાખો, ઉતાવળે આંબા ન પાકે' },
      { word: 'ઝાઝા હાથ રળિયામણા', translation: 'Many hands make light work', pronunciation: 'zhaazha haath raliyaamna', example: 'મળીને કામ કરો, ઝાઝા હાથ રળિયામણા' },
      { word: 'ટીપે ટીપે સરોવર ભરાય', translation: 'Every drop counts towards a lake', pronunciation: 'teepe teepe sarovar bharaay', example: 'બચત કરો, ટીપે ટીપે સરોવર ભરાય' },
    ],
    exercises: [
      {
        type: 'multiple-choice',
        prompt: 'What does "ટીપે ટીપે સરોવર ભરાય" signify?',
        options: ['Every drop counts / Small savings grow', 'Lake is full', 'Drink water', 'Rain heavily'],
        correctAnswer: 'Every drop counts / Small savings grow',
        xp: 15,
      },
      {
        type: 'reading',
        prompt: 'Read this Gujarati passage and answer:',
        passage: 'જિગ્નેશ સાબરમતી આશ્રમની મુલાકાતે ગયો. ત્યાં ગાંધીજીના ચરખા અને જીવન વિશે જાણીને તેને ખૂબ પ્રેરણા મળી.',
        question: 'Which historic place did Jignesh visit in Ahmedabad?',
        options: ['Sabarmati Ashram (સાબરમતી આશ્રમ)', 'Statue of Unity', 'Somnath Temple', 'Gir Sanctuary'],
        correctAnswer: 'Sabarmati Ashram (સાબરમતી આશ્રમ)',
        xp: 20,
      },
      {
        type: 'matching',
        prompt: 'Match Gujarati proverbs',
        pairs: [
          { word: 'ઉતાવળે આંબા ન પાકે', meaning: 'Patience brings sweet fruit' },
          { word: 'ઝાઝા હાથ રળિયામણા', meaning: 'Many hands make light work' },
        ],
        xp: 25,
      },
    ],
  },
]
