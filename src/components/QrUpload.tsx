import { useCallback, useRef, useState } from "react";
import { Upload, QrCode, X, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";

interface QrUploadResult {
  text: string;
  format: string;
  decoded: boolean;
}

interface QrUploadProgress {
  status: "idle" | "loading" | "processing" | "complete" | "error";
  message: string;
  progress?: number;
}

/**
 * QR Upload Component
 * Upload a QR code image, decode it, and analyze the content.
 */
export default function QrUpload() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [result, setResult] = useState<QrUploadResult | null>(null);
  const [progress, setProgress] = useState<QrUploadProgress>({
    status: "idle",
    message: "Upload a QR code image to scan",
    progress: 0,
  });
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const qrScannerRef = useRef<Html5Qrcode | null>(null);

  // Decode QR from uploaded image
  const decodeQrImage = useCallback(async (file: File) => {
    setProgress({ status: "processing", message: "Scanning QR code..." });

    try {
      const cam = document.getElementById("qr-upload-camera");
      if (!cam) {
        throw new Error("QR upload container not found");
      }

      qrScannerRef.current = new Html5Qrcode("qr-upload-camera", {
        verbose: false,
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
      });

      const result = await qrScannerRef.current.scanFile(file, false);

      await qrScannerRef.current.stop();

      setResult({
        text: result,
        format: "QR_CODE",
        decoded: true,
      });

      setProgress({ status: "complete", message: "QR code decoded successfully" });

      // Invalidate the cache so it can be re-read
      qrScannerRef.current = null;
    } catch (err) {
      setProgress({ status: "error", message: err instanceof Error ? err.message : "Failed to decode QR code" });
      setResult(null);
    }
  }, []);

  // Handle file upload
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

    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setUploadedImage(reader.result as string);
      setProgress({ status: "processing", message: "Scanning QR code..." });
      decodeQrImage(file);
    };
    reader.onerror = () => {
      setProgress({ status: "error", message: "Failed to read image" });
    };
    reader.readAsDataURL(file);
  }, [decodeQrImage]);

  // Handle drag and drop
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = () => setUploadedImage(reader.result as string);
        reader.readAsDataURL(file);
        setProgress({ status: "processing", message: "Scanning QR code..." });
        decodeQrImage(file);
      } else {
        setProgress({ status: "error", message: "Please drop an image file" });
      }
    }
  }, [decodeQrImage]);

  // Clear uploaded image
  const clearImage = useCallback(() => {
    setUploadedImage(null);
    setResult(null);
    setProgress({ status: "idle", message: "Upload a QR code image to scan" });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (qrScannerRef.current) {
      qrScannerRef.current.stop().catch(() => {});
      qrScannerRef.current = null;
    }
  }, []);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/70 p-4 backdrop-blur-sm sm:p-5">
        <div className="flex items-center gap-2 mb-4">
          <QrCode className="h-5 w-5 text-teal-400" />
          <h3 className="text-sm font-semibold text-white">QR Code Upload</h3>
          <span className="ml-auto text-xs text-slate-500">
            Upload a QR code image
          </span>
        </div>

        {/* Upload area */}
        <div
          className={`rounded-xl border-2 border-dashed transition-all duration-300 ${
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
                alt="QR upload preview"
                className="h-20 w-20 object-cover rounded-lg border border-slate-600"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">{uploadedImage ? "Image loaded" : ""}</p>
                <p className="text-xs text-slate-500 truncate">
                  {result ? `Decoded: ${result.text.slice(0, 50)}${result.text.length > 50 ? '...' : ''}` : "Ready to scan"}
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
                Drag & drop a QR code image here, or <span className="text-teal-400 underline underline-offset-2">browse</span>
              </p>
              <p className="text-xs text-slate-600 mt-1">PNG, JPG, JPEG up to 10MB</p>
              <span className="mt-3 text-xs text-slate-500">Scan QR codes from screenshots, posters, signs, etc.</span>
            </div>
          )}
        </div>

        {/* Status / Progress */}
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
                  <span className="font-mono">{progress.progress ?? 0}%</span>
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
                <CheckCircle className="h-4 w-4" />
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

        {/* QR Decoded Result */}
        {result && (
          <div className="mt-4 rounded-xl border border-slate-800/80 bg-slate-950/40 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <QrCode className="h-4 w-4 text-teal-400" />
                <h4 className="text-sm font-semibold text-white">QR Decoded</h4>
              </div>
              <span className="text-xs text-emerald-400">✓ Success</span>
            </div>

            <div className="rounded-lg bg-slate-950/50 p-3 border border-slate-800">
              <p className="text-sm font-mono text-white break-all">{result.text}</p>
            </div>

            <button
              type="button"
              onClick={() => {
                if (result.text) {
                  // Auto-analyze this content
                  // (Would trigger the main analysis via some mechanism)
                  void 0;
                }
              }}
              className="mt-3 w-full rounded-lg bg-gradient-to-r from-teal-500 to-blue-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:from-teal-400 hover:to-blue-500 active:scale-[0.97]"
            >
              Analyze QR Content
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
