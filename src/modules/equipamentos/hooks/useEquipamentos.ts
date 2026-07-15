import { useCrudResource } from "@/hooks/useCrudResource";

import {
  EquipamentoService,
  type EquipmentInput,
} from "../services/EquipamentoService";

export function useEquipamentos() {
  return useCrudResource("equipment", EquipamentoService);
}

export type { EquipmentInput };
