import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext(null)

// UI Translations for Common Site Labels across 8 Languages
export const uiTranslations = {
  learn: {
    en: 'Learn',
    hi: 'सीखें',
    mr: 'शिका',
    ta: 'கற்க',
    te: 'నేర్చుకోండి',
    bn: 'শিখুন',
    pa: 'ਸਿੱਖੋ',
    gu: 'શીખો',
  },
  stories: {
    en: 'Stories',
    hi: 'कहानियाँ',
    mr: 'गोष्टी',
    ta: 'கதைகள்',
    te: 'కథలు',
    bn: 'গল্প',
    pa: 'ਕਹਾਣੀਆਂ',
    gu: 'વાર્તાઓ',
  },
  tutor: {
    en: 'AI Tutor',
    hi: 'एआई शिक्षक',
    mr: 'एआय शिक्षक',
    ta: 'AI ஆசிரியர்',
    te: 'AI ట్యూటర్',
    bn: 'এআই শিক্ষক',
    pa: 'AI ਅਧਿਆਪਕ',
    gu: 'AI ટ્યુટર',
  },
  dashboard: {
    en: 'Dashboard',
    hi: 'डैशबोर्ड',
    mr: 'डॅशबोर्ड',
    ta: 'முகப்பு',
    te: 'డ్యాష్‌బోర్డ్',
    bn: 'ড্যাশবোর্ড',
    pa: 'ਡੈਸ਼ਬੋਰਡ',
    gu: 'ડેશબોર્ડ',
  },
  letters: {
    en: 'Letters / Script',
    hi: 'वर्णमाला / अक्षर',
    mr: 'मुळाक्षरे / लिपी',
    ta: 'எழுத்துக்கள்',
    te: 'అక్షరమాల',
    bn: 'বর্ণমালা',
    pa: 'ਵਰਣਮਾਲਾ',
    gu: 'મૂળાક્ષરો',
  },
  practice: {
    en: 'Practice',
    hi: 'अभ्यास',
    mr: 'सराव',
    ta: 'பயிற்சி',
    te: 'సాధన',
    bn: 'অনুশীলন',
    pa: 'ਅਭਿਆਸ',
    gu: 'અભ્યાસ',
  },
  leaderboard: {
    en: 'Leaderboard',
    hi: 'लीडरबोर्ड',
    mr: 'लीडरबोर्ड',
    ta: 'முன்னிலை பலகை',
    te: 'లీడర్‌బోర్డ్',
    bn: 'লিডারবোর্ড',
    pa: 'ਲੀਡਰਬੋਰਡ',
    gu: 'લીડરબોર્ડ',
  },
  curriculum: {
    en: 'Curriculum CMS',
    hi: 'पाठ्यक्रम',
    mr: 'अभ्यासक्रम',
    ta: 'பாடத்திட்டம்',
    te: 'పాఠ్య ప్రణాళిక',
    bn: 'পাঠ্যক্রম',
    pa: 'ਪਾਠਕ੍ਰਮ',
    gu: 'અભ્યાસક્રમ',
  },
  profile: {
    en: 'Profile',
    hi: 'प्रोफ़ाइल',
    mr: 'प्रोफाइल',
    ta: 'சுயவிவரம்',
    te: 'ప్రొఫైల్',
    bn: 'প্রোফাইল',
    pa: 'ਪ੍ਰੋਫਾਈਲ',
    gu: 'પ્રોફાઇલ',
  },
  settings: {
    en: 'Settings',
    hi: 'सेटिंग्स',
    mr: 'सेटिंग्ज',
    ta: 'அமைப்புகள்',
    te: 'సెట్టింగ్‌లు',
    bn: 'সেটিংস',
    pa: 'ਸੈਟਿੰਗਾਂ',
    gu: 'સેટિંગ્સ',
  },
  streak: {
    en: 'Streak',
    hi: 'लगातार दिन',
    mr: 'सलग दिवस',
    ta: 'தொடர் நாட்கள்',
    te: 'వరుస రోజులు',
    bn: 'ধারাবাহিকতা',
    pa: 'ਲੜੀਵਾਰ ਦਿਨ',
    gu: 'સળંગ દિવસો',
  },
  gems: {
    en: 'Gems',
    hi: 'रत्न / सिक्के',
    mr: 'रत्ने / नाणी',
    ta: 'மணிகள்',
    te: 'మణులు',
    bn: 'রত্ন',
    pa: 'ਹੀਰੇ',
    gu: 'રત્નો',
  },
  daily_goal: {
    en: 'Daily Goal',
    hi: 'दैनिक लक्ष्य',
    mr: 'दैनिक ध्येय',
    ta: 'தினசரி இலக்கு',
    te: 'రోజువారీ లక్ష్యం',
    bn: 'দৈনিক লক্ষ্য',
    pa: 'ਰੋਜ਼ਾਨਾ ਟੀਚਾ',
    gu: 'દૈનિક લક્ષ્ય',
  },
  quests: {
    en: 'Daily Quests',
    hi: 'दैनिक लक्ष्य',
    mr: 'दैनिक आव्हाने',
    ta: 'தினசரி பணிகள்',
    te: 'రోజువారీ టాస్క్‌లు',
    bn: 'দৈনিক মিশন',
    pa: 'ਰੋਜ਼ਾਨਾ ਚੁਣੌਤੀਆਂ',
    gu: 'દૈનિક મિશન',
  },
  theme: {
    en: 'Theme',
    hi: 'थीम',
    mr: 'थीम',
    ta: 'தீம்',
    te: 'థీమ్',
    bn: 'থিম',
    pa: 'ਥੀਮ',
    gu: 'થીમ',
  },
  site_language: {
    en: 'Site Language',
    hi: 'वेबसाइट भाषा',
    mr: 'वेबसाइट भाषा',
    ta: 'தள மொழி',
    te: 'సైట్ భాష',
    bn: 'সাইট ভাষা',
    pa: 'ਸਾਈਟ ਭਾਸ਼ਾ',
    gu: 'સાઇટ ભાષા',
  },
  continue: {
    en: 'Continue',
    hi: 'आगे बढ़ें',
    mr: 'पुढे जा',
    ta: 'தொடரவும்',
    te: 'కొనసాగించు',
    bn: 'চালিয়ে যান',
    pa: 'ਜਾਰੀ ਰੱਖੋ',
    gu: 'આગળ વધો',
  },
  check_answer: {
    en: 'Check Answer',
    hi: 'उत्तर जांचें',
    mr: 'उत्तर तपासा',
    ta: 'பதிலைச் சரிபார்க்கவும்',
    te: 'సమాధానం సరిచూడండి',
    bn: 'উত্তর পরীক্ষা করুন',
    pa: 'ਜਵਾਬ ਚੈੱਕ ਕਰੋ',
    gu: 'જવાબ ચકાસો',
  },
  excellent: {
    en: '✓ Excellent!',
    hi: '✓ बहुत बढ़िया!',
    mr: '✓ उत्तम!',
    ta: '✓ அற்புதம்!',
    te: '✓ అద్భుతం!',
    bn: '✓ চমৎকার!',
    pa: '✓ ਬਹੁਤ ਵਧੀਆ!',
    gu: '✓ ઉત્તમ!',
  },
  not_quite: {
    en: '✗ Not quite right',
    hi: '✗ सही नहीं है',
    mr: '✗ थोडे चुकले',
    ta: '✗ தவறு',
    te: '✗ సరికాదు',
    bn: '✗ সঠিক নয়',
    pa: '✗ ਗ਼ਲਤ ਹੈ',
    gu: '✗ ખોટું છે',
  },
  writing_practice: {
    en: 'Writing Practice',
    hi: 'लेखन अभ्यास',
    mr: 'लेखन सराव',
    ta: 'எழுத்துப் பயிற்சி',
    te: 'రాత సాధన',
    bn: 'লেখার অনুশীলন',
    pa: 'ਲਿਖਣ ਅਭਿਆਸ',
    gu: 'લેખન અભ્યાસ',
  },
  writing_unavailable_msg: {
    en: 'Interactive writing practice is not yet available for this script.',
    hi: 'इस लिपि के लिए इंटरैक्टिव लेखन अभ्यास अभी उपलब्ध नहीं है।',
    mr: 'या लिपीसाठी परस्परसंवादी लेखन सराव अद्याप उपलब्ध नाही.',
    ta: 'இந்த எழுத்துமுறைக்கான ஊடாடும் எழுத்துப் பயிற்சி இன்னும் கிடைக்கவில்லை.',
    te: 'ఈ లిపి కోసం ఇంటరాక్టివ్ రాత సాధన ఇంకా అందుబాటులో లేదు.',
    bn: 'এই লিপির জন্য ইন্টারঅ্যাক্টিভ লেখার অনুশীলন এখনও উপলব্ধ নয়।',
    pa: 'ਇਸ ਲਿਪੀ ਲਈ ਇੰਟਰਐਕਟਿਵ ਲਿਖਣ ਅਭਿਆਸ ਅਜੇ ਉਪਲਬਧ ਨਹੀਂ ਹੈ।',
    gu: 'આ લિપિ માટે ઇન્ટરેક્ટિવ લેખન અભ્યાસ હજી ઉપલબ્ધ નથી.',
  },
  writing_practice_alt_msg: {
    en: 'Practice reading and speaking meanwhile.',
    hi: 'इस बीच पढ़ने और बोलने का अभ्यास करें।',
    mr: 'तोपर्यंत वाचन आणि बोलण्याचा सराव करा.',
    ta: 'இதற்கிடையில் வாசிப்பு மற்றும் பேசும் பயிற்சியைச் செய்யவும்.',
    te: 'ఈలోగా చదవడం మరియు మాట్లాడటం సాధన చేయండి.',
    bn: 'ইতিমধ্যে পড়া এবং বলার অনুশীলন করুন।',
    pa: 'ਇਸ ਦੌਰਾਨ ਪੜ੍ਹਨ ਅਤੇ ਬੋਲਣ ਦਾ ਅਭਿਆਸ ਕਰੋ।',
    gu: 'આ દરમિયાન વાંચન અને બોલવાનો અભ્યાસ કરો.',
  },
  back_to_dashboard: {
    en: 'Back to Dashboard',
    hi: 'डैशबोर्ड पर वापस जाएँ',
    mr: 'डॅशबोर्डवर परत जा',
    ta: 'முகப்புக்குத் திரும்பு',
    te: 'డ్యాష్‌బోర్డ్‌కు తిరిగి వెళ్ళండి',
    bn: 'ড্যাশবোর্ডে ফিরে যান',
    pa: "ਡੈਸ਼ਬੋਰਡ 'ਤੇ ਵਾਪਸ ਜਾਓ",
    gu: 'ડેશબોર્ડ પર પાછા જાઓ',
  },
  explore_alphabet: {
    en: 'Explore Alphabet',
    hi: 'वर्णमाला देखें',
    mr: 'मुळाक्षरे पहा',
    ta: 'எழுத்துக்களை ஆராயுங்கள்',
    te: 'అక్షరమాలను అన్వేషించండి',
    bn: 'বর্ণমালা অন্বেষণ করুন',
    pa: 'ਵਰਣਮਾਲਾ ਦੀ ਪੜਚੋਲ ਕਰੋ',
    gu: 'મૂળાક્ષરો જુઓ',
  },
  match_words_meanings: {
    en: 'Match every word with its meaning',
    hi: 'प्रत्येक शब्द को उसके अर्थ से मिलाएँ',
    mr: 'प्रत्येक शब्द त्याच्या अर्थाशी जुळवा',
    ta: 'ஒவ்வொரு சொல்லையும் அதன் பொருளுடன் பொருத்தவும்',
    te: 'ప్రతి పదాన్ని దాని అర్థంతో సరిపోల్చండి',
    bn: 'প্রতিটি শব্দকে তার অর্থের সাথে মেলান',
    pa: 'ਹਰੇਕ ਸ਼ਬਦ ਨੂੰ ਉਸਦੇ ਅਰਥ ਨਾਲ ਮਿਲਾਓ',
    gu: 'દરેક શબ્દને તેના અર્થ સાથે જોડો',
  },
  type_answer_placeholder: {
    en: 'Type your answer...',
    hi: 'अपना उत्तर टाइप करें...',
    mr: 'तुमचे उत्तर टाइप करा...',
    ta: 'உங்கள் பதிலை தட்டச்சு செய்யவும்...',
    te: 'మీ సమాధానాన్ని టైప్ చేయండి...',
    bn: 'আপনার উত্তর টাইপ করুন...',
    pa: 'ਆਪਣਾ ਜਵਾਬ ਟਾਈਪ ਕਰੋ...',
    gu: 'તમારો જવાબ લખો...',
  },
  unknown_exercise_type: {
    en: 'Unknown exercise type',
    hi: 'अज्ञात अभ्यास प्रकार',
    mr: 'अज्ञात सराव प्रकार',
    ta: 'தெரியாத பயிற்சி வகை',
    te: 'తెలియని అభ్యాస రకం',
    bn: 'অজানা অনুশীলনের ধরন',
    pa: 'ਅਣਜਾਣ ਅਭਿਆਸ ਕਿਸਮ',
    gu: 'અજ્ઞાત અભ્યાસ પ્રકાર',
  },
  legendary_challenge_mode: {
    en: 'LEGENDARY CHALLENGE MODE',
    hi: 'दिग्गज चुनौती मोड',
    mr: 'लेजेंडरी आव्हान मोड',
    ta: 'புகழ்பெற்ற சவால் முறை',
    te: 'లెజెండరీ ఛాలెంజ్ మోడ్',
    bn: 'কিংবদন্তি চ্যালেঞ্জ মোড',
    pa: 'ਮਹਾਨ ਚੁਣੌਤੀ ਮੋਡ',
    gu: 'દિગ્ગજ પડકાર મોડ',
  },
  accuracy: {
    en: 'Accuracy',
    hi: 'सटीकता',
    mr: 'अचूकता',
    ta: 'துல்லியம்',
    te: 'ఖచ్చితత్వం',
    bn: 'নির্ভুলতা',
    pa: 'ਸ਼ੁੱਧਤਾ',
    gu: 'ચોકસાઈ',
  },
  adapts_dynamically: {
    en: 'Adapts Dynamically',
    hi: 'गतिशील रूप से अनुकूलित',
    mr: 'गतिशीलपणे जुळवून घेतो',
    ta: 'மாறும் தகவமைப்பு',
    te: 'డైనమిక్ అనుకూలత',
    bn: 'গতিশীল অভিযোজন',
    pa: 'ਗਤੀਸ਼ੀਲ ਅਨੁਕੂਲਨ',
    gu: 'ગતિશીલ અનુકૂલન',
  },
  answer_label: {
    en: 'Answer',
    hi: 'उत्तर',
    mr: 'उत्तर',
    ta: 'பதில்',
    te: 'సమాధానం',
    bn: 'উত্তর',
    pa: 'ਜਵਾਬ',
    gu: 'જવાબ',
  },
  answer_shown: {
    en: 'Answer Revealed',
    hi: 'उत्तर दिखाया गया',
    mr: 'उत्तर दाखवले',
    ta: 'பதில் காட்டப்பட்டது',
    te: 'సమాధానం చూపబడింది',
    bn: 'উত্তর দেখানো হয়েছে',
    pa: 'ਜਵਾਬ ਦਿਖਾਇਆ ਗਿਆ',
    gu: 'જવાબ દર્શાવ્યો',
  },
  claim_reward: {
    en: 'Claim Reward',
    hi: 'पुरस्कार प्राप्त करें',
    mr: 'बक्षीस मिळवा',
    ta: 'வெகுமதியை பெறுங்கள்',
    te: 'బహుమతిని పొందండి',
    bn: 'পুরস্কার দাবি করুন',
    pa: 'ਇਨਾਮ ਪ੍ਰਾਪਤ ਕਰੋ',
    gu: 'ઇનામ મેળવો',
  },
  claimed: {
    en: 'Claimed',
    hi: 'प्राप्त किया',
    mr: 'मिळाले',
    ta: 'பெறப்பட்டது',
    te: 'పొందారు',
    bn: 'দাবি করা হয়েছে',
    pa: 'ਪ੍ਰਾਪਤ ਹੋਇਆ',
    gu: 'મેળવેલ',
  },
  complete_lesson: {
    en: 'Complete Lesson',
    hi: 'पाठ पूरा करें',
    mr: 'धडा पूर्ण करा',
    ta: 'பாடத்தை முடிக்கவும்',
    te: 'పాఠాన్ని పూర్తి చేయండి',
    bn: 'পাঠ সম্পূর্ণ করুন',
    pa: 'ਪਾਠ ਪੂਰਾ ਕਰੋ',
    gu: 'પાઠ પૂર્ણ કરો',
  },
  continue_lesson: {
    en: 'Your Next Lesson',
    hi: 'आपका अगला पाठ',
    mr: 'तुमचा पुढचा धडा',
    ta: 'உங்கள் அடுத்த பாடம்',
    te: 'మీ తదుపరి పాఠం',
    bn: 'আপনার পরবর্তী পাঠ',
    pa: 'ਤੁਹਾਡਾ ਅਗਲਾ ਪਾਠ',
    gu: 'તમારો આગામી પાઠ',
  },
  correct_answer_is: {
    en: 'Correct answer is',
    hi: 'सही उत्तर है',
    mr: 'योग्य उत्तर आहे',
    ta: 'சரியான பதில்',
    te: 'సరైన సమాధానం',
    bn: 'সঠিক উত্তর হল',
    pa: 'ਸਹੀ ਜਵਾਬ ਹੈ',
    gu: 'સાચો જવાબ છે',
  },
  current_streak: {
    en: 'Current Streak',
    hi: 'वर्तमान स्ट्रीक',
    mr: 'चालू स्ट्रीक',
    ta: 'தற்போதைய தொடர்ச்சி',
    te: 'ప్రస్తుత స్ట్రీక్',
    bn: 'বর্তমান ধারাবাহিকতা',
    pa: 'ਮੌਜੂਦਾ ਸਟ੍ਰੀਕ',
    gu: 'વર્તમાન સ્ટ્રીક',
  },
  exercise_counter: {
    en: 'Exercise',
    hi: 'अभ्यास',
    mr: 'स्वाध्याय',
    ta: 'பயிற்சி',
    te: 'వ్యాయామం',
    bn: 'অনুশীলন',
    pa: 'ਅਭਿਆਸ',
    gu: 'કસરત',
  },
  exit: {
    en: 'Exit',
    hi: 'बाहर निकलें',
    mr: 'बाहेर पडा',
    ta: 'வெளியேறு',
    te: 'నిష్క్రమించు',
    bn: 'প্রস্থান',
    pa: 'ਬਾਹਰ ਨਿਕਲੋ',
    gu: 'બહાર નીકળો',
  },
  fill_blank: {
    en: 'Fill in the Blank',
    hi: 'रिक्त स्थान भरें',
    mr: 'गाळलेली जागा भरा',
    ta: 'கோடிட்ட இடத்தை நிரப்புக',
    te: 'ఖాళీలను పూరించండి',
    bn: 'শূন্যস্থান পূরণ করুন',
    pa: 'ਖਾਲੀ ਥਾਂ ਭਰੋ',
    gu: 'ખાલી જગ્યા પૂરો',
  },
  learner_stats: {
    en: 'Learner Statistics',
    hi: 'शिक्षार्थी आंकड़े',
    mr: 'शिकणाऱ्याची आकडेवारी',
    ta: 'கற்றல் புள்ளிவிவரங்கள்',
    te: 'అభ్యాసకుని గణాంకాలు',
    bn: 'শিক্ষার্থীর পরিসংখ্যান',
    pa: 'ਸਿੱਖਣ ਵਾਲੇ ਦੇ ਅੰਕੜੇ',
    gu: 'શિક્ષણ આંકડા',
  },
  listening: {
    en: 'Listening',
    hi: 'सुनना',
    mr: 'ऐकणे',
    ta: 'கேட்டல்',
    te: 'వినడం',
    bn: 'শোনা',
    pa: 'ਸੁਣਨਾ',
    gu: 'સાંભળવું',
  },
  live_translator: {
    en: 'Live Translator',
    hi: 'लाइव अनुवादक',
    mr: 'थेट अनुवादक',
    ta: 'நேரடி மொழிபெயர்ப்பாளர்',
    te: 'లైవ్ అనువాదకుడు',
    bn: 'লাইভ অনুবাদক',
    pa: 'ਲਾਈਵ ਅਨੁਵਾਦਕ',
    gu: 'લાઇવ અનુવાદક',
  },
  longest_streak: {
    en: 'Longest Streak',
    hi: 'सबसे लंबी स्ट्रीक',
    mr: 'दीर्घकालीन स्ट्रीक',
    ta: 'நீண்ட தொடர்ச்சி',
    te: 'సుదీర్ఘ స్ట్రీక్',
    bn: 'দীর্ঘতম ধারাবাহিকতা',
    pa: 'ਸਭ ਤੋਂ ਲੰਬੀ ਸਟ੍ਰੀਕ',
    gu: 'સૌથી લાંબી સ્ટ્રીક',
  },
  matched_all: {
    en: 'Matched All',
    hi: 'सभी सुमेलित',
    mr: 'सर्व जुळले',
    ta: 'அனைத்தும் பொருந்தியது',
    te: 'అన్నీ సరిపోలాయి',
    bn: 'সব মিলেছে',
    pa: 'ਸਾਰੇ ਮੇਲ ਖਾਂਦੇ ਹਨ',
    gu: 'બધા મેળ ખાધા',
  },
  matching: {
    en: 'Matching Pairs',
    hi: 'जोड़े मिलाएं',
    mr: 'जोड्या जुळवा',
    ta: 'பொருத்துக',
    te: 'జోడించండి',
    bn: 'জোড়া মেলান',
    pa: 'ਜੋੜੇ ਮਿਲਾਓ',
    gu: 'જોડકાં જોડો',
  },
  meaning: {
    en: 'Meaning',
    hi: 'अर्थ',
    mr: 'अर्थ',
    ta: 'பொருள்',
    te: 'అర్థం',
    bn: 'অর্থ',
    pa: 'ਅਰਥ',
    gu: 'અર્થ',
  },
  mode: {
    en: 'Mode',
    hi: 'मोड',
    mr: 'पद्धती',
    ta: 'முறை',
    te: 'మోడ్',
    bn: 'মোড',
    pa: 'ਮੋਡ',
    gu: 'સ્થિતિ',
  },
  need_hint: {
    en: 'Need a hint?',
    hi: 'संकेत चाहिए?',
    mr: 'संकेत हवा आहे?',
    ta: 'குறிப்பு வேண்டுமா?',
    te: 'సూచన కావాలా?',
    bn: 'ইঙ্গিত চান?',
    pa: 'ਕੋਈ ਸੰਕੇਤ ਚਾਹੀਦਾ ਹੈ?',
    gu: 'સંકેત જોઈએ છે?',
  },
  need_review: {
    en: 'Review Now',
    hi: 'अभी दोहराएं',
    mr: 'आता उजळणी करा',
    ta: 'இப்போது மதிப்பாய்வு செய்க',
    te: 'இప్పుడే సమీక్షించండి',
    bn: 'এখন পর্যালোচনা করুন',
    pa: 'ਹੁਣ ਸਮੀਖਿਆ ਕਰੋ',
    gu: 'હમણાં પુનરાવર્તન કરો',
  },
  of_word: {
    en: 'of',
    hi: 'का',
    mr: 'चे',
    ta: 'இல்',
    te: 'యొక్క',
    bn: 'এর',
    pa: 'ਦਾ',
    gu: 'નું',
  },
  perfect_lesson: {
    en: 'Flawless Mastery! 100% Correct',
    hi: 'शानदार निपुणता! 100% सही',
    mr: 'उत्कृष्ट प्राविण्य! 100% बरोबर',
    ta: 'சிறந்த தேர்ச்சி! 100% சரி',
    te: 'అద్భుతమైన ప్రావీణ్యం! 100% సరైనది',
    bn: 'চমৎকার দক্ষতা! ১০০% সঠিক',
    pa: 'ਸ਼ਾਨਦਾਰ ਮੁਹਾਰਤ! 100% ਸਹੀ',
    gu: 'ઉત્કૃષ્ટ નિપુણતા! 100% સાચું',
  },
  personalized_path: {
    en: 'Personalized Path',
    hi: 'व्यक्तिगत शिक्षण पथ',
    mr: 'वैयक्तिक शिकण्याचा मार्ग',
    ta: 'தனிப்பயனாக்கப்பட்ட கற்றல் பாதை',
    te: 'వ్యక్తిగతీకరించిన అభ్యాస మార్గం',
    bn: 'ব্যক্তিগতকৃত শিক্ষার পথ',
    pa: 'ਵਿਅਕਤੀਗਤ ਸਿੱਖਣ ਦਾ ਮਾਰਗ',
    gu: 'વ્યક્તિગત શિક્ષણ પથ',
  },
  rank_top_3: {
    en: 'Top 3 Learner',
    hi: 'शीर्ष 3 शिक्षार्थी',
    mr: 'शीर्ष ३ विद्यार्थी',
    ta: 'முதல் 3 கற்பவர்',
    te: 'టాప్ 3 అభ్యాసకుడు',
    bn: 'শীর্ষ ৩ শিক্ষার্থী',
    pa: 'ਸਿਖਰਲੇ 3 ਸਿੱਖਣ ਵਾਲੇ',
    gu: 'ટોચના 3 શીખનાર',
  },
  reading: {
    en: 'Reading',
    hi: 'पढ़ना',
    mr: 'वाचणे',
    ta: 'படித்தல்',
    te: 'చదవడం',
    bn: 'পড়া',
    pa: 'ਪੜ੍ਹਨਾ',
    gu: 'વાંચન',
  },
  review_candidates: {
    en: 'Words to Review',
    hi: 'दोहराने के लिए शब्द',
    mr: 'उजळणीसाठी शब्द',
    ta: 'மதிப்பாய்வு செய்ய வேண்டிய சொற்கள்',
    te: 'సమీక్షించాల్సిన పదాలు',
    bn: 'পর্যালোচনা করার শব্দ',
    pa: 'ਦੁਹਰਾਉਣ ਵਾਲੇ ਸ਼ਬਦ',
    gu: 'પુનરાવર્તન કરવા માટેના શબ્દો',
  },
  sentence_order: {
    en: 'Sentence Construction',
    hi: 'वाक्य निर्माण',
    mr: 'वाक्य रचना',
    ta: 'வாக்கிய உருவாக்கம்',
    te: 'వాక్య నిర్మాణం',
    bn: 'বাক্য গঠন',
    pa: 'ਵਾਕ ਬਣਤਰ',
    gu: 'વાક્ય રચના',
  },
  speaking: {
    en: 'Speaking',
    hi: 'बोलना',
    mr: 'बोलणे',
    ta: 'பேசுதல்',
    te: 'మాట్లాడటం',
    bn: 'বলা',
    pa: 'ਬੋਲਣਾ',
    gu: 'બોલવું',
  },
  speaking_skipped: {
    en: 'Speaking Skipped',
    hi: 'बोलना छोड़ दिया गया',
    mr: 'बोलणे वगळले',
    ta: 'பேசுதல் தவிர்க்கப்பட்டது',
    te: 'మాట్లాడటం దాటవేయబడింది',
    bn: 'বলা এড়িয়ে যাওয়া হয়েছে',
    pa: 'ਬੋਲਣਾ ਛੱਡ ਦਿੱਤਾ',
    gu: 'બોલવાનું છોડી દીધું',
  },
  start_lesson: {
    en: 'Start Lesson',
    hi: 'पाठ शुरू करें',
    mr: 'धडा सुरू करा',
    ta: 'பாடத்தைத் தொடங்கு',
    te: 'పాఠాన్ని ప్రారంభించండి',
    bn: 'পাঠ শুরু করুন',
    pa: 'ਪਾਠ ਸ਼ੁਰੂ ਕਰੋ',
    gu: 'પાઠ શરૂ કરો',
  },
  tap_words_prompt: {
    en: 'Tap the words in the correct order',
    hi: 'शब्दों को सही क्रम में टैप करें',
    mr: 'शब्द योग्य क्रमाने टॅप करा',
    ta: 'சொற்களை சரியான வரிசையில் தட்டவும்',
    te: 'పదాలను సరైన క్రమంలో నొక్కండి',
    bn: 'সঠিক ক্রমে শব্দগুলোতে আলতো চাপুন',
    pa: 'ਸ਼ਬਦਾਂ ਨੂੰ ਸਹੀ ਕ੍ਰਮ ਵਿੱਚ ਟੈਪ ਕਰੋ',
    gu: 'શબ્દોને સાચા ક્રમમાં ટેપ કરો',
  },
  translate_to_target: {
    en: 'Translate to',
    hi: 'अनुवाद करें',
    mr: 'अनुवाद करा',
    ta: 'மொழிபெயர்க்கவும்',
    te: 'అనువదించండి',
    bn: 'অনুবাদ করুন',
    pa: 'ਅਨੁਵਾਦ ਕਰੋ',
    gu: 'અનુવાદ કરો',
  },
  translator_placeholder: {
    en: 'Type a word or phrase...',
    hi: 'कोई शब्द या वाक्य टाइप करें...',
    mr: 'शब्द किंवा वाक्य टाइप करा...',
    ta: 'ஒரு சொல் அல்லது சொற்றொடரை தட்டச்சு செய்க...',
    te: 'ఒక పదం లేదా పదబంధాన్ని టైప్ చేయండి...',
    bn: 'একটি শব্দ বা বাক্যাংশ লিখুন...',
    pa: 'ਕੋਈ ਸ਼ਬਦ ਜਾਂ ਵਾਕਾਂਸ਼ ਲਿਖੋ...',
    gu: 'શબ્દ અથવા વાક્ય લખો...',
  },
  try_it_now: {
    en: 'Try It Now',
    hi: 'अभी आज़माएं',
    mr: 'आता वापरून पहा',
    ta: 'இப்போது முயற்சிக்கவும்',
    te: 'ఇప్పుడే ప్రయత్నించండి',
    bn: 'এখনই চেষ্টা করুন',
    pa: 'ਹੁਣ ਅਜ਼ਮਾਓ',
    gu: 'હમણાં અજમાવો',
  },
  view_leaderboard: {
    en: 'View Leaderboard',
    hi: 'लीडरबोर्ड देखें',
    mr: 'लीडरबोर्ड पहा',
    ta: 'லீடர்போர்டைக் காண்க',
    te: 'లీడర్‌బోర్డ్‌ను చూడండి',
    bn: 'লিডারবোর্ড দেখুন',
    pa: 'ਲੀਡਰਬੋਰਡ ਦੇਖੋ',
    gu: 'લીડરબોર્ડ જુઓ',
  },
  writing: {
    en: 'Writing',
    hi: 'लेखन',
    mr: 'लेखन',
    ta: 'எழுதுதல்',
    te: 'రాయడం',
    bn: 'লেখা',
    pa: 'ਲਿਖਣਾ',
    gu: 'લેખન',
  },
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    try {
      return localStorage.getItem('bharatlingo_theme') || 'light'
    } catch (e) {
      return 'light'
    }
  })

  const [siteLanguage, setSiteLanguageState] = useState(() => {
    try {
      return localStorage.getItem('bharatlingo_site_lang') || 'en'
    } catch (e) {
      return 'en'
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem('bharatlingo_theme', theme)
      if (theme === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    } catch (e) {
      console.error(e)
    }
  }, [theme])

  useEffect(() => {
    try {
      localStorage.setItem('bharatlingo_site_lang', siteLanguage)
    } catch (e) {
      console.error(e)
    }
  }, [siteLanguage])

  const setTheme = (newTheme) => {
    if (newTheme === 'dark' || newTheme === 'light') {
      setThemeState(newTheme)
    }
  }

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'))
  }

  const setSiteLanguage = (langId) => {
    if (langId) {
      setSiteLanguageState(langId)
    }
  }

  // Translation helper for UI labels
  const t = (key) => {
    if (!key) return ''
    const entry = uiTranslations[key]
    if (!entry) return key
    return entry[siteLanguage] || entry['en'] || key
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        siteLanguage,
        setSiteLanguage,
        t,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
