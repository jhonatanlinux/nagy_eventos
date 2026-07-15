import type { AuditLog } from "@/types/domain";
import { createId } from "@/utils/ids";

import { updateDatabase } from "../storage/localRepository";

type AuditInput = Omit<AuditLog, "id" | "createdAt" | "updatedAt">;

export const AuditService = {
  record(input: AuditInput) {
    const now = new Date().toISOString();
    const log: AuditLog = {
      ...input,
      id: createId("audit"),
      createdAt: now,
      updatedAt: now,
    };

    updateDatabase((database) => ({
      ...database,
      auditLogs: [log, ...database.auditLogs].slice(0, 250),
    }));

    return log;
  },
};
