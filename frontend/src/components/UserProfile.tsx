"use client";

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  ClipboardList,
  Edit,
  Heart,
  KeyRound,
  Loader2,
  LogOut,
  MapPin,
  Search,
  Shield,
  Trash2,
  UserRound,
} from "lucide-react";
import LogoutModal from "@/components/LogoutModal";
import { User, RequestItem, RequestUpdateData } from "../types";
import { toPersianDigits } from "../utils/numberUtils";
import { REGIONS } from "../utils/regionUtils";
import { filterRequests } from "../utils/requestFilters";
import {
  STATUS_LABELS,
  STATUS_BADGE_CLASS,
  TYPE_LABELS,
  TYPE_BADGE_CLASS,
} from "../utils/requestBadges";
import { cn } from "@/lib/utils";
import { invalidateCache } from "@/utils/apiCache";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Card,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogFooter,
} from "@/components/ui/responsive-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useApp } from "../app/providers";
import dynamic from "next/dynamic";

// leaflet touches `window` at import time; skip prerendering
const MapComponent = dynamic(() => import("./MapComponent"), { ssr: false });

interface UserProfileProps {
  currentUser: User;
  requests: RequestItem[];
  onLike: (id: string) => Promise<void>;
  onRefresh: () => void;
  theme?: "light" | "dark";
}

