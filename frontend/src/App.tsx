/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import RequestForm from './components/RequestForm';
import ReportsDirectory from './components/ReportsDirectory';
import AdminPanel from './components/AdminPanel';
import AuthModal from './components/AuthModal';
import { User, RequestItem, RequestStatus, Stats } from './types';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export default function App() {
  const [currentTab, setTab] = useState<string>('home');
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
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

  // Sync theme changes with HTML classes — instant, no animation
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

  const fetchData = async () => {
    setLoading(true);
    try {
      const userParam = currentUser ? `?currentUserPhone=${currentUser.phone}` : '';
      const [requestsRes, statsRes] = await Promise.all([
        fetch(`/api/requests${userParam}`),
        fetch('/api/stats'),
      ]);

      if (requestsRes.ok && statsRes.ok) {
        const reqData = await requestsRes.json();
        const statData = await statsRes.json();
        setRequests(reqData);
        setStats(statData);
      }
    } catch (e) {
      console.error('Error fetching ShahrAra data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  // 2. Interaction Handlers
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('shahr_ara_user', JSON.stringify(user));

    // Auto toggle to admin tab if admin logs in
    if (user.isAdmin) {
      setTab('admin');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('shahr_ara_user');
    setTab('home');
  };

  const handleLike = async (id: string) => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/requests/${id}/like`, {
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
      const res = await fetch(`/api/requests/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, adminResponse }),
      });

      if (res.ok) {
        // Redraw lists
        fetchData();
      } else {
        throw new Error('فراخوانی آدرس با خطا مواجه شد.');
      }
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  return (
    <div
      className="flex min-h-screen flex-col justify-between bg-background text-foreground transition-colors duration-300"
      id="shahr_ara_app_root"
    >
      {/* Navbar segment */}
      <Navbar
        currentTab={currentTab}
        setTab={setTab}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenAuth={() => setIsAuthOpen(true)}
        theme={theme}
        toggleTheme={(newTheme) => {
          setTheme(newTheme);
        }}
      />

      {/* Main arena */}
      <main className="flex-1 pb-16">
        {loading && (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-cyan-600 dark:text-cyan-400">
            <span className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-600 border-t-transparent dark:border-cyan-400"></span>
            <span className="text-sm font-semibold">
              در حال بارگذاری اطلاعات شهرآرا...
            </span>
          </div>
        )}

        {!loading && (
          <>
            {currentTab === 'home' && (
              <div className="animate-fade-in space-y-12">
                <Hero
                  setTab={setTab}
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
                onRefresh={fetchData}
                theme={theme}
              />
            )}

            {currentTab === 'submit' && (
              <RequestForm
                currentUser={currentUser}
                onOpenAuth={() => setIsAuthOpen(true)}
                onSubmitSuccess={() => {
                  fetchData();
                  setTab('reports');
                }}
                theme={theme}
              />
            )}

            {currentTab === 'admin' && currentUser?.isAdmin && (
              <AdminPanel
                requests={requests}
                onUpdateStatus={handleUpdateStatus}
                onRefresh={fetchData}
                theme={theme}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-background text-muted-foreground border-t py-8 text-xs">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <span className="font-bold text-foreground">
              شهرآرا
            </span>
            <span className="text-muted-foreground/70">
              سامانه الکترونیکی ثبت و ارتقای مطالبات و ایده‌های مردمی
            </span>
          </div>

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={() => setTab('home')}>
              صفحه اصلی
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setTab('reports')}>
              گزارش‌ها
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (currentUser?.isAdmin) setTab('admin');
                else setIsAuthOpen(true);
              }}
            >
              پنل مدیریت شهری
            </Button>
          </div>

          <div
            className="text-muted-foreground/50 text-[10px]"
          >
            &copy; {new Date().getFullYear()} شهرآرا — سامانه هوشمند مشارکت مردمی. کلیه حقوق محفوظ است.
          </div>
        </div>
      </footer>

      {/* Auth Control Center */}
      <AuthModal
        open={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

    </div>
  );
}
