import { jsPDF } from 'jspdf';
import type { DetectedIndicator, RiskLevel, ScanResult, TyposquatFinding } from '@/types';
import { inspectTyposquatting } from './typosquat';

const PAGE = { width: 210, height: 297, margin: 16 };
const CONTENT_WIDTH = PAGE.width - PAGE.margin * 2;

const COLORS = {
  slate950: [15, 23, 42] as const,
  slate800: [30, 41, 59] as const,
  slate600: [71, 85, 105] as const,
  slate500: [100, 116, 139] as const,
  slate200: [226, 232, 240] as const,
  white: [255, 255, 255] as const,
  teal: [13, 148, 136] as const,
  tealSoft: [204, 251, 241] as const,
  danger: [220, 38, 38] as const,
  dangerSoft: [254, 226, 226] as const,
  caution: [217, 119, 6] as const,
  cautionSoft: [254, 243, 199] as const,
  safe: [5, 150, 105] as const,
  safeSoft: [209, 250, 229] as const,
};

const RISK_BADGE: Record<
  RiskLevel,
  { label: string; fill: readonly [number, number, number]; text: readonly [number, number, number] }
> = {
  danger: { label: 'HIGH RISK', fill: COLORS.danger, text: COLORS.white },
  caution: { label: 'CAUTION', fill: COLORS.caution, text: COLORS.white },
  safe: { label: 'SAFE', fill: COLORS.safe, text: COLORS.white },
};

export interface IncidentReportInput {
  sourceText: string;
  result: ScanResult;
  analyzedAt: Date;
}

interface Cursor {
  y: number;
}

function rgb(doc: jsPDF, color: readonly [number, number, number]) {
  doc.setTextColor(color[0], color[1], color[2]);
}

function fill(doc: jsPDF, color: readonly [number, number, number]) {
  doc.setFillColor(color[0], color[1], color[2]);
}

function stroke(doc: jsPDF, color: readonly [number, number, number]) {
  doc.setDrawColor(color[0], color[1], color[2]);
}

function formatTimestamp(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'full',
    timeStyle: 'medium',
  }).format(date);
}

