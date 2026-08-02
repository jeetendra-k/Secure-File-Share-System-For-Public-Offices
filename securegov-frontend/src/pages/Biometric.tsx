import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { biometricVerify } from "../services/Biometric.service";
import { useAuth } from "../context/AuthContext";

const Biometric = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { token, verifyBiometric } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch(() => setError("Camera permission denied"));

    return () => {
      const stream = videoRef.current?.srcObject as MediaStream;
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const handleScan = async () => {
    if (!token) return;
    setLoading(true);
    try {
      await biometricVerify(token);
      verifyBiometric();      // ✅ FLAG SET
      navigate("/");
    } catch {
      setError("Biometric verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center p-6">
      <h1 className="text-xl font-bold mb-4">Biometric Verification</h1>

      {error && <p className="text-red-500">{error}</p>}

      <video
        ref={videoRef}
        autoPlay
        className="w-72 h-56 bg-black rounded mb-4"
      />

      <button
        onClick={handleScan}
        disabled={loading}
        className="bg-blue-600 text-white px-6 py-2 rounded"
      >
        {loading ? "Scanning..." : "Scan Face"}
      </button>
    </div>
  );
};

export default Biometric;
