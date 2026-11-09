"use client";

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from "react";

// 生前为 نسخهٔ منتشرشده ثبت می‌شود. در dev ثبت نمی‌کنیم: کش سرویس‌ورکر
// استریم‌های RSC و چانک‌های Turbopack قدیمی را بازپخش می‌کند و باعث خطاهای
// غیرواقعی hydration/flight (مثل enqueueModel is not a function) می‌شود.
export default function PWARegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    if (process.env.NODE_ENV === "production") {
      const register = () =>
        navigator.serviceWorker.register("/sw.js").catch(() => {
          // SW is a progressive enhancement; ignore failures silently.
        });

      window.addEventListener("load", register);
      return () => window.removeEventListener("load", register);
    }

    // در dev هر SW ثبت‌شده از اجراهای قبلی را حذف می‌کنیم تا بازپخش کش‌های
    // قدیمی (RSC/چانک‌های Turbopack) اتفاق نیفتد.
    navigator.serviceWorker
      .getRegistrations()
      .then((registrations) =>
        Promise.all([
          caches
            .keys()
            .then((keys) =>
              keys.forEach((key) => caches.delete(key)),
            ),
          Promise.all(registrations.map((r) => r.unregister())),
        ]),
      )
      .catch(() => {
        // Ignore; dev-only cleanup.
      });
  }, []);

  return null;
}
