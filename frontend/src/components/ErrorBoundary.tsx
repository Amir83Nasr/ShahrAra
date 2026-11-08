"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  handleReload = () => {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      const isDev = process.env.NODE_ENV === "development";

      return (
        <div
          dir="rtl"
          className="flex min-h-[60vh] w-full items-center justify-center px-4 py-16 sm:py-24"
        >
          <div className="border-border/70 bg-card relative w-full max-w-md overflow-hidden rounded-3xl border shadow-sm">
            <div
              aria-hidden
              className="from-destructive/10 via-destructive/5 pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b to-transparent"
            />

            <div className="relative flex flex-col items-center px-6 pt-8 pb-6 text-center sm:px-8">
              <div className="bg-destructive/10 text-destructive ring-destructive/15 mb-5 flex size-14 items-center justify-center rounded-2xl ring-1 ring-inset">
                <AlertTriangle className="size-7" strokeWidth={2} />
              </div>

              <h2 className="text-foreground text-lg font-extrabold tracking-tight sm:text-xl">
                خطایی رخ داده است
              </h2>
              <p className="text-muted-foreground mt-2 max-w-sm text-sm leading-7 font-medium">
                متأسفانه در اجرای برنامه مشکلی پیش آمد. می‌توانید دوباره تلاش
                کنید یا صفحه را بازنشانی نمایید.
              </p>

              {isDev && this.state.error ? (
                <div className="border-destructive/20 bg-destructive/5 mt-5 w-full rounded-2xl border p-3 text-right">
                  <p className="text-destructive/90 font-mono text-[11px] leading-relaxed break-words [direction:ltr]">
                    <span className="font-semibold">
                      {this.state.error.name}:
                    </span>{" "}
                    {this.state.error.message}
                  </p>
                </div>
              ) : null}

              <div className="mt-6 flex w-full flex-col gap-2.5 sm:flex-row">
                <Button onClick={this.handleRetry} className="w-full sm:flex-1">
                  <RotateCcw className="size-4" />
                  تلاش مجدد
                </Button>
                <Button
                  variant="outline"
                  onClick={this.handleReload}
                  className="w-full sm:flex-1"
                >
                  بازنشانی صفحه
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
