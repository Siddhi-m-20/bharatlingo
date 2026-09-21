/**
 * AI Conversation Tutor Scenarios for BharatLingo
 *
 * Rich, culturally authentic Indian situational roleplays across all supported languages.
 */

export const CONVERSATION_SCENARIOS = [
  {
    id: 'ordering_chai',
    title: 'Ordering Chai & Breakfast',
    icon: '☕',
    difficulty: 'Beginner',
    description: 'Order tea and snacks at a local street stall or cafe.',
    category: 'Food & Dining',
    turns: {
      hi: [
        {
          id: 1,
          tutorMessage: 'नमस्ते! आप क्या लेना पसंद करेंगे?',
          pronunciation: 'Namaste! Aap kya lena pasand karenge?',
          englishMeaning: 'Hello! What would you like to have?',
          expectedKeywords: ['चाय', 'चाहिए', 'देना', 'एक', 'समोसा', 'दो'],
          suggestedReplies: [
            'मुझे एक कप मसाला चाय चाहिए।',
            'एक चाय और दो समोसे दीजिए।',
            'कृपया एक गर्म चाय बना दीजिए।',
          ],
          culturalTip: 'Using "दीजिए" (deejie) or "चाहिए" (chahiye) makes your request polite and respectful.',
          grammarNote: '"चाय" is feminine in Hindi, so we say "गर्म चाय" or "मीठी चाय".',
        },
        {
          id: 2,
          tutorMessage: 'ज़रूर! चाय में चीनी कितनी डालूँ?',
          pronunciation: 'Zaroor! Chai mein cheeni kitni daalun?',
          englishMeaning: 'Sure! How much sugar should I add in the tea?',
          expectedKeywords: ['कम', 'ज्यादा', 'चम्मच', 'बिना', 'मध्यम', 'एक'],
          suggestedReplies: [
            'कम चीनी डालिए।',
            'एक चम्मच चीनी काफी है।',
            'बिना चीनी के दीजिए।',
          ],
          culturalTip: 'Street chaiwalas often default to very sweet tea unless you specify "कम चीनी" (less sugar).',
          grammarNote: '"चीनी" (sugar) is an uncountable feminine noun.',
        },
        {
          id: 3,
          tutorMessage: 'यह लीजिए आपकी गरमा-गरम चाय! कुल बीस रुपये हुए।',
          pronunciation: 'Yeh lijiye aapki garma-garam chai! Kul bees rupaye hue.',
          englishMeaning: 'Here is your piping hot tea! Total is 20 rupees.',
          expectedKeywords: ['धन्यवाद', 'पैसे', 'रुपये', 'लीजिए', 'यूपीआई', 'पे'],
          suggestedReplies: [
            'धन्यवाद! यह लीजिए बीस रुपये।',
            'क्या मैं UPI / ऑनलाइन पे कर सकता हूँ?',
            'बहुत-बहुत धन्यवाद!',
          ],
          culturalTip: 'Digital payments (UPI / QR codes) are universally accepted even at small tea stalls in India.',
          grammarNote: '"सकता हूँ" is used for masculine speaker, "सकती हूँ" for feminine.',
        },
      ],
      mr: [
        {
          id: 1,
          tutorMessage: 'नमस्कार! तुम्हाला काय हवे आहे?',
          pronunciation: 'Namaskar! Tumhala kay have aahe?',
          englishMeaning: 'Hello! What would you like?',
          expectedKeywords: ['चहा', 'हवा', 'द्या', 'एक', 'पोहे', 'वडापाव'],
          suggestedReplies: [
            'मला एक चहा हवा आहे.',
            'एक स्पेशल चहा आणि पोहे द्या.',
            'कृपया एक गरम चहा मिळेल का?',
          ],
          culturalTip: 'In Marathi, "हवा आहे" is preferred for masculine nouns like "चहा", while "हवी आहे" is used for feminine nouns.',
          grammarNote: '"मला चहा हवा आहे" is more natural than "मला चहा पाहिजे".',
        },
        {
          id: 2,
          tutorMessage: 'नक्कीच! साखर किती हवी?',
          pronunciation: 'Nakkich! Sakhar kiti havi?',
          englishMeaning: 'Sure! How much sugar do you want?',
          expectedKeywords: ['कमी', 'साखर', 'चमचा', 'विना', 'मध्यम', 'एक'],
          suggestedReplies: [
            'कमी साखर घाला.',
            'एक चमचा साखर पुरे झाली.',
            'साखरेविना चहा द्या.',
          ],
          culturalTip: 'Cutting Chai (कटिंग चहा) is half a glass of strong spiced tea popular in Maharashtra.',
          grammarNote: '"साखर" (sugar) is feminine in Marathi, so we say "साखर किती हवी?".',
        },
        {
          id: 3,
          tutorMessage: 'हा घ्या तुमचा गरमागरम चहा! एकूण वीस रुपये झाले.',
          pronunciation: 'Ha ghya tumcha garmagaram chaha! Ekun vees rupaye jhale.',
          englishMeaning: 'Here is your hot tea! Total is 20 rupees.',
          expectedKeywords: ['धन्यवाद', 'पैसे', 'रुपये', 'घ्या', 'गुगलपे', 'ऑनलाईन'],
          suggestedReplies: [
            'धन्यवाद! हे घ्या पैसे.',
            'मी ऑनलाइन / UPI ने पैसे देऊ का?',
            'खूप खूप धन्यवाद!',
          ],
          culturalTip: '"हे घ्या" (He ghya) is a polite way of handing something over.',
          grammarNote: '"देऊ का?" is a courteous way to ask "May I give/pay?".',
        },
      ],
      gu: [
        {
          id: 1,
          tutorMessage: 'નમસ્તે! તમારે શું જોઈએ છે?',
          pronunciation: 'Namaste! Tamare shu joie chhe?',
          englishMeaning: 'Hello! What would you like?',
          expectedKeywords: ['ચા', 'જોઈએ', 'આપો', 'એક', 'નાસ્તો'],
          suggestedReplies: [
            'મને એક કપ મસાલા ચા જોઈએ છે.',
            'એક ચા અને ગાંઠિયા આપો.',
          ],
          culturalTip: 'Tea paired with Gathiya or Fafda is an iconic Gujarati breakfast.',
          grammarNote: '"જોઈએ છે" (joie chhe) expresses wanting something.',
        },
        {
          id: 2,
          tutorMessage: 'ચોક્કસ! ખાંડ કેટલી નાખું?',
          pronunciation: 'Chokkas! Khand ketli nakhu?',
          englishMeaning: 'Certainly! How much sugar should I add?',
          expectedKeywords: ['ઓછી', 'ખાંડ', 'ચમચી', 'વગર'],
          suggestedReplies: [
            'ઓછી ખાંડ નાખજો.',
            'એક ચમચી ખાંડ બરાબર છે.',
          ],
          culturalTip: 'Gujarati chai is usually sweet, so ask for "ઓછી ખાંડ" for medium sweetness.',
          grammarNote: '"ખાંડ" is feminine in Gujarati ("કેટલી ખાંડ").',
        },
        {
          id: 3,
          tutorMessage: 'આ રહી તમારી ગરમ ચા! કુલ વીસ રૂપિયા થયા.',
          pronunciation: 'Aa rahi tamari garam cha! Kul vees rupiya thaya.',
          englishMeaning: 'Here is your hot tea! Total is 20 rupees.',
          expectedKeywords: ['આભાર', 'રૂપિયા', 'લો', 'UPI'],
          suggestedReplies: [
            'આભાર! આ લો વીસ રૂપિયા.',
            'હું UPI થી પે કરી શકું?',
          ],
          culturalTip: '"આભાર" (Aabhar) means thank you.',
          grammarNote: '"આ લો" is polite for "Take this".',
        },
      ],
      ta: [
        {
          id: 1,
          tutorMessage: 'வணக்கம்! உங்களுக்கு என்ன வேண்டும்?',
          pronunciation: 'Vanakkam! Ungalukku enna vendum?',
          englishMeaning: 'Hello! What would you like?',
          expectedKeywords: ['டீ', 'வேண்டும்', 'ஒரு', 'வடை'],
          suggestedReplies: [
            'எனக்கு ஒரு கப் டீ வேண்டும்.',
            'ஒரு டீ மற்றும் மெதுவடை கொடுங்கள்.',
          ],
          culturalTip: 'Filter coffee and strong tea stalls are central to Tamil Nadu daily culture.',
          grammarNote: '"வேண்டும்" (vendum) means "want / needed".',
        },
        {
          id: 2,
          tutorMessage: 'சரி! சர்க்கரை எவ்வளவு போட வேண்டும்?',
          pronunciation: 'Sari! Sakkarai evvalavu poda vendum?',
          englishMeaning: 'Okay! How much sugar should I add?',
          expectedKeywords: ['குறைவாக', 'சர்க்கரை', 'ஸ்பூன்', 'இல்லாமல்'],
          suggestedReplies: [
            'குறைவான சர்க்கரை போடுங்கள்.',
            'ஒரு ஸ்பூன் சர்க்கரை போதும்.',
          ],
          culturalTip: '"குறைவாக" means less / minimal.',
          grammarNote: '"போதும்" (podhum) means "is enough".',
        },
        {
          id: 3,
          tutorMessage: 'இந்தாங்க சூடான டீ! மொத்தம் இருபது ரூபாய்.',
          pronunciation: 'Indhaanga soodana tea! Moththam irubadhu roobai.',
          englishMeaning: 'Here is your hot tea! Total is 20 rupees.',
          expectedKeywords: ['நன்றி', 'ரூபாய்', 'இந்தாங்க', 'GPay'],
          suggestedReplies: [
            'நன்றி! இந்தாங்க இருபது ரூபாய்.',
            'நான் UPI மூலம் பணம் செலுத்தலாமா?',
          ],
          culturalTip: '"இந்தாங்க" (Indhaanga) is a polite expression when handing over money or items.',
          grammarNote: '"செலுத்தலாமா" asks permission politely.',
        },
      ],
      te: [
        {
          id: 1,
          tutorMessage: 'నమస్కారం! మీకు ఏమి కావాలి?',
          pronunciation: 'Namaskaram! Meeku emi kaavali?',
          englishMeaning: 'Hello! What would you like?',
          expectedKeywords: ['టీ', 'కావాలి', 'ఒకటి', 'ఇవ్వండి'],
          suggestedReplies: [
            'నాకు ఒక కప్పు టీ కావాలి.',
            'ఒక టీ మరియు సమోసా ఇవ్వండి.',
          ],
          culturalTip: '"ఇవ్వండి" (Ivvandi) is the polite respectful form of "give".',
          grammarNote: '"కావాలి" (kaavali) means "want/need".',
        },
        {
          id: 2,
          tutorMessage: 'తప్పకుండా! పంచదార ఎంత వేయాలి?',
          pronunciation: 'Tappakunda! Panchadara entha veyaali?',
          englishMeaning: 'Certainly! How much sugar should I put?',
          expectedKeywords: ['తక్కువ', 'పంచదార', 'స్పూన్', 'చాలు'],
          suggestedReplies: [
            'తక్కువ పంచదార వేయండి.',
            'ఒక చెంచా పంచదార చాలు.',
          ],
          culturalTip: '"చాలు" (chaalu) means enough.',
          grammarNote: '"వేయండి" is the polite command form.',
        },
        {
          id: 3,
          tutorMessage: 'ఇదిగోండి మీ వేడి వేడి టీ! మొత్తం ఇరవై రూపాయలు.',
          pronunciation: 'Idigondi mee vedi vedi tea! Moththam iravai roopaayalu.',
          englishMeaning: 'Here is your hot tea! Total is twenty rupees.',
          expectedKeywords: ['ధన్యవాదాలు', 'తీసుకోండి', 'రూపాయలు', 'UPI'],
          suggestedReplies: [
            'ధన్యవాదాలు! ఇవిగోండి ఇరవై రూపాయలు.',
            'నేను ఆన్‌లైన్ పేమెంట్ చేయవచ్చా?',
          ],
          culturalTip: '"ధన్యవాదాలు" (Dhanyavaadaalu) means thank you.',
          grammarNote: '"ఇదిగోండి" is used politely when offering items.',
        },
      ],
      bn: [
        {
          id: 1,
          tutorMessage: 'নমস্কার! আপনি কি নেবেন?',
          pronunciation: 'Nomoshkar! Aapni ki neben?',
          englishMeaning: 'Hello! What would you like to have?',
          expectedKeywords: ['চা', 'নেব', 'দিন', 'এক', 'বিস্কুট'],
          suggestedReplies: [
            'আমাকে এক কাপ চা দিন।',
            'এক কাপ দুধ চা এবং বিস্কুট দিন।',
          ],
          culturalTip: 'Kolkata clay cup (Bhar / ভাঁড়) chai is famous for its earthy aroma.',
          grammarNote: '"দিন" (din) is polite "please give".',
        },
        {
          id: 2,
          tutorMessage: 'নিশ্চয়ই! চিনি কতটা দেব?',
          pronunciation: 'Nishchoi! Chini kotota debo?',
          englishMeaning: 'Sure! How much sugar shall I give?',
          expectedKeywords: ['কম', 'চিনি', 'চামচ', 'ছাড়া'],
          suggestedReplies: [
            'কম চিনি দেবেন।',
            'এক চামচ চিনি যথেষ্ট।',
          ],
          culturalTip: '"যথেষ্ট" (jotheshto) means sufficient/enough.',
          grammarNote: '"দেবেন" is the polite future request.',
        },
        {
          id: 3,
          tutorMessage: 'এই নিন আপনার গরম চা! মোট কুড়ি টাকা হলো।',
          pronunciation: 'Ei nin aapnar gorom cha! Mot kuri taka holo.',
          englishMeaning: 'Here is your hot tea! Total is 20 rupees (taka).',
          expectedKeywords: ['ধন্যবাদ', 'টাকা', 'নিন', 'অনলাইন'],
          suggestedReplies: [
            'ধন্যবাদ! এই নিন কুড়ি টাকা।',
            'আমি কি UPI দিয়ে দিতে পারি?',
          ],
          culturalTip: 'In Bengali, "টাকা" (taka) is used for rupees.',
          grammarNote: '"এই নিন" means "Please take this".',
        },
      ],
      pa: [
        {
          id: 1,
          tutorMessage: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਤੁਸੀਂ ਕੀ ਲੈਣਾ ਪਸੰਦ ਕਰੋਗੇ?',
          pronunciation: 'Sat Sri Akal! Tusi ki laina pasand karoge?',
          englishMeaning: 'Greetings! What would you like to have?',
          expectedKeywords: ['ਚਾਹ', 'ਚਾਹੀਦੀ', 'ਦਿਓ', 'ਇੱਕ', 'ਪਕੌੜੇ'],
          suggestedReplies: [
            'ਮੈਨੂੰ ਇੱਕ ਕੱਪ ਚਾਹ ਚਾਹੀਦੀ ਹੈ।',
            'ਇੱਕ ਕੜਕ ਚਾਹ ਅਤੇ ਪਕੌੜੇ ਦਿਓ ਜੀ।',
          ],
          culturalTip: 'Adding "ਜੀ" (ji) in Punjabi adds great warmth and respect.',
          grammarNote: '"ਚਾਹ" is feminine in Punjabi.',
        },
        {
          id: 2,
          tutorMessage: 'ਜ਼ਰੂਰ ਜੀ! ਖੰਡ ਕਿੰਨੀ ਪਾਵਾਂ?',
          pronunciation: 'Zaroor ji! Khand kinni paawan?',
          englishMeaning: 'Sure! How much sugar should I put?',
          expectedKeywords: ['ਘੱਟ', 'ਖੰਡ', 'ਚਮਚ', 'ਬਿਨਾਂ'],
          suggestedReplies: [
            'ਘੱਟ ਖੰਡ ਪਾਓ ਜੀ।',
            'ਇੱਕ ਚਮਚ ਖੰਡ ਬਹੁਤ ਹੈ।',
          ],
          culturalTip: '"ਘੱਟ" (Ghatt) means less.',
          grammarNote: '"ਖੰਡ" (sugar) is feminine in Punjabi.',
        },
        {
          id: 3,
          tutorMessage: 'ਲਓ ਜੀ ਤੁਹਾਡੀ ਗਰਮਾ-ਗਰਮ ਚਾਹ! ਕੁੱਲ ਵੀਹ ਰੁਪਏ ਬਣੇ।',
          pronunciation: 'Lao ji tuhadi garma-garam chaah! Kull veeh rupaye bane.',
          englishMeaning: 'Here is your hot tea! Total is 20 rupees.',
          expectedKeywords: ['ਧੰਨਵਾਦ', 'ਰੁਪਏ', 'ਲਓ', 'UPI'],
          suggestedReplies: [
            'ਧੰਨਵਾਦ ਜੀ! ਇਹ ਲਓ ਵੀਹ ਰੁਪਏ।',
            'ਕੀ ਮੈਂ ਆਨਲਾਈਨ ਪੇਮੈਂਟ ਕਰ ਸਕਦਾ ਹਾਂ?',
          ],
          culturalTip: '"ਧੰਨਵਾਦ" (Dhanvaad) means thank you.',
          grammarNote: '"ਸਕਦਾ ਹਾਂ" (masculine) / "ਸਕਦੀ ਹਾਂ" (feminine).',
        },
      ],
      en: [
        {
          id: 1,
          tutorMessage: 'Hello! Welcome. What would you like to order today?',
          pronunciation: 'Hello! Welcome...',
          englishMeaning: 'Greetings and order inquiry',
          expectedKeywords: ['tea', 'chai', 'cup', 'want', 'please', 'snack'],
          suggestedReplies: [
            'I would like a cup of masala chai, please.',
            'One tea and two samosas, please.',
          ],
          culturalTip: 'Street cafes across India are vibrant hubs of daily conversation.',
          grammarNote: 'Using "would like" is polite and conversational.',
        },
        {
          id: 2,
          tutorMessage: 'Certainly! How much sugar would you prefer?',
          pronunciation: 'Certainly! How much sugar...',
          englishMeaning: 'Sugar preference inquiry',
          expectedKeywords: ['sugar', 'less', 'spoon', 'without', 'medium'],
          suggestedReplies: [
            'Less sugar, please.',
            'One spoon of sugar is perfect.',
          ],
          culturalTip: 'Chai is traditionally brewed with full cream milk and spices.',
          grammarNote: '"Less" is used for uncountable nouns like sugar.',
        },
        {
          id: 3,
          tutorMessage: 'Here is your fresh hot tea! That will be twenty rupees.',
          pronunciation: 'Here is your tea...',
          englishMeaning: 'Delivery of order and bill',
          expectedKeywords: ['thank', 'rupees', 'here', 'pay', 'upi', 'cash'],
          suggestedReplies: [
            'Thank you! Here is twenty rupees.',
            'Can I pay using UPI / Google Pay?',
          ],
          culturalTip: 'UPI QR code scans are available at almost all Indian vendors.',
          grammarNote: '"Here is" is used when presenting payment or items.',
        },
      ],
    },
  },
  {
    id: 'autorickshaw_ride',
    title: 'Auto-Rickshaw Ride & Fair',
    icon: '🛺',
    difficulty: 'Intermediate',
    description: 'Negotiate destination, meter, and directions with an auto driver.',
    category: 'Travel & Directions',
    turns: {
      hi: [
        {
          id: 1,
          tutorMessage: 'हाँ भाई साहब, कहाँ जाना है आपको?',
          pronunciation: 'Haan bhai sahab, kahan jaana hai aapko?',
          englishMeaning: 'Yes sir, where do you want to go?',
          expectedKeywords: ['स्टेशन', 'बाजार', 'जाना', 'चलोगे', 'रेलवे'],
          suggestedReplies: [
            'मुझे रेलवे स्टेशन जाना है। चलोगे?',
            'सेंट्रल मार्केट चलना है, कितना लोगे?',
          ],
          culturalTip: '"भाई साहब" (Bhai Sahab) is a polite and friendly way to address auto drivers.',
          grammarNote: '"जाना है" expresses obligation or destination.',
        },
        {
          id: 2,
          tutorMessage: 'स्टेशन के लिए अस्सी रुपये लगेंगे। मीटर से नहीं जाऊँगा।',
          pronunciation: 'Station ke liye assi rupaye lagenge. Meter se nahin jaaunga.',
          englishMeaning: 'It will cost 80 rupees for the station. I will not go by meter.',
          expectedKeywords: ['मीटर', 'ज्यादा', 'साठ', 'पचास', 'कम', 'ठीक'],
          suggestedReplies: [
            'यह बहुत ज्यादा है, कृपया मीटर से चलिए।',
            'साठ रुपये ठीक है, चलना है तो बताइए।',
          ],
          culturalTip: 'Polite bargaining is standard when drivers hesitate to use the fare meter.',
          grammarNote: '"लगेंगे" is future tense of "lagna" (costing/taking time).',
        },
        {
          id: 3,
          tutorMessage: 'चलो ठीक है, सत्तर रुपये दे देना। बैठिए!',
          pronunciation: 'Chalo theek hai, sattar rupaye de dena. Baithiye!',
          englishMeaning: 'Alright, give 70 rupees. Please sit in!',
          expectedKeywords: ['धन्यवाद', 'बैठता', 'चलो', 'रास्ता'],
          suggestedReplies: [
            'ठीक है, धन्यवाद। जल्दी चलिएगा।',
            'धन्यवाद! कृपया मेन रोड से चलिए।',
          ],
          culturalTip: '"बैठिए" (Baithiye) is the polite imperative for "please take a seat".',
          grammarNote: '"जल्दी चलिएगा" is a polite request to drive expediently.',
        },
      ],
      mr: [
        {
          id: 1,
          tutorMessage: 'बोला, कुठे जायचं आहे?',
          pronunciation: 'Bola, kuthe jaaycha aahe?',
          englishMeaning: 'Tell me, where do you want to go?',
          expectedKeywords: ['स्टेशन', 'बाजार', 'जायचं', 'येणार', 'का'],
          suggestedReplies: [
            'मला रेल्वे स्टेशनला जायचं आहे, येणार का?',
            'मार्केटला जायचं आहे, किती घेणार?',
          ],
          culturalTip: 'In Maharashtra, "कुठे जायचं?" is the direct and customary greeting.',
          grammarNote: '"जायचं आहे" is the colloquial infinitive for "want to go".',
        },
        {
          id: 2,
          tutorMessage: 'स्टेशनचे ऐंशी रुपये होतील. मीटरने नाही जाणार.',
          pronunciation: 'Stationche aishi rupaye hotil. Meterne naahi jaanar.',
          englishMeaning: 'It will be 80 rupees for station. Won\'t go by meter.',
          expectedKeywords: ['मीटर', 'जास्त', 'साठ', 'कमी', 'मीटरने'],
          suggestedReplies: [
            'खूप जास्त आहे, मीटरने चला ना.',
            'साठ रुपये ठीक आहेत, चला पटकन.',
          ],
          culturalTip: 'Adding "ना" (na) at the end softens your request into a friendly appeal.',
          grammarNote: '"जास्त आहे" means "it is too much".',
        },
        {
          id: 3,
          tutorMessage: 'चला ठीक आहे, सत्तर रुपये द्या. बसा!',
          pronunciation: 'Chala theek aahe, sattar rupaye dyaa. Basa!',
          englishMeaning: 'Okay fine, give 70 rupees. Please get in!',
          expectedKeywords: ['धन्यवाद', 'बसतो', 'चला', 'रस्ता'],
          suggestedReplies: [
            'ठीक आहे, धन्यवाद. कृपया लवकर चला.',
            'धन्यवाद! मेन रोडने चला.',
          ],
          culturalTip: '"बसा" (Basa) means please sit / hop in.',
          grammarNote: '"लवकर" means quickly/fast.',
        },
      ],
      gu: [
        {
          id: 1,
          tutorMessage: 'હા ભાઈ, ક્યાં જવું છે તમારે?',
          pronunciation: 'Haa bhai, kyaan javu chhe tamaare?',
          englishMeaning: 'Yes brother, where do you want to go?',
          expectedKeywords: ['સ્ટેશન', 'બજાર', 'જવું', 'ચાલશો', 'રેલવે'],
          suggestedReplies: [
            'મને રેલવે સ્ટેશન જવું છે. ચાલશો?',
            'સેન્ટ્રલ માર્કેટ જવું છે, કેટલા લેશો?',
          ],
          culturalTip: 'In Gujarat, rickshaws are essential daily transit and drivers are warmly addressed as "ભાઈ" (Bhai).',
          grammarNote: '"જવું છે" (javu chhe) expresses destination or desire to go.',
        },
        {
          id: 2,
          tutorMessage: 'સ્ટેશનના એંસી રૂપિયા થશે. મીટરથી નહીં જાઉં.',
          pronunciation: 'Stationna aensi rupiya thashe. Meterthi nahin jau.',
          englishMeaning: 'It will be 80 rupees for the station. I won\'t go by meter.',
          expectedKeywords: ['મીટર', 'વધારે', 'સાઠ', 'ઓછા', 'ચાલો'],
          suggestedReplies: [
            'આ બહુ વધારે છે, કૃપા કરીને મીટરથી ચાલો.',
            'સાઠ રૂપિયા બરાબર છે, ચાલવું હોય તો બોલો.',
          ],
          culturalTip: 'Bargaining is polite and customary when auto drivers decline running the meter.',
          grammarNote: '"બહુ વધારે છે" means "it is too much / too expensive".',
        },
        {
          id: 3,
          tutorMessage: 'ચાલો ભલે, સિત્તેર રૂપિયા આપી દેજો. બેસો!',
          pronunciation: 'Chaalo bhale, sitteer rupiya aapi dejo. Beso!',
          englishMeaning: 'Alright fine, give 70 rupees. Please get in!',
          expectedKeywords: ['આભાર', 'બેસું', 'ચાલો', 'જલ્દી', 'રોડ'],
          suggestedReplies: [
            'ભલે, આભાર! જરા જલ્દી ચલાવજો.',
            'આભાર! કૃપા કરીને મેઈન રોડથી લેજો.',
          ],
          culturalTip: '"બેસો" (Beso) is a hospitable invitation to sit down / board.',
          grammarNote: '"ચલાવજો" is the polite imperative request for driving.',
        },
      ],
      ta: [
        {
          id: 1,
          tutorMessage: 'சொல்லுங்க சார், எங்க போகணும்?',
          pronunciation: 'Sollunga sir, enga poganum?',
          englishMeaning: 'Tell me sir, where do you need to go?',
          expectedKeywords: ['ஸ்டேஷன்', 'போகணும்', 'வருவீங்களா', 'மார்க்கெட்', 'ரயில்வே'],
          suggestedReplies: [
            'எனக்கு ரயில்வே ஸ்டேஷன் போகணும். வருவீங்களா?',
            'சென்ட்ரல் மார்க்கெட் போகணும், எவ்வளவு ஆகும்?',
          ],
          culturalTip: 'In Tamil Nadu, "சொல்லுங்க" (Sollunga) is a polite, welcoming greeting.',
          grammarNote: '"போகணும்" (poganum) is the modal verb meaning "need/want to go".',
        },
        {
          id: 2,
          tutorMessage: 'ஸ்டேஷனுக்கு எண்பது ரூபாய் ஆகும். மீட்டர் போட மாட்டேன்.',
          pronunciation: 'Station-ukku enbadhu roobai aagum. Meter poda maatten.',
          englishMeaning: 'It will be 80 rupees to the station. I will not turn on the meter.',
          expectedKeywords: ['மீட்டர்', 'அதிகம்', 'அறுபது', 'குறைத்து', 'சரி'],
          suggestedReplies: [
            'ரொம்ப அதிகம், மீட்டர் போட்டு வாங்க.',
            'அறுபது ரூபாய் தர்றேன், வரீங்களா?',
          ],
          culturalTip: 'Courteous price negotiation before boarding is standard in Chennai and other cities.',
          grammarNote: '"ரொம்ப அதிகம்" means "too much / very expensive".',
        },
        {
          id: 3,
          tutorMessage: 'சரி வாங்க, எழுபது ரூபாய் கொடுங்க. ஏறுங்க!',
          pronunciation: 'Sari vaanga, ezhubadhu roobai kodunga. Aerunga!',
          englishMeaning: 'Alright, give 70 rupees. Please get in!',
          expectedKeywords: ['நன்றி', 'சீக்கிரம்', 'ஏறுகிறேன்', 'மெயின்', 'ரோடு'],
          suggestedReplies: [
            'சரி, நன்றி! கொஞ்சம் சீக்கிரம் போங்க.',
            'நன்றி! மெயின் ரோடு வழியா போங்க.',
          ],
          culturalTip: '"ஏறுங்க" (Aerunga) means please climb in / board.',
          grammarNote: '"சீக்கிரம்" means quickly / soon.',
        },
      ],
      te: [
        {
          id: 1,
          tutorMessage: 'చెప్పండి సార్, ఎక్కడికి వెళ్ళాలి?',
          pronunciation: 'Cheppandi sir, ekkadiki vellaali?',
          englishMeaning: 'Tell me sir, where do you need to go?',
          expectedKeywords: ['స్టేషన్', 'వెళ్ళాలి', 'వస్తారా', 'మార్కెట్', 'రైల్వే'],
          suggestedReplies: [
            'నాకు రైల్వే స్టేషన్‌కు వెళ్ళాలి. వస్తారా?',
            'సెంట్రల్ మార్కెట్ వెళ్ళాలి, ఎంత తీసుకుంటారు?',
          ],
          culturalTip: 'Auto drivers in Telugu regions customarily welcome passengers with "చెప్పండి" (Cheppandi).',
          grammarNote: '"వెళ్ళాలి" (vellaali) expresses "need/want to go".',
        },
        {
          id: 2,
          tutorMessage: 'స్టేషన్‌కి ఎనభై రూపాయలు అవుతుంది. మీటర్ వేయను.',
          pronunciation: 'Station-ki enabhai roopaayalu avuthundi. Meter veyanu.',
          englishMeaning: 'It will cost 80 rupees to the station. I won\'t put the meter.',
          expectedKeywords: ['మీటర్', 'ఎక్కువ', 'అరవై', 'తక్కువ', 'సరే'],
          suggestedReplies: [
            'చాలా ఎక్కువ, దయచేసి మీటర్ వేయండి.',
            'అరవై రూపాయలు ఇస్తాను, వస్తారా?',
          ],
          culturalTip: 'Negotiating a mutually fair fare is common when meters are not running.',
          grammarNote: '"చాలా ఎక్కువ" means "very high / too much".',
        },
        {
          id: 3,
          tutorMessage: 'సరే రండి, డెబ్బై రూపాయలు ఇవ్వండి. కూర్చోండి!',
          pronunciation: 'Sare randi, debbai roopaayalu ivvandi. Kurchondi!',
          englishMeaning: 'Alright come, give 70 rupees. Please sit in!',
          expectedKeywords: ['ధన్యవాదాలు', 'త్వరగా', 'కూర్చుంటాను', 'రోడ్డు'],
          suggestedReplies: [
            'సరే, ధన్యవాదాలు! కొంచెం త్వరగా వెళ్ళండి.',
            'ధన్యవాదాలు! మెయిన్ రోడ్డు గుండా వెళ్ళండి.',
          ],
          culturalTip: '"రండి" (Randi) and "కూర్చోండి" (Kurchondi) are respectful welcoming imperatives.',
          grammarNote: '"త్వరగా" (twaraga) means quickly.',
        },
      ],
      bn: [
        {
          id: 1,
          tutorMessage: 'বলুন দাদা, কোথায় যাবেন?',
          pronunciation: 'Bolun dada, kothay jaaben?',
          englishMeaning: 'Tell me brother, where will you go?',
          expectedKeywords: ['স্টেশন', 'যাব', 'যাবেন', 'মার্কেট', 'রেলওয়ে'],
          suggestedReplies: [
            'আমাকে রেলওয়ে স্টেশন যেতে হবে। যাবেন?',
            'সেন্ট্রাল মার্কেট যাব, কত নেবেন?',
          ],
          culturalTip: 'In Bengal, addressing drivers as "দাদা" (Dada - elder brother) establishes immediate rapport.',
          grammarNote: '"যাবেন?" is the polite future interrogative "will you go?".',
        },
        {
          id: 2,
          tutorMessage: 'স্টেশনের জন্য আশি টাকা লাগবে। মিটারে যাব না।',
          pronunciation: 'Stationer jonno aashi taka laagbe. Meatere jaabo na.',
          englishMeaning: 'It will cost 80 rupees (taka) for the station. Won\'t go by meter.',
          expectedKeywords: ['মিটার', 'বেশি', 'ষাট', 'কম', 'ঠিক'],
          suggestedReplies: [
            'এটা খুব বেশি, দয়া করে মিটারে চলুন।',
            'ষাট টাকা ঠিক আছে, চললে বলুন।',
          ],
          culturalTip: 'In Kolkata and suburbs, reserved rides often involve gentle fare alignment.',
          grammarNote: '"খুব বেশি" means "too much".',
        },
        {
          id: 3,
          tutorMessage: 'আচ্ছা ঠিক আছে, সত্তর টাকা দেবেন। উঠে বসুন!',
          pronunciation: 'Aachha theek aachhe, sottor taka deben. Uthe boshun!',
          englishMeaning: 'Alright fine, give 70 rupees. Please get in!',
          expectedKeywords: ['ধন্যবাদ', 'চলুন', 'তাড়াতাড়ি', 'রোড'],
          suggestedReplies: [
            'ঠিক আছে, ধন্যবাদ! একটু তাড়াতাড়ি চলুন।',
            'ধন্যবাদ! মেন রোড দিয়ে যাবেন।',
          ],
          culturalTip: '"উঠে বসুন" (Uthe boshun) is the customary hospitable phrase to invite passengers inside.',
          grammarNote: '"তাড়াতাড়ি" means quickly/hurriedly.',
        },
      ],
      pa: [
        {
          id: 1,
          tutorMessage: 'ਹਾਂਜੀ ਭਾਊ, ਕਿੱਥੇ ਜਾਣਾ ਏ?',
          pronunciation: 'Haanji bhaau, kitthe jaana ae?',
          englishMeaning: 'Yes brother, where do you want to go?',
          expectedKeywords: ['ਸਟੇਸ਼ਨ', 'ਜਾਣਾ', 'ਚੱਲੋਗੇ', 'ਮਾਰਕੀਟ', 'ਰੇਲਵੇ'],
          suggestedReplies: [
            'ਮੈਂ ਰੇਲਵੇ ਸਟੇਸ਼ਨ ਜਾਣਾ ਏ। ਚੱਲੋਗੇ?',
            'ਸੈਂਟਰਲ ਮਾਰਕੀਟ ਚੱਲਣਾ, ਕਿੰਨੇ ਪੈਸੇ ਲਓਗੇ?',
          ],
          culturalTip: 'In Punjab, drivers are addressed affectionately with "ਭਾਊ" (Bhaau) or "ਵੀਰ ਜੀ" (Veer ji).',
          grammarNote: '"ਕਿੱਥੇ ਜਾਣਾ ਏ?" is the natural colloquial Punjabi phrasing for "where to go?".',
        },
        {
          id: 2,
          tutorMessage: 'ਸਟੇਸ਼ਨ ਦੇ ਅੱਸੀ ਰੁਪਏ ਲੱਗਣਗੇ। ਮੀਟਰ ਨਾਲ ਨਹੀਂ ਜਾਣਾ।',
          pronunciation: 'Station de assi rupaye lagange. Meter naal nahin jaana.',
          englishMeaning: 'It will cost 80 rupees for the station. Won\'t go by meter.',
          expectedKeywords: ['ਮੀਟਰ', 'ਬਹੁਤ', 'ਸੱਠ', 'ਜ਼ਿਆਦਾ', 'ਘੱਟ', 'ਠੀਕ'],
          suggestedReplies: [
            'ਇਹ ਬਹੁਤ ਜ਼ਿਆਦਾ ਏ, ਮੀਟਰ ਨਾਲ ਚੱਲੋ ਜੀ।',
            'ਸੱਠ ਰੁਪਏ ਠੀਕ ਨੇ, ਚੱਲਣਾ ਤਾਂ ਦੱਸੋ।',
          ],
          culturalTip: 'Bargaining is done with good humor and respectful phrasing.',
          grammarNote: '"ਬਹੁਤ ਜ਼ਿਆਦਾ ਏ" means "it is too much".',
        },
        {
          id: 3,
          tutorMessage: 'ਚਲੋ ਠੀਕ ਏ, ਸੱਤਰ ਰੁਪਏ ਦੇ ਦੇਣਾ। ਬੈਠੋ ਜੀ!',
          pronunciation: 'Chalo theek ae, sattar rupaye de dena. Baitho ji!',
          englishMeaning: 'Alright fine, give 70 rupees. Please sit in!',
          expectedKeywords: ['ਧੰਨਵਾਦ', 'ਬੈਠਦਾ', 'ਚਲੋ', 'ਜਲਦੀ', 'ਰੋਡ'],
          suggestedReplies: [
            'ਠੀਕ ਏ ਜੀ, ਧੰਨਵਾਦ! ਥੋੜ੍ਹਾ ਜਲਦੀ ਚੱਲਿਓ।',
            'ਧੰਨਵਾਦ! ਮੇਨ ਰੋਡ ਰਾਹੀਂ ਚੱਲਣਾ।',
          ],
          culturalTip: '"ਬੈਠੋ ਜੀ" (Baitho ji) invites the passenger to board with Punjabi warmth.',
          grammarNote: '"ਚੱਲਿਓ" is a polite imperative request.',
        },
      ],
      en: [
        {
          id: 1,
          tutorMessage: 'Yes sir, where do you want to go?',
          pronunciation: 'Yes sir, where do you want to go?',
          englishMeaning: 'Driver asks for your destination.',
          expectedKeywords: ['station', 'market', 'go', 'railway', 'take', 'want'],
          suggestedReplies: [
            'I want to go to the railway station. Will you go?',
            'Central Market, please. How much will it cost?',
          ],
          culturalTip: 'Auto-rickshaws are the most common last-mile transport across Indian cities.',
          grammarNote: 'Using "Will you go?" is the standard conversational inquiry.',
        },
        {
          id: 2,
          tutorMessage: 'It will be eighty rupees for the station. I will not go by the meter.',
          pronunciation: 'It will be eighty rupees...',
          englishMeaning: 'Driver states fixed fare and declines meter.',
          expectedKeywords: ['meter', 'too much', 'sixty', 'high', 'less', 'fair'],
          suggestedReplies: [
            'That is too much, please go by the meter.',
            'Sixty rupees is fair. Let us go.',
          ],
          culturalTip: 'Negotiating fares when drivers decline the meter is common practice.',
          grammarNote: '"Too much" expresses an excessive price.',
        },
        {
          id: 3,
          tutorMessage: 'Alright fine, give seventy rupees. Please hop in!',
          pronunciation: 'Alright fine, give seventy rupees...',
          englishMeaning: 'Driver agrees on 70 rupees and invites you in.',
          expectedKeywords: ['thank', 'thanks', 'hurry', 'main road', 'let us go'],
          suggestedReplies: [
            'Thank you. Please drive quickly.',
            'Thank you! Please take the main road.',
          ],
          culturalTip: 'Taking the main road often avoids narrow alleyway traffic jams.',
          grammarNote: '"Hop in" is a colloquial idiom for boarding a cab or auto.',
        },
      ],
    },
  },
]

/**
 * 8 Supported Indian Languages for Conversation Roleplay
 */
export const SUPPORTED_TUTOR_LANGUAGES = ['hi', 'en', 'mr', 'ta', 'te', 'bn', 'pa', 'gu']

/**
 * Helper to check if a language is supported by the Conversation Tutor
 */
export function isSupportedTutorLanguage(languageId) {
  if (!languageId || typeof languageId !== 'string') return false
  return SUPPORTED_TUTOR_LANGUAGES.includes(languageId.toLowerCase().trim())
}

/**
 * Helper to get scenarios for a target learning language.
 * STRICT POLICY:
 * - A requested target language NEVER silently falls back to Hindi or another language.
 * - If the language is unsupported, returns an empty list.
 */
export function getScenariosForLanguage(languageId) {
  if (!isSupportedTutorLanguage(languageId)) {
    return []
  }

  const cleanLang = languageId.toLowerCase().trim()

  return CONVERSATION_SCENARIOS.map((sc) => ({
    id: sc.id,
    title: sc.title,
    icon: sc.icon,
    difficulty: sc.difficulty,
    description: sc.description,
    category: sc.category,
    turns: Array.isArray(sc.turns?.[cleanLang]) ? sc.turns[cleanLang] : [],
  }))
}
