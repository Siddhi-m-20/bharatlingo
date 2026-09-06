// Cross-lingual translation dictionary and prompt templates for BharatLingo
// Supports: Hindi (hi), Marathi (mr), Tamil (ta), Telugu (te), Bengali (bn),
// Punjabi (pa), Gujarati (gu), English (en)

export const promptTemplates = {
  // Meaning / Multiple Choice
  meaning: {
    en: (w) => `What does "${w}" mean?`,
    hi: (w) => `"${w}" का क्या अर्थ है?`,
    mr: (w) => `"${w}" चा अर्थ काय आहे?`,
    gu: (w) => `"${w}" નો અર્થ શું થાય?`,
    bn: (w) => `"${w}" এর অর্থ কী?`,
    pa: (w) => `"${w}" ਦਾ ਕੀ ਮਤਲਬ ਹੈ?`,
    ta: (w) => `"${w}" என்பதன் பொருள் என்ன?`,
    te: (w) => `"${w}" అంటే ఏమిటి?`,
  },
  // Translate to Target
  translate_to_target: {
    en: (w, targetName) => `Translate "${w}" to ${targetName}`,
    hi: (w, targetName) => `"${w}" का ${targetName} में अनुवाद करें`,
    mr: (w, targetName) => `"${w}" चा ${targetName} मध्ये अनुवाद करा`,
    gu: (w, targetName) => `"${w}" નો ${targetName} માં અનુવાદ કરો`,
    bn: (w, targetName) => `"${w}" কে ${targetName}-এ অনুবাদ করুন`,
    pa: (w, targetName) => `"${w}" ਦਾ ${targetName} ਵਿੱਚ ਅਨੁਵਾਦ ਕਰੋ`,
    ta: (w, targetName) => `"${w}" ஐ ${targetName} மொழியில் மொழிபெயர்க்கவும்`,
    te: (w, targetName) => `"${w}" ను ${targetName} లో అనువదించండి`,
  },
  // Listening
  listening: {
    en: () => 'Select the word you hear',
    hi: () => 'सुने गए शब्द का चयन करें',
    mr: () => 'ऐकलेला शब्द निवडा',
    gu: () => 'સાંભળેલો શબ્દ પસંદ કરો',
    bn: () => 'যে শব্দটি শুনছেন সেটি বেছে নিন',
    pa: () => 'ਸੁਣਿਆ ਗਿਆ ਸ਼ਬਦ ਚੁਣੋ',
    ta: () => 'நீங்கள் கேட்கும் சொல்லைத் தேர்ந்தெடுக்கவும்',
    te: () => 'మీరు విన్న పదాన్ని ఎంచుకోండి',
  },
  // Speaking
  speaking: {
    en: (w) => `Tap the mic and speak: "${w}"`,
    hi: (w) => `माइक दबाएं और बोलें: "${w}"`,
    mr: (w) => `माईक दाबा आणि बोला: "${w}"`,
    gu: (w) => `માઇક દબાવો અને બોલો: "${w}"`,
    bn: (w) => `মাইকে চাপ দিন এবং বলুন: "${w}"`,
    pa: (w) => `ਮਾਈਕ ਦਬਾਓ ਅਤੇ ਬੋਲੋ: "${w}"`,
    ta: (w) => `மைக்கை அழுத்தி பேசவும்: "${w}"`,
    te: (w) => `మైక్ నొక్కి మాట్లాడండి: "${w}"`,
  },
  // Word Bank / Sentence builder
  word_bank: {
    en: (w) => `Build the correct translation for: "${w}"`,
    hi: (w) => `"${w}" का सही अनुवाद बनाएं:`,
    mr: (w) => `"${w}" चे योग्य भाषांतर तयार करा:`,
    gu: (w) => `"${w}" નો સાચો અનુવાદ બનાવો:`,
    bn: (w) => `"${w}" এর সঠিক অনুবাদ তৈরি করুন:`,
    pa: (w) => `"${w}" ਦਾ ਸਹੀ ਅਨੁਵਾਦ ਬਣਾਓ:`,
    ta: (w) => `"${w}" என்பதற்கான சரியான மொழிபெயர்ப்பை உருவாக்குங்கள்:`,
    te: (w) => `"${w}" కొరకు సరైన అనువాదాన్ని రూపొందించండి:`,
  },
  // Matching pairs
  matching: {
    en: () => 'Match the following words with their meanings',
    hi: () => 'शब्दों का उनके सही अर्थ से मिलान करें',
    mr: () => 'शब्दांच्या योग्य अर्थांशी जोड्या लावा',
    gu: () => 'શબ્દોને તેમના સાચા અર્થ સાથે જોડો',
    bn: () => 'শব্দগুলোর সাথে সঠিক অর্থ মিলান',
    pa: () => 'ਸ਼ਬਦਾਂ ਨੂੰ ਉਹਨਾਂ ਦੇ ਸਹੀ ਅਰਥਾਂ ਨਾਲ ਮਿਲਾਓ',
    ta: () => 'சொற்களை அவற்றின் அர்த்தங்களுடன் பொருத்தவும்',
    te: () => 'పదాలను వాటి అర్థాలతో సరిపోల్చండి',
  },
  // Sentence Ordering / Reorder
  sentence_order: {
    en: (w) => `Arrange the words in correct order: "${w}"`,
    hi: (w) => `शब्दों को सही क्रम में व्यवस्थित करें: "${w}"`,
    mr: (w) => `शब्द योग्य क्रमाने लावा: "${w}"`,
    gu: (w) => `શબ્દોને યોગ્ય ક્રમમાં ગોઠવો: "${w}"`,
    bn: (w) => `শব্দগুলি সঠিক ক্রমে সাজান: "${w}"`,
    pa: (w) => `ਸ਼ਬਦਾਂ ਨੂੰ ਸਹੀ ਕ੍ਰਮ ਵਿੱਚ ਵਿਵਸਥਿਤ ਕਰੋ: "${w}"`,
    ta: (w) => `சொற்களை சரியான வரிசையில் அடுக்கவும்: "${w}"`,
    te: (w) => `పదాలను సరైన క్రమంలో అమర్చండి: "${w}"`,
  },
  // Fill in the blank
  fill_blank: {
    en: () => 'Fill in the blank with the correct word',
    hi: () => 'रिक्त स्थान में सही शब्द भरें',
    mr: () => 'रिकाम्या जागी योग्य शब्द भरा',
    gu: () => 'ખાલી જગ્યામાં સાચો શબ્દ ભરો',
    bn: () => 'শূন্যস্থানে সঠিক শব্দ বসান',
    pa: () => 'ਖਾਲੀ ਥਾਂ ਵਿੱਚ ਸਹੀ ਸ਼ਬਦ ਭਰੋ',
    ta: () => 'கோடிட்ட இடத்தை சரியான சொல்லால் நிரப்புக',
    te: () => 'ఖాళీని సరైన పదంతో పూరించండి',
  },
  // Reading Comprehension
  reading: {
    en: () => 'Read the passage and answer the question',
    hi: () => 'अनुच्छेद पढ़ें और प्रश्न का उत्तर दें',
    mr: () => 'उतारा वाचा आणि प्रश्नाचे उत्तर द्या',
    gu: () => 'ફકરો વાંચો અને પ્રશ્નનો જવાબ આપો',
    bn: () => 'অনুচ্ছেদটি পড়ুন এবং প্রশ্নের উত্তর দিন',
    pa: () => 'ਪੈਰਾ ਪੜ੍ਹੋ ਅਤੇ ਸਵਾਲ ਦਾ ਜਵਾਬ ਦਿਓ',
    ta: () => 'பத்தியைப் படித்து கேள்விக்கு பதிலளிக்கவும்',
    te: () => 'పేరా చదివి ప్రశ్నకు సమాధానం ఇవ్వండి',
  },
  // Writing / Script practice
  writing: {
    en: (w) => `Type the correct word for: "${w}"`,
    hi: (w) => `"${w}" के लिए सही शब्द टाइप करें:`,
    mr: (w) => `"${w}" साठी योग्य शब्द टाइप करा:`,
    gu: (w) => `"${w}" માટે સાચો શબ્દ લખો:`,
    bn: (w) => `"${w}" এর জন্য সঠিক শব্দ লিখুন:`,
    pa: (w) => `"${w}" ਲਈ ਸਹੀ ਸ਼ਬਦ ਲਿਖੋ:`,
    ta: (w) => `"${w}" என்பதற்கான சரியான சொல்லை தட்டச்சு செய்க:`,
    te: (w) => `"${w}" కొరకు సరైన పదాన్ని టైప్ చేయండి:`,
  },
}

