import { motion } from "framer-motion";
import {
  ChevronDown,
  ChevronsUpDown,
  ChevronUp,
  Columns3,
  Inbox,
} from "lucide-react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";

import { EmptyState } from "@/components/common/EmptyState";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type DataColumn<T> = {
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
  sortValue?: (row: T) => string | number;
  enableHiding?: boolean;
};

type DataTableProps<T> = {
  rows: T[];
  columns: DataColumn<T>[];
  getRowId: (row: T) => string;
  actions?: (row: T) => ReactNode;
  emptyLabel: string;
  emptyDescription?: string;
  pageSize?: number;
};

export function DataTable<T>({
  rows,
  columns,
  getRowId,
  actions,
  emptyLabel,
  emptyDescription = "Ajuste filtros ou cadastre novos registros para iniciar o fluxo.",
  pageSize = 8,
}: DataTableProps<T>) {
  const [sortHeader, setSortHeader] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [tablePageSize, setTablePageSize] = useState(pageSize);
  const [visibleHeaders, setVisibleHeaders] = useState(() =>
    Object.fromEntries(columns.map((column) => [column.header, true])),
  );

  const visibleColumns = columns.filter(
    (column) => visibleHeaders[column.header] !== false,
  );
  const sortedRows = useMemo(() => {
    if (!sortHeader) {
      return rows;
    }

    const column = columns.find((item) => item.header === sortHeader);

    if (!column) {
      return rows;
    }

    return [...rows].sort((a, b) => {
      const aValue = column.sortValue?.(a) ?? column.cell(a);
      const bValue = column.sortValue?.(b) ?? column.cell(b);
      const aComparable = typeof aValue === "number" ? aValue : String(aValue);
      const bComparable = typeof bValue === "number" ? bValue : String(bValue);
      const result =
        typeof aComparable === "number" && typeof bComparable === "number"
          ? aComparable - bComparable
          : String(aComparable).localeCompare(String(bComparable), "pt-BR");

      return sortDirection === "asc" ? result : -result;
    });
  }, [columns, rows, sortDirection, sortHeader]);

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / tablePageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedRows = sortedRows.slice(
    (currentPage - 1) * tablePageSize,
    currentPage * tablePageSize,
  );

  function toggleSort(header: string) {
    if (sortHeader !== header) {
      setSortHeader(header);
      setSortDirection("asc");
      return;
    }

    setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
  }

  function SortIcon({ header }: { header: string }) {
    if (sortHeader !== header) {
      return <ChevronsUpDown className="h-3.5 w-3.5" aria-hidden />;
    }

    return sortDirection === "asc" ? (
      <ChevronUp className="h-3.5 w-3.5" aria-hidden />
    ) : (
      <ChevronDown className="h-3.5 w-3.5" aria-hidden />
    );
  }

  if (rows.length === 0) {
    return (
      <EmptyState
        icon={Inbox}
        title={emptyLabel}
        description={emptyDescription}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase text-muted-foreground">
            Registros
          </p>
          <p className="text-sm font-semibold text-foreground">
            {rows.length} registro{rows.length === 1 ? "" : "s"} encontrado
            {rows.length === 1 ? "" : "s"}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="outline" size="sm">
              <Columns3 className="h-4 w-4" aria-hidden />
              Colunas
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Exibir colunas</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {columns.map((column) => (
              <DropdownMenuCheckboxItem
                key={column.header}
                checked={visibleHeaders[column.header] !== false}
                disabled={column.enableHiding === false}
                onCheckedChange={(checked) =>
                  setVisibleHeaders((current) => ({
                    ...current,
                    [column.header]: Boolean(checked),
                  }))
                }
              >
                {column.header}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Card className="hidden overflow-hidden lg:block">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/45 text-xs font-bold uppercase text-muted-foreground">
              <tr>
                {visibleColumns.map((column) => (
                  <th
                    key={column.header}
                    className={cn("px-5 py-4", column.className)}
                  >
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      onClick={() => toggleSort(column.header)}
                    >
                      {column.header}
                      <SortIcon header={column.header} />
                    </button>
                  </th>
                ))}
                {actions ? (
                  <th className="px-4 py-3 text-right">Acoes</th>
                ) : null}
              </tr>
            </thead>
            <tbody>
              {paginatedRows.map((row, index) => (
                <tr
                  key={getRowId(row)}
                  className="border-b border-border/70 transition hover:bg-primary/[0.045] last:border-b-0"
                  style={{ animationDelay: `${index * 24}ms` }}
                >
                  {visibleColumns.map((column) => (
                    <td
                      key={column.header}
                      className={cn("px-5 py-4", column.className)}
                    >
                      {column.cell(row)}
                    </td>
                  ))}
                  {actions ? (
                    <td className="px-5 py-4 text-right">{actions(row)}</td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid gap-3 lg:hidden">
        {paginatedRows.map((row, index) => (
          <motion.div
            key={getRowId(row)}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: index * 0.03 }}
          >
            <Card className="p-4">
              <div className="space-y-3">
                {visibleColumns.map((column) => (
                  <div
                    key={column.header}
                    className="flex items-start justify-between gap-4"
                  >
                    <span className="text-xs font-bold uppercase text-muted-foreground">
                      {column.header}
                    </span>
                    <div className="min-w-0 text-right text-sm">
                      {column.cell(row)}
                    </div>
                  </div>
                ))}
                {actions ? (
                  <div className="flex justify-end pt-2">{actions(row)}</div>
                ) : null}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="flex flex-col gap-3 rounded-lg border border-border/70 bg-muted/25 p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Linhas</span>
          <Select
            className="h-9 w-20"
            value={String(tablePageSize)}
            onChange={(event) => {
              setTablePageSize(Number(event.target.value));
              setPage(1);
            }}
          >
            {[5, 8, 12, 20].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex items-center justify-end gap-2">
          <span className="text-sm text-muted-foreground">
            Pagina {currentPage} de {totalPages}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setPage((value) => Math.max(1, value - 1))}
          >
            Anterior
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
          >
            Proxima
          </Button>
        </div>
      </div>
    </div>
  );
}
