import { create } from "zustand";
import { persist } from "zustand/middleware";

import { AuthService } from "@/services/auth/AuthService";

type AuthUser = {
  name: string;
  email: string;
};

type AuthState = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, remember: boolean) => Promise<void>;
  logout: () => Promise<void>;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      login: async (email, password, remember) => {
        const user = await AuthService.login({ email, password, remember });
        set({ user, isAuthenticated: true });
      },
      logout: async () => {
        const email = get().user?.email ?? "usuario";
        await AuthService.logout(email);
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: "nagy-auth",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
