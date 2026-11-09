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
  ChevronRight,
  ClipboardList,
  Edit,
  Heart,
  KeyRound,
  Loader2,
  LogOut,
  Moon,
  Search,
  Settings,
  Shield,
  Sun,
  Trash2,
  UserRound,
} from "lucide-react";
import LogoutModal from "@/components/LogoutModal";
import ProfileAvatar from "@/components/ProfileAvatar";
import { User, RequestItem, RequestUpdateData } from "../types";
import { apiErrorMessage, apiFetch, authHeaders } from "@/lib/api";
import { toPersianDigits } from "../utils/numberUtils";
import { REGIONS } from "../utils/regionUtils";
import { filterRequests } from "../utils/requestFilters";
import {
  STATUS_LABELS,
  STATUS_ORDER,
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
  AlertDialogTrigger,
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { LoadErrorState, ReportCardsSkeleton } from "@/components/skeletons";
import { useApp } from "../app/providers";

const SECTION_TITLES: Record<string, string> = {
  my: "درخواست‌های من",
  liked: "لایک‌شده‌ها",
  settings: "تنظیمات",
};

interface UserProfileProps {
  currentUser: User;
  requests: RequestItem[];
  onRefresh: () => void;
  theme?: "light" | "dark";
  /** Active section when rendered on a dedicated /profile/[section] page. */
  section?: "my" | "liked" | "settings";
}

export default function UserProfile({
  currentUser,
  requests,
  onRefresh,
  section,
}: UserProfileProps) {
  const {
    loginSuccess,
    logout,
    loading: dataLoading,
    loadError,
    theme,
    setTheme,
    updateUser,
  } = useApp();
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<string>(section ?? "my");
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

  // Settings — profile details and avatar
  const [firstNameInput, setFirstNameInput] = useState(currentUser.firstName);
  const [lastNameInput, setLastNameInput] = useState(currentUser.lastName);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [avatarRemoving, setAvatarRemoving] = useState(false);
  const [confirmAvatarRemove, setConfirmAvatarRemove] = useState(false);

  const myRequests = useMemo(
    () =>
      requests.filter((r) => r.isOwner ?? r.userPhone === currentUser.phone),
    [requests, currentUser.phone],
  );
  const likedRequests = useMemo(
    () => requests.filter((r) => r.likedByCurrentUser),
    [requests],
  );

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setProfileSuccess(null);

    const firstName = firstNameInput.trim();
    const lastName = lastNameInput.trim();
    if (!firstName || !lastName) {
      setProfileError("نام و نام خانوادگی را کامل وارد کنید.");
      return;
    }

    setProfileSaving(true);
    try {
      const result = await apiFetch<{ success: boolean; user: User }>(
        "/api/v1/auth/profile",
        {
          method: "PUT",
          headers: authHeaders(currentUser.token, true),
          body: JSON.stringify({ firstName, lastName }),
        },
      );
      updateUser(result.user);
      setProfileSuccess("مشخصات حساب ذخیره شد.");
      setTimeout(() => setProfileSuccess(null), 3000);
    } catch (err: unknown) {
      setProfileError(apiErrorMessage(err, "ذخیره مشخصات حساب انجام نشد."));
    } finally {
      setProfileSaving(false);
    }
  };

  const handleAvatarRemove = async () => {
    if (!currentUser.avatarUrl || avatarRemoving) return;
    setProfileError(null);
    setProfileSuccess(null);
    setAvatarRemoving(true);
    try {
      const result = await apiFetch<{ success: boolean; user: User }>(
        "/api/v1/auth/avatar",
        {
          method: "DELETE",
          headers: authHeaders(currentUser.token),
        },
      );
      updateUser(result.user);
      setProfileSuccess("تصویر پروفایل حذف شد.");
      setTimeout(() => setProfileSuccess(null), 3000);
    } catch (err: unknown) {
      setProfileError(apiErrorMessage(err, "حذف تصویر پروفایل انجام نشد."));
    } finally {
      setAvatarRemoving(false);
      setConfirmAvatarRemove(false);
    }
  };

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
      const result = await apiFetch<{ success: boolean; user: User }>(
        "/api/v1/auth/password",
        {
          method: "PUT",
          headers: authHeaders(currentUser.token, true),
          body: JSON.stringify({
            currentPassword: currentUser.hasPassword
              ? currentPassword || undefined
              : undefined,
            newPassword,
          }),
        },
      );
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
      setPwError(apiErrorMessage(err, "خطا در تنظیم رمز عبور."));
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

  // Skeleton only before any request data exists; refreshes keep the list.
  const isInitialLoading = dataLoading && requests.length === 0;

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

      await apiFetch(`/api/v1/requests/${editingRequest.id}`, {
        method: "PUT",
        headers: authHeaders(currentUser.token, true),
        body: JSON.stringify(body),
      });

      invalidateCache();
      onRefresh();
      setSuccess("درخواست با موفقیت ویرایش شد.");
      setTimeout(() => setEditingRequest(null), 800);
    } catch (err: unknown) {
      setError(apiErrorMessage(err, "خطا در ویرایش درخواست."));
    } finally {
      setSaving(false);
    }
  };

  // Handle delete
  const handleDeleteConfirm = async () => {
    if (!deletingRequest) return;
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await apiFetch(`/api/v1/requests/${deletingRequest.id}`, {
        method: "DELETE",
        headers: authHeaders(currentUser.token),
      });

      invalidateCache();
      onRefresh();
      setDeletingRequest(null);
      setSuccess("درخواست با موفقیت حذف شد.");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: unknown) {
      setError(apiErrorMessage(err, "خطا در حذف درخواست."));
    } finally {
      setSaving(false);
    }
  };

  // Dedicated section page: back link + heading instead of the mobile menu.
  const isSectionPage = section !== undefined;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* بخش‌های پروفایل — فقط موبایل (در صفحه /profile) */}
      {!isSectionPage && (
        <div className="flex flex-col gap-3 md:hidden">
          {/* کارت کاربر */}
          <div className="bg-card overflow-hidden rounded-2xl border">
            <div className="flex items-center gap-3.5 px-4 py-3.5">
              <ProfileAvatar user={currentUser} size={60} />
              <div className="flex min-w-0 flex-1 flex-col items-start gap-1">
                <span className="text-foreground flex max-w-full items-center gap-2 text-[15px] font-extrabold">
                  <span className="truncate">
                    {currentUser.firstName} {currentUser.lastName}
                  </span>
                  {currentUser.isAdmin && (
                    <Badge className="bg-primary/15 text-primary hover:bg-primary/15 shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold">
                      ادمین
                    </Badge>
                  )}
                </span>
                <span className="text-muted-foreground font-mono text-[11px] font-semibold">
                  {toPersianDigits(currentUser.phone)}
                </span>
              </div>
            </div>
          </div>

          {/* مطالبات من */}
          <ProfileMenuCard
            title="مطالبات من"
            items={[
              {
                key: "my",
                label: "درخواست‌های من",
                Icon: ClipboardList,
                href: "/profile/my",
              },
              {
                key: "liked",
                label: "لایک‌شده‌ها",
                Icon: Heart,
                href: "/profile/liked",
              },
            ]}
          />

          {/* تنظیمات */}
          <ProfileMenuCard
            title="تنظیمات"
            items={[
              {
                key: "settings",
                label: "تنظیمات حساب",
                Icon: Settings,
                href: "/profile/settings",
              },
              ...(currentUser.isAdmin
                ? [
                    {
                      key: "admin",
                      label: "پنل مدیریت",
                      Icon: Shield,
                      href: "/admin",
                    },
                  ]
                : []),
            ]}
          />

          <button
            type="button"
            onClick={(e) => {
              e.currentTarget.blur();
              setConfirmLogout(true);
            }}
            className="border-destructive/15 bg-card flex w-full cursor-pointer items-center gap-3 rounded-2xl border px-4 py-2.5 transition duration-150 ease-out active:translate-y-px active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:translate-y-0 motion-reduce:active:scale-100"
          >
            <span className="bg-destructive/10 flex size-9 shrink-0 items-center justify-center rounded-full">
              <LogOut
                className="text-destructive h-4.5 w-4.5"
                strokeWidth={1.75}
              />
            </span>
            <span className="text-destructive flex-1 text-start text-sm font-semibold">
              خروج از حساب
            </span>
            <ChevronLeft className="text-destructive/60 h-4 w-4 shrink-0" />
          </button>
        </div>
      )}

      {/* Success / Error banners */}
      {success && (
        <Alert className="border-status-resolved/20 bg-status-resolved/10 text-status-resolved mb-4 text-sm">
          <CheckCircle />
          <AlertTitle>موفق</AlertTitle>
          <AlertDescription className="text-status-resolved/90 font-semibold">
            {success}
          </AlertDescription>
        </Alert>
      )}
      {error && (
        <Alert variant="destructive" className="mb-4 text-sm">
          <AlertCircle />
          <AlertTitle>خطا</AlertTitle>
          <AlertDescription className="font-semibold">{error}</AlertDescription>
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
        {isSectionPage && (
          <div className="mb-4 flex items-center gap-3">
            <Button asChild variant="outline" size="icon" aria-label="بازگشت">
              <Link href="/profile">
                <ChevronRight />
              </Link>
            </Button>
            <h2 className="text-foreground text-lg font-bold">
              {SECTION_TITLES[section]}
            </h2>
          </div>
        )}
        <TabsList className="hidden gap-x-2 md:flex">
          <TabsTrigger value="my" className="flex-1 px-4 font-bold">
            <ClipboardList className="ml-1.5 h-4 w-4" />
            درخواست‌های من
          </TabsTrigger>
          <TabsTrigger value="liked" className="flex-1 px-4 font-bold">
            <Heart className="ml-1.5 h-4 w-4" />
            لایک‌شده‌ها
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex-1 px-4 font-bold">
            <Settings className="ml-1.5 h-4 w-4" />
            تنظیمات
          </TabsTrigger>
        </TabsList>

        {/* Search & Filter bar — visible only on my/liked tabs */}
        {activeSubTab !== "settings" && (
          <div
            className={cn(
              "bg-card mt-3 mb-6 flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center",
              !isSectionPage && "hidden md:flex",
            )}
          >
            <div className="relative w-full sm:flex-1">
              <Search className="text-muted-foreground absolute top-1/2 right-3 size-4 -translate-y-1/2" />
              <Input
                type="text"
                placeholder="جستجوی عنوان، توضیحات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-11 rounded-full pr-10"
              />
            </div>
            <div className="grid grid-cols-3 gap-3 sm:flex sm:gap-3">
              <Select
                dir="rtl"
                value={filterType}
                onValueChange={(v) => setFilterType(v)}
              >
                <SelectTrigger className="w-full sm:w-32">
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
                <SelectTrigger className="w-full sm:w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper" align="end">
                  <SelectGroup>
                    <SelectLabel>وضعیت</SelectLabel>
                    <SelectItem value="all">همه وضعیت‌ها</SelectItem>
                    {STATUS_ORDER.map((status) => (
                      <SelectItem key={status} value={status}>
                        {STATUS_LABELS[status]}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Select
                dir="rtl"
                value={filterRegion}
                onValueChange={setFilterRegion}
              >
                <SelectTrigger className="w-full sm:w-32">
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
        )}

        <TabsContent
          value="my"
          className={cn("mt-0", !isSectionPage && "hidden md:block")}
        >
          <RequestGrid
            requests={filteredRequests}
            emptyMessage="هنوز درخواستی ثبت نکرده‌اید."
            activeSubTab={activeSubTab}
            saving={saving}
            setDeletingRequest={setDeletingRequest}
            openEdit={openEdit}
            handleDeleteConfirm={handleDeleteConfirm}
            loading={isInitialLoading}
            loadError={requests.length === 0 ? loadError : null}
            onRetry={onRefresh}
          />
        </TabsContent>

        <TabsContent
          value="liked"
          className={cn("mt-0", !isSectionPage && "hidden md:block")}
        >
          <RequestGrid
            requests={filteredRequests}
            emptyMessage="هنوز درخواستی را لایک نکرده‌اید."
            activeSubTab={activeSubTab}
            saving={saving}
            setDeletingRequest={setDeletingRequest}
            openEdit={openEdit}
            handleDeleteConfirm={handleDeleteConfirm}
            loading={isInitialLoading}
            loadError={requests.length === 0 ? loadError : null}
            onRetry={onRefresh}
          />
        </TabsContent>

        <TabsContent
          value="settings"
          className={cn("mt-0", !isSectionPage && "hidden md:block")}
        >
          <div className="mx-auto flex max-w-2xl flex-col gap-4">
            {/* پروفایل */}
            <Card>
              <CardContent className="flex flex-col gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2 text-sm font-bold">
                    <UserRound className="text-primary h-4 w-4" />
                    پروفایل
                  </CardTitle>
                  <CardDescription className="mt-1 text-xs leading-relaxed">
                    تصویر و نام نمایشی حساب کاربری خود را مدیریت کنید.
                  </CardDescription>
                </div>

                <div className="flex items-center gap-3.5">
                  <ProfileAvatar
                    user={currentUser}
                    size={72}
                    editable
                    onError={setProfileError}
                    onUploaded={() => {
                      setProfileSuccess("تصویر پروفایل به‌روزرسانی شد.");
                      setTimeout(() => setProfileSuccess(null), 3000);
                    }}
                  />
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="text-foreground truncate text-sm font-extrabold">
                      {currentUser.firstName} {currentUser.lastName}
                    </span>
                    <span className="text-muted-foreground font-mono text-[11px] font-semibold">
                      {toPersianDigits(currentUser.phone)}
                    </span>
                    <span className="text-muted-foreground/80 text-[10.5px] leading-relaxed">
                      برای تغییر تصویر روی آن بزنید؛ JPEG، PNG یا WebP تا ۲
                      مگابایت.
                    </span>
                  </div>
                  {currentUser.avatarUrl && (
                    <AlertDialog
                      open={confirmAvatarRemove}
                      onOpenChange={(open) => {
                        if (!avatarRemoving) setConfirmAvatarRemove(open);
                      }}
                    >
                      <AlertDialogTrigger asChild>
                        <Button
                          type="button"
                          variant="destructive-soft"
                          size="sm"
                          aria-label="حذف تصویر پروفایل"
                          className="shrink-0"
                        >
                          <Trash2 />
                          <span className="hidden sm:inline">حذف تصویر</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>حذف تصویر پروفایل</AlertDialogTitle>
                          <AlertDialogDescription>
                            آیا از حذف تصویر پروفایل اطمینان دارید؟ تصویر فعلی
                            پاک می‌شود و به‌جای آن حرف اول نام شما نمایش داده
                            خواهد شد.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel disabled={avatarRemoving}>
                            انصراف
                          </AlertDialogCancel>
                          <AlertDialogAction
                            variant="destructive"
                            disabled={avatarRemoving}
                            onClick={(event) => {
                              // Keep the dialog open until the request settles
                              // so the spinner stays visible.
                              event.preventDefault();
                              void handleAvatarRemove();
                            }}
                          >
                            {avatarRemoving ? (
                              <>
                                <Loader2 className="animate-spin" />
                                در حال حذف...
                              </>
                            ) : (
                              "حذف شود"
                            )}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>

                {profileError && (
                  <Alert variant="destructive" className="text-xs">
                    <AlertCircle />
                    <AlertTitle>خطا</AlertTitle>
                    <AlertDescription>{profileError}</AlertDescription>
                  </Alert>
                )}

                {profileSuccess && (
                  <Alert className="border-status-resolved/20 bg-status-resolved/10 text-status-resolved text-xs">
                    <CheckCircle />
                    <AlertTitle>موفق</AlertTitle>
                    <AlertDescription className="text-status-resolved/90">
                      {profileSuccess}
                    </AlertDescription>
                  </Alert>
                )}

                <form
                  onSubmit={handleProfileSave}
                  className="flex flex-col gap-3"
                >
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="flex flex-col gap-1.5">
                      <label
                        htmlFor="profile-first-name"
                        className="text-foreground text-xs font-bold"
                      >
                        نام
                      </label>
                      <Input
                        id="profile-first-name"
                        value={firstNameInput}
                        onChange={(e) => setFirstNameInput(e.target.value)}
                        maxLength={60}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label
                        htmlFor="profile-last-name"
                        className="text-foreground text-xs font-bold"
                      >
                        نام خانوادگی
                      </label>
                      <Input
                        id="profile-last-name"
                        value={lastNameInput}
                        onChange={(e) => setLastNameInput(e.target.value)}
                        maxLength={60}
                      />
                    </div>
                  </div>
                  <Button type="submit" disabled={profileSaving}>
                    {profileSaving ? "در حال ذخیره..." : "ذخیره مشخصات"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* حالت نمایش */}
            <Card>
              <CardContent className="flex flex-col gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2 text-sm font-bold">
                    <Sun className="text-primary h-4 w-4" />
                    حالت نمایش
                  </CardTitle>
                  <CardDescription className="mt-1 text-xs leading-relaxed">
                    تم برنامه در همین مرورگر ذخیره می‌شود و بلافاصله اعمال
                    می‌شود.
                  </CardDescription>
                </div>

                <div
                  role="radiogroup"
                  aria-label="حالت نمایش"
                  className="grid grid-cols-2 gap-2.5"
                >
                  {(
                    [
                      { value: "light", label: "روشن", Icon: Sun },
                      { value: "dark", label: "تاریک", Icon: Moon },
                    ] as const
                  ).map(({ value, label, Icon }) => {
                    const active = theme === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => setTheme(value)}
                        className={cn(
                          "focus-visible:ring-ring/40 flex cursor-pointer items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-bold transition-colors duration-150 focus-visible:ring-2 focus-visible:outline-none",
                          active
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground",
                        )}
                      >
                        <Icon className="size-4" />
                        {label}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* رمز عبور */}
            <Card>
              <CardContent className="flex flex-col gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2 text-sm font-bold">
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
                      <label className="text-foreground text-xs font-bold">
                        رمز عبور فعلی{" "}
                        <span className="text-destructive">*</span>
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
                    <label className="text-foreground text-xs font-bold">
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
                    <span className="text-muted-foreground text-[10.5px] font-semibold">
                      حداقل ۸ کاراکتر
                    </span>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-foreground text-xs font-bold">
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
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <ResponsiveDialog
        open={!!editingRequest}
        onOpenChange={(o) => !o && setEditingRequest(null)}
      >
        <ResponsiveDialogContent className="max-w-lg">
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle className="text-lg font-bold">
              ویرایش درخواست
            </ResponsiveDialogTitle>
          </ResponsiveDialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-foreground text-xs font-bold">عنوان</label>
              <Input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                dir="rtl"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-foreground text-xs font-bold">
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
              <label className="text-foreground text-xs font-bold">
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
              {saving ? <Loader2 className="animate-spin" /> : "ذخیره تغییرات"}
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
  href: string;
  Icon: typeof ClipboardList;
  active?: boolean;
}

function ProfileMenuCard({
  title,
  items,
}: {
  title: string;
  items: ProfileMenuItem[];
}) {
  return (
    <div className="bg-card overflow-hidden rounded-2xl border">
      <div className="text-muted-foreground border-b px-4 py-2.5 text-start text-[13px] font-medium">
        {title}
      </div>
      <div>
        {items.map(({ key, label, sub, href, Icon, active }) => {
          return (
            <Link
              key={key}
              href={href}
              className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5"
            >
              <span
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-full",
                  active ? "bg-primary/10" : "bg-muted",
                )}
              >
                <Icon
                  className={cn(
                    "h-4.5 w-4.5",
                    active ? "text-primary" : "text-muted-foreground",
                  )}
                  strokeWidth={1.75}
                />
              </span>
              <span className="flex flex-1 flex-col items-start gap-0.5">
                <span className="text-foreground text-sm font-semibold">
                  {label}
                </span>
                {sub && (
                  <span className="text-muted-foreground text-[11px] font-semibold">
                    {sub}
                  </span>
                )}
              </span>
              <ChevronLeft className="text-muted-foreground/40 h-4 w-4 shrink-0" />
            </Link>
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
  saving: boolean;
  setDeletingRequest: (r: RequestItem | null) => void;
  openEdit: (r: RequestItem) => void;
  handleDeleteConfirm: () => Promise<void>;
  loading?: boolean;
  loadError?: string | null;
  onRetry?: () => void;
}

function RequestGrid({
  requests,
  emptyMessage,
  activeSubTab,
  saving,
  setDeletingRequest,
  openEdit,
  handleDeleteConfirm,
  loading = false,
  loadError = null,
  onRetry,
}: RequestGridProps) {
  return (
    <div className="grid gap-3.5 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
      {loading ? (
        <ReportCardsSkeleton count={6} />
      ) : loadError ? (
        <LoadErrorState message={loadError} onRetry={onRetry} />
      ) : (
        <>
          {requests.length === 0 && (
            <div className="text-muted-foreground col-span-full py-16 text-center text-sm font-semibold">
              {emptyMessage}
            </div>
          )}

          {requests.map((req) => (
            <Card
              key={req.id}
              className={cn(
                "report-card relative cursor-pointer overflow-hidden transition-all duration-300",
                "hover:shadow-sm",
                "border-border bg-card",
              )}
            >
              <Link
                href={`/reports/${encodeURIComponent(req.id)}`}
                aria-label={`مشاهده گزارش ${req.title}`}
                className="focus-visible:ring-ring absolute inset-0 z-0 rounded-[inherit] focus-visible:ring-2 focus-visible:outline-none"
              />
              <CardContent className="pointer-events-none relative flex flex-col gap-2.5 px-4 sm:px-5">
                {/* Badge / Header row */}
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <Badge
                    variant="outline"
                    className={cn(
                      "border text-[10px] font-semibold",
                      TYPE_BADGE_CLASS[req.type],
                    )}
                  >
                    {TYPE_LABELS[req.type]}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={cn(
                      "border text-[10px] font-semibold",
                      STATUS_BADGE_CLASS[req.status],
                    )}
                  >
                    {STATUS_LABELS[req.status] ?? req.status}
                  </Badge>
                </div>

                {/* Title */}
                <CardTitle className="text-foreground line-clamp-1 text-sm font-bold">
                  {req.title}
                </CardTitle>

                {/* Description */}
                <CardDescription className="text-muted-foreground line-clamp-2 min-h-[2lh] text-xs leading-relaxed">
                  {req.description}
                </CardDescription>

                {/* Footer */}
                <div className="text-muted-foreground flex items-center justify-between text-[10px]">
                  <span className="font-semibold">
                    {toPersianDigits(
                      new Date(req.createdAt).toLocaleDateString("fa-IR"),
                    )}
                  </span>
                  <div className="pointer-events-auto flex items-center gap-1">
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
                                aria-label="ویرایش"
                              >
                                <Edit />
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
                                    className="text-destructive"
                                    onClick={() => setDeletingRequest(req)}
                                    aria-label="حذف"
                                  >
                                    <Trash2 />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>حذف</TooltipContent>
                              </Tooltip>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    حذف درخواست
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    آیا از حذف این درخواست اطمینان دارید؟ این
                                    اقدام قابل بازگشت نیست.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel
                                    onClick={() => setDeletingRequest(null)}
                                  >
                                    انصراف
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    variant="destructive"
                                    onClick={handleDeleteConfirm}
                                  >
                                    {saving ? (
                                      <Loader2 className="animate-spin" />
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
        </>
      )}
    </div>
  );
}
