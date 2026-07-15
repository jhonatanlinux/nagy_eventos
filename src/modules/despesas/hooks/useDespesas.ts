import { useCrudResource } from "@/hooks/useCrudResource";

import { DespesaService, type ExpenseInput } from "../services/DespesaService";

export function useDespesas() {
  return useCrudResource("expenses", DespesaService);
}

export type { ExpenseInput };
