import type { DetectedIndicator, RiskLevel, ScanResult } from '@/types';

interface Rule {
  type: string;
  label: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  weight: number;
  patterns: RegExp[];
  category: string;
}

const rules: Rule[] = [
  // Urgency & Pressure
  {
    type: 'urgency',
    label: 'Urgency / Time Pressure',
    description: 'Creates a false sense of urgency to make you act before thinking.',
    severity: 'high',
    weight: 12,
    category: 'Urgency & Pressure',
    patterns: [
      /\b(urgen(t|cy)|immediate(ly)?|act now|right now|asap|before it(?:'s| is)? too late|expires?\s*(today|tonight|in \d+|soon)|last (chance|warning|notice)|final (notice|warning|reminder))\b/gi,
      /\b\d+\s*(hour|hr|minute|min)s?\s*(left|remaining|until|before)\b/gi,
      /\baccount\s*(will be|is being)\s*(closed|suspended|terminated|locked|disabled|deactivated)\b/gi,
    ],
  },
  // Fear & Threats
  {
    type: 'threat',
    label: 'Threats & Intimidation',
    description: 'Uses fear, threats, or warnings of consequences to pressure you.',
    severity: 'high',
    weight: 14,
    category: 'Fear & Threats',
    patterns: [
      /\b(legal action|lawsuit|court|arrest|warrant|police|criminal|prosecut|jail|prison)\b/gi,
      /\b(suspend(ed|ing)?|terminat(e|ed|ing)|deactivat(e|ed|ing)|close (your )?account|freeze|block(ed|ing)?|ban(ned|ning)?)\b/gi,
      /\b(owe|debt|tax|penalty|fine|unpaid|overdue|audit|irs|revenue)\b/gi,
      /\b(consequenc(e|es)|penalt(y|ies)|charg(e|ed|ing)\s*(you|against))\b/gi,
    ],
  },
  // Money / Financial Requests
  {
    type: 'money_request',
    label: 'Requests for Money / Payment',
    description: 'Asks you to send money, buy gift cards, or make a payment.',
    severity: 'high',
    weight: 15,
    category: 'Financial Requests',
    patterns: [
      /\b(send|wire|transfer|pay|donat(e|ing))\s*(money|funds|cash|payment|\$|dollars?|usd)\b/gi,
      /\b(gift card|itunes|google play|amazon card|steam card|vanilla card|green dot|moneygram|western union|bitcoin|crypto|wallet address)\b/gi,
      /\b(winn(ing|er)|prize|lottery|sweepstakes|inherit(ance|ed)|beneficiary|unclaimed|fund)\b/gi,
      /\b(processing fee|transfer fee|clearance fee|registration fee|delivery fee|release fee)\b/gi,
      /\b(claim your|you(?:'ve| have) (won|been selected|been chosen))\b/gi,
    ],
  },
  // Credential Harvesting
  {
    type: 'credential_harvest',
    label: 'Credential Harvesting',
    description: 'Asks for passwords, PINs, or account login details.',
    severity: 'high',
    weight: 16,
    category: 'Credential Theft',
    patterns: [
      /\b(password|passwd|pin|passcode|login|log.?in|sign.?in|credentials?|security code|access code|otp|one.?time.?password|verification code)\b/gi,
      /\b(confirm|verify|update|validat(e|ion)|reactivat(e|ion))\s*(your|my)?\s*(account|identity|information|details?|payment)\b/gi,
      /\b(ssn|social security|date of birth|mother(?:'s)? maiden name|full (name )?ssn)\b/gi,
    ],
  },
  // Impersonation
  {
    type: 'impersonation',
    label: 'Authority Impersonation',
    description: 'Impersonates a trusted organization, government agency, or company.',
    severity: 'medium',
    weight: 8,
    category: 'Impersonation',
    patterns: [
      /\b(bank|paypal|venmo|zelle|cashapp|apple|google|microsoft|amazon|netflix|facebook|instagram)\b/gi,
      /\b(irs|fbi|cia|government|federal|state department|social security administration|usps|ups|fedex|dhl|customs|border patrol)\b/gi,
      /\b(chase|wells fargo|bank of america|citibank|citi|capital one|hsbc|barclays)\b/gi,
    ],
  },
  // Suspicious Links
  {
    type: 'suspicious_link',
    label: 'Suspicious Links',
    description: 'Contains shortened or suspicious URLs that may lead to fake sites.',
    severity: 'medium',
    weight: 10,
    category: 'Suspicious Links',
    patterns: [
      /https?:\/\/(bit\.ly|tinyurl\.com|t\.co|goo\.gl|ow\.ly|shorte\.st|is\.gd|buff\.ly|rebrand\.ly|cutt\.ly)\b/gi,
      /https?:\/\/[^\s]{0,200}@[^\s]{0,200}/gi,
      /\b(click here|tap here|follow this link|visit\s*(our\s*)?(site|link|page)|go to)\b/gi,
      /https?:\/\/(?!([a-z0-9-]+\.)?(apple|google|microsoft|amazon|paypal|github|wikipedia|youtube|facebook|instagram|twitter|linkedin|netflix)\.com\b)[^\s]{10,80}/gi,
    ],
  },
  // Personal Info Requests
  {
    type: 'personal_info',
    label: 'Personal Information Requests',
    description: 'Requests sensitive personal information beyond what is normal.',
    severity: 'medium',
    weight: 9,
    category: 'Information Harvesting',
    patterns: [
      /\b(home address|mailing address|full name|date of birth|dob|bank account|routing number|credit card|debit card|cvv|card number)\b/gi,
      /\b(send (us |me )?(a |your )?(photo|picture|selfie|image|scan) of)\b/gi,
    ],
  },
  // Too Good To Be True
  {
    type: 'too_good',
    label: 'Too Good To Be True',
    description: 'Promises rewards, prizes, or opportunities that are unrealistically generous.',
    severity: 'medium',
    weight: 10,
    category: 'Too Good To Be True',
    patterns: [
      /\b(free|guaranteed|100%|risk.?free|no (cost|fee|obligation|strings attached)|easy money|work from home|earn \$\d+|make \$\d+)/gi,
      /\b(selected|chosen|qualified|approved|eligible) (for|to (receive|get|win))\b/gi,
      /\b(\$\d{3,}\s*(free|bonus|reward|prize|gift)|\$\d{4,})\b/gi,
    ],
  },
  // Unusual Sender / Greeting
  {
    type: 'impersonal_greeting',
    label: 'Impersonal / Vague Greeting',
    description: 'Uses generic greetings instead of addressing you by name — a hallmark of mass-sent scams.',
    severity: 'low',
    weight: 5,
    category: 'Sender Red Flags',
    patterns: [
      /\b(dear (customer|user|sir|madam|valued customer|account holder|client|recipient|friend|member)|hi (user|customer|sir|madam)|attention (customer|user|account holder))\b/gi,
      /\b(to whom it may concern|dear sir\/madam|dear sir or madam)\b/gi,
    ],
  },
  // Grammar / Spelling Issues
  {
    type: 'poor_grammar',
    label: 'Poor Grammar / Formatting',
    description: 'Contains unusual capitalization, excessive exclamation marks, or poor formatting.',
    severity: 'low',
    weight: 4,
    category: 'Language Anomalies',
    patterns: [
      /[!]{3,}/g,
      /[A-Z]{15,}/g,
      /\b(dear|hello|hi)\b[^.!?\n]{0,80}\b(urgent|immediate|important|warning|alert|notice)\b/gi,
    ],
  },
  // Mismatched / Spoofed Contact
  {
    type: 'spoofed_contact',
    label: 'Mismatched Contact Info',
    description: "Uses phone numbers or email addresses that don't match the claimed organization.",
    severity: 'medium',
    weight: 7,
    category: 'Sender Red Flags',
    patterns: [
      /\b(call|text|contact|reply to|reach us at|whatsapp|telegram)\s*[:!]?\s*[\d+\-\s()]{7,30}/gi,
      /\b(do not (call|contact|reply|respond)|don'?t (call|reply|respond)|ignore if (you|this))\b/gi,
    ],
  },
  // Romance / Emotional Scam
  {
    type: 'romance_scam',
    label: 'Romance / Emotional Manipulation',
    description: 'Builds an emotional connection to later exploit for money or personal details.',
    severity: 'medium',
    weight: 8,
    category: 'Emotional Manipulation',
    patterns: [
      /\b(I (love|like) you|my (dear|darling|sweetheart|love)|you are (my )?(everything|soulmate|the (one|best)))\b/gi,
      /\b(stranded|stuck (in|abroad)|need (your )?help|emergency|hospital|medical bills?|surgery|hotel bill)\b/gi,
      /\b(soldier|military|deployed|overseas|peacekeeping|widow|widower|orphan)\b/gi,
    ],
  },
  // Subscription / Service Scam
  {
    type: 'subscription_scam',
    label: 'Fake Subscription / Service',
    description: 'Claims your subscription or order has a problem requiring action.',
    severity: 'medium',
    weight: 8,
    category: 'Impersonation',
    patterns: [
      /\b(order|subscription|payment|invoice|receipt) (confirmation|receipt|detail|update|status)\b/gi,
      /\b(your (order|subscription|payment|package|delivery|shipment) (is|has been|was) (confirm|process|cancel|suspend|delay|on hold))\b/gi,
      /\b(unde?liver(ed|able)|package (held|seized|waiting)|customs (fee|charge|clearance))\b/gi,
    ],
  },
  // Cryptocurrency / Investment Scam
  {
    type: 'investment_scam',
    label: 'Cryptocurrency / Investment Scam',
    description: 'Promotes crypto schemes, investment opportunities, or trading signals.',
    severity: 'high',
    weight: 12,
    category: 'Financial Requests',
    patterns: [
      /\b(crypto|bitcoin|btc|ethereum|eth|nft|mining|trading (signals?|bot)|forex|binary options|invest(ment)? (opportunity|platform|scheme|guaranteed))\b/gi,
      /\b(double|triple|multiply|grow) your (money|investment|crypto|bitcoin|funds)\b/gi,
      /\b(return(s)? of \d+%|roi of \d+%|guaranteed (return|profit| ROI))\b/gi,
    ],
  },
  // Employment / Job Scam
  {
    type: 'job_scam',
    label: 'Fake Job / Employment Scam',
    description: 'Offers unrealistic job opportunities or asks for payment for employment.',
    severity: 'medium',
    weight: 8,
    category: 'Too Good To Be True',
    patterns: [
      /\b(mystery shopper|package (forwarding|reshipping)|personal assistant|work from home|remote (job|position|work))\b/gi,
      /\b(deposit (this|a) (check|cheque)|wire (the )?(remaining|excess|balance))\b/gi,
      /\b(we (found|saw) your (resume|cv|profile)|you have been (hired|selected|approved) for)\b/gi,
    ],
  },
];

const MAX_INPUT_LENGTH = 10000;

export function analyzeText(text: string): ScanResult {
  const trimmed = text.slice(0, MAX_INPUT_LENGTH).trim();
  const indicators: DetectedIndicator[] = [];
  const categoryScores: Record<string, number> = {};
  let rawScore = 0;

  const isEmpty = trimmed.length === 0;

  for (const rule of rules) {
    let matched = false;
    let matchSample = '';

    for (const pattern of rule.patterns) {
      const regex = new RegExp(pattern.source, pattern.flags);
      const match = regex.exec(trimmed);
      if (match) {
        matched = true;
        matchSample = match[0];
        break;
      }
    }

    if (matched) {
      const indicator: DetectedIndicator = {
        type: rule.type,
        label: rule.label,
        description: rule.description,
        severity: rule.severity,
        match: matchSample,
      };
      indicators.push(indicator);

      rawScore += rule.weight;
      categoryScores[rule.category] = (categoryScores[rule.category] || 0) + rule.weight;
    }
  }

  // Normalize score to 0-100 with diminishing returns
  const normalizedScore = isEmpty ? 0 : Math.min(100, Math.round(rawScore * 1.8));

  let riskLevel: RiskLevel = 'safe';
  if (normalizedScore >= 65) riskLevel = 'danger';
  else if (normalizedScore >= 30) riskLevel = 'caution';

  // Build category breakdown sorted by score
  const breakdown = Object.entries(categoryScores)
    .map(([category, score]) => ({ category, score }))
    .sort((a, b) => b.score - a.score);

  let summary: string;
  if (isEmpty) {
    summary = 'No text provided for analysis.';
  } else if (normalizedScore < 30) {
    summary =
      indicators.length === 0
        ? 'No significant phishing or scam indicators detected. This message appears relatively safe, but always stay vigilant.'
        : 'A few minor red flags were detected. This message is likely safe but contains some elements worth double-checking.';
  } else if (normalizedScore < 65) {
    summary = `Several suspicious indicators were found (${indicators.length}). Exercise caution — verify the sender through official channels before taking any action.`;
  } else {
    summary = `High risk detected with ${indicators.length} strong scam/phishing indicators. Do NOT click links, send money, or share personal information. Report and block this message.`;
  }

  return {
    riskScore: normalizedScore,
    riskLevel,
    indicators,
    summary,
    breakdown,
  };
}
