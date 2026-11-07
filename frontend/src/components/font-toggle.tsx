"use client";

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Check, Type } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { FONT_OPTIONS, FontOption } from "@/utils/fontUtils";

export function FontToggle({
  font,
  onFontChange,
}: {
  font: FontOption;
  onFontChange: (font: FontOption) => void;
}) {
  return (
    <DropdownMenu dir="rtl">
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" aria-label="انتخاب فونت برنامه">
              <Type />
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>انتخاب فونت</TooltipContent>
      </Tooltip>

      <DropdownMenuContent align="end" className="min-w-56">
        <DropdownMenuLabel>فونت برنامه</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {FONT_OPTIONS.map((option) => {
          const selected = font === option.value;
          return (
            <DropdownMenuItem
              key={option.value}
              onSelect={() => onFontChange(option.value)}
              className="gap-3"
            >
              <span className="flex flex-1 flex-col items-start gap-0.5">
                <span
                  data-font-preview={option.value}
                  className={cn(
                    "text-sm font-medium",
                    selected && "text-primary",
                  )}
                >
                  {option.label}
                </span>
                <span className="text-muted-foreground text-[10px] font-normal">
                  {option.description}
                </span>
              </span>
              {selected && <Check className="text-primary" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
