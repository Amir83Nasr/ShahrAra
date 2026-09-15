"use client";

import { useEffect, useRef } from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
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
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";

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
  const isMobile = useMediaQuery("(max-width: 640px)");
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open && cancelRef.current) {
      const timer = setTimeout(() => {
        cancelRef.current?.focus();
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const mobileUi = (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader className="gap-1 text-center">
          <DrawerTitle className="text-xl font-bold">خروج از حساب</DrawerTitle>
          <DrawerDescription className="text-balance">
            آیا مطمئن هستید که می‌خواهید از حساب خود خارج شوید؟
          </DrawerDescription>
        </DrawerHeader>
        <DrawerFooter className="flex-col-reverse gap-3">
          <Button
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
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );

  const desktopUi = (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent size="sm">
        <AlertDialogHeader className="gap-1">
          <AlertDialogTitle className="text-xl font-bold">
            خروج از حساب
          </AlertDialogTitle>
          <AlertDialogDescription className="text-balance">
            آیا مطمئن هستید که می‌خواهید از حساب خود خارج شوید؟
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-3">
          <AlertDialogCancel>انصراف</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={onConfirm}>
            خروج از حساب
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return isMobile ? mobileUi : desktopUi;
}
