import { useRef, useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const API = "http://127.0.0.1:8000";

export default function AddEmployeeModal({ onClose }: { onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const { token } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    employee_id: "",
    name: "",
    password: "",
    role: "CLERK",
    department: "",
  });

  // 🎥 Start webcam
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      setError("Camera access denied");
    }
  };

  // 🛑 Stop webcam on close
  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(track => track.stop());
  };

  // 📸 Capture + Submit
  const captureAndSubmit = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setLoading(true);
    setError("");

    const canvas = canvasRef.current;
    const video = videoRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")!.drawImage(video, 0, 0);

    const blob = await new Promise<Blob>((resolve) =>
      canvas.toBlob((b) => resolve(b!), "image/jpeg")
    );

    const data = new FormData();
    Object.entries(form).forEach(([key, value]) =>
      data.append(key, value)
    );
    data.append("face_image", blob, "face.jpg");

    try {
      await axios.post(`${API}/users/create`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      stopCamera();
      onClose();
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ||
        "Failed to create employee"
      );
    } finally {
      setLoading(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => stopCamera();
  }, []);

  return (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">
      <div className="bg-[#0b1220] p-6 rounded w-[520px] text-white">
        <h2 className="text-xl font-semibold mb-4">
          Add New Employee
        </h2>

        {error && (
          <div className="bg-red-600/20 text-red-400 p-2 rounded mb-3">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <input
            placeholder="Employee ID"
            className="w-full p-2 rounded bg-[#111827]"
            onChange={e => setForm({ ...form, employee_id: e.target.value })}
          />

          <input
            placeholder="Full Name"
            className="w-full p-2 rounded bg-[#111827]"
            onChange={e => setForm({ ...form, name: e.target.value })}
          />

          <input
            placeholder="Password"
            type="password"
            className="w-full p-2 rounded bg-[#111827]"
            onChange={e => setForm({ ...form, password: e.target.value })}
          />

          <input
            placeholder="Department"
            className="w-full p-2 rounded bg-[#111827]"
            onChange={e => setForm({ ...form, department: e.target.value })}
          />

          <select
            className="w-full p-2 rounded bg-[#111827]"
            value={form.role}
            onChange={e => setForm({ ...form, role: e.target.value })}
          >
            <option value="CLERK">CLERK</option>
            <option value="DEPT_OFFICER">DEPT_OFFICER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </div>

        <video
          ref={videoRef}
          autoPlay
          className="w-full mt-4 rounded border border-gray-700"
        />

        <canvas ref={canvasRef} hidden />

        <div className="flex justify-between mt-4">
          <button
            onClick={startCamera}
            className="bg-gray-600 px-4 py-2 rounded"
          >
            Start Camera
          </button>

          <button
            disabled={loading}
            onClick={captureAndSubmit}
            className="bg-green-600 px-4 py-2 rounded disabled:opacity-50"
          >
            {loading ? "Saving..." : "Capture & Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
