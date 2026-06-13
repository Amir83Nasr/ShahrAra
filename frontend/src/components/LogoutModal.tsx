import React from 'react';
import { LogOut } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface LogoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  userName?: string;
}

export default function LogoutModal({
  open,
  onOpenChange,
  onConfirm,
  userName,
}: LogoutModalProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-sm">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-destructive/10 ring-4 ring-destructive/20">
          <LogOut className="text-destructive size-6" />
        </div>
        <AlertDialogHeader className="place-items-center gap-1 text-center">
          <AlertDialogTitle className="text-xl">
            خروج از حساب
          </AlertDialogTitle>
          <AlertDialogDescription className="text-balance">
            {userName ? (
              <>
                کاربر{' '}
                <span className="text-foreground font-bold">{userName}</span>
                ، آیا مطمئن هستید که می‌خواهید از حساب خود خارج شوید؟
              </>
            ) : (
              'آیا مطمئن هستید که می‌خواهید از حساب خود خارج شوید؟'
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-3">
          <AlertDialogCancel className="flex-1">انصراف</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            className="flex-1"
            onClick={onConfirm}
          >
            خروج از حساب
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
