"use client";

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  ChevronRight,
  Heart,
  MapPin,
  MessageSquare,
  UserRound,
} from "lucide-react";
import { RequestItem, User } from "../types";
import { toPersianDigits } from "../utils/numberUtils";
import {
  STATUS_BADGE_CLASS,
  STATUS_LABELS,
  TYPE_BADGE_CLASS,
  TYPE_LABELS,
} from "../utils/requestBadges";
import { formatPersian } from "../utils/persianDate";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { MapSkeleton } from "@/components/skeletons";

// maplibre-gl touches `window` at import time; skip prerendering
const MapComponent = dynamic(() => import("./MapComponent"), {
  ssr: false,
  loading: () => <MapSkeleton />,
});

interface ReportDetailProps {
  item: RequestItem;
  currentUser: User | null;
  onLike: (id: string) => Promise<void>;
  theme?: "light" | "dark";
}

/**
 * Full-page view of a single report. List cards lead here directly and map
 * markers link here from their preview, so every report gets its own URL,
 * room for future sections, and a stable target for notifications.
 */
export default function ReportDetail({
  item,
  currentUser,
  onLike,
  theme = "light",
}: ReportDetailProps) {
  const router = useRouter();
  const liked = !!item.likedByCurrentUser;

  const handleLike = () => {
    if (!currentUser) {
      router.push("/login");
      return;
    }
    void onLike(item.id);
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-5 sm:px-6 sm:py-8">
      {/* Back + tracking code */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Button
          asChild
          variant="outline"
          className="h-9 gap-1.5 rounded-full px-3.5 text-xs font-bold"
        >
          <Link href="/reports">
            <ChevronRight className="size-4" />
            بازگشت به گزارش‌ها
          </Link>
        </Button>
        <span className="text-muted-foreground font-mono text-[11px] font-bold">
          کد رهگیری: {toPersianDigits(item.id)}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3 lg:items-start">
        {/* Main content */}
        <div className="flex flex-col gap-4 lg:col-span-2">
          <Card>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  className={cn("font-semibold", TYPE_BADGE_CLASS[item.type])}
                >
                  {TYPE_LABELS[item.type]}
                </Badge>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs font-semibold",
                    STATUS_BADGE_CLASS[item.status],
                  )}
                >
                  {STATUS_LABELS[item.status] ?? item.status}
                </Badge>
                <Badge variant="outline" className="font-mono">
                  {item.category}
                </Badge>
              </div>

              <h1 className="text-foreground text-xl leading-snug font-extrabold sm:text-2xl">
                {item.title}
              </h1>

              <div className="text-muted-foreground flex flex-wrap items-center gap-x-5 gap-y-2 border-y py-3 text-[11px] font-bold">
                <span className="flex items-center gap-1.5">
                  <MapPin className="size-3.5 shrink-0" />
                  {toPersianDigits(item.region)}
                </span>
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="size-3.5 shrink-0" />
                  {toPersianDigits(formatPersian(item.createdAt, "yyyy/MM/dd"))}
                </span>
                <span className="flex items-center gap-1.5">
                  <UserRound className="size-3.5 shrink-0" />
                  {item.userName}
                </span>
              </div>

              <p className="text-foreground/80 text-sm leading-relaxed font-medium whitespace-pre-wrap">
                {item.description}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex flex-col gap-3">
              <CardTitle className="flex items-center gap-2 text-sm font-extrabold">
                <MessageSquare className="text-primary size-4" />
                پاسخ رسمی شهرداری
              </CardTitle>

              {item.adminResponse ? (
                <div className="border-primary/30 from-primary/10 to-primary/5 rounded-2xl border bg-gradient-to-br p-4">
                  <p className="text-foreground/75 text-xs leading-relaxed font-medium whitespace-pre-line">
                    {item.adminResponse}
                  </p>
                </div>
              ) : (
                <p className="bg-muted text-muted-foreground rounded-2xl border p-3.5 text-center text-xs font-bold">
                  این گزارش برای بررسی و اعزام اکیپ در صف رسیدگی واحد روابط
                  عمومی شهرداری منطقه است.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar: location + support */}
        <aside className="flex flex-col gap-4">
          <Card>
            <CardContent className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-sm font-extrabold">
                  موقعیت روی نقشه
                </CardTitle>
                <Badge variant="outline" className="text-[10px] font-bold">
                  {toPersianDigits(item.region)}
                </Badge>
              </div>
              <div className="h-56 overflow-hidden rounded-xl border">
                <MapComponent pickerMode={false} items={[item]} theme={theme} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-sm font-extrabold">
                  حمایت شهروندی
                </CardTitle>
                <span className="text-foreground font-mono text-lg font-extrabold">
                  {toPersianDigits(item.likes)}
                </span>
              </div>
              <Button
                variant={liked ? "destructive-soft" : "outline"}
                onClick={handleLike}
                className="w-full"
              >
                <Heart className={cn(liked && "fill-current")} />
                {liked ? "حمایت کرده‌اید" : "حمایت از این گزارش"}
              </Button>
              <p className="text-muted-foreground text-center text-[10px] font-semibold">
                {currentUser
                  ? "حمایت شما به دیده‌شدن این گزارش کمک می‌کند."
                  : "برای ثبت حمایت وارد حساب کاربری شوید."}
              </p>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
