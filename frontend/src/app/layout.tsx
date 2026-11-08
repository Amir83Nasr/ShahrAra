import type { Metadata, Viewport } from "next";
import ReactDOM from "react-dom";
import "./globals.css";
import { Providers } from "./providers";
import AppShell from "./app-shell";
import PWARegister from "@/components/PWARegister";

export const metadata: Metadata = {
  title: "شهرآرا",
  description: "سامانه هوشمند ثبت و ارتقای مطالبات و ایده‌های مردمی",
  applicationName: "شهرآرا",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icons/icon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      {
        url: "/icons/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    shortcut: "/icons/icon-192.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "شهرآرا",
  },
};

export const viewport: Viewport = {
  // رنگ نوار مرورگر/PWA؛ مقدار واقعی هنگام سوییچ تم در providers به‌روز می‌شود.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafd" },
    { media: "(prefers-color-scheme: dark)", color: "#151f29" },
  ],
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
      <body className="bg-background text-foreground min-h-screen">
        <PWARegister />
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