export default function UserProfile({
  currentUser,
  requests,
  onLike,
  onRefresh,
}: UserProfileProps) {
  const { loginSuccess, logout } = useApp();
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<string>("my");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterRegion, setFilterRegion] = useState<string>("all");
  const [editingRequest, setEditingRequest] = useState<RequestItem | null>(
    null,
  );
  const [deletingRequest, setDeletingRequest] = useState<RequestItem | null>(
    null,
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedDetails, setSelectedDetails] = useState<RequestItem | null>(
    null,
  );

  // Edit form state
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategory, setEditCategory] = useState("");

  // Security tab — set/change password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState<string | null>(null);

  const myRequests = useMemo(
    () => requests.filter((r) => r.userPhone === currentUser.phone),
    [requests, currentUser.phone],
  );
  const likedRequests = useMemo(
    () => requests.filter((r) => r.likedByCurrentUser),
    [requests],
  );

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError(null);
    setPwSuccess(null);

    if (newPassword.length < 8) {
      setPwError("رمز عبور جدید باید حداقل ۸ کاراکتر باشد.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError("رمز عبور جدید و تکرار آن یکسان نیستند.");
      return;
    }

    setPwSaving(true);
    try {
      const res = await fetch("/api/v1/auth/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentUser.token}`,
        },
        body: JSON.stringify({
          currentPassword: currentUser.hasPassword
            ? currentPassword || undefined
            : undefined,
          newPassword,
        }),
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          result.detail || "خطا در تنظیم رمز عبور. لطفا دوباره تلاش کنید.",
        );
      }
      // Refresh context/localStorage with the new hasPassword flag.
      loginSuccess({
        ...currentUser,
        ...result.user,
        token: currentUser.token,
      });
      setPwSuccess("رمز عبور با موفقیت ذخیره شد.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      setPwError(err instanceof Error ? err.message : "خطا در تنظیم رمز عبور.");
    } finally {
      setPwSaving(false);
    }
  };

  // Filtered list based on active tab + search/filter
  const filteredRequests = useMemo(() => {
    const source = activeSubTab === "my" ? myRequests : likedRequests;
    return filterRequests(source, {
      searchTerm,
      type: filterType,
      status: filterStatus,
      region: filterRegion,
    });
  }, [
    activeSubTab,
    myRequests,
    likedRequests,
    searchTerm,
    filterType,
    filterStatus,
    filterRegion,
  ]);

  // Open edit dialog
  const openEdit = (req: RequestItem) => {
    setEditingRequest(req);
    setEditTitle(req.title);
    setEditDescription(req.description);
    setEditCategory(req.category);
    setError(null);
    setSuccess(null);
  };

  // Handle edit save
  const handleEditSave = async () => {
    if (!editingRequest) return;
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (currentUser.token) {
        headers["Authorization"] = `Bearer ${currentUser.token}`;
      }

      const body: RequestUpdateData = {};
      if (editTitle !== editingRequest.title) body.title = editTitle;
      if (editDescription !== editingRequest.description)
        body.description = editDescription;
      if (editCategory !== editingRequest.category)
        body.category = editCategory;

      if (Object.keys(body).length === 0) {
        setEditingRequest(null);
        return;
      }

      const res = await fetch(`/api/v1/requests/${editingRequest.id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(body),
      });

      if (res.ok) {
        invalidateCache();
        onRefresh();
        setSuccess("درخواست با موفقیت ویرایش شد.");
        setTimeout(() => setEditingRequest(null), 800);
      } else {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "خطا در ویرایش درخواست.");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "خطا در ویرایش درخواست.");
    } finally {
      setSaving(false);
    }
  };

  // Handle like in details dialog
  const handleLikeClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedDetails((prev) =>
      prev && prev.id === id
        ? {
            ...prev,
            likedByCurrentUser: !prev.likedByCurrentUser,
            likes: prev.likedByCurrentUser
              ? Math.max(0, prev.likes - 1)
              : prev.likes + 1,
          }
        : prev,
    );
    onLike(id);
  };

  // Sync selectedDetails with fresh data
  const syncedDetails = useMemo(() => {
    if (!selectedDetails) return null;
    return requests.find((r) => r.id === selectedDetails.id) ?? selectedDetails;
  }, [requests, selectedDetails]);

  // Handle delete
  const handleDeleteConfirm = async () => {
    if (!deletingRequest) return;
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const headers: Record<string, string> = {};
      if (currentUser.token) {
        headers["Authorization"] = `Bearer ${currentUser.token}`;
      }

      const res = await fetch(`/api/v1/requests/${deletingRequest.id}`, {
        method: "DELETE",
        headers,
      });

      if (res.ok) {
        invalidateCache();
        onRefresh();
        setDeletingRequest(null);
        setSuccess("درخواست با موفقیت حذف شد.");
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "خطا در حذف درخواست.");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "خطا در حذف درخواست.");
    } finally {
      setSaving(false);
    }
  };

  const selectTab = (value: string) => {
    setActiveSubTab(value);
    setSearchTerm("");
    setFilterType("all");
    setFilterStatus("all");
    setFilterRegion("all");
    document
      .getElementById("profile-tabs")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* منوی حساب — فقط موبایل */}
      <div className="flex flex-col gap-4 md:hidden">
        {/* کارت کاربر */}
        <div className="bg-muted/60 flex items-center justify-between rounded-3xl px-5 py-4">
          <span className="bg-card flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full">
            <UserRound
              className="text-muted-foreground h-8 w-8"
              strokeWidth={1.5}
            />
          </span>
          <span className="flex flex-col items-start gap-1.5">
            <span className="flex items-center gap-2">
              <span className="text-foreground text-lg font-extrabold">
                {currentUser.firstName} {currentUser.lastName}
              </span>
              {currentUser.isAdmin && (
                <Badge className="bg-primary/15 text-primary rounded-full px-2.5 py-0.5 text-[11px] font-bold hover:bg-primary/15">
                  ادمین
                </Badge>
              )}
            </span>
            <span className="text-muted-foreground font-mono text-sm">
              {toPersianDigits(currentUser.phone)}
            </span>
          </span>
        </div>

        {/* مطالبات من */}
        <ProfileMenuCard
          title="مطالبات من"
          items={[
            {
              key: "my",
              label: "درخواست‌های من",
              sub: toPersianDigits(myRequests.length.toString()) + " درخواست",
              Icon: ClipboardList,
              active: activeSubTab === "my",
              onClick: () => selectTab("my"),
            },
            {
              key: "liked",
              label: "لایک کرده‌ام",
              sub:
                toPersianDigits(likedRequests.length.toString()) + " درخواست",
              Icon: Heart,
              active: activeSubTab === "liked",
              onClick: () => selectTab("liked"),
            },
          ]}
        />

        {/* حساب کاربری */}
        <ProfileMenuCard
          title="حساب کاربری"
          items={[
            {
              key: "security",
              label: "امنیت و رمز عبور",
              Icon: KeyRound,
              active: activeSubTab === "security",
              onClick: () => selectTab("security"),
            },
            ...(currentUser.isAdmin
              ? [
                  {
                    key: "admin",
                    label: "پنل مدیریت",
                    Icon: Shield,
                    href: "/admin" as const,
                  },
                ]
              : []),
          ]}
        />

        <button
          type="button"
          onClick={() => setConfirmLogout(true)}
          className="border-destructive/15 bg-card flex w-full cursor-pointer items-center justify-between rounded-3xl border px-5 py-3 shadow-sm"
        >
          <span className="text-destructive text-[15px] font-extrabold">
            خروج از حساب
          </span>
          <span className="bg-destructive/10 flex h-11 w-11 items-center justify-center rounded-2xl">
            <LogOut className="text-destructive h-5 w-5" strokeWidth={1.75} />
          </span>
        </button>
      </div>

      {/* Success / Error banners */}
      {success && (
        <Alert className="border-status-resolved/20 bg-status-resolved/10 text-status-resolved mb-4 text-sm">
          <CheckCircle />
          <AlertTitle>موفق</AlertTitle>
          <AlertDescription className="text-status-resolved/90 font-bold">
            {success}
          </AlertDescription>
        </Alert>
      )}
      {error && (
        <Alert variant="destructive" className="mb-4 text-sm">
          <AlertCircle />
          <AlertTitle>خطا</AlertTitle>
          <AlertDescription className="font-bold">{error}</AlertDescription>
        </Alert>
      )}

      {/* Tabs */}
      <Tabs
        id="profile-tabs"
        className="mt-6 scroll-mt-20 md:mt-0"
        dir="rtl"
        value={activeSubTab}
        onValueChange={(v) => {
          setActiveSubTab(v);
          setSearchTerm("");
          setFilterType("all");
          setFilterStatus("all");
        }}
      >
        <TabsList className="gap-x-2">
          <TabsTrigger value="my" className="flex-1 px-4 font-extrabold">
            <ClipboardList className="ml-1.5 h-4 w-4" />
            درخواست‌های من
          </TabsTrigger>
          <TabsTrigger value="liked" className="flex-1 px-4 font-extrabold">
            <Heart className="ml-1.5 h-4 w-4" />
            لایک کرده‌ام
          </TabsTrigger>
          <TabsTrigger value="security" className="flex-1 px-4 font-extrabold">
            <KeyRound className="ml-1.5 h-4 w-4" />
            امنیت
          </TabsTrigger>
        </TabsList>

        {/* Search & Filter bar */}
        <div className="bg-card mt-3 mb-6 flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center">
          <div className="relative w-full sm:flex-1">
            <Search className="text-muted-foreground absolute top-1/2 right-3 size-4 -translate-y-1/2" />
            <Input
              type="text"
              placeholder="جستجوی عنوان، توضیحات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-background pr-10"
            />
          </div>
          <div className="grid grid-cols-3 gap-3 sm:flex sm:gap-3">
            <Select
              dir="rtl"
              value={filterType}
              onValueChange={(v) => setFilterType(v)}
            >
              <SelectTrigger size="sm" className="w-full sm:w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" dir="rtl">
                <SelectGroup>
                  <SelectLabel>نوع درخواست</SelectLabel>
                  <SelectItem value="all">همه</SelectItem>
                  <SelectItem value="problem">مشکل شهری</SelectItem>
                  <SelectItem value="idea">ایده شهری</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <Select
              dir="rtl"
              value={filterStatus}
              onValueChange={(v) => setFilterStatus(v)}
            >
              <SelectTrigger size="sm" className="w-full sm:w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" align="end">
                <SelectGroup>
                  <SelectLabel>وضعیت</SelectLabel>
                  <SelectItem value="all">همه وضعیت‌ها</SelectItem>
                  <SelectItem value="submitted">ثبت شده</SelectItem>
                  <SelectItem value="under_review">در حال بررسی</SelectItem>
                  <SelectItem value="in_progress">در حال انجام</SelectItem>
                  <SelectItem value="resolved">حل شده</SelectItem>
                  <SelectItem value="archived">بایگانی شده</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <Select
              dir="rtl"
              value={filterRegion}
              onValueChange={setFilterRegion}
            >
              <SelectTrigger size="sm" className="w-full sm:w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" align="end">
                <SelectGroup>
                  <SelectLabel>منطقه</SelectLabel>
                  <SelectItem value="all">همه مناطق</SelectItem>
                  {REGIONS.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value="my" className="mt-0">
          <RequestGrid
            requests={filteredRequests}
            emptyMessage="هنوز درخواستی ثبت نکرده‌اید."
            activeSubTab={activeSubTab}
            selectedDetailsId={selectedDetails?.id ?? null}
            setSelectedDetails={setSelectedDetails}
            saving={saving}
            setDeletingRequest={setDeletingRequest}
            openEdit={openEdit}
            handleDeleteConfirm={handleDeleteConfirm}
          />
        </TabsContent>

        <TabsContent value="liked" className="mt-0">
          <RequestGrid
            requests={filteredRequests}
            emptyMessage="هنوز درخواستی را لایک نکرده‌اید."
            activeSubTab={activeSubTab}
            selectedDetailsId={selectedDetails?.id ?? null}
            setSelectedDetails={setSelectedDetails}
            saving={saving}
            setDeletingRequest={setDeletingRequest}
            openEdit={openEdit}
            handleDeleteConfirm={handleDeleteConfirm}
          />
        </TabsContent>

        <TabsContent value="security" className="mt-0">
          <Card className="mx-auto max-w-md">
            <CardContent className="flex flex-col gap-4">
              <div>
                <CardTitle className="flex items-center gap-2 text-sm font-extrabold">
                  <KeyRound className="text-primary h-4 w-4" />
                  رمز عبور حساب
                </CardTitle>
                <CardDescription className="mt-1 text-xs leading-relaxed">
                  {currentUser.hasPassword
                    ? "برای تغییر رمز، رمز فعلی را وارد کنید."
                    : "برای حساب خود رمز عبور تنظیم کنید تا علاوه بر کد پیامکی، با رمز هم وارد شوید."}
                </CardDescription>
              </div>

              {pwError && (
                <Alert variant="destructive" className="text-xs">
                  <AlertCircle />
                  <AlertTitle>خطا</AlertTitle>
                  <AlertDescription>{pwError}</AlertDescription>
                </Alert>
              )}

              {pwSuccess && (
                <Alert className="border-status-resolved/20 bg-status-resolved/10 text-status-resolved text-xs">
                  <CheckCircle />
                  <AlertTitle>موفق</AlertTitle>
                  <AlertDescription className="text-status-resolved/90">
                    {pwSuccess}
                  </AlertDescription>
                </Alert>
              )}

              <form
                onSubmit={handlePasswordSave}
                className="flex flex-col gap-3"
              >
                {currentUser.hasPassword && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-foreground text-xs font-extrabold">
                      رمز عبور فعلی <span className="text-destructive">*</span>
                    </label>
                    <Input
                      type="password"
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      dir="ltr"
                      autoComplete="current-password"
                    />
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  <label className="text-foreground text-xs font-extrabold">
                    رمز عبور جدید <span className="text-destructive">*</span>
                  </label>
                  <Input
                    type="password"
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    dir="ltr"
                    autoComplete="new-password"
                  />
                  <span className="text-muted-foreground text-[10.5px] font-bold">
                    حداقل ۸ کاراکتر
                  </span>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-foreground text-xs font-extrabold">
                    تکرار رمز عبور جدید{" "}
                    <span className="text-destructive">*</span>
                  </label>
                  <Input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    dir="ltr"
                    autoComplete="new-password"
                  />
                </div>

                <Button type="submit" disabled={pwSaving}>
                  {pwSaving ? "در حال ذخیره..." : "ذخیره رمز عبور"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <ResponsiveDialog
        open={!!editingRequest}
        onOpenChange={(o) => !o && setEditingRequest(null)}
      >
        <ResponsiveDialogContent className="max-w-lg">
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle className="text-lg font-extrabold">
              ویرایش درخواست
            </ResponsiveDialogTitle>
          </ResponsiveDialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-foreground text-xs font-extrabold">
                عنوان
              </label>
              <Input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                dir="rtl"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-foreground text-xs font-extrabold">
                توضیحات
              </label>
              <Textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                dir="rtl"
                rows={4}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-foreground text-xs font-extrabold">
                دسته‌بندی
              </label>
              <Input
                type="text"
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
                dir="rtl"
              />
            </div>
            {editingRequest && (
              <p className="text-muted-foreground text-xs">
                فقط درخواست‌های با وضعیت «ثبت شده» یا «در حال بررسی» قابل ویرایش
                هستند.
              </p>
            )}
          </div>
          <ResponsiveDialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEditingRequest(null)}>
              انصراف
            </Button>
            <Button onClick={handleEditSave} disabled={saving}>
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "ذخیره تغییرات"
              )}
            </Button>
          </ResponsiveDialogFooter>
        </ResponsiveDialogContent>
      </ResponsiveDialog>

      {/* Details Dialog */}
      <ResponsiveDialog
        open={!!selectedDetails}
        onOpenChange={(open) => !open && setSelectedDetails(null)}
      >
        <ResponsiveDialogContent className="max-sm:p-4 sm:max-w-xl">
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={
                  syncedDetails ? TYPE_BADGE_CLASS[syncedDetails.type] : ""
                }
              >
                {syncedDetails ? TYPE_LABELS[syncedDetails.type] : ""}
              </Badge>
              <Badge variant="outline" className="font-mono">
                {syncedDetails?.category}
              </Badge>
            </ResponsiveDialogTitle>
          </ResponsiveDialogHeader>

          <div className="space-y-6">
            <div>
              <h3 className="text-foreground text-lg leading-snug font-extrabold">
                {syncedDetails?.title}
              </h3>
              <span className="text-muted-foreground mt-1.5 block font-mono text-xs font-bold">
                منطقه: {toPersianDigits(syncedDetails?.region ?? "")} | وضعیت:{" "}
                {syncedDetails
                  ? (STATUS_LABELS[syncedDetails.status] ??
                    syncedDetails.status)
                  : ""}
              </span>
            </div>

            <p className="bg-muted text-foreground/70 rounded-xl border p-4 text-sm leading-relaxed font-semibold whitespace-pre-wrap">
              {syncedDetails?.description}
            </p>

            {syncedDetails?.adminResponse ? (
              <div className="border-primary/30 from-primary/10 to-primary/5 relative rounded-xl border bg-linear-to-br p-4">
                <div className="border-primary/20 bg-primary/10 text-primary absolute top-3 left-3 rounded border px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase">
                  پاسخ رسمی
                </div>
                <span className="text-primary mb-1 block text-xs font-extrabold">
                  پاسخ رسمی شهرداری منطقه:
                </span>
                <p className="text-foreground/70 text-xs leading-relaxed font-medium whitespace-pre-line">
                  {syncedDetails.adminResponse}
                </p>
              </div>
            ) : (
              <div className="bg-muted text-muted-foreground/70 rounded-xl border p-3.5 text-center text-xs font-bold">
                این گزارش برای اعزام اکیپ آماده‌سازی در صف رسیدگی واحد روابط
                عمومی شهرداری منطقه است.
              </div>
            )}

            <div className="space-y-1.5">
              <span className="text-foreground/70 flex items-center gap-1 text-xs font-bold">
                <MapPin className="text-primary h-4 w-4" />
                موقعیت فیزیکی روی نقشه شهر
              </span>
              <div className="h-50 overflow-hidden rounded-xl border">
                <MapComponent
                  pickerMode={false}
                  items={syncedDetails ? [syncedDetails] : []}
                />
              </div>
            </div>
          </div>

          <Separator />

          <ResponsiveDialogFooter className="flex flex-col-reverse items-stretch gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-muted-foreground order-last text-center font-mono text-[10px] font-bold sm:order-first">
              کد رهگیری: {toPersianDigits(syncedDetails?.id ?? "")}
            </span>

            <Button
              variant={
                currentUser && syncedDetails?.likedByCurrentUser
                  ? "destructive"
                  : "outline"
              }
              size="sm"
              className="w-full sm:w-auto"
              onClick={(e) =>
                syncedDetails && handleLikeClick(e, syncedDetails.id)
              }
            >
              <Heart
                className={cn(
                  "h-3.5 w-3.5",
                  currentUser &&
                    syncedDetails?.likedByCurrentUser &&
                    "fill-current",
                )}
              />
              <span>
                {toPersianDigits(syncedDetails?.likes ?? 0)} لایک و تأیید
                شهروندی
              </span>
            </Button>
          </ResponsiveDialogFooter>
        </ResponsiveDialogContent>
      </ResponsiveDialog>

      <LogoutModal
        open={confirmLogout}
        onOpenChange={setConfirmLogout}
        onConfirm={logout}
      />
    </div>
  );
}

// ── Profile Menu Card (mobile account menu) ────────────────────────────

interface ProfileMenuItem {
  key: string;
  label: string;
  sub?: string;
  // ponytail: no href variant except "/admin"; generalize when second link item arrives.
  href?: "/admin";
  Icon: typeof ClipboardList;
  active?: boolean;
  onClick?: () => void;
}

function ProfileMenuCard({
  title,
  items,
}: {
  title: string;
  items: ProfileMenuItem[];
}) {
  return (
    <div className="bg-card overflow-hidden rounded-3xl border shadow-sm">
      <div className="text-muted-foreground border-b px-5 py-3 text-start text-[13px]">
        {title}
      </div>
      <div className="divide-y divide-border/60">
        {items.map(({ key, label, sub, href, Icon, active, onClick }) => {
          const inner = (
            <>
              <span
                className={cn(
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl",
                  active ? "bg-primary/10" : "bg-muted",
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5",
                    active ? "text-primary" : "text-muted-foreground",
                  )}
                  strokeWidth={1.75}
                />
              </span>
              <span className="flex flex-1 flex-col items-start gap-0.5">
                <span className="text-foreground text-[15px] font-extrabold">
                  {label}
                </span>
                {sub && (
                  <span className="text-muted-foreground text-[11px] font-bold">
                    {sub}
                  </span>
                )}
              </span>
              <ChevronLeft className="text-muted-foreground/40 h-4 w-4 shrink-0" />
            </>
          );
          const cls =
            "flex w-full cursor-pointer items-center gap-3 px-5 py-3.5";
          return href ? (
            <Link key={key} href={href} className={cls}>
              {inner}
            </Link>
          ) : (
            <button key={key} type="button" onClick={onClick} className={cls}>
              {inner}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Request Grid Sub-Component ─────────────────────────────────────────

interface RequestGridProps {
  requests: RequestItem[];
  emptyMessage: string;
  activeSubTab: string;
  selectedDetailsId: string | null;
  setSelectedDetails: (r: RequestItem | null) => void;
  saving: boolean;
  setDeletingRequest: (r: RequestItem | null) => void;
  openEdit: (r: RequestItem) => void;
  handleDeleteConfirm: () => Promise<void>;
}

function RequestGrid({
  requests,
  emptyMessage,
  activeSubTab,
  selectedDetailsId,
  setSelectedDetails,
  saving,
  setDeletingRequest,
  openEdit,
  handleDeleteConfirm,
}: RequestGridProps) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {requests.length === 0 && (
        <div className="text-muted-foreground col-span-full py-16 text-center text-sm font-bold">
          {emptyMessage}
        </div>
      )}

      {requests.map((req) => (
        <Card
          key={req.id}
          className={cn(
            "report-card cursor-pointer overflow-hidden transition-all duration-300",
            "hover:shadow-sm",
            "border-border bg-card",
            selectedDetailsId === req.id &&
              "border-primary ring-primary/40 ring-2",
          )}
          onClick={() => setSelectedDetails(req)}
        >
          <CardContent className="flex flex-col gap-2.5 px-5">
            {/* Badge / Header row */}
            <div className="flex flex-wrap items-start justify-between gap-2">
              <Badge
                variant="outline"
                className={cn(
                  "border text-[10px] font-bold",
                  TYPE_BADGE_CLASS[req.type],
                )}
              >
                {TYPE_LABELS[req.type]}
              </Badge>
              <Badge
                variant="outline"
                className={cn(
                  "border text-[10px] font-bold",
                  STATUS_BADGE_CLASS[req.status],
                )}
              >
                {STATUS_LABELS[req.status] ?? req.status}
              </Badge>
            </div>

            {/* Title */}
            <CardTitle className="text-foreground line-clamp-1 cursor-pointer text-sm font-extrabold">
              {req.title}
            </CardTitle>

            {/* Description */}
            <CardDescription className="text-muted-foreground line-clamp-2 min-h-[2lh] text-xs leading-relaxed">
              {req.description}
            </CardDescription>

            {/* Footer */}
            <div className="text-muted-foreground flex items-center justify-between text-[10px]">
              <span className="font-bold">
                {toPersianDigits(
                  new Date(req.createdAt).toLocaleDateString("fa-IR"),
                )}
              </span>
              <div className="flex items-center gap-1">
                {activeSubTab === "my" &&
                  (req.status === "submitted" ||
                    req.status === "under_review") && (
                    <>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => openEdit(req)}
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>ویرایش</TooltipContent>
                      </Tooltip>
                      {req.status === "submitted" && (
                        <AlertDialog>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon-xs"
                                className="text-red-500 hover:text-red-600"
                                onClick={() => setDeletingRequest(req)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>حذف</TooltipContent>
                          </Tooltip>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>حذف درخواست</AlertDialogTitle>
                              <AlertDialogDescription>
                                آیا از حذف این درخواست اطمینان دارید؟ این اقدام
                                قابل بازگشت نیست.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel
                                onClick={() => setDeletingRequest(null)}
                              >
                                انصراف
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={handleDeleteConfirm}
                                className="bg-red-500 hover:bg-red-600"
                              >
                                {saving ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  "حذف شود"
                                )}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </>
                  )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
