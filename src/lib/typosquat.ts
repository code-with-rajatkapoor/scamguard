import type { DetectedIndicator, ThreatMatch, TyposquatFinding } from '@/types';

const TYPOSQUAT_TYPE = 'typosquatting';
const TYPOSQUAT_LABEL = 'Typosquatting / Fake Domain';
const TYPOSQUAT_BADGE = 'Fake Domain';
const TYPOSQUAT_CATEGORY = 'Fake Domains';
export const TYPOSQUAT_WEIGHT = 16;

const RISKY_TLDS = new Set(['xyz', 'top', 'site', 'tk', 'online', 'club']);

const BAIT_TOKENS = new Set([
  'verify',
  'login',
  'signin',
  'sign-in',
  'update',
  'secure',
  'security',
  'account',
  'bank',
  'official',
  'support',
  'help',
  'alert',
  'confirm',
  'unlock',
  'kyc',
  'refund',
  'prize',
  'gift',
  'wallet',
  'portal',
  'auth',
  'reset',
  'password',
  'otp',
]);

interface BrandProfile {
  name: string;
  keywords: string[];
  officialHosts: string[];
}

const BRANDS: BrandProfile[] = [
  { name: 'Paytm', keywords: ['paytm'], officialHosts: ['paytm.com', 'paytm.in'] },
  {
    name: 'SBI',
    keywords: ['sbi', 'onlinesbi'],
    officialHosts: ['sbi.co.in', 'onlinesbi.sbi', 'bank.sbi', 'sbi.bank.in', 'yono.sbi', 'yonobusiness.sbi'],
  },
  { name: 'HDFC', keywords: ['hdfc', 'hdfcbank'], officialHosts: ['hdfcbank.com', 'hdfc.com', 'hdfcbank.in'] },
  { name: 'ICICI', keywords: ['icici', 'icicibank'], officialHosts: ['icicibank.com', 'icici.com'] },
  { name: 'Axis', keywords: ['axis', 'axisbank'], officialHosts: ['axisbank.com', 'axisbank.in'] },
  {
    name: 'Amazon',
    keywords: ['amazon', 'amzn'],
    officialHosts: ['amazon.com', 'amazon.in', 'amazon.co.uk', 'amazon.co.jp', 'amzn.to', 'amazon.de'],
  },
  {
    name: 'Google',
    keywords: ['google', 'gmail'],
    officialHosts: ['google.com', 'google.co.in', 'gmail.com', 'youtube.com', 'goo.gl', 'googleusercontent.com'],
  },
  { name: 'Flipkart', keywords: ['flipkart'], officialHosts: ['flipkart.com'] },
  { name: 'PhonePe', keywords: ['phonepe'], officialHosts: ['phonepe.com', 'phonepe.in'] },
  { name: 'Yono', keywords: ['yono'], officialHosts: ['yono.sbi', 'yonobusiness.sbi', 'yononet.sbi'] },
];

