import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { fileService } from "../services/file.service";
import BiometricVerifyModal from "../components/BiometricVerifyModal";
import UploadModal from "../components/UploadModal";

/* ---------------- BADGE COLORS ---------------- */

const badgeColor = (level: string) => {
  switch (level) {
    case "Top Secret":
      return "bg-red-600";
    case "Secret":
      return "bg-orange-500";
    case "Restricted":
      return "bg-blue-500";
    case "Public":
      return "bg-gray-500";
    default:
      return "bg-gray-500";
  }
};

/* ---------------- COMPONENT ---------------- */

const FileExplorer = () => {
  const { token, user } = useAuth();

  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showBiometric, setShowBiometric] = useState(false);
  const [pendingFile, setPendingFile] = useState<any>(null);

  const [showUpload, setShowUpload] = useState(false);

  /* ---------------- ROLE CHECK ---------------- */

  const canUpload =
    user?.role === "SUPER_ADMIN" || user?.role === "ADMIN";

  /* ---------------- FETCH FILES ---------------- */

  const fetchFiles = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const res = await fileService.getFiles(token);
      setFiles(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("File fetch failed", err);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [token]);

  /* ---------------- DOWNLOAD ---------------- */

  const startDownload = async (
    file: any,
    biometricVerified: boolean,
    mfaVerified: boolean
  ) => {
    try {
      const res = await fileService.downloadFile(
        token!,
        file.id,
        biometricVerified,
        mfaVerified
      );

      const blob = new Blob([res.data]);
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = file.filename;
      a.click();

      window.URL.revokeObjectURL(url);
    } catch {
      alert("Download failed");
    }
  };

  const download = (file: any) => {
    const needsBiometric =
      file.classification === "Secret" ||
      file.classification === "Top Secret";

    if (needsBiometric) {
      setPendingFile(file);
      setShowBiometric(true);
      return;
    }

    startDownload(file, false, true);
  };

  /* ---------------- LOADING ---------------- */

  if (loading) {
    return <div className="p-6 text-gray-400">Loading files…</div>;
  }

  /* ---------------- UI ---------------- */

  return (
    <div className="p-6 text-white">

      {/* ⬆️ UPLOAD BUTTON */}
      {canUpload && (
        <div className="mb-4 flex justify-end">
          <button
            onClick={() => setShowUpload(true)}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded font-semibold"
          >
            Upload File
          </button>
        </div>
      )}

      {/* 📤 UPLOAD MODAL */}
      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onUploaded={fetchFiles}
        />
      )}

      {/* 🔒 BIOMETRIC MODAL */}
      {showBiometric && (
        <BiometricVerifyModal
          onClose={() => {
            setShowBiometric(false);
            setPendingFile(null);
          }}
          onSuccess={() => {
            setShowBiometric(false);
            startDownload(pendingFile, true, true);
            setPendingFile(null);
          }}
        />
      )}

      {/* 📂 FILE TABLE */}
      <div className="overflow-x-auto border border-gray-700 rounded">
        <table className="w-full">
          <thead className="bg-[#0b1220]">
            <tr>
              <th className="p-3 text-left">Filename</th>
              <th className="p-3 text-left">Department</th>
              <th className="p-3 text-left">Classification</th>
              <th className="p-3 text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            {files.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-4 text-center text-gray-400">
                  No files available
                </td>
              </tr>
            ) : (
              files.map((f) => (
                <tr key={f.id} className="border-t border-gray-700">
                  <td className="p-3">{f.filename}</td>
                  <td>{f.department}</td>
                  <td>
                    <span
                      className={`px-3 py-1 rounded text-xs font-semibold ${badgeColor(
                        f.classification
                      )}`}
                    >
                      {f.classification}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => download(f)}
                      className="text-blue-400 hover:underline"
                    >
                      Download
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FileExplorer;
