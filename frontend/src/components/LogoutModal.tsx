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
}: LogoutModalProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="w-full sm:max-w-sm md:min-w-xl">
        <AlertDialogHeader className="place-items-center gap-1 text-center">
          <AlertDialogTitle className="text-xl font-bold">
            خروج از حساب
          </AlertDialogTitle>
          <AlertDialogDescription className="text-balance">
            'آیا مطمئن هستید که می‌خواهید از حساب خود خارج شوید؟'
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
