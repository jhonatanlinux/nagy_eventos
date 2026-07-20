import type { PropsWithChildren } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { PageLoader } from "@/components/common/PageLoader";
import { useAuthStore } from "@/stores/authStore";

export function AuthGuard({ children }: PropsWithChildren) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const location = useLocation();

  if (!isInitialized) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
