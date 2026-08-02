import axios from "axios";

const API = "http://127.0.0.1:8000";

export type User = {
  id: number;
  employee_id: string;
  role: string;
  department: string;
};

export const userService = {
  getUsers: (token: string) =>
    axios.get<User[]>(`${API}/users`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
};
