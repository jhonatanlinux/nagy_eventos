import { isSupabaseConfigured } from "@/lib/supabase/client";
import { readDatabase } from "@/services/storage/localRepository";

export const ConfiguracaoService = {
  async getSettings() {
    const database = readDatabase();

    return {
      supabaseConfigured: isSupabaseConfigured,
      storageMode: isSupabaseConfigured ? "Supabase" : "Local demo",
      pwaEnabled: true,
      auditLogs: database.auditLogs.slice(0, 50),
    };
  },
};
