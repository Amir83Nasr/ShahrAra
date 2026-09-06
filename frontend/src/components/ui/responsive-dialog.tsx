"use client";

import * as React from "react";
import { XIcon } from "lucide-react";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "./dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerTrigger,
  DrawerClose,
} from "./drawer";

const ResponsiveDialogContext = React.createContext<{
  isMobile: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
} | null>(null);

export function ResponsiveDialog({
  children,
  open = false,
  onOpenChange = () => {},
  ...props
}: React.ComponentProps<typeof Dialog>) {
  const isMobile = useMediaQuery("(max-width: 640px)");

  return (
    <ResponsiveDialogContext.Provider value={{ isMobile, open, onOpenChange }}>
      {isMobile ? (
        <Drawer open={open} onOpenChange={onOpenChange} {...props}>
          {children}
        </Drawer>
      ) : (
        <Dialog open={open} onOpenChange={onOpenChange} {...props}>
          {children}
        </Dialog>
      )}
    </ResponsiveDialogContext.Provider>
  );
}

export function ResponsiveDialogTrigger({
  children,
  ...props
}: React.ComponentProps<typeof DialogTrigger>) {
  const context = React.useContext(ResponsiveDialogContext);
  if (!context)
    throw new Error(
      "ResponsiveDialogTrigger must be used within ResponsiveDialog",
    );
  return context.isMobile ? (
    <DrawerTrigger {...props}>{children}</DrawerTrigger>
  ) : (
    <DialogTrigger {...props}>{children}</DialogTrigger>
  );
}

export function ResponsiveDialogContent({
  children,
  className,
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof DialogContent> & { showCloseButton?: boolean }) {
  const context = React.useContext(ResponsiveDialogContext);
  if (!context)
    throw new Error(
      "ResponsiveDialogContent must be used within ResponsiveDialog",
    );

  if (context.isMobile) {
    return (
      <DrawerContent className={className} {...props}>
        {showCloseButton && (
          <DrawerClose className="absolute end-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <XIcon className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DrawerClose>
        )}
        {children}
      </DrawerContent>
    );
  }

  return (
    <DialogContent
      className={className}
      showCloseButton={showCloseButton}
      {...props}
    >
      {children}
    </DialogContent>
  );
}

export function ResponsiveDialogHeader({
  children,
  ...props
}: React.ComponentProps<typeof DialogHeader>) {
  const context = React.useContext(ResponsiveDialogContext);
  if (!context)
    throw new Error(
      "ResponsiveDialogHeader must be used within ResponsiveDialog",
    );
  return context.isMobile ? (
    <DrawerHeader {...props}>{children}</DrawerHeader>
  ) : (
    <DialogHeader {...props}>{children}</DialogHeader>
  );
}

export function ResponsiveDialogTitle({
  children,
  ...props
}: React.ComponentProps<typeof DialogTitle>) {
  const context = React.useContext(ResponsiveDialogContext);
  if (!context)
    throw new Error(
      "ResponsiveDialogTitle must be used within ResponsiveDialog",
    );
  return context.isMobile ? (
    <DrawerTitle {...props}>{children}</DrawerTitle>
  ) : (
    <DialogTitle {...props}>{children}</DialogTitle>
  );
}

export function ResponsiveDialogDescription({
  children,
  ...props
}: React.ComponentProps<typeof DialogDescription>) {
  const context = React.useContext(ResponsiveDialogContext);
  if (!context)
    throw new Error(
      "ResponsiveDialogDescription must be used within ResponsiveDialog",
    );
  return context.isMobile ? (
    <DrawerDescription {...props}>{children}</DrawerDescription>
  ) : (
    <DialogDescription {...props}>{children}</DialogDescription>
  );
}

export function ResponsiveDialogFooter({
  children,
  ...props
}: React.ComponentProps<typeof DialogFooter>) {
  const context = React.useContext(ResponsiveDialogContext);
  if (!context)
    throw new Error(
      "ResponsiveDialogFooter must be used within ResponsiveDialog",
    );
  return context.isMobile ? (
    <DrawerFooter {...props}>{children}</DrawerFooter>
  ) : (
    <DialogFooter {...props}>{children}</DialogFooter>
  );
}

export function ResponsiveDialogClose({
  children,
  ...props
}: React.ComponentProps<typeof DialogClose>) {
  const context = React.useContext(ResponsiveDialogContext);
  if (!context)
    throw new Error(
      "ResponsiveDialogClose must be used within ResponsiveDialog",
    );
  return context.isMobile ? (
    <DrawerClose {...props}>{children}</DrawerClose>
  ) : (
    <DialogClose {...props}>{children}</DialogClose>
  );
}
