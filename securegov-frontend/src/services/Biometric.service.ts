import axios from "axios";

const API = "http://localhost:8000";

export const biometricVerify = async (token: string) => {
  return axios.post(
    `${API}/biometric/verify`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};
