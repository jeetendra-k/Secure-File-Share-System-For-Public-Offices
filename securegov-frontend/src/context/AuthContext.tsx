import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

/* =========================================================
   Types
========================================================= */
export type UserType = {
  id: number;
  employee_id: string;
  role: string;
  department?: string;
};

type AuthContextType = {
  token: string | null;
  user: UserType | null;
  biometricVerified: boolean;

  setToken: (token: string | null) => void;
  setUser: (user: UserType | null) => void;

  verifyBiometric: () => void;
  logout: () => void;
};

/* =========================================================
   Context
========================================================= */
export const AuthContext = createContext<AuthContextType | null>(
  null
);

/* =========================================================
   Provider
========================================================= */
export const AuthProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserType | null>(null);

  // 🔐 Biometric verification flag
  const [biometricVerified, setBiometricVerified] =
    useState<boolean>(false);

  /* ---------------- BIOMETRIC ---------------- */
  const verifyBiometric = () => {
    setBiometricVerified(true);
  };

  /* ---------------- LOGOUT ---------------- */
  const logout = () => {
    setToken(null);
    setUser(null);
    setBiometricVerified(false); // zero-trust reset
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        biometricVerified,
        setToken,
        setUser,
        verifyBiometric,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/* =========================================================
   Hook
========================================================= */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
};
