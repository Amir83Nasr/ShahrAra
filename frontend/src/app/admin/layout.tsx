import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "پنل مدیریت",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
