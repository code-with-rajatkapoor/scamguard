import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ShieldCheck,
  ScanLine,
  Loader2,
  Trash,
  Sparkles,
  Mail,
  MessageSquare,
  Phone,
  ChevronDown,
  FileDown,
  ShieldAlert,
  ShieldCheck as ShieldCheckIcon,
  X,
} from 'lucide-react';
import { analyzeText, MAX_INPUT_LENGTH } from './lib/detector';
import { supabase } from './lib/supabase';
import type { ScanResult, ScanRecord, ThreatMatch, IndicatorSeverity } from '@/types';
import RiskMeter from './components/RiskMeter';
import IndicatorList from './components/IndicatorList';
import CategoryBreakdown from './components/CategoryBreakdown';
import HistoryPanel from './components/HistoryPanel';
import JudgesDemoPresets from './components/JudgesDemoPresets';
import type { DemoPreset } from './components/demoPresets';
import QrScanner from './components/QrScanner';

const exampleTexts = [
  {
    icon: Mail,
    label: 'Phishing Email',
    text: 'Dear valued customer, your account will be suspended within 24 hours due to suspicious activity. To avoid termination, please verify your identity immediately by clicking here: http://bit.ly/verify-account. Failure to act now will result in permanent closure. Do not reply to this email.',
  },
  {
    icon: MessageSquare,
    label: 'SMS Scam',
    text: 'CONGRATULATIONS! You have been selected as our winner of a $5,000 gift card! Claim your prize now before it expires tonight. Send your full name, address, and credit card number to claim. Reply STOP to opt out. Call 1-800-555-0199.',
  },
  {
    icon: Phone,
    label: 'Romance Scam',
    text: 'Hello my dear, I am a US soldier deployed overseas in Afghanistan. I found $2.5 million in a cave and need your help to transfer it. I love you and want to spend my life with you. Please send your bank account details and $500 for processing fees. I will repay you double, my darling.',
  },
  {
    icon: Mail,
    label: 'Safe Message',
    text: 'Hi Sarah, just wanted to follow up on our meeting from yesterday. I think the project timeline looks good. Can we schedule a quick call for Thursday morning to go over the details? Let me know what time works best for you. Thanks!',
  },
  {
    icon: Mail,
    label: 'Fake Domain',
    text: 'Dear customer, your Paytm wallet and SBI Yono access will be blocked in 2 hours. Verify now at http://paytm-verify.com/login and https://sbi-login.net/kyc. HDFC users must also update details at hdfc-bank-update.xyz to avoid account freeze.',
  },
];

const severityHighlight: Record<
  IndicatorSeverity,
  { wrap: string; badge: string; badgeLabel: string }
> = {
  high: {
    wrap: 'bg-red-500/15 text-red-100 ring-1 ring-red-400/40 hover:bg-red-500/25',
    badge: 'bg-red-500 text-white',
    badgeLabel: 'High',
  },
  medium: {
    wrap: 'bg-amber-400/15 text-amber-100 ring-1 ring-amber-400/40 hover:bg-amber-400/25',
    badge: 'bg-amber-400 text-slate-950',
    badgeLabel: 'Medium',
  },
  low: {
    wrap: 'bg-yellow-400/12 text-yellow-100 ring-1 ring-yellow-400/30 hover:bg-yellow-400/20',
    badge: 'bg-yellow-400 text-slate-950',
    badgeLabel: 'Low',
  },
};

const maxChars = 5000;

const severityRank: Record<IndicatorSeverity, number> = { low: 1, medium: 2, high: 3 };

function highestSeverity(matches: ThreatMatch[]): IndicatorSeverity {
  return matches.reduce<IndicatorSeverity>((top, match) => {
    return severityRank[match.severity] > severityRank[top] ? match.severity : top;
  }, 'low');
}

interface TextSegment {
  text: string;
  matches: ThreatMatch[];
}

