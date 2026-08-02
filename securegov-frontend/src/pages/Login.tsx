import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/auth.service";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { setToken, setUser } = useAuth();
  const navigate = useNavigate();

 const handleLogin = async () => {
  try {
    const res = await authService.login(employeeId, password);

    console.log("LOGIN RESPONSE:", res);

    setToken(res.token);
    setUser(res.user);

    console.log("USER SET TO:", res.user);

    navigate("/");
  } catch (err) {
    setError("Invalid credentials");
  }
};

  return (
    <div className="h-screen flex items-center justify-center bg-black text-white">
      <div className="bg-[#0b1220] p-8 rounded w-96">
        <h1 className="text-2xl mb-4">SecureGov Login</h1>

        {error && <p className="text-red-500 mb-2">{error}</p>}

        <input
          className="w-full mb-3 p-2 bg-black border border-gray-600"
          placeholder="Employee ID"
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
        />

        <input
          className="w-full mb-4 p-2 bg-black border border-gray-600"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="w-full bg-blue-600 py-2 rounded"
        >
          Login
        </button>
      </div>
    </div>
  );
};

export default Login;
