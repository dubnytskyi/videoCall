import { useEffect, useRef, useState } from "react";

export default function CameraTest() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<string>("Testing camera...");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testCamera = async () => {
      try {
        setStatus("Requesting camera access...");
        
        // Request camera access
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          setStatus("✅ Camera working!");
        }
        
      } catch (err: any) {
        console.error("Camera error:", err);
        setError(`❌ Camera error: ${err.message}`);
        
        if (err.name === "NotAllowedError") {
          setError("❌ Camera access denied. Please allow camera access in browser settings.");
        } else if (err.name === "NotFoundError") {
          setError("❌ No camera found. Please connect a camera.");
        } else if (err.name === "NotReadableError") {
          setError("❌ Camera is being used by another application. Please close other apps.");
        } else {
          setError(`❌ Camera error: ${err.message}`);
        }
      }
    };

    testCamera();
  }, []);

  return (
    <div className="p-4 bg-white rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold mb-4">Camera Test</h3>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">Status: {status}</p>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm">
            {error}
          </div>
        )}
      </div>
      
      <div className="relative">
        <video
          ref={videoRef}
          className="w-full h-48 bg-black rounded"
          playsInline
          muted
        />
        {!error && status.includes("✅") && (
          <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs">
            Camera OK
          </div>
        )}
      </div>
      
      <div className="mt-4 text-xs text-gray-500">
        <p><strong>Browser:</strong> {navigator.userAgent}</p>
        <p><strong>Media Devices:</strong> {navigator.mediaDevices ? "Supported" : "Not supported"}</p>
        <p><strong>HTTPS:</strong> {window.location.protocol === "https:" ? "Yes" : "No"}</p>
      </div>
    </div>
  );
}


