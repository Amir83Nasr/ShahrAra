import * as React from 'react';
import { Moon, Sun } from 'lucide-react';

import { Toggle } from '@/components/ui/toggle';

export function ModeToggle({
  theme,
  onThemeChange,
}: {
  theme: 'light' | 'dark';
  onThemeChange: (theme: 'light' | 'dark') => void;
}) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (rect.left + rect.width / 2).toFixed(0);
    const y = (rect.top + rect.height / 2).toFixed(0);
    document.documentElement.style.setProperty('--theme-x', `${x}px`);
    document.documentElement.style.setProperty('--theme-y', `${y}px`);

    const next = theme === 'light' ? 'dark' : 'light';

    if ('startViewTransition' in document) {
      (document as unknown as { startViewTransition: (cb: () => void) => void }).startViewTransition(() => onThemeChange(next));
    } else {
      onThemeChange(next);
    }
  };

  return (
    <Toggle
      variant="outline"
      aria-pressed={theme === 'dark'}
      onClick={handleClick}
      title={theme === 'light' ? 'فعال‌سازی تم تاریک' : 'فعال‌سازی تم روشن'}
    >
      <Sun className="h-4 w-4 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
      <Moon className="absolute h-4 w-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
    </Toggle>
  );
}
