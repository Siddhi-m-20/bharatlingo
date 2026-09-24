// Cross-lingual translation dictionary and prompt templates for BharatLingo
// Supports: Hindi (hi), Marathi (mr), Tamil (ta), Telugu (te), Bengali (bn),
// Punjabi (pa), Gujarati (gu), English (en)

export const promptTemplates = {
  // Meaning / Multiple Choice
  meaning: {
    en: (w) => `What does "${w}" mean?`,
    hi: (w) => `"${w}" à¤•à¤¾ à¤•à¥à¤¯à¤¾ à¤…à¤°à¥à¤¥ à¤¹à¥ˆ?`,
    mr: (w) => `"${w}" à¤šà¤¾ à¤…à¤°à¥à¤¥ à¤•à¤¾à¤¯ à¤†à¤¹à¥‡?`,
    gu: (w) => `"${w}" àª¨à«‹ àª…àª°à«àª¥ àª¶à«àª‚ àª¥àª¾àª¯?`,
    bn: (w) => `"${w}" à¦à¦° à¦…à¦°à§à¦¥ à¦•à§€?`,
    pa: (w) => `"${w}" à¨¦à¨¾ à¨•à©€ à¨®à¨¤à¨²à¨¬ à¨¹à©ˆ?`,
    ta: (w) => `"${w}" à®Žà®©à¯à®ªà®¤à®©à¯ à®ªà¯Šà®°à¯à®³à¯ à®Žà®©à¯à®©?`,
    te: (w) => `"${w}" à°…à°‚à°Ÿà±‡ à°à°®à°¿à°Ÿà°¿?`,
  },
  // Translate to Target
  translate_to_target: {
    en: (w, targetName) => `Translate "${w}" to ${targetName}`,
    hi: (w, targetName) => `"${w}" à¤•à¤¾ ${targetName} à¤®à¥‡à¤‚ à¤…à¤¨à¥à¤µà¤¾à¤¦ à¤•à¤°à¥‡à¤‚`,
    mr: (w, targetName) => `"${w}" à¤šà¤¾ ${targetName} à¤®à¤§à¥à¤¯à¥‡ à¤…à¤¨à¥à¤µà¤¾à¤¦ à¤•à¤°à¤¾`,
    gu: (w, targetName) => `"${w}" àª¨à«‹ ${targetName} àª®àª¾àª‚ àª…àª¨à«àªµàª¾àª¦ àª•àª°à«‹`,
    bn: (w, targetName) => `"${w}" à¦•à§‡ ${targetName}-à¦ à¦…à¦¨à§à¦¬à¦¾à¦¦ à¦•à¦°à§à¦¨`,
    pa: (w, targetName) => `"${w}" à¨¦à¨¾ ${targetName} à¨µà¨¿à©±à¨š à¨…à¨¨à©à¨µà¨¾à¨¦ à¨•à¨°à©‹`,
    ta: (w, targetName) => `"${w}" à® ${targetName} à®®à¯Šà®´à®¿à®¯à®¿à®²à¯ à®®à¯Šà®´à®¿à®ªà¯†à®¯à®°à¯à®•à¯à®•à®µà¯à®®à¯`,
    te: (w, targetName) => `"${w}" à°¨à± ${targetName} à°²à±‹ à°…à°¨à±à°µà°¦à°¿à°‚à°šà°‚à°¡à°¿`,
  },
  // Listening
  listening: {
    en: () => 'Select the word you hear',
    hi: () => 'à¤¸à¥à¤¨à¥‡ à¤—à¤ à¤¶à¤¬à¥à¤¦ à¤•à¤¾ à¤šà¤¯à¤¨ à¤•à¤°à¥‡à¤‚',
    mr: () => 'à¤à¤•à¤²à¥‡à¤²à¤¾ à¤¶à¤¬à¥à¤¦ à¤¨à¤¿à¤µà¤¡à¤¾',
    gu: () => 'àª¸àª¾àª‚àª­àª³à«‡àª²à«‹ àª¶àª¬à«àª¦ àªªàª¸àª‚àª¦ àª•àª°à«‹',
    bn: () => 'à¦¯à§‡ à¦¶à¦¬à§à¦¦à¦Ÿà¦¿ à¦¶à§à¦¨à¦›à§‡à¦¨ à¦¸à§‡à¦Ÿà¦¿ à¦¬à§‡à¦›à§‡ à¦¨à¦¿à¦¨',
    pa: () => 'à¨¸à©à¨£à¨¿à¨† à¨—à¨¿à¨† à¨¸à¨¼à¨¬à¨¦ à¨šà©à¨£à©‹',
    ta: () => 'à®¨à¯€à®™à¯à®•à®³à¯ à®•à¯‡à®Ÿà¯à®•à¯à®®à¯ à®šà¯Šà®²à¯à®²à¯ˆà®¤à¯ à®¤à¯‡à®°à¯à®¨à¯à®¤à¯†à®Ÿà¯à®•à¯à®•à®µà¯à®®à¯',
    te: () => 'à°®à±€à°°à± à°µà°¿à°¨à±à°¨ à°ªà°¦à°¾à°¨à±à°¨à°¿ à°Žà°‚à°šà±à°•à±‹à°‚à°¡à°¿',
  },
  // Speaking
  speaking: {
    en: (w) => `Tap the mic and speak: "${w}"`,
    hi: (w) => `à¤®à¤¾à¤‡à¤• à¤¦à¤¬à¤¾à¤à¤‚ à¤”à¤° à¤¬à¥‹à¤²à¥‡à¤‚: "${w}"`,
    mr: (w) => `à¤®à¤¾à¤ˆà¤• à¤¦à¤¾à¤¬à¤¾ à¤†à¤£à¤¿ à¤¬à¥‹à¤²à¤¾: "${w}"`,
    gu: (w) => `àª®àª¾àª‡àª• àª¦àª¬àª¾àªµà«‹ àª…àª¨à«‡ àª¬à«‹àª²à«‹: "${w}"`,
    bn: (w) => `à¦®à¦¾à¦‡à¦•à§‡ à¦šà¦¾à¦ª à¦¦à¦¿à¦¨ à¦à¦¬à¦‚ à¦¬à¦²à§à¦¨: "${w}"`,
    pa: (w) => `à¨®à¨¾à¨ˆà¨• à¨¦à¨¬à¨¾à¨“ à¨…à¨¤à©‡ à¨¬à©‹à¨²à©‹: "${w}"`,
    ta: (w) => `à®®à¯ˆà®•à¯à®•à¯ˆ à®…à®´à¯à®¤à¯à®¤à®¿ à®ªà¯‡à®šà®µà¯à®®à¯: "${w}"`,
    te: (w) => `à°®à±ˆà°•à± à°¨à±Šà°•à±à°•à°¿ à°®à°¾à°Ÿà±à°²à°¾à°¡à°‚à°¡à°¿: "${w}"`,
  },
  // Word Bank / Sentence builder
  word_bank: {
    en: (w) => `Build the correct translation for: "${w}"`,
    hi: (w) => `"${w}" à¤•à¤¾ à¤¸à¤¹à¥€ à¤…à¤¨à¥à¤µà¤¾à¤¦ à¤¬à¤¨à¤¾à¤à¤‚:`,
    mr: (w) => `"${w}" à¤šà¥‡ à¤¯à¥‹à¤—à¥à¤¯ à¤­à¤¾à¤·à¤¾à¤‚à¤¤à¤° à¤¤à¤¯à¤¾à¤° à¤•à¤°à¤¾:`,
    gu: (w) => `"${w}" àª¨à«‹ àª¸àª¾àªšà«‹ àª…àª¨à«àªµàª¾àª¦ àª¬àª¨àª¾àªµà«‹:`,
    bn: (w) => `"${w}" à¦à¦° à¦¸à¦ à¦¿à¦• à¦…à¦¨à§à¦¬à¦¾à¦¦ à¦¤à§ˆà¦°à¦¿ à¦•à¦°à§à¦¨:`,
    pa: (w) => `"${w}" à¨¦à¨¾ à¨¸à¨¹à©€ à¨…à¨¨à©à¨µà¨¾à¨¦ à¨¬à¨£à¨¾à¨“:`,
    ta: (w) => `"${w}" à®Žà®©à¯à®ªà®¤à®±à¯à®•à®¾à®© à®šà®°à®¿à®¯à®¾à®© à®®à¯Šà®´à®¿à®ªà¯†à®¯à®°à¯à®ªà¯à®ªà¯ˆ à®‰à®°à¯à®µà®¾à®•à¯à®•à¯à®™à¯à®•à®³à¯:`,
    te: (w) => `"${w}" à°•à±Šà°°à°•à± à°¸à°°à±ˆà°¨ à°…à°¨à±à°µà°¾à°¦à°¾à°¨à±à°¨à°¿ à°°à±‚à°ªà±Šà°‚à°¦à°¿à°‚à°šà°‚à°¡à°¿:`,
  },
  // Matching pairs
  matching: {
    en: () => 'Match the following words with their meanings',
    hi: () => 'à¤¶à¤¬à¥à¤¦à¥‹à¤‚ à¤•à¤¾ à¤‰à¤¨à¤•à¥‡ à¤¸à¤¹à¥€ à¤…à¤°à¥à¤¥ à¤¸à¥‡ à¤®à¤¿à¤²à¤¾à¤¨ à¤•à¤°à¥‡à¤‚',
    mr: () => 'à¤¶à¤¬à¥à¤¦à¤¾à¤‚à¤šà¥à¤¯à¤¾ à¤¯à¥‹à¤—à¥à¤¯ à¤…à¤°à¥à¤¥à¤¾à¤‚à¤¶à¥€ à¤œà¥‹à¤¡à¥à¤¯à¤¾ à¤²à¤¾à¤µà¤¾',
    gu: () => 'àª¶àª¬à«àª¦à«‹àª¨à«‡ àª¤à«‡àª®àª¨àª¾ àª¸àª¾àªšàª¾ àª…àª°à«àª¥ àª¸àª¾àª¥à«‡ àªœà«‹àª¡à«‹',
    bn: () => 'à¦¶à¦¬à§à¦¦à¦—à§à¦²à§‹à¦° à¦¸à¦¾à¦¥à§‡ à¦¸à¦ à¦¿à¦• à¦…à¦°à§à¦¥ à¦®à¦¿à¦²à¦¾à¦¨',
    pa: () => 'à¨¸à¨¼à¨¬à¨¦à¨¾à¨‚ à¨¨à©‚à©° à¨‰à¨¹à¨¨à¨¾à¨‚ à¨¦à©‡ à¨¸à¨¹à©€ à¨…à¨°à¨¥à¨¾à¨‚ à¨¨à¨¾à¨² à¨®à¨¿à¨²à¨¾à¨“',
    ta: () => 'à®šà¯Šà®±à¯à®•à®³à¯ˆ à®…à®µà®±à¯à®±à®¿à®©à¯ à®…à®°à¯à®¤à¯à®¤à®™à¯à®•à®³à¯à®Ÿà®©à¯ à®ªà¯Šà®°à¯à®¤à¯à®¤à®µà¯à®®à¯',
    te: () => 'à°ªà°¦à°¾à°²à°¨à± à°µà°¾à°Ÿà°¿ à°…à°°à±à°¥à°¾à°²à°¤à±‹ à°¸à°°à°¿à°ªà±‹à°²à±à°šà°‚à°¡à°¿',
  },
  // Sentence Ordering / Reorder
  sentence_order: {
    en: (w) => `Arrange the words in correct order: "${w}"`,
    hi: (w) => `à¤¶à¤¬à¥à¤¦à¥‹à¤‚ à¤•à¥‹ à¤¸à¤¹à¥€ à¤•à¥à¤°à¤® à¤®à¥‡à¤‚ à¤µà¥à¤¯à¤µà¤¸à¥à¤¥à¤¿à¤¤ à¤•à¤°à¥‡à¤‚: "${w}"`,
    mr: (w) => `à¤¶à¤¬à¥à¤¦ à¤¯à¥‹à¤—à¥à¤¯ à¤•à¥à¤°à¤®à¤¾à¤¨à¥‡ à¤²à¤¾à¤µà¤¾: "${w}"`,
    gu: (w) => `àª¶àª¬à«àª¦à«‹àª¨à«‡ àª¯à«‹àª—à«àª¯ àª•à«àª°àª®àª®àª¾àª‚ àª—à«‹àª àªµà«‹: "${w}"`,
    bn: (w) => `à¦¶à¦¬à§à¦¦à¦—à§à¦²à¦¿ à¦¸à¦ à¦¿à¦• à¦•à§à¦°à¦®à§‡ à¦¸à¦¾à¦œà¦¾à¦¨: "${w}"`,
    pa: (w) => `à¨¸à¨¼à¨¬à¨¦à¨¾à¨‚ à¨¨à©‚à©° à¨¸à¨¹à©€ à¨•à©à¨°à¨® à¨µà¨¿à©±à¨š à¨µà¨¿à¨µà¨¸à¨¥à¨¿à¨¤ à¨•à¨°à©‹: "${w}"`,
    ta: (w) => `à®šà¯Šà®±à¯à®•à®³à¯ˆ à®šà®°à®¿à®¯à®¾à®© à®µà®°à®¿à®šà¯ˆà®¯à®¿à®²à¯ à®…à®Ÿà¯à®•à¯à®•à®µà¯à®®à¯: "${w}"`,
    te: (w) => `à°ªà°¦à°¾à°²à°¨à± à°¸à°°à±ˆà°¨ à°•à±à°°à°®à°‚à°²à±‹ à°…à°®à°°à±à°šà°‚à°¡à°¿: "${w}"`,
  },
  // Fill in the blank
  fill_blank: {
    en: () => 'Fill in the blank with the correct word',
    hi: () => 'à¤°à¤¿à¤•à¥à¤¤ à¤¸à¥à¤¥à¤¾à¤¨ à¤®à¥‡à¤‚ à¤¸à¤¹à¥€ à¤¶à¤¬à¥à¤¦ à¤­à¤°à¥‡à¤‚',
    mr: () => 'à¤°à¤¿à¤•à¤¾à¤®à¥à¤¯à¤¾ à¤œà¤¾à¤—à¥€ à¤¯à¥‹à¤—à¥à¤¯ à¤¶à¤¬à¥à¤¦ à¤­à¤°à¤¾',
    gu: () => 'àª–àª¾àª²à«€ àªœàª—à«àª¯àª¾àª®àª¾àª‚ àª¸àª¾àªšà«‹ àª¶àª¬à«àª¦ àª­àª°à«‹',
    bn: () => 'à¦¶à§‚à¦¨à§à¦¯à¦¸à§à¦¥à¦¾à¦¨à§‡ à¦¸à¦ à¦¿à¦• à¦¶à¦¬à§à¦¦ à¦¬à¦¸à¦¾à¦¨',
    pa: () => 'à¨–à¨¾à¨²à©€ à¨¥à¨¾à¨‚ à¨µà¨¿à©±à¨š à¨¸à¨¹à©€ à¨¸à¨¼à¨¬à¨¦ à¨­à¨°à©‹',
    ta: () => 'à®•à¯‹à®Ÿà®¿à®Ÿà¯à®Ÿ à®‡à®Ÿà®¤à¯à®¤à¯ˆ à®šà®°à®¿à®¯à®¾à®© à®šà¯Šà®²à¯à®²à®¾à®²à¯ à®¨à®¿à®°à®ªà¯à®ªà¯à®•',
    te: () => 'à°–à°¾à°³à±€à°¨à°¿ à°¸à°°à±ˆà°¨ à°ªà°¦à°‚à°¤à±‹ à°ªà±‚à°°à°¿à°‚à°šà°‚à°¡à°¿',
  },
  // Reading Comprehension
  reading: {
    en: () => 'Read the passage and answer the question',
    hi: () => 'à¤…à¤¨à¥à¤šà¥à¤›à¥‡à¤¦ à¤ªà¤¢à¤¼à¥‡à¤‚ à¤”à¤° à¤ªà¥à¤°à¤¶à¥à¤¨ à¤•à¤¾ à¤‰à¤¤à¥à¤¤à¤° à¤¦à¥‡à¤‚',
    mr: () => 'à¤‰à¤¤à¤¾à¤°à¤¾ à¤µà¤¾à¤šà¤¾ à¤†à¤£à¤¿ à¤ªà¥à¤°à¤¶à¥à¤¨à¤¾à¤šà¥‡ à¤‰à¤¤à¥à¤¤à¤° à¤¦à¥à¤¯à¤¾',
    gu: () => 'àª«àª•àª°à«‹ àªµàª¾àª‚àªšà«‹ àª…àª¨à«‡ àªªà«àª°àª¶à«àª¨àª¨à«‹ àªœàªµàª¾àª¬ àª†àªªà«‹',
    bn: () => 'à¦…à¦¨à§à¦šà§à¦›à§‡à¦¦à¦Ÿà¦¿ à¦ªà¦¡à¦¼à§à¦¨ à¦à¦¬à¦‚ à¦ªà§à¦°à¦¶à§à¦¨à§‡à¦° à¦‰à¦¤à§à¦¤à¦° à¦¦à¦¿à¦¨',
    pa: () => 'à¨ªà©ˆà¨°à¨¾ à¨ªà©œà©à¨¹à©‹ à¨…à¨¤à©‡ à¨¸à¨µà¨¾à¨² à¨¦à¨¾ à¨œà¨µà¨¾à¨¬ à¨¦à¨¿à¨“',
    ta: () => 'à®ªà®¤à¯à®¤à®¿à®¯à¯ˆà®ªà¯ à®ªà®Ÿà®¿à®¤à¯à®¤à¯ à®•à¯‡à®³à¯à®µà®¿à®•à¯à®•à¯ à®ªà®¤à®¿à®²à®³à®¿à®•à¯à®•à®µà¯à®®à¯',
    te: () => 'à°ªà±‡à°°à°¾ à°šà°¦à°¿à°µà°¿ à°ªà±à°°à°¶à±à°¨à°•à± à°¸à°®à°¾à°§à°¾à°¨à°‚ à°‡à°µà±à°µà°‚à°¡à°¿',
  },
  // Writing / Script practice
  writing: {
    en: (w) => `Type the correct word for: "${w}"`,
    hi: (w) => `"${w}" à¤•à¥‡ à¤²à¤¿à¤ à¤¸à¤¹à¥€ à¤¶à¤¬à¥à¤¦ à¤Ÿà¤¾à¤‡à¤ª à¤•à¤°à¥‡à¤‚:`,
    mr: (w) => `"${w}" à¤¸à¤¾à¤ à¥€ à¤¯à¥‹à¤—à¥à¤¯ à¤¶à¤¬à¥à¤¦ à¤Ÿà¤¾à¤‡à¤ª à¤•à¤°à¤¾:`,
    gu: (w) => `"${w}" àª®àª¾àªŸà«‡ àª¸àª¾àªšà«‹ àª¶àª¬à«àª¦ àª²àª–à«‹:`,
    bn: (w) => `"${w}" à¦à¦° à¦œà¦¨à§à¦¯ à¦¸à¦ à¦¿à¦• à¦¶à¦¬à§à¦¦ à¦²à¦¿à¦–à§à¦¨:`,
    pa: (w) => `"${w}" à¨²à¨ˆ à¨¸à¨¹à©€ à¨¸à¨¼à¨¬à¨¦ à¨²à¨¿à¨–à©‹:`,
    ta: (w) => `"${w}" à®Žà®©à¯à®ªà®¤à®±à¯à®•à®¾à®© à®šà®°à®¿à®¯à®¾à®© à®šà¯Šà®²à¯à®²à¯ˆ à®¤à®Ÿà¯à®Ÿà®šà¯à®šà¯ à®šà¯†à®¯à¯à®•:`,
    te: (w) => `"${w}" à°•à±Šà°°à°•à± à°¸à°°à±ˆà°¨ à°ªà°¦à°¾à°¨à±à°¨à°¿ à°Ÿà±ˆà°ªà± à°šà±‡à°¯à°‚à°¡à°¿:`,
  },
}

