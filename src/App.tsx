import { useCallback, useEffect, useState } from 'react';
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
} from 'lucide-react';
import { analyzeText } from '@/lib/detector';
import { supabase } from '@/lib/supabase';
import type { ScanResult, ScanRecord, RiskLevel } from '@/types';
import RiskMeter from '@/components/RiskMeter';
import IndicatorList from '@/components/IndicatorList';
import CategoryBreakdown from '@/components/CategoryBreakdown';
import HistoryPanel from '@/components/HistoryPanel';

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
];

export default function App() {
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState<ScanResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [history, setHistory] = useState<ScanRecord[]>([]);
  const [showExamples, setShowExamples] = useState(false);
  const [savedToHistory, setSavedToHistory] = useState(false);
  const [saveError, setSaveError] = useState(false);

  const fetchHistory = useCallback(async () => {
    const { data, error } = await supabase
      .from('scans')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) {
      console.error('Failed to load history:', error);
      return;
    }
    setHistory((data || []) as ScanRecord[]);
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleAnalyze = useCallback(async () => {
    if (!inputText.trim() || analyzing) return;
    setAnalyzing(true);
    setResult(null);
    setSavedToHistory(false);
    setSaveError(false);

    // Simulate brief analysis delay for UX
    await new Promise((r) => setTimeout(r, 500));

    const analysis = analyzeText(inputText);
    setResult(analysis);
    setAnalyzing(false);

    // Save to database
    const { error } = await supabase.from('scans').insert({
      input_text: inputText.trim(),
      risk_score: analysis.riskScore,
      risk_level: analysis.riskLevel,
      detected_indicators: analysis.indicators,
      summary: analysis.summary,
    });

    if (error) {
      setSaveError(true);
    } else {
      setSavedToHistory(true);
      fetchHistory();
    }
  }, [inputText, analyzing, fetchHistory]);

  const handleSelectHistory = useCallback((record: ScanRecord) => {
    setInputText(record.input_text);
    setResult({
      riskScore: record.risk_score,
      riskLevel: record.risk_level,
      indicators: record.detected_indicators,
      summary: record.summary,
      breakdown: [],
    });
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
  }, []);

  const handleExample = useCallback((text: string) => {
    setInputText(text);
    setResult(null);
    setShowExamples(false);
  }, []);

  const charCount = inputText.length;
  const maxChars = 5000;

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
      {/* Background gradient effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px]" />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-slate-800/60 backdrop-blur-sm bg-slate-950/50 sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center shadow-lg shadow-teal-500/20">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight">ScamGuard</h1>
                <p className="text-xs text-slate-500">AI Phishing &amp; Scam Detector</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
              <Sparkles className="w-4 h-4 text-teal-400" />
              <span>Pattern-based threat analysis engine</span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
            {/* Left: Analysis Area */}
            <div className="space-y-6">
              {/* Intro */}
              <div className="text-center lg:text-left">
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                  Is it a <span className="text-teal-400">scam</span> or <span className="text-emerald-400">safe</span>?
                </h2>
                <p className="text-slate-400 mt-2 text-base max-w-xl mx-auto lg:mx-0">
                  Paste any suspicious email, text message, or chat below. Our engine scans for phishing patterns,
                  urgency tactics, credential theft, and dozens of other scam indicators.
                </p>
              </div>

              {/* Input Card */}
              <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-800 rounded-2xl overflow-hidden">
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
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
                      if (result) {
                        setResult(null);
                        setSavedToHistory(false);
                      }
                    }}
                    placeholder="Paste an email, SMS, WhatsApp message, or any text you think might be a scam..."
                    className="w-full h-44 bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 resize-y focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500/40 transition-all"
                    maxLength={maxChars}
                  />

                  {/* Example dropdown */}
                  <div className="relative mt-3">
                    <button
                      onClick={() => setShowExamples((v) => !v)}
                      className="text-xs text-slate-500 hover:text-teal-400 transition-colors flex items-center gap-1.5"
                    >
                      Try an example
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showExamples ? 'rotate-180' : ''}`} />
                    </button>
                    {showExamples && (
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        {exampleTexts.map((ex) => {
                          const Icon = ex.icon;
                          return (
                            <button
                              key={ex.label}
                              onClick={() => handleExample(ex.text)}
                              className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 hover:border-teal-500/30 text-left transition-all group"
                            >
                              <Icon className="w-4 h-4 text-slate-500 group-hover:text-teal-400 shrink-0" />
                              <span className="text-xs text-slate-400 group-hover:text-white">{ex.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Bar */}
                <div className="flex items-center gap-3 px-5 py-4 border-t border-slate-800 bg-slate-950/40">
                  <button
                    onClick={handleAnalyze}
                    disabled={!inputText.trim() || analyzing}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-white font-semibold text-sm shadow-lg shadow-teal-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:shadow-teal-500/30 active:scale-95"
                  >
                    {analyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <ScanLine className="w-4 h-4" />
                        Analyze Text
                      </>
                    )}
                  </button>
                  {inputText && (
                    <button
                      onClick={handleClear}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-sm font-medium transition-all"
                    >
                      <Trash className="w-4 h-4" />
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Results */}
              {result && (
                <div
                  className="bg-slate-900/60 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 space-y-6"
                  style={{ animation: 'fadeInUp 0.4s ease-out' }}
                >
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    <RiskMeter score={result.riskScore} level={result.riskLevel} />
                    <div className="flex-1 text-center sm:text-left">
                      <p className="text-slate-300 text-sm leading-relaxed">{result.summary}</p>
                      {savedToHistory && (
                        <p className="text-xs text-slate-600 mt-3 flex items-center gap-1.5 justify-center sm:justify-start">
                          <Sparkles className="w-3 h-3 text-teal-400" />
                          Saved to your scan history
                        </p>
                      )}
                      {saveError && (
                        <p className="text-xs text-red-400 mt-3 flex items-center gap-1.5 justify-center sm:justify-start">
                          Could not save to history — your analysis is still shown above.
                        </p>
                      )}
                    </div>
                  </div>

                  {result.breakdown.length > 0 && (
                    <div className="border-t border-slate-800 pt-5">
                      <CategoryBreakdown breakdown={result.breakdown} />
                    </div>
                  )}

                  <div className="border-t border-slate-800 pt-5">
                    <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-3">
                      Detected Indicators ({result.indicators.length})
                    </h4>
                    <IndicatorList indicators={result.indicators} />
                  </div>
                </div>
              )}

              {/* Empty state */}
              {!result && !analyzing && (
                <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl p-12 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-slate-800/60 mx-auto flex items-center justify-center mb-4">
                    <ScanLine className="w-8 h-8 text-slate-600" />
                  </div>
                  <p className="text-slate-500 text-sm">
                    Paste a message above and hit <span className="text-teal-400 font-semibold">Analyze Text</span> to see the results here.
                  </p>
                </div>
              )}
            </div>

            {/* Right: History Sidebar */}
            <aside className="space-y-4">
              <HistoryPanel
                history={history}
                onSelect={handleSelectHistory}
                onDelete={handleDeleteHistory}
              />

              {/* Stats card */}
              <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-800 rounded-2xl p-5">
                <h3 className="font-semibold text-white text-sm mb-4">Your Stats</h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">{history.length}</p>
                    <p className="text-xs text-slate-500 mt-1">Total Scans</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-400">
                      {history.filter((h) => h.risk_level === 'danger').length}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">Flagged</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-emerald-400">
                      {history.filter((h) => h.risk_level === 'safe').length}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">Safe</p>
                  </div>
                </div>
              </div>

              {/* Tips card */}
              <div className="bg-gradient-to-br from-teal-500/10 to-blue-500/10 border border-teal-500/20 rounded-2xl p-5">
                <h3 className="font-semibold text-white text-sm mb-3 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-teal-400" />
                  Stay Safe Tips
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
        <footer className="border-t border-slate-800/60 mt-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-xs text-slate-600">
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
