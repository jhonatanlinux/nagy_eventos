import { z } from "zod";

export const rentalStatuses = [
  "Agendado",
  "Separacao",
  "Saiu para entrega",
  "Em uso",
  "Retornado",
  "Finalizado",
  "Cancelado",
] as const;

export const agendamentoSchema = z.object({
  clientName: z.string().min(2, "Informe o cliente."),
  equipmentName: z.string().min(2, "Informe o equipamento."),
  quantity: z.coerce.number().min(1, "Informe a quantidade."),
  pickupDate: z.string().min(1, "Informe a data de retirada."),
  pickupTime: z.string().min(1, "Informe a hora de retirada."),
  returnDate: z.string().min(1, "Informe a data de devolucao."),
  returnTime: z.string().min(1, "Informe a hora de devolucao."),
  value: z.coerce.number().min(0, "Valor invalido."),
  discount: z.coerce.number().min(0, "Desconto invalido."),
  freight: z.coerce.number().min(0, "Frete invalido."),
  assembly: z.coerce.number().min(0, "Montagem invalida."),
  status: z.enum(rentalStatuses),
  notes: z.string().optional().default(""),
});
