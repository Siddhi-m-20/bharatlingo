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
    bn: () => 'যে শব্দটি শুনেছেন সেটি বেছে নিন',
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
    ta: () => 'சொற்களை அவற்றின் அர்த்தங்களுடன் பொருத்துங்கள்',
    te: () => 'పదాలను వాటి అర్థాలతో సరిపోల్చండి',
  },
  // Sentence Ordering / Reorder
  sentence_order: {
    en: (w) => `Arrange the words in correct order: "${w}"`,
    hi: (w) => `शब्दों को सही क्रम में व्यवस्थित करें: "${w}"`,
    mr: (w) => `शब्द योग्य अनुक्रमाने लावा: "${w}"`,
    gu: (w) => `શબ્દોને યોગ્ય ક્રમમાં ગોઠવો: "${w}"`,
    bn: (w) => `শব্দগুলি সঠিক ক্রমে সাজান: "${w}"`,
    pa: (w) => `ਸ਼ਬਦਾਂ ਨੂੰ ਸਹੀ ਕ੍ਰਮ ਵਿੱਚ ਵਿਵਸਥਿਤ ਕਰੋ: "${w}"`,
    ta: (w) => `சொற்களை சரியான வரிசையில் അടുக்கவும்: "${w}"`,
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
    mr: (w) => `"${w}" साठी योग्य शब्द टाईप करा:`,
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
      gu: 'નમસ્ਤੇ',
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
    key: 'goodbye',
    translations: {
      en: 'Goodbye',
      hi: 'अलविदा',
      mr: 'निरोप / पुन्हा भेटू',
      ta: 'சென்று வருகிறேன்',
      te: 'వీడ్కోలు',
      bn: 'বিদায়',
      pa: 'ਅਲਵਿਦਾ',
      gu: 'આવજો',
    },
    pronunciations: {
      hi: 'alvida',
      mr: 'nirop',
      ta: 'sendru varugiren',
      te: 'veedkolu',
      bn: 'biday',
      pa: 'alvida',
      gu: 'aavjo',
      en: 'goodbye',
    },
  },
  {
    key: 'friend',
    translations: {
      en: 'Friend',
      hi: 'मित्र / दोस्त',
      mr: 'मित्र',
      ta: 'நண்பர்',
      te: 'స్నేహితుడు',
      bn: 'বন্ধু',
      pa: 'ਦੋਸਤ / ਮਿੱਤਰ',
      gu: 'મિત્ર',
    },
    pronunciations: {
      hi: 'mitra',
      mr: 'mitra',
      ta: 'nanbar',
      te: 'snehithudu',
      bn: 'bondhu',
      pa: 'dost',
      gu: 'mitra',
      en: 'friend',
    },
  },
  {
    key: 'good_night',
    translations: {
      en: 'Good night',
      hi: 'शुभ रात्रि',
      mr: 'शुभ रात्री',
      ta: 'இனிய இரவு',
      te: 'శుభరాాత్రి',
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
      bn: 'বাড়ি / ঘর',
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
      hi: 'हां',
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
      hi: 'कहां?',
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

  // Numbers 0 to 10 & Milestones
  {
    key: '0',
    translations: { en: 'Zero', hi: 'शून्य', mr: 'शून्य', ta: 'பூஜ்ஜியம்', te: 'సున్నా', bn: 'শূন্য', pa: 'ਸਿਫ਼ਰ', gu: 'શૂન્ય' },
    pronunciations: { en: 'zero', hi: 'shunya', mr: 'shunya', ta: 'poojjiyam', te: 'sunna', bn: 'shunno', pa: 'sifar', gu: 'shunya' },
  },
  {
    key: '1',
    translations: { en: 'One', hi: 'एक', mr: 'एक', ta: 'ஒன்று', te: 'ఒకటి', bn: 'এক', pa: 'ਇੱਕ', gu: 'એક' },
    pronunciations: { en: 'one', hi: 'ek', mr: 'ek', ta: 'ondru', te: 'okati', bn: 'ek', pa: 'ikk', gu: 'ek' },
  },
  {
    key: '2',
    translations: { en: 'Two', hi: 'दो', mr: 'दोन', ta: 'இரண்டு', te: 'రెండు', bn: 'দুই', pa: 'ਦੋ', gu: 'બે' },
    pronunciations: { en: 'two', hi: 'do', mr: 'don', ta: 'irandu', te: 'rendu', bn: 'dui', pa: 'do', gu: 'be' },
  },
  {
    key: '3',
    translations: { en: 'Three', hi: 'तीन', mr: 'तीन', ta: 'மூன்று', te: 'మూడు', bn: 'তিন', pa: 'ਤਿੰਨ', gu: 'ત્રણ' },
    pronunciations: { en: 'three', hi: 'teen', mr: 'teen', ta: 'moondru', te: 'moodu', bn: 'tin', pa: 'tinn', gu: 'tran' },
  },
  {
    key: '4',
    translations: { en: 'Four', hi: 'चार', mr: 'चार', ta: 'நான்கு', te: 'నాలుగు', bn: 'চার', pa: 'ਚਾਰ', gu: 'ચાર' },
    pronunciations: { en: 'four', hi: 'chaar', mr: 'chaar', ta: 'naangu', te: 'naalugu', bn: 'chaar', pa: 'chaar', gu: 'chaar' },
  },
  {
    key: '5',
    translations: { en: 'Five', hi: 'पांच', mr: 'पांच', ta: 'ஐந்து', te: 'ఐదు', bn: 'পাঁচ', pa: 'ਪੰਜ', gu: 'પાંચ' },
    pronunciations: { en: 'five', hi: 'paanch', mr: 'paach', ta: 'ainthu', te: 'aidu', bn: 'paanch', pa: 'panj', gu: 'paanch' },
  },
  {
    key: '6',
    translations: { en: 'Six', hi: 'छह', mr: 'सहा', ta: 'ஆறு', te: 'ఆరు', bn: 'ছয়', pa: 'ਛੇ', gu: 'છ' },
    pronunciations: { en: 'six', hi: 'chhah', mr: 'saha', ta: 'aaru', te: 'aaru', bn: 'chhoy', pa: 'chhe', gu: 'chha' },
  },
  {
    key: '7',
    translations: { en: 'Seven', hi: 'सात', mr: 'सात', ta: 'ஏழு', te: 'ఏడు', bn: 'सात', pa: 'ਸੱਤ', gu: 'સાત' },
    pronunciations: { en: 'seven', hi: 'saat', mr: 'saat', ta: 'yezhu', te: 'yedu', bn: 'saat', pa: 'satt', gu: 'saat' },
  },
  {
    key: '8',
    translations: { en: 'Eight', hi: 'आठ', mr: 'आठ', ta: 'எட்டு', te: 'ఎనిమిది', bn: 'আট', pa: 'ਅੱਠ', gu: 'આઠ' },
    pronunciations: { en: 'eight', hi: 'aath', mr: 'aath', ta: 'ettu', te: 'enimidi', bn: 'aat', pa: 'atth', gu: 'aath' },
  },
  {
    key: '9',
    translations: { en: 'Nine', hi: 'नौ', mr: 'नऊ', ta: 'ஒன்பது', te: 'తొమ్మిది', bn: 'নয়', pa: 'ਨੌਂ', gu: 'નવ' },
    pronunciations: { en: 'nine', hi: 'nau', mr: 'nau', ta: 'onbathu', te: 'tommidi', bn: 'noy', pa: 'naun', gu: 'nav' },
  },
  {
    key: '10',
    translations: { en: 'Ten', hi: 'दस', mr: 'दहा', ta: 'பத்து', te: 'పది', bn: 'দশ', pa: 'ਦਸ', gu: 'દસ' },
    pronunciations: { en: 'ten', hi: 'das', mr: 'daha', ta: 'patthu', te: 'padi', bn: 'dosh', pa: 'das', gu: 'das' },
  },
  {
    key: '20',
    translations: { en: 'Twenty', hi: 'बीस', mr: 'वीस', ta: 'இருபது', te: 'ఇరవై', bn: 'বিশ', pa: 'ਵੀਹ', gu: 'વીસ' },
    pronunciations: { en: 'twenty', hi: 'bees', mr: 'vees', ta: 'irubathu', te: 'iravai', bn: 'bish', pa: 'veeh', gu: 'vees' },
  },
  {
    key: '100',
    translations: { en: 'One hundred', hi: 'सौ', mr: 'शंभर', ta: 'நூறு', te: 'వంద', bn: 'একশো', pa: 'ਸੌ', gu: 'સો' },
    pronunciations: { en: 'hundred', hi: 'sau', mr: 'shambhar', ta: 'nooru', te: 'vanda', bn: 'eksho', pa: 'sau', gu: 'so' },
  },
  // Family & Relations
  {
    key: 'family',
    translations: { en: 'Family', hi: 'परिवार', mr: 'कुटुंब', ta: 'குடும்பம்', te: 'కుటుంబం', bn: 'পরিবার', pa: 'ਪਰਿਵਾਰ', gu: 'પરિવાર' },
    pronunciations: { en: 'family', hi: 'parivaar', mr: 'kutumb', ta: 'kudumbam', te: 'kutumbam', bn: 'poribar', pa: 'parivaar', gu: 'parivaar' },
  },
  {
    key: 'mother',
    translations: { en: 'Mother', hi: 'माँ / माता', mr: 'आई', ta: 'அம்மா', te: 'అమ్మ / తల్లి', bn: 'মা', pa: 'ਮਾਂ', gu: 'માતા' },
    pronunciations: { en: 'mother', hi: 'maa', mr: 'aai', ta: 'amma', te: 'amma', bn: 'maa', pa: 'maan', gu: 'maata' },
  },
  {
    key: 'father',
    translations: { en: 'Father', hi: 'पिताजी / पिता', mr: 'बाबा / वडील', ta: 'அப்பா', te: 'నాన్న / తండ్రి', bn: 'বাবা', pa: 'ਪਿਤਾ', gu: 'પિતા' },
    pronunciations: { en: 'father', hi: 'pita', mr: 'baaba', ta: 'appa', te: 'naanna', bn: 'baba', pa: 'pita', gu: 'pita' },
  },
  {
    key: 'brother',
    translations: { en: 'Brother', hi: 'भाई', mr: 'भाऊ', ta: 'சகோதரன்', te: 'సోదరుడు / అన్న', bn: 'ভাই', pa: 'ਭਰਾ', gu: 'ભાઈ' },
    pronunciations: { en: 'brother', hi: 'bhaai', mr: 'bhaau', ta: 'sagodharan', te: 'sodharudu', bn: 'bhai', pa: 'bhra', gu: 'bhaai' },
  },
  {
    key: 'sister',
    translations: { en: 'Sister', hi: 'बहन', mr: 'बहीण', ta: 'சகோதரி', te: 'సోదరి / అక్క', bn: 'বোন', pa: 'ਭੈਣ', gu: 'બહેન' },
    pronunciations: { en: 'sister', hi: 'behen', mr: 'baheen', ta: 'sagodhari', te: 'sodhari', bn: 'bon', pa: 'bhein', gu: 'bahen' },
  },
  // Travel & Places
  {
    key: 'road',
    translations: { en: 'Road / Street', hi: 'सड़क / रास्ता', mr: 'रस्ता / मार्ग', ta: 'சாலை / தெரு', te: 'రహదారి / వీధి', bn: 'রাস্তা', pa: 'ਸੜਕ / ਰਾਹ', gu: 'રસ્તો' },
    pronunciations: { en: 'road', hi: 'sadak', mr: 'rasta', ta: 'saalai', te: 'rahadaari', bn: 'rasta', pa: 'sadak', gu: 'rasto' },
  },
  {
    key: 'street',
    translations: { en: 'Street', hi: 'गली / सड़क', mr: 'गल्ली / रस्ता', ta: 'தெரு', te: 'వీధి', bn: 'রাস্তা', pa: 'ਗਲੀ', gu: 'શેરી' },
    pronunciations: { en: 'street', hi: 'gali', mr: 'galli', ta: 'theru', te: 'veedhi', bn: 'rasta', pa: 'gali', gu: 'sheri' },
  },
  {
    key: 'market',
    translations: { en: 'Market', hi: 'बाज़ार', mr: 'बाजार', ta: 'சந்தை', te: 'సంత / మార్కెట్', bn: 'বাজার', pa: 'ਬਾਜ਼ਾਰ', gu: 'બજાર' },
    pronunciations: { en: 'market', hi: 'bazaar', mr: 'bazaar', ta: 'santhai', te: 'santa', bn: 'bajar', pa: 'bazaar', gu: 'bazaar' },
  },
  {
    key: 'city',
    translations: { en: 'City', hi: 'शहर / नगर', mr: 'शहर', ta: 'நகரம்', te: 'నగరం', bn: 'শহর', pa: 'ਸ਼ਹਿਰ', gu: 'શહેર' },
    pronunciations: { en: 'city', hi: 'shahar', mr: 'shahar', ta: 'nagaram', te: 'nagaram', bn: 'shohor', pa: 'shehar', gu: 'shahar' },
  },
  {
    key: 'right_side',
    translations: { en: 'Right side', hi: 'दाहिनी ओर', mr: 'उजवी बाजू', ta: 'வலது பக்கம்', te: 'కుడి వైపు', bn: 'ডান দিক', pa: 'ਸੱਜਾ ਪਾਸਾ', gu: 'જમણી બાજુ' },
    pronunciations: { en: 'right side', hi: 'dahini ore', mr: 'ujvi baaju', ta: 'valadhu pakkam', te: 'kudi vaipu', bn: 'dan dik', pa: 'sajja paasa', gu: 'jamni baaju' },
  },
  {
    key: 'left_side',
    translations: { en: 'Left side', hi: 'बाईं ओर', mr: 'डावी बाजू', ta: 'இடது பக்கம்', te: 'ఎడమ వైపు', bn: 'বাম দিক', pa: 'ਖੱਬਾ ਪਾਸਾ', gu: 'ડાબી બાજુ' },
    pronunciations: { en: 'left side', hi: 'baayi ore', mr: 'daavi baaju', ta: 'idathu pakkam', te: 'edama vaipu', bn: 'bam dik', pa: 'khabba paasa', gu: 'daabi baaju' },
  },
  // Emotions
  {
    key: 'happiness',
    translations: { en: 'Happiness / Joy', hi: 'खुशी / आनंद', mr: 'आनंद / सुख', ta: 'மகிழ்ச்சி', te: 'సంతోషం / ఆనందం', bn: 'আনন্দ', pa: 'ਖੁਸ਼ੀ / ਆਨੰਦ', gu: 'આનંદ' },
    pronunciations: { en: 'happiness', hi: 'khushi', mr: 'aanand', ta: 'magizhchi', te: 'santhosham', bn: 'aanondo', pa: 'khushi', gu: 'aanand' },
  },
  {
    key: 'joy',
    translations: { en: 'Joy', hi: 'आनंद', mr: 'आनंद', ta: 'மகிழ்ச்சி', te: 'ఆనందం', bn: 'আনন্দ', pa: 'ਆਨੰਦ', gu: 'આનંદ' },
    pronunciations: { en: 'joy', hi: 'aanand', mr: 'aanand', ta: 'magizhchi', te: 'aanandam', bn: 'aanondo', pa: 'aanand', gu: 'aanand' },
  },
  {
    key: 'sad',
    translations: { en: 'Sad / Sorrow', hi: 'दुःख / उदास', mr: 'दुःख / उदास', ta: 'சோகம்', te: 'బాధ / విచారం', bn: 'দুঃখ', pa: 'ਉਦਾਸ / ਦੁੱਖ', gu: 'દુઃખ' },
    pronunciations: { en: 'sad', hi: 'dukh', mr: 'dukh', ta: 'sogam', te: 'baadha', bn: 'dukho', pa: 'udaas', gu: 'dukh' },
  },
  // Food & Dining
  {
    key: 'rice',
    translations: { en: 'Rice', hi: 'चावल / भात', mr: 'भात / तांदूळ', ta: 'சாதம்', te: 'అన్నం', bn: 'ভাত', pa: 'ਚੌਲ', gu: 'ભાત / ચોખા' },
    pronunciations: { en: 'rice', hi: 'chaawal', mr: 'bhaat', ta: 'saatham', te: 'annam', bn: 'bhaat', pa: 'chaul', gu: 'bhaat' },
  },
  {
    key: 'sweet',
    translations: { en: 'Sweet', hi: 'मीठा', mr: 'गोड', ta: 'இனிப்பு', te: 'తీపి', bn: 'মিষ্টি', pa: 'ਮਿੱਠਾ', gu: 'મીઠું' },
    pronunciations: { en: 'sweet', hi: 'meetha', mr: 'god', ta: 'inippu', te: 'teepi', bn: 'mishti', pa: 'mittha', gu: 'meethu' },
  },
  {
    key: 'bread',
    translations: { en: 'Bread / Roti', hi: 'रोटी', mr: 'पोळी / भाकरी', ta: 'ரொட்டி', te: 'రొట్టె', bn: 'রুটি', pa: 'ਰੋਟੀ', gu: 'રોટલી' },
    pronunciations: { en: 'bread', hi: 'roti', mr: 'poli', ta: 'rotti', te: 'rotte', bn: 'ruti', pa: 'roti', gu: 'rotli' },
  },
  // Culture & Weather
  {
    key: 'festival',
    translations: { en: 'Festival', hi: 'त्योहार / उत्सव', mr: 'सण / उत्सव', ta: 'திருவிழா', te: 'పండుగ', bn: 'উৎসব', pa: 'ਤਿਉਹਾਰ', gu: 'તહેવાર / ઉત્સવ' },
    pronunciations: { en: 'festival', hi: 'tyohaar', mr: 'san', ta: 'thiruvizha', te: 'panduga', bn: 'utshob', pa: 'tiuhaar', gu: 'tahevaar' },
  },
  {
    key: 'hot',
    translations: { en: 'Hot', hi: 'गरम', mr: 'गरम', ta: 'சூடான', te: 'వేడి', bn: 'গরম', pa: 'ਗਰਮ', gu: 'ગરમ' },
    pronunciations: { en: 'hot', hi: 'garam', mr: 'garam', ta: 'soodaana', te: 'vedi', bn: 'gorom', pa: 'garam', gu: 'garam' },
  },
  {
    key: 'cold',
    translations: { en: 'Cold', hi: 'ठंडा', mr: 'थंड', ta: 'குளிர்ந்த', te: 'చల్లని', bn: 'ঠান্ডা', pa: 'ਠੰਡਾ', gu: 'ઠંડું' },
    pronunciations: { en: 'cold', hi: 'thanda', mr: 'thanda', ta: 'kulirntha', te: 'challani', bn: 'thanda', pa: 'thanda', gu: 'thandu' },
  },
  {
    key: 'rain',
    translations: { en: 'Rain', hi: 'बारिश / वर्षा', mr: 'पाऊस', ta: 'மழை', te: 'వర్షం', bn: 'বৃষ্টি', pa: 'ਮੀਂਹ', gu: 'વરસાદ' },
    pronunciations: { en: 'rain', hi: 'baarish', mr: 'paaus', ta: 'mazhai', te: 'varsham', bn: 'brishti', pa: 'meenh', gu: 'varsaad' },
  },
  {
    key: 'sun',
    translations: { en: 'Sun', hi: 'सूरज / सूर्य', mr: 'सूर्य / ऊन', ta: 'சூரியன்', te: 'సూర్యుడు', bn: 'সূর্য', pa: 'ਸੂਰਜ', gu: 'સૂર્ય' },
    pronunciations: { en: 'sun', hi: 'sooraj', mr: 'soorya', ta: 'sooriyan', te: 'sooryudu', bn: 'shurjo', pa: 'sooraj', gu: 'soorya' },
  },
  {
    key: 'money',
    translations: { en: 'Money', hi: 'पैसे / धन', mr: 'पैसे', ta: 'பணம்', te: 'డబ్బు', bn: 'টাকা', pa: 'ਪੈਸੇ', gu: 'પૈસા' },
    pronunciations: { en: 'money', hi: 'paise', mr: 'paise', ta: 'panam', te: 'dabbu', bn: 'taka', pa: 'paise', gu: 'paisa' },
  },
  {
    key: 'price',
    translations: { en: 'Price / Cost', hi: 'कीमत / दाम', mr: 'किंमत / दर', ta: 'விலை', te: 'ధర', bn: 'দাম', pa: 'ਕੀਮਤ', gu: 'કિંમત / ભાવ' },
    pronunciations: { en: 'price', hi: 'keemat', mr: 'kimmat', ta: 'vilai', te: 'dhara', bn: 'daam', pa: 'keemat', gu: 'kimmat' },
  },
  {
    key: 'welcome',
    translations: { en: 'You are welcome', hi: 'स्वागत है', mr: 'स्वागत आहे', ta: 'நல்வரவு', te: 'స్వాగతం', bn: 'স্বাগতম', pa: 'ਜੀ ਆਇਆਂ ਨੂੰ', gu: 'સ્વાગત છે' },
    pronunciations: { en: 'welcome', hi: 'swagat hai', mr: 'swagat aahe', ta: 'nalvaravu', te: 'swagatham', bn: 'shagotom', pa: 'ji aayan nu', gu: 'swagat chhe' },
  },
  {
    key: 'excuse_me',
    translations: { en: 'Excuse me / Sorry', hi: 'माफ़ कीजिए', mr: 'माफ करा', ta: 'மன்னிக்கவும்', te: 'క్షమించండి', bn: 'মাফ করবেন', pa: 'ਮਾਫ਼ ਕਰਨਾ', gu: 'માફ કરશો' },
    pronunciations: { en: 'excuse me', hi: 'maaf kijiye', mr: 'maaf kara', ta: 'mannikkavum', te: 'kshaminchandi', bn: 'maf korben', pa: 'maaf karna', gu: 'maaf karsho' },
  },
  {
    key: 'see_you',
    translations: { en: 'See you later', hi: 'फिर मिलेंगे', mr: 'पुन्हा भेटू', ta: 'பிறகு சந்திப்போம்', te: 'మళ్ళీ కలుద్దాం', bn: 'পরে দেখা হবে', pa: 'ਫਿਰ ਮਿਲਾਂਗੇ', gu: 'ફરી મળીશું' },
    pronunciations: { en: 'see you later', hi: 'phir milenge', mr: 'punha bhetu', ta: 'piragu santhippom', te: 'malli kaluddaam', bn: 'pore dekha hobe', pa: 'phir milange', gu: 'phari malishu' },
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

// ── Number Digit to Language String Conversion ──────────────────────────────
export const NUMBER_WORDS_MAP = {
  0: { en: 'Zero', hi: 'शून्य', mr: 'शून्य', ta: 'பூஜ்ஜியம்', te: 'సున్నా', bn: 'শূন্য', pa: 'ਸਿਫ਼ਰ', gu: 'શૂન્ય' },
  1: { en: 'One', hi: 'एक', mr: 'एक', ta: 'ஒன்று', te: 'ఒకటి', bn: 'এক', pa: 'ਇੱਕ', gu: 'એક' },
  2: { en: 'Two', hi: 'दो', mr: 'दोन', ta: 'இரண்டு', te: 'రెండు', bn: 'দুই', pa: 'ਦੋ', gu: 'બે' },
  3: { en: 'Three', hi: 'तीन', mr: 'तीन', ta: 'மூன்று', te: 'మూడు', bn: 'তিন', pa: 'ਤਿੰਨ', gu: 'ત્રણ' },
  4: { en: 'Four', hi: 'चार', mr: 'चार', ta: 'நான்கு', te: 'నాలుగు', bn: 'چار', pa: 'ਚਾਰ', gu: 'ચાર' },
  5: { en: 'Five', hi: 'पांच', mr: 'पांच', ta: 'ஐந்து', te: 'ఐదు', bn: 'পাঁচ', pa: 'ਪੰਜ', gu: 'પાંચ' },
  6: { en: 'Six', hi: 'छह', mr: 'सहा', ta: 'ஆறு', te: 'ఆరు', bn: 'ছয়', pa: 'ਛੇ', gu: 'છ' },
  7: { en: 'Seven', hi: 'सात', mr: 'सात', ta: 'ஏழு', te: 'ఏడు', bn: 'सात', pa: 'ਸੱਤ', gu: 'સાત' },
  8: { en: 'Eight', hi: 'आठ', mr: 'आठ', ta: 'எட்டு', te: 'ఎనిమిది', bn: 'আট', pa: 'ਅੱਠ', gu: 'આઠ' },
  9: { en: 'Nine', hi: 'नौ', mr: 'नऊ', ta: 'ஒன்பது', te: 'తొమ్మిది', bn: 'নয়', pa: 'ਨੌਂ', gu: 'નવ' },
  10: { en: 'Ten', hi: 'दस', mr: 'दहा', ta: 'பத்து', te: 'పది', bn: 'দশ', pa: 'ਦਸ', gu: 'દસ' },
  20: { en: 'Twenty', hi: 'बीस', mr: 'वीस', ta: 'இருபது', te: 'ఇరవై', bn: 'বিশ', pa: 'ਵੀਹ', gu: 'વીસ' },
  30: { en: 'Thirty', hi: 'तीस', mr: 'तीस', ta: 'முப்பது', te: 'ముప్పై', bn: 'ত্রিশ', pa: 'ਤੀਹ', gu: 'ਤ੍ਰੀਸ' },
  50: { en: 'Fifty', hi: 'पचास', mr: 'पन्नास', ta: 'ஐம்பது', te: 'యాభై', bn: 'পঞ্চাশ', pa: 'ਪੰਜਾਬ', gu: 'પચાસ' },
  100: { en: 'One hundred', hi: 'सौ', mr: 'शंभर', ta: 'நூறு', te: 'వంద', bn: 'একশো', pa: 'ਸੌ', gu: 'સો' },
}

const INDIC_DIGIT_MAP = {
  '०': 0, '१': 1, '२': 2, '३': 3, '४': 4, '५': 5, '६': 6, '७': 7, '८': 8, '९': 9,
  '০': 0, '১': 1, '২': 2, '৩': 3, '৪': 4, '৫': 5, '৬': 6, '৭': 7, '৮': 8, '৯': 9,
  '੦': 0, '੧': 1, '੨': 2, '੩': 3, '੪': 4, '੫': 5, '੬': 6, '੭': 7, '੮': 8, '੯': 9,
  '૦': 0, '૧': 1, '૨': 2, '૩': 3, '૪': 4, '૫': 5, '૬': 6, '૭': 7, '૮': 8, '૯': 9,
  '௦': 0, '௧': 1, '௨': 2, '௩': 3, '௪': 4, '௫': 5, '௬': 6, '௭': 7, '௮': 8, '௯': 9,
  '౦': 0, '౧': 1, '౨': 2, '౩': 3, '౪': 4, '౫': 5, '౬': 6, '౭': 7, '౮': 8, '౯': 9,
}

export function digitToLanguageWord(val, langId = 'en') {
  if (val === null || val === undefined) return ''
  const str = String(val).trim()

  // Convert single indic digit if matched
  if (INDIC_DIGIT_MAP[str] !== undefined) {
    const num = INDIC_DIGIT_MAP[str]
    return NUMBER_WORDS_MAP[num]?.[langId] || NUMBER_WORDS_MAP[num]?.['en'] || str
  }

  // Parse standard ASCII numeric string (e.g. "4", "10")
  if (/^\d+$/.test(str)) {
    const num = parseInt(str, 10)
    if (NUMBER_WORDS_MAP[num]) {
      return NUMBER_WORDS_MAP[num][langId] || NUMBER_WORDS_MAP[num]['en'] || str
    }
  }

  return str
}

const GENERAL_VOCAB_FALLBACKS = {
  en: ['Hello', 'Thank you', 'Please', 'Goodbye', 'Friend', 'Water', 'Good morning', 'Welcome', 'Home', 'Yes'],
  hi: ['नमस्ते', 'धन्यवाद', 'कृपया', 'अलविदा', 'मित्र', 'पानी', 'सुप्रभात', 'स्वागत', 'घर', 'हां'],
  mr: ['नमस्कार', 'धन्यवाद', 'कृपया', 'निरोप', 'मित्र', 'पाणी', 'शुभ प्रभात', 'स्वागत', 'घर', 'होय'],
  ta: ['வணக்கம்', 'நன்றி', 'தயவுசெய்து', 'பிரியாவிடை', 'நண்பர்', 'தண்ணீர்', 'காலை வணக்கம்', 'வரவேற்பு', 'வீடு', 'ஆம்'],
  te: ['నమస్కారం', 'ధన్యవాదాలు', 'దయచేసి', 'వీడ్కోలు', 'స్నేహితుడు', 'నీరు', 'శుభోదయం', 'స్వాగతం', 'ఇల్లు', 'అవును'],
  bn: ['নমস্কার', 'ধন্যবাদ', 'দয়া করে', 'বিদায়', 'বন্ধু', 'জল', 'সুপ্রভাত', 'স্বাগতম', 'বাড়ি', 'হ্যাঁ'],
  pa: ['ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ', 'ਧੰਨਵਾਦ', 'ਕਿਰਪਾ ਕਰਕੇ', 'ਅਲਵਿਦਾ', 'ਦੋਸਤ', 'ਪਾਣੀ', 'ਸ਼ੁਭ ਸਵੇਰ', 'ਜੀ ਆਇਆਂ ਨੂੰ', 'ਘਰ', 'ਹਾਂ'],
  gu: ['નમસ્તે', 'આભાર', 'કૃપા કરીને', 'આવજો', 'મિત્ર', 'પાણી', 'સુપ્રભાત', 'સ્વાગત', 'ઘર', 'હા'],
}

/**
 * Deduplicate and ensure clean language string options (no bare digits, no duplicates like "4 4", no synthetic "99 — 99")
 */
export function sanitizeLanguageOptions(options = [], correctAnswer = '', langId = 'en', count = 4) {
  let cleanAns = digitToLanguageWord(correctAnswer, langId)
  const correctWords = cleanAns ? String(cleanAns).trim().split(/\s+/).length : 1

  const isInvalidOption = (s) => {
    if (!s) return true
    const str = String(s).trim()
    if (!str) return true
    // Bare ASCII or Indic digits
    if (/^\d+$/.test(str)) return true
    if (/^[\u0966-\u096F\u09E6-\u09EF\u0A66-\u0A6F\u0AE6-\u0AEF\u0BE6-\u0BEF\u0C66-\u0C6F]+$/.test(str)) return true
    // Synthetic number strings like "99 — 99", "32 - 32", "12 — 12"
    if (/\d+\s*[-—–]\s*\d+/.test(str)) return true
    if (/^[\d\s\-—–]+$/.test(str)) return true
    // Reject full sentences with terminal punctuation
    if (/[.?!।]$/.test(str)) return true
    // If testing a single word or short term, reject full sentence proverbs (> 3 words)
    const wCount = str.split(/\s+/).length
    if (correctWords <= 2 && wCount > 3) return true
    if (correctWords >= 4 && wCount <= 1) return true
    return false
  }

  if (isInvalidOption(cleanAns)) {
    const parsed = parseInt(String(cleanAns).replace(/\D/g, ''), 10)
    cleanAns = NUMBER_WORDS_MAP[parsed]?.[langId] || NUMBER_WORDS_MAP[parsed]?.['en'] || 'One'
  }

  const cleaned = (options || [])
    .map((opt) => digitToLanguageWord(opt, langId))
    .filter((opt) => !isInvalidOption(opt))

  // Ensure cleanAns is included and unique
  const unique = []
  const seen = new Set()

  if (cleanAns && !isInvalidOption(cleanAns)) {
    unique.push(cleanAns)
    seen.add(cleanAns.toLowerCase())
  }

  for (const opt of cleaned) {
    if (isInvalidOption(opt)) continue
    const lower = opt.toLowerCase()
    if (!seen.has(lower)) {
      seen.add(lower)
      unique.push(opt)
    }
  }

  // Determine whether this exercise is about numbers
  const isNumberExercise = Object.values(NUMBER_WORDS_MAP).some(
    (entry) => Object.values(entry).some((w) => String(w).toLowerCase() === String(cleanAns).toLowerCase())
  )

  if (isNumberExercise) {
    const fallbackNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    for (const n of fallbackNumbers) {
      if (unique.length >= count) break
      const word = NUMBER_WORDS_MAP[n]?.[langId] || NUMBER_WORDS_MAP[n]?.['en']
      if (word && !seen.has(word.toLowerCase())) {
        seen.add(word.toLowerCase())
        unique.push(word)
      }
    }
  } else {
    // Contextual vocabulary fallbacks for regular language questions
    const fallbacks = GENERAL_VOCAB_FALLBACKS[langId] || GENERAL_VOCAB_FALLBACKS['en']
    for (const word of fallbacks) {
      if (unique.length >= count) break
      if (word && !seen.has(word.toLowerCase())) {
        seen.add(word.toLowerCase())
        unique.push(word)
      }
    }
  }

  // Shuffle so correct answer isn't always first
  return unique.slice(0, count).sort(() => Math.random() - 0.5)
}

export const TOPIC_NAMES_LOCALIZED = {
  greetings: {
    en: 'Greetings & Etiquette', hi: 'अभिवादन और शिष्टाचार', mr: 'अभिवादन आणि शिष्टाचार',
    gu: 'અભિવાદન અને શિષ્ટાચાર', ta: 'வாழ்த்துக்கள்', te: 'శుభాకాంక్షలు',
    bn: 'অভিবাদন ও শিষ্টাচার', pa: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ ਤੇ ਸ਼ਿਸ਼ਟਾਚਾਰ',
  },
  everyday: {
    en: 'Everyday Essentials', hi: 'दैनिक उपयोग', mr: 'दैनिक संभाषण',
    gu: 'રોજિંદા શબ્દો', ta: 'அன்றாட பயன்பாடு', te: 'రోజువారీ మాటలు',
    bn: 'দৈনন্দিন প্রয়োজনীয়তা', pa: 'ਰੋਜ਼ਾਨਾ ਵਰਤੋਂ',
  },
  food: {
    en: 'Food & Dining', hi: 'खान-पान और भोजन', mr: 'अन्न आणि जेवण',
    gu: 'ખોરાક અને ભોજન', ta: 'உணவு மற்றும் விருந்து', te: 'ఆహారం మరియు భోజనం',
    bn: 'খাবার ও পানীয়', pa: 'ਖਾਣਾ-ਪੀਣਾ',
  },
  numbers: {
    en: 'Numbers & Counting', hi: 'संख्याएं और गिनती', mr: 'अंक आणि मोजणी',
    gu: 'સંખ્યાઓ અને ગણતરી', ta: 'எண்கள் மற்றும் கணக்கீடு', te: 'సంఖ్యలు మరియు లెక్కింపు',
    bn: 'সংখ্যা ও গণনা', pa: 'ਅੰਕ ਅਤੇ ਗਿਣਤੀ',
  },
  family: {
    en: 'Family & Relations', hi: 'परिवार और रिश्ते', mr: 'कुटुंब आणि नातेसंबंध',
    gu: 'પરિવાર અને સંબંધો', ta: 'குடும்பம் மற்றும் உறவுகள்', te: 'కుటుంబం మరియు బంధాలు',
    bn: 'পরিবার ও সম্পর্ক', pa: 'ਪਰਿਵਾਰ ਅਤੇ ਰਿਸ਼ਤੇ',
  },
  travel: {
    en: 'Travel & Directions', hi: 'यात्रा और दिशाएं', mr: 'प्रवास आणि दिशा',
    gu: 'પ્રવાસ અને દિશાઓ', ta: 'பயணம் மற்றும் திசைகள்', te: 'ప్రయాణం మరియు దిశలు',
    bn: 'ভ্রমণ ও দিকনির্দেশ', pa: 'ਯਾਤਰਾ ਅਤੇ ਦਿਸ਼ਾਵਾਂ',
  },
  market: {
    en: 'Shopping & Market', hi: 'खरीदारी और बाज़ार', mr: 'खरेदी आणि बाजार',
    gu: 'ખરીદી અને બજાર', ta: 'ஷாப்பிங் மற்றும் சந்தை', te: 'షాపింగ్ మరియు మార్కెట్',
    bn: 'কেনাকাটা ও বাজার', pa: 'ਖਰੀਦਦਾਰੀ ਅਤੇ ਬਾਜ਼ਾਰ',
  },
  grammar: {
    en: 'Grammar & Syntax', hi: 'व्याकरण और वाक्य रचना', mr: 'व्याकरण आणि वाक्यरचना',
    gu: 'વ્યાકરણ અને વાક્યરચના', ta: 'இலக்கணம்', te: 'వ్యాకరణం',
    bn: 'ব্যাকরণ ও বাক্যগঠন', pa: 'ਵਿਆਕਰਣ',
  },
  weather: {
    en: 'Weather & Seasons', hi: 'मौसम और ऋतुएं', mr: 'हवामान आणि ऋतू',
    gu: 'હવામાન અને ઋતુઓ', ta: 'வானிலை மற்றும் பருவங்கள்', te: 'వాతావరణం మరియు రుతువులు',
    bn: 'আবহাওয়া ও ঋতু', pa: 'ਮੌਸਮ ਅਤੇ ਰੁੱਤਾਂ',
  },
  emotions: {
    en: 'Emotions & Feelings', hi: 'भावनाएं और संवेदनाएं', mr: 'भावना आणि संवेदना',
    gu: 'લાગણીઓ અને ભાવો', ta: 'உணர்வுகள்', te: 'భావోద్వేగాలు',
    bn: 'আবেগ ও অনুভূতি', pa: 'ਭਾਵਨਾਵਾਂ',
  },
  culture: {
    en: 'Culture & Traditions', hi: 'संस्कृति और परंपराएं', mr: 'संस्कृती आणि परंपरा',
    gu: 'સંસ્કૃતિ અને પરંપરાઓ', ta: 'கலாச்சாரம் மற்றும் மரபுகள்', te: 'సంస్కృతి మరియు సంప్రదాయాలు',
    bn: 'সংস্কৃতি ও ঐতিহ্য', pa: 'ਸੱਭਿਆਚਾਰ ਅਤੇ ਪਰੰਪਰਾਵਾਂ',
  },
}

export function getLocalizedTopicName(topicIdOrObj, langId = 'en') {
  if (!topicIdOrObj) return ''
  const topicId = typeof topicIdOrObj === 'string' ? topicIdOrObj.toLowerCase() : (topicIdOrObj.id || '').toLowerCase()
  const entry = TOPIC_NAMES_LOCALIZED[topicId]
  if (entry) {
    return entry[langId] || entry['en'] || (typeof topicIdOrObj === 'object' ? topicIdOrObj.name : topicId)
  }
  return typeof topicIdOrObj === 'object' ? topicIdOrObj.name : topicIdOrObj
}
