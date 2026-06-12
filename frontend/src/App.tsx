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
import StatsSection from './components/StatsSection';
import AuthModal from './components/AuthModal';
import { User, RequestItem, RequestStatus, Stats } from './types';

export default function App() {
  const [currentTab, setTab] = useState<string>('home');
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

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

  // Sync theme changes with HTML classes
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

  // 1. Initial State Load
  useEffect(() => {
    // Restore User session
    const saved = localStorage.getItem('shahr_ara_user');
    if (saved) {
      try {
        setCurrentUser(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved user', e);
      }
    }

    // Load initial data from Express API
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [requestsRes, statsRes] = await Promise.all([
        fetch('/api/requests'),
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
        // Optimistic local state update to prevent latency
        const updatedReq = await res.json();
        if (updatedReq.success) {
          // Re-fetch to synchronize all counts smoothly
          fetchData();
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
      className="min-h-screen bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-zinc-100 flex flex-col justify-between transition-colors duration-350"
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
        toggleTheme={() =>
          setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
        }
      />

      {/* Main arena */}
      <main className="flex-1 pb-16">
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 text-cyan-600 dark:text-cyan-400 gap-3">
            <span className="w-10 h-10 border-4 border-cyan-600 dark:border-cyan-400 border-t-transparent rounded-full animate-spin"></span>
            <span className="text-sm font-semibold">
              در حال بارگذاری اطلاعات شهرآرا...
            </span>
          </div>
        )}

        {!loading && (
          <>
            {currentTab === 'home' && (
              <div className="space-y-12 animate-fade-in">
                <Hero
                  setTab={setTab}
                  currentUser={currentUser}
                  onOpenAuth={() => setIsAuthOpen(true)}
                  stats={stats}
                  theme={theme}
                />

                {/* Visual Stats Section */}
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 border-t border-slate-200 dark:border-zinc-800/60 pt-12">
                  <div className="mb-6 text-right">
                    <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 font-mono block">
                      ANALYTICS PANEL
                    </span>
                    <h3 className="text-xl font-extrabold text-slate-800 dark:text-white">
                      آمار پایش مشارکت شهروندی تهران
                    </h3>
                  </div>
                  <StatsSection stats={stats} />
                </div>
              </div>
            )}

            {currentTab === 'reports' && (
              <ReportsDirectory
                items={requests}
                currentUser={currentUser}
                onLike={handleLike}
                onOpenAuth={() => setIsAuthOpen(true)}
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

      {/* Footer (Theodorus Clarence style - minimal, crisp) */}
      <footer className="border-t border-slate-200 dark:border-zinc-800/60 bg-white dark:bg-[#070b13] py-8 text-slate-500 text-xs transition-colors">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-cyan-600 dark:text-cyan-200">
              شهرآرا
            </span>
            <span className="text-slate-300 dark:text-slate-600">|</span>
            <span className="text-slate-650 dark:text-slate-400">
              سامانه الکترونیکی ثبت و ارتقای مطالبات و ایده‌های مردمی
            </span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="#shahr_ara_app_root"
              className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
              onClick={(e) => {
                e.preventDefault();
                setTab('home');
              }}
            >
              صفحه اصلی
            </a>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <a
              href="#shahr_ara_app_root"
              className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
              onClick={(e) => {
                e.preventDefault();
                setTab('reports');
              }}
            >
              گزارش‌ها
            </a>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <button
              onClick={() => {
                if (currentUser?.isAdmin) setTab('admin');
                else setIsAuthOpen(true);
              }}
              className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
            >
              پنل مدیریت شهری
            </button>
          </div>

          <div
            className="text-[10px] text-slate-400 dark:text-slate-600 font-mono"
            dir="ltr"
          >
            &copy; {new Date().getFullYear()} ShahrAra Municipal Engine. All
            rights reserved.
          </div>
        </div>
      </footer>

      {/* Auth Control Center */}
      {isAuthOpen && (
        <AuthModal
          onClose={() => setIsAuthOpen(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      )}
    </div>
  );
}
