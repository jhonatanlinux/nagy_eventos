import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Informe um e-mail valido."),
  password: z.string().min(1, "Informe a senha."),
  remember: z.boolean(),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
