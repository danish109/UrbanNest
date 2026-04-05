import { useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";

const QRScanner = ({ onScanSuccess, onClose }) => {
  const scannerRef = useRef(null);
  const isRunningRef = useRef(false);

  const stopScanner = async () => {
    if (scannerRef.current && isRunningRef.current) {
      try {
        await scannerRef.current.stop();
      } catch {}

      isRunningRef.current = false;

      // 🔥 FORCE STOP CAMERA
      const video = document.querySelector("#qr-reader video");
      if (video && video.srcObject) {
        video.srcObject.getTracks().forEach((track) => track.stop());
        video.srcObject = null;
      }
    }
  };

  useEffect(() => {
    const scanner = new Html5Qrcode("qr-reader");
    scannerRef.current = scanner;

    const startScanner = async () => {
      try {
        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: 250 },
          async (decodedText) => {
            await stopScanner();
            onScanSuccess(decodedText);
          },
          () => {}
        );

        isRunningRef.current = true;
      } catch (err) {
        console.error("Scanner start error:", err);
      }
    };

    startScanner();

    return () => {
      stopScanner(); // ✅ ALWAYS STOP ON UNMOUNT
    };
  }, []);

  return (
    <div>
      <div id="qr-reader" style={{ width: "100%" }} />

      <button
        onClick={async () => {
          await stopScanner(); // ✅ STOP FIRST
          onClose();           // ✅ THEN CLOSE
        }}
        className="mt-3"
      >
        Close
      </button>
    </div>
  );
};

export default QRScanner;