"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { apiFetch, setTokens, clearTokens, clearLegacyDjtLocalStorage, stripLocalCvClIfSynced } from "./api";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar: string;
  plan: string;
  trialEndsAt?: string | null;
  publicProfileEnabled?: boolean;
  publicSlug?: string | null;
  publicBio?: string;
  /** True si el usuario conectó Google Calendar (OAuth scope eventos). */
  calendarConnected?: boolean;
  /** CV en Cloudinary (PDF); null si no subió. */
  cv?: {
    url: string;
    fileName: string;
    size: number;
    uploadedAt: string | null;
  } | null;
  coverLetter?: {
    text: string;
    pdf: {
      url: string;
      fileName: string;
      size: number;
      uploadedAt: string | null;
    } | null;
  };
  /** Idioma de plantillas (email); null si nunca guardó en servidor. */
  templatesLang?: "en" | "es" | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (accessToken: string, refreshToken: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
  refreshProfile: async () => {},
  isAuthenticated: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const token = localStorage.getItem("djt_access_token");
      if (!token) {
        setLoading(false);
        return;
      }

      const profile = await apiFetch<User>("/users/me");
      clearLegacyDjtLocalStorage();
      stripLocalCvClIfSynced(profile);
      setUser(profile);
      localStorage.setItem("djt_user", JSON.stringify(profile));
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const cached = localStorage.getItem("djt_user");
    if (cached) {
      try {
        setUser(JSON.parse(cached));
      } catch { /* ignore */ }
    }
    fetchUser();
  }, [fetchUser]);

  const login = useCallback(async (accessToken: string, refreshToken: string) => {
    setTokens(accessToken, refreshToken);
    setLoading(true);
    await fetchUser();
  }, [fetchUser]);

  const logout = useCallback(async () => {
    try {
      await apiFetch("/auth/logout", { method: "POST" });
    } catch { /* ignore */ }
    clearTokens();
    setUser(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      const token = localStorage.getItem("djt_access_token");
      if (!token) return;
      const profile = await apiFetch<User>("/users/me");
      stripLocalCvClIfSynced(profile);
      setUser(profile);
      localStorage.setItem("djt_user", JSON.stringify(profile));
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        refreshProfile,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
