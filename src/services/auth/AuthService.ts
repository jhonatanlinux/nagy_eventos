import type { User } from "@supabase/supabase-js";

import { isSupabaseConfigured, supabase } from "@/lib/supabase/client";

import { AuditService } from "../audit/AuditService";

type LoginInput = {
  email: string;
  password: string;
  remember: boolean;
};

export type AuthUser = {
  name: string;
  email: string;
};

function mapAuthUser(user: User): AuthUser {
  const email = user.email ?? "";

  return {
    name:
      typeof user.user_metadata.name === "string"
        ? user.user_metadata.name
        : email.split("@")[0] || "Usuario NAGY",
    email,
  };
}

function requireSupabase() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error("Autenticacao indisponivel. Verifique a configuracao.");
  }

  return supabase;
}

export const AuthService = {
  async login({ email, password }: LoginInput) {
    const client = requireSupabase();
    const { data, error } = await client.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user?.email) {
      throw new Error("Nao foi possivel validar o usuario autenticado.");
    }

    AuditService.record({
      action: "login",
      module: "Autenticacao",
      userName: email,
      description: "Login realizado.",
    });

    return mapAuthUser(data.user);
  },

  async getCurrentUser() {
    if (!isSupabaseConfigured || !supabase) {
      return null;
    }

    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user?.email) {
      return null;
    }

    return mapAuthUser(data.user);
  },

  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    if (!isSupabaseConfigured || !supabase) {
      return () => undefined;
    }

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user?.email ? mapAuthUser(session.user) : null);
    });

    return () => data.subscription.unsubscribe();
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
    const client = requireSupabase();
    const { error } = await client.auth.resetPasswordForEmail(email);

    if (error) {
      throw new Error(error.message);
    }

    return true;
  },
};
