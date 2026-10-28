#!/usr/bin/env python3
# Write the complete languages.ts file
lines = []
lines.append('// Multi-language scam phrase dictionary for ScamGuard.')
lines.append('// Each language maps its common scam phrases to the same scam categories.')
lines.append('// The detector merges all languages patterns, so the engine catches scams')
lines.append('// regardless of the input language. Adding a new language only requires')
lines.append('// adding entries here.')
lines.append('')
lines.append('export const SUPPORTED_LANGUAGES = [')
lines.append("  { code: 'en', name: 'English', flag: '\\U0001F1FA\\U0001F1F8' },")
lines.append("  { code: 'es', name: 'Español', flag: '\\U0001F1EA\\U0001F1F8' },")
lines.append("  { code: 'hi', name: 'हिन्दी', flag: '\\U0001F1EE\\U0001F1F0' },")
lines.append("  { code: 'de', name: 'Deutsch', flag: '\\U0001F1E9\\U0001F1EA' },")
lines.append("  { code: 'fr', name: 'Français', flag: '\\U0001F1EB\\U0001F1F7' },")
lines.append("  { code: 'pt', name: 'Português', flag: '\\U0001F1F5\\U0001F1F9' },")
lines.append("  { code: 'ja', name: '日本語', flag: '\\U0001F1EF\\U0001F1F0' },")
lines.append("  { code: 'ko', name: '한국어', flag: '\\U0001F1F0\\U0001F1F7' },")
lines.append("  { code: 'ar', name: 'العربية', flag: '\\U0001F1E6\\U0001F1E9' },")
lines.append('] as const;')
lines.append('')
lines.append('export type LangCode = (typeof SUPPORTED_LANGUAGES)[number]["code"];')
lines.append('')
lines.append('export interface LanguageRule {')
lines.append('  type: string;')
lines.append('  label: string;')
lines.append('  description: string;')
lines.append('  severity: "low" | "medium" | "high";')
lines.append('  weight: number;')
lines.append('  patterns: string[];')
lines.append('  category: string;')
lines.append('}')
lines.append('')
lines.append('export interface LanguageConfig {')
lines.append('  code: (typeof SUPPORTED_LANGUAGES)[number]["code"];')
lines.append('  name: string;')
lines.append('  rules: LanguageRule[];')
lines.append('}')
lines.append('')
lines.append('// English (default) - comprehensive scam phrase dictionary.')
lines.append('export const ENGLISH_RULES: LanguageRule[] = [')
lines.append('  // Urgency & Pressure')
lines.append('  {')
lines.append('    type: "urgency",')
lines.append('    label: "Urgency / Time Pressure",')
lines.append('    description: "Creates a false sense of urgency to make you act before thinking.",')
lines.append('    severity: "high",')
lines.append('    weight: 12,')
lines.append('    category: "Urgency & Pressure",')
lines.append('    patterns: [')
lines.append('      "\\b(urgen(t|cy)|immediate(ly)?|act now|right now|asap|before it\'s too late|expires?\\s*(today|tonight|in \\d+|soon)|last (chance|warning|notice)|final (notice|warning|reminder))\\b",')
lines.append('      "\\b\\d+\\s*(hour|hr|minute|min)s?\\s*(left|remaining|until|before)\\b",')
lines.append('      "\\baccount\\s*(will be|is being)\\s*(closed|suspended|terminated|locked|disabled|deactivated)\\b",')
lines.append('    ],')
lines.append('  },')
lines.append('  // Fear & Threats')
lines.append('  {')
lines.append('    type: "threat",')
lines.append('    label: "Threats & Intimidation",')
lines.append('    description: "Uses fear, threats, or warnings of consequences to pressure you.",')
lines.append('    severity: "high",')
lines.append('    weight: 14,')
lines.append('    category: "Fear & Threats",')
lines.append('    patterns: [')
lines.append('      "\\b(legal action|lawsuit|court|arrest|warrant|police|criminal|prosecut|jail|prison)\\b",')
lines.append('      "\\b(suspend(ed|ing)?|terminat(e|ed|ing)|deactivat(e|ed|ing)|close (your )?account|freeze|block(ed|ing)?|ban(ned|ning)?)\\b",')
lines.append('      "\\b(owe|debt|tax|penalty|fine|unpaid|overdue|audit|irs|revenue)\\b",')
lines.append('      "\\b(consequenc(e|es)|penalt(y|ies)|charg(e|ed|ing)\\s*(you|against))\\b",')
lines.append('    ],')
lines.append('  },')
lines.append('  // Money / Financial Requests')
lines.append('  {')
lines.append('    type: "money_request",')
lines.append('    label: "Requests for Money / Payment",')
lines.append('    description: "Asks you to send money, buy gift cards, or make a payment.",')
lines.append('    severity: "high",')
lines.append('    weight: 15,')
lines.append('    category: "Financial Requests",')
lines.append('    patterns: [')
lines.append('      "\\b(send|wire|transfer|pay|donat(e|ing))\\s*(money|funds|cash|payment|\\$)\\b",')
lines.append('      "\\b(gift card|itunes|google play|amazon card|steam card|vanilla card|green dot|moneygram|western union|bitcoin|crypto|wallet address)\\b",')
lines.append('      "\\b(winn(ing|er)|prize|lottery|sweepstakes|inherit(ance|ed)|beneficiary|unclaimed|fund)\\b",')
lines.append('      "\\b(processing fee|transfer fee|clearance fee|registration fee|delivery fee|release fee)\\b",')
lines.append('      "\\b(claim your|you\'ve (won|been selected|been chosen))\\b",')
lines.append('    ],')
lines.append('  },')
lines.append('  // Credential Harvesting')
lines.append('  {')
lines.append('    type: "credential_harvest",')
lines.append('    label: "Credential Harvesting",')
lines.append('    description: "Asks for passwords, PINs, or account login details.",')
lines.append('    severity: "high",')
lines.append('    weight: 16,')
lines.append('    category: "Credential Theft",')
lines.append('    patterns: [')
lines.append('      "\\b(password|passwd|pin|passcode|login|log.?in|credentials?|security code|access code|otp|one.?time.?password|verification code)\\b",')
lines.append('      "\\b(confirm|verify|update|validat(e|ion)|reactivat(e|ion))\\s*(your|my)?\\s*(account|identity|information|details?|payment)\\b",')
lines.append('      "\\b(ssn|social security|date of birth|mother\'s maiden name|full (name )?ssn)\\b",')
lines.append('    ],')
lines.append('  },')
lines.append('  // Impersonation')
lines.append('  {')
lines.append('    type: "impersonation",')
lines.append('    label: "Authority Impersonation",')
lines.append('    description: "Impersonates a trusted organization, government agency, or company.",')
lines.append('    severity: "medium",')
lines.append('    weight: 8,')
lines.append('    category: "Impersonation",')
lines.append('    patterns: [')
lines.append('      "\\b(bank|paypal|venmo|zelle|cashapp|apple|google|microsoft|amazon|netflix|facebook|instagram)\\b",')
lines.append('      "\\b(irs|fbi|cia|government|federal|state department|social security administration|usps|ups|fedex|dhl|customs|border patrol)\\b",')
lines.append('      "\\b(chase|wells fargo|bank of america|citibank|citi|capital one|hsbc|barclays)\\b",')
lines.append('    ],')
lines.append('  },')
lines.append('  // Suspicious Links')
lines.append('  {')
lines.append('    type: "suspicious_link",')
lines.append('    label: "Suspicious Links",')
lines.append('    description: "Contains shortened or suspicious URLs that may lead to fake sites.",')
lines.append('    severity: "medium",')
lines.append('    weight: 10,')
lines.append('    category: "Suspicious Links",')
lines.append('    patterns: [')
lines.append('      "https?:\\/\\/(bit\\.ly|tinyurl\.com|t\.co|goo\.gl|ow\.ly|shorte\.st|is\.gd|buff\.ly|rebrand\.ly|cutt\.ly)\\b",')
lines.append('      "https?:\/\/[^\s]{0,200}@[^\s]{0,200}",')
lines.append('      "\\b(click here|tap here|follow this link|visit\s*(our\s*)?(site|link|page)|go to)\b",')
lines.append('      "https?:\/\/(?!([a-z0-9-]+\.)?(apple|google|microsoft|amazon|paypal|github|wikipedia|youtube|facebook|instagram|twitter|linkedin|netflix)\.com\b)[^\s]{10,80}",')
lines.append('    ],')
lines.append('  },')
lines.append('  // Personal Info Requests')
lines.append('  {')
lines.append('    type: "personal_info",')
lines.append('    label: "Personal Information Requests",')
lines.append('    description: "Asks for sensitive personal data such as SSN, DOB, or address.",')
lines.append('    severity: "high",')
lines.append('    weight: 16,')
lines.append('    category: "Sensitive Data",')
lines.append('    patterns: [')
lines.append('      "\\b(ssn|social security|date of birth|mother\'s maiden name|full (name )?ssn|passport|driver license|tax id|bank account number|routing number)\\b",')
lines.append('      "\\b(please|kindly|send|share)\s+(your )?([a-z]+ )?((address|phone|email|mobile|city|state|country))\b",')
lines.append('    ],')
lines.append('  },')
lines.append('  // Investment / Crypto Scams')
lines.append('  {')
lines.append('    type: "investment_scam",')
lines.append('    label: "Cryptocurrency / Investment Scam",')
lines.append('    description: "Promotes crypto schemes, investment opportunities, or trading signals.",')
lines.append('    severity: "high",')
lines.append('    weight: 12,')
lines.append('    category: "Financial Requests",')
lines.append('    patterns: [')
lines.append('      "\\b(crypto|bitcoin|btc|ethereum|eth|nft|mining|trading (signals?|bot)|forex|binary options|invest(ment)? (opportunity|platform|scheme|guaranteed))\\b",')
lines.append('      "\\b(double|triple|multiply) your (money|investment|crypto|bitcoin|funds)\b",')
lines.append('      "\\b(return(s)? of \d+%|roi of \d+%|guaranteed (return|profit| ROI))\b",')
lines.append('    ],')
lines.append('  },')
lines.append('  // Job Scams')
lines.append('  {')
lines.append('    type: "job_scam",')
lines.append('    label: "Fake Job / Employment Scam",')
lines.append('    description: "Offers unrealistic job opportunities or asks for payment for employment.",')
lines.append('    severity: "medium",')
lines.append('    weight: 8,')
lines.append('    category: "Too Good To Be True",')
lines.append('    patterns: [')
lines.append('      "\\b(mystery shopper|package (forwarding|reshipping)|personal assistant|work from home|remote (job|position|work))\b",')
lines.append('      "\\b(deposit (this|a) (check|cheque)|wire (the )?(remaining|excess|balance))\b",')
lines.append('      "\\b(we (found|saw) your (resume|cv|profile)|you have been (hired|selected|approved) for))\b",')
lines.append('    ],')
lines.append('  },')
lines.append('];')
lines.append('')

