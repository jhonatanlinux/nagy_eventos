import {
  Bell,
  CalendarDays,
  Gauge,
  Package,
  Receipt,
  Settings,
  Shield,
  UserCog,
  Users,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type NavigationItem = {
  label: string;
  path: string;
  icon: LucideIcon;
};

export type NavigationSection = {
  label: string;
  items: NavigationItem[];
};

export const navigationSections: NavigationSection[] = [
  {
    label: "Operacao",
    items: [
      { label: "Dashboard", path: "/dashboard", icon: Gauge },
      { label: "Agendamentos", path: "/agendamentos", icon: CalendarDays },
      { label: "Clientes", path: "/clientes", icon: Users },
      { label: "Equipamentos", path: "/equipamentos", icon: Package },
    ],
  },
  {
    label: "Financeiro",
    items: [
      { label: "Financeiro", path: "/financeiro", icon: Wallet },
      { label: "Despesas", path: "/despesas", icon: Receipt },
    ],
  },
  {
    label: "Gestao",
    items: [
      { label: "Usuarios", path: "/usuarios", icon: UserCog },
      { label: "Permissoes", path: "/permissoes", icon: Shield },
      { label: "Notificacoes", path: "/notificacoes", icon: Bell },
      { label: "Configuracoes", path: "/configuracoes", icon: Settings },
    ],
  },
];

export const navigationItems = navigationSections.flatMap(
  (section) => section.items,
);

export const mobileNavigationItems = [
  navigationItems[0],
  navigationItems[1],
  navigationItems[2],
  navigationItems[3],
  navigationItems[4],
];
