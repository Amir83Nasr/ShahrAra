"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, Loader2, UserRound } from "lucide-react";

import { useApp } from "@/app/providers";
import { apiErrorMessage, apiFetch, authHeaders } from "@/lib/api";
import { cn } from "@/lib/utils";
import { User } from "@/types";

/** Keep in sync with MAX_AVATAR_BYTES on the backend. */
const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
const AVATAR_EDGE = 512;

/** Persian-safe initials: "امیر محمدی" → "ام". */
export function getInitials(
  firstName?: string | null,
  lastName?: string | null,
): string {
  const first = Array.from((firstName ?? "").trim())[0] ?? "";
  const last = Array.from((lastName ?? "").trim())[0] ?? "";
  return `${first}${last}`;
}

/**
 * Downscale and re-encode on the client so the upload stays small regardless
 * of the camera's original resolution. The API stores the bytes as-is.
 */
async function compressAvatar(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(
      1,
      AVATAR_EDGE / Math.max(bitmap.width, bitmap.height),
    );
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) throw new Error("پردازش تصویر در این مرورگر ممکن نیست.");
    context.drawImage(bitmap, 0, 0, width, height);

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) =>
          blob
            ? resolve(blob)
            : reject(new Error("فشرده‌سازی تصویر انجام نشد.")),
        "image/jpeg",
        0.86,
      );
    });
  } finally {
    bitmap.close();
  }
}

interface ProfileAvatarProps {
  user: User;
  /** Rendered diameter in pixels. */
  size?: number;
  /** Show the camera affordance and allow choosing a file. */
  editable?: boolean;
  className?: string;
  onError?: (message: string | null) => void;
  onUploaded?: () => void;
}

export default function ProfileAvatar({
  user,
  size = 56,
  editable = false,
  className,
  onError,
  onUploaded,
}: ProfileAvatarProps) {
  const { updateUser } = useApp();
  const inputRef = useRef<HTMLInputElement>(null);
  const [loadedAvatar, setLoadedAvatar] = useState<{
    url: string;
    src: string;
  } | null>(null);
  const [uploading, setUploading] = useState(false);

  const avatarUrl = user.avatarUrl ?? null;
  const token = user.token ?? null;
  // Only show bytes that belong to the current versioned URL.
  const src =
    loadedAvatar && loadedAvatar.url === avatarUrl ? loadedAvatar.src : null;

  // The avatar endpoint is authenticated, so <img src> cannot load it directly:
  // download with the bearer token and hand the element an object URL.
  useEffect(() => {
    if (!avatarUrl || !token) return;

    let cancelled = false;
    let objectUrl: string | null = null;

    fetch(avatarUrl, { headers: authHeaders(token) })
      .then((response) => (response.ok ? response.blob() : null))
      .then((blob) => {
        if (cancelled || !blob) return;
        objectUrl = URL.createObjectURL(blob);
        setLoadedAvatar({ url: avatarUrl, src: objectUrl });
      })
      .catch(() => {
        /* keep the initials placeholder when the picture cannot be fetched */
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [avatarUrl, token]);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    // Allow picking the same file again after an error.
    event.target.value = "";
    if (!file) return;

    // Some Android/iOS pickers omit the MIME type; fall back to the extension.
    const looksLikeImage =
      file.type.startsWith("image/") ||
      (!file.type && /\.(jpe?g|png|webp|heic|heif)$/i.test(file.name));
    if (!looksLikeImage) {
      onError?.("فقط فایل تصویری مجاز است.");
      return;
    }

    onError?.(null);
    setUploading(true);
    try {
      const blob = await compressAvatar(file);
      if (blob.size > MAX_AVATAR_BYTES) {
        throw new Error("حجم تصویر بیش از حد مجاز است.");
      }

      const body = new FormData();
      body.append(
        "file",
        new File([blob], "avatar.jpg", { type: "image/jpeg" }),
      );

      const response = await apiFetch<{ user: User }>("/api/v1/auth/avatar", {
        method: "POST",
        headers: authHeaders(token),
        body,
      });

      updateUser(response.user);
      onUploaded?.();
    } catch (err: unknown) {
      onError?.(apiErrorMessage(err, "بارگذاری تصویر پروفایل انجام نشد."));
    } finally {
      setUploading(false);
    }
  };

  const initials = getInitials(user.firstName, user.lastName);
  const fontSize = Math.max(13, Math.round(size * 0.32));

  return (
    <div
      className={cn("group relative shrink-0 select-none", className)}
      style={{ width: size, height: size }}
    >
      <div className="border-primary/15 bg-primary/10 text-primary flex h-full w-full items-center justify-center overflow-hidden rounded-full border">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt="تصویر پروفایل"
            draggable={false}
            className="h-full w-full object-cover"
          />
        ) : initials ? (
          <span className="leading-none font-extrabold" style={{ fontSize }}>
            {initials}
          </span>
        ) : (
          <UserRound
            aria-hidden
            style={{
              width: Math.round(size * 0.44),
              height: Math.round(size * 0.44),
            }}
            strokeWidth={1.75}
          />
        )}
      </div>

      {editable && (
        <>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            aria-label="تغییر تصویر پروفایل"
            aria-busy={uploading}
            className="group/avatar focus-visible:ring-ring/50 absolute inset-0 flex cursor-pointer items-center justify-center rounded-full text-white transition-colors duration-150 outline-none hover:bg-black/35 focus-visible:ring-2 disabled:cursor-wait"
          >
            {uploading ? (
              <Loader2
                className="animate-spin"
                style={{ width: size * 0.36, height: size * 0.36 }}
              />
            ) : (
              <Camera
                className="opacity-0 transition-opacity duration-150 group-hover/avatar:opacity-100 group-focus-visible/avatar:opacity-100"
                style={{ width: size * 0.32, height: size * 0.32 }}
              />
            )}
          </button>
          <span
            aria-hidden
            className="bg-primary text-primary-foreground border-background pointer-events-none absolute -end-0.5 -bottom-0.5 flex size-6 items-center justify-center rounded-full border-2 shadow-sm"
          >
            <Camera className="size-3" />
          </span>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileChange}
          />
        </>
      )}
    </div>
  );
}
