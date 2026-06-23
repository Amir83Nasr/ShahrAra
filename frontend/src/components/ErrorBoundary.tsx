import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
    console.error('ErrorBoundary caught:', error, info);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="mx-auto flex max-w-md flex-col items-center justify-center gap-6 px-4 py-24 text-center">
          <div className="border-destructive/20 bg-destructive/10 flex h-16 w-16 items-center justify-center rounded-full border">
            <AlertTriangle className="text-destructive h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-foreground text-xl font-extrabold">
              خطایی رخ داده است
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed font-medium">
              متأسفانه در اجرای برنامه مشکلی پیش آمد. لطفاً مجدداً تلاش کنید یا
              صفحه را بازنشانی نمایید.
            </p>
            {/* Dev-only: show actual error */}
            {this.state.error && (
              <p className="mt-3 rounded-md bg-black/5 p-2 font-mono text-[11px] text-red-600 dark:bg-white/5 dark:text-red-400">
                {this.state.error.name}: {this.state.error.message}
              </p>
            )}
          </div>
          <Button onClick={this.handleRetry} className="font-bold">
            <RefreshCcw className="h-4 w-4" />
            تلاش مجدد
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
