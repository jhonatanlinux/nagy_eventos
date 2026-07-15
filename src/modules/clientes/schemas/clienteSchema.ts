import { z } from "zod";

export const clienteSchema = z.object({
  name: z.string().min(2, "Informe o nome."),
  document: z.string().min(5, "Informe CPF ou CNPJ."),
  phone: z.string().min(8, "Informe o telefone."),
  whatsapp: z.string().min(8, "Informe o WhatsApp."),
  email: z.string().email("Informe um e-mail valido."),
  address: z.string().min(3, "Informe o endereco."),
  city: z.string().min(2, "Informe a cidade."),
  state: z.string().min(2, "Informe o estado."),
  notes: z.string().optional().default(""),
});
