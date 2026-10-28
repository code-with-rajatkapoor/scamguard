// Multi-language scam phrase dictionary for ScamGuard.
// Each language maps its common scam phrases to the same scam categories.
// The detector merges all languages patterns, so the engine catches scams
// regardless of the input language. Adding a new language only requires
// adding entries here.

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
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

// English (default) - comprehensive scam phrase dictionary.
export const ENGLISH_RULES: LanguageRule[] = [
  // Urgency & Pressure
  {
    type: "urgency",
    label: "Urgency / Time Pressure",
    description: "Creates a false sense of urgency to make you act before thinking.",
    severity: "high",
    weight: 12,
    category: "Urgency & Pressure",
    patterns: [
      "\b(urgen(t|cy)|immediate(ly)?|act now|right now|asap|before it's too late|expires?\s*(today|tonight|in \d+|soon)|last (chance|warning|notice)|final (notice|warning|reminder))\b",
      "\b\d+\s*(hour|hr|minute|min)s?\s*(left|remaining|until|before)\b",
      "\baccount\s*(will be|is being)\s*(closed|suspended|terminated|locked|disabled|deactivated)\b",
    ],
  },
  // Fear & Threats
  {
    type: "threat",
    label: "Threats & Intimidation",
    description: "Uses fear, threats, or warnings of consequences to pressure you.",
    severity: "high",
    weight: 14,
    category: "Fear & Threats",
    patterns: [
      "\b(legal action|lawsuit|court|arrest|warrant|police|criminal|prosecut|jail|prison)\b",
      "\b(suspend(ed|ing)?|terminat(e|ed|ing)|deactivat(e|ed|ing)|close (your )?account|freeze|block(ed|ing)?|ban(ned|ning)?)\b",
      "\b(owe|debt|tax|penalty|fine|unpaid|overdue|audit|irs|revenue)\b",
      "\b(consequenc(e|es)|penalt(y|ies)|charg(e|ed|ing)\s*(you|against))\b",
    ],
  },
  // Money / Financial Requests
  {
    type: "money_request",
    label: "Requests for Money / Payment",
    description: "Asks you to send money, buy gift cards, or make a payment.",
    severity: "high",
    weight: 15,
    category: "Financial Requests",
    patterns: [
      "\b(send|wire|transfer|pay|donat(e|ing))\s*(money|funds|cash|payment|\$)\b",
      "\b(gift card|itunes|google play|amazon card|steam card|vanilla card|green dot|moneygram|western union|bitcoin|crypto|wallet address)\b",
      "\b(winn(ing|er)|prize|lottery|sweepstakes|inherit(ance|ed)|beneficiary|unclaimed|fund)\b",
      "\b(processing fee|transfer fee|clearance fee|registration fee|delivery fee|release fee)\b",
      "\b(claim your|you've (won|been selected|been chosen))\b",
    ],
  },
  // Credential Harvesting
  {
    type: "credential_harvest",
    label: "Credential Harvesting",
    description: "Asks for passwords, PINs, or account login details.",
    severity: "high",
    weight: 16,
    category: "Credential Theft",
    patterns: [
      "\b(password|passwd|pin|passcode|login|log.?in|credentials?|security code|access code|otp|one.?time.?password|verification code)\b",
      "\b(confirm|verify|update|validat(e|ion)|reactivat(e|ion))\s*(your|my)?\s*(account|identity|information|details?|payment)\b",
      "\b(ssn|social security|date of birth|mother's maiden name|full (name )?ssn)\b",
    ],
  },
  // Impersonation
  {
    type: "impersonation",
    label: "Authority Impersonation",
    description: "Impersonates a trusted organization, government agency, or company.",
    severity: "medium",
    weight: 8,
    category: "Impersonation",
    patterns: [
      "\b(bank|paypal|venmo|zelle|cashapp|apple|google|microsoft|amazon|netflix|facebook|instagram)\b",
      "\b(irs|fbi|cia|government|federal|state department|social security administration|usps|ups|fedex|dhl|customs|border patrol)\b",
      "\b(chase|wells fargo|bank of america|citibank|citi|capital one|hsbc|barclays)\b",
    ],
  },
  // Suspicious Links
  {
    type: "suspicious_link",
    label: "Suspicious Links",
    description: "Contains shortened or suspicious URLs that may lead to fake sites.",
    severity: "medium",
    weight: 10,
    category: "Suspicious Links",
    patterns: [
      "https?:\/\/(bit\.ly|tinyurl\.com|t\.co|goo\.gl|ow\.ly|shorte\.st|is\.gd|buff\.ly|rebrand\.ly|cutt\.ly)\b",
      "https?:\/\/[^\s]{0,200}@[^\s]{0,200}",
      "\b(click here|tap here|follow this link|visit\s*(our\s*)?(site|link|page)|go to)\b",
      "https?:\/\/(?![a-z0-9-]+\.)*(apple|google|microsoft|amazon|paypal|github|wikipedia|youtube|facebook|instagram|twitter|linkedin|netflix)\.com\b)[^\s]{10,80}",
    ],
  },
  // Personal Info Requests
  {
    type: "personal_info",
    label: "Personal Information Requests",
    description: "Asks for sensitive personal data such as SSN, DOB, or address.",
    severity: "high",
    weight: 16,
    category: "Sensitive Data",
    patterns: [
      "\b(ssn|social security|date of birth|mother's maiden name|full (name )?ssn|passport|driver license|tax id|bank account number|routing number)\b",
      "\b(please|kindly|send|share)\s+(your )?([a-z]+ )?((address|phone|email|mobile|city|state|country))\b",
    ],
  },
  // Investment / Crypto Scams
  {
    type: "investment_scam",
    label: "Cryptocurrency / Investment Scam",
    description: "Promotes crypto schemes, investment opportunities, or trading signals.",
    severity: "high",
    weight: 12,
    category: "Financial Requests",
    patterns: [
      "\b(crypto|bitcoin|btc|ethereum|eth|nft|mining|trading (signals?|bot)|forex|binary options|invest(ment)? (opportunity|platform|scheme|guaranteed))\b",
      "\b(double|triple|multiply) your (money|investment|crypto|bitcoin|funds)\b",
      "\b(return(s)? of \d+%|roi of \d+%|guaranteed (return|profit| ROI))\b",
    ],
  },
  // Job Scams
  {
    type: "job_scam",
    label: "Fake Job / Employment Scam",
    description: "Offers unrealistic job opportunities or asks for payment for employment.",
    severity: "medium",
    weight: 8,
    category: "Too Good To Be True",
    patterns: [
      "\b(mystery shopper|package (forwarding|reshipping)|personal assistant|work from home|remote (job|position|work))\b",
      "\b(deposit (this|a) (check|cheque)|wire (the )?(remaining|excess|balance))\b",
      "\b(we (found|saw) your (resume|cv|profile)|you have been (hired|selected|approved) for))\b",
    ],
  },
];
