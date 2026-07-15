import {
  ArrowRight,
  Bell,
  CalendarDays,
  Gauge,
  Package,
  Receipt,
  Search,
  Settings,
  Shield,
  UserCog,
  Users,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  GlobalSearchService,
  type GlobalSearchResult,
  type GlobalSearchResultType,
} from "@/services/search/GlobalSearchService";

type CommandPaletteProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const moduleIcons: Record<string, LucideIcon> = {
  "/dashboard": Gauge,
  "/clientes": Users,
  "/equipamentos": Package,
  "/agendamentos": CalendarDays,
  "/financeiro": Wallet,
  "/despesas": Receipt,
  "/usuarios": UserCog,
  "/permissoes": Shield,
  "/notificacoes": Bell,
  "/configuracoes": Settings,
};

const typeLabels: Record<GlobalSearchResultType, string> = {
  module: "Modulo",
  client: "Cliente",
  equipment: "Equipamento",
  rental: "Agenda",
  expense: "Despesa",
  user: "Usuario",
  notification: "Alerta",
};

function getResultIcon(result: GlobalSearchResult) {
  return moduleIcons[result.path] ?? Search;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const hasQuery = query.trim().length > 0;
  const results = useMemo(
    () =>
      hasQuery
        ? GlobalSearchService.search(query, 10)
        : GlobalSearchService.quickAccess(),
    [hasQuery, query],
  );

  useEffect(() => {
    if (open) {
      window.setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  function handleOpenChange(nextOpen: boolean) {
    onOpenChange(nextOpen);

    if (!nextOpen) {
      setQuery("");
    }
  }

  function openResult(result: GlobalSearchResult) {
    navigate(result.path);
    handleOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-w-2xl overflow-hidden p-0"
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Pesquisa global</DialogTitle>
          <DialogDescription>
            Pesquisar modulos e registros da plataforma.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-3 border-b border-border bg-muted/20 px-5 py-4 pr-12">
          <Search className="h-5 w-5 shrink-0 text-primary" aria-hidden />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && results[0]) {
                event.preventDefault();
                openResult(results[0]);
              }
            }}
            className="h-10 min-w-0 flex-1 bg-transparent text-base font-semibold text-foreground outline-none placeholder:text-muted-foreground"
            placeholder="Pesquisar clientes, agenda, equipamentos..."
            aria-label="Pesquisa global"
          />
        </div>

        <div className="max-h-[58svh] overflow-y-auto p-2">
          {results.length ? (
            <>
              <div className="px-3 pb-2 pt-1 text-xs font-bold uppercase text-muted-foreground">
                {hasQuery ? "Resultados" : "Acesso rapido"}
              </div>
              <div className="space-y-1">
                {results.map((result) => {
                  const Icon = getResultIcon(result);

                  return (
                    <button
                      key={result.id}
                      type="button"
                      className={cn(
                        "group flex w-full items-center gap-3 rounded-md px-3 py-3 text-left transition",
                        "hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      )}
                      onClick={() => openResult(result)}
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                        <Icon className="h-5 w-5" aria-hidden />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-semibold text-foreground">
                          {result.title}
                        </span>
                        <span className="block truncate text-sm text-muted-foreground">
                          {result.subtitle}
                        </span>
                      </span>
                      <span className="hidden rounded-md border border-border px-2 py-1 text-xs font-semibold text-muted-foreground sm:inline-flex">
                        {typeLabels[result.type]}
                      </span>
                      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition group-hover:opacity-100" />
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="grid min-h-48 place-items-center px-6 py-10 text-center">
              <div className="space-y-2">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-md bg-muted text-muted-foreground">
                  <Search className="h-5 w-5" aria-hidden />
                </div>
                <p className="font-semibold text-foreground">
                  Nenhum resultado encontrado
                </p>
                <p className="text-sm text-muted-foreground">
                  Confira o termo digitado ou pesquise por outro cadastro.
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
