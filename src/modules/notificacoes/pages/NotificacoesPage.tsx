import { Bell, CheckCheck } from "lucide-react";

import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDateTime } from "@/utils/format";

import { useNotificacoes } from "../hooks/useNotificacoes";

export function NotificacoesPage() {
  const { items, markAsRead } = useNotificacoes();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notificacoes"
        description="Alertas internos desacoplados, prontos para integracoes externas futuras."
      />

      <div className="grid gap-3">
        {items.map((notification) => (
          <Card
            key={notification.id}
            className={notification.read ? "opacity-70" : undefined}
          >
            <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 gap-3">
                <div className="rounded-md bg-primary/10 p-2 text-primary">
                  <Bell className="h-5 w-5" aria-hidden />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold">{notification.title}</h2>
                    <StatusBadge status={notification.level} />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {notification.description}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Gerado em {formatDateTime(notification.createdAt)}
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={notification.read}
                onClick={() => markAsRead(notification.id)}
              >
                <CheckCheck className="h-4 w-4" aria-hidden />
                {notification.read ? "Lida" : "Marcar lida"}
              </Button>
            </CardContent>
          </Card>
        ))}
        {items.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="Nenhuma notificacao ativa"
            description="Alertas de aluguel, devolucao e despesas aparecerao aqui."
          />
        ) : null}
      </div>
    </div>
  );
}
