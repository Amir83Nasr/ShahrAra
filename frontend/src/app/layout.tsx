import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";
import AppShell from "./app-shell";
import PWARegister from "@/components/PWARegister";

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
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <head>
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
