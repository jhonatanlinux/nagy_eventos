import { AuditService } from "@/services/audit/AuditService";
import { localRepository } from "@/services/storage/localRepository";
import type { UserProfile } from "@/types/domain";

export type UserInput = Omit<UserProfile, "id" | "createdAt" | "updatedAt">;

export const UsuarioService = {
  list() {
    return localRepository.list("users");
  },

  async create(input: UserInput) {
    const user = await localRepository.create("users", input, "user");
    AuditService.record({
      action: "create",
      module: "Usuarios",
      entityId: user.id,
      userName: "Sistema",
      description: `Usuario ${user.name} criado.`,
    });
    return user;
  },

  async update(id: string, input: Partial<UserInput>) {
    const user = await localRepository.update("users", id, input);
    AuditService.record({
      action: "update",
      module: "Usuarios",
      entityId: id,
      userName: "Sistema",
      description: `Usuario ${user?.name ?? id} atualizado.`,
    });
    return user;
  },

  async remove(id: string) {
    await localRepository.remove("users", id);
    AuditService.record({
      action: "delete",
      module: "Usuarios",
      entityId: id,
      userName: "Sistema",
      description: `Usuario ${id} removido.`,
    });
  },
};
