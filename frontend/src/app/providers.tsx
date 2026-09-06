"use client";

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { User, RequestItem, RequestStatus, Stats } from "@/types";
import {
  getCachedData,
  setCachedData,
  invalidateCache,
} from "@/utils/apiCache";

const REQ_CACHE_KEY = "requests";
const STATS_CACHE_KEY = "stats";

const INITIAL_STATS: Stats = {
  totalCount: 0,
  problemsCount: 0,
  ideasCount: 0,
  byStatus: {
    submitted: 0,
    under_review: 0,
    in_progress: 0,
    resolved: 0,
    archived: 0,
  },
  byCategory: {},
};

interface AppContextValue {
  currentUser: User | null;
  authReady: boolean;
  isAuthOpen: boolean;
  openAuth: () => void;
  closeAuth: () => void;
  loginSuccess: (user: User) => void;
  logout: () => void;
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
  requests: RequestItem[];
  stats: Stats;
  loading: boolean;
  apiError: string | null;
  dismissError: () => void;
  refresh: (options?: { force?: boolean; silent?: boolean }) => Promise<void>;
  like: (id: string) => Promise<void>;
  updateStatus: (
    id: string,
    status: RequestStatus,
    adminResponse: string,
  ) => Promise<void>;
  submitSuccess: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useApp must be used within AppProvider");
  }
  return ctx;
}

export function Providers({ children }: { children: React.ReactNode }) {
  // Restore theme + session from localStorage (client-only). Lazy
  // initializers run during first render; no effect/state cascade.
  const [theme, setThemeState] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "light";
    const saved = localStorage.getItem("shahr_ara_theme");
    return saved === "dark" || saved === "light" ? saved : "light";
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      return JSON.parse(
        localStorage.getItem("shahr_ara_user") ?? "null",
      ) as User | null;
    } catch {
      localStorage.removeItem("shahr_ara_user");
      return null;
    }
  });
  // Avoid rendering auth-gated UI until localStorage session restored
  const [authReady, setAuthReady] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [stats, setStats] = useState<Stats>(INITIAL_STATS);
  const [loading, setLoading] = useState(true);

  // Mark session as ready after hydration; theme/user restored via lazy
  // initializers above. authReady gates auth-dependent UI and effects.
  useEffect(() => {
    queueMicrotask(() => setAuthReady(true));
  }, []);

  const loginSuccess = useCallback((user: User) => {
    setCurrentUser(user);
    localStorage.setItem("shahr_ara_user", JSON.stringify(user));
    if (user.token) {
      localStorage.setItem("shahr_ara_token", user.token);
    }
    invalidateCache();
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem("shahr_ara_user");
    localStorage.removeItem("shahr_ara_token");
    invalidateCache();
  }, []);

  const setTheme = useCallback((next: "light" | "dark") => {
    setThemeState(next);
  }, []);

  const refresh = useCallback(
    async (options?: { force?: boolean; silent?: boolean }) => {
      const { force = false, silent = false } = options ?? {};

      // Stale-while-revalidate: serve cached data first
      if (!force) {
        const cachedReqs = getCachedData<RequestItem[]>(REQ_CACHE_KEY);
        const cachedStats = getCachedData<Stats>(STATS_CACHE_KEY);
        if (cachedReqs && cachedStats) {
          setRequests(cachedReqs.data);
          setStats(cachedStats.data);
          if (!silent) setLoading(false);
          if (cachedReqs.isFresh && cachedStats.isFresh) return;
          // Stale → revalidate silently in background below
        }
      }

      if (!silent) setLoading(true);
      setApiError(null);

      try {
        const userParam = currentUser
          ? `?currentUserPhone=${currentUser.phone}`
          : "";
        const headers: Record<string, string> = {};
        const token =
          currentUser?.token ?? localStorage.getItem("shahr_ara_token");
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const [requestsRes, statsRes] = await Promise.all([
          fetch(`/api/v1/requests${userParam}`, { headers }),
          fetch("/api/v1/stats"),
        ]);

        if (requestsRes.ok && statsRes.ok) {
          const reqData = await requestsRes.json();
          const statData = await statsRes.json();
          setRequests(reqData);
          setStats(statData);
          setCachedData(REQ_CACHE_KEY, reqData);
          setCachedData(STATS_CACHE_KEY, statData);
        } else {
          setApiError(
            "در دریافت اطلاعات از سرور مشکلی پیش آمد. لطفاً بعداً تلاش کنید.",
          );
        }
      } catch {
        setApiError(
          "ارتباط با سرور برقرار نشد. از اتصال اینترنت خود مطمئن شوید.",
        );
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [currentUser],
  );

  useEffect(() => {
    if (!authReady) return;
    // Fire-and-forget initial load; refresh handles its own errors.
    // setState calls are async (after await), not sync in effect body.
    const t = setTimeout(() => void refresh(), 0);
    return () => clearTimeout(t);
  }, [authReady, refresh]);

  const like = useCallback(
    async (id: string) => {
      const token =
        currentUser?.token ?? localStorage.getItem("shahr_ara_token");
      if (!token) return;
      try {
        const res = await fetch(`/api/v1/requests/${id}/like`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const updatedReq = await res.json();
          if (updatedReq.success) {
            setRequests((prev) =>
              prev.map((r) => (r.id === id ? updatedReq.request : r)),
            );
            invalidateCache();
          }
        }
      } catch {
        // silent fail — optimistic UI already updated
      }
    },
    [currentUser],
  );

  const updateStatus = useCallback(
    async (id: string, status: RequestStatus, adminResponse: string) => {
      const token =
        currentUser?.token ?? localStorage.getItem("shahr_ara_token");
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`/api/v1/requests/${id}/status`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ status, adminResponse }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || "خطا در بروزرسانی وضعیت.");
      }
      invalidateCache();
      await refresh({ force: true, silent: true });
    },
    [currentUser, refresh],
  );

  const value = useMemo(
    () => ({
      currentUser,
      authReady,
      isAuthOpen,
      openAuth: () => setIsAuthOpen(true),
      closeAuth: () => setIsAuthOpen(false),
      loginSuccess,
      logout,
      theme,
      setTheme,
      requests,
      stats,
      loading,
      apiError,
      dismissError: () => setApiError(null),
      refresh,
      like,
      updateStatus,
      submitSuccess: () => {
        invalidateCache();
        refresh({ silent: true });
      },
    }),
    [
      currentUser,
      authReady,
      isAuthOpen,
      loginSuccess,
      logout,
      theme,
      setTheme,
      requests,
      stats,
      loading,
      apiError,
      refresh,
      like,
      updateStatus,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
