import { QueryClientProvider } from "@tanstack/react-query";
import { useEffect, type PropsWithChildren } from "react";
import { BrowserRouter } from "react-router-dom";

import { queryClient } from "@/app/query/queryClient";
import { AuthService } from "@/services/auth/AuthService";
import { useAuthStore } from "@/stores/authStore";
import { useThemeStore } from "@/stores/themeStore";

export function AppProviders({ children }: PropsWithChildren) {
  const theme = useThemeStore((state) => state.theme);
  const initializeAuth = useAuthStore((state) => state.initialize);
  const syncUser = useAuthStore((state) => state.syncUser);

  useEffect(() => {
    void initializeAuth();
    return AuthService.onAuthStateChange(syncUser);
  }, [initializeAuth, syncUser]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");

    return () => document.documentElement.classList.remove("dark");
  }, [theme]);

  return (
    <QueryClientProvider client={queryClient}>
      <div className={theme === "dark" ? "dark" : undefined}>
        <BrowserRouter>{children}</BrowserRouter>
      </div>
    </QueryClientProvider>
  );
}
