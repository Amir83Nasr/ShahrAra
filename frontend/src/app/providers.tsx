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
  useRef,
  useState,
} from "react";
import { User, RequestItem, RequestStatus, Stats } from "@/types";
import {
  UNAUTHORIZED_EVENT,
  apiErrorMessage,
  apiFetch,
  authHeaders,
} from "@/lib/api";
import {
  getCachedData,
  setCachedData,
  invalidateCache,
} from "@/utils/apiCache";
import {
  DEFAULT_FONT,
  FONT_STORAGE_KEY,
  FontOption,
  normalizeFontOption,
} from "@/utils/fontUtils";

const REQ_CACHE_KEY = "requests";
const STATS_CACHE_KEY = "stats";

// Should match the transition-duration in globals.css (300ms). The small
// buffer lets the final frame paint before the helper class is removed.
const THEME_TRANSITION_MS = 320;

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
  loginSuccess: (user: User) => void;
  logout: () => void;
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
  font: FontOption;
  setFont: (font: FontOption) => void;
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
  // Restore theme + session from localStorage AFTER hydration (two-pass
  // render): the first render must match the server HTML, so defaults here
  // and saved values applied in the effect below.
  const [theme, setThemeState] = useState<"light" | "dark">("light");
  const [font, setFontState] = useState<FontOption>(DEFAULT_FONT);
  const themeTransitionTimer = useRef<number | null>(null);

  // Never leave the transition helper class behind (e.g. on unmount).
  useEffect(() => {
    return () => {
      if (themeTransitionTimer.current !== null) {
        window.clearTimeout(themeTransitionTimer.current);
      }
      document.documentElement.classList.remove("theme-transition");
    };
  }, []);

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  // Avoid rendering auth-gated UI until localStorage session restored
  const [authReady, setAuthReady] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [stats, setStats] = useState<Stats>(INITIAL_STATS);
  const [loading, setLoading] = useState(true);

  // Mark session as ready after hydration; queueMicrotask keeps setState
  // out of the effect body (eslint react-hooks/set-state-in-effect).
  useEffect(() => {
    queueMicrotask(() => {
      const savedTheme = localStorage.getItem("shahr_ara_theme");
      if (savedTheme === "dark" || savedTheme === "light") {
        setThemeState(savedTheme);
      }
      const savedFont = localStorage.getItem(FONT_STORAGE_KEY);
      // مهاجرت مقادیر قدیمی («پلاک»، «مربع»، «دیدار») به تنظیم فعلی
      const restoredFont = normalizeFontOption(savedFont);
      if (restoredFont) {
        setFontState(restoredFont);
      }
      try {
        const savedUser = JSON.parse(
          localStorage.getItem("shahr_ara_user") ?? "null",
        ) as User | null;
        if (savedUser) {
          // Sessions saved before national-ID masking may still hold the full
          // value; scrub it in place rather than keeping it in localStorage.
          if (
            savedUser.nationalId &&
            !savedUser.nationalId.startsWith("******")
          ) {
            savedUser.nationalId = `******${savedUser.nationalId.slice(-4)}`;
            localStorage.setItem("shahr_ara_user", JSON.stringify(savedUser));
          }
          setCurrentUser(savedUser);
        }
      } catch {
        localStorage.removeItem("shahr_ara_user");
      }
      setAuthReady(true);
    });
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
      document.body.classList.add("dark");
    } else {
      root.classList.remove("dark");
      document.body.classList.remove("dark");
    }
    // نوار مرورگر/PWA هم‌رنگ تم فعلی
    const themeColor = theme === "dark" ? "#212121" : "#ffffff";
    document
      .querySelectorAll('meta[name="theme-color"]')
      .forEach((meta) => meta.setAttribute("content", themeColor));
    // Wait for the restore pass above, else first run clobbers saved value
    if (!authReady) return;
    localStorage.setItem("shahr_ara_theme", theme);
  }, [theme, authReady]);

  useEffect(() => {
    // Wait for the restore pass so the pre-hydration script's value is not
    // clobbered by the default font on the first frame.
    if (!authReady) return;
    document.documentElement.dataset.font = font;
    localStorage.setItem(FONT_STORAGE_KEY, font);
  }, [font, authReady]);

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

  // Revalidate a restored session once. A stale/expired token is cleared
  // instead of leaving the UI in a fake logged-in state.
  useEffect(() => {
    if (!authReady) return;
    const token = localStorage.getItem("shahr_ara_token");
    if (!token) return;

    let cancelled = false;
    apiFetch<User>("/api/v1/auth/me", { headers: authHeaders(token) })
      .then((fresh) => {
        if (cancelled) return;
        const next = { ...fresh, token };
        setCurrentUser(next);
        localStorage.setItem("shahr_ara_user", JSON.stringify(next));
      })
      .catch(() => {
        if (!cancelled) logout();
      });

    return () => {
      cancelled = true;
    };
  }, [authReady, logout]);

  // Any 401 from a shared API call means the token is no longer usable.
  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
      setApiError("نشست شما منقضی شده است. لطفاً دوباره وارد شوید.");
    };
    window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
    return () =>
      window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
  }, [logout]);

  const setTheme = useCallback((next: "light" | "dark") => {
    const root = document.documentElement;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    // Add the helper class *before* the state change so the browser sees the
    // new colors as a transition target rather than an instant repaint.
    if (reduceMotion) {
      if (themeTransitionTimer.current !== null) {
        window.clearTimeout(themeTransitionTimer.current);
        themeTransitionTimer.current = null;
      }
      root.classList.remove("theme-transition");
    } else {
      root.classList.add("theme-transition");
      // Force a style flush so the helper class is part of the "before-change"
      // style; otherwise the color change may land in the same style
      // recalculation and the browser skips the animation.
      void root.offsetWidth;
      if (themeTransitionTimer.current !== null) {
        window.clearTimeout(themeTransitionTimer.current);
      }
      themeTransitionTimer.current = window.setTimeout(() => {
        root.classList.remove("theme-transition");
        themeTransitionTimer.current = null;
      }, THEME_TRANSITION_MS);
    }

    setThemeState(next);
  }, []);

  const setFont = useCallback((next: FontOption) => {
    setFontState(next);
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
        const token =
          currentUser?.token ?? localStorage.getItem("shahr_ara_token");
        const headers = authHeaders(token);

        const [reqData, statData] = await Promise.all([
          apiFetch<RequestItem[]>(`/api/v1/requests${userParam}`, { headers }),
          apiFetch<Stats>("/api/v1/stats"),
        ]);

        setRequests(reqData);
        setStats(statData);
        setCachedData(REQ_CACHE_KEY, reqData);
        setCachedData(STATS_CACHE_KEY, statData);
      } catch (err) {
        setApiError(
          apiErrorMessage(
            err,
            "در دریافت اطلاعات از سرور مشکلی پیش آمد. لطفاً بعداً تلاش کنید.",
          ),
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
        const updatedReq = await apiFetch<{
          success: boolean;
          request: RequestItem;
        }>(`/api/v1/requests/${id}/like`, {
          method: "POST",
          headers: authHeaders(token),
        });

        if (updatedReq.success) {
          setRequests((prev) =>
            prev.map((r) => (r.id === id ? updatedReq.request : r)),
          );
          invalidateCache();
        }
      } catch (err) {
        setApiError(apiErrorMessage(err, "ثبت لایک انجام نشد."));
      }
    },
    [currentUser],
  );

  const updateStatus = useCallback(
    async (id: string, status: RequestStatus, adminResponse: string) => {
      const token =
        currentUser?.token ?? localStorage.getItem("shahr_ara_token");

      await apiFetch(`/api/v1/requests/${id}/status`, {
        method: "PUT",
        headers: authHeaders(token, true),
        body: JSON.stringify({ status, adminResponse }),
      });

      invalidateCache();
      await refresh({ force: true, silent: true });
    },
    [currentUser, refresh],
  );

  const value = useMemo(
    () => ({
      currentUser,
      authReady,
      loginSuccess,
      logout,
      theme,
      setTheme,
      font,
      setFont,
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
      loginSuccess,
      logout,
      theme,
      setTheme,
      font,
      setFont,
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
