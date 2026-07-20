import {
  Bell,
  CalendarPlus,
  ChevronRight,
  LogOut,
  Menu,
  PackagePlus,
  Plus,
  Search,
  Settings,
  UserCircle,
  UserPlus,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { AppLogo } from "@/components/common/AppLogo";
import { CommandPalette } from "@/components/common/CommandPalette";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNotificacoes } from "@/modules/notificacoes/hooks/useNotificacoes";
import { useAuthStore } from "@/stores/authStore";

import { navigationItems } from "./navigation";

type TopbarProps = {
  onOpenMobileSidebar: () => void;
};

function useBreadcrumb() {
  const location = useLocation();
  const current = navigationItems.find(
    (item) => item.path === location.pathname,
  );

  return {
    section: "NAGY EVENTOS",
    current: current?.label ?? "Dashboard",
  };
}

export function Topbar({ onOpenMobileSidebar }: TopbarProps) {
  const [commandOpen, setCommandOpen] = useState(false);
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const { items } = useNotificacoes();
  const unreadCount = items.filter((item) => !item.read).length;
  const breadcrumb = useBreadcrumb();
  const initials = (user?.name ?? "Usuario")
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen(true);
      }
    }

    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  return (
    <header className="sticky top-0 z-20 border-b border-border/80 bg-background/85 backdrop-blur-xl">
      <div className="flex min-h-16 min-w-0 items-center justify-between gap-3 px-4 py-3 lg:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onOpenMobileSidebar}
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5" aria-hidden />
          </Button>
          <Link to="/dashboard" className="lg:hidden">
            <AppLogo compact />
          </Link>
          <div className="hidden min-w-0 items-center gap-2 rounded-lg border border-border/70 bg-muted/25 px-3 py-2 text-sm text-muted-foreground lg:flex">
            <span className="truncate font-semibold">{breadcrumb.section}</span>
            <ChevronRight className="h-4 w-4 shrink-0" aria-hidden />
            <span className="truncate font-semibold text-foreground">
              {breadcrumb.current}
            </span>
          </div>
        </div>

        <button
          type="button"
          className="hidden h-10 min-w-0 max-w-xl flex-1 items-center gap-3 rounded-md border border-border bg-muted/35 px-3 text-left text-sm text-muted-foreground transition hover:border-primary/40 hover:bg-muted/55 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:flex"
          onClick={() => setCommandOpen(true)}
          aria-label="Abrir pesquisa global"
        >
          <Search className="h-4 w-4 shrink-0 text-primary" aria-hidden />
          <span className="truncate">
            Pesquisar clientes, agenda, equipamentos...
          </span>
        </button>

        <div className="flex min-w-0 items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="hidden h-10 gap-2 md:flex"
              >
                <Plus className="h-4 w-4" aria-hidden />
                Acoes
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Acoes rapidas</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => navigate("/agendamentos")}>
                <CalendarPlus className="h-4 w-4 text-primary" aria-hidden />
                Novo aluguel
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => navigate("/clientes")}>
                <UserPlus className="h-4 w-4 text-primary" aria-hidden />
                Novo cliente
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => navigate("/equipamentos")}>
                <PackagePlus className="h-4 w-4 text-primary" aria-hidden />
                Novo equipamento
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setCommandOpen(true)}
            aria-label="Abrir pesquisa global"
          >
            <Search className="h-5 w-5" aria-hidden />
          </Button>
          <Button asChild variant="ghost" size="icon" title="Notificacoes">
            <Link to="/notificacoes" className="relative">
              <Bell className="h-5 w-5" aria-hidden />
              {unreadCount ? (
                <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-secondary px-1 text-[10px] font-bold text-secondary-foreground">
                  {unreadCount}
                </span>
              ) : null}
            </Link>
          </Button>
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="hidden h-10 w-10 gap-2 px-0 md:flex 2xl:w-auto 2xl:px-2"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
                  {initials}
                </span>
                <span className="hidden max-w-36 truncate text-sm 2xl:block">
                  {user?.name ?? "Usuario NAGY"}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <span className="block text-foreground">
                  {user?.name ?? "Usuario NAGY"}
                </span>
                <span className="block truncate font-normal">
                  {user?.email ?? "admin@nagyeventos.com.br"}
                </span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => navigate("/usuarios")}>
                <UserCircle className="h-4 w-4" aria-hidden />
                Perfil e usuarios
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => navigate("/configuracoes")}>
                <Settings className="h-4 w-4" aria-hidden />
                Configuracoes
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => void logout()}>
                <LogOut className="h-4 w-4" aria-hidden />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
      <div className="border-t border-border/80 px-4 py-2 lg:hidden">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{breadcrumb.section}</span>
          <ChevronRight className="h-3.5 w-3.5" aria-hidden />
          <span className="font-semibold text-foreground">
            {breadcrumb.current}
          </span>
        </div>
      </div>
    </header>
  );
}
