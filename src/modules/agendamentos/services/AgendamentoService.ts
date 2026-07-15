import { AuditService } from "@/services/audit/AuditService";
import { localRepository } from "@/services/storage/localRepository";
import type { Rental } from "@/types/domain";

export type RentalInput = Omit<Rental, "id" | "createdAt" | "updatedAt">;

export const AgendamentoService = {
  list() {
    return localRepository.list("rentals");
  },

  async create(input: RentalInput) {
    const rental = await localRepository.create("rentals", input, "rental");
    AuditService.record({
      action: "create",
      module: "Agendamentos",
      entityId: rental.id,
      userName: "Sistema",
      description: `Aluguel ${rental.clientName} criado.`,
    });
    return rental;
  },

  async update(id: string, input: Partial<RentalInput>) {
    const rental = await localRepository.update("rentals", id, input);
    AuditService.record({
      action: "update",
      module: "Agendamentos",
      entityId: id,
      userName: "Sistema",
      description: `Aluguel ${rental?.clientName ?? id} atualizado.`,
    });
    return rental;
  },

  async remove(id: string) {
    await localRepository.remove("rentals", id);
    AuditService.record({
      action: "delete",
      module: "Agendamentos",
      entityId: id,
      userName: "Sistema",
      description: `Aluguel ${id} removido.`,
    });
  },
};
