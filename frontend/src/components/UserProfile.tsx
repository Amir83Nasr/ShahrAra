/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import {
  AlertCircle,
  CheckCircle,
  ClipboardList,
  Edit,
  Heart,
  Loader2,
  MapPin,
  Search,
  Trash2,
} from 'lucide-react';
import { User, RequestItem, RequestUpdateData } from '../types';
import { toPersianDigits } from '../utils/numberUtils';
import { cn } from '@/lib/utils';
import { invalidateCache } from '@/utils/apiCache';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import MapComponent from './MapComponent';

const typeBadgeStyle = {
  problem: 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/20',
  idea: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
};

const statusBadgeStyle: Record<string, string> = {
  submitted:
    'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20',
  under_review:
    'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20',
  in_progress:
    'bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/20',
  resolved:
    'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  archived: 'bg-muted text-muted-foreground border-border',
};

const typeLabel = { problem: 'مشکل شهری', idea: 'ایده شهری' };
const statusLabel: Record<string, string> = {
  submitted: 'ثبت شده',
  under_review: 'در حال بررسی',
  in_progress: 'در حال انجام',
  resolved: 'حل شده',
  archived: 'بایگانی شده',
};

interface UserProfileProps {
  currentUser: User;
  requests: RequestItem[];
  onLike: (id: string) => Promise<void>;
  onRefresh: () => void;
  theme?: 'light' | 'dark';
}

