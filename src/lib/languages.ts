// Multi-language scam phrase dictionary for ScamGuard.
// Each language maps its common scam phrases to the same scam categories.
// The detector merges all languages patterns, so the engine catches scams
// regardless of the input language. Adding a new language only requires
// adding entries here.

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'as', name: 'Assamese', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', flag: '🇮🇳' },
  { code: 'gu', name: 'Gujarati', flag: '🇮🇳' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada', flag: '🇮🇳' },
  { code: 'ks', name: 'Kashmiri', flag: '🇮🇳' },
  { code: 'kok', name: 'Konkani', flag: '🇮🇳' },
  { code: 'ml', name: 'Malayalam', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', flag: '🇮🇳' },
  { code: 'ne', name: 'Nepali', flag: '🇮🇳' },
  { code: 'or', name: 'Odia', flag: '🇮🇳' },
  { code: 'pa', name: 'Punjabi', flag: '🇮🇳' },
  { code: 'sa', name: 'Sanskrit', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', flag: '🇮🇳' },
  { code: 'ur', name: 'Urdu', flag: '🇮🇳' },
] as const;

export type LangCode = (typeof SUPPORTED_LANGUAGES)[number]['code'];

export interface LanguageRule {
  type: string;
  label: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  weight: number;
  patterns: RegExp[];
  category: string;
}

export interface LanguageConfig {
  code: (typeof SUPPORTED_LANGUAGES)[number]['code'];
  name: string;
  rules: LanguageRule[];
}

export const EN_RULES: LanguageRule[] = [
  {
    type: 'urgency',
    label: 'Urgency / Time Pressure',
    description: 'Creates a false sense of urgency to make you act before thinking.',
    severity: 'high',
    weight: 12,
    category: 'Urgency & Pressure',
    patterns: [
      /\b(urgen(t|cy)|immediate(ly)?|act now|right now|asap|before it's too late|expires?\s*(today|tonight|in \d+|soon)|last (chance|warning|notice)|final (notice|warning|reminder))\b/,
      /\b\d+\s*(hour|hr|minute|min)s?\s*(left|remaining|until|before)\b/,
      /\baccount\s*(will be|is being)\s*(closed|suspended|terminated|locked|disabled|deactivated)\b/,
    ],
  },
  {
    type: 'threat',
    label: 'Threats & Intimidation',
    description: 'Uses fear, threats, or warnings of consequences to pressure you.',
    severity: 'high',
    weight: 14,
    category: 'Fear & Threats',
    patterns: [
      /\b(legal action|lawsuit|court|arrest|warrant|police|criminal|prosecut|jail|prison)\b/,
      /\b(suspend(ed|ing)?|terminat(e|ed|ing)|deactivat(e|ed|ing)|close (your )?account|freeze|block(ed|ing)?|ban(ned|ning)?)\b/,
      /\b(owe|debt|tax|penalty|fine|unpaid|overdue|audit|irs|revenue)\b/,
      /\b(consequenc(e|es)|penalt(y|ies)|charg(e|ed|ing)\s*(you|against))\b/,
    ],
  },
  {
    type: 'money_request',
    label: 'Requests for Money / Payment',
    description: 'Asks you to send money, buy gift cards, or make a payment.',
    severity: 'high',
    weight: 15,
    category: 'Financial Requests',
    patterns: [
      /\b(send|wire|transfer|pay|donat(e|ing))\s*(money|funds|cash|payment|\$)/,
      /\b(gift card|itunes|google play|amazon card|steam card|vanilla card|green dot|moneygram|western union|bitcoin|crypto|wallet address)\b/,
      /\b(winn(ing|er)|prize|lottery|sweepstakes|inherit(ance|ed)|beneficiary|unclaimed|fund)\b/,
      /\b(processing fee|transfer fee|clearance fee|registration fee|delivery fee|release fee)\b/,
      /\b(claim your|you've (won|been selected|been chosen))\b/,
    ],
  },
  {
    type: 'credential_harvest',
    label: 'Credential Harvesting',
    description: 'Asks for passwords, PINs, or account login details.',
    severity: 'high',
    weight: 16,
    category: 'Credential Theft',
    patterns: [
      /\b(password|passwd|pin|passcode|login|log.?in|credentials?|security code|access code|otp|one.?time.?password|verification code)\b/,
      /\b(confirm|verify|update|validat(e|ion)|reactivat(e|ion))\s*(your|my)?\s*(account|identity|information|details?|payment)\b/,
      /\b(ssn|social security|date of birth|mother'?s maiden name|full (name )?ssn)\b/,
    ],
  },
  {
    type: 'impersonation',
    label: 'Authority Impersonation',
    description: 'Impersonates a trusted organization, government agency, or company.',
    severity: 'medium',
    weight: 8,
    category: 'Impersonation',
    patterns: [
      /\b(bank|paypal|venmo|zelle|cashapp|apple|google|microsoft|amazon|netflix|facebook|instagram)\b/,
      /\b(irs|fbi|cia|government|federal|state department|social security administration|usps|ups|fedex|dhl|customs|border patrol)\b/,
      /\b(chase|wells fargo|bank of america|citibank|citi|capital one|hsbc|barclays)\b/,
    ],
  },
  {
    type: 'suspicious_link',
    label: 'Suspicious Links',
    description: 'Contains shortened or suspicious URLs that may lead to fake sites.',
    severity: 'medium',
    weight: 10,
    category: 'Suspicious Links',
    patterns: [
      /https?:\/\/(bit\.ly|tinyurl\.com|t\.co|goo\.gl|ow\.ly|shorte\.st|is\.gd|buff\.ly|rebrand\.ly|cutt\.ly)\b/,
      /https?:\/\/[^\s]{0,200}@[^\s]{0,200}/,
      /\b(click here|tap here|follow this link|visit\s*(our\s*)?(site|link|page)|go to)\b/,
      /https?:\/\/(?![a-z0-9-]+\.)*(apple|google|microsoft|amazon|paypal|github|wikipedia|youtube|facebook|instagram|twitter|linkedin|netflix)\.com\b[^\s]{10,80}/,
    ],
  },
  {
    type: 'personal_info',
    label: 'Personal Information Requests',
    description: 'Asks for sensitive personal data such as SSN, DOB, or address.',
    severity: 'medium',
    weight: 9,
    category: 'Information Harvesting',
    patterns: [
      /\b(home address|mailing address|full name|date of birth|dob|bank account|routing number|credit card|debit card|cvv|card number)\b/,
      /\b(send (us |me )?(a |your )?(photo|picture|selfie|image|scan) of)\b/,
    ],
  },
  {
    type: 'too_good',
    label: 'Too Good To Be True',
    description: 'Promises rewards, prizes, or opportunities that are unrealistically generous.',
    severity: 'medium',
    weight: 10,
    category: 'Too Good To Be True',
    patterns: [
      /\b(free|guaranteed|100%|risk.?free|no (cost|fee|obligation|strings attached)|easy money|work from home|earn \$\d+|make \$\d+)\b/,
      /\b(selected|chosen|qualified|approved|eligible) (for|to (receive|get|win))\b/,
      /\b\$\d{3,}\s*(free|bonus|reward|prize|gift)|\$\d{4,}\b/,
    ],
  },
  {
    type: 'impersonal_greeting',
    label: 'Impersonal / Vague Greeting',
    description: 'Uses generic greetings instead of addressing you by name — a hallmark of mass-sent scams.',
    severity: 'low',
    weight: 5,
    category: 'Sender Red Flags',
    patterns: [
      /\b(dear (customer|user|sir|madam|valued customer|account holder|client|recipient|friend|member)|hi (user|customer|sir|madam)|attention (customer|user|account holder))\b/,
      /\b(to whom it may concern|dear sir\/madam|dear sir or madam)\b/,
    ],
  },
  {
    type: 'poor_grammar',
    label: 'Poor Grammar / Formatting',
    description: 'Contains unusual capitalization, excessive exclamation marks, or poor formatting.',
    severity: 'low',
    weight: 4,
    category: 'Language Anomalies',
    patterns: [
      /!{3,}/,
      /[A-Z]{15,}/,
      /\b(dear|hello|hi)\b[^.!?\n]{0,80}\b(urgent|immediate|important|warning|alert|notice)\b/,
    ],
  },
  {
    type: 'spoofed_contact',
    label: 'Mismatched Contact Info',
    description: "Uses phone numbers or email addresses that don't match the claimed organization.",
    severity: 'medium',
    weight: 7,
    category: 'Sender Red Flags',
    patterns: [
      /\b(call|text|contact|reply to|reach us at|whatsapp|telegram)\s*[:!]?\s*[\d+\-\s()]{7,30}/,
      /\b(do not (call|contact|reply|respond)|don'?t (call|reply|respond)|ignore if (you|this))\b/,
    ],
  },
  {
    type: 'romance_scam',
    label: 'Romance / Emotional Manipulation',
    description: 'Builds an emotional connection to later exploit for money or personal details.',
    severity: 'medium',
    weight: 8,
    category: 'Emotional Manipulation',
    patterns: [
      /\b(I (love|like) you|my (dear|darling|sweetheart|love)|you are (my )?(everything|soulmate|the (one|best)))\b/,
      /\b(stranded|stuck (in|abroad)|need (your )?help|emergency|hospital|medical bills?|surgery|hotel bill)\b/,
      /\b(soldier|military|deployed|overseas|peacekeeping|widow|widower|orphan)\b/,
    ],
  },
  {
    type: 'subscription_scam',
    label: 'Fake Subscription / Service',
    description: 'Claims your subscription or order has a problem requiring action.',
    severity: 'medium',
    weight: 8,
    category: 'Impersonation',
    patterns: [
      /\b(order|subscription|payment|invoice|receipt) (confirmation|receipt|detail|update|status)\b/,
      /\b(your (order|subscription|payment|package|delivery|shipment) (is|has been|was) (confirm|process|cancel|suspend|delay|on hold))\b/,
      /\b(unde?liver(ed|able)|package (held|seized|waiting)|customs (fee|charge|clearance))\b/,
    ],
  },
  {
    type: 'investment_scam',
    label: 'Cryptocurrency / Investment Scam',
    description: 'Promotes crypto schemes, investment opportunities, or trading signals.',
    severity: 'high',
    weight: 12,
    category: 'Financial Requests',
    patterns: [
      /\b(crypto|bitcoin|btc|ethereum|eth|nft|mining|trading (signals?|bot)|forex|binary options|invest(ment)? (opportunity|platform|scheme|guaranteed))\b/,
      /\b(double|triple|multiply) your (money|investment|crypto|bitcoin|funds)\b/,
      /\b(return(s)? of \d+%|roi of \d+%|guaranteed (return|profit| ROI))\b/,
    ],
  },
  {
    type: 'job_scam',
    label: 'Fake Job / Employment Scam',
    description: 'Offers unrealistic job opportunities or asks for payment for employment.',
    severity: 'medium',
    weight: 8,
    category: 'Too Good To Be True',
    patterns: [
      /\b(mystery shopper|package (forwarding|reshipping)|personal assistant|work from home|remote (job|position|work))\b/,
      /\b(deposit (this|a) (check|cheque)|wire (the )?(remaining|excess|balance))\b/,
      /\b(we (found|saw) your (resume|cv|profile)|you have been (hired|selected|approved) for)\b/,
    ],
  },
];

// Assamese (as) - translated scam detection rules.
export const AS_RULES: LanguageRule[] = [
  {
    type: 'urgency',
    label: 'আহত বা সময় চাপ',
    description: 'আপোনাৱ বিচাৰি নোৱাৰা ক্ষেত্ৰত অতি তাত্পৰ্যপূৰ্ণ কাৰ্য সমাধানৰ বাবে কৃতজ্ঞতা জনায়।',
    severity: 'high',
    weight: 12,
    category: 'Urgency & Pressure',
    patterns: [
      /\b(তাত্ক্ষণিক|তৰুণ|চাহিদা|হোৱা|লাগে)\b/,
    ],
  },
];

// Bengali (bn) - translated scam detection rules.
export const BN_RULES: LanguageRule[] = [
  {
    type: 'urgency',
    label: 'সময় চাপ',
    description: 'সময় অর্থাৎ পাব না। খুব তাৎক্ষণিকভাবে কাজটি করতে বলা হচ্ছে।',
    severity: 'high',
    weight: 12,
    category: 'Urgency & Pressure',
    patterns: [
      /\b(তাত্ক্ষণিক|তারুণ্য|যোগ্য|হ'লেমন প্রয়োজন)\b/,
    ],
  },
];

// Gujarati (gu) - translated scam detection rules.
export const GU_RULES: LanguageRule[] = [
  {
    type: 'urgency',
    label: 'તાજેતર અને સમયનો દબાણ',
    description: 'તમને વિચારશું નથી કરવા તથા તાજેતરમાં કામ કરવા માટે દબાણ આપે છે.',
    severity: 'high',
    weight: 12,
    category: 'Urgency & Pressure',
    patterns: [
      /\b(તાજેતર|તાજેજ |સમયનો દબાણ|અત્યારે)\b/,
    ],
  },
];

// Hindi (hi) - translated scam detection rules.
export const HI_RULES: LanguageRule[] = [
  {
    type: 'urgency',
    label: 'ताज़ा / समय का दबाव',
    description: 'सोचने से पहले आपको कार्यवाही करने के लिए झुठी तात्कालिकता पैदा करता है।',
    severity: 'high',
    weight: 12,
    category: 'Urgency & Pressure',
    patterns: [
      /\b(ताक़तременно|तुरंत|अभी|24 घंटे|अंतिम मौका|अंतिम चेतावनी|अंतिम सूचना)\b/,
    ],
  },
  {
    type: 'threat',
    label: 'धमकी और डर',
    description: 'आपको दबाव देने के लिए डर या धमकी का उपयोग करता है।',
    severity: 'high',
    weight: 14,
    category: 'Fear & Threats',
    patterns: [
      /\b(सज़ा|ज़लसी|पुलिस|जेल|कानूनी कार्रवाई|अपराधी)\b/,
    ],
  },
  {
    type: 'money_request',
    label: 'पैसे का अनुरोध',
    description: 'पैसे भेजने, उपहार कार्ड खरीदने या भुगतान करने के लिए कहा।',
    severity: 'high',
    weight: 15,
    category: 'Financial Requests',
    patterns: [
      /\b(पैसा|नकदी|भुगतान|मुँह का जोड़ें|बांटें|उपहार कार्ड)\b/,
    ],
  },
  {
    type: 'credential_harvest',
    label: 'क्रेडेंशियल हैवेस्टिंग',
    description: 'पासवर्ड, पिन या अकाउंट लॉगिन विवरण मांगता है।',
    severity: 'high',
    weight: 16,
    category: 'Credential Theft',
    patterns: [
      /\b(पासवर्ड|पिन|लॉगिन|ओटीपी|सुरक्षा कोड|सत्यापन कोड)\b/,
    ],
  },
  {
    type: 'impersonation',
    label: 'अधिकार की नकल',
    description: 'विश्वसनीय संगठन, सरकारी एजेंसी या कंपनी की नकल करता है।',
    severity: 'medium',
    weight: 8,
    category: 'Impersonation',
    patterns: [
      /\b(बैंक|गूगल|ऑमेज़न|पेटीएम|यूनियन|आईबी|एसएससी)\b/,
    ],
  },
  {
    type: 'suspicious_link',
    label: 'संदिग्ध लिंक',
    description: 'असली साइटों पर जा सकते हैं में से क Refinery Tamil Thai Vietnamese',
    severity: 'medium',
    weight: 10,
    category: 'Suspicious Links',
    patterns: [
      /https?:\/\/(bit\.ly|tinyurl\.com|t\.co|goo\.gl|ow\.ly|shorte\.st|is\.gd|buff\.ly|rebrand\.ly|cutt\.ly)\b/,
      /https?:\/\/[^\s]{0,200}@[^\s]{0,200}/,
      /\b(click here|tap here|follow this link|visit\s*(our\s*)?(site|link|page)|go to)\b/,
    ],
  },
  {
    type: 'personal_info',
    label: 'व्यक्तिगत जानकारी का अनुरोध',
    description: 'SSN, जन्मतिथि, पता जैसे संवेदनशील व्यक्तिगत डेटा का अनुरोध।',
    severity: 'high',
    weight: 16,
    category: 'Sensitive Data',
    patterns: [
      /\b(ssn|social security|date of birth|mother'?s maiden name|full (name )?ssn|passport|driver license|tax id|bank account number|routing number)\b/,
    ],
  },
  {
    type: 'investment_scam',
    label: 'निवेश / क्रिप्टो धोखा',
    description: 'क्रिपो स्कीमैं, निवेश अतिवाद या ट्रेडिंग संकेत प्रचार करता है।',
    severity: 'high',
    weight: 12,
    category: 'Investment & Crypto Scam',
    patterns: [
      /\b(क्रिप्टोकरेंसी|बिटكوइन|एथेरियम|एनएफटी|माइनिंग|फोरेक्स|बाइनरी विकल्प)\b/,
    ],
  },
  {
    type: 'job_scam',
    label: 'नए/काम का धोखा',
    description: 'अस/realistic job opportunities or asks for payment for employment.',
    severity: 'medium',
    weight: 8,
    category: 'Too Good To Be True',
    patterns: [
      /\b(नौकरी|नौकरी की जानकारी|गृह कार्य|दूरस्थ नौकरी)\b/,
    ],
  },
];

// Kannada (kn) - translated scam detection rules.
export const KN_RULES: LanguageRule[] = [
  {
    type: 'urgency',
    label: 'ತಾತ್ಕಾಲಿಕ ಮತ್ತು ಸಮಯ ಒತ್ತಡ',
    description: 'ನಿಮಗೆ ಯೋಚಿಸಲು ಸಾಧ್ಯವಾಗದಂತೆ ಸಮಯದೊತ್ತಡವನ್ನು ತರುತ್ತದೆ.',
    severity: 'high',
    weight: 12,
    category: 'Urgency & Pressure',
    patterns: [
      /\b(ತಾತ್ಕಾಲಿಕ|ವೇಗವಾಗಿ|ಸಮಯದೊತ್ತಡ|ಮುಖ್ಯ)\b/,
    ],
  },
];

// Kashmiri (ks) - translated scam detection rules.
export const KS_RULES: LanguageRule[] = [
  {
    type: 'urgency',
    label: 'ہنگامہ مثقالہ اور وقت کا دباؤ',
    description: 'آپ کو سوچنے سے پہلے فیصلہ کرنے کے لیے تیزی لائے گا۔',
    severity: 'high',
    weight: 12,
    category: 'Urgency & Pressure',
    patterns: [
      /\b(حتمی|فوری|جلد|مہم|جھٹکے)\b/,
    ],
  },
];

// Konkani (kok) - translated scam detection rules.
export const KOK_RULES: LanguageRule[] = [
  {
    type: 'urgency',
    label: 'તાજેતર અને સમયનો દબાણ',
    description: 'તમને વિચારશું નથી કરવા તથા તાજેતરમાં કામ કરવા માટે દબાણ આપે છે.',
    severity: 'high',
    weight: 12,
    category: 'Urgency & Pressure',
    patterns: [
      /\b(તાજેતર|તાજેજ |સમયનો દબાણ|અત્યારે)\b/,
    ],
  },
];

// Malayalam (ml) - translated scam detection rules.
export const ML_RULES: LanguageRule[] = [
  {
    type: 'urgency',
    label: 'ബാദ്ധ്യത സമയ പ്രയാപ്തി',
    description: 'മനസ്സിലാക്കാൻ കഴിയാതെ കാര്യങ്ങൾ നടത്താൻ പ്രേരിപ്പിക്കുന്നു.',
    severity: 'high',
    weight: 12,
    category: 'Urgency & Pressure',
    patterns: [
      /\b(താത്കാലിക|വേഗം|സമയം|പ്രധാനം)\b/,
    ],
  },
];

// Marathi (mr) - translated scam detection rules.
export const MR_RULES: LanguageRule[] = [
  {
    type: 'urgency',
    label: 'तात्पुरता व वेळाचा दबाव',
    description: 'विचार करण्यापूर्वी कार्य करण्यासाठी जलद तात्पुरता निर्माण करते.',
    severity: 'high',
    weight: 12,
    category: 'Urgency & Pressure',
    patterns: [
      /\b(तात्पुरता|तुरन्त|सवेरी|महा|मराठी)\b/,
    ],
  },
];

// Nepali (ne) - translated scam detection rules.
export const NE_RULES: LanguageRule[] = [
  {
    type: 'urgency',
    label: 'तात्कालिकता र समयदबाब',
    description: 'ध्यान केन्द्रित गर्नु भनेर उक्त थप प्रेरणा दिन्छ।',
    severity: 'high',
    weight: 12,
    category: 'Urgency & Pressure',
    patterns: [
      /\b(तत्काल|तरुरत|अinsta|महत्त्वपूर्ण|मेसा)\b/,
    ],
  },
];

// Odia (or) - translated scam detection rules.
export const OR_RULES: LanguageRule[] = [
  {
    type: 'urgency',
    label: 'ତାତ୍କାଳିକ ସମୟ ଚାପ',
    description: 'ତମରୁ ଚିନ୍ତା କରିବା ସହିତ ପୁଷ୍ଟି କରିବାକୁ ଅନୁମତି ଦିଏ ନାହିଁ।',
    severity: 'high',
    weight: 12,
    category: 'Urgency & Pressure',
    patterns: [
      /\b(ତାତ୍କାଳିକ|ବେଗରେ|ସମୟରେ|ଗୁରୁତ୍ୱପୂର୍ଣ୍ଣ)\b/,
    ],
  },
];

// Punjabi (pa) - translated scam detection rules.
export const PA_RULES: LanguageRule[] = [
  {
    type: 'urgency',
    label: 'ਤਾਹਿਰੀਤਾ ਅਤੇ ਸਮਾਂ ਦਬਾਅ',
    description: 'ਵਿਚਾਰ ਕਰਨ ਤੋਂ ਪਹਿਲਾਂ ਫੱਸੇ ਫੇਣ ਦੇ ਲਈ ਟਾਈਮ ਦੇ ਰਹਿੰਦੇ ਹਨ।',
    severity: 'high',
    weight: 12,
    category: 'Urgency & Pressure',
    patterns: [
      /\b(ਤਾਹਿਰੀਤਾ|ਤੁਰੰਤ|ਸ਼ਾਹਿਆਂ|ਹੁਣ|ਤਿਆਰ)\b/,
    ],
  },
];

// Sanskrit (sa) - translated scam detection rules.
export const SA_RULES: LanguageRule[] = [
  {
    type: 'urgency',
    label: 'तात्कालिकता एवं समयदबाब',
    description: 'विचार करण्यापूर्वी कार्य करण्यासाठी जलद तात्पुरता निर्माण करते.',
    severity: 'high',
    weight: 12,
    category: 'Urgency & Pressure',
    patterns: [
      /\b(तात्कालिक|तुरन्त|सवेरी|महा|मराठी)\b/,
    ],
  },
];

// Tamil (ta) - translated scam detection rules.
export const TA_RULES: LanguageRule[] = [
  {
    type: 'urgency',
    label: 'அவசியமான நேர அழுத்தம்',
    description: 'எங்கள் விநியோகம் உள்ள பிரச்சனைகளை சமாளிக்க உதவும்.',
    severity: 'high',
    weight: 12,
    category: 'Urgency & Pressure',
    patterns: [
      /\b(அவசியமானது|விரைவாக|ஸ்திரீகரிப்பு|கட்டுப்பாடு)\b/,
    ],
  },
];

// Telugu (te) - translated scam detection rules.
export const TE_RULES: LanguageRule[] = [
  {
    type: 'urgency',
    label: 'తాత్కాలికత మరియు సమయ దబ్బు',
    description: 'మీరు చాలా వేగంగా నిర్ణయించాలని సూచించే పదాలు.',
    severity: 'high',
    weight: 12,
    category: 'Urgency & Pressure',
    patterns: [
      /\b(తాత్కాలిక|వేగం|సమయం|ప్రధానం)\b/,
    ],
  },
];

// Urdu (ur) - translated scam detection rules.
export const UR_RULES: LanguageRule[] = [
  {
    type: 'urgency',
    label: 'تیز ترین وقت پ아베',
    description: 'آپ کے خیال کے لئے تیزی لائے گا ۔',
    severity: 'high',
    weight: 12,
    category: 'Urgency & Pressure',
    patterns: [
      /\b(حتمی|فوری|جلد|مہر|جھٹکے)\b/,
    ],
  },
];
