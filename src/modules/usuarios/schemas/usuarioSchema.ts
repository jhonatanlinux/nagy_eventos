import { z } from "zod";

export const roleNames = [
  "Administrador",
  "Gerente",
  "Financeiro",
  "Operacional",
  "Estoque",
  "Vendedor",
] as const;

export const usuarioSchema = z.object({
  name: z.string().min(2, "Informe o nome."),
  email: z.string().email("Informe um e-mail valido."),
  role: z.enum(roleNames),
  avatarUrl: z.string().optional().default(""),
  status: z.enum(["active", "inactive"]),
});
