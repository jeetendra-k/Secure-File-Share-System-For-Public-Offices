import { useRef } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const API = "http://127.0.0.1:8000";

type Props = {
  onSuccess: () => void;
  onClose: () => void;
};

export default function BiometricVerifyModal({ onSuccess, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { token } = useAuth();

  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    if (videoRef.current) videoRef.current.srcObject = stream;
  };

  const verify = async () => {
    const canvas = canvasRef.current!;
    const video = videoRef.current!;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    canvas.getContext("2d")!.drawImage(video, 0, 0);

    const blob = await new Promise<Blob>((res) =>
      canvas.toBlob((b) => res(b!), "image/jpeg")
    );

    const data = new FormData();
    data.append("file", blob, "live.jpg");

    const res = await axios.post(
      `${API}/biometric/verify-download`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (res.data.verified) {
      onSuccess();
      onClose();
    } else {
      alert("Biometric verification failed");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-[#0b1220] p-6 rounded w-[420px]">
        <h2 className="text-lg mb-3">Biometric Verification</h2>

        <video ref={videoRef} autoPlay className="rounded" />
        <canvas ref={canvasRef} hidden />

        <div className="flex gap-2 mt-4">
          <button
            onClick={startCamera}
            className="bg-gray-600 px-3 py-1 rounded"
          >
            Start Camera
          </button>

          <button
            onClick={verify}
            className="bg-green-600 px-3 py-1 rounded"
          >
            Verify
          </button>

          <button
            onClick={onClose}
            className="bg-red-600 px-3 py-1 rounded"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
