import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, RefreshCw, ScanLine } from "lucide-react";
import {
  Html5Qrcode,
  Html5QrcodeSupportedFormats,
  Html5QrcodeCameraScanConfig,
} from "html5-qrcode";

interface QrScannerProps {
  onScan?: (content: string) => void;
  autoStart?: boolean;
  showRestartButton?: boolean;
  className?: string;
}

export default function QrScanner({
  onScan,
  autoStart = true,
  showRestartButton = true,
  className = "",
}: QrScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const qrCodeScannerRef = useRef<Html5Qrcode | null>(null);

  const initializeScanner = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const cam = document.getElementById("qr-camera");
      if (!cam) {
        throw new Error("Camera container not found. Make sure the component is mounted correctly.");
      }

      qrCodeScannerRef.current = new Html5Qrcode("qr-camera", {
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        verbose: false,
      });

      const config: Html5QrcodeCameraScanConfig = {
        fps: 10,
        aspectRatio: 16 / 9,
        videoConstraints: { facingMode: "user" },
        disableFlip: false,
      };

      await qrCodeScannerRef.current.start(
        { facingMode: "user" },
        config,
        (decodedText) => {
          if (onScan && decodedText) {
            onScan(decodedText);
          }
        },
        (errorMessage) => {
          console.warn("QR scan error:", errorMessage);
        }
      );

      setIsScanning(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to start QR scanner";
      setError(message);
      setIsScanning(false);
    } finally {
      setIsLoading(false);
    }
  }, [onScan]);

  const startScanning = useCallback(() => {
    initializeScanner();
  }, [initializeScanner]);

  const stopScanning = useCallback(() => {
    if (qrCodeScannerRef.current) {
      qrCodeScannerRef.current.stop().catch(() => {});
      setIsScanning(false);
    }
  }, []);

  const restartScanning = useCallback(() => {
    stopScanning();
    setTimeout(() => {
      initializeScanner();
    }, 500);
  }, [stopScanning, initializeScanner]);

  useEffect(() => {
    if (autoStart) {
      const timer = setTimeout(() => startScanning(), 300);
      return () => clearTimeout(timer);
    }
  }, [autoStart, startScanning]);

  useEffect(() => {
    return () => {
      if (qrCodeScannerRef.current) {
        qrCodeScannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/70 p-4 backdrop-blur-sm sm:p-5 card-hover">
        <div className="flex items-center gap-2 mb-4">
          <Camera className="h-5 w-5 text-teal-400" />
          <h3 className="text-sm font-semibold text-white">Camera QR Scanner</h3>
          <span className="ml-auto text-xs text-slate-500">Scan via camera</span>
        </div>

        <div className="relative rounded-xl overflow-hidden bg-slate-950/50 border border-slate-800/80">
          <div
            id="qr-camera"
            className="qr-scanner-view w-full"
            style={{ minHeight: "200px" }}
          >
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-950/30 z-10">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Initializing camera...
                </div>
              </div>
            )}
            {!isLoading && !isScanning && error && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/40 z-10 rounded-xl">
                <p className="text-sm text-red-400 text-center px-4">{error}</p>
                <button
                  type="button"
                  onClick={restartScanning}
                  className="mt-3 px-4 py-2 text-sm bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                >
                  Retry
                </button>
              </div>
            )}
            {!isLoading && !isScanning && !error && (
              <div className="qr-scanner-idle absolute inset-0 flex flex-col items-center justify-center bg-slate-950/30 z-10 rounded-xl">
                <ScanLine className="h-12 w-12 text-slate-600" />
                <p className="mt-3 text-sm text-slate-400">
                  Point your camera at a QR code
                </p>
                <p className="text-xs text-slate-600 mt-1">
                  The scanner will automatically detect and read QR codes
                </p>
              </div>
            )}
            {isScanning && (
              <div className="scan-line-overlay absolute inset-0" />
            )}
          </div>

          <div className="qr-scanner-footer flex justify-end">
            {showRestartButton && !isLoading && (
              <button
                type="button"
                onClick={isScanning ? stopScanning : startScanning}
                className={`qr-scanner-toggle-btn rounded-lg px-4 py-2 text-sm font-semibold transition-all active:scale-[0.97] shadow-lg ${
                  isScanning
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : "bg-green-500 hover:bg-green-600 text-white"
                }`}
                disabled={isLoading}
              >
                {isScanning ? "Stop" : "Start Scanning"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export { QrScanner };
