import { useCallback, useRef, useState } from "react";
import { Upload, Image, X, AlertCircle, ShieldCheckIcon, Loader2, ShieldAlert } from "lucide-react";
import { createWorker } from "tesseract.js";
import { analyzeText } from "@/lib/detector";
import RiskMeter from "@/components/RiskMeter";

interface ScreenshotScanResult {
  riskScore: number;
  riskLevel: "safe" | "caution" | "danger";
  indicators: { type: string; label: string; description: string; severity: "low" | "medium" | "high"; match?: string }[];
  summary: string;
  extractedText: string;
  isFakeScreenshot: boolean;
  confidence: number;
}

interface ImageUploadProgress {
  status: "idle" | "loading" | "processing" | "complete" | "error";
  message: string;
  progress?: number;
}

export default function ScreenshotScanner() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [progress, setProgress] = useState<ImageUploadProgress>({
    status: "idle",
    message: "Upload a screenshot to analyze",
  });
  const [result, setResult] = useState<ScreenshotScanResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initWorker = useCallback(async () => {
    const worker = await createWorker("eng");
    return worker;
  }, []);

  const processImage = useCallback(async (file: File) => {
    setProgress({ status: "loading", message: "Preparing OCR engine..." });

    try {
      const worker = await initWorker();

      setProgress({ status: "processing", message: "Extracting text from screenshot..." });

      const { data: { text } } = await worker.recognize(file);

      await worker.terminate();

      if (!text.trim()) {
        throw new Error("No text detected in the image. Please upload a clearer screenshot.");
      }

      const analysis = analyzeText(text);

      const fakeIndicators = analysis.indicators.filter((i) =>
        i.type === "fake" || i.type === "suspicious_link" || i.type === "impersonal_greeting"
      ).length;

      const isFakeScreenshot =
        analysis.riskScore >= 65 ||
        (analysis.indicators.some((i) => i.severity === "high") && analysis.indicators.length >= 3) ||
        fakeIndicators >= 2;

      setProgress({ status: "complete", message: "Analysis complete", progress: 100 });
      setResult({
        riskScore: analysis.riskScore,
        riskLevel: analysis.riskLevel,
        indicators: analysis.indicators,
        summary: analysis.summary,
        extractedText: text,
        isFakeScreenshot,
        confidence: isFakeScreenshot ? 85 : 45,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to process image";
      setProgress({ status: "error", message });
    }
  }, [initWorker]);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.type.startsWith("image/")) {
      setProgress({ status: "error", message: "Please upload an image file (PNG, JPG, JPEG)" });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setProgress({ status: "error", message: "Image too large (max 10MB)" });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setUploadedImage(reader.result as string);
      setProgress({ status: "processing", message: "Processing screenshot..." });
      processImage(file);
    };
    reader.onerror = () => {
      setProgress({ status: "error", message: "Failed to read image" });
    };
    reader.readAsDataURL(file);
  }, [processImage]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = () => setUploadedImage(reader.result as string);
        reader.readAsDataURL(file);
        setProgress({ status: "processing", message: "Processing screenshot..." });
        processImage(file);
      } else {
        setProgress({ status: "error", message: "Please drop an image file" });
      }
    }
  }, [processImage]);

  const clearImage = useCallback(() => {
    setUploadedImage(null);
    setResult(null);
    setProgress({ status: "idle", message: "Upload a screenshot to analyze" });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/70 p-4 backdrop-blur-sm sm:p-5 card-hover">
        <div className="flex items-center gap-2 mb-4">
          <Image className="h-5 w-5 text-teal-400" />
          <h3 className="text-sm font-semibold text-white">Screenshot Scanner</h3>
          <span className="ml-auto text-xs text-slate-500">Upload a screenshot of a suspicious message</span>
        </div>

        <div
          className={`rounded-xl border-2 border-dashed upload-zone transition-all duration-300 ${
            isDragging
              ? "border-teal-500 bg-teal-500/5"
              : "border-slate-700/50 bg-slate-800/30 hover:border-slate-600"
          }`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />

          {uploadedImage ? (
            <div className="flex items-center gap-4 p-4">
              <img
                src={uploadedImage}
                alt="Upload preview"
                className="h-20 w-20 object-cover rounded-lg border border-slate-600"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">{uploadedImage ? "Image loaded" : ""}</p>
                <p className="text-xs text-slate-500 truncate">
                  {result ? `Analysis: ${result.riskScore}/100` : "Ready to analyze"}
                </p>
              </div>
              <button
                type="button"
                onClick={clearImage}
                className="p-1 rounded hover:bg-slate-700 transition-colors"
                aria-label="Remove image"
              >
                <X className="h-4 w-4 text-slate-400" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 px-4">
              <div className="mb-3 rounded-full bg-slate-800/60 p-3">
                <Upload className="h-6 w-6 text-slate-400" />
              </div>
              <p className="text-sm text-slate-400">
                Drag & drop a screenshot here, or <span className="text-teal-400 underline underline-offset-2">browse</span>
              </p>
              <p className="text-xs text-slate-600 mt-1">PNG, JPG, JPEG up to 10MB</p>
              <span className="mt-3 text-xs text-slate-500">Supported: screenshots of phishing messages, SMS, emails</span>
            </div>
          )}
        </div>

        {progress.status !== "idle" && (
          <div className="mt-3 space-y-2">
            {progress.status === "loading" && (
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                {progress.message}
              </div>
            )}
            {progress.status === "processing" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{progress.message}</span>
                  <span className="font-mono">{progress.progress?.toFixed(0) ?? 0}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-teal-400 to-blue-500 transition-all duration-200"
                    style={{ width: `${progress.progress ?? 0}%` }}
                  />
                </div>
              </div>
            )}
            {progress.status === "complete" && (
              <div className="flex items-center gap-2 text-sm text-emerald-400">
                <ShieldCheckIcon className="h-4 w-4" />
                {progress.message}
              </div>
            )}
            {progress.status === "error" && (
              <div className="flex items-center gap-2 text-sm text-red-400">
                <AlertCircle className="h-4 w-4" />
                {progress.message}
              </div>
            )}
          </div>
        )}

        {result && (
          <div className="mt-4 rounded-xl border border-slate-800/80 bg-slate-950/40 p-4 card-hover">
            <div className="flex items-center gap-2 mb-3">
              <h4 className="text-sm font-semibold text-white">Scam Analysis Result</h4>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                result.riskLevel === 'danger' ? 'bg-red-500/10 text-red-400' :
                result.riskLevel === 'caution' ? 'bg-amber-500/10 text-amber-400' :
                'bg-emerald-500/10 text-emerald-400'
              }`}>
                {result.riskLevel}
              </span>
            </div>

            <RiskMeter score={result.riskScore} level={result.riskLevel} />

            <p className="mt-2 text-sm text-slate-300">{result.summary}</p>

            <div className="mt-3">
              <p className="text-xs font-semibold text-slate-500 mb-2">Detected Indicators:</p>
              <div className="space-y-2">
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
              </div>
            </div>

            {result.isFakeScreenshot && (
              <div className="mt-3 rounded-lg bg-red-500/10 p-3">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-red-400" />
                  <span className="text-sm text-red-400 font-medium">
                    {result.riskScore >= 85 ? "Likely Fake Screenshot" : "Fake Screenshot Detected"}
                  </span>
                </div>
                <p className="text-xs text-red-300 mt-1">
                  This screenshot shows {result.riskScore >= 85 ? "high" : "medium"} scam indicators. Be very cautious before trusting it.
                </p>
              </div>
            )}

            {result.extractedText && (
              <details className="mt-3">
                <summary className="text-xs text-slate-500 cursor-pointer">Show extracted text ({result.extractedText.length} chars)</summary>
                <pre className="mt-2 text-xs text-slate-500 max-h-32 overflow-auto rounded border border-slate-800 bg-slate-950/50 p-3">
                  {result.extractedText.slice(0, 500)}
                  {result.extractedText.length > 500 && "..."}
                </pre>
              </details>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
