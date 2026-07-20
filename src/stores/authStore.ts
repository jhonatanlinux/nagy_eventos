import { create } from "zustand";

import { AuthService, type AuthUser } from "@/services/auth/AuthService";

type AuthState = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  initialize: () => Promise<void>;
  syncUser: (user: AuthUser | null) => void;
  login: (email: string, password: string, remember: boolean) => Promise<void>;
  logout: () => Promise<void>;
};

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  isAuthenticated: false,
  isInitialized: false,
  initialize: async () => {
    const user = await AuthService.getCurrentUser();
    set({ user, isAuthenticated: Boolean(user), isInitialized: true });
  },
  syncUser: (user) => {
    set({ user, isAuthenticated: Boolean(user), isInitialized: true });
  },
  login: async (email, password, remember) => {
    const user = await AuthService.login({ email, password, remember });
    set({ user, isAuthenticated: true, isInitialized: true });
  },
  logout: async () => {
    const email = get().user?.email ?? "usuario";
    await AuthService.logout(email);
    set({ user: null, isAuthenticated: false, isInitialized: true });
  },
}));
