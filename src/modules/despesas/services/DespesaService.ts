import { AuditService } from "@/services/audit/AuditService";
import { localRepository } from "@/services/storage/localRepository";
import type { Expense } from "@/types/domain";

export type ExpenseInput = Omit<Expense, "id" | "createdAt" | "updatedAt">;

export const DespesaService = {
  list() {
    return localRepository.list("expenses");
  },

  async create(input: ExpenseInput) {
    const expense = await localRepository.create("expenses", input, "expense");
    AuditService.record({
      action: "create",
      module: "Despesas",
      entityId: expense.id,
      userName: "Sistema",
      description: `Despesa ${expense.description} criada.`,
    });
    return expense;
  },

  async update(id: string, input: Partial<ExpenseInput>) {
    const expense = await localRepository.update("expenses", id, input);
    AuditService.record({
      action: "update",
      module: "Despesas",
      entityId: id,
      userName: "Sistema",
      description: `Despesa ${expense?.description ?? id} atualizada.`,
    });
    return expense;
  },

  async remove(id: string) {
    await localRepository.remove("expenses", id);
    AuditService.record({
      action: "delete",
      module: "Despesas",
      entityId: id,
      userName: "Sistema",
      description: `Despesa ${id} removida.`,
    });
  },
};
