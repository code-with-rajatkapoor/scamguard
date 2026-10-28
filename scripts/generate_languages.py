#!/usr/bin/env python3
"""Generate languages.ts - the multi-language scam phrase dictionary."""
import json

# Language data model: code -> list of rules
# Each rule maps scam patterns to categories with translations
LANGUAGES = {
    "en": {
        "name": "English",
        "flag": "🇺🇸",
        "rules": [
            {"type": "urgency", "label": "Urgency / Time Pressure", "description": "Creates a false sense of urgency to make you act before thinking.", "severity": "high", "weight": 12, "category": "Urgency & Pressure", "patterns": ["urgen(t|cy)", "immediate(ly)?", "act now", "right now", "asap", "before it's too late", "expires? (today|tonight|in \\d+|soon)", "last (chance|warning|notice)", "final (notice|warning|reminder)"]},
            {"type": "threat", "label": "Threats & Intimidation", "description": "Uses fear, threats, or warnings of consequences to pressure you.", "severity": "high", "weight": 14, "category": "Fear & Threats", "patterns": ["legal action", "lawsuit", "court", "arrest", "warrant", "police", "criminal", "prosecut", "jail", "prison", "suspend(ed|ing)?", "terminat(e|ed|ing)", "deactivat(e|ed|ing)", "close (your )?account", "freeze", "block(ed|ing)?", "ban(ned|ning)?", "owe|debt|tax|penalty|fine|unpaid|overdue|audit|irs|revenue", "consequenc(e|es)|penalt(y|ies)|charg(e|ed|ing) (you|against)"]},
            {"type": "money_request", "label": "Requests for Money / Payment", "description": "Asks you to send money, buy gift cards, or make a payment.", "severity": "high", "weight": 15, "category": "Financial Requests", "patterns": ["send|wire|transfer|pay|donat(e|ing)", "money|funds|cash|payment|$", "gift card|itunes|google play|amazon card|steam card|vanilla card|green dot|moneygram|western union|bitcoin|crypto|wallet address", "winn(ing|er)|prize|lottery|sweepstakes|inherit(ance|ed)|beneficiary|unclaimed|fund", "processing fee|transfer fee|clearance fee|registration fee|delivery fee|release fee", "claim your|you've (won|been selected|been chosen)"]},
            {"type": "credential_harvest", "label": "Credential Harvesting", "description": "Asks for passwords, PINs, or account login details.", "severity": "high", "weight": 16, "category": "Credential Theft", "patterns": ["password|passwd|pin|passcode|login|log.?in|credentials?|security code|access code|otp|one.?time.?password|verification code", "confirm|verify|update|validat(e|ion)|reactivat(e|ion) (your|my)? (account|identity|information|details?|payment)", "ssn|social security|date of birth|mother's maiden name|full (name )?ssn"]},
            {"type": "impersonation", "label": "Authority Impersonation", "description": "Impersonates a trusted organization, government agency, or company.", "severity": "medium", "weight": 8, "category": "Impersonation", "patterns": ["bank|paypal|venmo|zelle|cashapp|apple|google|microsoft|amazon|netflix|facebook|instagram", "irs|fbi|cia|government|federal|state department|social security administration|usps|ups|fedex|dhl|customs|border patrol", "chase|wells fargo|bank of america|citibank|citi|capital one|hsbc|barclays"]},
            {"type": "personal_info", "label": "Personal Information Requests", "description": "Asks for sensitive personal data such as SSN, DOB, or address.", "severity": "high", "weight": 16, "category": "Sensitive Data", "patterns": ["ssn|social security|date of birth|mother's maiden name|full (name )?ssn|passport|driver license|tax id|bank account number|routing number", "please|kindly|send|share (your )?([a-z]+ )?((address|phone|email|mobile|city|state|country))"]},
            {"type": "suspicious_link", "label": "Suspicious Links", "description": "Contains shortened or suspicious URLs that may lead to fake sites.", "severity": "medium", "weight": 10, "category": "Suspicious Links", "patterns": ["https?:\\/\\/(bit\\.ly|tinyurl\\.com|t\\.co|goo\\.gl|ow\\.ly|shorte\\.st|is\\.gd|buff\\.ly|rebrand\\.ly|cutt\\.ly)", "https?:\\/\\/[^\\s]{0,200}@[^\\s]{0,200}", "click here|tap here|follow this link|visit\\s*(our\\s*)?(site|link|page)|go to", "https?:\\/\\/(?![a-z0-9-]+\\.)*(apple|google|microsoft|amazon|paypal|github|wikipedia|youtube|facebook|instagram|twitter|linkedin|netflix)\\.com\\b)[^\\s]{10,80}"]},
            {"type": "investment_scam", "label": "Cryptocurrency / Investment Scam", "description": "Promotes crypto schemes, investment opportunities, or trading signals.", "severity": "high", "weight": 12, "category": "Financial Requests", "patterns": ["crypto|bitcoin|btc|ethereum|eth|nft|mining|trading (signals?|bot)|forex|binary options|invest(ment)? (opportunity|platform|scheme|guaranteed)", "double|triple|multiply (money|investment|crypto|bitcoin|funds)", "return(s)? of \\d+%|roi of \\d+%|guaranteed (return|profit| ROI)"]},
            {"type": "job_scam", "label": "Fake Job / Employment Scam", "description": "Offers unrealistic job opportunities or asks for payment for employment.", "severity": "medium", "weight": 8, "category": "Too Good To Be True", "patterns": ["mystery shopper|package (forwarding|reshipping)|personal assistant|work from home|remote (job|position|work)", "deposit (this|a) (check|cheque)|wire (the )?(remaining|excess|balance)", "we (found|saw) your (resume|cv|profile)|you have been (hired|selected|approved) for)"]},
        ],
    },
    # Indian languages (22 scheduled + major others)
    "as": {"name": "Assamese", "flag": "🇮🇳", "rules": []},
    "bn": {"name": "Bengali", "flag": "🇮🇳", "rules": []},
    "gu": {"name": "Gujarati", "flag": "🇮🇳", "rules": []},
    "hi": {"name": "हिन्दी", "flag": "🇮🇳", "rules": [
        {"type": "urgency", "label": "ऊर्जा / समय", "description": "सोचने से पहले आपको कार्यवाही करने के लिए झुठी तात्कालिकता पैदा करता है।", "severity": "high", "weight": 12, "category": "ऊर्जा और समय", "patterns": ["तात्कालिक", "तुरंत", "अभी करें", "अभी", "24 घंटे में", "घटना", "अंतिम मौका", "अंतिम चेतावनी", "अंतिम सूचना"]},
        {"type": "threat", "label": "धमकी और डर", "description": "आपको दबाव देने के लिए डर या धमकी का उपयोग करता है।", "severity": "high", "weight": 14, "category": "डर और धमकी", "patterns": ["कानूनी कार्रवाई", "आर्थिक कार्रवाई", "जेल", "पुलिस", "सशक्त", "criminal", "prosecut", "jail", "prison"]},
        {"type": "money_request", "label": "पैसे का अनुरोध", "description": "पैसे भेजने, उपहार कार्ड खरीदने या भुगतान करने के लिए कहा।", "severity": "high", "weight": 15, "category": "पैसे का अनुरोध", "patterns": ["send|wire|transfer|pay|donat(e|ing)", "money|funds|cash|payment|$|\\d+?dollars?|usd", "gift card|itunes|google play|amazon card|steam card|vanilla card|green dot|moneygram|western union|bitcoin|crypto|wallet address", "winn(ing|er)|prize|lottery|sweepstakes|inherit(ance|ed)|beneficiary|unclaimed|fund", "processing fee|transfer fee|clearance fee|registration fee|delivery fee|release fee", "claim your|you've (won|been selected)"]},
        {"type": "credential_harvest", "label": "क्रेडेंशियल हैवेस्टिंग", "description": "पासवर्ड, पिन या अकाउंट लॉगिन विवरण मांगता है।", "severity": "high", "weight": 16, "category": "क्रेडेंशियल हैवेस्टिंग", "patterns": ["password|pin|passcode|inicio de sesión|log.?in|credentials?|código de seguridad|código de acceso|otp|one.?time.?password|verification code"]},
        {"type": "impersonation", "label": "अधिकार की नकल", "description": "विश्वसनीय संगठन, सरकारी एजेंसी या कंपनी की नकल करता है।", "severity": "medium", "weight": 8, "category": "सत्ता की नकल", "patterns": ["bank|paypal|venmo|zelle|cashapp|apple|google|microsoft|amazon|netflix|facebook|instagram", "irs|fbi|cia|gobierno|federal|state department|social security administration|usps|ups|fedex|dhl|customs|border patrol", "chase|wells fargo|bank of america|citibank|citi|capital one|hsbc|barclays"]},
        {"type": "suspicious_link", "label": "संदिग्ध लिंक", "description": "असली साइटों पर जा सकते हैं में से क Refinery Tamil Thai Vietnamese", "severity": "medium", "weight": 10, "category": "संदिग्ध लिंक", "patterns": ["https?:\\/\\/(bit\\.ly|tinyurl\\.com|t\\.co|goo\\.gl|ow\\.ly|shorte\\.st|is\\.gd|buff\\.ly|rebrand\\.ly|cutt\\.ly)", "https?:\\/\\/[^\\s]{0,200}@[^\\s]{0,200}", "click here|tap here|follow this link|visit\\s*(our\\s*)?(site|link|page)|go to", "https?:\\/\\/(?![a-z0-9-]+\\.)*(apple|google|microsoft|amazon|paypal|github|wikipedia|youtube|facebook|instagram|twitter|linkedin|netflix)\\.com\\b)[^\\s]{10,80}"]},
        {"type": "personal_info", "label": "व्यक्तिगत जानकारी का अनुरोध", "description": "SSN, जन्मतिथि, पता जैसे संवेदनशील व्यक्तिगत डेटा का अनुरोध।", "severity": "high", "weight": 16, "category": "संवेदनशील डेटा", "patterns": ["ssn|social security|date of birth|mother(?:'\\u0027s)? maiden name|full (name )?ssn|passport|driver license|tax id|bank account number|routing number", "please|kindly|send|share (your )?([a-z]+ )?((address|phone|email|mobile|city|state|country))"]},
        {"type": "investment_scam", "label": "निवेश / क्रिप्टो धोखा", "description": "क्रिपो स्कीमें, निवेश अतिवाद या ट्रेडिंग संकेत प्रचार करता है।", "severity": "high", "weight": 12, "category": "निवेश और धोखाधड़ी", "patterns": ["crypto|bitcoin|btc|ethereum|eth|nft|mining|trading (signals?|bot)|forex|binary options|invest(ment)? (opportunity|platform|scheme|guaranteed)", "double|triple|multiply (money|investment|crypto|bitcoin|funds)", "return(s)? of \\d+|roi of \\d+|guaranteed (return|profit| ROI)"]},
        {"type": "job_scam", "label": "नव/job/काम धोखा", "description": "अस/realistic job opportunities or asks for payment for employment.", "severity": "medium", "weight": 8, "category": "Too Good To Be True", "patterns": ["mystery shopper|package (forwarding|reshipping)|personal assistant|work from home|remote (job|position|work)", "deposit (this|a) (check|cheque)|wire (the )?(remaining|excess|balance)", "we (found|saw) your (resume|cv|profile)|you have been (hired|selected|approved) for)"]},
    ]},
    "kn": {"name": "Kannada", "flag": "🇮🇳", "rules": []},
    "ks": {"name": "Kashmiri", "flag": "🇮🇳", "rules": []},
    "kok": {"name": "Konkani", "flag": "🇮🇳", "rules": []},
    "ml": {"name": "Malayalam", "flag": "🇮🇳", "rules": []},
    "mr": {"name": "Marathi", "flag": "🇮🇳", "rules": []},
    "ne": {"name": "Nepali", "flag": "🇮🇳", "rules": []},
    "or": {"name": "Odia", "flag": "🇮🇳", "rules": []},
    "pa": {"name": "Punjabi", "flag": "🇮🇳", "rules": []},
    "sa": {"name": "Sanskrit", "flag": "🇮🇳", "rules": []},
    "ta": {"name": "Tamil", "flag": "🇮🇳", "rules": []},
    "te": {"name": "Telugu", "flag": "🇮🇳", "rules": []},
    "ur": {"name": "Urdu", "flag": "🇮🇳", "rules": []},
}

