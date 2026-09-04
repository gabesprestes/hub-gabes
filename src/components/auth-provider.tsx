"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  clearToken,
  getStoredToken,
  storeToken,
  validateToken,
  type GithubUser,
} from "@/lib/token";
import { ensureHubGist } from "@/lib/gist";

interface AuthContextValue {
  token: string | null;
  user: GithubUser | null;
  ready: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<GithubUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const existing = getStoredToken();
    if (!existing) {
      setReady(true);
      return;
    }
    validateToken(existing)
      .then(async (u) => {
        await ensureHubGist(existing);
        setToken(existing);
        setUser(u);
      })
      .catch(() => {
        clearToken();
      })
      .finally(() => setReady(true));
  }, []);

  const login = useCallback(async (raw: string) => {
    const cleaned = raw.trim();
    const u = await validateToken(cleaned);
    await ensureHubGist(cleaned);
    storeToken(cleaned);
    setToken(cleaned);
    setUser(u);
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ token, user, ready, login, logout }),
    [token, user, ready, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
