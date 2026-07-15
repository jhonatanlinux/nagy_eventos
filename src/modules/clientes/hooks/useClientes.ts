import { useCrudResource } from "@/hooks/useCrudResource";

import { ClienteService, type ClientInput } from "../services/ClienteService";

export function useClientes() {
  return useCrudResource("clients", ClienteService);
}

export type { ClientInput };