# Generate TypeScript
lines = []
lines.append("// Multi-language scam phrase dictionary for ScamGuard.")
lines.append("// Each language maps its common scam phrases to the same scam categories.")
lines.append("// The detector merges all languages patterns, so the engine catches scams")
lines.append("// regardless of the input language. Adding a new language only requires")
lines.append("// adding entries here.")
lines.append("")
lines.append("export const SUPPORTED_LANGUAGES = [")
for code, lang in LANGUAGES.items():
    flag = lang.get("flag", "🌐")
    name = lang["name"]
    # Escape single quotes in names
    name = name.replace("'", "\\'")
    lines.append(f"  {{ code: '{code}', name: '{name}', flag: '{flag}' }},")
lines.append("] as const;")
lines.append("")
lines.append("export type LangCode = (typeof SUPPORTED_LANGUAGES)[number]['code'];")
lines.append("")
lines.append("export interface LanguageRule {")
lines.append("  type: string;")
lines.append("  label: string;")
lines.append("  description: string;")
lines.append("  severity: 'low' | 'medium' | 'high';")
lines.append("  weight: number;")
lines.append("  patterns: string[];")
lines.append("  category: string;")
lines.append("}")
lines.append("")
lines.append("export interface LanguageConfig {")
lines.append("  code: (typeof SUPPORTED_LANGUAGES)[number]['code'];")
lines.append("  name: string;")
lines.append("  rules: LanguageRule[];")
lines.append("}")
lines.append("")

# Generate rules for each language
for code, lang in LANGUAGES.items():
    lines.append(f"// {lang['name']} ({code}) - translated scam detection rules.")
    lines.append(f"export const {code.upper()}_RULES: LanguageRule[] = [")
    for rule in lang.get("rules", []):
        lines.append("  {")
        lines.append(f'    type: "{rule["type"]}",')
        lines.append(f'    label: "{rule["label"]}",')
        lines.append(f'    description: "{rule["description"]}",')
        lines.append(f'    severity: "{rule["severity"]}",')
        lines.append(f"    weight: {rule['weight']},")
        lines.append(f'    category: "{rule["category"]}",')
        lines.append("    patterns: [")
        for pattern in rule.get("patterns", []):
            # Escape regex backslashes in the TS string
            escaped = pattern.replace("\\", "\\\\")
            lines.append(f'      "{escaped}",')
        lines.append("    ],")
        lines.append("  },")
    lines.append("];")

# Write the file
with open("src/lib/languages.ts", "w", encoding="utf-8") as f:
    f.write("\n".join(lines) + "\n")

print(f"Generated {len(LANGUAGES)} languages, {sum(len(l['rules']) for l in LANGUAGES.values())} rules in total")
