import type { Metadata } from "next";
import { SITE_TITLE_TEMPLATE } from "@/lib/site";

export const metadata: Metadata = {
  title: {
    default: "گزارش‌ها",
    template: SITE_TITLE_TEMPLATE,
  },
};

export default function ReportsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
