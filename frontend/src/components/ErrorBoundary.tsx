"use client";

import { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";
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

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="mx-auto flex max-w-md flex-col items-center justify-center gap-5 px-4 py-24 text-center">
          <div className="border-border bg-card w-full rounded-2xl border p-5 text-start">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-destructive mt-0.5 size-5 shrink-0" />
              <div className="min-w-0 flex-1">
                <h2 className="text-foreground text-sm font-semibold">
                  خطایی رخ داده است
                </h2>
                <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
                  متأسفانه در اجرای برنامه مشکلی پیش آمد. لطفاً مجدداً تلاش کنید
                  یا صفحه را بازنشانی نمایید.
                </p>
                {process.env.NODE_ENV === "development" && this.state.error && (
                  <pre className="bg-muted text-destructive mt-3 overflow-auto rounded-xl p-2.5 font-mono text-[11px] leading-relaxed break-words whitespace-pre-wrap">
                    {this.state.error.name}: {this.state.error.message}
                  </pre>
                )}
              </div>
            </div>
          </div>
          <Button onClick={this.handleRetry}>
            <RefreshCcw />
            تلاش مجدد
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