// Master multilingual dictionary for core vocabulary
export const dictionary = [
  // Greetings & Essentials
  {
    key: 'hello',
    translations: {
      en: 'Hello',
      hi: 'नमस्कार / नमस्ते',
      mr: 'नमस्कार',
      ta: 'வணக்கம்',
      te: 'నమస్కారం',
      bn: 'নমস্কার',
      pa: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ',
      gu: 'નમસ્તે',
    },
    pronunciations: {
      hi: 'namaskar',
      mr: 'namaskar',
      ta: 'vanakkam',
      te: 'namaskaram',
      bn: 'nomoshkar',
      pa: 'sat sri akaal',
      gu: 'namaste',
      en: 'hello',
    },
  },
  {
    key: 'thank_you',
    translations: {
      en: 'Thank you',
      hi: 'धन्यवाद',
      mr: 'धन्यवाद',
      ta: 'நன்றி',
      te: 'ధన్యవాదాలు',
      bn: 'ধন্যবাদ',
      pa: 'ਧੰਨਵਾਦ',
      gu: 'આભાર',
    },
    pronunciations: {
      hi: 'dhanyavaad',
      mr: 'dhanyavaad',
      ta: 'nandri',
      te: 'dhanyavaadaalu',
      bn: 'dhonnobad',
      pa: 'dhannvaad',
      gu: 'aabhar',
      en: 'thank you',
    },
  },
  {
    key: 'please',
    translations: {
      en: 'Please',
      hi: 'कृपया',
      mr: 'कृपया',
      ta: 'தயவுசெய்து',
      te: 'దయచేసి',
      bn: 'দয়া করে',
      pa: 'ਕਿਰਪਾ ਕਰਕੇ',
      gu: 'કૃપા કરીને',
    },
    pronunciations: {
      hi: 'kripya',
      mr: 'krupaya',
      ta: 'dhayavuseidhu',
      te: 'dayachesi',
      bn: 'doya kore',
      pa: 'kripa karke',
      gu: 'krupa kareene',
      en: 'please',
    },
  },
  {
    key: 'good_morning',
    translations: {
      en: 'Good morning',
      hi: 'शुभ प्रभात',
      mr: 'शुभ सकाळ',
      ta: 'காலை வணக்கம்',
      te: 'శుభోదయం',
      bn: 'সুপ্রভাত',
      pa: 'ਸ਼ੁਭ ਸਵੇਰ',
      gu: 'શુભ સવાર',
    },
    pronunciations: {
      hi: 'shubh prabhat',
      mr: 'shubh sakaal',
      ta: 'kaalai vanakkam',
      te: 'shubhodhayam',
      bn: 'suprobhat',
      pa: 'shubh saver',
      gu: 'shubh savaar',
      en: 'good morning',
    },
  },
  {
    key: 'good_night',
    translations: {
      en: 'Good night',
      hi: 'शुभ रात्रि',
      mr: 'शुभ रात्री',
      ta: 'இனிய இரவு',
      te: 'శుభరాత్రి',
      bn: 'শুভ রাত্রি',
      pa: 'ਸ਼ੁਭ ਰਾਤ',
      gu: 'શુભ રાત્રિ',
    },
    pronunciations: {
      hi: 'shubh raatri',
      mr: 'shubh raatri',
      ta: 'iniya iravu',
      te: 'shubharathri',
      bn: 'shubho raatri',
      pa: 'shubh raat',
      gu: 'shubh raatri',
      en: 'good night',
    },
  },

  // Everyday words
  {
    key: 'water',
    translations: {
      en: 'Water',
      hi: 'पानी',
      mr: 'पाणी',
      ta: 'தண்ணீர்',
      te: 'నీరు',
      bn: 'জল / পানি',
      pa: 'ਪਾਣੀ',
      gu: 'પાણી',
    },
    pronunciations: {
      hi: 'paani',
      mr: 'paani',
      ta: 'thanneer',
      te: 'neeru',
      bn: 'jol',
      pa: 'paani',
      gu: 'paani',
      en: 'water',
    },
  },
  {
    key: 'food',
    translations: {
      en: 'Food',
      hi: 'खाना / भोजन',
      mr: 'जेवण / अन्न',
      ta: 'உணவு',
      te: 'ఆహారం',
      bn: 'খাবার',
      pa: 'ਖਾਣਾ',
      gu: 'ખોરાક / જમવાનું',
    },
    pronunciations: {
      hi: 'khaana',
      mr: 'jevan',
      ta: 'unavu',
      te: 'aahaaram',
      bn: 'khabar',
      pa: 'khaana',
      gu: 'khorak',
      en: 'food',
    },
  },
  {
    key: 'home',
    translations: {
      en: 'Home / House',
      hi: 'घर',
      mr: 'घर',
      ta: 'வீடு',
      te: 'ఇల్లు',
      bn: 'বাড়ি / ঘর',
      pa: 'ਘਰ',
      gu: 'ઘર',
    },
    pronunciations: {
      hi: 'ghar',
      mr: 'ghar',
      ta: 'veedu',
      te: 'illu',
      bn: 'bari',
      pa: 'ghar',
      gu: 'ghar',
      en: 'home',
    },
  },
  {
    key: 'friend',
    translations: {
      en: 'Friend',
      hi: 'दोस्त / मित्र',
      mr: 'मित्र / मैत्रिण',
      ta: 'நண்பன்',
      te: 'స్నేహితుడు',
      bn: 'বন্ধু',
      pa: 'ਦੋਸਤ / ਮਿੱਤਰ',
      gu: 'મિત્ર / દોસ્ત',
    },
    pronunciations: {
      hi: 'dost',
      mr: 'mitra',
      ta: 'nanban',
      te: 'snehithudu',
      bn: 'bondhu',
      pa: 'dost',
      gu: 'mitra',
      en: 'friend',
    },
  },
  {
    key: 'tea',
    translations: {
      en: 'Tea',
      hi: 'चाय',
      mr: 'चहा',
      ta: 'தேநீர்',
      te: 'టీ / తేనీరు',
      bn: 'চা',
      pa: 'ਚਾਹ',
      gu: 'ચા',
    },
    pronunciations: {
      hi: 'chaay',
      mr: 'chaha',
      ta: 'the-neer',
      te: 'tee',
      bn: 'chaa',
      pa: 'chaah',
      gu: 'chaa',
      en: 'tea',
    },
  },
  {
    key: 'book',
    translations: {
      en: 'Book',
      hi: 'किताब / पुस्तक',
      mr: 'पुस्तक',
      ta: 'புத்தகம்',
      te: 'పుస్తకం',
      bn: 'বই',
      pa: 'ਕਿਤਾਬ',
      gu: 'પુસ્તક / ચોપડી',
    },
    pronunciations: {
      hi: 'kitaab',
      mr: 'pustak',
      ta: 'puthagam',
      te: 'pusthakam',
      bn: 'boi',
      pa: 'kitaab',
      gu: 'pustak',
      en: 'book',
    },
  },
  {
    key: 'yes',
    translations: {
      en: 'Yes',
      hi: 'हाँ',
      mr: 'होय',
      ta: 'ஆம்',
      te: 'అవును',
      bn: 'হ্যাঁ',
      pa: 'ਹਾਂ',
      gu: 'હા',
    },
    pronunciations: {
      hi: 'haan',
      mr: 'hoy',
      ta: 'aam',
      te: 'avunu',
      bn: 'hyaan',
      pa: 'haan',
      gu: 'haa',
      en: 'yes',
    },
  },
  {
    key: 'no',
    translations: {
      en: 'No',
      hi: 'नहीं',
      mr: 'नाही',
      ta: 'இல்லை',
      te: 'కాదు',
      bn: 'না',
      pa: 'ਨਹੀਂ',
      gu: 'ના',
    },
    pronunciations: {
      hi: 'nahin',
      mr: 'naahi',
      ta: 'illai',
      te: 'kaadu',
      bn: 'naa',
      pa: 'nahin',
      gu: 'naa',
      en: 'no',
    },
  },
  {
    key: 'where',
    translations: {
      en: 'Where?',
      hi: 'कहाँ?',
      mr: 'कुठे?',
      ta: 'எங்கே?',
      te: 'ఎక్కడ?',
      bn: 'কোথায়?',
      pa: 'ਕਿੱਥੇ?',
      gu: 'ક્યાં?',
    },
    pronunciations: {
      hi: 'kahaan',
      mr: 'kuthe',
      ta: 'engae',
      te: 'ekkada',
      bn: 'kothay',
      pa: 'kitthe',
      gu: 'kyaan',
      en: 'where',
    },
  },
  {
    key: 'how_are_you',
    translations: {
      en: 'How are you?',
      hi: 'आप कैसे हैं?',
      mr: 'तुम्ही कसे आहात?',
      ta: 'நீங்கள் எப்படி இருக்கிறீர்கள்?',
      te: 'మీరు ఎలా ఉన్నారు?',
      bn: 'আপনি কেমন আছেন?',
      pa: 'ਤੁਸੀਂ ਕਿਵੇਂ ਹੋ?',
      gu: 'તમે કેમ છો?',
    },
    pronunciations: {
      hi: 'aap kaise hain',
      mr: 'tumhi kase aahat',
      ta: 'neengal eppadi irukkeergal',
      te: 'meeru ela unnaaru',
      bn: 'aapni kemon aachen',
      pa: 'tusi kiven ho',
      gu: 'tame kem cho',
      en: 'how are you',
    },
  },
]

