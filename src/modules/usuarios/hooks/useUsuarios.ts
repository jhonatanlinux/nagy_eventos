import { useCrudResource } from "@/hooks/useCrudResource";

import { UsuarioService, type UserInput } from "../services/UsuarioService";

export function useUsuarios() {
  return useCrudResource("users", UsuarioService);
}

export type { UserInput };