# Hindi
hindi = '''export const HI_RULES: LanguageRule[] = [
  {
    type: "urgency",
    label: "ऊर्जा / समय",
    description: "सोचने से पहले आपको कार्यवाही करने के लिए झुठी तात्कालिकता पैदा करता है।",
    severity: "high",
    weight: 12,
    category: "ऊर्जा और समय",
    patterns: [
      "\\b(तात्कालिक|तुरंत|अभी करें|अभी|24 घंटे में|घटना|अंतिम मौका|अंतिम चेतावनी|अंतिम सूचना)\\b",
      "\\b\\d+\\s*(घंटा|मिनट)s?\\s*(शेष|पहले|से)\\b",
      "\\bcredentials?\\s*(will be|is being)\\s*(closed|suspended|terminated|locked|disabled|deactivated)\\b",
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
      "\\b(kानूनी कार्रवाई|आर्थिक कार्रवाई|जेल|पुलिस|सशक्त|criminal|prosecut|jail|prison)\\b",
      "\\b(suspended|terminated|bloqueada|cerrada|en frozen|ban(nido))\\b",
      "\\b(bezub??|tax|penalty|fine|unpaid|overdue|audit|irs|revenue)\\b",
      "\\b(consecuencia|pena|te vas a acusar)\\b",
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
      "\\b(send|wire|transfer|pay|donat(e|ing))\\s*(money|funds|cash|payment|\\$|\\d+?dollars?|usd)\\b",
      "\\b(gift card|itunes|google play|amazon card|steam card|vanilla card|green dot|moneygram|western union|bitcoin|crypto|wallet address)\\b",
      "\\b(winn(ing|er)|prize|lottery|sweepstakes|inherit(ance|ed)|beneficiary|unclaimed|fund)\\b",
      "\\b(processing fee|transfer fee|clearance fee|registration fee|delivery fee|release fee)\\b",
      "\\b(claim your|you(?:\\'?ve| have) (won|been selected))\\b",
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
      "\\b(contraseña|pin|passcode|inicio de sesión|log.?in|credentials?|código de seguridad|código de acceso|otp|one.?time.?password|verification code)\\b",
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
      "\\b(banco|paypal|venmo|zelle|cashapp|apple|google|microsoft|amazon|netflix|facebook|instagram)\\b",
      "\\b(irs|fbi|cia|gobierno|federal|state department|social security administration|usps|ups|fedex|dhl|customs|border patrol)\\b",
      "\\b(chase|wells fargo|bank of america|citibank|citi|capital one|hsbc|barclays)\\b",
    ],
  },
  {
    type: "suspicious_link",
    label: "संदिग्ध लिंक",
    description: "असली साइटों पर जा सकते हैं में से क정밀화학 싱가포르입니다",
    severity: "medium",
    weight: 10,
    category: "संदिग्ध लिंक",
    patterns: [
      "https?:\\/\\/(bit\\.ly|tinyurl\\.com|t\\.co|goo\\.gl|ow\\.ly|shorte\.st|is\.gd|buff\.ly|rebrand\.ly|cutt\.ly)\\b",
      "https?:\\/\\/[^\\s]{0,200}@[^\\s]{0,200}",
      "\\b(click here|tap here|follow this link|visit\\s*(our\\s*)?(site|link|page)|go to)\\b",
      "https?:\\/\\/(?!([a-z0-9-]+\\.)?(apple|google|microsoft|amazon|paypal|github|wikipedia|youtube|facebook|instagram|twitter|linkedin|netflix)\\.com\\b)[^\\s]{10,80}",
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
      "\\b(ssn|social security|date of birth|mother(?:'\\u0027s)? maiden name|full (name )?ssn|passport|driver license|tax id|bank account number|routing number)\\b",
      "\\b(please|kindly|send|share)\\s+(your )?([a-z]+ )?((address|phone|email|mobile|city|state|country))\\b",
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
      "\\b(crypto|bitcoin|btc|ethereum|eth|nft|mining|trading (signals?|bot)|forex|binary options|invest(ment)? (opportunity|platform|scheme|guaranteed))\\b",
      "\\b(double|triple|multiply) your (money|investment|crypto|bitcoin|funds)\\b",
      "\\b(return(s)? of \\d+%|roi of \\d+%|guaranteed (return|profit| ROI))\\b",
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
      "\\b(mystery shopper|package (forwarding|reshipping)|personal assistant|work from home|remote (job|position|work))\\b",
      "\\b(deposit (this|a) (check|cheque)|wire (the )?(remaining|excess|balance))\\b",
      "\\b(we (found|saw) your (resume|cv|profile)|you have been (hired|selected|approved) for))\\b",
    ],
  },
];'''

# Write the complete file
with open('src/lib/languages.ts', 'w') as f:
    f.write('\n'.join(lines))
    f.write('\n')
    f.write(hindi)

print("Written languages.ts")
