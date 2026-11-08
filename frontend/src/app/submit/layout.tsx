import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ثبت گزارش یا ایده",
};

export default function SubmitLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
