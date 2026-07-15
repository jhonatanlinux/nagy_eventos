import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, LogOut, X } from "lucide-react";
import { NavLink } from "react-router-dom";

import { AppLogo } from "@/components/common/AppLogo";
import { Tooltip } from "@/components/common/Tooltip";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";

import { navigationSections } from "./navigation";

type SidebarProps = {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
};

type SidebarContentProps = {
  collapsed: boolean;
  onMobileClose?: () => void;
  isMobile?: boolean;
};

const sidebarTransition = { duration: 0.24, ease: "easeOut" as const };

function UserProfile({ collapsed }: { collapsed: boolean }) {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const initials = (user?.name ?? "Usuario NAGY")
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <div className="shrink-0 border-t border-border/60 pt-3">
      <div
        className={cn(
          "flex h-12 items-center gap-3 rounded-lg border border-border/70 bg-muted/30 px-2 transition-colors",
          collapsed && "justify-center border-transparent bg-transparent px-0",
        )}
      >
        <Tooltip label={user?.name ?? "Usuario NAGY"} disabled={!collapsed}>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-black text-primary-foreground shadow-premium">
            {initials}
          </div>
        </Tooltip>

        <AnimatePresence initial={false}>
          {!collapsed ? (
            <motion.div
              className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              transition={sidebarTransition}
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">
                  {user?.name ?? "Usuario NAGY"}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {user?.email ?? "admin@nagyeventos.com"}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="shrink-0"
                title="Sair"
                aria-label="Sair da aplicacao"
                onClick={() => logout()}
              >
                <LogOut className="h-4 w-4" aria-hidden />
              </Button>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}

function NavigationLabel({ children }: { children: string }) {
  return (
    <motion.span
      className="min-w-0 overflow-hidden whitespace-nowrap"
      initial={{ opacity: 0, width: 0 }}
      animate={{ opacity: 1, width: "auto" }}
      exit={{ opacity: 0, width: 0 }}
      transition={sidebarTransition}
    >
      {children}
    </motion.span>
  );
}

function SidebarNavigation({
  collapsed,
  onMobileClose,
  isMobile,
}: Pick<SidebarContentProps, "collapsed" | "onMobileClose" | "isMobile">) {
  const showLabels = !collapsed || isMobile;

  return (
    <nav
      aria-label="Navegacao principal"
      className={cn(
        "sidebar-scroll min-h-0 flex-1 py-2",
        collapsed
          ? "flex flex-col justify-center gap-2 overflow-hidden"
          : "space-y-5 overflow-y-auto overflow-x-hidden pr-1",
      )}
    >
      {navigationSections.map((section) => (
        <div
          key={section.label}
          className={cn("space-y-1", collapsed && "space-y-0.5")}
        >
          <AnimatePresence initial={false}>
            {showLabels ? (
              <motion.p
                className="overflow-hidden px-3 text-[10px] font-black uppercase text-muted-foreground"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 22, opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={sidebarTransition}
              >
                {section.label}
              </motion.p>
            ) : null}
          </AnimatePresence>

          <div className={cn("space-y-1", collapsed && "space-y-0.5")}>
            {section.items.map((item) => (
              <Tooltip
                key={item.path}
                label={item.label}
                disabled={!collapsed || isMobile}
              >
                <NavLink
                  to={item.path}
                  onClick={onMobileClose}
                  className={({ isActive }) =>
                    cn(
                      "group relative flex items-center rounded-lg text-sm font-semibold text-muted-foreground outline-none transition-colors",
                      "hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
                      collapsed
                        ? "h-10 justify-center px-0"
                        : "h-11 gap-3 px-3",
                      isActive && "bg-primary/10 text-primary",
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <motion.span
                        className={cn(
                          "absolute left-0 h-6 w-0.5 rounded-r-full bg-transparent",
                          isActive && "bg-primary",
                        )}
                        layout
                      />
                      <motion.span
                        className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors",
                          isActive &&
                            "bg-primary text-primary-foreground shadow-premium",
                        )}
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.16 }}
                      >
                        <item.icon className="h-4 w-4" aria-hidden />
                      </motion.span>
                      <AnimatePresence initial={false}>
                        {showLabels ? (
                          <NavigationLabel>{item.label}</NavigationLabel>
                        ) : null}
                      </AnimatePresence>
                    </>
                  )}
                </NavLink>
              </Tooltip>
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}

function SidebarContent({
  collapsed,
  onMobileClose,
  isMobile = false,
}: SidebarContentProps) {
  return (
    <div className="flex h-full min-h-0 flex-col px-3 py-3">
      <header
        className={cn(
          "flex h-14 shrink-0 items-center gap-2 border-b border-border/60 pb-3",
          collapsed ? "justify-center" : "justify-between",
        )}
      >
        <NavLink
          to="/dashboard"
          onClick={onMobileClose}
          className={cn(
            "block min-w-0 overflow-hidden rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring",
            collapsed ? "w-12" : "w-40",
          )}
          aria-label="Ir para Dashboard"
        >
          <AppLogo compact className={cn(collapsed && "[&_img]:max-w-none")} />
        </NavLink>
        {isMobile ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onMobileClose}
            aria-label="Fechar menu"
          >
            <X className="h-5 w-5" aria-hidden />
          </Button>
        ) : null}
      </header>

      <SidebarNavigation
        collapsed={collapsed}
        isMobile={isMobile}
        onMobileClose={onMobileClose}
      />
      <UserProfile collapsed={collapsed && !isMobile} />
    </div>
  );
}

function SidebarToggle({
  collapsed,
  onToggle,
}: Pick<SidebarProps, "collapsed" | "onToggle">) {
  const label = collapsed ? "Expandir sidebar" : "Recolher sidebar";

  return (
    <div className="z-40 col-start-2 row-start-1 hidden -translate-x-1/2 self-center justify-self-start lg:block">
      <Tooltip label={label} side="right">
        <motion.button
          type="button"
          onClick={onToggle}
          aria-label={label}
          aria-expanded={!collapsed}
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-panel outline-none transition-colors hover:border-primary/40 hover:bg-muted hover:text-primary focus-visible:ring-2 focus-visible:ring-ring"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          transition={{ duration: 0.16 }}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={collapsed ? "expand" : "collapse"}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.12 }}
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4" aria-hidden />
              ) : (
                <ChevronLeft className="h-4 w-4" aria-hidden />
              )}
            </motion.span>
          </AnimatePresence>
        </motion.button>
      </Tooltip>
    </div>
  );
}

export function Sidebar({
  collapsed,
  onToggle,
  mobileOpen,
  onMobileClose,
}: SidebarProps) {
  return (
    <>
      <motion.aside
        animate={{ width: collapsed ? 88 : 288 }}
        transition={sidebarTransition}
        className="relative z-30 col-start-1 row-start-1 hidden h-full min-h-0 overflow-hidden border-r border-border/80 bg-card/95 backdrop-blur-xl lg:block"
      >
        <SidebarContent collapsed={collapsed} />
      </motion.aside>

      <SidebarToggle collapsed={collapsed} onToggle={onToggle} />

      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition lg:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onMobileClose}
      >
        <motion.aside
          animate={{ x: mobileOpen ? 0 : -340 }}
          transition={sidebarTransition}
          className="h-full w-[320px] max-w-[86vw] border-r border-border bg-card shadow-panel"
          onClick={(event) => event.stopPropagation()}
        >
          <SidebarContent
            collapsed={false}
            isMobile
            onMobileClose={onMobileClose}
          />
        </motion.aside>
      </div>
    </>
  );
}
