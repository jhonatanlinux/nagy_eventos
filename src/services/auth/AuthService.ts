import { isSupabaseConfigured, supabase } from "@/lib/supabase/client";

import { AuditService } from "../audit/AuditService";

type LoginInput = {
  email: string;
  password: string;
  remember: boolean;
};

export const AuthService = {
  async login({ email, password }: LoginInput) {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new Error(error.message);
      }
    }

    if (!email || !password) {
      throw new Error("Informe e-mail e senha.");
    }

    AuditService.record({
      action: "login",
      module: "Autenticacao",
      userName: email,
      description: "Login realizado.",
    });

    return {
      name: email.split("@")[0] || "Usuario NAGY",
      email,
    };
  },

  async logout(email: string) {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }

    AuditService.record({
      action: "logout",
      module: "Autenticacao",
      userName: email,
      description: "Logout realizado.",
    });
  },

  async requestPasswordReset(email: string) {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.resetPasswordForEmail(email);

      if (error) {
        throw new Error(error.message);
      }
    }

    return true;
  },
};
