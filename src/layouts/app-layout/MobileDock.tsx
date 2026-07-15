import { NavLink } from "react-router-dom";

import { cn } from "@/lib/utils";

import { mobileNavigationItems } from "./navigation";

export function MobileDock() {
  return (
    <nav className="fixed inset-x-3 bottom-10 z-40 rounded-lg border border-border/80 bg-card/95 p-1.5 shadow-panel backdrop-blur-xl lg:hidden">
      <div className="grid grid-cols-5 gap-1">
        {mobileNavigationItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-md text-[10px] font-bold text-muted-foreground transition",
                "hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isActive && "bg-primary text-primary-foreground shadow-premium",
              )
            }
          >
            <item.icon className="h-4 w-4 shrink-0" aria-hidden />
            <span className="max-w-full truncate">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
