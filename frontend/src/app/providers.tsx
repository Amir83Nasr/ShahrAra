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
import {
  NotificationItem,
  User,
  RequestItem,
  RequestStatus,
  Stats,
} from "@/types";
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
import { THEME_COLORS } from "@/lib/theme-color";

const REQ_CACHE_KEY = "requests";
const STATS_CACHE_KEY = "stats";

/**
 * اعمال فوری تم روی DOM: کلاس‌های تم، رنگ نوار مرورگر/PWA و color-scheme.
 * عمداً هیچ گذاری در کار نیست تا کل صفحه و رابط مرورگر در یک فریم و هم‌زمان
 * رنگ عوض کنند (گذار ۳۰۰ میلی‌ثری روی همهٔ عناصر باعث کندی می‌شد).
 */
function applyThemeToDom(theme: "light" | "dark") {
  const root = document.documentElement;
  const isDark = theme === "dark";

  root.classList.toggle("dark", isDark);
  if (document.body) {
    document.body.classList.toggle("dark", isDark);
  }

  // نوار مرورگر/PWA هم‌رنگ تم انتخاب‌شده (نه ترجیح سیستم‌عامل). این متا
  // عمداً از viewport در layout حذف شده تا جابه‌جایی بین صفحات آن را بازنویسی
  // نکند و رنگ نوار مرورگر نپرد.
  const themeColor = isDark ? THEME_COLORS.dark : THEME_COLORS.light;
  const themeColorMetas = document.querySelectorAll<HTMLMetaElement>(
    'meta[name="theme-color"]',
  );
  if (themeColorMetas.length === 0) {
    const meta = document.createElement("meta");
    meta.setAttribute("name", "theme-color");
    meta.setAttribute("content", themeColor);
    document.head.appendChild(meta);
  } else {
    themeColorMetas.forEach((meta, index) => {
      if (index === 0) {
        meta.setAttribute("content", themeColor);
      } else {
        // هر متای تکراری (مثلاً بازماندهٔ رندر قبلی) حذف می‌شود تا مرورگر
        // رنگ درست را از دست ندهد.
        meta.remove();
      }
    });
  }
}

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
  /** Merge a fresh profile response into the session (avatar, name, ...). */
  updateUser: (patch: Partial<User>) => void;
  logout: () => void;
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
  requests: RequestItem[];
  stats: Stats;
  loading: boolean;
  /** Last list-fetch failure; cleared as soon as a fetch succeeds again. */
  loadError: string | null;
  apiError: string | null;
  dismissError: () => void;
  refresh: (options?: { force?: boolean; silent?: boolean }) => Promise<void>;
  notifications: NotificationItem[];
  notificationsLoading: boolean;
  refreshNotifications: () => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
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

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  // Avoid rendering auth-gated UI until localStorage session restored
  const [authReady, setAuthReady] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const [requests, setRequests] = useState<RequestItem[]>([]);
  // Latest list for optimistic rollbacks inside callbacks (state itself is
  // stale inside the memoized handler).
  const requestsRef = useRef<RequestItem[]>(requests);
  const [stats, setStats] = useState<Stats>(INITIAL_STATS);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  // Unread notifications only; the API already filters by the bearer token.
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  // Mark session as ready after hydration; queueMicrotask keeps setState
  // out of the effect body (eslint react-hooks/set-state-in-effect).
  useEffect(() => {
    queueMicrotask(() => {
      const savedTheme = localStorage.getItem("shahr_ara_theme");
      if (savedTheme === "dark" || savedTheme === "light") {
        setThemeState(savedTheme);
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
    // Wait for the restore pass above (and the pre-paint inline script) before
    // touching the DOM, otherwise the default light theme would clobber the
    // saved one and the toolbar/background would flash.
    if (!authReady) return;

    applyThemeToDom(theme);
    localStorage.setItem("shahr_ara_theme", theme);
  }, [theme, authReady]);

  const loginSuccess = useCallback((user: User) => {
    setCurrentUser(user);
    localStorage.setItem("shahr_ara_user", JSON.stringify(user));
    if (user.token) {
      localStorage.setItem("shahr_ara_token", user.token);
    }
    invalidateCache();
  }, []);

  const updateUser = useCallback((patch: Partial<User>) => {
    setCurrentUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      localStorage.setItem("shahr_ara_user", JSON.stringify(next));
      return next;
    });
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    setNotifications([]);
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

    // برای یک فریم همهٔ گذارها را خاموش می‌کنیم تا عناصری که transition محلی
    // دارند (دکمه‌ها، بج‌ها، ...) هم هم‌زمان با بقیهٔ صفحه رنگ عوض کنند.
    root.classList.add("theme-switching");
    applyThemeToDom(next);
    setThemeState(next);

    // بعد از رنگ‌آمیزی فریم جدید کلاس کمکی را برمی‌داریم.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        root.classList.remove("theme-switching");
      });
    });
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
          setLoadError(null);
          if (!silent) setLoading(false);
          if (cachedReqs.isFresh && cachedStats.isFresh) return;
          // Stale → revalidate silently in background below
        }
      }

      if (!silent) setLoading(true);
      setApiError(null);
      setLoadError(null);

      try {
        const token =
          currentUser?.token ?? localStorage.getItem("shahr_ara_token");
        const headers = authHeaders(token);

        // The bearer token already tells the API who is viewing, so the phone
        // number never needs to travel in the URL (or into access logs).
        const [reqData, statData] = await Promise.all([
          apiFetch<RequestItem[]>("/api/v1/requests", { headers }),
          apiFetch<Stats>("/api/v1/stats"),
        ]);

        setRequests(reqData);
        setStats(statData);
        setCachedData(REQ_CACHE_KEY, reqData);
        setCachedData(STATS_CACHE_KEY, statData);
        setLoadError(null);
      } catch (err) {
        const message = apiErrorMessage(
          err,
          "در دریافت اطلاعات از سرور مشکلی پیش آمد. لطفاً بعداً تلاش کنید.",
        );
        setApiError(message);
        setLoadError(message);
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

  // Keep the rollback snapshot in sync with every list update.
  useEffect(() => {
    requestsRef.current = requests;
  }, [requests]);

  const refreshNotifications = useCallback(async () => {
    const token = currentUser?.token ?? localStorage.getItem("shahr_ara_token");
    if (!token) {
      setNotifications([]);
      return;
    }

    setNotificationsLoading(true);
    try {
      const data = await apiFetch<NotificationItem[]>("/api/v1/notifications", {
        headers: authHeaders(token),
      });
      setNotifications(data);
    } catch {
      // The badge is non-critical; the global 401 handler still logs out.
    } finally {
      setNotificationsLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (!authReady) return;
    // logout() already clears the list when the session ends.
    if (!currentUser) return;
    const t = setTimeout(() => void refreshNotifications(), 0);
    return () => clearTimeout(t);
  }, [authReady, currentUser, refreshNotifications]);

  const markNotificationRead = useCallback(
    async (id: string) => {
      const token =
        currentUser?.token ?? localStorage.getItem("shahr_ara_token");
      if (!token) return;

      const removed = notifications.find((n) => n.id === id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      try {
        await apiFetch(`/api/v1/notifications/${id}/read`, {
          method: "PUT",
          headers: authHeaders(token),
        });
      } catch (err) {
        if (removed) {
          setNotifications((prev) => [removed, ...prev]);
        }
        setApiError(apiErrorMessage(err, "علامت‌گذاری اعلان انجام نشد."));
      }
    },
    [currentUser, notifications],
  );

  const markAllNotificationsRead = useCallback(async () => {
    const token = currentUser?.token ?? localStorage.getItem("shahr_ara_token");
    if (!token) return;

    const previous = notifications;
    setNotifications([]);
    try {
      await apiFetch("/api/v1/notifications/read-all", {
        method: "PUT",
        headers: authHeaders(token),
      });
    } catch (err) {
      setNotifications(previous);
      setApiError(apiErrorMessage(err, "علامت‌گذاری اعلان‌ها انجام نشد."));
    }
  }, [currentUser, notifications]);

  const like = useCallback(
    async (id: string) => {
      const token =
        currentUser?.token ?? localStorage.getItem("shahr_ara_token");
      if (!token) return;

      // Optimistic toggle: cards and the report page should react instantly.
      // On failure the previous snapshot is restored and the error is shown.
      const snapshot = requestsRef.current.find((r) => r.id === id);
      if (snapshot) {
        setRequests((prev) =>
          prev.map((r) =>
            r.id === id
              ? {
                  ...r,
                  likedByCurrentUser: !r.likedByCurrentUser,
                  likes: r.likedByCurrentUser
                    ? Math.max(0, r.likes - 1)
                    : r.likes + 1,
                }
              : r,
          ),
        );
      }

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
        if (snapshot) {
          setRequests((prev) => prev.map((r) => (r.id === id ? snapshot : r)));
        }
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
      updateUser,
      logout,
      theme,
      setTheme,
      requests,
      stats,
      loading,
      loadError,
      apiError,
      dismissError: () => setApiError(null),
      refresh,
      notifications,
      notificationsLoading,
      refreshNotifications,
      markNotificationRead,
      markAllNotificationsRead,
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
      updateUser,
      logout,
      theme,
      setTheme,
      requests,
      stats,
      loading,
      loadError,
      apiError,
      refresh,
      notifications,
      notificationsLoading,
      refreshNotifications,
      markNotificationRead,
      markAllNotificationsRead,
      like,
      updateStatus,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