// Helper: Get prompt text in the user's preferred language
export function getPromptText(templateKey, preferredLang = 'en', targetLangName = '', word = '') {
  const langKey = promptTemplates[templateKey]?.[preferredLang] ? preferredLang : 'en'
  const templateFn = promptTemplates[templateKey]?.[langKey] || promptTemplates[templateKey]?.['en']
  if (!templateFn) return `Translate: ${word}`
  return templateFn(word, targetNameMap[targetLangName] || targetLangName)
}

// Helper: Get word translation between any two languages
export function getTranslation(wordOrKey, sourceLang = 'en', targetLang = 'hi') {
  const entry = dictionary.find(
    (d) =>
      d.key === wordOrKey ||
      d.translations[sourceLang]?.toLowerCase() === wordOrKey.toLowerCase() ||
      d.translations[targetLang]?.toLowerCase() === wordOrKey.toLowerCase()
  )
  if (entry) {
    return {
      targetWord: entry.translations[targetLang] || entry.translations['en'] || wordOrKey,
      sourceWord: entry.translations[sourceLang] || entry.translations['en'] || wordOrKey,
      pronunciation: entry.pronunciations[targetLang] || '',
    }
  }
  return { targetWord: wordOrKey, sourceWord: wordOrKey, pronunciation: '' }
}

export const targetNameMap = {
  hi: 'हिन्दी (Hindi)',
  mr: 'मराठी (Marathi)',
  ta: 'தமிழ் (Tamil)',
  te: 'తెలుగు (Telugu)',
  bn: 'বাংলা (Bengali)',
  pa: 'ਪੰਜਾਬੀ (Punjabi)',
  gu: 'ગુજરાતી (Gujarati)',
  en: 'English',
}
