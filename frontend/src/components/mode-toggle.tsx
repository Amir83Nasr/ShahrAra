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
  const handleClick = () => {
    onThemeChange(theme === "light" ? "dark" : "light");
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          aria-pressed={theme === "dark"}
          aria-label={
            theme === "light" ? "تغییر به حالت تاریک" : "تغییر به حالت روشن"
          }
          onClick={handleClick}
        >
          <Sun className="size-4 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute size-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        {theme === "light" ? "تغییر به حالت تاریک" : "تغییر به حالت روشن"}
      </TooltipContent>
    </Tooltip>
  );
}