function buildHighlightSegments(text: string, matches: ThreatMatch[]): TextSegment[] {
  if (!text) return [];
  if (matches.length === 0) return [{ text, matches: [] }];

  const bounds = new Set<number>([0, text.length]);
  for (const match of matches) {
    bounds.add(Math.max(0, Math.min(text.length, match.start)));
    bounds.add(Math.max(0, Math.min(text.length, match.end)));
  }

  const points = [...bounds].sort((a, b) => a - b);
  const raw: TextSegment[] = [];

  for (let i = 0; i < points.length - 1; i++) {
    const start = points[i];
    const end = points[i + 1];
    if (start >= end) continue;

    const covering = matches.filter((match) => match.start < end && match.end > start);
    raw.push({ text: text.slice(start, end), matches: covering });
  }

  const merged: TextSegment[] = [];
  for (const segment of raw) {
    const prev = merged[merged.length - 1];
    const sameFlags =
      prev &&
      prev.matches.length === segment.matches.length &&
      prev.matches.every(
        (match, index) =>
          match.start === segment.matches[index].start &&
          match.end === segment.matches[index].end &&
          match.label === segment.matches[index].label
      );

    if (sameFlags && prev) {
      prev.text += segment.text;
      continue;
    }

    const sameLabels =
      prev &&
      prev.matches.length > 0 &&
      segment.matches.length > 0 &&
      new Set(prev.matches.map((match) => match.label)).size ===
        new Set([...prev.matches, ...segment.matches].map((match) => match.label)).size &&
      segment.matches.every((match) => prev.matches.some((other) => other.label === match.label));

    if (sameLabels && prev) {
      prev.text += segment.text;
      for (const match of segment.matches) {
        if (
          !prev.matches.some(
            (other) => other.start === match.start && other.end === match.end && other.label === match.label
          )
        ) {
          prev.matches.push(match);
        }
      }
    } else {
      merged.push({ ...segment, matches: [...segment.matches] });
    }
  }

  return merged;
}

