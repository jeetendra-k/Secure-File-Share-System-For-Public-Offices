import axios from "axios";

const API_BASE = "http://127.0.0.1:8000";

export const fileService = {
  async getFiles(token: string) {
    return axios.get(`${API_BASE}/files`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  async uploadFile(
    token: string,
    file: File,
    classification: string
  ) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("classification", classification);

    return axios.post(`${API_BASE}/files/upload`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  async downloadFile(
    token: string,
    fileId: number,
    biometric: boolean,
    mfa: boolean
  ) {
    return axios.get(
      `${API_BASE}/files/${fileId}?biometric_verified=${biometric}&mfa_verified=${mfa}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: "blob",
      }
    );
  },
};