export default function UserProfile({
  currentUser,
  requests,
  onLike,
  onRefresh,
}: UserProfileProps) {
  const [activeSubTab, setActiveSubTab] = useState<string>('my');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterRegion, setFilterRegion] = useState<string>('all');
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
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCategory, setEditCategory] = useState('');

  const REGIONS = Array.from(
    { length: 8 },
    (_, i) => `منطقه ${toPersianDigits(i + 1)}`,
  );

  const myRequests = useMemo(
    () => requests.filter((r) => r.userPhone === currentUser.phone),
    [requests, currentUser.phone],
  );
  const likedRequests = useMemo(
    () => requests.filter((r) => r.likedByCurrentUser),
    [requests],
  );

  // Filtered list based on active tab + search/filter
  const filteredRequests = useMemo(() => {
    const source = activeSubTab === 'my' ? myRequests : likedRequests;
    return source.filter((r) => {
      const matchesSearch =
        !searchTerm ||
        r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || r.type === filterType;
      const matchesStatus = filterStatus === 'all' || r.status === filterStatus;
      const matchesRegion =
        filterRegion === 'all' || r.region.startsWith(filterRegion);
      return matchesSearch && matchesType && matchesStatus && matchesRegion;
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
        'Content-Type': 'application/json',
      };
      if (currentUser.token) {
        headers['Authorization'] = `Bearer ${currentUser.token}`;
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
        method: 'PUT',
        headers,
        body: JSON.stringify(body),
      });

      if (res.ok) {
        invalidateCache();
        onRefresh();
        setSuccess('درخواست با موفقیت ویرایش شد.');
        setTimeout(() => setEditingRequest(null), 800);
      } else {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || 'خطا در ویرایش درخواست.');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'خطا در ویرایش درخواست.');
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
        headers['Authorization'] = `Bearer ${currentUser.token}`;
      }

      const res = await fetch(`/api/v1/requests/${deletingRequest.id}`, {
        method: 'DELETE',
        headers,
      });

      if (res.ok) {
        invalidateCache();
        onRefresh();
        setDeletingRequest(null);
        setSuccess('درخواست با موفقیت حذف شد.');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || 'خطا در حذف درخواست.');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'خطا در حذف درخواست.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Success / Error banners */}
      {success && (
        <div className="border-status-resolved/20 bg-status-resolved/10 text-status-resolved mb-4 flex items-center gap-2 rounded-lg border p-3 text-sm">
          <CheckCircle className="h-4 w-4 shrink-0" />
          <span className="font-bold">{success}</span>
        </div>
      )}
      {error && (
        <div className="border-destructive/20 bg-destructive/10 text-destructive mb-4 flex items-start gap-2.5 rounded-lg border p-3 text-sm">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span className="font-bold">{error}</span>
        </div>
      )}

      {/* Tabs */}
      <Tabs
        dir="rtl"
        value={activeSubTab}
        onValueChange={(v) => {
          setActiveSubTab(v);
          setSearchTerm('');
          setFilterType('all');
          setFilterStatus('all');
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
        </TabsList>

        {/* Search & Filter bar */}
        <div className="bg-card mt-3 mb-6 flex items-center gap-3 rounded-xl border p-4">
          <div className="relative w-full">
            <Search className="text-muted-foreground absolute top-1/2 right-3 size-4 -translate-y-1/2" />
            <Input
              type="text"
              placeholder="جستجوی عنوان، توضیحات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-background\ pr-10"
            />
          </div>
          <Select
            dir="rtl"
            value={filterType}
            onValueChange={(v) => setFilterType(v)}
          >
            <SelectTrigger size="sm" className="w-32">
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
            <SelectTrigger size="sm" className="w-36">
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
            <SelectTrigger size="sm" className="w-32">
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
      </Tabs>

      {/* Edit Dialog */}
      <Dialog
        open={!!editingRequest}
        onOpenChange={(o) => !o && setEditingRequest(null)}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-extrabold">
              ویرایش درخواست
            </DialogTitle>
          </DialogHeader>
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
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEditingRequest(null)}>
              انصراف
            </Button>
            <Button onClick={handleEditSave} disabled={saving}>
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'ذخیره تغییرات'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog
        open={!!selectedDetails}
        onOpenChange={(open) => !open && setSelectedDetails(null)}
      >
        <DialogContent className="max-sm:p-4 sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Badge
                variant={
                  syncedDetails?.type === 'problem' ? 'destructive' : 'default'
                }
                className={cn(
                  syncedDetails?.type !== 'problem'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : '',
                )}
              >
                {syncedDetails?.type === 'problem' ? 'گزارش مشکل' : 'ایده شهری'}
              </Badge>
              <Badge variant="outline" className="font-mono">
                {syncedDetails?.category}
              </Badge>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div>
              <h3 className="text-foreground text-lg leading-snug font-extrabold">
                {syncedDetails?.title}
              </h3>
              <span className="text-muted-foreground mt-1.5 block font-mono text-xs font-bold">
                منطقه: {toPersianDigits(syncedDetails?.region ?? '')} | وضعیت:{' '}
                {syncedDetails
                  ? (statusLabel[syncedDetails.status] ?? syncedDetails.status)
                  : ''}
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

          <DialogFooter className="flex items-center justify-between sm:justify-between">
            <span className="text-muted-foreground font-mono text-[10px] font-bold">
              کد رهگیری: {toPersianDigits(syncedDetails?.id ?? '')}
            </span>

            <Button
              variant={
                currentUser && syncedDetails?.likedByCurrentUser
                  ? 'destructive'
                  : 'outline'
              }
              size="sm"
              onClick={(e) =>
                syncedDetails && handleLikeClick(e, syncedDetails.id)
              }
            >
              <Heart
                className={cn(
                  'h-3.5 w-3.5',
                  currentUser &&
                    syncedDetails?.likedByCurrentUser &&
                    'fill-current',
                )}
              />
              <span>
                {toPersianDigits(syncedDetails?.likes ?? 0)} لایک و تأیید
                شهروندی
              </span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
            'report-card cursor-pointer overflow-hidden transition-all duration-300',
            'hover:shadow-sm',
            'border-border bg-card',
            selectedDetailsId === req.id &&
              'border-primary ring-primary/40 ring-2',
          )}
          onClick={() => setSelectedDetails(req)}
        >
          <CardContent className="flex flex-col gap-2.5 px-5">
            {/* Badge / Header row */}
            <div className="flex flex-wrap items-start justify-between gap-2">
              <Badge
                variant="outline"
                className={cn(
                  'border text-[10px] font-bold',
                  typeBadgeStyle[req.type],
                )}
              >
                {typeLabel[req.type]}
              </Badge>
              <Badge
                variant="outline"
                className={cn(
                  'border text-[10px] font-bold',
                  statusBadgeStyle[req.status],
                )}
              >
                {statusLabel[req.status] ?? req.status}
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
                  new Date(req.createdAt).toLocaleDateString('fa-IR'),
                )}
              </span>
              <div className="flex items-center gap-1">
                {activeSubTab === 'my' &&
                  (req.status === 'submitted' ||
                    req.status === 'under_review') && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => openEdit(req)}
                        title="ویرایش"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      {req.status === 'submitted' && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              className="text-red-500 hover:text-red-600"
                              title="حذف"
                              onClick={() => setDeletingRequest(req)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </AlertDialogTrigger>
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
                                  'حذف شود'
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
