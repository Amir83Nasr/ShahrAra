import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import AppShell from "./app-shell";

export const metadata: Metadata = {
  title: "شهرآرا",
  description: "سامانه هوشمند ثبت و ارتقای مطالبات و ایده‌های مردمی",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body className="bg-background text-foreground min-h-screen">
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