function HighlightedScanText({ text, matches }: { text: string; matches: ThreatMatch[] }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [pinnedIndex, setPinnedIndex] = useState<number | null>(null);
  const segments = useMemo(() => buildHighlightSegments(text, matches), [text, matches]);
  const activeIndex = pinnedIndex ?? hoveredIndex;

  if (matches.length === 0) {
    return (
      <div className="text-sm text-slate-400 leading-relaxed whitespace-pre-wrap break-words">{text}</div>
    );
  }

  return (
    <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap break-words">
      {segments.map((segment, index) => {
        if (segment.matches.length === 0) {
          return <span key={index}>{segment.text}</span>;
        }

        const severity = highestSeverity(segment.matches);
        const styles = severityHighlight[severity];
        const uniqueReasons = segment.matches.filter(
          (match, reasonIndex, all) =>
            all.findIndex((other) => other.label === match.label && other.description === match.description) ===
            reasonIndex
        );
        const explanationBadge =
          uniqueReasons.find((reason) => reason.badge)?.badge ?? styles.badgeLabel;
        const isActive = activeIndex === index;

        return (
          <span
            key={index}
            className="relative inline"
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex((current) => (current === index ? null : current))}
          >
            <button
              type="button"
              aria-expanded={isActive}
              aria-label={`${uniqueReasons.map((reason) => reason.label).join(', ')}: ${segment.text}`}
              className={`inline rounded-sm px-0.5 mx-px cursor-pointer transition-colors duration-150 ${styles.wrap}`}
              onFocus={() => setHoveredIndex(index)}
              onBlur={() => {
                setHoveredIndex((current) => (current === index ? null : current));
                setPinnedIndex((current) => (current === index ? null : current));
              }}
              onClick={() => setPinnedIndex((current) => (current === index ? null : index))}
            >
              {segment.text}
              <span
                className={`ml-1.5 inline-flex items-center rounded-full px-1.5 py-0 text-[9px] font-bold uppercase tracking-wide ${styles.badge}`}
              >
                {explanationBadge}
              </span>
            </button>
            {isActive && (
              <span
                role="tooltip"
                className="absolute left-0 top-full z-30 mt-2 w-72 max-w-[85vw] rounded-xl border border-slate-700/60 bg-slate-900/95 p-3 text-left shadow-2xl shadow-black/40 backdrop-blur-sm"
              >
                <span className="mb-2 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  Why this was flagged
                </span>
                <span className="space-y-2">
                  {uniqueReasons.map((reason) => (
                    <span key={`${reason.label}-${reason.start}`} className="block">
                      <span className="flex flex-wrap items-center gap-2">
                        <span
                          className={`mb-0.5 inline-flex items-center gap-1 rounded-full px-1.5 py-0 text-[9px] font-semibold ${severityHighlight[reason.severity].badge}`}
                        >
                          <ShieldAlert className="w-2.5 h-2.5" />
                          {severityHighlight[reason.severity].badgeLabel}
                        </span>
                        <span className="text-xs font-semibold text-white">{reason.label}</span>
                        {reason.badge && (
                          <span
                            className={`text-[9px] px-1.5 py-0 rounded-full font-semibold uppercase tracking-wide ${severityHighlight[reason.severity].badge}`}
                          >
                            {reason.badge}
                          </span>
                        )}
                      </span>
                      <span className="mt-1 block text-xs text-slate-400 leading-snug">{reason.description}</span>
                    </span>
                  ))}
                </span>
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
}

async function fetchAIAnalysis(rawText: string): Promise<{ status: string; confidence: string; reason: string } | null> {
  const enabled = import.meta.env.VITE_AI_ENABLED !== 'false';
  if (!enabled) return null;

  try {
    const res = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: rawText.slice(0, maxChars) }),
    });

    if (!res.ok) return null;
    const data = await res.json();
    if (data && typeof data.status === 'string' && typeof data.reason === 'string') {
      return { status: data.status, confidence: data.confidence || 'medium', reason: data.reason };
    }
    return null;
  } catch {
    return null;
  }
}

export default function App() {
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState<ScanResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [history, setHistory] = useState<ScanRecord[]>([]);
  const [showExamples, setShowExamples] = useState(false);
  const [savedToHistory, setSavedToHistory] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<{ status: string; confidence: string; reason: string } | null>(null);
  const [activePresetId, setActivePresetId] = useState<string | null>(null);
  const [analyzedAt, setAnalyzedAt] = useState<Date | null>(null);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [exportingCsv, setExportingCsv] = useState(false);
  const analysisKey = useRef(0);

  const fetchHistory = useCallback(async () => {
    const { data, error } = await supabase.from('scans').select('*').order('created_at', { ascending: false }).limit(50);
    if (error) {
      console.error('Failed to load history:', error);
      return;
    }
    setHistory((data || []) as ScanRecord[]);
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const analyzeSource = useCallback(async (rawText: string) => {
    const text = rawText.slice(0, maxChars);
    if (!text.trim() || analyzing) return;
    const key = ++analysisKey.current;
    setAnalyzing(true);
    setResult(null);
    setSavedToHistory(false);
    setSaveError(false);
    setAnalysisProgress(0);

    // Run the fast, deterministic rule-based analysis first so the user sees
    // a result immediately. The background AI verdict runs on top of that.
    const resultData = analyzeText(text);
    setResult(resultData);

    try {
      const { error: dbError } = await supabase.from('scans').insert({
        input_text: text.trim(),
        risk_score: resultData.riskScore,
        risk_level: resultData.riskLevel,
        detected_indicators: resultData.indicators,
        summary: resultData.summary,
      });

      if (dbError) {
        console.error('Failed to save scan to database:', dbError);
        setSaveError(true);
      } else {
        setSavedToHistory(true);
        fetchHistory();
      }
    } catch (error) {
      console.error('Failed to analyze text:', error);
    } finally {
      setAnalyzing(false);
    }

    // Background AI verdict (optional, slow). Animate a progress bar while it
    // runs, and only apply the result if this is still the latest analysis.
    void (async () => {
      const progressInterval = setInterval(() => {
        setAnalysisProgress((prev) => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return Math.min(prev + 12, 100);
        });
      }, 250);

      const ai = await fetchAIAnalysis(text);
      setAnalysisProgress(100);
      if (ai && analysisKey.current === key) {
        setAiAnalysis(ai);
      }
      clearInterval(progressInterval);
    })();
  }, [analyzing, fetchHistory]);

  const handleAnalyze = useCallback(() => {
    void analyzeSource(inputText);
  }, [analyzeSource, inputText]);

  const handleSelectPreset = useCallback(
    (preset: DemoPreset) => {
      const text = preset.text.slice(0, maxChars);
      setInputText(text);
      setActivePresetId(preset.id);
      void analyzeSource(text);
    },
    [analyzeSource]
  );

  const handleShare = () => {
    const shareText = `🛡️ ScamGuard Threat Audit Report\n━━━━━━━━━━━━━━━━━━━\n• Threat Level: ${result?.riskLevel} (${result?.riskScore}% Risk Score)\n• Summary: ${result?.summary}\n━━━━━━━━━━━━━━━━━━━\nAnalyzed via ScamGuard Engine.\n🔗 Check it out: https://scamguard-omega.vercel.app`;

    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleExportPdf = async () => {
    if (!result || exportingPdf) return;
    setExportingPdf(true);
    try {
      const { downloadIncidentReport } = await import('./lib/exportIncidentReport');
      await downloadIncidentReport({
        sourceText: inputText.slice(0, MAX_INPUT_LENGTH).trim(),
        result,
        analyzedAt: analyzedAt ?? new Date(),
      });
    } catch (error) {
      console.error('Failed to export incident report:', error);
    } finally {
      setExportingPdf(false);
    }
  };

  const handleSelectHistory = useCallback((record: ScanRecord) => {
    setInputText(record.input_text);
    setActivePresetId(null);
    const analyzed = analyzeText(record.input_text);
    setResult({
      ...analyzed,
      riskScore: record.risk_score,
      riskLevel: record.risk_level,
      indicators: record.detected_indicators,
      summary: record.summary,
    });
    setAnalyzedAt(record.created_at ? new Date(record.created_at) : new Date());
  }, []);

  const handleDeleteHistory = useCallback(
    async (id: string) => {
      const { error } = await supabase.from('scans').delete().eq('id', id);
      if (!error) {
        setHistory((prev) => prev.filter((r) => r.id !== id));
      }
    },
    []
  );

  const handleClear = useCallback(() => {
    setInputText('');
    setResult(null);
    setSavedToHistory(false);
    setSaveError(false);
    setActivePresetId(null);
    setAnalyzedAt(null);
  }, []);

  const handleExample = useCallback((text: string) => {
    setInputText(text);
    setResult(null);
    setShowExamples(false);
    setActivePresetId(null);
    setAnalyzedAt(null);
  }, []);

  const handleExportCsv = useCallback(async () => {
    if (history.length === 0) return;
    setExportingCsv(true);
    try {
      const headers = ['Timestamp', 'Risk Score', 'Risk Level', 'Indicators', 'Summary'];
      const rows = history.map((h) => [
        h.created_at || '',
        h.risk_score?.toString() || '',
        h.risk_level || '',
        `${h.detected_indicators?.length || 0}`,
        `"${h.summary?.replace(/"/g, '""') || ''}"`,
      ]);
      const csvContent = [headers, ...rows]
        .map((r) => r.join(','))
        .join('\n');
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[^0-9]/g, '');
      link.href = URL.createObjectURL(blob);
      link.download = `scan-history-${timestamp}.csv`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('Failed to export CSV:', error);
    } finally {
      setExportingCsv(false);
    }
  }, [history]);

  const charCount = inputText.length;

  const stats = useMemo(() => {
    const danger = history.filter((h) => h.risk_level === 'danger').length;
    const safe = history.filter((h) => h.risk_level === 'safe').length;
    return { total: history.length, danger, safe };
  }, [history]);

  return (
    <div
      className={`min-h-screen relative overflow-hidden transition-colors duration-300 ${
        theme === 'light' ? 'theme-light' : 'theme-dark'
      }`}
    >
      {/* Background ornaments */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-12%] left-[-8%] w-[700px] h-[700px] bg-teal-500/5 rounded-full blur-[140px] animate-float" />
        <div className="absolute bottom-[-10%] right-[10%] w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[140px] animate-float" style={{ animationDelay: '2.6s' }} />
        <div className="absolute top-[40%] right-[20%] w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[110px] animate-float" style={{ animationDelay: '5.2s' }} />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(to right, #f1f5f9 1px, transparent 1px), linear-gradient(to bottom, #f1f5f9 1px, transparent 1px)',
            backgroundSize: '44px 44px',
          }}
        />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="sticky top-0 z-20 border-b border-slate-800/60 bg-slate-950/60 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-blue-600 shadow-lg shadow-teal-500/20">
                <ShieldCheck className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-base font-bold tracking-tight">ScamGuard</h1>
                <p className="text-xs text-slate-500">AI phishing &amp; scam detector</p>
              </div>
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="hidden items-center gap-2 text-xs text-slate-500 sm:flex">
                <Sparkles className="h-4 w-4 text-teal-400" />
                <span>Pattern-based threat analysis engine</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="theme-toggle"
                  aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  <input
                    type="checkbox"
                    checked={theme === 'dark'}
                    onChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  />
                  <span className="slider" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main */}
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8 lg:py-14">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
            {/* Left: Analysis Area */}
            <div className="space-y-5">
              {/* Hero */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <span className="inline-flex h-2 w-2 rounded-full bg-red-500/80" />
                    <span className="text-[11px] font-semibold uppercase tracking-widest text-red-400">Live</span>
                  </div>
                  <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                    Is it a <span className="text-teal-400">scam</span> or <span className="text-emerald-400">safe</span>?
                  </h2>
                  <p className="mt-2 max-w-xl text-sm text-slate-400 sm:text-base">
                    Paste any suspicious email, text message, or chat below. Our engine scans for phishing patterns,
                    urgency tactics, credential theft, typosquatted brand domains, and dozens of other scam indicators.
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2 rounded-xl bg-slate-900/60 px-3 py-2 text-xs text-slate-400 sm:text-right">
                  <span className="text-slate-600">Paste &amp;</span>
                  <span className="text-white">Run scan</span>
                </div>
              </div>

              {/* Input Card */}
              <div className="rounded-2xl border border-slate-800/80 bg-slate-900/70 p-4 backdrop-blur-sm sm:p-5">
                <JudgesDemoPresets activeId={activePresetId} disabled={analyzing} onSelect={handleSelectPreset} />

                <div className="mb-2.5 flex items-center justify-between">
                  <label className="text-sm font-semibold text-slate-300">Paste the suspicious message</label>
                  <span className={`text-xs tabular-nums ${charCount > maxChars ? 'text-red-400' : 'text-slate-600'}`}>
                    {charCount.toLocaleString()} / {maxChars.toLocaleString()}
                  </span>
                </div>

                <textarea
                  value={inputText}
                  onChange={(e) => {
                    const val = e.target.value.slice(0, maxChars);
                    setInputText(val);
                    setActivePresetId(null);
                    if (result) {
                      setResult(null);
                      setSavedToHistory(false);
                      setAnalyzedAt(null);
                    }
                  }}
                  placeholder="Paste an email, SMS, WhatsApp message, or any text you think might be a scam..."
                  className="mt-2 h-40 w-full resize-y rounded-xl bg-slate-950/80 px-4 py-3 text-sm text-white placeholder:text-slate-600 transition-all focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500/40"
                  maxLength={maxChars}
                />

                {/* Example dropdown */}
                <div className="relative mt-3">
                  <button
                    onClick={() => setShowExamples((v) => !v)}
                    className="flex items-center gap-1.5 text-xs text-slate-500 transition-colors hover:text-teal-400"
                  >
                    Try an example
                    <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showExamples ? 'rotate-180' : ''}`} />
                  </button>
                  {showExamples && (
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {exampleTexts.map((ex) => {
                        const Icon = ex.icon;
                        return (
                          <button
                            key={ex.label}
                            onClick={() => handleExample(ex.text)}
                            className="flex items-center gap-2 rounded-lg border border-slate-700/50 bg-slate-800/40 px-3 py-2.5 text-left transition-all hover:border-teal-500/30 hover:bg-slate-800 group"
                          >
                            <Icon className="h-4 w-4 shrink-0 text-slate-500 group-hover:text-teal-400" />
                            <span className="text-xs text-slate-400 group-hover:text-white">{ex.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Bar */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                  onClick={handleAnalyze}
                  disabled={!inputText.trim() || analyzing}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-teal-500/20 transition-all hover:from-teal-400 hover:to-blue-500 hover:shadow-teal-500/30 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:from-teal-500 disabled:hover:to-blue-600"
                >
                  {analyzing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <ScanLine className="h-4 w-4" />
                      Analyze Text
                    </>
                  )}
                </button>
                {inputText.trim() && (
                  <button
                    onClick={handleClear}
                    className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-400 transition-all hover:bg-slate-800 hover:text-white"
                  >
                    <Trash className="h-4 w-4" />
                    Clear
                  </button>
                )}
              </div>

              {/* Results */}
              {result && !analyzing && (
                <div
                  className="space-y-5 rounded-2xl border border-slate-800/80 bg-slate-900/70 p-5 backdrop-blur-sm sm:p-6"
                  style={{ animation: 'fadeInUp 0.4s ease-out' }}
                >
                  {/* Progress indicator */}
                  {analyzing && analysisProgress > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">AI verdict pending</span>
                        <span className="text-slate-500 font-mono">{analysisProgress}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-teal-400 to-blue-600 transition-all duration-250 ease-out"
                          style={{ width: `${analysisProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                    <RiskMeter score={result.riskScore} level={result.riskLevel} />

                    <div className="flex-1 space-y-4 text-sm leading-relaxed">
                      <p className="text-slate-300">{result.summary}</p>

                      {savedToHistory && (
                        <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
                          <Sparkles className="h-3 w-3 text-teal-400" />
                          Saved to your scan history
                        </p>
                      )}
                      {saveError && (
                        <p className="mt-3 flex items-center gap-1.5 text-xs text-red-400">
                          Could not save to history — your analysis is still shown above.
                        </p>
                      )}

                      {aiAnalysis && (
                        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                              AI verdict
                            </span>
                            <span
                              className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                                aiAnalysis.status === 'SCAM'
                                  ? 'bg-red-500/10 text-red-400'
                                  : 'bg-emerald-500/10 text-emerald-400'
                              }`}
                            >
                              {aiAnalysis.status}
                            </span>
                            <span className="text-xs text-slate-500">{aiAnalysis.confidence} confidence</span>
                          </div>
                          <p className="mt-2 text-slate-300">{aiAnalysis.reason}</p>
                        </div>
                      )}

                      <div className="flex flex-wrap items-center justify-start gap-2 sm:justify-end">
                        <button
                          onClick={handleShare}
                          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-blue-700 active:scale-[0.97]"
                        >
                          {copied ? <><X className="h-3.5 w-3.5" /> Copied</> : <><span className="text-base">📋</span> Share threat report</>}
                        </button>
                        <button
                          onClick={handleExportPdf}
                          disabled={exportingPdf}
                          className="flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-white transition-all hover:border-teal-500/40 hover:bg-slate-800 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {exportingPdf ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Preparing PDF...
                            </>
                          ) : (
                            <>
                              <FileDown className="h-4 w-4 text-teal-400" />
                              Export PDF report
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-800 pt-5">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
                        In-text threat highlights
                      </h4>
                      <div className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                        <span className="flex items-center gap-1">
                          <span className="h-2 w-2 rounded-full bg-red-500" />
                          High
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="h-2 w-2 rounded-full bg-amber-400" />
                          Medium / Low
                        </span>
                      </div>
                    </div>
                    <p className="mb-3 text-xs text-slate-500">
                      Hover or tap a phrase to see why it was flagged. Scoring is unchanged.
                    </p>
                    <div className="overflow-visible rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-3">
                      <HighlightedScanText text={inputText.slice(0, MAX_INPUT_LENGTH).trim()} matches={result.matches ?? []} />
                    </div>
                  </div>

                  {result.breakdown.length > 0 && (
                    <div className="border-t border-slate-800 pt-5">
                      <CategoryBreakdown breakdown={result.breakdown} />
                    </div>
                  )}

                  <div className="border-t border-slate-800 pt-5">
                    <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-300">
                      Detected indicators ({result.indicators.length})
                    </h4>
                    <IndicatorList indicators={result.indicators} />
                  </div>

                  {/* URL / domain scan panel */}
                  {result.indicators.some((i) => i.type === 'typosquatting') && (
                    <div className="border-t border-slate-800 pt-5">
                      <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-300">
                        Links &amp; domains checked
                      </h4>
                      <div className="space-y-3">
                        {result.indicators
                          .filter((i) => i.type === 'typosquatting')
                          .map((indicator) => (
                            <div
                              key={indicator.match}
                              className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-3"
                            >
                              <div className="min-w-0 flex-1">
                                <p className="text-sm text-white">{indicator.description}</p>
                                <p className="mt-1 text-xs font-mono break-all text-slate-500">{indicator.match}</p>
                              </div>
                              <span className="inline-flex shrink-0 items-center rounded-full bg-red-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-red-400">
                                {indicator.badge}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Empty state */}
              {!result && !analyzing && (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800/80 bg-slate-900/40 p-12 text-center">
                  <div className="mb-4 animate-pulse flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800/60">
                    <ScanLine className="h-8 w-8 text-slate-600" />
                  </div>
                  <p className="text-sm text-slate-500">
                    Paste a message above and hit{' '}
                    <span className="font-semibold text-teal-400">Analyze Text</span> to see the results here.
                  </p>
                </div>
              )}
            </div>

            {/* Right: History Sidebar */}
            <aside className="space-y-4">
              <HistoryPanel history={history} onSelect={handleSelectHistory} onDelete={handleDeleteHistory} />

              {/* QR Code Scanner */}
              <QrScanner
                onScan={(content) => {
                  setInputText(content);
                  setActivePresetId(null);
                  if (result) {
                    setResult(null);
                    setSavedToHistory(false);
                    setAnalyzedAt(null);
                  }
                }}
                autoStart={false}
              />

              <div className="rounded-2xl border border-slate-800/80 bg-slate-900/70 p-5 backdrop-blur-sm">
                <h3 className="text-sm font-semibold text-white mb-4">Your scan history</h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">{stats.total}</p>
                    <p className="mt-1 text-xs text-slate-500">Total scans</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-400">{stats.danger}</p>
                    <p className="mt-1 text-xs text-slate-500">Flagged</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-emerald-400">{stats.safe}</p>
                    <p className="mt-1 text-xs text-slate-500">Safe</p>
                  </div>
                </div>
                <button
                  onClick={handleExportCsv}
                  disabled={history.length === 0 || exportingCsv}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 px-4 py-2 text-sm font-medium text-white transition-all hover:border-teal-500/40 hover:bg-slate-800 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {exportingCsv ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Preparing CSV...
                    </>
                  ) : (
                    <>
                      <FileDown className="h-4 w-4 text-teal-400" />
                      Export history as CSV
                    </>
                  )}
                </button>
              </div>

              <div className="rounded-2xl border border-teal-500/20 bg-gradient-to-br from-teal-500/5 to-blue-500/5 p-5">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
                  <ShieldCheckIcon className="h-4 w-4 text-teal-400" />
                  Stay safe tips
                </h3>
                <ul className="space-y-2.5 text-xs text-slate-400">
                  <li className="flex gap-2">
                    <span className="text-teal-400 shrink-0">•</span>
                    Never share passwords, PINs, or codes with anyone.
                  </li>
                  <li className="flex gap-2">
                    <span className="text-teal-400 shrink-0">•</span>
                    Hover over links to check the real destination before clicking.
                  </li>
                  <li className="flex gap-2">
                    <span className="text-teal-400 shrink-0">•</span>
                    Legitimate organizations never ask for gift cards as payment.
                  </li>
                  <li className="flex gap-2">
                    <span className="text-teal-400 shrink-0">•</span>
                    If it creates urgency, slow down and verify independently.
                  </li>
                </ul>
              </div>
            </aside>
          </div>
        </main>

        {/* Footer */}
        <footer className="mt-8 border-t border-slate-800/60">
          <div className="mx-auto max-w-7xl px-4 pb-6 text-center text-xs text-slate-600 sm:px-6 lg:px-8">
            <p>
              ScamGuard provides automated analysis and is not a substitute for professional security advice.
              Always verify suspicious messages through official channels.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
