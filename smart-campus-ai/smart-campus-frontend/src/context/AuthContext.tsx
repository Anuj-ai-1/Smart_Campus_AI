import React, { createContext, useContext, useState, useEffect } from "react";
import { User, Role } from "../types";
import { authApi } from "../services/api";

interface AuthContextType {
  user: User | null;
  role: Role | null;
  isLoading: boolean;
  login: (email: string, password: string, role: Role, rememberMe?: boolean) => Promise<void>;
  register: (params: {
    name?: string;
    email: string;
    password: string;
    role: Role;
    student_id?: string;
    rememberMe?: boolean;
  }) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = "smartcampus.user.v2";
const TOKEN_STORAGE_KEY = "smartcampus.token.v2";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on mount — verify token with backend
  useEffect(() => {
    // Check both session and local storage
    const savedUser = sessionStorage.getItem(USER_STORAGE_KEY) || localStorage.getItem(USER_STORAGE_KEY);
    const token = sessionStorage.getItem(TOKEN_STORAGE_KEY) || localStorage.getItem(TOKEN_STORAGE_KEY);

    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        /* ignore bad json */
      }
      // Re-verify token with backend
      authApi
        .getMe()
        .then((remoteUser) => {
          setUser(remoteUser);
          if (sessionStorage.getItem(TOKEN_STORAGE_KEY)) {
            sessionStorage.setItem(USER_STORAGE_KEY, JSON.stringify(remoteUser));
          } else {
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(remoteUser));
          }
        })
        .catch(() => {
          // Token expired or invalid — clear session
          localStorage.removeItem(USER_STORAGE_KEY);
          localStorage.removeItem(TOKEN_STORAGE_KEY);
          sessionStorage.removeItem(USER_STORAGE_KEY);
          sessionStorage.removeItem(TOKEN_STORAGE_KEY);
          setUser(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const _applyResponse = (
    response: {
      user?: User;
      accessToken?: string;
      id?: string;
      name?: string;
      email?: string;
      role?: string;
      studentId?: string;
      must_change_password?: boolean;
      mustChangePassword?: boolean;
    },
    rememberMe: boolean = false
  ) => {
    const authedUser: User = response.user || {
      id: response.id!,
      name: response.name!,
      email: response.email!,
      role: response.role as Role,
      title: "",
      studentId: response.studentId,
      mustChangePassword: response.mustChangePassword ?? response.must_change_password ?? false,
      must_change_password: response.mustChangePassword ?? response.must_change_password ?? false,
      assigned_cohorts: (response as any).assigned_cohorts || (response as any).assignedCohorts || "[]",
      assignedCohorts: (response as any).assigned_cohorts || (response as any).assignedCohorts || "[]",
    };

    const storage = rememberMe ? localStorage : sessionStorage;
    
    // Clear the other storage just in case
    (rememberMe ? sessionStorage : localStorage).removeItem(TOKEN_STORAGE_KEY);
    (rememberMe ? sessionStorage : localStorage).removeItem(USER_STORAGE_KEY);

    if (response.accessToken) {
      storage.setItem(TOKEN_STORAGE_KEY, response.accessToken);
    }
    storage.setItem(USER_STORAGE_KEY, JSON.stringify(authedUser));
    setUser(authedUser);
  };

  const login = async (email: string, password: string, role: Role, rememberMe?: boolean) => {
    const response = await authApi.login({ email, password, role });
    _applyResponse(response, rememberMe);
  };

  const register = async (params: {
    name?: string;
    email: string;
    password: string;
    role: Role;
    student_id?: string;
    rememberMe?: boolean;
  }) => {
    const { rememberMe, ...apiParams } = params;
    const response = await authApi.register(apiParams as any);
    _applyResponse(response, rememberMe);
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    await authApi.changePassword({ current_password: currentPassword, new_password: newPassword });
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, mustChangePassword: false, must_change_password: false };
      if (sessionStorage.getItem(USER_STORAGE_KEY)) {
        sessionStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updated));
      } else {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updated));
      }
      return updated;
    });
  };

  const logout = () => {
    authApi.logout().catch(() => {});
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    sessionStorage.removeItem(USER_STORAGE_KEY);
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user ? user.role : null,
        isLoading,
        login,
        register,
        changePassword,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
