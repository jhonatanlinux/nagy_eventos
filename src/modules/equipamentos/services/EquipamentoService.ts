import { AuditService } from "@/services/audit/AuditService";
import { localRepository } from "@/services/storage/localRepository";
import type { Equipment } from "@/types/domain";

export type EquipmentInput = Omit<Equipment, "id" | "createdAt" | "updatedAt">;

export const EquipamentoService = {
  list() {
    return localRepository.list("equipment");
  },

  async create(input: EquipmentInput) {
    const equipment = await localRepository.create(
      "equipment",
      input,
      "equipment",
    );
    AuditService.record({
      action: "create",
      module: "Equipamentos",
      entityId: equipment.id,
      userName: "Sistema",
      description: `Equipamento ${equipment.name} criado.`,
    });
    return equipment;
  },

  async update(id: string, input: Partial<EquipmentInput>) {
    const equipment = await localRepository.update("equipment", id, input);
    AuditService.record({
      action: "update",
      module: "Equipamentos",
      entityId: id,
      userName: "Sistema",
      description: `Equipamento ${equipment?.name ?? id} atualizado.`,
    });
    return equipment;
  },

  async remove(id: string) {
    await localRepository.remove("equipment", id);
    AuditService.record({
      action: "delete",
      module: "Equipamentos",
      entityId: id,
      userName: "Sistema",
      description: `Equipamento ${id} removido.`,
    });
  },
};
