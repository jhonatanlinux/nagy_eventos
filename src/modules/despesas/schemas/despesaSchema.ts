import { z } from "zod";

export const expenseStatuses = ["Pendente", "Pago", "Vencido"] as const;

export const despesaSchema = z.object({
  category: z.string().min(2, "Informe a categoria."),
  supplier: z.string().min(2, "Informe o fornecedor."),
  description: z.string().min(3, "Informe a descricao."),
  value: z.coerce.number().min(0, "Valor invalido."),
  paymentMethod: z.string().min(2, "Informe a forma de pagamento."),
  dueDate: z.string().min(1, "Informe o vencimento."),
  paymentDate: z.string().optional().default(""),
  status: z.enum(expenseStatuses),
  notes: z.string().optional().default(""),
});
