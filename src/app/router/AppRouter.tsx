import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { AuthGuard } from "@/app/auth/AuthGuard";
import { PageLoader } from "@/components/common/PageLoader";
import { AppLayout } from "@/layouts/app-layout/AppLayout";
import { LoginPage } from "@/modules/auth/pages/LoginPage";

const DashboardPage = lazy(() =>
  import("@/modules/dashboard/pages/DashboardPage").then((module) => ({
    default: module.DashboardPage,
  })),
);
const ClientesPage = lazy(() =>
  import("@/modules/clientes/pages/ClientesPage").then((module) => ({
    default: module.ClientesPage,
  })),
);
const EquipamentosPage = lazy(() =>
  import("@/modules/equipamentos/pages/EquipamentosPage").then((module) => ({
    default: module.EquipamentosPage,
  })),
);
const AgendamentosPage = lazy(() =>
  import("@/modules/agendamentos/pages/AgendamentosPage").then((module) => ({
    default: module.AgendamentosPage,
  })),
);
const FinanceiroPage = lazy(() =>
  import("@/modules/financeiro/pages/FinanceiroPage").then((module) => ({
    default: module.FinanceiroPage,
  })),
);
const DespesasPage = lazy(() =>
  import("@/modules/despesas/pages/DespesasPage").then((module) => ({
    default: module.DespesasPage,
  })),
);
const UsuariosPage = lazy(() =>
  import("@/modules/usuarios/pages/UsuariosPage").then((module) => ({
    default: module.UsuariosPage,
  })),
);
const PermissoesPage = lazy(() =>
  import("@/modules/permissoes/pages/PermissoesPage").then((module) => ({
    default: module.PermissoesPage,
  })),
);
const NotificacoesPage = lazy(() =>
  import("@/modules/notificacoes/pages/NotificacoesPage").then((module) => ({
    default: module.NotificacoesPage,
  })),
);
const ConfiguracoesPage = lazy(() =>
  import("@/modules/configuracoes/pages/ConfiguracoesPage").then((module) => ({
    default: module.ConfiguracoesPage,
  })),
);

export function AppRouter() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          element={
            <AuthGuard>
              <AppLayout />
            </AuthGuard>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/clientes" element={<ClientesPage />} />
          <Route path="/equipamentos" element={<EquipamentosPage />} />
          <Route path="/agendamentos" element={<AgendamentosPage />} />
          <Route path="/financeiro" element={<FinanceiroPage />} />
          <Route path="/despesas" element={<DespesasPage />} />
          <Route path="/usuarios" element={<UsuariosPage />} />
          <Route path="/permissoes" element={<PermissoesPage />} />
          <Route path="/notificacoes" element={<NotificacoesPage />} />
          <Route path="/configuracoes" element={<ConfiguracoesPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
}
