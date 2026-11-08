import type { Metadata } from "next";
import { SITE_TITLE_TEMPLATE } from "@/lib/site";

export const metadata: Metadata = {
  title: {
    default: "حساب کاربری",
    template: SITE_TITLE_TEMPLATE,
  },
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