const URL_OR_DOMAIN =
  /(?:https?:\/\/)?(?:www\.)?(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+(?:xyz|top|site|tk|online|club|com|net|org|in|co|io|info|biz|app|me|us|uk|edu|gov|cc)(?:\.[a-z]{2,})?(?:\/[^\s<>"'()]+)*/gi;

function levenshtein(a: string, b: string): number {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const dp: number[] = new Array(rows * cols);

  for (let i = 0; i < rows; i++) dp[i * cols] = i;
  for (let j = 0; j < cols; j++) dp[j] = j;

  for (let i = 1; i < rows; i++) {
    for (let j = 1; j < cols; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i * cols + j] = Math.min(
        dp[(i - 1) * cols + j] + 1,
        dp[i * cols + j - 1] + 1,
        dp[(i - 1) * cols + j - 1] + cost
      );
    }
  }

  return dp[(rows - 1) * cols + (cols - 1)];
}

function normalizeLookalikes(value: string): string {
  return value
    .toLowerCase()
    .replace(/0/g, 'o')
    .replace(/1/g, 'l')
    .replace(/3/g, 'e')
    .replace(/4/g, 'a')
    .replace(/5/g, 's')
    .replace(/@/g, 'a');
}

function stripTrailingPunctuation(raw: string): string {
  return raw.replace(/[),.;!?]+$/g, '');
}

function parseHost(raw: string): string | null {
  const cleaned = stripTrailingPunctuation(raw.trim());
  if (!cleaned) return null;

  let candidate = cleaned;
  if (!/^https?:\/\//i.test(candidate)) {
    candidate = `http://${candidate}`;
  }

  try {
    const hostname = new URL(candidate).hostname.toLowerCase();
    if (!hostname || !hostname.includes('.')) return null;
    return hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

function isOfficialHost(host: string, brand: BrandProfile): boolean {
  return brand.officialHosts.some((official) => host === official || host.endsWith(`.${official}`));
}

function isKnownOfficial(host: string): boolean {
  return BRANDS.some((brand) => isOfficialHost(host, brand));
}

function hostTld(host: string): string {
  const parts = host.split('.');
  return parts[parts.length - 1] ?? '';
}

function hyphenTokens(host: string): string[] {
  const registrable = host.split('.').slice(0, -1).join('.');
  return registrable.split(/[-.]+/).filter(Boolean);
}

function looksLikeMisspelling(token: string, keyword: string): boolean {
  if (token === keyword) return false;
  if (token.length < 3 || keyword.length < 3) return false;

  const normalized = normalizeLookalikes(token);
  if (normalized === keyword) return true;

  const maxDistance = keyword.length <= 4 ? 1 : 2;
  if (Math.abs(token.length - keyword.length) > maxDistance) return false;

  const distance = Math.min(levenshtein(token, keyword), levenshtein(normalized, keyword));
  return distance > 0 && distance <= maxDistance;
}

function containsKeyword(value: string, keyword: string): boolean {
  return value.includes(keyword);
}

function inspectHost(host: string): { brand: string; signals: string[] } | null {
  if (isKnownOfficial(host)) return null;

  const tokens = hyphenTokens(host);
  const compactHost = host.replace(/[-.]/g, '');
  const tld = hostTld(host);
  const dashCount = (host.match(/-/g) || []).length;

  let bestBrand: string | null = null;
  const signals: string[] = [];

  for (const brand of BRANDS) {
    const brandSignals: string[] = [];
    let impersonating = false;

    for (const keyword of brand.keywords) {
      const tokenHit = tokens.some((token) => token === keyword || containsKeyword(token, keyword));
      const compactHit =
        containsKeyword(compactHost, keyword) || containsKeyword(normalizeLookalikes(compactHost), keyword);
      const misspelled = tokens.some((token) => looksLikeMisspelling(token, keyword));

      if (tokenHit || compactHit || misspelled) {
        impersonating = true;
      }

      if (misspelled || (compactHit && !containsKeyword(compactHost, keyword) && !tokenHit)) {
        brandSignals.push(`misspells ${brand.name}`);
      }
    }

    if (!impersonating) continue;

    if (dashCount >= 1) {
      brandSignals.push('dash-stuffing in the hostname');
    }

    const baitHits = tokens.filter((token) => BAIT_TOKENS.has(token) || BAIT_TOKENS.has(normalizeLookalikes(token)));
    if (baitHits.length > 0) {
      brandSignals.push(`extra lure words (${[...new Set(baitHits)].join(', ')})`);
    }

    if (RISKY_TLDS.has(tld)) {
      brandSignals.push(`high-risk TLD (.${tld})`);
    }

    const extraLabels = tokens.filter((token) => !brand.keywords.includes(token) && token !== 'www');
    if (extraLabels.length > 0 && !brandSignals.some((signal) => signal.startsWith('extra lure'))) {
      brandSignals.push('impersonates a trusted brand on an unofficial domain');
    } else if (brandSignals.length === 0) {
      brandSignals.push('impersonates a trusted brand on an unofficial domain');
    }

    if (!bestBrand || brandSignals.length > signals.length) {
      bestBrand = brand.name;
      signals.splice(0, signals.length, ...brandSignals);
    }
  }

  if (!bestBrand || signals.length === 0) return null;
  return { brand: bestBrand, signals: [...new Set(signals)] };
}

function overlap(a: { start: number; end: number }, b: { start: number; end: number }): boolean {
  return a.start < b.end && b.start < a.end;
}

export function inspectTyposquatting(text: string): {
  findings: TyposquatFinding[];
  indicators: DetectedIndicator[];
  matches: ThreatMatch[];
  category: string;
  weight: number;
} {
  const findings: TyposquatFinding[] = [];
  const regex = new RegExp(URL_OR_DOMAIN.source, 'gi');
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    const raw = stripTrailingPunctuation(match[0]);
    if (!raw) {
      if (match[0].length === 0) regex.lastIndex += 1;
      continue;
    }

    const start = match.index;
    const end = start + raw.length;
    const host = parseHost(raw);
    if (!host) continue;

    const inspection = inspectHost(host);
    if (!inspection) continue;

    const finding: TyposquatFinding = {
      url: raw,
      domain: host,
      brand: inspection.brand,
      signals: inspection.signals,
      start,
      end,
    };

    const existing = findings.find((other) => overlap(other, finding));
    if (existing) {
      if (finding.end - finding.start > existing.end - existing.start) {
        findings.splice(findings.indexOf(existing), 1, finding);
      }
      continue;
    }

    findings.push(finding);
  }

  const indicators: DetectedIndicator[] = findings.map((finding) => ({
    type: TYPOSQUAT_TYPE,
    label: TYPOSQUAT_LABEL,
    description: `${finding.domain} impersonates ${finding.brand} (${finding.signals.join('; ')}). Do not visit this site.`,
    severity: 'high',
    match: finding.url,
    badge: TYPOSQUAT_BADGE,
  }));

  const matches: ThreatMatch[] = findings.map((finding) => ({
    start: finding.start,
    end: finding.end,
    label: TYPOSQUAT_LABEL,
    severity: 'high',
    description: `${finding.domain} looks like a fake ${finding.brand} site: ${finding.signals.join('; ')}.`,
    badge: TYPOSQUAT_BADGE,
  }));

  const weight = findings.length === 0 ? 0 : TYPOSQUAT_WEIGHT + Math.min(findings.length - 1, 2) * 6;

  return {
    findings,
    indicators,
    matches,
    category: TYPOSQUAT_CATEGORY,
    weight,
  };
}
