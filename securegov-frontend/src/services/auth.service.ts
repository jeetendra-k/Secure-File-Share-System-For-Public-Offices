import axios from "axios";

const API = "http://localhost:8000/auth";

export const authService = {
  login: async (employee_id: string, password: string) => {
    const res = await axios.post(`${API}/login`, {
      employee_id,
      password,
    });

    // 🔴 RETURN EXACT SHAPE
    return {
      token: res.data.token,
      user: res.data.user,
    };
  },
};
