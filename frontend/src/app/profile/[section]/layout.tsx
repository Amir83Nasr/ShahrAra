import type { Metadata } from "next";

const SECTION_TITLES: Record<string, string> = {
  my: "درخواست‌های من",
  liked: "لایک‌شده‌ها",
  settings: "تنظیمات",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ section: string }>;
}): Promise<Metadata> {
  const { section } = await params;

  return {
    title: SECTION_TITLES[section] ?? "حساب کاربری",
  };
}

export default function ProfileSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
