import { Download, FileSpreadsheet, Wallet } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { DataTable, type DataColumn } from "@/components/common/DataTable";
import { MetricCard } from "@/components/common/MetricCard";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExportService } from "@/services/export/ExportService";
import { formatCurrency, formatDate } from "@/utils/format";

import { useFinanceiro } from "../hooks/useFinanceiro";
import type { CashFlowRow } from "../services/FinanceiroService";

const columns: DataColumn<CashFlowRow>[] = [
  { header: "Tipo", cell: (row) => <StatusBadge status={row.type} /> },
  { header: "Descricao", cell: (row) => <strong>{row.description}</strong> },
  { header: "Data", cell: (row) => formatDate(row.date) },
  { header: "Valor", cell: (row) => formatCurrency(row.value) },
  { header: "Status", cell: (row) => <StatusBadge status={row.status} /> },
];

export function FinanceiroPage() {
  const { data } = useFinanceiro();
  const summary = data ?? {
    revenue: 0,
    expenses: 0,
    profit: 0,
    rows: [],
    chart: [],
  };
  const exportRows = summary.rows.map((row) => ({
    tipo: row.type,
    descricao: row.description,
    data: row.date,
    valor: row.value,
    status: row.status,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Financeiro"
        description="Receitas, despesas, fluxo de caixa, graficos e exportacoes."
        actions={
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                void ExportService.toExcel(exportRows, "fluxo-caixa-nagy")
              }
            >
              <FileSpreadsheet className="h-4 w-4" aria-hidden />
              Excel
            </Button>
            <Button
              type="button"
              onClick={() =>
                void ExportService.toPdf(
                  exportRows,
                  "fluxo-caixa-nagy",
                  "Fluxo de caixa",
                )
              }
            >
              <Download className="h-4 w-4" aria-hidden />
              PDF
            </Button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          title="Receitas"
          value={formatCurrency(summary.revenue)}
          helper="Entradas do mes"
          icon={Wallet}
          tone="green"
        />
        <MetricCard
          title="Despesas"
          value={formatCurrency(summary.expenses)}
          helper="Saidas do mes"
          icon={Wallet}
          tone="red"
        />
        <MetricCard
          title="Resultado"
          value={formatCurrency(summary.profit)}
          helper="Lucro estimado"
          icon={Wallet}
          tone="orange"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resumo financeiro</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary.chart}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  formatter={(value) => formatCurrency(Number(value))}
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                  }}
                />
                <Bar dataKey="valor" fill="#ff5a1f" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <DataTable
        rows={summary.rows}
        columns={columns}
        getRowId={(row) => `${row.type}-${row.id}`}
        emptyLabel="Nenhum lancamento financeiro encontrado."
      />
    </div>
  );
}
