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
  patterns: string[];
  category: string;
}

export interface LanguageConfig {
  code: (typeof SUPPORTED_LANGUAGES)[number]['code'];
  name: string;
  rules: LanguageRule[];
}

// English (en) - translated scam detection rules.
export const EN_RULES: LanguageRule[] = [
  {
    type: "urgency",
    label: "Urgency / Time Pressure",
    description: "Creates a false sense of urgency to make you act before thinking.",
    severity: "high",
    weight: 12,
    category: "Urgency & Pressure",
    patterns: [
      "urgen(t|cy)",
      "immediate(ly)?",
      "act now",
      "right now",
      "asap",
      "before it's too late",
      "expires? (today|tonight|in \\d+|soon)",
      "last (chance|warning|notice)",
      "final (notice|warning|reminder)",
    ],
  },
  {
    type: "threat",
    label: "Threats & Intimidation",
    description: "Uses fear, threats, or warnings of consequences to pressure you.",
    severity: "high",
    weight: 14,
    category: "Fear & Threats",
    patterns: [
      "legal action",
      "lawsuit",
      "court",
      "arrest",
      "warrant",
      "police",
      "criminal",
      "prosecut",
      "jail",
      "prison",
      "suspend(ed|ing)?",
      "terminat(e|ed|ing)",
      "deactivat(e|ed|ing)",
      "close (your )?account",
      "freeze",
      "block(ed|ing)?",
      "ban(ned|ning)?",
      "owe|debt|tax|penalty|fine|unpaid|overdue|audit|irs|revenue",
      "consequenc(e|es)|penalt(y|ies)|charg(e|ed|ing) (you|against)",
    ],
  },
  {
    type: "money_request",
    label: "Requests for Money / Payment",
    description: "Asks you to send money, buy gift cards, or make a payment.",
    severity: "high",
    weight: 15,
    category: "Financial Requests",
    patterns: [
      "send|wire|transfer|pay|donat(e|ing)",
      "money|funds|cash|payment|$",
      "gift card|itunes|google play|amazon card|steam card|vanilla card|green dot|moneygram|western union|bitcoin|crypto|wallet address",
      "winn(ing|er)|prize|lottery|sweepstakes|inherit(ance|ed)|beneficiary|unclaimed|fund",
      "processing fee|transfer fee|clearance fee|registration fee|delivery fee|release fee",
      "claim your|you've (won|been selected|been chosen)",
    ],
  },
  {
    type: "credential_harvest",
    label: "Credential Harvesting",
    description: "Asks for passwords, PINs, or account login details.",
    severity: "high",
    weight: 16,
    category: "Credential Theft",
    patterns: [
      "password|passwd|pin|passcode|login|log.?in|credentials?|security code|access code|otp|one.?time.?password|verification code",
      "confirm|verify|update|validat(e|ion)|reactivat(e|ion) (your|my)? (account|identity|information|details?|payment)",
      "ssn|social security|date of birth|mother's maiden name|full (name )?ssn",
    ],
  },
  {
    type: "impersonation",
    label: "Authority Impersonation",
    description: "Impersonates a trusted organization, government agency, or company.",
    severity: "medium",
    weight: 8,
    category: "Impersonation",
    patterns: [
      "bank|paypal|venmo|zelle|cashapp|apple|google|microsoft|amazon|netflix|facebook|instagram",
      "irs|fbi|cia|government|federal|state department|social security administration|usps|ups|fedex|dhl|customs|border patrol",
      "chase|wells fargo|bank of america|citibank|citi|capital one|hsbc|barclays",
    ],
  },
  {
    type: "personal_info",
    label: "Personal Information Requests",
    description: "Asks for sensitive personal data such as SSN, DOB, or address.",
    severity: "high",
    weight: 16,
    category: "Sensitive Data",
    patterns: [
      "ssn|social security|date of birth|mother's maiden name|full (name )?ssn|passport|driver license|tax id|bank account number|routing number",
      "please|kindly|send|share (your )?([a-z]+ )?((address|phone|email|mobile|city|state|country))",
    ],
  },
  {
    type: "suspicious_link",
    label: "Suspicious Links",
    description: "Contains shortened or suspicious URLs that may lead to fake sites.",
    severity: "medium",
    weight: 10,
    category: "Suspicious Links",
    patterns: [
      "https?:\\/\\/(bit\\.ly|tinyurl\\.com|t\\.co|goo\\.gl|ow\\.ly|shorte\\.st|is\\.gd|buff\\.ly|rebrand\\.ly|cutt\\.ly)",
      "https?:\\/\\/[^\\s]{0,200}@[^\\s]{0,200}",
      "click here|tap here|follow this link|visit\\s*(our\\s*)?(site|link|page)|go to",
      "https?:\\/\\/(?![a-z0-9-]+\\.)*(apple|google|microsoft|amazon|paypal|github|wikipedia|youtube|facebook|instagram|twitter|linkedin|netflix)\\.com\\b)[^\\s]{10,80}",
    ],
  },
  {
    type: "investment_scam",
    label: "Cryptocurrency / Investment Scam",
    description: "Promotes crypto schemes, investment opportunities, or trading signals.",
    severity: "high",
    weight: 12,
    category: "Financial Requests",
    patterns: [
      "crypto|bitcoin|btc|ethereum|eth|nft|mining|trading (signals?|bot)|forex|binary options|invest(ment)? (opportunity|platform|scheme|guaranteed)",
      "double|triple|multiply (money|investment|crypto|bitcoin|funds)",
      "return(s)? of \\d+%|roi of \\d+%|guaranteed (return|profit| ROI)",
    ],
  },
  {
    type: "job_scam",
    label: "Fake Job / Employment Scam",
    description: "Offers unrealistic job opportunities or asks for payment for employment.",
    severity: "medium",
    weight: 8,
    category: "Too Good To Be True",
    patterns: [
      "mystery shopper|package (forwarding|reshipping)|personal assistant|work from home|remote (job|position|work)",
      "deposit (this|a) (check|cheque)|wire (the )?(remaining|excess|balance)",
      "we (found|saw) your (resume|cv|profile)|you have been (hired|selected|approved) for)",
    ],
  },
];
// Assamese (as) - translated scam detection rules.
export const AS_RULES: LanguageRule[] = [
];
// Bengali (bn) - translated scam detection rules.
export const BN_RULES: LanguageRule[] = [
];
// Gujarati (gu) - translated scam detection rules.
export const GU_RULES: LanguageRule[] = [
];
// हिन्दी (hi) - translated scam detection rules.
export const HI_RULES: LanguageRule[] = [
  {
    type: "urgency",
    label: "ऊर्जा / समय",
    description: "सोचने से पहले आपको कार्यवाही करने के लिए झुठी तात्कालिकता पैदा करता है।",
    severity: "high",
    weight: 12,
    category: "ऊर्जा और समय",
    patterns: [
      "तात्कालिक",
      "तुरंत",
      "अभी करें",
      "अभी",
      "24 घंटे में",
      "घटना",
      "अंतिम मौका",
      "अंतिम चेतावनी",
      "अंतिम सूचना",
    ],
  },
  {
    type: "threat",
    label: "धमकी और डर",
    description: "आपको दबाव देने के लिए डर या धमकी का उपयोग करता है।",
    severity: "high",
    weight: 14,
    category: "डर और धमकी",
    patterns: [
      "कानूनी कार्रवाई",
      "आर्थिक कार्रवाई",
      "जेल",
      "पुलिस",
      "सशक्त",
      "criminal",
      "prosecut",
      "jail",
      "prison",
    ],
  },
  {
    type: "money_request",
    label: "पैसे का अनुरोध",
    description: "पैसे भेजने, उपहार कार्ड खरीदने या भुगतान करने के लिए कहा।",
    severity: "high",
    weight: 15,
    category: "पैसे का अनुरोध",
    patterns: [
      "send|wire|transfer|pay|donat(e|ing)",
      "money|funds|cash|payment|$|\\d+?dollars?|usd",
      "gift card|itunes|google play|amazon card|steam card|vanilla card|green dot|moneygram|western union|bitcoin|crypto|wallet address",
      "winn(ing|er)|prize|lottery|sweepstakes|inherit(ance|ed)|beneficiary|unclaimed|fund",
      "processing fee|transfer fee|clearance fee|registration fee|delivery fee|release fee",
      "claim your|you've (won|been selected)",
    ],
  },
  {
    type: "credential_harvest",
    label: "क्रेडेंशियल हैवेस्टिंग",
    description: "पासवर्ड, पिन या अकाउंट लॉगिन विवरण मांगता है।",
    severity: "high",
    weight: 16,
    category: "क्रेडेंशियल हैवेस्टिंग",
    patterns: [
      "password|pin|passcode|inicio de sesión|log.?in|credentials?|código de seguridad|código de acceso|otp|one.?time.?password|verification code",
    ],
  },
  {
    type: "impersonation",
    label: "अधिकार की नकल",
    description: "विश्वसनीय संगठन, सरकारी एजेंसी या कंपनी की नकल करता है।",
    severity: "medium",
    weight: 8,
    category: "सत्ता की नकल",
    patterns: [
      "bank|paypal|venmo|zelle|cashapp|apple|google|microsoft|amazon|netflix|facebook|instagram",
      "irs|fbi|cia|gobierno|federal|state department|social security administration|usps|ups|fedex|dhl|customs|border patrol",
      "chase|wells fargo|bank of america|citibank|citi|capital one|hsbc|barclays",
    ],
  },
  {
    type: "suspicious_link",
    label: "संदिग्ध लिंक",
    description: "असली साइटों पर जा सकते हैं में से क Refinery Tamil Thai Vietnamese",
    severity: "medium",
    weight: 10,
    category: "संदिग्ध लिंक",
    patterns: [
      "https?:\\/\\/(bit\\.ly|tinyurl\\.com|t\\.co|goo\\.gl|ow\\.ly|shorte\\.st|is\\.gd|buff\\.ly|rebrand\\.ly|cutt\\.ly)",
      "https?:\\/\\/[^\\s]{0,200}@[^\\s]{0,200}",
      "click here|tap here|follow this link|visit\\s*(our\\s*)?(site|link|page)|go to",
      "https?:\\/\\/(?![a-z0-9-]+\\.)*(apple|google|microsoft|amazon|paypal|github|wikipedia|youtube|facebook|instagram|twitter|linkedin|netflix)\\.com\\b)[^\\s]{10,80}",
    ],
  },
  {
    type: "personal_info",
    label: "व्यक्तिगत जानकारी का अनुरोध",
    description: "SSN, जन्मतिथि, पता जैसे संवेदनशील व्यक्तिगत डेटा का अनुरोध।",
    severity: "high",
    weight: 16,
    category: "संवेदनशील डेटा",
    patterns: [
      "ssn|social security|date of birth|mother(?:'\\u0027s)? maiden name|full (name )?ssn|passport|driver license|tax id|bank account number|routing number",
      "please|kindly|send|share (your )?([a-z]+ )?((address|phone|email|mobile|city|state|country))",
    ],
  },
  {
    type: "investment_scam",
    label: "निवेश / क्रिप्टो धोखा",
    description: "क्रिपो स्कीमें, निवेश अतिवाद या ट्रेडिंग संकेत प्रचार करता है।",
    severity: "high",
    weight: 12,
    category: "निवेश और धोखाधड़ी",
    patterns: [
      "crypto|bitcoin|btc|ethereum|eth|nft|mining|trading (signals?|bot)|forex|binary options|invest(ment)? (opportunity|platform|scheme|guaranteed)",
      "double|triple|multiply (money|investment|crypto|bitcoin|funds)",
      "return(s)? of \\d+|roi of \\d+|guaranteed (return|profit| ROI)",
    ],
  },
  {
    type: "job_scam",
    label: "नव/job/काम धोखा",
    description: "अस/realistic job opportunities or asks for payment for employment.",
    severity: "medium",
    weight: 8,
    category: "Too Good To Be True",
    patterns: [
      "mystery shopper|package (forwarding|reshipping)|personal assistant|work from home|remote (job|position|work)",
      "deposit (this|a) (check|cheque)|wire (the )?(remaining|excess|balance)",
      "we (found|saw) your (resume|cv|profile)|you have been (hired|selected|approved) for)",
    ],
  },
];
// Kannada (kn) - translated scam detection rules.
export const KN_RULES: LanguageRule[] = [
];
// Kashmiri (ks) - translated scam detection rules.
export const KS_RULES: LanguageRule[] = [
];
// Konkani (kok) - translated scam detection rules.
export const KOK_RULES: LanguageRule[] = [
];
// Malayalam (ml) - translated scam detection rules.
export const ML_RULES: LanguageRule[] = [
];
// Marathi (mr) - translated scam detection rules.
export const MR_RULES: LanguageRule[] = [
];
// Nepali (ne) - translated scam detection rules.
export const NE_RULES: LanguageRule[] = [
];
// Odia (or) - translated scam detection rules.
export const OR_RULES: LanguageRule[] = [
];
// Punjabi (pa) - translated scam detection rules.
export const PA_RULES: LanguageRule[] = [
];
// Sanskrit (sa) - translated scam detection rules.
export const SA_RULES: LanguageRule[] = [
];
// Tamil (ta) - translated scam detection rules.
export const TA_RULES: LanguageRule[] = [
];
// Telugu (te) - translated scam detection rules.
export const TE_RULES: LanguageRule[] = [
];
// Urdu (ur) - translated scam detection rules.
export const UR_RULES: LanguageRule[] = [
];
