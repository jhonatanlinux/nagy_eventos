import type { RoleName } from "@/types/domain";

export type PermissionKey =
  | "dashboard.read"
  | "clients.manage"
  | "equipment.manage"
  | "rentals.manage"
  | "finance.read"
  | "finance.manage"
  | "expenses.manage"
  | "users.manage"
  | "permissions.manage"
  | "settings.manage";

export const permissions: {
  key: PermissionKey;
  label: string;
  module: string;
}[] = [
  { key: "dashboard.read", label: "Visualizar dashboard", module: "Dashboard" },
  { key: "clients.manage", label: "Gerenciar clientes", module: "Clientes" },
  {
    key: "equipment.manage",
    label: "Gerenciar equipamentos",
    module: "Equipamentos",
  },
  {
    key: "rentals.manage",
    label: "Gerenciar agendamentos",
    module: "Agendamentos",
  },
  { key: "finance.read", label: "Visualizar financeiro", module: "Financeiro" },
  {
    key: "finance.manage",
    label: "Gerenciar financeiro",
    module: "Financeiro",
  },
  { key: "expenses.manage", label: "Gerenciar despesas", module: "Despesas" },
  { key: "users.manage", label: "Gerenciar usuarios", module: "Usuarios" },
  {
    key: "permissions.manage",
    label: "Gerenciar permissoes",
    module: "Permissoes",
  },
  {
    key: "settings.manage",
    label: "Gerenciar configuracoes",
    module: "Configuracoes",
  },
];

export const rolePermissions: Record<RoleName, PermissionKey[]> = {
  Administrador: permissions.map((permission) => permission.key),
  Gerente: [
    "dashboard.read",
    "clients.manage",
    "equipment.manage",
    "rentals.manage",
    "finance.read",
    "finance.manage",
    "expenses.manage",
    "users.manage",
  ],
  Financeiro: [
    "dashboard.read",
    "finance.read",
    "finance.manage",
    "expenses.manage",
    "clients.manage",
  ],
  Operacional: [
    "dashboard.read",
    "equipment.manage",
    "rentals.manage",
    "clients.manage",
  ],
  Estoque: ["dashboard.read", "equipment.manage", "rentals.manage"],
  Vendedor: ["dashboard.read", "clients.manage", "rentals.manage"],
};
