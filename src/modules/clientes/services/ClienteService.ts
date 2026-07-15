import { AuditService } from "@/services/audit/AuditService";
import { localRepository } from "@/services/storage/localRepository";
import type { Client } from "@/types/domain";

export type ClientInput = Omit<Client, "id" | "createdAt" | "updatedAt">;

export const ClienteService = {
  list() {
    return localRepository.list("clients");
  },

  async create(input: ClientInput) {
    const client = await localRepository.create("clients", input, "client");
    AuditService.record({
      action: "create",
      module: "Clientes",
      entityId: client.id,
      userName: "Sistema",
      description: `Cliente ${client.name} criado.`,
    });
    return client;
  },

  async update(id: string, input: Partial<ClientInput>) {
    const client = await localRepository.update("clients", id, input);
    AuditService.record({
      action: "update",
      module: "Clientes",
      entityId: id,
      userName: "Sistema",
      description: `Cliente ${client?.name ?? id} atualizado.`,
    });
    return client;
  },

  async remove(id: string) {
    await localRepository.remove("clients", id);
    AuditService.record({
      action: "delete",
      module: "Clientes",
      entityId: id,
      userName: "Sistema",
      description: `Cliente ${id} removido.`,
    });
  },
};