function fileStamp(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-${pad(date.getHours())}${pad(date.getMinutes())}`;
}

function ensureSpace(doc: jsPDF, cursor: Cursor, needed: number) {
  if (cursor.y + needed <= PAGE.height - 22) return;
  doc.addPage();
  drawContinuationHeader(doc);
  cursor.y = 20;
}

function drawContinuationHeader(doc: jsPDF) {
  fill(doc, COLORS.slate950);
  doc.rect(0, 0, PAGE.width, 10, 'F');
  fill(doc, COLORS.teal);
  doc.rect(0, 10, PAGE.width, 1.1, 'F');
  rgb(doc, COLORS.white);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('ScamGuard Incident Report', PAGE.margin, 6.6);
  doc.setFont('helvetica', 'normal');
  rgb(doc, [148, 163, 184]);
  doc.text('Continued', PAGE.width - PAGE.margin, 6.6, { align: 'right' });
}

function sectionTitle(doc: jsPDF, cursor: Cursor, title: string) {
  ensureSpace(doc, cursor, 14);
  fill(doc, COLORS.teal);
  doc.rect(PAGE.margin, cursor.y + 1, 2.2, 6, 'F');
  rgb(doc, COLORS.slate950);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(title, PAGE.margin + 6, cursor.y + 6);
  cursor.y += 12;
}

function wrapped(doc: jsPDF, text: string, x: number, y: number, width: number, lineHeight = 4.6): number {
  const lines = doc.splitTextToSize(text, width) as string[];
  doc.text(lines, x, y);
  return lines.length * lineHeight;
}

function uniqueIndicators(indicators: DetectedIndicator[]): DetectedIndicator[] {
  const seen = new Set<string>();
  return indicators.filter((indicator) => {
    const key = `${indicator.type}|${indicator.label}|${indicator.match ?? ''}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function buildRecommendations(result: ScanResult, findings: TyposquatFinding[]): string[] {
  const types = new Set(result.indicators.map((indicator) => indicator.type));
  const recs: string[] = [];

  if (result.riskLevel === 'danger') {
    recs.push('Do not click links, send money, or share passwords, OTPs, or card details from this message.');
    recs.push('Treat this as a likely scam. Block the sender and report it in your email or messaging app.');
  } else if (result.riskLevel === 'caution') {
    recs.push('Pause before acting. Verify the sender through an official website or app you already trust — not via this message.');
  } else {
    recs.push('No strong scam patterns were found, but stay cautious with unexpected requests for money or login details.');
  }

  if (findings.length > 0 || types.has('typosquatting')) {
    recs.push('Do not visit the listed domains. Open the real brand site by typing the official address yourself.');
  }
  if (types.has('credential_harvest') || types.has('personal_info')) {
    recs.push('Never share passwords, PINs, OTPs, or ID documents in reply to an unsolicited message.');
  }
  if (types.has('money_request') || types.has('investment_scam') || types.has('too_good')) {
    recs.push('Do not send money, gift cards, or cryptocurrency. Legitimate organizations will not demand this over email or SMS.');
  }
  if (types.has('urgency') || types.has('threat')) {
    recs.push('Urgency and threats are pressure tactics. Slow down and confirm independently before any deadline.');
  }
  if (types.has('suspicious_link')) {
    recs.push('Avoid shortened or unexpected links. Hover to inspect the real destination, or search the service name instead of clicking.');
  }
  if (types.has('romance_scam')) {
    recs.push('Do not continue a financial or personal-information conversation with someone you have not met through trusted channels.');
  }

  recs.push('If you already clicked a link or shared details, change passwords from the official app, enable MFA, and contact your bank if money or cards were involved.');
  recs.push('This report is automated analysis, not legal or professional security advice. When in doubt, verify through official channels.');

  return [...new Set(recs)];
}

function drawHeader(doc: jsPDF, cursor: Cursor, analyzedAt: Date) {
  fill(doc, COLORS.slate950);
  doc.rect(0, 0, PAGE.width, 42, 'F');
  fill(doc, COLORS.teal);
  doc.rect(0, 42, PAGE.width, 1.6, 'F');

  fill(doc, COLORS.teal);
  doc.roundedRect(PAGE.margin, 12, 10, 10, 2, 2, 'F');
  rgb(doc, COLORS.white);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('SG', PAGE.margin + 5, 18.8, { align: 'center' });

  rgb(doc, COLORS.white);
  doc.setFontSize(18);
  doc.text('ScamGuard', PAGE.margin + 14, 17);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  rgb(doc, [148, 163, 184]);
  doc.text('AI Phishing & Scam Detector', PAGE.margin + 14, 23);

  rgb(doc, COLORS.tealSoft);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('INCIDENT REPORT', PAGE.width - PAGE.margin, 17, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  rgb(doc, [148, 163, 184]);
  doc.text('Post-analysis export', PAGE.width - PAGE.margin, 22.5, { align: 'right' });

  cursor.y = 52;
  rgb(doc, COLORS.slate600);
  doc.setFontSize(9);
  doc.text(`Analysis timestamp: ${formatTimestamp(analyzedAt)}`, PAGE.margin, cursor.y);
  cursor.y += 8;
}

function drawRiskBanner(doc: jsPDF, cursor: Cursor, result: ScanResult) {
  ensureSpace(doc, cursor, 28);
  const badge = RISK_BADGE[result.riskLevel];
  fill(doc, badge.fill);
  doc.roundedRect(PAGE.margin, cursor.y, CONTENT_WIDTH, 24, 2.5, 2.5, 'F');

  rgb(doc, COLORS.white);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('OVERALL RISK LEVEL', PAGE.margin + 6, cursor.y + 8);
  doc.setFontSize(16);
  doc.text(badge.label, PAGE.margin + 6, cursor.y + 17);

  doc.setFontSize(8);
  doc.text('RISK SCORE', PAGE.width - PAGE.margin - 8, cursor.y + 8, { align: 'right' });
  doc.setFontSize(16);
  doc.text(`${result.riskScore}%`, PAGE.width - PAGE.margin - 8, cursor.y + 17, { align: 'right' });

  cursor.y += 30;
  rgb(doc, COLORS.slate800);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const used = wrapped(doc, result.summary, PAGE.margin, cursor.y, CONTENT_WIDTH, 5);
  cursor.y += used + 4;
}

function drawIndicators(doc: jsPDF, cursor: Cursor, indicators: DetectedIndicator[]) {
  sectionTitle(doc, cursor, 'Detected Indicators');

  if (indicators.length === 0) {
    rgb(doc, COLORS.slate600);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('No significant phishing or scam indicators were detected.', PAGE.margin, cursor.y);
    cursor.y += 10;
    return;
  }

  const severityRank: Record<DetectedIndicator['severity'], number> = { high: 0, medium: 1, low: 2 };
  const sorted = [...indicators].sort((a, b) => severityRank[a.severity] - severityRank[b.severity]);

  for (const indicator of sorted) {
    const matchLine = indicator.match ? `Match: “${indicator.match}”` : '';
    const body = `${indicator.description}${matchLine ? `\n${matchLine}` : ''}`;
    const lines = doc.splitTextToSize(body, CONTENT_WIDTH - 8) as string[];
    const blockHeight = 12 + lines.length * 4.2;
    ensureSpace(doc, cursor, blockHeight + 3);

    const sevColor =
      indicator.severity === 'high' ? COLORS.danger : indicator.severity === 'medium' ? COLORS.caution : COLORS.teal;
    const sevBg =
      indicator.severity === 'high'
        ? COLORS.dangerSoft
        : indicator.severity === 'medium'
          ? COLORS.cautionSoft
          : COLORS.tealSoft;

    stroke(doc, COLORS.slate200);
    doc.setLineWidth(0.3);
    doc.roundedRect(PAGE.margin, cursor.y, CONTENT_WIDTH, blockHeight, 1.5, 1.5, 'S');

    fill(doc, sevColor);
    doc.rect(PAGE.margin, cursor.y, 1.6, blockHeight, 'F');

    rgb(doc, COLORS.slate950);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(indicator.label, PAGE.margin + 6, cursor.y + 6);

    const sevLabel = indicator.severity.toUpperCase();
    const badgeW = doc.getTextWidth(sevLabel) + 6;
    fill(doc, sevBg);
    doc.roundedRect(PAGE.width - PAGE.margin - badgeW - 4, cursor.y + 2.2, badgeW, 5.4, 1.2, 1.2, 'F');
    rgb(doc, sevColor);
    doc.setFontSize(7.5);
    doc.text(sevLabel, PAGE.width - PAGE.margin - 7, cursor.y + 6, { align: 'right' });

    rgb(doc, COLORS.slate600);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(lines, PAGE.margin + 6, cursor.y + 11);
    cursor.y += blockHeight + 3;
  }
}

function drawDomainInspection(doc: jsPDF, cursor: Cursor, findings: TyposquatFinding[]) {
  sectionTitle(doc, cursor, 'Extracted Domain Inspection');

  if (findings.length === 0) {
    rgb(doc, COLORS.slate600);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const used = wrapped(
      doc,
      'No typosquatted or brand-impersonating domains were extracted from this message.',
      PAGE.margin,
      cursor.y,
      CONTENT_WIDTH
    );
    cursor.y += used + 6;
    return;
  }

  for (const finding of findings) {
    const signals = finding.signals.join('; ');
    const lines = doc.splitTextToSize(
      `Impersonates ${finding.brand}. Signals: ${signals}. Do not visit this site.`,
      CONTENT_WIDTH - 8
    ) as string[];
    const blockHeight = 16 + lines.length * 4.2;
    ensureSpace(doc, cursor, blockHeight + 3);

    fill(doc, COLORS.dangerSoft);
    doc.roundedRect(PAGE.margin, cursor.y, CONTENT_WIDTH, blockHeight, 1.5, 1.5, 'F');
    fill(doc, COLORS.danger);
    doc.rect(PAGE.margin, cursor.y, 1.6, blockHeight, 'F');

    rgb(doc, COLORS.danger);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('FAKE DOMAIN', PAGE.margin + 6, cursor.y + 5.5);

    rgb(doc, COLORS.slate950);
    doc.setFontSize(10);
    doc.text(finding.domain, PAGE.margin + 6, cursor.y + 11);

    rgb(doc, COLORS.slate600);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(lines, PAGE.margin + 6, cursor.y + 16);
    cursor.y += blockHeight + 3;
  }
}

function drawRecommendations(doc: jsPDF, cursor: Cursor, recs: string[]) {
  sectionTitle(doc, cursor, 'Actionable Safety Recommendations');

  recs.forEach((rec, index) => {
    const lines = doc.splitTextToSize(rec, CONTENT_WIDTH - 10) as string[];
    const h = Math.max(8, lines.length * 4.4 + 3);
    ensureSpace(doc, cursor, h + 2);

    fill(doc, COLORS.teal);
    doc.circle(PAGE.margin + 3, cursor.y + 2.4, 2.1, 'F');
    rgb(doc, COLORS.white);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.text(String(index + 1), PAGE.margin + 3, cursor.y + 3.3, { align: 'center' });

    rgb(doc, COLORS.slate800);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.text(lines, PAGE.margin + 9, cursor.y + 3.2);
    cursor.y += h;
  });
}

export function downloadIncidentReport({ sourceText, result, analyzedAt }: IncidentReportInput): void {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const cursor: Cursor = { y: 0 };
  const findings = inspectTyposquatting(sourceText).findings;
  const indicators = uniqueIndicators(result.indicators);
  const recs = buildRecommendations(result, findings);

  drawHeader(doc, cursor, analyzedAt);
  drawRiskBanner(doc, cursor, result);
  drawIndicators(doc, cursor, indicators);
  drawDomainInspection(doc, cursor, findings);
  drawRecommendations(doc, cursor, recs);

  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    rgb(doc, COLORS.slate500);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    const footerY = PAGE.height - 10;
    doc.text('ScamGuard Incident Report  ·  Automated analysis, not a substitute for official advice', PAGE.margin, footerY);
    doc.text(`${i} / ${pageCount}`, PAGE.width - PAGE.margin, footerY, { align: 'right' });
  }

  doc.save(`ScamGuard-Incident-Report-${fileStamp(analyzedAt)}.pdf`);
}
