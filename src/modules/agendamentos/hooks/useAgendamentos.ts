import { useCrudResource } from "@/hooks/useCrudResource";

import {
  AgendamentoService,
  type RentalInput,
} from "../services/AgendamentoService";

export function useAgendamentos() {
  return useCrudResource("rentals", AgendamentoService);
}

export type { RentalInput };
