// Shared, expanded foundation content for every supported language.
// Numbers use the script's digit set so learners can read 0–100 and hear each
// number through the existing language-aware audio button.

const digitSets = {
  hi: '०१२३४५६७८९', mr: '०१२३४५६७८९', ta: '௦௧௨௩௪௫௬௭௮௯', te: '౦౧౨౩౪౫౬౭౮౯',
  bn: '০১২৩৪৫৬৭৮৯', pa: '੦੧੨੩੪੫੬੭੮੯', gu: '૦૧૨૩૪૫૬૭૮૯', en: '0123456789',
}

const numberNames = {
  hi: ['शून्य', 'एक', 'दो', 'तीन', 'चार', 'पाँच', 'छह', 'सात', 'आठ', 'नौ', 'दस', 'बीस', 'तीस', 'चालीस', 'पचास', 'साठ', 'सत्तर', 'अस्सी', 'नब्बे', 'सौ'],
  mr: ['शून्य', 'एक', 'दोन', 'तीन', 'चार', 'पाच', 'सहा', 'सात', 'आठ', 'नऊ', 'दहा', 'वीस', 'तीस', 'चाळीस', 'पन्नास', 'साठ', 'सत्तर', 'ऐंशी', 'नव्वद', 'शंभर'],
  ta: ['பூஜ்ஜியம்', 'ஒன்று', 'இரண்டு', 'மூன்று', 'நான்கு', 'ஐந்து', 'ஆறு', 'ஏழு', 'எட்டு', 'ஒன்பது', 'பத்து', 'இருபது', 'முப்பது', 'நாற்பது', 'ஐம்பது', 'அறுபது', 'எழுபது', 'எண்பது', 'தொண்ணூறு', 'நூறு'],
  te: ['సున్నా', 'ఒకటి', 'రెండు', 'మూడు', 'నాలుగు', 'ఐదు', 'ఆరు', 'ఏడు', 'ఎనిమిది', 'తొమ్మిది', 'పది', 'ఇరవై', 'ముప్పై', 'నలభై', 'యాభై', 'అరవై', 'డెబ్బై', 'ఎనభై', 'తొంభై', 'వంద'],
  bn: ['শূন্য', 'এক', 'দুই', 'তিন', 'চার', 'পাঁচ', 'ছয়', 'সাত', 'আট', 'নয়', 'দশ', 'বিশ', 'ত্রিশ', 'চল্লিশ', 'পঞ্চাশ', 'ষাট', 'সত্তর', 'আশি', 'নব্বই', 'একশো'],
  pa: ['ਸਿਫ਼ਰ', 'ਇੱਕ', 'ਦੋ', 'ਤਿੰਨ', 'ਚਾਰ', 'ਪੰਜ', 'ਛੇ', 'ਸੱਤ', 'ਅੱਠ', 'ਨੌਂ', 'ਦਸ', 'ਵੀਹ', 'ਤੀਹ', 'ਚਾਲੀ', 'ਪੰਜਾਹ', 'ਸੱਠ', 'ਸੱਤਰ', 'ਅੱਸੀ', 'ਨੱਬੇ', 'ਸੌ'],
  gu: ['શૂન્ય', 'એક', 'બે', 'ત્રણ', 'ચાર', 'પાંચ', 'છ', 'સાત', 'આઠ', 'નવ', 'દસ', 'વીસ', 'ત્રીસ', 'ચાલીસ', 'પચાસ', 'સાઠ', 'સિત્તેર', 'એંસી', 'નેવું', 'સો'],
  en: ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety', 'One hundred'],
}

