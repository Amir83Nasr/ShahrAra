import type { Metadata, Viewport } from "next";
import ReactDOM from "react-dom";
import "./globals.css";
import { Providers } from "./providers";
import AppShell from "./app-shell";
import PWARegister from "@/components/PWARegister";
import {
  FONT_OPTIONS,
  FONT_STORAGE_KEY,
  LEGACY_FONT_VALUES,
} from "@/utils/fontUtils";

// Pre-hydration font restore: avoids a visible font swap for returning users.
// مقادیر قدیمی فونت‌ها هم به گزینه معتبر فعلی مهاجرت داده می‌شوند.
const LEGACY_FONT_MAP = Object.fromEntries(
  LEGACY_FONT_VALUES.map((value) => [value, "default"]),
);
const FONT_RESTORE_SCRIPT = `try{var s=localStorage.getItem(${JSON.stringify(
  FONT_STORAGE_KEY,
)}),m=${JSON.stringify(LEGACY_FONT_MAP)},f=m[s]||s;if(${JSON.stringify(
  FONT_OPTIONS.map((option) => option.value),
)}.indexOf(f)>-1){document.documentElement.dataset.font=f;if(f!==s)localStorage.setItem(${JSON.stringify(
  FONT_STORAGE_KEY,
)},f)}}catch(e){}`;

export const metadata: Metadata = {
  title: "شهرآرا",
  description: "سامانه هوشمند ثبت و ارتقای مطالبات و ایده‌های مردمی",
  applicationName: "Shahr Ara",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Shahr Ara",
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#11453a",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // پیش‌بارگذاری فونت‌های اصلی؛ React خودش تکراری‌ها را حذف و به head منتقل می‌کند.
  ReactDOM.preload("/assets/fonts/pelak/Pelak-Regular.woff2", {
    as: "font",
    type: "font/woff2",
    crossOrigin: "anonymous",
    fetchPriority: "high",
  });
  ReactDOM.preload("/assets/fonts/pelak/Pelak-Bold.woff2", {
    as: "font",
    type: "font/woff2",
    crossOrigin: "anonymous",
  });
  // وزن ۸۰۰ (ExtraBold) وزن اصلی تیترهای پروژه است.
  ReactDOM.preload("/assets/fonts/pelak/Pelak-ExtraBold.woff2", {
    as: "font",
    type: "font/woff2",
    crossOrigin: "anonymous",
  });

  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <head>
        {/* برگرداندن فونت انتخاب‌شده پیش از رندر، برای جلوگیری از پرش فونت */}
        <script dangerouslySetInnerHTML={{ __html: FONT_RESTORE_SCRIPT }} />
        {/* اسپلش اسکرین iOS — لوگوی سبز روی پس‌زمینه سفید */}
        <link
          rel="apple-touch-startup-image"
          href="/icons/splash-ios.png"
          media="(prefers-color-scheme: light)"
        />
      </head>
      <body className="bg-background text-foreground min-h-screen">
        <PWARegister />
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
