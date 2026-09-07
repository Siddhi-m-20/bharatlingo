/**
 * Reading Passages — BharatLingo
 *
 * Short comprehension passages per supported language, shared by the adaptive
 * lesson engine on the client and on the server. A language with no passages
 * returns an empty list rather than another language's content.
 */

export const READING_PASSAGES = {
  hi: [
    { passage: 'राम और सीता अच्छे दोस्त हैं। वे रोज़ साथ खाना खाते हैं। उन्हें चाय बहुत पसंद है।', question: 'राम और सीता क्या हैं?', options: ['अच्छे दोस्त', 'भाई-बहन', 'पड़ोसी', 'शिक्षक-छात्र'], correctAnswer: 'अच्छे दोस्त', translation: 'Ram and Sita are good friends. They eat together every day.' },
    { passage: 'मुंबई एक बड़ा शहर है। यहाँ बहुत लोग रहते हैं। समुद्र किनारे पर चलना अच्छा लगता है।', question: 'मुंबई कैसा शहर है?', options: ['बड़ा शहर', 'छोटा गाँव', 'पहाड़ी इलाका', 'रेगिस्तान'], correctAnswer: 'बड़ा शहर', translation: 'Mumbai is a big city. Many people live here.' },
    { passage: 'सुबह उठकर योग करना स्वास्थ्य के लिए अच्छा है। रोज़ व्यायाम करने से शरीर मज़बूत होता है।', question: 'योग कब करना चाहिए?', options: ['सुबह', 'दोपहर', 'रात', 'शाम'], correctAnswer: 'सुबह', translation: 'Doing yoga after waking up in the morning is good for health.' },
  ],
  mr: [
    { passage: 'पुणे एक सुंदर शहर आहे. येथे अनेक ऐतिहासिक किल्ले आहेत. पावसाळ्यात हे शहर हिरवेगार दिसते.', question: 'पुणे कसे शहर आहे?', options: ['सुंदर', 'जुने', 'गरम', 'लहान'], correctAnswer: 'सुंदर', translation: 'Pune is a beautiful city with historical forts.' },
    { passage: 'आई रोज सकाळी स्वयंपाक करते. ती वरण-भात आणि भाजी बनवते. आमचे कुटुंब एकत्र जेवण करते.', question: 'आई रोज काय करते?', options: ['स्वयंपाक', 'खेळ', 'वाचन', 'बागकाम'], correctAnswer: 'स्वयंपाक', translation: 'Mother cooks every morning. Our family eats together.' },
  ],
  ta: [
    { passage: 'சென்னை தமிழ்நாட்டின் தலைநகரம். இங்கு கோயில்கள் மிகவும் அழகாக இருக்கின்றன. கடற்கரை மிகவும் பிரசித்தி பெற்றது.', question: 'சென்னை எதற்கு பிரசித்தி?', options: ['கடற்கரை', 'மலை', 'ஆறு', 'காடு'], correctAnswer: 'கடற்கரை', translation: 'Chennai is the capital of Tamil Nadu.' },
    { passage: 'அம்மா தினமும் இட்லி சாம்பார் செய்கிறாள். குடும்பம் சேர்ந்து சாப்பிடுகிறது.', question: 'அம்மா தினமும் என்ன செய்கிறாள்?', options: ['சாப்பிட செய்கிறாள்', 'பள்ளி செல்கிறாள்', 'கடை செல்கிறாள்', 'தூங்குகிறாள்'], correctAnswer: 'சாப்பிட செய்கிறாள்', translation: 'Mother makes idli sambar every day.' },
  ],
  te: [
    { passage: 'హైదరాబాద్ ఒక గొప్ప నగరం. ఇక్కడ చార్మినార్ చాలా ప్రసిద్ధి. బిర్యానీ ఇక్కడ చాలా రుచిగా ఉంటుంది.', question: 'హైదరాబాద్‌లో ఏది ప్రసిద్ధి?', options: ['చార్మినార్', 'తాజ్ మహల్', 'గోల్కొండ', 'కుతుబ్ మినార్'], correctAnswer: 'చార్మినార్', translation: 'Hyderabad is a great city. Charminar is very famous here.' },
  ],
  bn: [
    { passage: 'কলকাতা পশ্চিমবঙ্গের রাজধানী। এখানে দুর্গাপূজা খুব ধুমধাম করে পালিত হয়। রসগোল্লা এখানের বিখ্যাত মিষ্টি।', question: 'কলকাতায় কোন মিষ্টি বিখ্যাত?', options: ['রসগোল্লা', 'জিলেপি', 'লাড্ডু', 'বরফি'], correctAnswer: 'রসগোল্লা', translation: 'Kolkata is the capital of West Bengal. Rosogolla is famous here.' },
  ],
  pa: [
    { passage: 'ਅੰਮ੍ਰਿਤਸਰ ਪੰਜਾਬ ਦਾ ਮਹੱਤਵਪੂਰਨ ਸ਼ਹਿਰ ਹੈ। ਇੱਥੇ ਸ੍ਰੀ ਹਰਿਮੰਦਰ ਸਾਹਿਬ ਹੈ। ਲੋਕ ਦੂਰੋਂ ਇੱਥੇ ਆਉਂਦੇ ਹਨ।', question: 'ਅੰਮ੍ਰਿਤਸਰ ਵਿੱਚ ਕੀ ਖਾਸ ਹੈ?', options: ['ਸ੍ਰੀ ਹਰਿਮੰਦਰ ਸਾਹਿਬ', 'ਤਾਜ ਮਹਲ', 'ਕੁਤਬ ਮੀਨਾਰ', 'ਲਾਲ ਕਿਲਾ'], correctAnswer: 'ਸ੍ਰੀ ਹਰਿਮੰਦਰ ਸਾਹਿਬ', translation: 'Amritsar is an important city in Punjab.' },
  ],
  gu: [
    { passage: 'ગુજરાત ભારતનું ઔદ્યોગિક રાજ્ય છે. અહીં નવરાત્રી ઉત્સવ ખૂબ ધામ-ધૂમ સાથે ઊજવાય છે. ઢોકળા ગુજરાતની ખ્યાતનામ વાનગી છે.', question: 'ઢોકળા ક્યાંની ખ્યાતનામ વાનગી છે?', options: ['ગુજરાત', 'પંજાબ', 'ઉત્તર પ્રદેશ', 'ઓડિશા'], correctAnswer: 'ગુજરાત', translation: 'Gujarat is known for Navratri and Dhokla.' },
  ],
  en: [
    { passage: 'India is a land of many languages and cultures. People from different states speak different languages but share a common bond.', question: 'What do people share across India?', options: ['A common bond', 'The same language', 'The same food', 'The same dress'], correctAnswer: 'A common bond', translation: 'India is a land of many cultures.' },
  ],
}

export function getReadingPassages(langId) {
  return READING_PASSAGES[langId] || []
}