const greetings = {
  hi: [['नमस्ते', 'Hello', 'namaste'], ['सुप्रभात', 'Good morning', 'suprabhaat'], ['शुभ दोपहर', 'Good afternoon', 'shubh dopahar'], ['शुभ संध्या', 'Good evening', 'shubh sandhya'], ['शुभ रात्रि', 'Good night', 'shubh raatri'], ['आप कैसे हैं?', 'How are you? (formal)', 'aap kaise hain'], ['मैं ठीक हूँ', 'I am well', 'main theek hoon'], ['आपसे मिलकर खुशी हुई', 'Nice to meet you', 'aapse milkar khushi hui'], ['कृपया', 'Please', 'kripya'], ['धन्यवाद', 'Thank you', 'dhanyavaad'], ['कोई बात नहीं', 'You are welcome', 'koi baat nahin'], ['माफ़ कीजिए', 'Excuse me / Sorry', 'maaf kijiye'], ['हाँ', 'Yes', 'haan'], ['नहीं', 'No', 'nahin'], ['अलविदा', 'Goodbye', 'alvida'], ['फिर मिलेंगे', 'See you later', 'phir milenge']],
  mr: [['नमस्कार', 'Hello', 'namaskaar'], ['शुभ प्रभात', 'Good morning', 'shubh prabhaat'], ['शुभ दुपार', 'Good afternoon', 'shubh dupaar'], ['शुभ संध्याकाळ', 'Good evening', 'shubh sandhyakaal'], ['शुभ रात्री', 'Good night', 'shubh raatri'], ['तुम्ही कसे आहात?', 'How are you? (formal)', 'tumhi kase aahat'], ['मी ठीक आहे', 'I am well', 'mi theek aahe'], ['तुम्हाला भेटून आनंद झाला', 'Nice to meet you', 'tumhala bhetun anand jhala'], ['कृपया', 'Please', 'krupaya'], ['धन्यवाद', 'Thank you', 'dhanyavaad'], ['काही हरकत नाही', 'You are welcome', 'kahi harakat nahi'], ['माफ करा', 'Excuse me / Sorry', 'maaf kara'], ['हो', 'Yes', 'ho'], ['नाही', 'No', 'nahi'], ['निरोप', 'Goodbye', 'nirop'], ['पुन्हा भेटू', 'See you later', 'punha bhetu']],
  ta: [['வணக்கம்', 'Hello', 'vanakkam'], ['காலை வணக்கம்', 'Good morning', 'kaalai vanakkam'], ['மதிய வணக்கம்', 'Good afternoon', 'mathiya vanakkam'], ['மாலை வணக்கம்', 'Good evening', 'maalai vanakkam'], ['இனிய இரவு', 'Good night', 'iniya iravu'], ['நீங்கள் எப்படி இருக்கிறீர்கள்?', 'How are you? (formal)', 'neengal eppadi irukkireergal'], ['நான் நலமாக இருக்கிறேன்', 'I am well', 'naan nalamaga irukkiren'], ['உங்களை சந்தித்ததில் மகிழ்ச்சி', 'Nice to meet you', 'ungalaich santhithathil magizhchi'], ['தயவுசெய்து', 'Please', 'thayavuseythu'], ['நன்றி', 'Thank you', 'nandri'], ['பரவாயில்லை', 'You are welcome', 'paravaayillai'], ['மன்னிக்கவும்', 'Excuse me / Sorry', 'mannikkavum'], ['ஆம்', 'Yes', 'aam'], ['இல்லை', 'No', 'illai'], ['பிரியாவிடை', 'Goodbye', 'priyaavidai'], ['பிறகு சந்திப்போம்', 'See you later', 'piragu santhippom']],
  te: [['నమస్కారం', 'Hello', 'namaskaaram'], ['శుభోదయం', 'Good morning', 'shubhodayam'], ['శుభ మధ్యాహ్నం', 'Good afternoon', 'shubha madhyahnam'], ['శుభ సాయంత్రం', 'Good evening', 'shubha saayantram'], ['శుభ రాత్రి', 'Good night', 'shubha raatri'], ['మీరు ఎలా ఉన్నారు?', 'How are you? (formal)', 'meeru ela unnaru'], ['నేను బాగున్నాను', 'I am well', 'nenu baagunnaanu'], ['మిమ్మల్ని కలవడం సంతోషంగా ఉంది', 'Nice to meet you', 'mimmalni kalavadam santoshanga undi'], ['దయచేసి', 'Please', 'dayachesi'], ['ధన్యవాదాలు', 'Thank you', 'dhanyavaadaalu'], ['పర్వాలేదు', 'You are welcome', 'parvaaledu'], ['క్షమించండి', 'Excuse me / Sorry', 'kshaminchandi'], ['అవును', 'Yes', 'avunu'], ['లేదు', 'No', 'ledu'], ['వీడ్కోలు', 'Goodbye', 'veedkolu'], ['మళ్ళీ కలుద్దాం', 'See you later', 'malli kaluddaam']],
  bn: [['নমস্কার', 'Hello', 'nomoshkar'], ['সুপ্রভাত', 'Good morning', 'suprabhat'], ['শুভ অপরাহ্ণ', 'Good afternoon', 'shubho oporahno'], ['শুভ সন্ধ্যা', 'Good evening', 'shubho shondhya'], ['শুভ রাত্রি', 'Good night', 'shubho ratri'], ['আপনি কেমন আছেন?', 'How are you? (formal)', 'apni kemon achhen'], ['আমি ভালো আছি', 'I am well', 'ami bhalo achhi'], ['আপনার সঙ্গে দেখা হয়ে ভালো লাগল', 'Nice to meet you', 'apnar songe dekha hoye bhalo laglo'], ['দয়া করে', 'Please', 'doya kore'], ['ধন্যবাদ', 'Thank you', 'dhonnobad'], ['স্বাগতম', 'You are welcome', 'shagotom'], ['মাফ করবেন', 'Excuse me / Sorry', 'maf korben'], ['হ্যাঁ', 'Yes', 'hya'], ['না', 'No', 'na'], ['বিদায়', 'Goodbye', 'biday'], ['পরে দেখা হবে', 'See you later', 'pore dekha hobe']],
  pa: [['ਸਤ ਸ੍ਰੀ ਅਕਾਲ', 'Hello', 'sat sri akaal'], ['ਸ਼ੁਭ ਸਵੇਰ', 'Good morning', 'shubh savere'], ['ਸ਼ੁਭ ਦੁਪਹਿਰ', 'Good afternoon', 'shubh dupahir'], ['ਸ਼ੁਭ ਸ਼ਾਮ', 'Good evening', 'shubh shaam'], ['ਸ਼ੁਭ ਰਾਤ', 'Good night', 'shubh raat'], ['ਤੁਸੀਂ ਕਿਵੇਂ ਹੋ?', 'How are you? (formal)', 'tusi kive ho'], ['ਮੈਂ ਠੀਕ ਹਾਂ', 'I am well', 'main theek haan'], ['ਤੁਹਾਨੂੰ ਮਿਲ ਕੇ ਖੁਸ਼ੀ ਹੋਈ', 'Nice to meet you', 'tuhanu mil ke khushi hoi'], ['ਕਿਰਪਾ ਕਰਕੇ', 'Please', 'kirpa karke'], ['ਧੰਨਵਾਦ', 'Thank you', 'dhannvaad'], ['ਕੋਈ ਗੱਲ ਨਹੀਂ', 'You are welcome', 'koi gall nahin'], ['ਮਾਫ਼ ਕਰਨਾ', 'Excuse me / Sorry', 'maaf karna'], ['ਹਾਂ', 'Yes', 'haan'], ['ਨਹੀਂ', 'No', 'nahin'], ['ਅਲਵਿਦਾ', 'Goodbye', 'alvida'], ['ਫਿਰ ਮਿਲਾਂਗੇ', 'See you later', 'phir milange']],
  gu: [['નમસ્તે', 'Hello', 'namaste'], ['સુપ્રભાત', 'Good morning', 'suprabhat'], ['શુભ બપોર', 'Good afternoon', 'shubh bapor'], ['શુભ સાંજ', 'Good evening', 'shubh saanj'], ['શુભ રાત્રિ', 'Good night', 'shubh raatri'], ['તમે કેમ છો?', 'How are you? (formal)', 'tame kem chho'], ['હું મજામાં છું', 'I am well', 'hu majaama chhu'], ['તમને મળીને આનંદ થયો', 'Nice to meet you', 'tamne maline anand thayo'], ['કૃપા કરીને', 'Please', 'krupa karine'], ['આભાર', 'Thank you', 'aabhar'], ['તમારું સ્વાગત છે', 'You are welcome', 'tamaru swagat chhe'], ['માફ કરશો', 'Excuse me / Sorry', 'maaf karsho'], ['હા', 'Yes', 'haa'], ['ના', 'No', 'naa'], ['આવજો', 'Goodbye', 'aavjo'], ['ફરી મળીશું', 'See you later', 'phari malishu']],
  en: [['Hello', 'Hello', 'hello'], ['Good morning', 'Good morning', 'good morning'], ['Good afternoon', 'Good afternoon', 'good afternoon'], ['Good evening', 'Good evening', 'good evening'], ['Good night', 'Good night', 'good night'], ['How are you?', 'How are you?', 'how are you'], ['I am well', 'I am well', 'i am well'], ['Nice to meet you', 'Nice to meet you', 'nice to meet you'], ['Please', 'Please', 'please'], ['Thank you', 'Thank you', 'thank you'], ['You are welcome', 'You are welcome', 'you are welcome'], ['Excuse me', 'Excuse me / Sorry', 'excuse me'], ['Yes', 'Yes', 'yes'], ['No', 'No', 'no'], ['Goodbye', 'Goodbye', 'goodbye'], ['See you later', 'See you later', 'see you later']],
}

