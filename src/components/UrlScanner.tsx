import { useState } from 'react';
import { Link2, Globe, Loader2, ShieldAlert } from 'lucide-react';
import { analyzeText } from '@/lib/detector';
import type { ScanResult } from '@/types';
import RiskMeter from './RiskMeter';

interface UrlScanResult extends ScanResult {
  url: string;
  fullText: string;
  isSuspiciousUrl: boolean;
  isFakeScreenshot: boolean;
  confidence: number;
}

interface UrlScannerProps {
  onScan?: (url: string, result: UrlScanResult) => void;
}

export default function UrlScanner({ onScan }: UrlScannerProps) {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState<UrlScanResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    const trimmed = url.trim();
    if (!trimmed) return;

    setError(null);
    setAnalyzing(true);
    setResult(null);

    try {
      // Pre-validate the URL
      let processedUrl = trimmed;
      if (!/^https?:\/\//i.test(trimmed)) {
        processedUrl = `https://${trimmed}`;
      }

      const urlObj = new URL(processedUrl);
      const fullText = `${urlObj.hostname}${urlObj.pathname}${urlObj.search}${urlObj.hash}`;

      // Analyze the URL content
      const analysis = analyzeText(fullText);

      const isSuspiciousUrl =
        analysis.riskScore >= 65 ||
        (analysis.indicators.some((i) => i.severity === 'high') && analysis.indicators.length >= 2);

      const fakeIndicators = analysis.indicators.filter(
        (i) => i.type === 'fake' || i.type === 'suspicious_link' || i.type === 'impersonal_greeting'
      ).length;

      const isFakeScreenshot =
        analysis.riskScore >= 65 ||
        (analysis.indicators.some((i) => i.severity === 'high') && analysis.indicators.length >= 3) ||
        fakeIndicators >= 2;

      const resultData: UrlScanResult = {
        ...analysis,
        url: processedUrl,
        fullText,
        isSuspiciousUrl,
        isFakeScreenshot,
        confidence: isSuspiciousUrl ? 85 : 45,
      };

      setResult(resultData);
      setAnalyzing(false);

      if (onScan) {
        onScan(processedUrl, resultData);
      }
    } catch {
      setError('Invalid URL. Please enter a valid http(s) URL.');
      setAnalyzing(false);
    }
  };

  const handlePaste = async () => {
    try {
      const clipboard = await navigator.clipboard.readText();
      if (/^https?:\/\//i.test(clipboard)) {
        setUrl(clipboard);
      } else {
        // Try to extract a URL from the clipboard text
        const match = clipboard.match(/https?:\/\/[^\s]+/);
        if (match) {
          setUrl(match[0]);
        }
      }
    } catch {
      // Fallback: let user paste manually
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/70 p-4 backdrop-blur-sm sm:p-5">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="h-5 w-5 text-teal-400" />
          <h3 className="text-sm font-semibold text-white">URL Scanner</h3>
          <span className="ml-auto text-xs text-slate-500">Paste a URL to check</span>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste a URL here (e.g., https://paytm-verify.com/login)"
            className="flex-1 rounded-xl bg-slate-950/80 px-4 py-2.5 text-sm text-white placeholder:text-slate-600 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
            maxLength={2000}
          />
          <button
            onClick={handlePaste}
            className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-sm transition-colors border border-slate-700"
            title="Paste from clipboard"
          >
            <Link2 className="h-4 w-4" />
          </button>
          <button
            onClick={handleAnalyze}
            disabled={!url.trim() || analyzing}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-blue-600 text-sm font-semibold text-white hover:from-teal-400 hover:to-blue-500 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {analyzing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Scanning...
              </>
            ) : (
              'Scan URL'
            )}
          </button>
        </div>

        {error && (
          <p className="mt-2 text-sm text-red-400">{error}</p>
        )}

        {/* Results */}
        {result && !analyzing && (
          <div className="mt-4 rounded-xl border border-slate-800/80 bg-slate-950/40 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold text-white">URL Analysis Result</h4>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  result.riskLevel === 'danger' ? 'bg-red-500/10 text-red-400' :
                  result.riskLevel === 'caution' ? 'bg-amber-500/10 text-amber-400' :
                  'bg-emerald-500/10 text-emerald-400'
                }`}>
                  {result.riskLevel}
                </span>
              </div>
              {result.isSuspiciousUrl && (
                <span className="text-xs text-red-400 font-medium">⚠️ Suspicious</span>
              )}
            </div>

            <RiskMeter score={result.riskScore} level={result.riskLevel} />

            <p className="mt-2 text-sm text-slate-300">{result.summary}</p>

            <div className="mt-3">
              <p className="text-xs font-semibold text-slate-500 mb-2">Detected Indicators:</p>
              <div className="space-y-1.5">
                {result.indicators.slice(0, 5).map((indicator) => (
                  <div key={indicator.type} className="flex items-start gap-2 text-xs text-slate-400">
                    <span className={`mt-1.5 h-1.5 w-1.5 rounded-full ${
                      indicator.severity === 'high' ? 'bg-red-500' :
                      indicator.severity === 'medium' ? 'bg-amber-500' :
                      'bg-emerald-500'
                    }`} />
                    <span>{indicator.label}</span>
                  </div>
                ))}
                {result.indicators.length === 0 && (
                  <p className="text-xs text-slate-500">No specific indicators detected</p>
                )}
              </div>
            </div>

            {result.isSuspiciousUrl && (
              <div className="mt-3 rounded-lg bg-red-500/10 p-3">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-red-400" />
                  <span className="text-sm text-red-400 font-medium">
                    {result.riskScore >= 85 ? 'Likely Phishing' : 'Potential Phishing'}
                  </span>
                </div>
                <p className="text-xs text-red-300 mt-1">
                  This URL contains indicators of a phishing or scam site. Exercise extreme caution before visiting.
                </p>
              </div>
            )}

            <div className="mt-3 text-xs text-slate-500">
              <p><strong>URL:</strong> {result.url}</p>
              <p className="font-mono break-all">{result.fullText}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
