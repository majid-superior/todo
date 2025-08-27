import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { authAPI } from "../services/api";
import { User, LoginCredentials, RegisterData } from "../types";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string;
  login: (
    credentials: LoginCredentials
  ) => Promise<{ success: boolean; error?: string }>;
  register: (
    userData: RegisterData
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  setError: (error: string) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const login = async (
    credentials: LoginCredentials
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setError("");
      const response = await authAPI.login(credentials);

      if (response.data.success) {
        const { token, user } = response.data.data;
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        setUser(user);
        return { success: true };
      }
      return { success: false, error: "Login failed" };
    } catch (error: any) {
      const message = error.response?.data?.message || "Login failed";
      setError(message);
      return { success: false, error: message };
    }
  };

  const register = async (
    userData: RegisterData
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setError("");
      const response = await authAPI.register({
        username: userData.username,
        password: userData.password,
      });

      if (response.data.success) {
        const { token, user } = response.data.data;
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        setUser(user);
        return { success: true };
      }
      return { success: false, error: "Registration failed" };
    } catch (error: any) {
      const message = error.response?.data?.message || "Registration failed";
      setError(message);
      return { success: false, error: message };
    }
  };

  const logout = (): void => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    setError,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
