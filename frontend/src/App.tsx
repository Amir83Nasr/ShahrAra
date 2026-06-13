import { useState, useEffect } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import RequestForm from './components/RequestForm';
import ReportsDirectory from './components/ReportsDirectory';
import AdminPanel from './components/AdminPanel';
import AuthModal from './components/AuthModal';
import { User, RequestItem, RequestStatus, Stats } from './types';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Home, FileText } from 'lucide-react';
import {
  getCachedData,
  setCachedData,
  invalidateCache,
} from '@/utils/apiCache';

const REQ_CACHE_KEY = 'requests';
const STATS_CACHE_KEY = 'stats';

const VALID_TABS = ['home', 'reports', 'submit', 'admin'];

export default function App() {
  const [currentTab, setTab] = useState<string>('home');
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('shahr_ara_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('shahr_ara_theme');
    return (saved as 'light' | 'dark') || 'light';
  });

  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [stats, setStats] = useState<Stats>({
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
  });

  const [loading, setLoading] = useState<boolean>(true);

  const safeSetTab = (tab: string) => {
    if (tab === 'admin' && !currentUser?.isAdmin) {
      setApiError('دسترسی به پنل مدیریت نیازمند ورود با حساب کاربری مدیر است.');
      return;
    }
    if (!VALID_TABS.includes(tab)) {
      setTab('not-found');
      return;
    }
    setTab(tab);
  };

  useEffect(() => {
    localStorage.setItem('shahr_ara_theme', theme);
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      root.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  }, [theme]);

  const fetchData = async (options?: { force?: boolean; silent?: boolean }) => {
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
        : '';
      const [requestsRes, statsRes] = await Promise.all([
        fetch(`/api/v1/requests${userParam}`),
        fetch('/api/v1/stats'),
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
          'در دریافت اطلاعات از سرور مشکلی پیش آمد. لطفاً بعداً تلاش کنید.',
        );
      }
    } catch (e) {
      console.error('Error fetching ShahrAra data:', e);
      setApiError(
        'ارتباط با سرور برقرار نشد. از اتصال اینترنت خود مطمئن شوید.',
      );
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        await fetchData();
      } catch {
        // errors handled inside fetchData
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('shahr_ara_user', JSON.stringify(user));
    invalidateCache();
    if (user.isAdmin) {
      safeSetTab('admin');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('shahr_ara_user');
    invalidateCache();
    safeSetTab('home');
  };

  const handleLike = async (id: string) => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/v1/requests/${id}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userPhone: currentUser.phone }),
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
    } catch (e) {
      console.error('Failed to trigger like request', e);
    }
  };

  const handleUpdateStatus = async (
    id: string,
    status: RequestStatus,
    adminResponse: string,
  ) => {
    try {
      const res = await fetch(`/api/v1/requests/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, adminResponse }),
      });

      if (res.ok) {
        invalidateCache();
        await fetchData({ force: true, silent: true });
      } else {
        throw new Error('فراخوانی آدرس با خطا مواجه شد.');
      }
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  const handleRefresh = () => fetchData({ force: true });

  const handleSubmitSuccess = () => {
    invalidateCache();
    fetchData({ silent: true });
    safeSetTab('reports');
  };

  return (
    <div
      className="bg-background text-foreground relative z-0 flex min-h-screen flex-col justify-between transition-colors duration-300"
      id="shahr_ara_app_root"
    >
      <Navbar
        currentTab={currentTab}
        setTab={safeSetTab}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenAuth={() => setIsAuthOpen(true)}
        theme={theme}
        toggleTheme={(newTheme) => {
          setTheme(newTheme);
        }}
      />

      <main className="flex-1 pb-16">
        {/* API / Auth Error Banner */}
        {apiError && (
          <div className="mx-auto flex max-w-7xl items-start gap-3 px-4 pt-4 sm:px-6 lg:px-8">
            <div className="border-destructive/20 bg-destructive/10 flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-sm">
              <AlertTriangle className="text-destructive mt-0.5 h-4 w-4 shrink-0" />
              <p className="text-destructive flex-1 leading-relaxed font-medium">
                {apiError}
              </p>
              <button
                onClick={() => setApiError(null)}
                className="text-destructive/60 hover:text-destructive shrink-0 cursor-pointer text-xs font-bold transition-colors"
              >
                بستن
              </button>
            </div>
          </div>
        )}

        <ErrorBoundary>
          {loading && (
            <div className="text-primary flex flex-col items-center justify-center gap-3 py-20">
              <span className="border-primary h-10 w-10 animate-spin rounded-full border-4 border-t-transparent"></span>
              <span className="text-sm font-semibold">
                در حال بارگذاری اطلاعات شهرآرا...
              </span>
            </div>
          )}

          {!loading && (
            <div>
              {currentTab === 'home' && (
                <div className="space-y-12">
                  <Hero
                    setTab={safeSetTab}
                    currentUser={currentUser}
                    onOpenAuth={() => setIsAuthOpen(true)}
                    stats={stats}
                  />
                </div>
              )}

              {currentTab === 'reports' && (
                <ReportsDirectory
                  items={requests}
                  currentUser={currentUser}
                  onLike={handleLike}
                  onOpenAuth={() => setIsAuthOpen(true)}
                  onRefresh={handleRefresh}
                  theme={theme}
                />
              )}

              {currentTab === 'submit' && (
                <RequestForm
                  currentUser={currentUser}
                  onOpenAuth={() => setIsAuthOpen(true)}
                  onSubmitSuccess={handleSubmitSuccess}
                  theme={theme}
                />
              )}

              {currentTab === 'admin' && currentUser?.isAdmin && (
                <AdminPanel
                  requests={requests}
                  onUpdateStatus={handleUpdateStatus}
                  onRefresh={handleRefresh}
                  theme={theme}
                />
              )}

              {currentTab === 'not-found' && (
                <div className="mx-auto flex max-w-md flex-col items-center justify-center gap-6 px-4 py-24 text-center">
                  <div className="border-border bg-card flex h-20 w-20 items-center justify-center rounded-full border">
                    <FileText className="text-muted-foreground h-10 w-10" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-foreground text-2xl font-extrabold">
                      صفحه مورد نظر یافت نشد
                    </h2>
                    <p className="text-muted-foreground text-sm leading-relaxed font-medium">
                      صفحه‌ای که به دنبال آن هستید وجود ندارد یا به آدرس دیگری
                      منتقل شده است.
                    </p>
                  </div>
                  <Button
                    onClick={() => safeSetTab('home')}
                    size="lg"
                    className="font-bold"
                  >
                    <Home className="h-4 w-4" />
                    بازگشت به صفحه اصلی
                  </Button>
                </div>
              )}
            </div>
          )}
        </ErrorBoundary>
      </main>

      <footer className="bg-background/90 text-muted-foreground border-t py-6 text-xs backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <span className="text-foreground font-bold">شهرآرا</span>
            <span className="text-muted-foreground/70">
              سامانه الکترونیکی ثبت و ارتقای مطالبات و ایده‌های مردمی
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => safeSetTab('home')}
            >
              صفحه اصلی
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => safeSetTab('reports')}
            >
              گزارش‌ها
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (currentUser?.isAdmin) safeSetTab('admin');
                else setIsAuthOpen(true);
              }}
            >
              پنل مدیریت شهری
            </Button>
          </div>

          <div className="text-muted-foreground/50 text-[10px]">
            &copy; {new Date().getFullYear()} شهرآرا — سامانه هوشمند مشارکت
            مردمی. کلیه حقوق محفوظ است.
          </div>
        </div>
      </footer>

      <AuthModal
        open={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}
