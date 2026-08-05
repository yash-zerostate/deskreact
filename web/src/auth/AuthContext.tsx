import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import {
  api,
  loadStoredToken,
  refreshSession,
  setAccessToken,
  setSessionLostHandler,
} from "@/lib/apiClient";

export type User = {
  id: string;
  name: string;
  email: string;
  role: "agent" | "supervisor" | "admin";
  plan: "starter" | "team" | "business";
  workspace: string;
  timezone: string;
};

type AuthResult = { ok: true } | { ok: false; message: string; fields?: Record<string, string> };

type AuthContextValue = {
  user: User | null;
  /** True until the first session check finishes — routes wait on this. */
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (input: {
    name: string;
    email: string;
    password: string;
    workspace: string;
  }) => Promise<AuthResult>;
  logout: () => Promise<void>;
  updateProfile: (input: { name: string; timezone: string }) => Promise<AuthResult>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type AuthResponse = { user: User; accessToken: string; expiresIn: number };

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const refreshTimer = useRef<number | null>(null);

  const clearTimer = useCallback(() => {
    if (refreshTimer.current !== null) {
      window.clearTimeout(refreshTimer.current);
      refreshTimer.current = null;
    }
  }, []);

  /**
   * Refresh a minute before the access token expires. Without this the user
   * would only discover the expiry by making a request that fails first.
   */
  const scheduleRefresh = useCallback(
    (expiresIn: number) => {
      clearTimer();
      const delayMs = Math.max(30, expiresIn - 60) * 1000;
      refreshTimer.current = window.setTimeout(async () => {
        const ok = await refreshSession();
        if (ok) scheduleRefresh(expiresIn);
        else setUser(null);
      }, delayMs);
    },
    [clearTimer],
  );

  // Boot: if a stored access token exists, ask who it belongs to. If it has
  // expired, `api()` refreshes transparently using the httpOnly cookie.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!loadStoredToken()) {
        // No access token, but a refresh cookie may still be valid (e.g. the
        // tab was closed for an hour) — try once before giving up.
        const refreshed = await refreshSession();
        if (!refreshed) {
          if (!cancelled) setLoading(false);
          return;
        }
      }

      const result = await api<{ user: User }>("/auth/me");
      if (cancelled) return;
      if (result.ok) {
        setUser(result.data.user);
        scheduleRefresh(15 * 60);
      } else {
        setAccessToken(null);
      }
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [scheduleRefresh]);

  // When a refresh finally fails, drop the session everywhere at once.
  useEffect(() => {
    setSessionLostHandler(() => {
      setUser(null);
      setAccessToken(null);
      clearTimer();
    });
    return () => setSessionLostHandler(null);
  }, [clearTimer]);

  useEffect(() => clearTimer, [clearTimer]);

  const authenticate = useCallback(
    async (path: string, body: unknown): Promise<AuthResult> => {
      const result = await api<AuthResponse>(path, {
        method: "POST",
        body: JSON.stringify(body),
      });

      if (!result.ok) {
        return { ok: false, message: result.message, fields: result.fields };
      }

      setAccessToken(result.data.accessToken);
      setUser(result.data.user);
      scheduleRefresh(result.data.expiresIn);
      return { ok: true };
    },
    [scheduleRefresh],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      login: (email, password) => authenticate("/auth/login", { email, password }),
      register: (input) => authenticate("/auth/register", input),
      logout: async () => {
        // Revoke server-side first; only then forget the token locally.
        await api("/auth/logout", { method: "POST" });
        setAccessToken(null);
        setUser(null);
        clearTimer();
      },
      updateProfile: async (input) => {
        const result = await api<{ user: User }>("/auth/me", {
          method: "PATCH",
          body: JSON.stringify(input),
        });
        if (!result.ok) return { ok: false, message: result.message, fields: result.fields };
        setUser(result.data.user);
        return { ok: true };
      },
    }),
    [user, loading, authenticate, clearTimer],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside <AuthProvider>");
  return context;
}
