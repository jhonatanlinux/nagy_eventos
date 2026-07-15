import { cn } from "@/lib/utils";

type AppLogoProps = {
  compact?: boolean;
  className?: string;
};

export function AppLogo({ compact = false, className }: AppLogoProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <img
        src="/brand/nagy-logo-transparent.png"
        alt="NAGY EVENTOS"
        className={cn(
          "object-contain",
          compact ? "h-11 w-40" : "h-16 w-56 sm:h-20 sm:w-72",
        )}
      />
    </div>
  );
}
