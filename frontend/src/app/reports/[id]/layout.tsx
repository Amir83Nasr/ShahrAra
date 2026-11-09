import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "جزئیات گزارش",
  description:
    "مشاهدهٔ کامل یک گزارش یا ایدهٔ شهری، موقعیت روی نقشه و پاسخ رسمی شهرداری.",
};

export default function ReportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
