// Detector engine test suite — runs with: npx tsx test/detector.test.ts
//
// The invariant we verify here is the one that matters for a scam detector:
//   1. Every scam text is flagged at least "caution" (score >= 30) -- never "safe".
//   2. Egregious scams with several strong indicators reach "danger" (>= 65).
//   3. Clean, legitimate texts stay "safe" (score < 30).
//   4. Empty input yields a 0-score "safe" result and scores are capped at 100.
//
// Run: npx tsx test/detector.test.ts

import { analyzeText } from '../src/lib/detector';

type ScamCase = {
  kind: 'scam';
  name: string;
  text: string;
  expectLevel: 'danger' | 'caution';
  minScore: number;
};

type SafeCase = {
  kind: 'safe';
  name: string;
  text: string;
  maxScore: number;
};

type Case = ScamCase | SafeCase;

function scam(name: string, text: string, expectLevel: 'danger' | 'caution', minScore: number): ScamCase {
  return { kind: 'scam', name, text, expectLevel, minScore };
}

function safe(name: string, text: string, maxScore: number): SafeCase {
  return { kind: 'safe', name, text, maxScore };
}

const scamCases: ScamCase[] = [
  scam(
    'bank phishing (account lock + OTP + fake domain)',
    'Dear Customer, your HDFC account is locked due to suspicious activity. Verify now at http://hdfc-bank-verify.xyz and confirm your OTP and password.',
    'danger',
    65
  ),
  scam(
    'credential harvest (fake login link)',
    'Click here to verify your account: http://login-verify.top and enter your password, OTP and CVV immediately.',
    'danger',
    65
  ),
  scam(
    'lottery / prize scam (gift card + processing fee)',
    'You have been chosen to win a $5,000 gift card. Send your credit card number plus a $20 processing fee to claim.',
    'danger',
    65
  ),
];

const borderlineScamCases: ScamCase[] = [
  scam(
    'romance / money-transfer scam (mild indicators)',
    'I am a soldier deployed overseas and need help transferring $2,000. Send your bank card and $300 for fees to complete this.',
    'caution',
    30
  ),
  scam(
    'fake job / check-deposit scam',
    'You have been hired. Deposit this check and wire the remaining balance to our Bitcoin wallet at http://google-jobs-offer.online.',
    'danger',
    65
  ),
  scam(
    'urgency / legal threat',
    'Your bank account will be suspended in 2 hours. Legal action and arrest will follow if you fail to verify now.',
    'danger',
    65
  ),
];

const safeCases: SafeCase[] = [
  safe(
    'normal follow-up email',
    'Hi, just following up on the project timeline. Can we meet Thursday to review the design mockups? No action needed until next week.',
    30
  ),
  safe(
    'work thanks message',
    'Thanks for the Q3 update. The notes look solid and I agree with the Thursday review slot.',
    30
  ),
  safe(
    'personal message',
    'Dear Sarah, I hope you are well. The meeting went well yesterday and I look forward to our call.',
    30
  ),
];

const emptyCase: SafeCase = {
  kind: 'safe',
  name: 'empty string',
  text: '',
  maxScore: 30,
};

const cases: Case[] = [...scamCases, ...borderlineScamCases, ...safeCases, emptyCase];
const failures: string[] = [];
let passed = 0;

for (const c of cases) {
  const r = analyzeText(c.text);
  let ok: boolean;

  if (c.kind === 'scam') {
    const levelOK = r.riskLevel === c.expectLevel && r.riskScore >= c.minScore;
    ok = levelOK;
    if (!ok) {
      const reasons: string[] = [];
      if (r.riskLevel !== c.expectLevel) reasons.push(`level: expected ${c.expectLevel}, got ${r.riskLevel}`);
      if (r.riskScore < c.minScore) reasons.push(`score: expected >= ${c.minScore}, got ${r.riskScore}`);
      failures.push(`[${c.name}]\n  ${c.text.slice(0, 60)}...\n  ${reasons.join('; ')}`);
    }
  } else {
    const levelOK = r.riskLevel === 'safe' && r.riskScore < c.maxScore;
    ok = levelOK;
    if (!ok) {
      const reasons: string[] = [];
      if (r.riskLevel !== 'safe') reasons.push(`level: expected safe, got ${r.riskLevel}`);
      if (r.riskScore >= c.maxScore) reasons.push(`score: expected < ${c.maxScore}, got ${r.riskScore}`);
      failures.push(`[${c.name}]\n  ${c.text.slice(0, 60)}...\n  ${reasons.join('; ')}`);
    }
  }

  if (ok) passed++;
  console.log(`[${ok ? 'PASS' : 'FAIL'}] ${c.name.padEnd(38)} => level=${r.riskLevel.padEnd(7)} score=${r.riskScore}`);
}

// Max-length cap check
const long = 'A'.repeat(10000) + 'SCAM';
const longResult = analyzeText(long);
console.log(`[INFO] 10000-char text => score=${longResult.riskScore} (cap <= 100)${longResult.riskScore > 100 ? '  <-- CAP BROKEN' : ''}`);
const capOk = longResult.riskScore <= 100;
if (!capOk) failures.push('[max-length cap] score exceeds 100 on a 10000-char input');

console.log(`\n${passed}/${cases.length} detector cases passed` + (failures.length ? `\n${failures.length} FAILURE(S)` : ''));
if (failures.length) {
  for (const f of failures) console.error('  - ' + f);
  process.exitCode = 1;
} else {
  console.log('All detector tests passed.');
}
