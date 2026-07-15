import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type TooltipProps = {
  label: string;
  children: ReactNode;
  side?: "right" | "bottom";
  disabled?: boolean;
};

export function Tooltip({
  label,
  children,
  side = "right",
  disabled = false,
}: TooltipProps) {
  if (disabled) {
    return <>{children}</>;
  }

  return (
    <span className="group/tooltip relative flex w-full">
      {children}
      <span
        role="tooltip"
        className={cn(
          "pointer-events-none absolute z-50 whitespace-nowrap rounded-md border border-border bg-card px-2 py-1 text-xs font-medium text-foreground opacity-0 shadow-panel transition group-hover/tooltip:opacity-100",
          side === "right" && "left-full top-1/2 ml-2 -translate-y-1/2",
          side === "bottom" && "left-1/2 top-full mt-2 -translate-x-1/2",
        )}
      >
        {label}
      </span>
    </span>
  );
}
