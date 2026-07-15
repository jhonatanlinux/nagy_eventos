import { z } from "zod";

export const equipmentStatuses = [
  "Disponivel",
  "Reservado",
  "Em aluguel",
  "Manutencao",
  "Inativo",
] as const;

export const equipamentoSchema = z.object({
  category: z.string().min(2, "Informe a categoria."),
  name: z.string().min(2, "Informe o nome."),
  brand: z.string().min(2, "Informe a marca."),
  model: z.string().min(1, "Informe o modelo."),
  patrimony: z.string().min(1, "Informe o patrimonio."),
  internalCode: z.string().min(1, "Informe o codigo interno."),
  quantity: z.coerce.number().min(0, "Quantidade invalida."),
  dailyRate: z.coerce.number().min(0, "Valor invalido."),
  weekendRate: z.coerce.number().min(0, "Valor invalido."),
  weeklyRate: z.coerce.number().min(0, "Valor invalido."),
  status: z.enum(equipmentStatuses),
  notes: z.string().optional().default(""),
});
