import * as React from "react";
import { flushSync } from "react-dom";
import { Moon, Sun } from "lucide-react";

import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export function ModeToggle({
  theme,
  onThemeChange,
}: {
  theme: "light" | "dark";
  onThemeChange: (theme: "light" | "dark") => void;
}) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (rect.left + rect.width / 2).toFixed(0);
    const y = (rect.top + rect.height / 2).toFixed(0);
    document.documentElement.style.setProperty("--theme-x", `${x}px`);
    document.documentElement.style.setProperty("--theme-y", `${y}px`);

    const next = theme === "light" ? "dark" : "light";

    if ("startViewTransition" in document) {
      (
        document as unknown as { startViewTransition: (cb: () => void) => void }
      ).startViewTransition(() => {
        flushSync(() => {
          onThemeChange(next);
        });
      });
    } else {
      onThemeChange(next);
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          aria-pressed={theme === "dark"}
          onClick={handleClick}
          className="px-3"
        >
          <Sun className="h-4 w-4 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute h-4 w-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        {theme === "light" ? "فعال‌سازی تم تاریک" : "فعال‌سازی تم روشن"}
      </TooltipContent>
    </Tooltip>
  );
}