function nativeDigits(value, languageId) {
  return String(value).replace(/\d/g, (digit) => digitSets[languageId][Number(digit)])
}

function milestoneWord(value, languageId) {
  const names = numberNames[languageId]
  if (value <= 10) return names[value]
  if (value % 10 === 0) return names[value / 10 + 9]
  // The numeral is intentionally retained for irregular 11–99 forms. The audio
  // service receives this localized numeral and speaks it in the selected locale.
  return nativeDigits(value, languageId)
}

export function createComprehensiveFoundationLessons(languageId, languageName) {
  const phraseVocabulary = greetings[languageId].map(([word, translation, pronunciation]) => ({ word, translation, pronunciation, example: word }))
  const first = phraseVocabulary[0]

  // Pure authentic milestone number words (0–10, 20, 30, 40, 50, 60, 70, 80, 90, 100)
  const milestoneValues = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
  const numberVocabulary = milestoneValues.map((value) => ({
    word: milestoneWord(value, languageId),
    translation: milestoneWord(value, 'en'),
    pronunciation: milestoneWord(value, languageId),
    audioText: milestoneWord(value, languageId),
    example: milestoneWord(value, languageId),
  }))

  return [
    {
      id: `${languageId}-complete-greetings`, name: 'Complete Greetings & Courtesy', nameNative: first.word,
      unit: 'Foundation: Conversation', order: 90,
      description: 'Sixteen useful greetings, introductions, polite words, and farewells.', vocabulary: phraseVocabulary,
      exercises: [
        { type: 'multiple-choice', prompt: `What does "${first.word}" mean?`, options: ['Hello', 'Thank you', 'Goodbye', 'Please'], correctAnswer: 'Hello', xp: 10 },
        { type: 'listening', prompt: 'Listen and choose the greeting', audioText: first.word, options: [first.word, phraseVocabulary[9].word, phraseVocabulary[14].word, phraseVocabulary[8].word], correctAnswer: first.word, xp: 15 },
        { type: 'speaking', prompt: `Say this greeting aloud: "${first.word}"`, targetWord: first.word, pronunciation: first.pronunciation, correctAnswer: first.word, xp: 15 },
        { type: 'matching', prompt: 'Match essential greetings with meanings', pairs: phraseVocabulary.slice(0, 6).map((item) => ({ word: item.word, meaning: item.translation })), xp: 20 },
      ],
    },
    {
      id: `${languageId}-numbers-0-100`, name: 'Numbers 0 to 100: Read & Say', nameNative: `${milestoneWord(0, languageId)}–${milestoneWord(100, languageId)}`,
      unit: 'Foundation: Numbers', order: 91,
      description: 'Authentic spelled-out number words for 0–10 and every ten up to 100.', vocabulary: numberVocabulary,
      exercises: [
        {
          type: 'multiple-choice',
          prompt: `What is "${milestoneWord(10, languageId)}" in English?`,
          options: [milestoneWord(10, 'en'), milestoneWord(1, 'en'), milestoneWord(20, 'en'), milestoneWord(100, 'en')],
          correctAnswer: milestoneWord(10, 'en'),
          xp: 10,
        },
        {
          type: 'listening',
          prompt: 'Listen and select the correct number word',
          audioText: milestoneWord(20, languageId),
          options: [milestoneWord(10, languageId), milestoneWord(20, languageId), milestoneWord(30, languageId), milestoneWord(100, languageId)],
          correctAnswer: milestoneWord(20, languageId),
          xp: 15,
        },
        {
          type: 'fill-blank',
          prompt: `Complete the sequence: ${milestoneWord(1, languageId)}, ${milestoneWord(2, languageId)}, ___, ${milestoneWord(4, languageId)}`,
          options: [milestoneWord(3, languageId), milestoneWord(5, languageId), milestoneWord(6, languageId), milestoneWord(7, languageId)],
          correctAnswer: milestoneWord(3, languageId),
          xp: 15,
        },
        {
          type: 'matching',
          prompt: 'Match number words with their English names',
          pairs: [1, 5, 10, 20].map((value) => ({ word: milestoneWord(value, languageId), meaning: milestoneWord(value, 'en') })),
          xp: 20,
        },
      ],
    },
  ]
}

export const comprehensiveFoundationConfig = { digitSets, numberNames, greetings }
