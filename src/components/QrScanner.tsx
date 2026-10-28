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

/**
 * QR Code Scanner component
 * Uses html5-qrcode to scan QR codes via the device camera.
 * Scans are NOT stored in history — they are sent directly to the analyzer.
 */
export default function QrScanner({
  onScan,
  autoStart = true,
  showRestartButton = true,
  className = "",
}: QrScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cameraFacing, setCameraFacing] = useState<"user" | "environment">("user");

  const qrCodeScannerRef = useRef<Html5Qrcode | null>(null);

  // Initialize the QR scanner
  const initializeScanner = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });

      // Find the camera container element
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
        videoConstraints: { facingMode: cameraFacing },
        disableFlip: false,
      };

      await qrCodeScannerRef.current.start(
        stream,
        config,
        (decodedText) => {
          // Call the onScan callback with the scanned content
          if (onScan && decodedText) {
            onScan(decodedText);
          }
        },
        (errorMessage) => {
          // Ignore scanning errors for now
          console.warn("QR scan error:", errorMessage);
        }
      );

      setIsScanning(true);
      stream.getTracks().forEach((track) => {
        if (track.kind === "video") {
          track.onended = () => {
            setError("Camera stream ended unexpectedly. Please restart the scanner.");
            setIsScanning(false);
            setIsLoading(false);
          };
        }
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to start QR scanner";
      setError(message);
      setIsScanning(false);
    } finally {
      setIsLoading(false);
    }
  }, [onScan, cameraFacing]);

  // Start scanning
  const startScanning = useCallback(() => {
    initializeScanner();
  }, [initializeScanner]);

  // Stop scanning
  const stopScanning = useCallback(() => {
    if (qrCodeScannerRef.current) {
      qrCodeScannerRef.current.stop().catch(() => {});
      setIsScanning(false);
    }
  }, []);

  // Restart scanning
  const restartScanning = useCallback(() => {
    stopScanning();
    setTimeout(() => {
      initializeScanner();
    }, 500);
  }, [stopScanning, initializeScanner]);

  // Toggle camera facing
  const toggleCamera = useCallback(() => {
    setCameraFacing((prev) => (prev === "user" ? "environment" : "user"));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    // If autoStart is true, start scanning after a short delay
    if (autoStart) {
      const timer = setTimeout(() => startScanning(), 300);
      return () => clearTimeout(timer);
    }
  }, [autoStart, startScanning]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (qrCodeScannerRef.current) {
        qrCodeScannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  return (
    <div className={`qr-scanner-wrapper ${className}`}>
      <div className="qr-scanner-header">
        <div className="qr-scanner-title">
          <Camera size={20} className="mr-2" />
          {isScanning ? "Scanning" : "Scan QR"}
        </div>
        <div className="qr-scanner-actions">
          <button
            type="button"
            onClick={toggleCamera}
            className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title="Toggle camera (front/back)"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      <div
        id="qr-camera"
        className="qr-scanner-view"
        style={{ minHeight: "200px" }}
      >
        {isLoading && <div className="qr-scanner-loading">Initializing camera...</div>}
        {!isLoading && !isScanning && error && (
          <div className="qr-scanner-error">
            <p>{error}</p>
            <button
              type="button"
              onClick={restartScanning}
              className="mt-2 px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Retry
            </button>
          </div>
        )}
        {!isLoading && !isScanning && !error && (
          <div className="qr-scanner-idle">
            <ScanLine size={32} />
            <p>Point your camera at a QR code</p>
          </div>
        )}
      </div>

      <div className="qr-scanner-footer">
        {showRestartButton && !isLoading && (
          <button
            type="button"
            onClick={isScanning ? stopScanning : startScanning}
            className={`qr-scanner-toggle-btn ${
              isScanning
                ? "bg-red-500 hover:bg-red-600 text-white"
                : "bg-green-500 hover:bg-green-600 text-white"
            } rounded-lg px-4 py-2 transition-colors`}
            disabled={isLoading}
          >
            {isScanning ? "Stop" : "Start Scanning"}
          </button>
        )}
      </div>
    </div>
  );
}

export { QrScanner };
