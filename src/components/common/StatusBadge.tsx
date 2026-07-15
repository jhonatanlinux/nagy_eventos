import { Badge } from "@/components/ui/badge";
import type {
  AppNotification,
  EquipmentStatus,
  ExpenseStatus,
  RentalStatus,
} from "@/types/domain";

type KnownStatus =
  | RentalStatus
  | EquipmentStatus
  | ExpenseStatus
  | AppNotification["level"]
  | string;

function resolveVariant(status: KnownStatus) {
  const dangerStatuses = [
    "Cancelado",
    "Vencido",
    "danger",
    "Inativo",
    "Manutencao",
  ];
  const warningStatuses = [
    "Agendado",
    "Separacao",
    "Reservado",
    "Pendente",
    "warning",
    "Despesa",
    "update",
  ];
  const successStatuses = [
    "Disponivel",
    "Finalizado",
    "Pago",
    "Retornado",
    "info",
    "active",
    "Receita",
    "login",
    "create",
  ];

  if (dangerStatuses.includes(status)) {
    return "danger";
  }

  if (warningStatuses.includes(status)) {
    return "warning";
  }

  if (successStatuses.includes(status)) {
    return "success";
  }

  return "default";
}

export function StatusBadge({ status }: { status: KnownStatus }) {
  return <Badge variant={resolveVariant(status)}>{status}</Badge>;
}