// Master multilingual dictionary for core vocabulary
export const dictionary = [
  // Greetings & Essentials
  {
    key: 'hello',
    translations: {
      en: 'Hello',
      hi: 'à¤¨à¤®à¤¸à¥à¤•à¤¾à¤° / à¤¨à¤®à¤¸à¥à¤¤à¥‡',
      mr: 'à¤¨à¤®à¤¸à¥à¤•à¤¾à¤°',
      ta: 'à®µà®£à®•à¯à®•à®®à¯',
      te: 'à°¨à°®à°¸à±à°•à°¾à°°à°‚',
      bn: 'à¦¨à¦®à¦¸à§à¦•à¦¾à¦°',
      pa: 'à¨¸à¨¤à¨¿ à¨¸à©à¨°à©€ à¨…à¨•à¨¾à¨²',
      gu: 'àª¨àª®àª¸à«àª¤à«‡',
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
      hi: 'à¤§à¤¨à¥à¤¯à¤µà¤¾à¤¦',
      mr: 'à¤§à¤¨à¥à¤¯à¤µà¤¾à¤¦',
      ta: 'à®¨à®©à¯à®±à®¿',
      te: 'à°§à°¨à±à°¯à°µà°¾à°¦à°¾à°²à±',
      bn: 'à¦§à¦¨à§à¦¯à¦¬à¦¾à¦¦',
      pa: 'à¨§à©°à¨¨à¨µà¨¾à¨¦',
      gu: 'àª†àª­àª¾àª°',
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
      hi: 'à¤•à¥ƒà¤ªà¤¯à¤¾',
      mr: 'à¤•à¥ƒà¤ªà¤¯à¤¾',
      ta: 'à®¤à®¯à®µà¯à®šà¯†à®¯à¯à®¤à¯',
      te: 'à°¦à°¯à°šà±‡à°¸à°¿',
      bn: 'à¦¦à¦¯à¦¼à¦¾ à¦•à¦°à§‡',
      pa: 'à¨•à¨¿à¨°à¨ªà¨¾ à¨•à¨°à¨•à©‡',
      gu: 'àª•à«ƒàªªàª¾ àª•àª°à«€àª¨à«‡',
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
      hi: 'à¤¶à¥à¤­ à¤ªà¥à¤°à¤­à¤¾à¤¤',
      mr: 'à¤¶à¥à¤­ à¤¸à¤•à¤¾à¤³',
      ta: 'à®•à®¾à®²à¯ˆ à®µà®£à®•à¯à®•à®®à¯',
      te: 'à°¶à±à°­à±‹à°¦à°¯à°‚',
      bn: 'à¦¸à§à¦ªà§à¦°à¦­à¦¾à¦¤',
      pa: 'à¨¸à¨¼à©à¨­ à¨¸à¨µà©‡à¨°',
      gu: 'àª¶à«àª­ àª¸àªµàª¾àª°',
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
      hi: 'à¤¶à¥à¤­ à¤°à¤¾à¤¤à¥à¤°à¤¿',
      mr: 'à¤¶à¥à¤­ à¤°à¤¾à¤¤à¥à¤°à¥€',
      ta: 'à®‡à®©à®¿à®¯ à®‡à®°à®µà¯',
      te: 'à°¶à±à°­à°°à°¾à°¤à±à°°à°¿',
      bn: 'à¦¶à§à¦­ à¦°à¦¾à¦¤à§à¦°à¦¿',
      pa: 'à¨¸à¨¼à©à¨­ à¨°à¨¾à¨¤',
      gu: 'àª¶à«àª­ àª°àª¾àª¤à«àª°àª¿',
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
      hi: 'à¤ªà¤¾à¤¨à¥€',
      mr: 'à¤ªà¤¾à¤£à¥€',
      ta: 'à®¤à®£à¯à®£à¯€à®°à¯',
      te: 'à°¨à±€à°°à±',
      bn: 'à¦œà¦² / à¦ªà¦¾à¦¨à¦¿',
      pa: 'à¨ªà¨¾à¨£à©€',
      gu: 'àªªàª¾àª£à«€',
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
      hi: 'à¤–à¤¾à¤¨à¤¾ / à¤­à¥‹à¤œà¤¨',
      mr: 'à¤œà¥‡à¤µà¤£ / à¤…à¤¨à¥à¤¨',
      ta: 'à®‰à®£à®µà¯',
      te: 'à°†à°¹à°¾à°°à°‚',
      bn: 'à¦–à¦¾à¦¬à¦¾à¦°',
      pa: 'à¨–à¨¾à¨£à¨¾',
      gu: 'àª–à«‹àª°àª¾àª• / àªœàª®àªµàª¾àª¨à«àª‚',
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
      hi: 'à¤˜à¤°',
      mr: 'à¤˜à¤°',
      ta: 'à®µà¯€à®Ÿà¯',
      te: 'à°‡à°²à±à°²à±',
      bn: 'à¦¬à¦¾à¦¡à¦¼à¦¿ / à¦˜à¦°',
      pa: 'à¨˜à¨°',
      gu: 'àª˜àª°',
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
      hi: 'à¤¦à¥‹à¤¸à¥à¤¤ / à¤®à¤¿à¤¤à¥à¤°',
      mr: 'à¤®à¤¿à¤¤à¥à¤° / à¤®à¥ˆà¤¤à¥à¤°à¤¿à¤£',
      ta: 'à®¨à®£à¯à®ªà®©à¯',
      te: 'à°¸à±à°¨à±‡à°¹à°¿à°¤à±à°¡à±',
      bn: 'à¦¬à¦¨à§à¦§à§',
      pa: 'à¨¦à©‹à¨¸à¨¤ / à¨®à¨¿à©±à¨¤à¨°',
      gu: 'àª®àª¿àª¤à«àª° / àª¦à«‹àª¸à«àª¤',
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
      hi: 'à¤šà¤¾à¤¯',
      mr: 'à¤šà¤¹à¤¾',
      ta: 'à®¤à¯‡à®¨à¯€à®°à¯',
      te: 'à°Ÿà±€ / à°¤à±‡à°¨à±€à°°à±',
      bn: 'à¦šà¦¾',
      pa: 'à¨šà¨¾à¨¹',
      gu: 'àªšàª¾',
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
      hi: 'à¤•à¤¿à¤¤à¤¾à¤¬ / à¤ªà¥à¤¸à¥à¤¤à¤•',
      mr: 'à¤ªà¥à¤¸à¥à¤¤à¤•',
      ta: 'à®ªà¯à®¤à¯à®¤à®•à®®à¯',
      te: 'à°ªà±à°¸à±à°¤à°•à°‚',
      bn: 'à¦¬à¦‡',
      pa: 'à¨•à¨¿à¨¤à¨¾à¨¬',
      gu: 'àªªà«àª¸à«àª¤àª• / àªšà«‹àªªàª¡à«€',
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
      hi: 'à¤¹à¤¾à¤',
      mr: 'à¤¹à¥‹à¤¯',
      ta: 'à®†à®®à¯',
      te: 'à°…à°µà±à°¨à±',
      bn: 'à¦¹à§à¦¯à¦¾à¦',
      pa: 'à¨¹à¨¾à¨‚',
      gu: 'àª¹àª¾',
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
      hi: 'à¤¨à¤¹à¥€à¤‚',
      mr: 'à¤¨à¤¾à¤¹à¥€',
      ta: 'à®‡à®²à¯à®²à¯ˆ',
      te: 'à°•à°¾à°¦à±',
      bn: 'à¦¨à¦¾',
      pa: 'à¨¨à¨¹à©€à¨‚',
      gu: 'àª¨àª¾',
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
      hi: 'à¤•à¤¹à¤¾à¤?',
      mr: 'à¤•à¥à¤ à¥‡?',
      ta: 'à®Žà®™à¯à®•à¯‡?',
      te: 'à°Žà°•à±à°•à°¡?',
      bn: 'à¦•à§‹à¦¥à¦¾à¦¯à¦¼?',
      pa: 'à¨•à¨¿à©±à¨¥à©‡?',
      gu: 'àª•à«àª¯àª¾àª‚?',
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
      hi: 'à¤†à¤ª à¤•à¥ˆà¤¸à¥‡ à¤¹à¥ˆà¤‚?',
      mr: 'à¤¤à¥à¤®à¥à¤¹à¥€ à¤•à¤¸à¥‡ à¤†à¤¹à¤¾à¤¤?',
      ta: 'à®¨à¯€à®™à¯à®•à®³à¯ à®Žà®ªà¯à®ªà®Ÿà®¿ à®‡à®°à¯à®•à¯à®•à®¿à®±à¯€à®°à¯à®•à®³à¯?',
      te: 'à°®à±€à°°à± à°Žà°²à°¾ à°‰à°¨à±à°¨à°¾à°°à±?',
      bn: 'à¦†à¦ªà¦¨à¦¿ à¦•à§‡à¦®à¦¨ à¦†à¦›à§‡à¦¨?',
      pa: 'à¨¤à©à¨¸à©€à¨‚ à¨•à¨¿à¨µà©‡à¨‚ à¨¹à©‹?',
      gu: 'àª¤àª®à«‡ àª•à«‡àª® àª›à«‹?',
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

  // â”€â”€ Numbers 0 to 10 & Milestones (Language Strings) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  {
    key: '0',
    translations: { en: 'Zero', hi: 'à¤¶à¥‚à¤¨à¥à¤¯', mr: 'à¤¶à¥‚à¤¨à¥à¤¯', ta: 'à®ªà¯‚à®œà¯à®œà®¿à®¯à®®à¯', te: 'à°¸à±à°¨à±à°¨à°¾', bn: 'à¦¶à§‚à¦¨à§à¦¯', pa: 'à¨¸à¨¿à¨«à¨¼à¨°', gu: 'àª¶à«‚àª¨à«àª¯' },
    pronunciations: { en: 'zero', hi: 'shunya', mr: 'shunya', ta: 'poojjiyam', te: 'sunna', bn: 'shunno', pa: 'sifar', gu: 'shunya' },
  },
  {
    key: '1',
    translations: { en: 'One', hi: 'à¤à¤•', mr: 'à¤à¤•', ta: 'à®’à®©à¯à®±à¯', te: 'à°’à°•à°Ÿà°¿', bn: 'à¦à¦•', pa: 'à¨‡à©±à¨•', gu: 'àªàª•' },
    pronunciations: { en: 'one', hi: 'ek', mr: 'ek', ta: 'ondru', te: 'okati', bn: 'ek', pa: 'ikk', gu: 'ek' },
  },
  {
    key: '2',
    translations: { en: 'Two', hi: 'à¤¦à¥‹', mr: 'à¤¦à¥‹à¤¨', ta: 'à®‡à®°à®£à¯à®Ÿà¯', te: 'à°°à±†à°‚à°¡à±', bn: 'à¦¦à§à¦‡', pa: 'à¨¦à©‹', gu: 'àª¬à«‡' },
    pronunciations: { en: 'two', hi: 'do', mr: 'don', ta: 'irandu', te: 'rendu', bn: 'dui', pa: 'do', gu: 'be' },
  },
  {
    key: '3',
    translations: { en: 'Three', hi: 'à¤¤à¥€à¤¨', mr: 'à¤¤à¥€à¤¨', ta: 'à®®à¯‚à®©à¯à®±à¯', te: 'à°®à±‚à°¡à±', bn: 'à¦¤à¦¿à¦¨', pa: 'à¨¤à¨¿à©°à¨¨', gu: 'àª¤à«àª°àª£' },
    pronunciations: { en: 'three', hi: 'teen', mr: 'teen', ta: 'moondru', te: 'moodu', bn: 'tin', pa: 'tinn', gu: 'tran' },
  },
  {
    key: '4',
    translations: { en: 'Four', hi: 'à¤šà¤¾à¤°', mr: 'à¤šà¤¾à¤°', ta: 'à®¨à®¾à®©à¯à®•à¯', te: 'à°¨à°¾à°²à±à°—à±', bn: 'à¦šà¦¾à¦°', pa: 'à¨šà¨¾à¨°', gu: 'àªšàª¾àª°' },
    pronunciations: { en: 'four', hi: 'chaar', mr: 'chaar', ta: 'naangu', te: 'naalugu', bn: 'chaar', pa: 'chaar', gu: 'chaar' },
  },
  {
    key: '5',
    translations: { en: 'Five', hi: 'à¤ªà¤¾à¤à¤š', mr: 'à¤ªà¤¾à¤š', ta: 'à®à®¨à¯à®¤à¯', te: 'à°à°¦à±', bn: 'à¦ªà¦¾à¦à¦š', pa: 'à¨ªà©°à¨œ', gu: 'àªªàª¾àª‚àªš' },
    pronunciations: { en: 'five', hi: 'paanch', mr: 'paach', ta: 'ainthu', te: 'aidu', bn: 'paanch', pa: 'panj', gu: 'paanch' },
  },
  {
    key: '6',
    translations: { en: 'Six', hi: 'à¤›à¤¹', mr: 'à¤¸à¤¹à¤¾', ta: 'à®†à®±à¯', te: 'à°†à°°à±', bn: 'à¦›à¦¯à¦¼', pa: 'à¨›à©‡', gu: 'àª›' },
    pronunciations: { en: 'six', hi: 'chhah', mr: 'saha', ta: 'aaru', te: 'aaru', bn: 'chhoy', pa: 'chhe', gu: 'chha' },
  },
  {
    key: '7',
    translations: { en: 'Seven', hi: 'à¤¸à¤¾à¤¤', mr: 'à¤¸à¤¾à¤¤', ta: 'à®à®´à¯', te: 'à°à°¡à±', bn: 'à¦¸à¦¾à¦¤', pa: 'à¨¸à©±à¨¤', gu: 'àª¸àª¾àª¤' },
    pronunciations: { en: 'seven', hi: 'saat', mr: 'saat', ta: 'yezhu', te: 'yedu', bn: 'saat', pa: 'satt', gu: 'saat' },
  },
  {
    key: '8',
    translations: { en: 'Eight', hi: 'à¤†à¤ ', mr: 'à¤†à¤ ', ta: 'à®Žà®Ÿà¯à®Ÿà¯', te: 'à°Žà°¨à°¿à°®à°¿à°¦à°¿', bn: 'à¦†à¦Ÿ', pa: 'à¨…à©±à¨ ', gu: 'àª†àª ' },
    pronunciations: { en: 'eight', hi: 'aath', mr: 'aath', ta: 'ettu', te: 'enimidi', bn: 'aat', pa: 'atth', gu: 'aath' },
  },
  {
    key: '9',
    translations: { en: 'Nine', hi: 'à¤¨à¥Œ', mr: 'à¤¨à¤Š', ta: 'à®’à®©à¯à®ªà®¤à¯', te: 'à°¤à±Šà°®à±à°®à°¿à°¦à°¿', bn: 'à¦¨à¦¯à¦¼', pa: 'à¨¨à©Œà¨‚', gu: 'àª¨àªµ' },
    pronunciations: { en: 'nine', hi: 'nau', mr: 'nau', ta: 'onbathu', te: 'tommidi', bn: 'noy', pa: 'naun', gu: 'nav' },
  },
  {
    key: '10',
    translations: { en: 'Ten', hi: 'à¤¦à¤¸', mr: 'à¤¦à¤¹à¤¾', ta: 'à®ªà®¤à¯à®¤à¯', te: 'à°ªà°¦à°¿', bn: 'à¦¦à¦¶', pa: 'à¨¦à¨¸', gu: 'àª¦àª¸' },
    pronunciations: { en: 'ten', hi: 'das', mr: 'daha', ta: 'patthu', te: 'padi', bn: 'dosh', pa: 'das', gu: 'das' },
  },
  {
    key: '20',
    translations: { en: 'Twenty', hi: 'à¤¬à¥€à¤¸', mr: 'à¤µà¥€à¤¸', ta: 'à®‡à®°à¯à®ªà®¤à¯', te: 'à°‡à°°à°µà±ˆ', bn: 'à¦¬à¦¿à¦¶', pa: 'à¨µà©€à¨¹', gu: 'àªµà«€àª¸' },
    pronunciations: { en: 'twenty', hi: 'bees', mr: 'vees', ta: 'irubathu', te: 'iravai', bn: 'bish', pa: 'veeh', gu: 'vees' },
  },
  {
    key: '100',
    translations: { en: 'Hundred', hi: 'à¤¸à¥Œ', mr: 'à¤¶à¤‚à¤­à¤°', ta: 'à®¨à¯‚à®±à¯', te: 'à°µà°‚à°¦', bn: 'à¦à¦•à¦¶à§‹', pa: 'à¨¸à©Œ', gu: 'àª¸à«‹' },
    pronunciations: { en: 'hundred', hi: 'sau', mr: 'shambhar', ta: 'nooru', te: 'vanda', bn: 'eksho', pa: 'sau', gu: 'so' },
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
  hi: 'à¤¹à¤¿à¤¨à¥à¤¦à¥€ (Hindi)',
  mr: 'à¤®à¤°à¤¾à¤ à¥€ (Marathi)',
  ta: 'à®¤à®®à®¿à®´à¯ (Tamil)',
  te: 'à°¤à±†à°²à±à°—à± (Telugu)',
  bn: 'à¦¬à¦¾à¦‚à¦²à¦¾ (Bengali)',
  pa: 'à¨ªà©°à¨œà¨¾à¨¬à©€ (Punjabi)',
  gu: 'àª—à«àªœàª°àª¾àª¤à«€ (Gujarati)',
  en: 'English',
}

// â”€â”€ Number Digit to Language String Conversion â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const NUMBER_WORDS_MAP = {
  0: { en: 'Zero', hi: 'à¤¶à¥‚à¤¨à¥à¤¯', mr: 'à¤¶à¥‚à¤¨à¥à¤¯', ta: 'à®ªà¯‚à®œà¯à®œà®¿à®¯à®®à¯', te: 'à°¸à±à°¨à±à°¨à°¾', bn: 'à¦¶à§‚à¦¨à§à¦¯', pa: 'à¨¸à¨¿à¨«à¨¼à¨°', gu: 'àª¶à«‚àª¨à«àª¯' },
  1: { en: 'One', hi: 'à¤à¤•', mr: 'à¤à¤•', ta: 'à®’à®©à¯à®±à¯', te: 'à°’à°•à°Ÿà°¿', bn: 'à¦à¦•', pa: 'à¨‡à©±à¨•', gu: 'àªàª•' },
  2: { en: 'Two', hi: 'à¤¦à¥‹', mr: 'à¤¦à¥‹à¤¨', ta: 'à®‡à®°à®£à¯à®Ÿà¯', te: 'à°°à±†à°‚à°¡à±', bn: 'à¦¦à§à¦‡', pa: 'à¨¦à©‹', gu: 'àª¬à«‡' },
  3: { en: 'Three', hi: 'à¤¤à¥€à¤¨', mr: 'à¤¤à¥€à¤¨', ta: 'à®®à¯‚à®©à¯à®±à¯', te: 'à°®à±‚à°¡à±', bn: 'à¦¤à¦¿à¦¨', pa: 'à¨¤à¨¿à©°à¨¨', gu: 'àª¤à«àª°àª£' },
  4: { en: 'Four', hi: 'à¤šà¤¾à¤°', mr: 'à¤šà¤¾à¤°', ta: 'à®¨à®¾à®©à¯à®•à¯', te: 'à°¨à°¾à°²à±à°—à±', bn: 'à¦šà¦¾à¦°', pa: 'à¨šà¨¾à¨°', gu: 'àªšàª¾àª°' },
  5: { en: 'Five', hi: 'à¤ªà¤¾à¤à¤š', mr: 'à¤ªà¤¾à¤š', ta: 'à®à®¨à¯à®¤à¯', te: 'à°à°¦à±', bn: 'à¦ªà¦¾à¦à¦š', pa: 'à¨ªà©°à¨œ', gu: 'àªªàª¾àª‚àªš' },
  6: { en: 'Six', hi: 'à¤›à¤¹', mr: 'à¤¸à¤¹à¤¾', ta: 'à®†à®±à¯', te: 'à°†à°°à±', bn: 'à¦›à¦¯à¦¼', pa: 'à¨›à©‡', gu: 'àª›' },
  7: { en: 'Seven', hi: 'à¤¸à¤¾à¤¤', mr: 'à¤¸à¤¾à¤¤', ta: 'à®à®´à¯', te: 'à°à°¡à±', bn: 'à¦¸à¦¾à¦¤', pa: 'à¨¸à©±à¨¤', gu: 'àª¸àª¾àª¤' },
  8: { en: 'Eight', hi: 'à¤†à¤ ', mr: 'à¤†à¤ ', ta: 'à®Žà®Ÿà¯à®Ÿà¯', te: 'à°Žà°¨à°¿à°®à°¿à°¦à°¿', bn: 'à¦†à¦Ÿ', pa: 'à¨…à©±à¨ ', gu: 'àª†àª ' },
  9: { en: 'Nine', hi: 'à¤¨à¥Œ', mr: 'à¤¨à¤Š', ta: 'à®’à®©à¯à®ªà®¤à¯', te: 'à°¤à±Šà°®à±à°®à°¿à°¦à°¿', bn: 'à¦¨à¦¯à¦¼', pa: 'à¨¨à©Œà¨‚', gu: 'àª¨àªµ' },
  10: { en: 'Ten', hi: 'à¤¦à¤¸', mr: 'à¤¦à¤¹à¤¾', ta: 'à®ªà®¤à¯à®¤à¯', te: 'à°ªà°¦à°¿', bn: 'à¦¦à¦¶', pa: 'à¨¦à¨¸', gu: 'àª¦àª¸' },
  20: { en: 'Twenty', hi: 'à¤¬à¥€à¤¸', mr: 'à¤µà¥€à¤¸', ta: 'à®‡à®°à¯à®ªà®¤à¯', te: 'à°‡à°°à°µà±ˆ', bn: 'à¦¬à¦¿à¦¶', pa: 'à¨µà©€à¨¹', gu: 'àªµà«€àª¸' },
  30: { en: 'Thirty', hi: 'à¤¤à¥€à¤¸', mr: 'à¤¤à¥€à¤¸', ta: 'à®®à¯à®ªà¯à®ªà®¤à¯', te: 'à°®à±à°ªà±à°ªà±ˆ', bn: 'à¦¤à§à¦°à¦¿à¦¶', pa: 'à¨¤à©€à¨¹', gu: 'àª¤à«àª°à«€àª¸' },
  50: { en: 'Fifty', hi: 'à¤ªà¤šà¤¾à¤¸', mr: 'à¤ªà¤¨à¥à¤¨à¤¾à¤¸', ta: 'à®à®®à¯à®ªà®¤à¯', te: 'à°¯à°¾à°­à±ˆ', bn: 'à¦ªà¦žà§à¦šà¦¾à¦¶', pa: 'à¨ªà©°à¨œà¨¾à¨¹', gu: 'àªªàªšàª¾àª¸' },
  100: { en: 'One hundred', hi: 'à¤¸à¥Œ', mr: 'à¤¶à¤‚à¤­à¤°', ta: 'à®¨à¯‚à®±à¯', te: 'à°µà°‚à°¦', bn: 'à¦à¦•à¦¶à§‹', pa: 'à¨¸à©Œ', gu: 'àª¸à«‹' },
}

const INDIC_DIGIT_MAP = {
  'à¥¦': 0, 'à¥§': 1, 'à¥¨': 2, 'à¥©': 3, 'à¥ª': 4, 'à¥«': 5, 'à¥¬': 6, 'à¥­': 7, 'à¥®': 8, 'à¥¯': 9,
  'à§¦': 0, 'à§§': 1, 'à§¨': 2, 'à§©': 3, 'à§ª': 4, 'à§«': 5, 'à§¬': 6, 'à§­': 7, 'à§®': 8, 'à§¯': 9,
  'à©¦': 0, 'à©§': 1, 'à©¨': 2, 'à©©': 3, 'à©ª': 4, 'à©«': 5, 'à©¬': 6, 'à©­': 7, 'à©®': 8, 'à©¯': 9,
  'à«¦': 0, 'à«§': 1, 'à«¨': 2, 'à«©': 3, 'à«ª': 4, 'à««': 5, 'à«¬': 6, 'à«­': 7, 'à«®': 8, 'à«¯': 9,
  'à¯¦': 0, 'à¯§': 1, 'à¯¨': 2, 'à¯©': 3, 'à¯ª': 4, 'à¯«': 5, 'à¯¬': 6, 'à¯­': 7, 'à¯®': 8, 'à¯¯': 9,
  'à±¦': 0, 'à±§': 1, 'à±¨': 2, 'à±©': 3, 'à±ª': 4, 'à±«': 5, 'à±¬': 6, 'à±­': 7, 'à±®': 8, 'à±¯': 9,
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
  hi: ['à¤¨à¤®à¤¸à¥à¤¤à¥‡', 'à¤§à¤¨à¥à¤¯à¤µà¤¾à¤¦', 'à¤•à¥ƒà¤ªà¤¯à¤¾', 'à¤…à¤²à¤µà¤¿à¤¦à¤¾', 'à¤®à¤¿à¤¤à¥à¤°', 'à¤ªà¤¾à¤¨à¥€', 'à¤¸à¥à¤ªà¥à¤°à¤­à¤¾à¤¤', 'à¤¸à¥à¤µà¤¾à¤—à¤¤', 'à¤˜à¤°', 'à¤¹à¤¾à¤'],
  mr: ['à¤¨à¤®à¤¸à¥à¤•à¤¾à¤°', 'à¤§à¤¨à¥à¤¯à¤µà¤¾à¤¦', 'à¤•à¥ƒà¤ªà¤¯à¤¾', 'à¤¨à¤¿à¤°à¥‹à¤ª', 'à¤®à¤¿à¤¤à¥à¤°', 'à¤ªà¤¾à¤£à¥€', 'à¤¶à¥à¤­ à¤ªà¥à¤°à¤­à¤¾à¤¤', 'à¤¸à¥à¤µà¤¾à¤—à¤¤', 'à¤˜à¤°', 'à¤¹à¥‹'],
  ta: ['à®µà®£à®•à¯à®•à®®à¯', 'à®¨à®©à¯à®±à®¿', 'à®¤à®¯à®µà¯à®šà¯†à®¯à¯à®¤à¯', 'à®ªà®¿à®°à®¿à®¯à®¾à®µà®¿à®Ÿà¯ˆ', 'à®¨à®£à¯à®ªà®°à¯', 'à®¤à®£à¯à®£à¯€à®°à¯', 'à®•à®¾à®²à¯ˆ à®µà®£à®•à¯à®•à®®à¯', 'à®µà®°à®µà¯‡à®±à¯à®ªà¯', 'à®µà¯€à®Ÿà¯', 'à®†à®®à¯'],
  te: ['à°¨à°®à°¸à±à°•à°¾à°°à°‚', 'à°§à°¨à±à°¯à°µà°¾à°¦à°¾à°²à±', 'à°¦à°¯à°šà±‡à°¸à°¿', 'à°µà±€à°¡à±à°•à±‹à°²à±', 'à°¸à±à°¨à±‡à°¹à°¿à°¤à±à°¡à±', 'à°¨à±€à°°à±', 'à°¶à±à°­à±‹à°¦à°¯à°‚', 'à°¸à±à°µà°¾à°—à°¤à°‚', 'à°‡à°²à±à°²à±', 'à°…à°µà±à°¨à±'],
  bn: ['à¦¨à¦®à¦¸à§à¦•à¦¾à¦°', 'à¦§à¦¨à§à¦¯à¦¬à¦¾à¦¦', 'à¦¦à¦¯à¦¼à¦¾ à¦•à¦°à§‡', 'à¦¬à¦¿à¦¦à¦¾à¦¯à¦¼', 'à¦¬à¦¨à§à¦§à§', 'à¦œà¦²', 'à¦¸à§à¦ªà§à¦°à¦­à¦¾à¦¤', 'à¦¸à§à¦¬à¦¾à¦—à¦¤à¦®', 'à¦¬à¦¾à¦¡à¦¼à¦¿', 'à¦¹à§à¦¯à¦¾à¦'],
  pa: ['à¨¸à¨¤à¨¿ à¨¸à©à¨°à©€ à¨…à¨•à¨¾à¨²', 'à¨§à©°à¨¨à¨µà¨¾à¨¦', 'à¨•à¨¿à¨°à¨ªà¨¾ à¨•à¨°à¨•à©‡', 'à¨…à¨²à¨µà¨¿à¨¦à¨¾', 'à¨¦à©‹à¨¸à¨¤', 'à¨ªà¨¾à¨£à©€', 'à¨¸à¨¼à©à¨­ à¨¸à¨µà©‡à¨°', 'à¨¸à©à¨†à¨—à¨¤', 'à¨˜à¨°', 'à¨¹à¨¾à¨‚'],
  gu: ['àª¨àª®àª¸à«àª¤à«‡', 'àª†àª­àª¾àª°', 'àª•à«ƒàªªàª¾ àª•àª°à«€àª¨à«‡', 'àª†àªµàªœà«‹', 'àª®àª¿àª¤à«àª°', 'àªªàª¾àª£à«€', 'àª¸à«àªªà«àª°àª­àª¾àª¤', 'àª¸à«àªµàª¾àª—àª¤', 'àª˜àª°', 'àª¹àª¾'],
}

/**
 * Deduplicate and ensure clean language string options (no bare digits, no duplicates like "4 4", no synthetic "99 â€” 99")
 */
export function sanitizeLanguageOptions(options = [], correctAnswer = '', langId = 'en', count = 4) {
  const isInvalidOption = (s) => {
    if (!s) return true
    const str = String(s).trim()
    if (!str) return true
    // Bare ASCII or Indic digits
    if (/^\d+$/.test(str)) return true
    if (/^[\u0966-\u096F\u09E6-\u09EF\u0A66-\u0A6F\u0AE6-\u0AEF\u0BE6-\u0BEF\u0C66-\u0C6F]+$/.test(str)) return true
    // Synthetic number strings like "99 â€” 99", "32 - 32", "12 â€” 12"
    if (/\d+\s*[-â€”â€“]\s*\d+/.test(str)) return true
    if (/^[\d\s\-â€”â€“]+$/.test(str)) return true
    return false
  }

  let cleanAns = digitToLanguageWord(correctAnswer, langId)
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
