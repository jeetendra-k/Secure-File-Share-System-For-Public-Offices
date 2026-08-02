import { useState } from "react";
import { fileService } from "../services/file.service";
import { useAuth } from "../context/AuthContext";

const UploadModal = ({
  onClose,
  onUploaded,
}: {
  onClose: () => void;
  onUploaded: () => void;
}) => {
  const { token } = useAuth();

  const [file, setFile] = useState<File | null>(null);
  const [classification, setClassification] =
    useState("Internal");

  const upload = async () => {
    if (!file) return;
    await fileService.uploadFile(
      token!,
      file,
      classification
    );
    onUploaded();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
      <div className="bg-[#0b1220] p-6 rounded w-96">
        <h2 className="text-lg font-bold mb-4">
          Upload Secure File
        </h2>

        <input
          type="file"
          onChange={(e) =>
            setFile(e.target.files?.[0] || null)
          }
          className="mb-3"
        />

        <select
          value={classification}
          onChange={(e) =>
            setClassification(e.target.value)
          }
          className="w-full mb-4 p-2 bg-black border border-gray-600"
        >
          <option>Public</option>
          <option>Internal</option>
          <option>Restricted</option>
          <option>Highly Confidential</option>
          <option>Secret</option>
          <option>Top Secret</option>
        </select>

        <div className="flex justify-end gap-2">
          <button onClick={onClose}>Cancel</button>
          <button
            onClick={upload}
            className="bg-blue-600 px-4 py-2 rounded"
          >
            Upload
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;
