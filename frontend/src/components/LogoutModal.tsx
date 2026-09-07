"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "@/components/ui/responsive-dialog";

interface LogoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export default function LogoutModal({
  open,
  onOpenChange,
  onConfirm,
}: LogoutModalProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open && cancelRef.current) {
      const timer = setTimeout(() => {
        cancelRef.current?.focus();
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [open]);

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent className="w-full sm:max-w-sm md:min-w-xl">
        <ResponsiveDialogHeader className="gap-1 text-center">
          <ResponsiveDialogTitle className="text-xl font-bold">
            خروج از حساب
          </ResponsiveDialogTitle>
          <ResponsiveDialogDescription className="text-balance">
            آیا مطمئن هستید که می‌خواهید از حساب خود خارج شوید؟
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>
        <ResponsiveDialogFooter className="flex-col-reverse gap-3 sm:flex-row">
          <Button
            ref={cancelRef}
            variant="outline"
            className="w-full sm:flex-1"
            onClick={() => onOpenChange(false)}
          >
            انصراف
          </Button>
          <Button
            variant="destructive"
            className="w-full sm:flex-1"
            onClick={onConfirm}
          >
            خروج از حساب
          </Button>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
