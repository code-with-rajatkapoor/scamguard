import { useState } from "react";
import { FileText, Loader2, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import type { IndicatorSeverity } from "@/types";

export interface BulkAnalysisResult {
  id: string;
  source: string;
  text: string;
  status: string;
  confidence: string;
  reason: string;
  riskScore: number;
  riskLevel: "safe" | "caution" | "danger";
  indicators: { type: string; label: string; description: string; severity: IndicatorSeverity; match?: string; badge?: string }[];
  timestamps: string;
}

interface BulkAnalyzerProps {
  onComplete: (results: BulkAnalysisResult[]) => void;
  placeholder?: string;
}

export default function BulkAnalyzer({ onComplete, placeholder = "Paste multiple messages (one per line). Each line will be analyzed individually." }: BulkAnalyzerProps) {
  const [input, setInput] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<BulkAnalysisResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    const lines = input.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);
    if (lines.length === 0) {
      setError("Please enter at least one message.");
      return;
    }

    setAnalyzing(true);
    setError(null);
    setResults([]);

    try {
      const response = await fetch("http://localhost:3000/api/analyze-bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texts: lines }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Analysis failed");
      }

      const resultsData = data.results as Array<{ status: string; confidence: string; reason: string }>;
      const mappedResults = resultsData.map((r, i) => {
        const status = r.status || "UNKNOWN";
        const riskLevel: "safe" | "caution" | "danger" = status === "SCAM" ? "danger" : status === "SAFE" ? "safe" : "caution";
        return {
          id: `bulk-${i}-${Date.now()}`,
          source: `Line ${i + 1}`,
          text: lines[i],
          status,
          confidence: r.confidence || "low",
          reason: r.reason || "No reason provided",
          riskScore: status === "SCAM" ? 85 : status === "SAFE" ? 5 : 45,
          riskLevel,
          indicators: [],
          timestamps: new Date().toISOString(),
        };
      });

      setResults(mappedResults);
      onComplete(mappedResults);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to analyze bulk texts";
      setError(errorMessage);
      console.error("Bulk analysis error:", err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.ctrlKey) {
      e.preventDefault();
      handleAnalyze();
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "SCAM":
        return <XCircle className="h-4 w-4 text-red-400" />;
      case "SAFE":
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "SCAM":
        return "SCAM";
      case "SAFE":
        return "SAFE";
      default:
        return "UNKNOWN";
    }
  };

  return (
    <div className="glass rounded-2xl p-4 backdrop-blur-sm border border-slate-800/50">
      <div className="mb-3 flex items-center gap-2">
        <FileText className="h-4 w-4 text-indigo-400" />
        <h3 className="text-sm font-semibold text-white">Bulk Analyzer</h3>
      </div>

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="mt-2 w-full min-h-[100px] rounded-lg border border-slate-700 bg-slate-900/60 p-3 text-sm text-slate-200 placeholder-slate-500 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
      />

      <div className="mt-2 flex gap-2">
        <button
          onClick={handleAnalyze}
          disabled={analyzing}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-500/20 px-3 py-1.5 text-xs font-semibold text-indigo-300 hover:bg-indigo-500/30 disabled:opacity-50"
        >
          {analyzing ? (
            <>
              <Loader2 className="h-3 w-3 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <FileText className="h-3 w-3" />
              Analyze All
            </>
          )}
        </button>
        <span className="text-xs text-slate-500">
          {input.split("\n").filter((l) => l.trim().length > 0).length} message{input.split("\n").filter((l) => l.trim().length > 0).length !== 1 ? "s" : ""}
        </span>
      </div>

      {error && (
        <div className="mt-2 flex items-start gap-2 rounded-lg bg-red-500/10 p-2 text-xs text-red-400">
          <AlertTriangle className="h-3 w-3 shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      {results.length > 0 && !analyzing && (
        <div className="mt-2 space-y-2">
          <h4 className="text-xs font-semibold text-slate-400">Results:</h4>
          {results.map((r: BulkAnalysisResult, i: number) => (
            <div
              key={r.id}
              className="flex items-start gap-2 rounded-lg bg-slate-900/40 p-2"
            >
              <div className="shrink-0">
                {getStatusIcon(r.status)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-300">
                    Line {i + 1}:
                  </span>
                  <span
                    className={`text-xs font-bold uppercase ${
                      r.status === "SCAM"
                        ? "text-red-400"
                        : r.status === "SAFE"
                          ? "text-green-400"
                          : "text-yellow-400"
                    }`}
                  >
                    {getStatusLabel(r.status)}
                  </span>
                </div>
                <p className="text-xs text-slate-500 line-clamp-1">{r.text}</p>
                {r.reason && (
                  <p className="text-xs text-slate-600">{r.reason}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
