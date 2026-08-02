import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { fileService } from "../services/file.service";
import BiometricVerifyModal from "./BiometricVerifyModal";

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

const FileTable = ({ files }: { files: any[] }) => {
  const { token } = useAuth();

  const [showBiometric, setShowBiometric] = useState(false);
  const [pendingFile, setPendingFile] = useState<any>(null);

  const startDownload = async (file: any) => {
    try {
      const res = await fileService.downloadFile(token!, file.id);

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

    startDownload(file);
  };

  return (
    <>
      {showBiometric && (
        <BiometricVerifyModal
          onClose={() => setShowBiometric(false)}
          onSuccess={() => startDownload(pendingFile)}
        />
      )}

      <table className="w-full border border-gray-700 rounded">
        <thead className="bg-[#0b1220]">
          <tr>
            <th className="p-3 text-left">Filename</th>
            <th>Department</th>
            <th>Classification</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {files.map((f) => (
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
          ))}
        </tbody>
      </table>
    </>
  );
};

export default FileTable;
